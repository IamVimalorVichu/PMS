from datetime import date, datetime
from pydantic import BaseModel, EmailStr, constr, Field
from typing import Dict, Literal, Optional, Annotated, List


class Education(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    institute: str
    university: str
    course: str
    gpa: Optional[float] = None
class Project(BaseModel):
    title: str
    description: str
    technologies: Optional[List[str]] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    url: Optional[str] = None
class WorkExperience(BaseModel):
    company: str
    job_title: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    description: Optional[str] = None
class Certificate(BaseModel):
    title: str
    institute: str
    url: Optional[str] = None
    issued_date: Optional[datetime] = None

class Resume(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    student_id: str
    first_name: str
    middle_name: Optional[str] = ""
    last_name: str
    objective: Optional[str] = None
    dob: Optional[datetime] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = "Kerala"
    ph_no: Optional[str] = Field(None, min_length=10, max_length=10)
    alt_ph: Optional[str] = Field(None, min_length=10, max_length=10)
    email: EmailStr
    alt_email: Optional[EmailStr] = None
    achievements: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    education: Optional[List[Education]] = None
    projects: Optional[List[Project]] = None
    work_experience: Optional[List[WorkExperience]] = None
    certificates: Optional[List[Certificate]] = None
    linked_in: Optional[str] = None
    github: Optional[str] = None

    
class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    objective: Optional[str] = None
    dob: Optional[datetime] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    ph_no: Optional[str] = None
    alt_ph: Optional[str] = None
    email: Optional[EmailStr] = None
    alt_email: Optional[EmailStr] = None
    achievements: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    education: Optional[List[Education]] = None
    projects: Optional[List[Project]] = None
    work_experience: Optional[List[WorkExperience]] = None
    certificates: Optional[List[Certificate]] = None
    linked_in: Optional[str] = None
    github: Optional[str] = None
