from datetime import datetime, timedelta
from pms.models.drivecompany import DriveCompany
from pymongo import ReturnDocument
from typing import List
from bson import ObjectId
from pms.db.database import DatabaseConnection
from pms.core.config import config


class DriveCompanyMgr:
    def __init__(self):
        self.db = None
        self.drive_company_collection = None
        
    async def initialize(self):
        self.db = DatabaseConnection()
        self.drive_company_collection = await self.db.get_collection("company-drives")
    
    async def get_drive_companies(self):
        try:
            await self.db.connect()
            drive_companies = await self.drive_company_collection.find().to_list(length=100)
            if len(drive_companies) == 0:
                print("No drive companies added")
            for drive_company in drive_companies:
                drive_company["_id"] = str(drive_company["_id"])
            return drive_companies
        except Exception as e:  
            raise Exception(f"Error fetching data: {str(e)}")
        
    async def get_drive_companies_by_drive(self, drive_id: str):
        try:
            drive_companies = await self.drive_company_collection.find(
                {"drive_id": drive_id}, 
                {"company_id": 1, "_id": 0}
            ).to_list(length=100)
            
            return [doc["company_id"] for doc in drive_companies]
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")

    async def get_drive_companies_by_company(self, company_id: str):
        try:
            drive_companies = await self.drive_company_collection.find(
                {"company_id": company_id},
                {"drive_id": 1, "_id": 0}
            ).to_list(length=100)
            return [str(doc["drive_id"]) for doc in drive_companies]
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
        
    async def add_drive_company(self, drive_id: str, company_id: str):
        try:
            response = await self.drive_company_collection.insert_one({
                "drive_id": drive_id,
                "company_id": company_id
            })
            inserted_drive_company = await self.drive_company_collection.find_one({"_id": response.inserted_id})
            inserted_drive_company["_id"] = str(inserted_drive_company["_id"])  # Convert ObjectId to string
            
            return {
                "status": "success",
                "message": "Drive added successfully",
                "data": inserted_drive_company
            }
        except Exception as e:
            raise Exception(f"Error adding drive company: {str(e)}")
    
    async def update_drive_company(self, drive_company_id: str, drive_company: DriveCompany):
        try:
            response = await self.drive_company_collection.find_one_and_update(
                {"_id": ObjectId(drive_company_id)},
                {"$set": drive_company.model_dump()},
                return_document=ReturnDocument.AFTER
            )
            return {
                "status": "success",
                "message": "Drive company updated successfully",
                "data": response
            }
        except Exception as e:
            raise Exception(f"Error updating drive company: {str(e)}")
    
    async def delete_drive_company(self, drive_company_id: str):
        try:
            response = await self.drive_company_collection.delete_one({"_id": ObjectId(drive_company_id)})
            return {
                "status": "success",
                "message": "Drive-company deleted successfully"
            }
        except Exception as e:
            raise Exception(f"Error deleting Drive-company: {str(e)}")
        
    async def delete_drive_company_by_drive(self, drive_id: str):
        try:
            response = await self.drive_company_collection.delete_many({"drive_id": drive_id})
            return {
                "status": "success",
                "message": "Drive-company with this company deleted successfully"
            }
        except Exception as e:
            raise Exception(f"Error deleting Drive-company with this company: {str(e)}")
    
    async def delete_drive_company_by_company(self, company_id: str):
        try:
            response = await self.drive_company_collection.delete_many({"company_id": company_id})
            return {
                "status": "success",
                "message": "Drive-company with this drive deleted successfully"
            }
        except Exception as e:
            raise Exception(f"Error deleting Drive-company with this drive: {str(e)}")
        
drive_company_mgr = DriveCompanyMgr()
        
            
