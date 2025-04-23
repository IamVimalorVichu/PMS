from datetime import date, datetime
from pydantic import BaseModel, EmailStr, constr, Field
from typing import Dict, Literal, Optional, Annotated, List


class JobApplication(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    student_id:str
    job_id:str
    company_id:str
    drive_id:str
    status: Optional[Literal["Applied","Shortlisted","Rejected","Placed"]] = "Applied"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    applied_date: Optional[datetime] = None
    shortlisted_date: Optional[datetime] = None
    rejected_date: Optional[datetime] = None
    resume: Optional[str] = None
    saved_resume: Optional[str] = None

