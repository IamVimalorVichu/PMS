from io import BytesIO
from pms.db.database import DatabaseConnection
from pms.models.resume import Resume, ResumeUpdate
from datetime import datetime
from pymongo import ReturnDocument
from bson import ObjectId
from .resume_generator import resume_generator

class ResumeMgr:
    def __init__(self):
        self.db = None
        self.resume_collection = None
        
    async def initialize(self):
        self.db = DatabaseConnection()
        self.resume_collection = await self.db.get_collection("resumes")

    async def create_resume(self, resume: Resume):
        try:
            resume_data = resume.model_dump()
            resume_data["created_at"] = datetime.now()
            resume_data["updated_at"] = datetime.now()
            response = await self.resume_collection.insert_one(resume_data)
            return {"status": "success", "id": str(response.inserted_id)}
        except Exception as e:
            raise Exception(f"Error creating resume: {str(e)}")

    async def get_resume(self, resume_id: str):
        try:
            resume = await self.resume_collection.find_one({"_id": ObjectId(resume_id)})
            if resume:
                resume["_id"] = str(resume["_id"])
                return resume
            raise Exception("Resume not found")
        except Exception as e:
            raise Exception(f"Error fetching resume: {str(e)}")

    # async def get_resume_by_student(self, student_id: str):
    #     try:
    #         resume = await self.resume_collection.find_one({"student_id": student_id})
    #         if resume:
    #             resume["_id"] = str(resume["_id"])
    #             return resume
    #         raise Exception("Resume not found")
    #     except Exception as e:
    #         raise Exception(f"Error fetching resume: {str(e)}")

    async def get_resumes_by_student(self, student_id: str):
        try:
            cursor = self.resume_collection.find({"student_id": student_id})
            resumes = []
            async for resume in cursor:
                resume["_id"] = str(resume["_id"])
                resumes.append(resume)
            return resumes
        except Exception as e:
            raise Exception(f"Error fetching resumes: {str(e)}")

    async def update_resume(self, resume_id: str, resume: ResumeUpdate):
        try:
            update_data = resume.model_dump(exclude_none=True)
            update_data["updated_at"] = datetime.now()
            updated_resume = await self.resume_collection.find_one_and_update(
                {"_id": ObjectId(resume_id)},
                {"$set": update_data},
                return_document=ReturnDocument.AFTER
            )
            if not updated_resume:
                raise Exception("Resume not found")
            updated_resume["_id"] = str(updated_resume["_id"])
            return updated_resume
        except Exception as e:
            raise Exception(f"Error updating resume: {str(e)}")

    async def delete_resume(self, resume_id: str):
        try:
            result = await self.resume_collection.delete_one({"_id": ObjectId(resume_id)})
            if result.deleted_count == 0:
                raise Exception("Resume not found")
            return {"status": "success", "message": "Resume deleted"}
        except Exception as e:
            raise Exception(f"Error deleting resume: {str(e)}")

    async def generate_resume_pdf(self, resume_id: str) -> BytesIO:
        try:
            resume_data = await self.get_resume(resume_id)
            if not resume_data:
                raise Exception("Resume not found")
            
            pdf_buffer = resume_generator.generate_pdf(resume_data)
            return pdf_buffer
        except Exception as e:
            raise Exception(f"Error generating resume PDF: {str(e)}")

resume_mgr = ResumeMgr()
