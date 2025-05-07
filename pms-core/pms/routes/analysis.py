# pms/routes/analysis.py

from fastapi import APIRouter, Depends, HTTPException, status, Path
from typing import List

# Import the manager instance initialized in main.py
# Adjust the import path based on where analysis_mgr is defined/accessible
# Usually, you might have a central place or access it via app state if needed,
# but if it's globally accessible after initialization, this might work:
from pms.services.analysis_services import analysis_mgr
from pms.models.analysis import StudentAnalysisResult # Import other result models as needed

router = APIRouter()

@router.get(
    "/students/{student_id}",
    response_model=StudentAnalysisResult,
    summary="Get Performance Analysis for a Single Student",
    # Removed tags here as they are defined in main.py when including the router
)
async def get_student_analysis(
    student_id: str = Path(..., description="The MongoDB _id of the student"),
    # analysis_service: AnalysisService = Depends(AnalysisService), # REMOVED Depends
):
    """
    Retrieves calculated performance metrics for a specific student based on
    their interactions with job drives and placements.
    """
    # --- Access the service via the manager instance ---
    analysis_service = analysis_mgr # Use the initialized manager

    # Permission check example (if you pass requesting_user_id as a query param)
    # async def get_student_analysis(
    #     student_id: str = Path(...),
    #     requesting_user_id: Optional[str] = Query(None), # Example param
    #     requesting_user_role: Optional[str] = Query(None) # Example param
    # ):
    #     # !! INSECURE - DO NOT RELY ON THIS ALONE IN PRODUCTION !!
    #     if requesting_user_role != 'admin' and requesting_user_id != student_id:
    #          raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    #     # !! ------------------------------------------------- !!

    try:
        # Call the method on the service instance obtained from the manager
        analysis_data = await analysis_service.calculate_student_analysis(student_id)
        return analysis_data
    except HTTPException as e:
        # Re-raise specific HTTP exceptions (like 404 Not Found from service)
        raise e
    except Exception as e:
        # Catch unexpected errors
        print(f"Error calculating student analysis for {student_id}: {e}") # Replace with proper logging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while calculating student analysis."
        )

# --- Placeholder for Company Analysis Endpoint ---
@router.get(
    "/companies/{company_id}",
    # response_model=CompanyAnalysisResult, # Add when implemented
    summary="Get Performance Analysis for a Single Company",
)
async def get_company_analysis(
    company_id: str = Path(..., description="The MongoDB _id of the company"),
    # analysis_service: AnalysisService = Depends(AnalysisService), # REMOVED Depends
):
    """
    Retrieves calculated performance metrics for a specific company based on
    its hiring activities and student interactions.
    (Not Yet Implemented)
    """
    # --- Access the service via the manager instance ---
    analysis_service = analysis_mgr # Use the initialized manager

    # TODO: Implement call to company analysis method when ready
    # analysis_data = await analysis_service.calculate_company_analysis(company_id)
    # return analysis_data
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Company analysis endpoint not yet implemented.")


# --- Placeholder for Overall Analysis Endpoint (Optional) ---
# @router.get("/summary") # Path relative to prefix "/analysis"
# async def get_overall_analysis_summary():
#     analysis_service = analysis_mgr
#     # ... implementation ...
#     raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED)