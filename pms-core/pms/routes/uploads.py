from fastapi import FastAPI, HTTPException, APIRouter, UploadFile, File
from fastapi.responses import FileResponse
import os
import shutil
from pms.core.config import config
from datetime import datetime

router = APIRouter()

@router.get("/files/{filename}")
async def get_file(filename: str):
    file_path = os.path.join(config.UPLOAD_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path)

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(config.UPLOAD_DIR, file.filename)

    # Prevent overwriting
    if os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="File already exists")

    # Save the uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"filename": file.filename, "path": file_path}

@router.post("/student/{student_id}/job_applications")
async def upload_job_application_resume(student_id: str, file: UploadFile = File(...)):
    # Create student-specific directory if it doesn't exist
    student_dir = os.path.join(config.UPLOAD_DIR, student_id, "job_applications")
    os.makedirs(student_dir, exist_ok=True)

    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"resume_{timestamp}{file_ext}"
    file_path = os.path.join(student_dir, filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Return relative path for storage in database
    relative_path = f"/uploads/{student_id}/job_applications/{filename}"
    return {"filepath": relative_path}
