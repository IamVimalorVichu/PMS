from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List

from pms.models.direct_message import (
    ConversationRead,
    MessageRead,
    MessageCreate,
    ConversationCreate
)
from pms.services.direct_message_services import dm_mgr

router = APIRouter()

@router.post("/conversations", response_model=ConversationRead)
async def create_conversation(payload: ConversationCreate):
    """
    Finds an existing conversation with the recipient or creates a new one.
    Returns the conversation details.
    """
    try:
        conversation = await dm_mgr.find_or_create_conversation(
            user1_id=payload.user_id,
            user2_id=payload.recipient_id
        )
        return conversation
    except HTTPException as he:
        raise he
    except ValueError as ve: # Catch potential errors like invalid recipient ID format
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error finding or creating conversation.")

@router.get("/conversations", response_model=List[ConversationRead])
async def get_conversations(
    user_id: str,
    skip: int = 0,
    limit: int = Query(default=20, le=100)
):
    """
    Retrieves the list of conversations for the current user,
    sorted by the most recent message.
    """
    try:
        conversations = await dm_mgr.get_user_conversations(
            user_id=user_id,
            skip=skip,
            limit=limit
        )
        return conversations
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error retrieving conversations.")


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageRead])
async def get_conversation_messages(
    conversation_id: str,
    user_id: str,
    skip: int = 0,
    limit: int = Query(default=50, le=200) # Max limit 200
):
    """
    Retrieves messages for a specific conversation.
    The current user must be a participant. Messages sorted oldest first.
    """
    try:
        messages = await dm_mgr.get_messages_for_conversation(
            conversation_id=conversation_id,
            user_id=user_id, # Pass user ID for validation
            skip=skip,
            limit=limit
        )
        return messages
    except HTTPException as he: # Handles cases where user is not participant
        raise he
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error retrieving messages.")


@router.post("/conversations/{conversation_id}/messages", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
async def send_direct_message(
    conversation_id: str,
    payload: MessageCreate,
    user_id: str
):
    """
    Sends a message within a specific conversation.
    The current user must be a participant.
    """
    try:
        message = await dm_mgr.send_message(
            conversation_id=conversation_id,
            sender_id=user_id, # Pass user ID for validation
            content=payload.content.strip() # Basic whitespace stripping
        )
        if not message: # Should not happen if send_message raises errors correctly
             raise HTTPException(status_code=500, detail="Failed to send message")
        return message
    except HTTPException as he: # Handles validation errors from service
        raise he
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error sending message.")