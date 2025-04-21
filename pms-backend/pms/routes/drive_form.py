from fastapi import APIRouter, HTTPException, status
from typing import List

from pms.models.drive_form import DriveForm, DriveFormUpdate
from pms.services.drive_form_services import drive_form_mgr

router = APIRouter()

@router.get("/", response_model=List[DriveForm])
async def get_drive_forms():
    """Get all drive forms"""
    try:
        return await drive_form_mgr.get_drive_forms()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{form_id}", response_model=DriveForm)
async def get_drive_form(form_id: str):
    """Get a specific drive form by ID"""
    try:
        return await drive_form_mgr.get_drive_form(form_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/drive/{drive_id}", response_model=DriveForm)
async def get_form_by_drive(drive_id: str):
    """Get drive form by drive ID or return new template if none exists"""
    try:
        form = await drive_form_mgr.get_form_by_drive(drive_id)
        # No need to check if form exists since service now returns default template
        return form
    except Exception as e:
        if "not found" in str(e).lower():
            # If it's specifically a not found error, return 404
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No form template found for drive {drive_id}"
            )
        # For other errors, return 500
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/create/{drive_id}", response_model=DriveForm)
async def create_drive_form(drive_id:str, form: DriveForm):
    """Create a new drive form"""
    try:
        return await drive_form_mgr.create_drive_form(drive_id, form)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.patch("/{drive_id}/update", response_model=DriveForm)  # Changed from DriveFormUpdate
async def update_drive_form(drive_id: str, form: DriveFormUpdate):
    """Update an existing drive form"""
    try:
        return await drive_form_mgr.update_drive_form(drive_id, form)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{form_id}")
async def delete_drive_form(form_id: str):
    """Delete a drive form by ID"""
    try:
        return await drive_form_mgr.delete_drive_form(form_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/drive/{drive_id}")
async def delete_form_by_drive(drive_id: str):
    """Delete all forms for a specific drive"""
    try:
        return await drive_form_mgr.delete_form_by_drive(drive_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )