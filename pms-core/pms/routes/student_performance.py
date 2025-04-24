from datetime import datetime
from logging import config
import os
from fastapi import FastAPI, HTTPException, status, APIRouter, UploadFile, File, Form, Body
from pydantic import ValidationError
from pms.models.student_performance import FileInfo, StudentPerformance, StudentPerformanceUpdate
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

@router.post("/add/{student_id}")
async def add_student_performance(
    student_id: str,
    performance_data: str = Form(...),  # Change to Form parameter
    certification_files: List[UploadFile] = File(None),
    job_application_files: List[UploadFile] = File(None)
):
    try:
        # Parse the performance data from JSON string
        performance_dict = json.loads(performance_data)
        performance = StudentPerformance(**performance_dict)
        
        # Set the student_id from path parameter
        performance.student_id = student_id
        
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
                
                file_info = await file_service.save_file(
                    file, 
                    student_id=student_id, 
                    file_type="certification"
                )
                cert_file_infos.append(FileInfo(
                    filename=file_info["filename"],
                    filepath=file_info["filepath"],
                    file_size=file_info.get("size"),
                    mime_type=file.content_type
                ))
            performance.certification_files = cert_file_infos
            
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
                
                file_info = await file_service.save_file(
                    file, 
                    student_id=student_id, 
                    file_type="job_application"
                )
                job_file_infos.append(FileInfo(
                    filename=file_info["filename"],
                    filepath=file_info["filepath"],
                    file_size=file_info.get("size"),
                    mime_type=file.content_type
                ))
            performance.job_application_files = job_file_infos

        return await student_performance_mgr.add_student_performance(performance)
    
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON in performance_data"
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid performance data: {str(e)}"
        )
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

@router.patch("/update/{student_id}", response_model=StudentPerformanceUpdate) # Use appropriate response model
async def update_student_performance(
    student_id: str,
    performance_data: str = Form("{}"), # Default to empty JSON string if not provided
    certification_files: List[UploadFile] = File(None, description="New certification files to add"),
    job_application_files: List[UploadFile] = File(None, description="New job application files to add")
):
    """
    Updates student performance data and/or adds new documents.
    Uses PATCH semantics: only provided fields in performance_data are updated.
    Uploaded files are *added* to the existing lists.
    """
    try:
        # 1. Get existing performance
        existing_performance_dict = await student_performance_mgr.get_student_performance(student_id)
        if not existing_performance_dict:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student performance record not found"
            )

        # 2. Parse the performance data JSON string
        try:
            performance_update_dict = json.loads(performance_data)
            if not isinstance(performance_update_dict, dict):
                 raise ValueError("performance_data must be a JSON object")
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON format in performance_data"
            )
        except ValueError as ve:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(ve)
            )

        # 3. Create the base dictionary for the update by merging
        # Start with existing data, then overlay the explicit updates from performance_update_dict
        merged_dict = existing_performance_dict.copy()
        for key, value in performance_update_dict.items():
            # Apply PATCH logic: update if value is explicitly provided (even if None/null in JSON)
            # If you want to ignore None values from the JSON patch: `if value is not None:`
            merged_dict[key] = value

        # Ensure file lists exist for appending (use .get with default)
        merged_cert_files = [FileInfo(**f) for f in merged_dict.get("certification_files", [])]
        merged_job_files = [FileInfo(**f) for f in merged_dict.get("job_application_files", [])]

        # 4. Handle NEW certification files if provided
        if certification_files:
            if len(certification_files) + len(merged_cert_files) > 10: # Check total count
                raise HTTPException(status_code=400, detail="Cannot exceed 10 certification files in total")

            for file in certification_files:
                # Read content once for validation
                content = await file.read()
                if len(content) > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail=f"File too large: {file.filename} (Max: {MAX_FILE_SIZE // 1024 // 1024}MB)")
                if file.content_type not in ALLOWED_MIME_TYPES:
                    raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename} ({file.content_type})")
                await file.seek(0) # Reset file pointer for saving

                # Save file using the file service
                file_info_dict = await file_service.save_file(
                    file,
                    student_id=student_id,
                    file_type="certification"
                )

                # Append FileInfo object to the list
                merged_cert_files.append(FileInfo(
                    filename=file_info_dict["filename"],
                    filepath=file_info_dict["filepath"],
                    file_size=file_info_dict.get("size"),
                    mime_type=file.content_type
                ))
            # Update the merged dictionary with the new list
            merged_dict["certification_files"] = [f.model_dump() for f in merged_cert_files] # Convert back to dicts if needed by manager/DB

        # 5. Handle NEW job application files if provided
        if job_application_files:
            if len(job_application_files) + len(merged_job_files) > 10: # Check total count
                raise HTTPException(status_code=400, detail="Cannot exceed 10 job application files in total")

            for file in job_application_files:
                 # Read content once for validation
                content = await file.read()
                if len(content) > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail=f"File too large: {file.filename} (Max: {MAX_FILE_SIZE // 1024 // 1024}MB)")
                if file.content_type not in ALLOWED_MIME_TYPES:
                    raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename} ({file.content_type})")
                await file.seek(0) # Reset file pointer for saving

                # Save file using the file service
                file_info_dict = await file_service.save_file(
                    file,
                    student_id=student_id,
                    file_type="job_application"
                )

                # Append FileInfo object to the list
                merged_job_files.append(FileInfo(
                    filename=file_info_dict["filename"],
                    filepath=file_info_dict["filepath"],
                    file_size=file_info_dict.get("size"),
                    mime_type=file.content_type
                ))
             # Update the merged dictionary with the new list
            merged_dict["job_application_files"] = [f.model_dump() for f in merged_job_files] # Convert back to dicts if needed

        # 6. Create the final update model from the merged data
        # Pydantic will validate the final structure against StudentPerformanceUpdate
        # Pass only the fields that were actually intended for update
        # Create the update payload based on what changed
        update_payload_dict = {}
        # Add fields from the original JSON patch
        update_payload_dict.update(performance_update_dict)
        # Add file lists if they were modified
        if certification_files:
            update_payload_dict["certification_files"] = merged_dict["certification_files"]
        if job_application_files:
            update_payload_dict["job_application_files"] = merged_dict["job_application_files"]

        # Only proceed if there's something to update
        if not update_payload_dict:
             # Nothing changed (e.g., empty JSON and no files uploaded)
             # Return the existing record or a 200 OK with no body/message
             return existing_performance_dict # Or raise HTTPException(status_code=status.HTTP_204_NO_CONTENT)

        # Create the Pydantic model for the update operation
        performance_update_model = StudentPerformanceUpdate(**update_payload_dict)

        # 7. Call the manager to update the database
        updated_performance = await student_performance_mgr.update_student_performance(
            student_id,
            performance_update_model # Pass the Pydantic model
        )

        if updated_performance:
            return updated_performance
        else:
            # This case might happen if the update operation itself fails in the manager
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update student performance in the database"
            )

    except HTTPException as http_exc:
        # Re-raise FastAPI's HTTP exceptions
        raise http_exc
    except Exception as e:
        # Catch unexpected errors
        print(f"Unexpected error during performance update for {student_id}: {e}") # Logging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.delete("/documents", status_code=status.HTTP_200_OK)
