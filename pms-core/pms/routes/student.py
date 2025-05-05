from fastapi import Body, FastAPI, HTTPException, status, APIRouter, Request
from pms.models.student import Student, StudentUpdate
from pms.models.drive import Drive
from pms.services.student_services import student_mgr
from pms.utils.form_prefill import prefill_mgr
from typing import List

router = APIRouter()

@router.post("/add")
async def add_student(student: Student):
    try:
        student = await student_mgr.add_student(student)
        return student
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"{str(e)}"
        )
    
@router.get("/get", response_model=List[Student])
async def get_students():
    try:
        students = await student_mgr.get_students()
        return students
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )
    
@router.get("/get/{student_id}", response_model=Student)
async def get_student(student_id: str):
    try:
        student = await student_mgr.get_student(student_id)
        return student
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )
@router.get("/get-user/{user_id}", response_model=Student)
async def get_student_by_user_id(user_id: str):
    try:
        student = await student_mgr.get_student_by_user_id(user_id)
        return student
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )
@router.patch("/update/{student_id}")
async def update_student(student_id: str, student: StudentUpdate):
    try:
        student = await student_mgr.update_student(student_id, student)
        return student
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"{str(e)}"
        )
@router.delete("/delete/{student_id}")
async def delete_student(student_id: str):
    try:
        student = await student_mgr.delete_student(student_id)
        return student
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting student: {str(e)}"
        )

@router.post("/prefill-form")
async def prefill_form(request: Request):
    try:
        data = await request.json()
        form_url = data.get("formUrl")
        user_data = data.get("userData")

        if not form_url or not user_data:
            raise HTTPException(status_code=400, detail="Missing form URL or user data")

        # Format user data for the prefiller
        formatted_data = {
            "Full Name": f"{user_data.get('firstname', '')} {user_data.get('lastname', '')}".strip(),
            "Email": user_data.get("email"),
            "Phone Number": user_data.get("phoneNumber"),
            "Registration Number": user_data.get("registerNumber"),
            "Department": user_data.get("department"),
            "Program": user_data.get("program"),
            "Semester": user_data.get("semester"),
            "SSLC CGPA": user_data.get("tenth_cgpa"),
            "Plus Two CGPA": user_data.get("twelfth_cgpa"),
            "Degree CGPA": user_data.get("mca_cgpa")[0] if user_data.get("mca_cgpa") else None,
            "Skills": ", ".join(user_data.get("skills", [])),
            "LinkedIn": user_data.get("linkedin_url"),
            "Current Status": user_data.get("current_status")
        }

        prefilled_url = prefill_mgr.process_form(form_url, formatted_data)
        
        if not prefilled_url:
            return {"prefilledUrl": form_url}  # Fallback to original URL

        return {"prefilledUrl": prefilled_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get/students-by-ids", response_model=List[Student])
async def get_students_by_ids_route(student_ids: List[str] = Body(..., embed=False)):

    try:
        if not student_ids:
             raise HTTPException(
                 status_code=status.HTTP_400_BAD_REQUEST,
                 detail="Student ID list cannot be empty."
             )

        students = await student_mgr.get_students_by_ids(student_ids)
        return students
    except HTTPException as http_exc: 
        raise http_exc
    except Exception as e:
        if "Invalid ObjectId format" in str(e):
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e) 
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching students by IDs: {str(e)}"
        )

@router.get("/{student_id}/get-drives", response_model=List[Drive])
async def get_student_drives(student_id: str):
    try:
        drives = await student_mgr.get_drives_for_student(student_id)
        return drives
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching drives for the student {student_id}: {str(e)}"
        )

