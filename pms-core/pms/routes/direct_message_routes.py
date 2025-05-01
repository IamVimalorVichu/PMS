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

@router.post("/conversations/{user_id}", response_model=ConversationRead)
async def create_conversation(
    user_id: str,  # From path parameter
    payload: ConversationCreate
):
    """
    Finds an existing conversation with the recipient or creates a new one.
    Returns the conversation details.
    """
    try:
        conversation = await dm_mgr.find_or_create_conversation(
            user1_id=user_id,
            user2_id=payload.recipient_id
        )
        return conversation
    except HTTPException as he:
        raise he
    except ValueError as ve:  # Catch potential errors like invalid recipient ID format
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                          detail="Error finding or creating conversation.")

@router.get("/conversations/{user_id}", response_model=List[ConversationRead])
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


@router.get("/conversations/{conversation_id}/messages/{user_id}", response_model=List[MessageRead])
async def get_conversation_messages(
    conversation_id: str,
    user_id: str,  # User ID from path for validation
    skip: int = 0,
    limit: int = Query(default=50, le=200)
):
    """
    Retrieves messages for a specific conversation.
    The current user must be a participant. Messages sorted oldest first.
    """
    try:
        messages = await dm_mgr.get_messages_for_conversation(
            conversation_id=conversation_id,
            user_id=user_id,
            skip=skip,
            limit=limit
        )
        return messages
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Error retrieving messages."
        )

@router.post("/conversations/{conversation_id}/messages/{user_id}", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
async def send_direct_message(
    conversation_id: str,
    user_id: str,  # User ID from path for validation
    payload: MessageCreate
):
    """
    Sends a message within a specific conversation.
    The current user must be a participant.
    """
    try:
        message = await dm_mgr.send_message(
            conversation_id=conversation_id,
            sender_id=user_id,
            content=payload.content.strip()
        )
        if not message:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Failed to send message"
            )
        return message
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Error sending message."
        )

@router.get("/conversations/{conversation_id}/{user_id}", response_model=ConversationRead)
async def get_conversation_by_id(
            conversation_id: str,
            user_id: str  # User ID from path for validation
        ):
            """
            Retrieves details for a specific conversation.
            The current user must be a participant.
            """
            try:
                conversation = await dm_mgr.get_conversation_by_id(
                    conversation_id=conversation_id,
                    user_id=user_id
                )
                return conversation
            except HTTPException as he:
                raise he
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Error retrieving conversation details."
                )

@router.post("/system-message/{target_user_id}/{admin_user_id}", response_model=MessageRead)
async def send_system_message(
    target_user_id: str,
    admin_user_id: str,
    payload: MessageCreate
):
    """
    Sends a system message to a user.
    Only accessible by administrators.
    """
    try:
        message = await dm_mgr.send_system_message(
            target_user_id=target_user_id,
            admin_user_id=admin_user_id,
            content=payload.content.strip()
        )
        return message
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error sending system message."
        )