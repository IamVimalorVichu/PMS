from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from datetime import datetime
from pms.models.resume import Resume, ResumeUpdate
from pms.services.resume_services import resume_mgr

router = APIRouter()

@router.post("/create/{student_id}")
async def create_resume(student_id: str, resume: Resume):
    try:
        # Set the student_id before creating
        resume.student_id = student_id
        result = await resume_mgr.create_resume(resume)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{resume_id}")
async def get_resume(resume_id: str):
    try:
        resume = await resume_mgr.get_resume(resume_id)
        return resume
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/student/{student_id}")
async def get_student_resumes(student_id: str):
    try:
        resumes = await resume_mgr.get_resumes_by_student(student_id)
        return resumes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.patch("/update/{resume_id}")
async def update_resume(resume_id: str, resume: ResumeUpdate):
    try:
        updated_resume = await resume_mgr.update_resume(resume_id, resume)
        return updated_resume
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{resume_id}")
async def delete_resume(resume_id: str):
    try:
        result = await resume_mgr.delete_resume(resume_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/download/{resume_id}")
async def download_resume(resume_id: str):
    try:
        pdf_buffer = await resume_mgr.generate_resume_pdf(resume_id)
        filename = f"resume_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
