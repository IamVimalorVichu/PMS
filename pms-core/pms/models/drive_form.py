# models/drive_form.py
from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional

# --- Drive Form Template ---
# Defines which fields to include in the application form for a drive.

class DriveForm(BaseModel):
    id: Optional[str] = Field(None, alias="_id", description="Unique ID of the form template")
    drive_id: str = Field(..., description="ID of the Drive this form template belongs to (unique constraint recommended)")

    # --- Standard Student Fields (Flags) ---
    include_first_name: Optional[bool] = Field(default=True)
    include_middle_name: Optional[bool] = Field(default=False)
    include_last_name: Optional[bool] = Field(default=True)
    include_address: Optional[bool] = Field(default=False)
    include_city: Optional[bool] = Field(default=False)
    include_state: Optional[bool] = Field(default=False)
    include_district: Optional[bool] = Field(default=False)
    include_adm_no: Optional[bool] = Field(default=False)
    include_reg_no: Optional[bool] = Field(default=True)
    include_gender: Optional[bool] = Field(default=False)
    include_email: Optional[bool] = Field(default=True)
    include_alt_email: Optional[bool] = Field(default=False)
    include_ph_no: Optional[bool] = Field(default=True)
    include_alt_ph: Optional[bool] = Field(default=False)
    include_program: Optional[bool] = Field(default=True)
    include_student_status: Optional[bool] = Field(default=False, alias="include_status") # Alias if needed

    # --- Standard Performance Fields (Flags) ---
    include_tenth_cgpa: Optional[bool] = Field(default=True)
    include_twelfth_cgpa: Optional[bool] = Field(default=True)
    include_degree_cgpa: Optional[bool] = Field(default=True)
    # Flag to include MCA CGPA (frontend/backend decides how to display/store - e.g., latest)
    include_mca_cgpa: Optional[bool] = Field(default=True)
    include_skills: Optional[bool] = Field(default=True)
    include_current_status: Optional[bool] = Field(default=False) # Performance current_status
    include_mca_percentage: Optional[bool] = Field(default=False)
    include_linkedin_url: Optional[bool] = Field(default=True)

    # --- Additional Custom Fields ---
    # Just the labels/questions for additional fields faculty wants to ask
    additional_field_labels: List[str] = Field(
        default_factory=list,
        description="List of labels/questions for custom fields added by faculty"
    )

    # --- Metadata ---
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True # Allows using alias 'include_status'
        schema_extra = {
            "example": {
                "drive_id": "65f123abc123def456ghi789",
                "include_first_name": True,
                "include_last_name": True,
                "include_email": True,
                "include_reg_no": True,
                "include_program": True,
                "include_ph_no": True,
                "include_tenth_cgpa": True,
                "include_twelfth_cgpa": True,
                "include_degree_cgpa": True,
                "include_mca_cgpa": True,
                "include_skills": True,
                "include_linkedin_url": True,
                # Other fields default to False if not specified
                "additional_field_labels": [
                    "Why are you interested in applying to jobs in this drive?",
                    "Are you available for immediate joining?",
                    "Preferred work location (if applicable)"
                ]
            }
        }

# --- Drive Form Template Update ---
# Defines fields allowed for updating the template via PATCH

class DriveFormUpdate(BaseModel):
    # Allow updating any of the boolean flags
    include_first_name: Optional[bool] = None
    include_middle_name: Optional[bool] = None
    include_last_name: Optional[bool] = None
    include_address: Optional[bool] = None
    include_city: Optional[bool] = None
    include_state: Optional[bool] = None
    include_district: Optional[bool] = None
    include_adm_no: Optional[bool] = None
    include_reg_no: Optional[bool] = None
    include_gender: Optional[bool] = None
    include_email: Optional[bool] = None
    include_alt_email: Optional[bool] = None
    include_ph_no: Optional[bool] = None
    include_alt_ph: Optional[bool] = None
    include_program: Optional[bool] = None
    include_student_status: Optional[bool] = Field(None, alias="include_status")

    include_tenth_cgpa: Optional[bool] = None
    include_twelfth_cgpa: Optional[bool] = None
    include_degree_cgpa: Optional[bool] = None
    include_mca_cgpa: Optional[bool] = None
    include_skills: Optional[bool] = None
    include_current_status: Optional[bool] = None
    include_mca_percentage: Optional[bool] = None
    include_linkedin_url: Optional[bool] = None

    # Allow updating the list of custom questions
    additional_field_labels: Optional[List[str]] = None

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "include_email": False, # Example: Disable email field
                "include_city": True, # Example: Enable city field
                "additional_field_labels": [
                    "Why are you interested in applying to jobs in this drive?",
                    # "Are you available for immediate joining?" - Removed question
                    "Preferred work location (if applicable)",
                    "Describe your final year project briefly." # Added question
                ]
            }
        }