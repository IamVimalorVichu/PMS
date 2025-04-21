from datetime import datetime
from fastapi import HTTPException
from pymongo import ReturnDocument
from typing import List, Optional, Dict
from bson import ObjectId

from pms.models.application_form import ApplicationForm, ApplicationFormUpdate
from pms.db.database import DatabaseConnection

class ApplicationFormMgr:
    def __init__(self):
        self.db = None
        self.application_form_collection = None
        
    async def initialize(self):
        self.db = DatabaseConnection()
        self.application_form_collection = await self.db.get_collection("application_forms")
    
    async def get_applications(self) -> List[ApplicationForm]:
        """Get all application forms"""
        try:
            applications = await self.application_form_collection.find().to_list(length=100)
            for app in applications:
                app["_id"] = str(app["_id"])
            return applications
        except Exception as e:
            raise Exception(f"Error fetching applications: {str(e)}")

    async def get_application(self, application_id: str) -> ApplicationForm:
        """Get specific application by ID"""
        try:
            application = await self.application_form_collection.find_one(
                {"_id": ObjectId(application_id)}
            )
            if not application:
                raise HTTPException(status_code=404, detail="Application not found")
            application["_id"] = str(application["_id"])
            return application
        except Exception as e:
            raise Exception(f"Error fetching application: {str(e)}")

    async def get_applications_by_drive(self, drive_id: str) -> List[ApplicationForm]:
        """Get all applications for a specific drive"""
        try:
            applications = await self.application_form_collection.find(
                {"drive_id": drive_id}
            ).to_list(length=None)
            for app in applications:
                app["_id"] = str(app["_id"])
            return applications
        except Exception as e:
            raise Exception(f"Error fetching applications by drive: {str(e)}")

    async def get_applications_by_job(self, job_id: str) -> List[ApplicationForm]:
        """Get all applications for a specific job"""
        try:
            applications = await self.application_form_collection.find(
                {"job_id": job_id}
            ).to_list(length=None)
            for app in applications:
                app["_id"] = str(app["_id"])
            return applications
        except Exception as e:
            raise Exception(f"Error fetching applications by job: {str(e)}")

    async def get_student_applications(self, student_id: str) -> List[ApplicationForm]:
        """Get all applications submitted by a specific student"""
        try:
            applications = await self.application_form_collection.find(
                {"student_id": student_id}
            ).to_list(length=None)
            for app in applications:
                app["_id"] = str(app["_id"])
            return applications
        except Exception as e:
            raise Exception(f"Error fetching student applications: {str(e)}")

    async def create_application(self, student_id: str, application: ApplicationForm):
        """Create a new application submission"""
        try:
            # Check if student already applied for this job
            existing = await self.application_form_collection.find_one({
                "job_id": application.job_id,
                "student_id": student_id
            })
            if existing:
                raise HTTPException(
                    status_code=400, 
                    detail="Student has already applied for this job"
                )
            print(application)
            
            application_data = application.model_dump()
            application_data["submitted_at"] = datetime.now()
            application_data["updated_at"] = datetime.now()
            
            result = await self.application_form_collection.insert_one(application_data)
            created_app = await self.application_form_collection.find_one(
                {"_id": result.inserted_id}
            )
            created_app["_id"] = str(created_app["_id"])
            
            # Return just the application data instead of the wrapped response
            return created_app
        except Exception as e:
            raise Exception(f"Error creating application: {str(e)}")

    async def delete_application(self, application_id: str) -> Dict:
        """Delete an application submission"""
        try:
            result = await self.application_form_collection.find_one_and_delete(
                {"_id": ObjectId(application_id)}
            )
            
            if not result:
                raise HTTPException(status_code=404, detail="Application not found")
                
            result["_id"] = str(result["_id"])
            return {
                "status": "success",
                "message": "Application deleted successfully",
                "data": result
            }
        except Exception as e:
            raise Exception(f"Error deleting application: {str(e)}")
        
    async def get_student_application_by_drive_and_job(self, student_id: str, drive_id: str, job_id: str) -> Optional[ApplicationForm]:
        """Get application submitted by a specific student for a specific drive and job"""
        try:
            app = await self.application_form_collection.find_one({
                "student_id": student_id,
                "drive_id": drive_id,
                "job_id": job_id
            })
            
            if not app:
                return None  # Return None instead of empty list
                
            app["_id"] = str(app["_id"])
            return app
        except Exception as e:
            raise Exception(f"Error fetching student application by drive and job: {str(e)}")

application_form_mgr = ApplicationFormMgr()