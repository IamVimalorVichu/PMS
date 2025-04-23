from datetime import date, datetime
from pydantic import BaseModel, EmailStr, constr, Field
from typing import Dict, Literal, Optional, Annotated, List



class Company(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    site: Optional[str] = None
    branch: str 
    desc: Optional[str] = None
    email: Optional[EmailStr] = None
    ph_no: Optional[Annotated[str, constr(min_length=10, max_length=14)]]=None
    avg_salary: Optional[float] = None
    placed_students: Optional[List[str]] = []
    
class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    site: Optional[str] = None
    branch: Optional[str] = None
    desc: Optional[str] = None
    email: Optional[EmailStr] = None
    ph_no: Optional[Annotated[str, constr(min_length=10, max_length=14)]] = None
    avg_salary: Optional[float] = None
    placed_students: Optional[List[str]] = None