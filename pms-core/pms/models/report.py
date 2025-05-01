from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from pms.models.user import UserBasicInfo

class Report(BaseModel):
    """
    Represents a Report submitted by a user for a Post or Comment.
    """
    id: Optional[str] = Field(None, alias="_id")
    reporter_id: str # User._id of the user who reported
    reported_item_id: str # Post._id or Comment._id being reported
    item_type: Literal['post', 'comment', 'user'] # Type of item being reported
    reason: Optional[str] = None # Optional reason provided by the reporter
    status: Literal['pending', 'resolved', 'dismissed'] = 'pending' # Admin-managed status
    created_at: datetime = Field(default_factory=datetime.now)

    # Field populated in service/route layer for admin view
    reporter: Optional[UserBasicInfo] = None

    class Config:
        populate_by_name = True

class ReportCreate(BaseModel):
    """
    Schema for creating a new report. Input from the user.
    """
    reported_item_id: str
    item_type: Literal['post', 'comment', 'user']
    reason: Optional[str] = None

class ReportRead(Report):
    """
    Schema for reading/returning report data, potentially including reporter info for admins.
    Inherits all fields from Report.
    """
    reporter: Optional[UserBasicInfo] = None # Ensure this field is included
    target_user_id: Optional[str] = None # For user reports, the target user ID

class ReportUpdate(BaseModel):
    """
    Schema for updating the status of a report by an admin.
    """
    status: Literal['pending', 'resolved', 'dismissed']