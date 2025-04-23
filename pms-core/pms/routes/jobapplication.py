from fastapi import APIRouter, HTTPException, status
from typing import List
from pms.models.jobapplication import JobApplication
from pms.services.jobapplication_services import jobapplication_mgr

router = APIRouter()

@router.get("/get", response_model=List[JobApplication])
async def get_jobapplications():
    try:
        applications = await jobapplication_mgr.get_jobapplications()
        return applications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.get("/get/{application_id}", response_model=JobApplication)
async def get_jobapplication(application_id: str):
    try:
        application = await jobapplication_mgr.get_jobapplication(application_id)
        return application
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.get("/get/student/{student_id}", response_model=List[JobApplication])
async def get_jobapplications_by_student(student_id: str):
    try:
        applications = await jobapplication_mgr.get_jobapplications_by_student(student_id)
        return applications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.get("/get/job/{job_id}", response_model=List[JobApplication])
async def get_jobapplications_by_job(job_id: str):
    try:
        applications = await jobapplication_mgr.get_jobapplications_by_job(job_id)
        return applications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )
@router.get("/job-student/{job_id}/{student_id}", response_model=JobApplication)
async def get_jobapplication_by_job_and_student(job_id: str, student_id: str):
    try:
        application = await jobapplication_mgr.get_jobapplication_by_job_and_student(job_id, student_id)
        return application
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.post("/add")
async def add_jobapplication(application: JobApplication):
    try:
        application = await jobapplication_mgr.add_jobapplication(application)
        return application
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding job application: {str(e)}"
        )

@router.patch("/update/{application_id}/status/{status}")
async def update_jobapplication_status(application_id: str, status: str):
    try:
        application = await jobapplication_mgr.update_jobapplication_status(application_id, status)
        return application
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating job application: {str(e)}"
        )

@router.delete("/delete/{application_id}")
async def delete_jobapplication(application_id: str):
    try:
        application = await jobapplication_mgr.delete_jobapplication(application_id)
        return application
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting job application: {str(e)}"
        )
