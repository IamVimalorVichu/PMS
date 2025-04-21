# models/application_form.py
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict

# --- Application Form Submission ---
# Represents a student's submitted form data for a specific job within a drive.
# Contains optional fields for all possible standard data points, plus custom answers.

class ApplicationForm(BaseModel):
    id: Optional[str] = Field(None, alias="_id", description="Unique ID of this submission")
    drive_id: str = Field(..., description="ID of the Drive")
    job_id: str = Field(..., description="ID of the specific Job this submission is for")
    student_id: str = Field(..., description="ID of the Student who submitted")

    # --- Standard Student Fields (Optional String Answers) ---
    # Populated only if the corresponding 'include_...' flag in DriveForm was True
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    adm_no: Optional[str] = None
    reg_no: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[EmailStr] = None # Keep EmailStr validation if desired
    alt_email: Optional[EmailStr] = None
    ph_no: Optional[str] = None
    alt_ph: Optional[str] = None
    program: Optional[str] = None
    student_status: Optional[str] = Field(None, alias="status") # From Student model

    # --- Standard Performance Fields (Optional String Answers) ---
    # Populated only if the corresponding 'include_...' flag in DriveForm was True
    # All numeric values are stored as strings.
    tenth_cgpa: Optional[str] = None
    twelfth_cgpa: Optional[str] = None
    degree_cgpa: Optional[str] = None
    mca_cgpa: Optional[str] = None # e.g., storing latest as string
    skills: Optional[str] = None # e.g., storing comma-separated string
    current_status: Optional[str] = None # From Performance model
    mca_percentage: Optional[str] = None
    linkedin_url: Optional[str] = None

    # --- Additional Custom Field Answers ---
    # Key is the label/question from the DriveForm template's additional_field_labels list.
    # Value is the student's answer as a string.
    additional_answers: Dict[str, str] = Field(
        default_factory=dict,
        description="Answers for custom fields defined in the drive form template"
    )

    # --- Metadata ---
    submitted_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None # If edits are allowed

    class Config:
        allow_population_by_field_name = True # For alias 'status'
        schema_extra = {
            "example": {
                "drive_id": "65f123abc123def456ghi789",
                "job_id": "65f987xyz987abc654def321",
                "student_id": "65e456def789abc123def456",
                # Only fields included by the template flags would be populated
                "first_name": "Jane",
                "last_name": "Doe",
                "email": "jane.doe@example.com",
                "reg_no": "S20MCA001",
                "program": "MCA",
                "ph_no": "9876543210",
                "tenth_cgpa": "9.2", # Stored as string
                "twelfth_cgpa": "8.8", # Stored as string
                "skills": "Python, React, SQL", # Stored as string
                "linkedin_url": "https://linkedin.com/in/janedoe",
                # middle_name, address, etc., would be null/omitted if flags were false
                "additional_answers": {
                    "Why are you interested in applying to jobs in this drive?": "This drive offers roles perfectly aligned with my skills.",
                    "Are you available for immediate joining?": "Yes",
                    "Preferred work location (if applicable)": "Kochi or Remote"
                },
                "submitted_at": "2023-10-28T14:00:00Z"
            }
        }

# --- Application Form Submission Update ---
# Defines fields allowed for updating a submission (if permitted)

class ApplicationFormUpdate(BaseModel):
    # Allow updating any standard field that might have been submitted
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    adm_no: Optional[str] = None
    reg_no: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[EmailStr] = None
    alt_email: Optional[EmailStr] = None
    ph_no: Optional[str] = None
    alt_ph: Optional[str] = None
    program: Optional[str] = None
    student_status: Optional[str] = Field(None, alias="status")

    tenth_cgpa: Optional[str] = None
    twelfth_cgpa: Optional[str] = None
    degree_cgpa: Optional[str] = None
    mca_cgpa: Optional[str] = None
    skills: Optional[str] = None
    current_status: Optional[str] = None
    mca_percentage: Optional[str] = None
    linkedin_url: Optional[str] = None

    # Allow updating the dictionary of custom answers
    additional_answers: Optional[Dict[str, str]] = None

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "email": "jane.doe.new@example.com", # Update standard field
                "skills": "Python, React, SQL, FastAPI", # Update standard field
                "additional_answers": { # Replace entire custom answers dict
                    "Why are you interested in applying to jobs in this drive?": "Updated interest statement.",
                    "Are you available for immediate joining?": "No", # Changed answer
                    "Preferred work location (if applicable)": "Kochi Only"
                }
            }
        }

