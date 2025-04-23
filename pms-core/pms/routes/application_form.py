from fastapi import APIRouter, HTTPException, status
from typing import List, Optional

from pms.models.application_form import ApplicationForm, ApplicationFormUpdate
from pms.services.application_form_services import application_form_mgr

router = APIRouter()

@router.get("/", response_model=List[ApplicationForm])
async def get_applications():
    """Get all application forms"""
    try:
        return await application_form_mgr.get_applications()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{application_id}", response_model=ApplicationForm)
async def get_application(application_id: str):
    """Get a specific application by ID"""
    try:
        return await application_form_mgr.get_application(application_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/drive/{drive_id}", response_model=List[ApplicationForm])
async def get_applications_by_drive(drive_id: str):
    """Get all applications for a specific drive"""
    try:
        return await application_form_mgr.get_applications_by_drive(drive_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/job/{job_id}", response_model=List[ApplicationForm])
async def get_applications_by_job(job_id: str):
    """Get all applications for a specific job"""
    try:
        return await application_form_mgr.get_applications_by_job(job_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/student/{student_id}", response_model=List[ApplicationForm])
async def get_student_applications(student_id: str):
    """Get all applications submitted by a specific student"""
    try:
        return await application_form_mgr.get_student_applications(student_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
@router.get("/student/{student_id}/drive/{drive_id}/job/{job_id}", response_model=Optional[ApplicationForm])
async def get_student_application_by_drive_and_job(student_id: str, drive_id: str, job_id: str):
    """Get all applications submitted by a specific student for a specific drive and job"""
    try:
        return await application_form_mgr.get_student_application_by_drive_and_job(student_id, drive_id, job_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/submit/{student_id}", response_model=ApplicationForm)
async def submit_application(student_id: str, application: ApplicationForm):
    """Submit a new application"""
    try:
        return await application_form_mgr.create_application(student_id, application)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{application_id}")
async def delete_application(application_id: str):
    """Delete an application"""
    try:
        return await application_form_mgr.delete_application(application_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


"""
id='string' drive_id='string' job_id='string' student_id='string' first_name='string'
middle_name='string' last_name='string' address='string' city='string' state='string' 
district='string' adm_no='string' reg_no='string' gender='string' email='user@example.com' 
alt_email='user@example.com' ph_no='string' alt_ph='string' program='string' 
student_status='string' tenth_cgpa='string' twelfth_cgpa='string' degree_cgpa='string' 
mca_cgpa='string' skills='string' current_status='string' mca_percentage='string' 
linkedin_url='string' 
additional_answers={'additionalProp1': 'string', 'additionalProp2': 'string', 'additionalProp3': 'string'} submitted_at=datetime.datetime(2025, 4, 21, 1, 44, 1, 187000, tzinfo=TzInfo(UTC)) updated_at=datetime.datetime(2025, 4, 21, 1, 44, 1, 187000, tzinfo=TzInfo(UTC))
INFO:     157.46.11.167:0 - "POST /applications-form/submit/67dfe87c9d71e4b80fb540b5 HTTP/1.1" 200 OK
"""