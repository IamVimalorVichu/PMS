from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from pms.models.user import UserBasicInfo # Reusing the basic user info

# --- Conversation Model ---



class Message(BaseModel):
    """
    Represents a single message within a direct message conversation.
    """
    id: Optional[str] = Field(None, alias="_id")
    conversation_id: str # Reference to the Conversation._id
    sender_id: str # Reference to the User._id who sent the message
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Field populated in service/route layer
    sender: Optional[UserBasicInfo] = None

    class Config:
        populate_by_name = True

class MessageCreate(BaseModel):
    """
    Schema for sending a new message. Input from the user.
    """
    content: str

class MessageRead(Message):
    """
    Schema for reading/returning message data, including populated sender info.
    """
    sender: Optional[UserBasicInfo] = None

# --- API Specific Schemas ---

class ConversationCreate(BaseModel):
    """
    Input schema to start or find a conversation with another user.
    """
    recipient_id: str

class Conversation(BaseModel):
    """
    Represents a direct message conversation between two users.
    """
    id: Optional[str] = Field(None, alias="_id")
    # Store sorted participant IDs to easily find existing conversations
    participant_ids: List[str] = Field(..., min_length=2, max_length=2)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_message_at: Optional[datetime] = None # Timestamp of the latest message
    last_message_preview: Optional[str] = None # Snippet of the latest message

    # Fields populated in service/route layer for list views
    participants: Optional[List[UserBasicInfo]] = None
    # Optional: unread count - adds significant complexity, skipping for now
    last_message: Optional[List[MessageRead]] = None  # Changed from Optional[Message]

    class Config:
        populate_by_name = True

class ConversationRead(Conversation):
    """
    Schema for returning conversation data, including populated participant info.
    """
    participants: Optional[List[UserBasicInfo]] = None

# --- Message Model ---