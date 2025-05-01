import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId, errors as bson_errors
from fastapi import HTTPException, status
from pymongo import ReturnDocument

from pms.db.database import DatabaseConnection
from pms.models.direct_message import (
    Conversation, ConversationRead, ConversationCreate,
    Message, MessageCreate, MessageRead
)
from pms.models.user import UserBasicInfo
# Assuming user_mgr is initialized and accessible
from pms.services.user_services import user_mgr

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
MAX_PREVIEW_LENGTH = 50 # Max length for last_message_preview

class DirectMessageMgr:
    """
    Service layer class for managing Direct Message (DM) operations,
    including conversations and individual messages.
    """
    def __init__(self):
        self.db: Optional[DatabaseConnection] = None
        self.conversations_collection = None
        self.messages_collection = None
        # Ensure UserMgr is initialized before using it
        if not hasattr(user_mgr, 'users_collection') or user_mgr.users_collection is None:
            logger.warning("UserMgr might not be initialized when initializing DirectMessageMgr.")

    async def initialize(self):
        """Initializes database connection and collections."""
        try:
            self.db = DatabaseConnection()
            self.conversations_collection = await self.db.get_collection("conversations")
            self.messages_collection = await self.db.get_collection("messages")
            logger.info("DirectMessageMgr initialized successfully.")
            # Create indexes if they don't exist
            await self.conversations_collection.create_index([("participant_ids", 1)])
            await self.conversations_collection.create_index([("last_message_at", -1)])
            await self.messages_collection.create_index([("conversation_id", 1), ("created_at", 1)])
            await self.messages_collection.create_index([("sender_id", 1)])
            logger.info("DirectMessageMgr indexes ensured.")
        except Exception as e:
            logger.error(f"Failed to initialize DirectMessageMgr: {e}", exc_info=True)
            raise # Reraise exception to prevent app startup if DM service fails

    async def _get_user_basic_info(self, user_id: str) -> Optional[UserBasicInfo]:
        """Helper to fetch basic user details safely."""
        if not user_id:
            return None
        try:
            user_data = await user_mgr.users_collection.find_one(
                {"_id": ObjectId(user_id)},
                {"_id": 1, "user_name": 1, "role": 1} # Projection
            )
            if user_data:
                user_data['_id'] = str(user_data['_id'])
                return UserBasicInfo(**user_data)
            logger.warning(f"User basic info not found for ID: {user_id}")
            return None
        except bson_errors.InvalidId:
            logger.warning(f"Invalid ObjectId format for user_id: {user_id}")
            return None
        except Exception as e:
            logger.error(f"Error fetching user basic info for {user_id}: {e}", exc_info=True)
            return None

    async def _get_participants_info(self, participant_ids: List[str]) -> List[UserBasicInfo]:
        """Helper to fetch basic info for multiple participants."""
        participants_info = []
        for p_id in participant_ids:
            info = await self._get_user_basic_info(p_id)
            if info:
                participants_info.append(info)
        return participants_info

    async def _validate_conversation_participant(self, conversation_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Basic validation to ensure user is a participant."""
        try:
            conversation_doc = await self.conversations_collection.find_one(
                {"_id": ObjectId(conversation_id)}
            )
            if not conversation_doc:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                  detail="Conversation not found.")
            return conversation_doc
        except bson_errors.InvalidId:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                              detail="Invalid conversation ID format.")
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(f"Error validating conversation ({conversation_id}): {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                              detail="Server error validating conversation access.")

    async def find_or_create_conversation(self, user1_id: str, user2_id: str) -> ConversationRead:
        """
        Finds or creates a conversation between two users.
        Returns the ConversationRead object with populated participant info.
        """
        if not user1_id or not user2_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Both user IDs are required."
            )

        if user1_id == user2_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Cannot start a conversation with yourself."
            )

        # Canonical representation by sorting IDs
        participant_ids = sorted([user1_id, user2_id])

        try:
            # First validate both users exist
            user1_info = await self._get_user_basic_info(user1_id)
            user2_info = await self._get_user_basic_info(user2_id)
            
            if not user1_info or not user2_info:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail="One or both users not found."
                )

            # Try to find existing conversation
            existing_conv = await self.conversations_collection.find_one(
                {"participant_ids": participant_ids}
            )

            if existing_conv:
                existing_conv["_id"] = str(existing_conv["_id"])
                participants_info = [user1_info, user2_info]  # We already have the info
                return ConversationRead(**existing_conv, participants=participants_info)

            # Create new conversation
            new_conv_doc = {
                "participant_ids": participant_ids,
                "created_at": datetime.utcnow(),
                "last_message_at": None,
                "last_message_preview": None
            }

            result = await self.conversations_collection.insert_one(new_conv_doc)
            
            # Return the new conversation
            new_conv_doc["_id"] = str(result.inserted_id)
            participants_info = [user1_info, user2_info]  # We already have the info
            logger.info(f"Created new conversation between users {user1_id} and {user2_id}")
            return ConversationRead(**new_conv_doc, participants=participants_info)

        except bson_errors.InvalidId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Invalid user ID format provided."
            )
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(
                f"Error finding/creating conversation between {user1_id} and {user2_id}: {e}", 
                exc_info=True
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Server error handling conversation."
            )

    async def get_user_conversations(self, user_id: str, skip: int = 0, limit: int = 20) -> List[ConversationRead]:
        """Fetches conversations for a user with last message data."""
        try:
            conversations_cursor = self.conversations_collection.find(
                {"participant_ids": user_id}
            ).sort("last_message_at", -1).skip(skip).limit(limit)

            conversations = []
            async for conv in conversations_cursor:
                conv["_id"] = str(conv["_id"])
                
                # Fetch participants info
                participants_info = await self._get_participants_info(conv["participant_ids"])
                
                # Fetch last message if timestamp exists
                last_messages = []
                if conv.get("last_message_at"):
                    last_message_doc = await self.messages_collection.find_one(
                        {"conversation_id": conv["_id"]},
                        sort=[("created_at", -1)]
                    )
                    if last_message_doc:
                        last_message_doc["_id"] = str(last_message_doc["_id"])
                        sender_info = await self._get_user_basic_info(last_message_doc["sender_id"])
                        last_messages.append(MessageRead(**last_message_doc, sender=sender_info))

                conversations.append(
                    ConversationRead(
                        **conv,
                        participants=participants_info,
                        last_message=last_messages  # Now passing as a list
                    )
                )

            return conversations

        except Exception as e:
            logger.error(f"Error fetching conversations for user {user_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch conversations"
            )

    async def get_messages_for_conversation(self, conversation_id: str, user_id: str, skip: int = 0, limit: int = 50) -> List[MessageRead]:
        """Retrieves messages for a conversation, validating user participation."""
        # Validate user is part of the conversation
        await self._validate_conversation_participant(conversation_id, user_id)

        try:
            query = {"conversation_id": conversation_id}
            sort_order = [("created_at", 1)] # Sort oldest first

            messages_cursor = self.messages_collection.find(query).sort(sort_order).skip(skip).limit(limit)
            messages = []
            async for msg_doc in messages_cursor:
                msg_doc["_id"] = str(msg_doc["_id"])
                sender_info = await self._get_user_basic_info(msg_doc["sender_id"])
                messages.append(MessageRead(**msg_doc, sender=sender_info))
            return messages
        except Exception as e:
            logger.error(f"Error fetching messages for conversation {conversation_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error retrieving messages.")

    async def send_message(self, conversation_id: str, sender_id: str, content: str) -> MessageRead:
        """Sends a message and updates conversation's last message data."""
        try:
            # ...existing validation code...

            message_doc = {
                "conversation_id": conversation_id,
                "sender_id": sender_id,
                "content": content,
                "created_at": datetime.utcnow()
            }

            result = await self.messages_collection.insert_one(message_doc)
            message_doc["_id"] = str(result.inserted_id)

            # Update conversation with last message info
            preview = content[:MAX_PREVIEW_LENGTH] + "..." if len(content) > MAX_PREVIEW_LENGTH else content
            await self.conversations_collection.update_one(
                {"_id": ObjectId(conversation_id)},
                {
                    "$set": {
                        "last_message_at": message_doc["created_at"],
                        "last_message_preview": preview,
                    }
                }
            )

            # Get sender info for response
            sender_info = await self._get_user_basic_info(sender_id)
            return MessageRead(**message_doc, sender=sender_info)

        except Exception as e:
            logger.error(f"Error sending message in conversation {conversation_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send message"
            )

    async def send_system_message(self, target_user_id: str, admin_user_id: str, content: str) -> MessageRead:
        """
        Sends a message from an admin to a user.
        Creates a conversation if none exists.
        """
        try:
            # Verify admin privileges
            admin_info = await self._get_user_basic_info(admin_user_id)
            if not admin_info or admin_info.role != 'admin':
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only administrators can send system messages"
                )

            # Validate target user exists
            target_user = await self._get_user_basic_info(target_user_id)
            if not target_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Target user not found"
                )

            # Find or create conversation
            conversation = await self.find_or_create_conversation(
                user1_id=target_user_id,
                user2_id=admin_user_id
            )

            # Create and send message
            message_doc = {
                "conversation_id": str(conversation.id),
                "sender_id": admin_user_id,
                "content": content,
                "created_at": datetime.utcnow()
            }

            result = await self.messages_collection.insert_one(message_doc)
            message_doc["_id"] = str(result.inserted_id)

            # Update conversation's last message
            preview = content[:MAX_PREVIEW_LENGTH] + "..." if len(content) > MAX_PREVIEW_LENGTH else content
            await self.conversations_collection.update_one(
                {"_id": ObjectId(conversation.id)},
                {
                    "$set": {
                        "last_message_at": message_doc["created_at"],
                        "last_message_preview": preview,
                    }
                }
            )

            return MessageRead(
                **message_doc,
                sender=admin_info
            )

        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(f"Error sending system message: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send message"
            )

    async def get_conversation_by_id(self, conversation_id: str, user_id: str) -> ConversationRead:
        """
        Retrieves a specific conversation by ID, ensuring the requesting user is a participant.
        Returns populated ConversationRead object.
        """
        # Validate and get conversation
        conv_doc = await self._validate_conversation_participant(conversation_id, user_id)
        
        try:
            # Convert ObjectId to string
            conv_doc["_id"] = str(conv_doc["_id"])
            
            # Get participants info
            participants_info = await self._get_participants_info(conv_doc["participant_ids"])
            
            # Get last message if exists
            last_messages = []
            if conv_doc.get("last_message_at"):
                last_message = await self.messages_collection.find_one(
                    {"conversation_id": conversation_id},
                    sort=[("created_at", -1)]
                )
                if last_message:
                    last_message["_id"] = str(last_message["_id"])
                    sender_info = await self._get_user_basic_info(last_message["sender_id"])
                    last_messages.append(MessageRead(**last_message, sender=sender_info))
            
            return ConversationRead(**conv_doc, participants=participants_info, last_message=last_messages)
        
        except Exception as e:
            logger.error(f"Error fetching conversation {conversation_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving conversation details"
            )

# Instantiate the manager
dm_mgr = DirectMessageMgr()