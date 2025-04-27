from datetime import date, datetime
from pydantic import BaseModel, EmailStr, constr, Field
from typing import Dict, Literal, Optional, Annotated, List




class Job(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    company: str
    drive: str
    title: str
    desc: Optional[str] = None
    loc: Optional[str] = None
    job_type: Optional[Literal["full-time", "part-time", "Contract", "Remote"]] = "full-time"
    requirement: Optional[str] = None
    experience: Optional[int] = 0
    salary: Optional[float] = None
    salary_range: Optional[List[float]] = None  # [min_salary, max_salary]
    join_date: Optional[datetime] = None
    last_date: Optional[datetime] = None
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    additional_instructions: Optional[str] = None
    form_link: Optional[str] = None
    applied_students: Optional[List[str]]=[]
    eligible_students: Optional[List[str]]=[]
    selected_students: Optional[List[str]]=[]
    stage_students: Optional[List[List[str]]] = []



    
class JobUpdate(BaseModel):
    company: Optional[str] = None
    drive: Optional[str] = None
    title: Optional[str] = None
    desc: Optional[str] = None
    loc: Optional[str] = None
    job_type: Optional[Literal["full-time", "part-time", "Contract", "Remote"]] = None
    requirement: Optional[str] = None
    experience: Optional[int] = None
    salary: Optional[float] = None
    salary_range: Optional[List[float]] = None
    join_date: Optional[datetime] = None
    last_date: Optional[datetime] = None
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    additional_instructions: Optional[str] = None
    form_link: Optional[str] = None
    applied_students: Optional[List[str]]=None
    eligible_students: Optional[List[str]]=None
    selected_students: Optional[List[str]]=None
    stage_students: Optional[List[List[str]]] = None

