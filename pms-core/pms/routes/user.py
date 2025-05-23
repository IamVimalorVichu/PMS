from urllib import response
from fastapi import FastAPI, HTTPException, status, APIRouter
from fastapi.params import Query
from pms.models.user import User, UserBasicInfo, UserUpdate
from pms.services.user_services import user_mgr
from pymongo import ReturnDocument
from typing import List, Optional
from bson import ObjectId
from pydantic import BaseModel


router = APIRouter()

# Add this class for request validation
class PasswordResetRequest(BaseModel):
    email: str
    password: str


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
            detail=f"{str(e)}"
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

@router.get("/search/{user_id}", response_model=List[UserBasicInfo])
async def search_for_users(
    user_id: str, # Current user ID passed in path
    q: Optional[str] = Query(None, min_length=2, max_length=50), # Search query param
    limit: int = Query(default=10, le=25) # Limit results
):
    """
    Searches for active users by name, username, or email, excluding the current user.
    Requires a query parameter 'q' with min 2 characters.
    """
    if q is None:
        # Return empty list or bad request if query is missing
        # raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Search query 'q' is required.")
        return [] # Return empty list if no query

    try:
        users = await user_mgr.search_users(query=q, current_user_id=user_id, limit=limit)
        return users
    except Exception as e:
        # Log the exception e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching users: {str(e)}"
        )
    
@router.patch("/reset-password")
async def reset_password(reset_data: PasswordResetRequest):
    try:
        print(f"Resetting password for {reset_data.email}")
        print(f"New password: {reset_data.password}")
        result = await user_mgr.reset_password(reset_data.email, reset_data.password)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error resetting password: {str(e)}"
        )