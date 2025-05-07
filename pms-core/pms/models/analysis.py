from pydantic import BaseModel, Field
from typing import Optional, List, Dict

# --- Sub-models for detailed results ---

class PlacementDetail(BaseModel):
    """Details about a specific job placement for a student."""
    job_id: str
    job_title: str
    company_id: str
    company_name: str
    salary: Optional[float] = None # Salary offered for this specific job

class DriveInteractionSummary(BaseModel):
    """Summary of a student's interaction with a specific drive."""
    drive_id: str
    drive_title: str
    applied: bool = False
    eligible: bool = False
    selected: bool = False
    stages_cleared: Optional[int] = None # Optional: If stage tracking becomes reliable

# --- Main Analysis Result Models ---

class StudentAnalysisResult(BaseModel):
    """Aggregated analysis results for a single student."""
    student_id: str
    total_drives_applied: int = 0
    total_jobs_applied: int = 0
    total_jobs_eligible: int = 0
    total_jobs_selected: int = 0 # Count of successful placements

    # Calculated Ratios (handle division by zero)
    overall_eligibility_rate: float = 0.0 # eligible / applied (jobs)
    overall_selection_rate: float = 0.0 # selected / eligible (jobs)
    overall_placement_rate: float = 0.0 # selected / applied (jobs)

    # Placement Details
    placements: List[PlacementDetail] = [] # List of jobs the student was selected for

    # Optional: Could add drive-specific interactions if needed later
    # drive_interactions: List[DriveInteractionSummary] = []

    class Config:
        # Example for potential MongoDB usage if needed later
        # allow_population_by_field_name = True
        # arbitrary_types_allowed = True # If using ObjectId
        # json_encoders = { ObjectId: str }
        pass

class CompanyAnalysisResult(BaseModel):
    """Aggregated analysis results for a single company."""
    company_id: str
    company_name: str
    total_drives_participated: int = 0
    total_jobs_posted: int = 0
    total_applications_received: int = 0 # Sum across all their jobs
    total_students_eligible: int = 0 # Sum across all their jobs
    total_students_selected: int = 0 # Sum of unique students selected across all their jobs

    # Calculated Ratios (handle division by zero)
    avg_applications_per_job: float = 0.0
    overall_eligibility_rate: float = 0.0 # eligible / applied (across jobs)
    overall_selection_rate: float = 0.0 # selected / eligible (across jobs)
    overall_hiring_conversion_rate: float = 0.0 # selected / applied (across jobs)

    # Compensation Insights
    average_salary_offered: Optional[float] = None # Avg salary of jobs with selections
    min_salary_offered: Optional[float] = None
    max_salary_offered: Optional[float] = None

    # List of students hired by this company (IDs or potentially names)
    hired_student_ids: List[str] = []

    class Config:
        pass

# You might add more models here later for Drive Analysis, etc.