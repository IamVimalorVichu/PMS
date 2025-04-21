from datetime import datetime
import re
from fastapi import HTTPException
from pymongo import ReturnDocument
from typing import List, Optional
from bson import ObjectId

from pms.models.drive_form import DriveForm, DriveFormUpdate
from pms.db.database import DatabaseConnection

class DriveFormMgr:
    def __init__(self):
        self.db = None
        self.drive_form_collection = None
        
    async def initialize(self):
        self.db = DatabaseConnection()
        self.drive_form_collection = await self.db.get_collection("drive_forms")
    
    async def get_drive_forms(self) -> List[DriveForm]:
        try:
            forms = await self.drive_form_collection.find().to_list(length=100)
            for form in forms:
                form["_id"] = str(form["_id"])
            return forms
        except Exception as e:
            raise Exception(f"Error fetching drive forms: {str(e)}")

    async def get_drive_form(self, form_id: str) -> DriveForm:
        try:
            form = await self.drive_form_collection.find_one({"_id": ObjectId(form_id)})
            if not form:
                raise HTTPException(status_code=404, detail="Drive form not found")
            form["_id"] = str(form["_id"])
            return form
        except Exception as e:
            raise Exception(f"Error fetching drive form: {str(e)}")

    async def get_form_by_drive(self, drive_id: str) -> DriveForm:
        try:
            form = await self.drive_form_collection.find_one({"drive_id": drive_id})
            if not form:
                # Instead of returning empty dict, return a new DriveForm with defaults
                return DriveForm(
                    drive_id=drive_id,
                    # Set default fields that should be True
                    include_first_name=True,
                    include_last_name=True,
                    include_email=True,
                    include_reg_no=True,
                    include_program=True,
                    include_ph_no=True,
                    include_tenth_cgpa=True,
                    include_twelfth_cgpa=True,
                    include_degree_cgpa=True,
                    include_mca_cgpa=True,
                    include_skills=True,
                    include_linkedin_url=True,
                    # Initialize empty additional fields
                    additional_field_labels=[]
                )
            form["_id"] = str(form["_id"])
            return form
        except Exception as e:
            raise Exception(f"Error fetching drive form: {str(e)}")

    async def create_drive_form(self, drive_id: str, form: DriveForm) -> dict:
        try:
            form_data = form.model_dump()
            form_data["created_at"] = datetime.now()
            form_data["updated_at"] = datetime.now()
            form_data["drive_id"] = drive_id  # Ensure drive_id is set
            
            # Check if form already exists for this drive
            existing = await self.drive_form_collection.find_one({"drive_id": drive_id})
            if existing:
                # Convert DriveForm to DriveFormUpdate for update
                update_form = DriveFormUpdate(**form_data)
                return await self.update_drive_form(drive_id, update_form)
                
            result = await self.drive_form_collection.insert_one(form_data)
            created_form = await self.drive_form_collection.find_one({"_id": result.inserted_id})
            created_form["_id"] = str(created_form["_id"])
            return created_form
        except Exception as e:
            raise Exception(f"Error creating drive form: {str(e)}")

    async def update_drive_form(self, drive_id: str, form: DriveFormUpdate) -> DriveForm:
        try:
            update_data = form.model_dump(exclude_none=True)
            update_data["updated_at"] = datetime.now()
            
            # Check if form exists
            existing_form = await self.drive_form_collection.find_one({"drive_id": drive_id})
            if not existing_form:
                # Remove drive_id from update_data if it exists to avoid duplicate
                update_data.pop("drive_id", None)
                # Create new form with drive_id passed separately
                create_form = DriveForm(
                    drive_id=drive_id,
                    **update_data
                )
                return await self.create_drive_form(drive_id, create_form)

            updated_form = await self.drive_form_collection.find_one_and_update(
                {"drive_id": drive_id},
                {"$set": update_data},
                return_document=ReturnDocument.AFTER
            )
            
            if not updated_form:
                raise HTTPException(status_code=404, detail="Drive form not found")
                
            updated_form["_id"] = str(updated_form["_id"])
            return updated_form
        except Exception as e:
            raise Exception(f"Error updating drive form: {str(e)}")

    async def delete_drive_form(self, form_id: str) -> dict:
        try:
            result = await self.drive_form_collection.find_one_and_delete(
                {"_id": ObjectId(form_id)}
            )
            
            if not result:
                raise HTTPException(status_code=404, detail="Drive form not found")
                
            result["_id"] = str(result["_id"])
            return {
                "status": "success",
                "message": "Drive form deleted successfully",
                "data": result
            }
        except Exception as e:
            raise Exception(f"Error deleting drive form: {str(e)}")

    async def delete_form_by_drive(self, drive_id: str) -> dict:
        try:
            result = await self.drive_form_collection.delete_many({"drive_id": drive_id})
            return {
                "status": "success",
                "message": "Drive forms deleted successfully",
                "count": result.deleted_count
            }
        except Exception as e:
            raise Exception(f"Error deleting drive forms: {str(e)}")

drive_form_mgr = DriveFormMgr()