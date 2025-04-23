from datetime import date, datetime
from pydantic import BaseModel, EmailStr, constr, Field
from typing import Dict, Literal, Optional, Annotated, List



class Requirement(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    job: str 
    experience_required: int
    sslc_cgpa: Optional[float] = None
    plustwo_cgpa: Optional[float] = None
    degree_cgpa: Optional[float] = None
    mca_cgpa: Optional[List[float]] = None  
    contract: Optional[int] = None  
    additional_criteria: Optional[str] = None
    skills_required: Optional[List[str]] = None  # Technical/soft skills needed
    preferred_qualifications: Optional[List[str]] = None  # Nice-to-have qualifications
    required_certifications: Optional[List[str]] = None  # Required certifications
    language_requirements: Optional[List[str]] = None  # Required languages
    passout_year: Optional[int] = None

class RequirementUpdate(BaseModel):
    job: Optional[str] = None
    experience_required: Optional[int] = None
    sslc_cgpa: Optional[float] = None
    plustwo_cgpa: Optional[float] = None
    degree_cgpa: Optional[float] = None
    mca_cgpa: Optional[List[float]] = None  
    contract: Optional[int] = None  
    additional_criteria: Optional[str] = None
    skills_required: Optional[List[str]] = None  # Technical/soft skills needed
    preferred_qualifications: Optional[List[str]] = None  # Nice-to-have qualifications
    required_certifications: Optional[List[str]] = None  # Required certifications
    language_requirements: Optional[List[str]] = None  # Required languages
    passout_year: Optional[int] = None
