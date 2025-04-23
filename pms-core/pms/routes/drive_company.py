from fastapi import FastAPI, HTTPException, status, APIRouter
from pms.models.drivecompany import DriveCompany
from pms.services.drivecompany_services import drive_company_mgr

router = APIRouter()

@router.get("/get")
async def get_drive_companies():
    try:
        drive_companies = await drive_company_mgr.get_drive_companies()
        return drive_companies
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )
@router.get("/get/drive/{drive_id}")
async def get_drive_companies_by_drive(drive_id: str):
    try:
        drive_companies = await drive_company_mgr.get_drive_companies_by_drive(drive_id)
        return drive_companies
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.get("/get/company/{company_id}")
async def get_drive_companies_by_company(company_id: str):
    try:
        drive_companies = await drive_company_mgr.get_drive_companies_by_company(company_id)
        return drive_companies
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching data: {str(e)}"
        )

@router.post("/add/{drive_id}/{company_id}")
async def add_drive_company(drive_id: str, company_id: str):
    try:
        drive_company = await drive_company_mgr.add_drive_company(drive_id, company_id)
        return drive_company
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding drive company: {str(e)}"
        )
@router.patch("/update/drive_company_id")
async def update_drive_company(drive_company_id: str, drive_company: DriveCompany):
    try:
        drive_company = await drive_company_mgr.update_drive_company(drive_company_id, drive_company)
        return drive_company
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating drive company: {str(e)}"
        )
@router.delete("/delete/{drive_company_id}")
async def delete_drive_company(drive_company_id: str):
    try:
        drive_company = await drive_company_mgr.delete_drive_company(drive_company_id)
        return drive_company
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting drive company: {str(e)}"
        )
@router.delete("/delete/drive/{drive_id}")
async def delete_drive_company_by_drive(drive_id: str):
    try:
        drive_company = await drive_company_mgr.delete_drive_company_by_drive(drive_id)
        return drive_company
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting drive companies: {str(e)}"
        )
@router.delete("/delete/company/{company_id}")
async def delete_drive_company_by_company(company_id: str):
    try:
        drive_company = await drive_company_mgr.delete_drive_company_by_company(company_id)
        return drive_company
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting drive companies: {str(e)}"
        )
    

    