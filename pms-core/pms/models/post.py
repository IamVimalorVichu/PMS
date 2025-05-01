from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Literal
from datetime import datetime
from pms.models.user import UserBasicInfo # Import the new basic info model

# --- Post Models ---

class Post(BaseModel):
    """
    Represents a Post in the community feature database.
    """
    id: Optional[str] = Field(None, alias="_id")
    title: str
    content: Optional[str] = None # Used for text posts
    post_type: Literal['text', 'link', 'media']
    url: Optional[HttpUrl] = None # Used for link posts
    media_url: Optional[HttpUrl] = None # Used for media posts (external link)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    author_id: str # Reference to the User._id who created the post
    is_approved: bool = False # Posts need admin approval unless posted by admin
    upvoter_ids: List[str] = Field(default_factory=list) # List of User._id who upvoted
    comment_count: int = 0 # Denormalized count for performance

    # Field populated in service/route layer, not stored directly in this form in DB
    author: Optional[UserBasicInfo] = None

    class Config:
        populate_by_name = True

class PostCreate(BaseModel):
    """
    Schema for creating a new post. Input from the user.
    """
    title: str
    content: Optional[str] = None
    post_type: Literal['text', 'link', 'media']
    url: Optional[HttpUrl] = None
    media_url: Optional[HttpUrl] = None
    author_id: Optional[str] = None # This should be set by the server, not user input

    # Add validation logic here if needed (e.g., ensure content exists for text, url for link)

class PostRead(Post):
    """
    Schema for reading/returning post data, including populated author info.
    Inherits all fields from Post.
    """
    # Calculate upvote count dynamically if needed, or use stored count
    upvote_count: Optional[int] = None # Field to hold calculated count if needed

    author: Optional[UserBasicInfo] = None # Ensure this field is included

    # Example of calculating a derived field if not storing upvote_count directly
    # @validator('upvote_count', pre=True, always=True)
    # def calculate_upvote_count(cls, v, values):
    #     if 'upvoter_ids' in values:
    #         return len(values['upvoter_ids'])
    #     return 0


class PostUpdate(BaseModel):
    """
    Schema for updating post fields, typically by an admin.
    """
    title: Optional[str] = None
    content: Optional[str] = None
    post_type: Optional[Literal['text', 'link', 'media']] = None
    url: Optional[HttpUrl] = None
    media_url: Optional[HttpUrl] = None
    is_approved: Optional[bool] = None
    # Note: upvoter_ids and comment_count are usually managed by specific actions, not direct updates

# --- Vote Related Schemas (Consolidated Here) ---

class VoteStatus(BaseModel):
    """
    Response schema indicating if the current user has upvoted a specific post.
    """
    has_voted: bool

class VoteResult(BaseModel):
    """
    Response schema after an upvote/downvote action, showing the new count
    and the user's current vote state.
    """
    new_count: int
    voted: bool # True if the user has now upvoted, False otherwise