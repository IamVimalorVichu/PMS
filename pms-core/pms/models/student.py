from datetime import date, datetime
from pydantic import BaseModel, EmailStr, constr, Field
from typing import Dict, Literal, Optional, Annotated, List



class Student(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: Optional[str] = None  # Make user_id optional
    first_name:str
    middle_name: Optional[str]=""
    last_name:Optional[str]=""
    dob:Optional[datetime] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = "Kerala"
    district: Optional[str] = None 
    adm_no:Optional[str]=None
    reg_no:Optional[str]=None
    gender: Optional[Literal["Male","Female","Other"]] = None
    email: EmailStr
    alt_email: Optional[EmailStr] = None
    ph_no: Optional[str] = Field(None, min_length=10, max_length=14)
    alt_ph: Optional[str] = Field(None, min_length=10, max_length=14)
    created_at:Optional[datetime]=None
    updated_at:Optional[datetime]=None
    join_date:Optional[datetime]=None
    end_date:Optional[datetime]=None
    program:Optional[Literal["MCA","MBA","BCA","BBA"]]="MCA"
    status: Optional[Literal["Active","Discontinued","completed"]]="Active"

class StudentUpdate(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    dob: Optional[datetime] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None 
    adm_no: Optional[str] = None
    reg_no: Optional[str] = None
    gender: Optional[Literal["Male","Female","Other"]] = None
    email: Optional[EmailStr] = None
    alt_email: Optional[EmailStr] = None
    ph_no: Optional[str] = Field(None, min_length=10, max_length=14) 
    alt_ph: Optional[str] = Field(None, min_length=10, max_length=14)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    join_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    program: Optional[Literal["MCA","MBA","BCA","BBA"]] = None
    status: Optional[Literal["Active","Discontinued","completed"]] = None

 
    class Config:
        schema_extra = {
            "example": {
            }
        }
