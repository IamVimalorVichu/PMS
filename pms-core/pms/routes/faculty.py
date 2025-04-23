from fastapi import FastAPI, HTTPException, status, APIRouter
from pms.models.faculty import Faculty, FacultyUpdate
from pms.services.faculty_services import faculty_mgr
from typing import List


router = APIRouter()

@router.post("/add")
async def add_faculty(faculty: Faculty):
    try:
        faculty = await faculty_mgr.add_faculty(faculty)
        return faculty
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding faculty: {str(e)}"
        )
    
@router.get("/get", response_model=List[Faculty])
async def get_faculties():
    try:
        faculties = await faculty_mgr.get_faculties()
        return faculties
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.get("/get/{faculty_id}", response_model=Faculty)
async def get_faculty(faculty_id: str):
    try:
        faculty = await faculty_mgr.get_faculty(faculty_id)
        return faculty
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.get("/get-user/{user_id}", response_model=Faculty)
async def get_faculty_by_user_id(user_id: str):
    try:
        faculty = await faculty_mgr.get_faculty_by_user_id(user_id)
        return faculty
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.patch("/update/{faculty_id}")
async def update_faculty(faculty_id: str, faculty: FacultyUpdate):
    try:
        faculty = await faculty_mgr.update_faculty(faculty_id, faculty)
        return faculty
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating faculty: {str(e)}"
        )

@router.delete("/delete/{faculty_id}")
async def delete_faculty(faculty_id: str):
    try:
        faculty = await faculty_mgr.delete_faculty(faculty_id)
        return faculty
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting faculty: {str(e)}"
        )