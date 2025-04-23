from datetime import datetime, timedelta
from mimetypes import init
from pms.models.company import Company, CompanyUpdate
from pymongo import ReturnDocument
from typing import List, Dict, Any
from bson import ObjectId
from pms.db.database import DatabaseConnection
from pms.core.config import config


class CompanyMgr:
    def __init__(self) -> None:
        self.db = None
        self.companies_collection = None
    
    async def initialize(self) -> None:
        self.db = DatabaseConnection()
        self.companies_collection = await self.db.get_collection("companies")
    
    def _create_error_response(self, code: str, detail: str) -> Dict[str, Any]:
        """Create a standardized error response"""
        return {
            "status": "error",
            "code": code,
            "detail": detail,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def get_companies(self) -> List[Company]:
        try:
            await self.db.connect()
            companies = await self.companies_collection.find().to_list(length=100)
            if len(companies) == 0:
                print("No companies added")
            for company in companies:
                company["_id"] = str(company["_id"])
            return companies
        except Exception as e:
            error = self._create_error_response(
                "DATABASE_ERROR", 
                f"Error fetching companies: {str(e)}"
            )
            raise Exception(error)
        
    async def get_company(self, company_id: str) -> Company:
        try:
            await self.db.connect()
            try:
                object_id = ObjectId(company_id)
            except Exception:
                error = self._create_error_response(
                    "INVALID_OBJECT_ID", 
                    f"Invalid company ID format: {company_id}"
                )
                raise Exception(error)
                
            company = await self.companies_collection.find_one({"_id": object_id})
            if company:
                company["_id"] = str(company["_id"])
                return company
            else:
                error = self._create_error_response(
                    "COMPANY_NOT_FOUND", 
                    f"Company with ID {company_id} not found"
                )
                raise Exception(error)
        except Exception as e:
            # If it's already our formatted error, re-raise it
            if isinstance(e, Exception) and hasattr(e, 'args') and e.args and isinstance(e.args[0], dict) and 'status' in e.args[0]:
                raise
            # Otherwise create a new error
            error = self._create_error_response(
                "DATABASE_ERROR", 
                f"Error fetching company: {str(e)}"
            )
            raise Exception(error)
        
    async def add_company(self, company: Company) -> Company:
        try:
            await self.db.connect()
            company_data = company.model_dump()
            response = await self.companies_collection.insert_one(company_data)
            
            # Get the inserted document with its ID
            inserted_company = await self.companies_collection.find_one({"_id": response.inserted_id})
            inserted_company["_id"] = str(inserted_company["_id"])  # Convert ObjectId to string
            
            return inserted_company
            
        except Exception as e:
            error = self._create_error_response(
                "COMPANY_ADD_ERROR", 
                f"Error adding company: {str(e)}"
            )
            raise Exception(error)
    
    async def update_company(self, company_id: str, company: CompanyUpdate) -> Dict[str, Any]:
        try:
            await self.db.connect()
            try:
                object_id = ObjectId(company_id)
            except Exception:
                error = self._create_error_response(
                    "INVALID_OBJECT_ID", 
                    f"Invalid company ID format: {company_id}"
                )
                raise Exception(error)
                
            company_data = company.model_dump(exclude_none=True)
            response = await self.companies_collection.find_one_and_update(
                {"_id": object_id},
                {"$set": company_data},
                return_document=ReturnDocument.AFTER,
                projection=None
            )
            
            if not response:
                error = self._create_error_response(
                    "COMPANY_NOT_FOUND", 
                    f"Company with ID {company_id} not found"
                )
                raise Exception(error)
                
            response["_id"] = str(response["_id"])  # Convert ObjectId to string
            return {
                "status": "success",
                "message": "Company updated successfully",
                "data": response
            }
        except Exception as e:
            # If it's already our formatted error, re-raise it
            if isinstance(e, Exception) and hasattr(e, 'args') and e.args and isinstance(e.args[0], dict) and 'status' in e.args[0]:
                raise
            # Otherwise create a new error
            error = self._create_error_response(
                "COMPANY_UPDATE_ERROR", 
                f"Error updating company: {str(e)}"
            )
            raise Exception(error)
        
    async def delete_company(self, company_id: str) -> Dict[str, str]:
        try:
            await self.db.connect()
            try:
                object_id = ObjectId(company_id)
            except Exception:
                error = self._create_error_response(
                    "INVALID_OBJECT_ID", 
                    f"Invalid company ID format: {company_id}"
                )
                raise Exception(error)
                
            response = await self.companies_collection.delete_one({"_id": object_id})
            if response.deleted_count == 0:
                error = self._create_error_response(
                    "COMPANY_NOT_FOUND", 
                    f"Company with ID {company_id} not found"
                )
                raise Exception(error)
                
            return {
                "status": "success",
                "message": "Company deleted successfully"
            }
        except Exception as e:
            # If it's already our formatted error, re-raise it
            if isinstance(e, Exception) and hasattr(e, 'args') and e.args and isinstance(e.args[0], dict) and 'status' in e.args[0]:
                raise
            # Otherwise create a new error
            error = self._create_error_response(
                "COMPANY_DELETE_ERROR", 
                f"Error deleting company: {str(e)}"
            )
            raise Exception(error)
        
company_mgr = CompanyMgr()