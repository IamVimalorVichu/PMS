from fastapi import FastAPI, HTTPException, status, APIRouter
from pms.models.drive import Drive, DriveUpdate
from pymongo import ReturnDocument
from typing import List
from bson import ObjectId
from pms.services.drive_services import drive_mgr

router = APIRouter()

@router.get("/get", response_model=List[Drive])
async def get_drives():
    try:
        drives= await drive_mgr.get_drives()
        return drives
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )
@router.get("/get/{drive_id}", response_model=Drive)
async def get_drive(drive_id: str):
    try:
        drive = await drive_mgr.get_drive(drive_id)
        return drive
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )
    
@router.post("/add")
async def add_drive(drive: Drive):
    try:
        drive = await drive_mgr.add_drive(drive)
        return drive
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding drive: {str(e)}"
        )
    
@router.patch("/update/{drive_id}")
async def update_drive(drive_id: str, drive: DriveUpdate):
    try:
        drive = await drive_mgr.update_drive(drive_id, drive)
        return drive
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating drive: {str(e)}"
        )

@router.delete("/delete/{drive_id}")
async def delete_drive(drive_id: str):
    try:
        drive = await drive_mgr.delete_drive(drive_id)
        return drive
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting drive: {str(e)}"
        )

@router.post("/apply/{drive_id}/{student_id}")
async def apply_to_drive(drive_id: str, student_id: str):
    try:
        result = await drive_mgr.apply_to_drive(drive_id, student_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error applying to drive: {str(e)}"
        )
    
@router.patch("/publish/{drive_id}")
async def publish_drive(drive_id:str):
    try:
        response = await drive_mgr.publish_drive(drive_id)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error Publishing Drive: {str(e)}"
        )

@router.get("/{drive_id}/stages")
async def get_drive_stages(drive_id: str):
    """
    Get aggregated stages for all jobs under this drive.
    """
    try:
        drive = await drive_mgr.get_drive(drive_id)
        return {
            "status": "success",
            "data": {
                "stage_students": drive.get("stage_students", []),
                "stage_counts": [len(stage) for stage in drive.get("stage_students", [])]
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
