from datetime import datetime
from typing import List
from bson import ObjectId
from pymongo import ReturnDocument
from pms.models.jobapplication import JobApplication
from pms.services.job_services import job_mgr
from pms.db.database import DatabaseConnection


class JobApplicationMgr:
    def __init__(self):
        self.db = None
        self.jobapplication_collection = None

    async def initialize(self):
        self.db = DatabaseConnection()
        self.jobapplication_collection = await self.db.get_collection("jobapplications")
    
    async def get_jobapplications(self):
        try:
            jobapplications = await self.jobapplication_collection.find().to_list(length=100)
            if len(jobapplications) == 0:
                print("No job applications found")
            for application in jobapplications:
                application["_id"] = str(application["_id"])
            return jobapplications
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")

    async def get_jobapplication(self, application_id: str):
        try:
            application = await self.jobapplication_collection.find_one({"_id": ObjectId(application_id)})
            if not application:
                raise Exception("Job application not found")
            application["_id"] = str(application["_id"])
            return application
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")

    async def get_jobapplications_by_student(self, student_id: str):
        try:
            applications = await self.jobapplication_collection.find({"student_id": student_id}).to_list(length=100)
            for application in applications:
                application["_id"] = str(application["_id"])
            return applications
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")

    async def get_jobapplications_by_job(self, job_id: str):
        try:
            applications = await self.jobapplication_collection.find({"job_id": job_id}).to_list(length=100)
            for application in applications:
                application["_id"] = str(application["_id"])
            return applications
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")

    async def add_jobapplication(self, application: JobApplication):
        try:
            application_data = application.model_dump(exclude_none=True)
            application_data["created_at"] = datetime.now()
            application_data["updated_at"] = datetime.now()
            application_data["applied_date"] = datetime.now()

            print("Application Data:", application)
            
            # Check if application already exists
            existing = await self.jobapplication_collection.find_one({
                "student_id": application_data["student_id"],
                "job_id": application_data["job_id"]
            })
            if existing:
                raise Exception("Student has already applied for this job")
            
            # Validate resume - either resume or saved_resume must be present
            if not application_data.get("resume") and not application_data.get("saved_resume"):
                raise Exception("Either resume path or saved resume ID is required")
            
            response = await self.jobapplication_collection.insert_one(application_data)
            applied_student_id = application_data["student_id"]
            applied_job_id = application_data["job_id"]
            applied_drive_id = application_data["drive_id"]
            await job_mgr.apply_to_job(applied_drive_id, applied_job_id, applied_student_id)
            application_data["_id"] = str(response.inserted_id)
            return application_data
        except Exception as e:
            raise Exception(f"Error adding job application: {str(e)}")

    async def update_jobapplication_status(self, application_id: str, status: str):
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.now()
            }
            if status == "Shortlisted":
                update_data["shortlisted_date"] = datetime.now()
            elif status == "Rejected":
                update_data["rejected_date"] = datetime.now()

            response = await self.jobapplication_collection.find_one_and_update(
                {"_id": ObjectId(application_id)},
                {"$set": update_data},
                return_document=ReturnDocument.AFTER
            )
            if not response:
                raise Exception("Job application not found")
            response["_id"] = str(response["_id"])
            return response
        except Exception as e:
            raise Exception(f"Error updating job application: {str(e)}")

    async def delete_jobapplication(self, application_id: str):
        try:
            response = await self.jobapplication_collection.find_one_and_delete(
                {"_id": ObjectId(application_id)}
            )
            if not response:
                raise Exception("Job application not found")
            response["_id"] = str(response["_id"])
            return response
        except Exception as e:
            raise Exception(f"Error deleting job application: {str(e)}")
    async def get_jobapplication_by_job_and_student(self, job_id: str, student_id: str):
        try:
            application = await self.jobapplication_collection.find_one({
                "job_id": job_id,
                "student_id": student_id
            })
            if not application:
                raise Exception("Job application not found")
            application["_id"] = str(application["_id"])
            return application
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")


jobapplication_mgr = JobApplicationMgr()
