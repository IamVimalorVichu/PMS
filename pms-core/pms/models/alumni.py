from datetime import date, datetime
from pydantic import BaseModel, EmailStr, constr, Field
from typing import Dict, Literal, Optional, Annotated, List



class Alumni(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: Optional[str] = None  # Make user_id optional
    first_name: str
    middle_name: Optional[str] = ""
    last_name: Optional[str] = ""
    dob: Optional[datetime] = None
    email: EmailStr
    ph_no: Optional[str] = Field(None, min_length=10, max_length=14)
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = "Kerala"
    district: Optional[str] = None
    adm_no: Optional[str] = None
    passout_year: Optional[datetime] = None
    status: Optional[Literal["Employed", "Unemployed"]] = "Unemployed"


class AlumniUpdate(BaseModel):
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    dob: Optional[datetime] = None
    email: Optional[EmailStr] = None
    ph_no: Optional[str] = Field(None, min_length=10, max_length=14)
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    adm_no: Optional[str] = None
    passout_year: Optional[datetime] = None
    status: Optional[Literal["Employed", "Unemployed"]] = None
