from fastapi import FastAPI, HTTPException, status, APIRouter
from pms.models.alumni import Alumni, AlumniUpdate
from pms.services.alumni_services import alumni_mgr
from typing import List

router = APIRouter()

@router.post("/add")
async def add_alumni(alumni: Alumni):
    try:
        alumni = await alumni_mgr.add_alumni(alumni)
        return alumni
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding alumni: {str(e)}"
        )
    
@router.get("/get", response_model=List[Alumni])
async def get_alumni_list():
    try:
        alumni = await alumni_mgr.get_alumni_list()
        return alumni
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )
    
@router.get("/get/{alumni_id}", response_model=Alumni)
async def get_alumni(alumni_id: str):
    try:
        alumni = await alumni_mgr.get_alumni(alumni_id)
        return alumni
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.get("/get-user/{user_id}", response_model=Alumni)
async def get_alumni_by_user_id(user_id: str):
    try:
        alumni = await alumni_mgr.get_alumni_by_user_id(user_id)
        return alumni
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.patch("/update/{alumni_id}")
async def update_alumni(alumni_id: str, alumni: AlumniUpdate):
    try:
        alumni = await alumni_mgr.update_alumni(alumni_id, alumni)
        return alumni
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating alumni: {str(e)}"
        )

@router.delete("/delete/{alumni_id}")
async def delete_alumni(alumni_id: str):
    try:
        alumni = await alumni_mgr.delete_alumni(alumni_id)
        return alumni
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting alumni: {str(e)}"
        )
