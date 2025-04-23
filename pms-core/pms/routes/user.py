from urllib import response
from fastapi import FastAPI, HTTPException, status, APIRouter
from pms.models.user import User, UserUpdate
from pms.services.user_services import user_mgr
from pymongo import ReturnDocument
from typing import List
from bson import ObjectId


router = APIRouter()


@router.get("/get", response_model=List[User])
async def get_users():
    try:
        users = await user_mgr.get_users()
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.post("/add")
async def add_user(user: User):
    try:
        user = await user_mgr.add_user(user)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding user: {str(e)}"
        )
    
@router.get("/get/{user_id}", response_model=User)
async def get_user(user_id: str):
    try:
        user = await user_mgr.get_user(user_id)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.patch("/update/{user_id}")
async def update_user(user_id: str, user: UserUpdate):
    try:
        user = await user_mgr.update_user(user_id, user)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )
    
@router.delete("/delete/{user_id}")
async def delete_user(user_id: str):
    try:
        user = await user_mgr.delete_user(user_id)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user: {str(e)}"
        )