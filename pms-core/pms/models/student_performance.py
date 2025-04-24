from datetime import date, datetime
from pydantic import BaseModel, EmailStr, constr, Field, HttpUrl
from typing import Dict, Literal, Optional, Annotated, List

class FileInfo(BaseModel):
    filename: str = Field(..., min_length=1, max_length=255)   
    filepath: str = Field(..., min_length=1, max_length=500)
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    uploaded_at: Optional[datetime] = Field(default_factory=datetime.now)

class StudentPerformance(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    student_id: str
    semester: int
    tenth_cgpa: Optional[float] = None
    twelth_cgpa: Optional[float] = None
    degree_cgpa: Optional[float] = None
    mca_cgpa: Optional[List[float]]
    certification_files: Optional[List[FileInfo]] = Field(default_factory=list, max_items=10)    
    job_application_files: Optional[List[FileInfo]] = Field(default_factory=list, max_items=10)
    skills: Optional[List[str]]
    current_status: Literal["Studying", "Working", "Others"] = "Studying"
    year: Optional[int]
    mca_percentage: Optional[float]= None
    linkedin_url: Optional[str]= None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class StudentPerformanceUpdate(BaseModel):
            student_id: Optional[str] = None
            semester: Optional[int] = None
            tenth_cgpa: Optional[float] = None
            twelth_cgpa: Optional[float] = None
            degree_cgpa: Optional[float] = None
            mca_cgpa: Optional[List[float]] = None
            certification_files: Optional[List[FileInfo]] = None
            job_application_files: Optional[List[FileInfo]] = None
            skills: Optional[List[str]] = None
            current_status: Optional[Literal["Studying", "Working", "Others"]] = None
            year: Optional[int] = None
            mca_percentage: Optional[float] = None
            linkedin_url: Optional[str] = None
            updated_at: Optional[datetime] = None

            class Config:
                orm_mode = True