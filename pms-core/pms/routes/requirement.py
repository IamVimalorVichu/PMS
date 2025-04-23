from fastapi import FastAPI, HTTPException, status, APIRouter
from pms.models.requirement import Requirement, RequirementUpdate
from pymongo import ReturnDocument
from typing import List
from bson import ObjectId
from pms.services.requirement_services import requirement_mgr

router = APIRouter()

@router.get("/get", response_model=List[Requirement])
async def get_requirements():
    try:
        requirements = await requirement_mgr.get_requirements()
        return requirements
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.get("/get/{requirement_id}", response_model=Requirement)
async def get_requirement(requirement_id: str):
    try:
        requirement = await requirement_mgr.get_requirement(requirement_id)
        return requirement
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.get("/get/job/{job_id}", response_model=List[Requirement])
async def get_requirement_by_job(job_id: str):
    try:
        requirements = await requirement_mgr.get_requirement_by_job(job_id)
        return requirements
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.post("/add/{job_id}")
async def add_requirement(requirement: Requirement, job_id: str):
    try:
        requirement = await requirement_mgr.add_requirement(requirement, job_id)
        return requirement
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding requirement: {str(e)}"
        )

@router.patch("/update/{requirement_id}")
async def update_requirement(requirement_id: str, requirement: RequirementUpdate):
    try:
        requirement = await requirement_mgr.update_requirement(requirement_id, requirement)
        return requirement
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating requirement: {str(e)}"
        )

@router.patch("/update/job/{job_id}")
async def update_requirement_by_job(job_id: str, requirement: RequirementUpdate):
    try:
        requirement = await requirement_mgr.update_requirement_by_job(job_id, requirement)
        return requirement
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating requirement: {str(e)}"
        )

@router.delete("/delete/{requirement_id}")
async def delete_requirement(requirement_id: str):
    try:
        requirement = await requirement_mgr.delete_requirement(requirement_id)
        return requirement
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting requirement: {str(e)}"
        )

@router.delete("/delete/job/{job_id}")
async def delete_requirement_by_job(job_id: str):
    try:
        requirement = await requirement_mgr.delete_requirement_by_job(job_id)
        return requirement
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting requirement: {str(e)}"
        )