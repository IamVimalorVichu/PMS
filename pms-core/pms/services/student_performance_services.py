from datetime import datetime, timedelta
from pms.models.student_performance import StudentPerformance, StudentPerformanceUpdate
from pymongo import ReturnDocument
from typing import Any, Dict, List
from bson import ObjectId
from pms.db.database import DatabaseConnection
from pms.core.config import config
from pms.services.file_services import file_service


class StudentPerformanceMgr:
    def __init__(self):
        self.db = None
        self.student_performance_collection  = None
    async def initialize(self):
        self.db = DatabaseConnection()
        self.student_performance_collection  = await self.db.get_collection("student_performance")
    
    async def get_all_student_performances(self) -> List[Dict[str, Any]]:
        try:     
            performances = await self.student_performance_collection.find().to_list(length=None)
            for perf in performances:
                if "_id" in perf:
                    perf["_id"] = str(perf["_id"])
            return performances
        except Exception as e:

            print(f"Error fetching all student performances: {str(e)}")
            raise Exception(f"Error fetching all student performances: {str(e)}")


    async def get_student_performance(self, student_id: str):
        try:
            await self.db.connect()
            student_performance = await self.student_performance_collection.find_one({"student_id": student_id})
            student_performance["_id"] = str(student_performance["_id"])
            return student_performance
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
    
    async def add_student_performance(self, student_performance: StudentPerformance):
        try:
            await self.db.connect()
            student_performance.created_at = datetime.now()
            student_performance.updated_at = datetime.now()
            
            # Handle certification files
            if student_performance.certification_files:
                for file in student_performance.certification_files:
                    if not file.filepath:
                        raise Exception(f"File not found: {file.filename}")
            
            # Handle job application files
            if student_performance.job_application_files:
                for file in student_performance.job_application_files:
                    if not file.filepath:
                        raise Exception(f"File not found: {file.filename}")
            
            student_performance = student_performance.model_dump(exclude_none=True)
            result = await self.student_performance_collection.insert_one(student_performance)
            student_performance["_id"] = str(result.inserted_id)
            return student_performance
        except Exception as e:
            raise Exception(f"Error adding data: {str(e)}")
        
    async def update_student_performance(self, student_id: str, student_performance: StudentPerformanceUpdate):
        try:
            await self.db.connect()
            student_performance.updated_at = datetime.now()
            
            # Handle certification files
            if student_performance.certification_files:
                for file in student_performance.certification_files:
                    if not file.filepath:
                        raise Exception(f"File not found: {file.filename}")
            
            # Handle job application files
            if student_performance.job_application_files:
                for file in student_performance.job_application_files:
                    if not file.filepath:
                        raise Exception(f"File not found: {file.filename}")
            
            student_performance = student_performance.model_dump(exclude_none=True)
            result = await self.student_performance_collection.find_one_and_update(
                {"student_id": student_id}, 
                {"$set": student_performance}, 
                return_document=ReturnDocument.AFTER
            )
            if result is None:
                raise Exception(status_code=404, detail="Student performance not found")
            result["_id"] = str(result["_id"])
            return result
        except Exception as e:
            raise Exception(f"Error updating data: {str(e)}")
        
student_performance_mgr = StudentPerformanceMgr()
