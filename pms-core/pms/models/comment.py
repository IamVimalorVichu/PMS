from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from pms.models.user import UserBasicInfo

class Comment(BaseModel):
    """
    Represents a Comment on a Post in the database.
    """
    id: Optional[str] = Field(None, alias="_id")
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    author_id: str # Reference to the User._id who created the comment
    post_id: str # Reference to the Post._id this comment belongs to

    # Field populated in service/route layer
    author: Optional[UserBasicInfo] = None

    class Config:
        populate_by_name = True

class CommentCreate(BaseModel):
    """
    Schema for creating a new comment. Input from the user.
    """
    content: str

class CommentRead(Comment):
    """
    Schema for reading/returning comment data, including populated author info.
    Inherits all fields from Comment.
    """
    author: Optional[UserBasicInfo] = None # Ensure this field is included