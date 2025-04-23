from datetime import datetime, timedelta
from pms.models.requirement import Requirement, RequirementUpdate
from pymongo import ReturnDocument
from typing import List
from bson import ObjectId
from pms.db.database import DatabaseConnection
from pms.core.config import config



class RequirementMgr:
    def __init__(self):
        self.db = None
        self.requirements_collection = None
    
    async def initialize(self):
        self.db = DatabaseConnection()
        self.requirements_collection = await self.db.get_collection("requirements")

    async def get_requirement_by_job(self, job_id: str):
        try:
            requirements = await self.requirements_collection.find({"job": job_id}).to_list(length=100)
            if len(requirements) == 0:
                print("No requirements added")
            for requirement in requirements:
                requirement["_id"] = str(requirement["_id"])
            return requirements
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")

    async def get_requirements(self):
        try:
            await self.db.connect()
            requirements = await self.requirements_collection.find().to_list(length=100)
            if len(requirements) == 0:
                print("No requirements added")
            for requirement in requirements:
                requirement["_id"] = str(requirement["_id"])
            return requirements
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")

    async def get_requirement(self, requirement_id: str):
        try:
            requirement = await self.requirements_collection.find_one({"_id": ObjectId(requirement_id)})
            if requirement is None:
                raise Exception(status_code=404, detail="Requirement not found")
            requirement["_id"] = str(requirement["_id"])
            return requirement
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")

    async def add_requirement(self, requirement: Requirement, job_id: str):
        try:
            # Check if requirement already exists for this job
            existing_requirement = await self.requirements_collection.find_one({"job": job_id})
            if existing_requirement:
                # If exists, update it using existing update_requirement method
                return await self.update_requirement(str(existing_requirement["_id"]), requirement)
            
            # If not exists, add new requirement
            requirement_data = requirement.model_dump()
            requirement_data["job"] = job_id
            response = await self.requirements_collection.insert_one(requirement_data)
            inserted_requirement = await self.requirements_collection.find_one({"_id": response.inserted_id})
            inserted_requirement["_id"] = str(inserted_requirement["_id"])
            return {
                "status": "success",
                "message": "Requirement added successfully",
                "data": inserted_requirement
            }
        except Exception as e:
            raise Exception(f"Error adding requirement: {str(e)}")

    async def update_requirement(self, requirement_id: str, requirement: Requirement):
        try:
            # Log the incoming requirement ID and data
            print(f"Starting update_requirement for requirement_id: {requirement_id}")
            print(f"Incoming requirement data: {requirement.model_dump(exclude_none=True)}")

            # Prepare the data for update
            requirement_data = requirement.model_dump(exclude_none=True)
            print(f"Prepared requirement data for update: {requirement_data}")

            # Perform the update operation
            response = await self.requirements_collection.find_one_and_update(
                {"_id": ObjectId(requirement_id)},
                {"$set": requirement_data},
                return_document=ReturnDocument.AFTER
            )

            # Log the response from the database
            if not response:
                print(f"No requirement found with ID: {requirement_id}")
                raise Exception("Requirement not found")
            
            print(f"Updated requirement response from database: {response}")

            # Convert ObjectId to string for the response
            response["_id"] = str(response["_id"])
            return response
        except Exception as e:
            # Log the error details
            print(f"Error updating requirement with ID {requirement_id}: {str(e)}")
            raise Exception(f"Error updating requirement: {str(e)}")

    async def update_requirement_by_job(self, job_id: str, requirement: RequirementUpdate):
        try:
            requirement_data = requirement.model_dump(exclude_none=True)
            response = await self.requirements_collection.find_one_and_update(
                {"job": job_id},
                {"$set": requirement_data},
                return_document=ReturnDocument.AFTER,
                projection=None
            )
            if not response:
                raise Exception("Requirement not found")
            response["_id"] = str(response["_id"])
            return response
        except Exception as e:
            raise Exception(f"Error updating requirement: {str(e)}")

    async def delete_requirement(self, requirement_id: str):
        try:
            response = await self.requirements_collection.find_one_and_delete({"_id": ObjectId(requirement_id)})
            if not response:
                raise Exception("Requirement not found")
            response["_id"] = str(response["_id"])
            return response
        except Exception as e:
            raise Exception(f"Error deleting requirement: {str(e)}")

    async def delete_requirement_by_job(self, job_id: str):
        try:
            response = await self.requirements_collection.delete_many({"job": job_id})
            return {
                "status": "success",
                "message": "Requirements deleted successfully"
            }
        except Exception as e:
            raise Exception(f"Error deleting requirements: {str(e)}")

requirement_mgr = RequirementMgr()
