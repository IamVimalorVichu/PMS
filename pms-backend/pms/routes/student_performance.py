from datetime import datetime
import os
from fastapi import FastAPI, HTTPException, status, APIRouter, UploadFile, File, Form, Body
from pms.models.student_performance import StudentPerformance
from pymongo import ReturnDocument
from typing import List, Optional
from bson import ObjectId
from pms.services.student_performance_services import student_performance_mgr
from pms.services.file_services import file_service
import json
import mimetypes

ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

router = APIRouter()

@router.post("/add")
async def add_student_performance(
    performance_data: str,  # Accept performance_data as a string
    certification_files: List[UploadFile] = File(None),
    job_application_files: List[UploadFile] = File(None)
):
    try:
        # Parse the performance data
        performance_dict = json.loads(performance_data)
        
        # Handle certification files if provided
        if certification_files:
            if len(certification_files) > 10:
                raise HTTPException(status_code=400, detail="Maximum 10 certification files allowed")
            
            cert_file_infos = []
            for file in certification_files:
                if file.content_type not in ALLOWED_MIME_TYPES:
                    raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}")
                if len(await file.read()) > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail=f"File too large: {file.filename}")
                await file.seek(0)
                
                file_info = await file_service.save_file(file)
                cert_file_infos.append({
                    "filename": file_info["filename"],
                    "filepath": file_info["filepath"],
                    "file_size": file_info.get("size"),
                    "mime_type": file.content_type
                })
            performance_dict["certification_files"] = cert_file_infos
            
        # Handle job application files if provided
        if job_application_files:
            if len(job_application_files) > 10:
                raise HTTPException(status_code=400, detail="Maximum 10 job application files allowed")
            
            job_file_infos = []
            for file in job_application_files:
                if file.content_type not in ALLOWED_MIME_TYPES:
                    raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}")
                if len(await file.read()) > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail=f"File too large: {file.filename}")
                await file.seek(0)
                
                file_info = await file_service.save_file(file)
                job_file_infos.append({
                    "filename": file_info["filename"],
                    "filepath": file_info["filepath"],
                    "file_size": file_info.get("size"),
                    "mime_type": file.content_type
                })
            performance_dict["job_application_files"] = job_file_infos
        
        student_performance = StudentPerformance(**performance_dict)
        return await student_performance_mgr.add_student_performance(student_performance)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing request: {str(e)}"
        )

@router.get("/get", response_model=List[StudentPerformance])
async def get_student_performances():
    try:
        return await student_performance_mgr.get_all_student_performances()   
    except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error fetching whole student performances: {str(e)}"
            )


@router.get("/get/{student_id}", response_model=StudentPerformance)
async def get_student_performance(student_id: str):
    try:
        return await student_performance_mgr.get_student_performance(student_id)
    except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error fetching student perofrmance of {student_id} {str(e)}"
            )

@router.patch("/update/{student_id}")
async def update_student_performance(
    student_id: str,
    performance_data: str = Form(...),
    certification_files: List[UploadFile] = File(None),
    job_application_files: List[UploadFile] = File(None)
):
    try:
        # Parse the performance data
        performance_dict = json.loads(performance_data)
        
        if '_id' in performance_dict:
            del performance_dict['_id']
        
        # Fetch the existing student performance data
        existing_performance = await student_performance_mgr.get_student_performances(student_id)
        if not existing_performance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student performance record not found"
            )
        
        # Since existing_performance is already a dict, we can merge directly
        updated_performance_dict = {**existing_performance, **performance_dict}
        
        # Handle certification files if provided
        if certification_files:
            if len(certification_files) > 10:
                raise HTTPException(status_code=400, detail="Maximum 10 certification files allowed")
            
            cert_file_infos = []
            for file in certification_files:
                if file.content_type not in ALLOWED_MIME_TYPES:
                    raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}")
                if len(await file.read()) > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail=f"File too large: {file.filename}")
                await file.seek(0)
                
                file_info = await file_service.save_file(file)
                cert_file_infos.append({
                    "filename": file_info["filename"],
                    "filepath": file_info["filepath"],
                    "file_size": file_info.get("size"),
                    "mime_type": file.content_type
                })
            updated_performance_dict["certification_files"] = cert_file_infos
            
        # Handle job application files if provided
        if job_application_files:
            if len(job_application_files) > 10:
                raise HTTPException(status_code=400, detail="Maximum 10 job application files allowed")
            
            job_file_infos = []
            for file in job_application_files:
                if file.content_type not in ALLOWED_MIME_TYPES:
                    raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}")
                if len(await file.read()) > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail=f"File too large: {file.filename}")
                await file.seek(0)
                
                file_info = await file_service.save_file(file)
                job_file_infos.append({
                    "filename": file_info["filename"],
                    "filepath": file_info["filepath"],
                    "file_size": file_info.get("size"),
                    "mime_type": file.content_type
                })
            updated_performance_dict["job_application_files"] = job_file_infos
        
        # Create a StudentPerformance object with the merged data
        updated_student_performance = StudentPerformance(**updated_performance_dict)
        result =  await student_performance_mgr.update_student_performance(student_id, updated_student_performance)
        if result:
            return result
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update student performance"
            )
            
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON in performance_data"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing request: {str(e)}"
        )