async def delete_document(
    payload: dict = Body(...) # Expecting {"filepath": "...", "type": "...", "student_id": "..."}
):
    """
    Deletes a specific document associated with a student.
    Requires filepath (unique identifier used by file_service),
    type (certification or job_application), and student_id.
    """
    filepath = payload.get("filepath")
    doc_type = payload.get("type")
    student_id = payload.get("student_id")

    if not all([filepath, doc_type, student_id]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields: filepath, type, student_id"
        )

    if doc_type not in ["certification", "job_application"]:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document type. Must be 'certification' or 'job_application'"
        )

    try:
        # 1. Get existing performance record
        existing_performance = await student_performance_mgr.get_student_performance(student_id)
        if not existing_performance:
            raise HTTPException(status_code=404, detail="Student performance record not found")

        # 2. Determine the correct file list key
        list_key = "certification_files" if doc_type == "certification" else "job_application_files"
        current_files_list = existing_performance.get(list_key, [])

        # 3. Find the file and create the updated list
        file_found_in_db = False
        updated_files_list = []
        for file_info_dict in current_files_list:
            # Ensure comparison is robust (e.g., handle dict vs object)
            if isinstance(file_info_dict, dict) and file_info_dict.get("filepath") == filepath:
                file_found_in_db = True
            elif hasattr(file_info_dict, 'filepath') and file_info_dict.filepath == filepath: # If list contains objects
                 file_found_in_db = True
            else:
                updated_files_list.append(file_info_dict) # Keep the file

        # If file wasn't found in the student's record, raise 404
        if not file_found_in_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File with path '{filepath}' not found in student's {doc_type} documents list."
            )

        # 4. Delete the file from storage using the file service
        deleted_from_storage = await file_service.delete_file(filepath)
        if not deleted_from_storage:
            # Log this issue, but decide if you should still update the DB record.
            # It might be safer to stop here to avoid inconsistency.
            print(f"Warning: File service failed to delete file '{filepath}' from storage.")
            # Optionally raise an error:
            # raise HTTPException(
            #     status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            #     detail=f"Failed to delete file '{filepath}' from storage. Database record not updated."
            # )
            # If you proceed, the DB will be updated, but the file might remain in storage (orphan).

        # 5. Update the student record in the database with the modified list
        update_data = StudentPerformanceUpdate(**{list_key: updated_files_list})

        update_result = await student_performance_mgr.update_student_performance(
            student_id,
            update_data
        )

        if not update_result:
             # This might indicate the student record disappeared between get and update, or DB error
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update student record in database after deleting file reference."
            )

        return {"message": "File deleted successfully"}

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error deleting document {filepath} for student {student_id}: {e}") # Logging
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")