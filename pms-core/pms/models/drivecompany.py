from datetime import date, datetime
from pydantic import BaseModel, EmailStr, constr, Field
from typing import Dict, Literal, Optional, Annotated, List



class DriveCompany(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    drive_id: str  # References a Drive
    company_id: str  # References a Company


