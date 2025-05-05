from datetime import datetime
from fastapi import FastAPI, HTTPException, status, APIRouter
from pms.models.company import Company, CompanyUpdate
from pms.services.company_services import company_mgr
from pymongo import ReturnDocument
from typing import List, Dict, Any
from bson import ObjectId

router = APIRouter()

@router.get("/get", response_model=List[Company])
async def get_companies():
   try:
         companies = await company_mgr.get_companies()
         return companies
   except Exception as e:
         # Check if the exception contains our structured error
         if hasattr(e, 'args') and e.args and isinstance(e.args[0], dict) and 'status' in e.args[0]:
             error_data = e.args[0]
             raise HTTPException(
                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                 detail=error_data
             )
         # Fallback for unexpected errors
         raise HTTPException(
             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
             detail=f"{str(e)}"
         )
   
@router.get("/get/{company_id}", response_model=Company)
async def get_company(company_id: str):
    try:
        company = await company_mgr.get_company(company_id)
        return company
    except Exception as e:
        # Check if the exception contains our structured error
        if hasattr(e, 'args') and e.args and isinstance(e.args[0], dict) and 'status' in e.args[0]:
            error_data = e.args[0]
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            
            # Set appropriate status code based on error code
            if error_data["code"] == "COMPANY_NOT_FOUND":
                status_code = status.HTTP_404_NOT_FOUND
            elif error_data["code"] == "INVALID_OBJECT_ID":
                status_code = status.HTTP_400_BAD_REQUEST
                
            raise HTTPException(
                status_code=status_code,
                detail=error_data
            )
        # Fallback for unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "code": "INTERNAL_SERVER_ERROR",
                "detail": str(e),
            }
        )

@router.post("/add")
async def add_company(company: Company):
    try:
        company = await company_mgr.add_company(company)
        return company
    
    except ValueError as e:
        # handle 422 errors
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "status": "error",
                "code": "INVALID_DATA",
                "detail": str(e),
            }
        )
    except TypeError as e:
        # handle 422 errors
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "status": "error",
                "code": "INVALID_DATA",
                "detail": str(e),
            }
        )

    except Exception as e:
        # Check if the exception contains our structured error
        if hasattr(e, 'args') and e.args and isinstance(e.args[0], dict) and 'status' in e.args[0]:
            error_data = e.args[0]
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error_data
            )
        # Fallback for unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "code": "INTERNAL_SERVER_ERROR",
                "detail": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

@router.patch("/update/{company_id}")
async def update_company(company_id: str, company: CompanyUpdate):
    try:
        company = await company_mgr.update_company(company_id, company)
        return company

    except ValueError as e:
        # handle 422 errors
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "status": "error",
                "code": "INVALID_DATA",
                "detail": str(e),
            }
        )
    except TypeError as e:
        # handle 422 errors
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "status": "error",
                "code": "INVALID_DATA",
                "detail": str(e),
            }
        )

    except Exception as e:
        # Check if the exception contains our structured error
        if hasattr(e, 'args') and e.args and isinstance(e.args[0], dict) and 'status' in e.args[0]:
            error_data = e.args[0]
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            
            # Set appropriate status code based on error code
            if error_data["code"] == "COMPANY_NOT_FOUND":
                status_code = status.HTTP_404_NOT_FOUND
            elif error_data["code"] == "INVALID_OBJECT_ID":
                status_code = status.HTTP_400_BAD_REQUEST
                
            raise HTTPException(
                status_code=status_code,
                detail=error_data
            )
        # Fallback for unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "code": "INTERNAL_SERVER_ERROR",
                "detail": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

@router.delete("/delete/{company_id}")
async def delete_company(company_id: str):
    try:
        company = await company_mgr.delete_company(company_id)
        return company
    except Exception as e:
        # Check if the exception contains our structured error
        if hasattr(e, 'args') and e.args and isinstance(e.args[0], dict) and 'status' in e.args[0]:
            error_data = e.args[0]
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            
            # Set appropriate status code based on error code
            if error_data["code"] == "COMPANY_NOT_FOUND":
                status_code = status.HTTP_404_NOT_FOUND
            elif error_data["code"] == "INVALID_OBJECT_ID":
                status_code = status.HTTP_400_BAD_REQUEST
                
            raise HTTPException(
                status_code=status_code,
                detail=error_data
            )
        # Fallback for unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "code": "INTERNAL_SERVER_ERROR",
                "detail": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )