from datetime import datetime
from pydantic import BaseModel, EmailStr, constr, Field
from typing import Literal, Optional, Annotated, List

# --- Existing User Model (Modified) ---

class User(BaseModel):
    """
    Represents a User in the system database.
    """
    id: Optional[str] = Field(None, alias="_id")
    user_name: Optional[str] = None
    first_name: str
    middle_name: Optional[str] = ""
    last_name: Optional[str] = ""
    gender: Optional[Literal["Male", "Female", "Other"]] = "Male"
    email: Optional[EmailStr] = ""
    ph_no: Optional[str] = Field(None, min_length=10, max_length=14)
    password: Optional[str] = "" # Hashed password stored in DB - maybe not needed
    role: Literal["admin", "faculty", "student", "alumni"]
    status: Optional[Literal["Inactive", "Active"]] = "Inactive"
    can_post: Optional[bool] = True # Community permission
    can_comment: Optional[bool] = True # Community permission
    can_message: Optional[bool] = True # Community permission
    restricted_until: Optional[datetime] = None

    class Config:
        populate_by_name = True # Allows using alias "_id"

class UserUpdate(BaseModel):
    """
    Schema for updating user fields via PATCH requests.
    All fields are optional.
    """
    user_name: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[Literal["Male", "Female", "Other"]] = None
    email: Optional[EmailStr] = None
    ph_no: Optional[str] = Field(None, min_length=10, max_length=14)
    password: Optional[str] = None # Plain text password for update, will be hashed
    role: Optional[Literal["admin", "faculty", "student", "alumni"]] = None
    status: Optional[Literal["Inactive", "Active"]] = None
    can_post: Optional[bool] = None # Community permission update
    can_comment: Optional[bool] = None # Community permission update
    can_message: Optional[bool] = None # Community permission update
    restricted_until: Optional[datetime] = None

# --- New Sub-Model for Embedding Basic User Info ---

class UserBasicInfo(BaseModel):
    """
    A minimal representation of a user, suitable for embedding
    in other models like Posts or Comments.
    """
    id: str = Field(..., alias="_id")
    user_name: Optional[str] = ""
    role: Literal["admin", "faculty", "student", "alumni"]

    class Config:
        populate_by_name = True # Allows using alias "_id"

class ApplyRestrictionsPayload(BaseModel):
    """Payload for applying restrictions to a user."""
    disable_posts: Optional[bool] = None # True to disable, False/None to leave as is/enable if restricted_until is null
    disable_comments: Optional[bool] = None
    disable_messaging: Optional[bool] = None
    restriction_days: Optional[int] = Field(None, ge=0, description="Duration in days. 0 or null means indefinite/manual removal.")