@router.post("/upload-documents")
async def upload_documents(
    files: List[UploadFile] = File(...),
    type: str = Form(...),
    student_id: str = Form(...)
):
    try:
        uploaded_files = []
        upload_dir = os.path.join(os.getcwd(), "uploads")
        
        # Create uploads directory if it doesn't exist
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
        
        for file in files:
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_{file.filename}"
            filepath = os.path.join(upload_dir, filename)
            
            # Save file
            with open(filepath, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            uploaded_files.append({
                "filename": file.filename,
                "filepath": filename
            })
        
        # Update student performance record
        student_performance = await student_performance_mgr.get_student_performances(student_id)
        
        if type == "certification":
            if not student_performance.get("certification_files"):
                student_performance["certification_files"] = []
            student_performance["certification_files"].extend(uploaded_files)
        else:
            if not student_performance.get("job_application_files"):
                student_performance["job_application_files"] = []
            student_performance["job_application_files"].extend(uploaded_files)
        
        await student_performance_mgr.update_student_performance(
            student_id, 
            StudentPerformance(**student_performance)
        )
        
        return {"message": "Files uploaded successfully", "files": uploaded_files}
    
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Upload directory not found")
    
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid file type or size")
    
    except ValueError as ve:
        if isinstance(ve, json.JSONDecodeError):
            raise HTTPException(status_code=400, detail="Invalid JSON in performance_data")
        raise HTTPException(status_code=400, detail="Invalid input data")
    except HTTPException as http_exc:
        raise http_exc
    except TypeError:
        raise HTTPException(status_code=400, detail="Invalid file type")
    except OSError as os_error:
        if isinstance(os_error, PermissionError):
            raise HTTPException(status_code=403, detail="Permission denied")
        raise HTTPException(status_code=500, detail="Error saving file")
    except KeyError:
        raise HTTPException(status_code=400, detail="Missing required fields")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Add this new endpoint
@router.delete("/documents")
async def delete_document(
    filepath: str = Body(...),
    type: str = Body(...),
    student_id: str = Body(...)
):
    try:
        # Get student performance record
        student_performance = await student_performance_mgr.get_student_performances(student_id)
        if not student_performance:
            raise HTTPException(status_code=404, detail="Student performance not found")

        # Remove file from filesystem
        file_path = os.path.join(os.getcwd(), "uploads", filepath)
        if os.path.exists(file_path):
            os.remove(file_path)

        # Remove file from database
        if type == "certification":
            student_performance["certification_files"] = [
                f for f in student_performance["certification_files"] 
                if f["filepath"] != filepath
            ]
        else:
            student_performance["job_application_files"] = [
                f for f in student_performance["job_application_files"] 
                if f["filepath"] != filepath
            ]

        # Update database
        await student_performance_mgr.update_student_performance(
            student_id,
            StudentPerformance(**student_performance)
        )

        return {"message": "File deleted successfully"}

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))