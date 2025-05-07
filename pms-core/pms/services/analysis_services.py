# pms/services/analysis_services.py

from typing import List, Optional, Set
from fastapi import HTTPException, status
import logging # Import logging

# --- Import global manager instances ---
from pms.services.job_services import job_mgr
from pms.services.company_services import company_mgr
from pms.services.student_services import student_mgr
# from pms.services.drive_services import drive_mgr

from pms.models.analysis import StudentAnalysisResult, PlacementDetail
from pms.models.job import Job
from pms.models.company import Company
from pms.models.student import Student

class AnalysisService:
    """
    Service layer for calculating performance and interaction analysis.
    Relies on globally initialized manager instances (job_mgr, company_mgr, etc.).
    """

    def __init__(self):
        pass

    async def initialize(self):
        print("Analysis Service Initialized (using global managers).")
        pass

    async def calculate_student_analysis(self, student_id: str) -> StudentAnalysisResult:
        """
        Calculates interaction and placement analysis for a given student
        using data fetched via service managers.
        """
        try:
            # 1. Verify student exists using StudentMgr
            #    ASSUMPTION: student_mgr has a method get_student
            student: Optional[Student] = await student_mgr.get_student(student_id)
            if not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Student with id {student_id} not found"
                )

            # 2. Fetch all jobs the student interacted with using JobMgr
            #    *** Use the method now defined in JobMgr ***
            interacting_jobs: List[Job] = await job_mgr.get_jobs_by_student_interaction(student_id)

            # 3. Initialize metrics
            total_jobs_applied = 0
            total_jobs_eligible = 0
            total_jobs_selected = 0
            placements: List[PlacementDetail] = []
            applied_drive_ids: Set[str] = set()

            # 4. Iterate through jobs and aggregate data
            for job in interacting_jobs: # interacting_jobs now contains Job models
                # Ensure IDs are compared/used as strings
                # Access attributes directly from the Job model instance
                job_drive_id_str = str(job.drive) if job.drive else None
                job_company_id_str = str(job.company) if job.company else None
                job_id_str = str(job.id) if job.id else None

                applied_students_list = job.applied_students or []
                eligible_students_list = job.eligible_students or []
                selected_students_list = job.selected_students or []

                is_applied = student_id in applied_students_list
                is_eligible = student_id in eligible_students_list
                is_selected = student_id in selected_students_list

                if is_applied:
                    total_jobs_applied += 1
                    if job_drive_id_str:
                        applied_drive_ids.add(job_drive_id_str)

                if is_eligible:
                    total_jobs_eligible += 1

                if is_selected:
                    total_jobs_selected += 1
                    company: Optional[Company] = None
                    if job_company_id_str:
                        # ASSUMPTION: company_mgr has get_company_by_id
                        company = await company_mgr.get_company(job_company_id_str)

                    placements.append(
                        PlacementDetail(
                            job_id=job_id_str or "Unknown Job ID",
                            job_title=job.title, # Access directly from Job model
                            company_id=job_company_id_str or "Unknown Company ID",
                            company_name=company.name if company else "Unknown Company",
                            salary=job.salary # Access directly from Job model
                        )
                    )

            # 5. Calculate Ratios
            eligibility_rate = (total_jobs_eligible / total_jobs_applied) if total_jobs_applied > 0 else 0.0
            selection_rate = (total_jobs_selected / total_jobs_eligible) if total_jobs_eligible > 0 else 0.0
            placement_rate = (total_jobs_selected / total_jobs_applied) if total_jobs_applied > 0 else 0.0

            # 6. Construct the result object
            analysis_result = StudentAnalysisResult(
                student_id=student_id,
                total_drives_applied=len(applied_drive_ids),
                total_jobs_applied=total_jobs_applied,
                total_jobs_eligible=total_jobs_eligible,
                total_jobs_selected=total_jobs_selected,
                overall_eligibility_rate=eligibility_rate,
                overall_selection_rate=selection_rate,
                overall_placement_rate=placement_rate,
                placements=placements
            )

            return analysis_result

        except HTTPException as http_exc:
            # Re-raise HTTP exceptions directly
            raise http_exc
        except Exception as e:
            # Log unexpected errors and raise a generic 500
            logging.error(f"Unexpected error calculating student analysis for {student_id}: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An internal error occurred during analysis: {str(e)}"
            )

    # --- REMOVED get_jobs_by_student_interaction ---
    # --- REMOVED get_jobs_by_company ---

    # --- Placeholder for Company Analysis ---
    async def calculate_company_analysis(self, company_id: str): # -> CompanyAnalysisResult:
        try:
            # company = await company_mgr.get_company_by_id(company_id)
            # if not company: raise HTTPException(status_code=404, detail="Company not found")
            # company_jobs = await job_mgr.get_job_by_company(company_id) # Use correct method name
            # ... implementation ...
            pass
        except HTTPException as http_exc:
             raise http_exc
        except Exception as e:
             logging.error(f"Error calculating company analysis for {company_id}: {str(e)}", exc_info=True)
             raise HTTPException(status_code=500, detail="Internal error during company analysis.")


    # --- Placeholder for Drive Analysis ---
    async def calculate_drive_analysis(self, drive_id: str):
        try:
            # drive = await drive_mgr.get_drive(drive_id) # Assuming method name
            # if not drive: raise HTTPException(status_code=404, detail="Drive not found")
            # drive_jobs = await job_mgr.get_job_by_drive(drive_id) # Use correct method name
            # ... implementation ...
            pass
        except HTTPException as http_exc:
             raise http_exc
        except Exception as e:
             logging.error(f"Error calculating drive analysis for {drive_id}: {str(e)}", exc_info=True)
             raise HTTPException(status_code=500, detail="Internal error during drive analysis.")


# Instantiate the service globally
analysis_mgr = AnalysisService()