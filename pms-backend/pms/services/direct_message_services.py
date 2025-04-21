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
        """Checks if conversation exists and user is a participant."""
        try:
            conversation_doc = await self.conversations_collection.find_one(
                {"_id": ObjectId(conversation_id)}
            )
            if not conversation_doc:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
            if user_id not in conversation_doc.get("participant_ids", []):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not a participant of this conversation.")
            return conversation_doc
        except bson_errors.InvalidId:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid conversation ID format.")
        except HTTPException as he:
            raise he # Re-raise specific HTTP exceptions
        except Exception as e:
            logger.error(f"Error validating conversation participant ({conversation_id}, {user_id}): {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Server error validating conversation access.")

    async def find_or_create_conversation(self, user1_id: str, user2_id: str) -> ConversationRead:
        """
        Finds or creates a conversation between two users.
        Returns the ConversationRead object with populated participant info.
        """
        if user1_id == user2_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot start a conversation with yourself.")

        # Canonical representation by sorting IDs
        participant_ids = sorted([user1_id, user2_id])

        try:
            # Try to find existing conversation
            existing_conv = await self.conversations_collection.find_one({"participant_ids": participant_ids})

            if existing_conv:
                existing_conv["_id"] = str(existing_conv["_id"])
                participants_info = await self._get_participants_info(existing_conv["participant_ids"])
                return ConversationRead(**existing_conv, participants=participants_info)
            else:
                # Validate both users exist before creating conversation
                user1_info = await self._get_user_basic_info(user1_id)
                user2_info = await self._get_user_basic_info(user2_id)
                if not user1_info or not user2_info:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or both users not found.")

                # Create new conversation
                new_conv_doc = {
                    "participant_ids": participant_ids,
                    "created_at": datetime.utcnow(),
                    "last_message_at": None,
                    "last_message_preview": None
                }
                result = await self.conversations_collection.insert_one(new_conv_doc)
                inserted_id = str(result.inserted_id)

                # Fetch the created doc to return (or build from new_conv_doc)
                created_conv = await self.conversations_collection.find_one({"_id": result.inserted_id})
                if created_conv:
                    created_conv["_id"] = str(created_conv["_id"])
                    participants_info = await self._get_participants_info(created_conv["participant_ids"])
                    return ConversationRead(**created_conv, participants=participants_info)
                else:
                     # Should ideally not happen
                     logger.error(f"Failed to fetch newly created conversation: {inserted_id}")
                     raise HTTPException(status_code=500, detail="Error creating conversation record.")

        except bson_errors.InvalidId:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format provided.")
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(f"Error finding or creating conversation between {user1_id} and {user2_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Server error handling conversation.")

    async def get_user_conversations(self, user_id: str, skip: int = 0, limit: int = 20) -> List[ConversationRead]:
        """Retrieves conversations for a user, sorted by last message time."""
        try:
            query = {"participant_ids": user_id}
            sort_order = [("last_message_at", -1)] # Sort by most recent first

            conversations_cursor = self.conversations_collection.find(query).sort(sort_order).skip(skip).limit(limit)
            conversations = []
            async for conv_doc in conversations_cursor:
                conv_doc["_id"] = str(conv_doc["_id"])
                participants_info = await self._get_participants_info(conv_doc["participant_ids"])
                conversations.append(ConversationRead(**conv_doc, participants=participants_info))
            return conversations
        except Exception as e:
            logger.error(f"Error fetching conversations for user {user_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error retrieving conversations.")

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
        """Sends a message, validates participation, and updates conversation metadata."""
        if not content or content.isspace():
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message content cannot be empty.")

        # Validate user is part of the conversation (also checks if conversation exists)
        await self._validate_conversation_participant(conversation_id, sender_id)

        try:
            # Create message document
            message_time = datetime.utcnow()
            message_doc = {
                "conversation_id": conversation_id,
                "sender_id": sender_id,
                "content": content,
                "created_at": message_time
            }
            result = await self.messages_collection.insert_one(message_doc)
            inserted_id = str(result.inserted_id)

            # Update conversation's last message timestamp and preview
            preview = (content[:MAX_PREVIEW_LENGTH] + '...') if len(content) > MAX_PREVIEW_LENGTH else content
            await self.conversations_collection.update_one(
                {"_id": ObjectId(conversation_id)},
                {"$set": {"last_message_at": message_time, "last_message_preview": preview}}
            )

            # Fetch the created message to return it with sender info
            created_message_doc = await self.messages_collection.find_one({"_id": result.inserted_id})
            if created_message_doc:
                 created_message_doc["_id"] = str(created_message_doc["_id"])
                 sender_info = await self._get_user_basic_info(created_message_doc["sender_id"])
                 return MessageRead(**created_message_doc, sender=sender_info)
            else:
                 logger.error(f"Failed to retrieve newly sent message: {inserted_id}")
                 raise HTTPException(status_code=500, detail="Failed to confirm message sending.")

        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(f"Error sending message in conversation {conversation_id} by user {sender_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error sending message.")


# Instantiate the manager
dm_mgr = DirectMessageMgr()