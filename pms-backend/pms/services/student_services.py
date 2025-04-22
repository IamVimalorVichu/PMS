from typing import List
from pms.db.database import DatabaseConnection
from pms.models.student import Student, StudentUpdate
from datetime import datetime
from pymongo import ReturnDocument
from bson import ObjectId
from pms.services.user_services import user_mgr
from pms.models.user import User, UserUpdate

class StudentMgr:
    def __init__(self):
        self.db = None
        self.students_collection = None
        
    async def initialize(self):
        self.db = DatabaseConnection()
        self.students_collection = await self.db.get_collection("students")

    async def get_students(self):
        try:
            students = await self.students_collection.find().to_list(length=100)
            for student in students:
                student["_id"] = str(student["_id"])
            return students
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
        
    async def add_student(self, student: Student):
        try:
            # First create the user
            user = User(
                first_name=student.first_name,
                middle_name=student.middle_name,
                last_name=student.last_name,
                email=student.email,
                ph_no=student.ph_no,
                role="student",
                gender=student.gender,
                status="Active"  # Set default status
            )
            
            # Add user first
            user_response = await user_mgr.add_user(user)
            user_id = user_response["id"]
            
            # Add user_id to student data
            student_data = student.model_dump()
            student_data["user_id"] = user_id
            student_data["created_at"] = datetime.now()
            student_data["updated_at"] = datetime.now()
            
            # Create student record
            response = await self.students_collection.insert_one(student_data)
            
            return {
                "status": "success",
                "message": f"Student added with id: {response.inserted_id}",
                "student_id": str(response.inserted_id),
                "user_id": user_id
            }
        except Exception as e:
            if 'user_id' in locals():
                await user_mgr.delete_user(user_id)
            raise Exception(f"Error adding student: {str(e)}")
    
    async def get_student(self, student_id: str):
        try:
            student = await self.students_collection.find_one({"_id": ObjectId(student_id)})
            if student:
                student["_id"] = str(student["_id"])
                return student
            raise Exception("Student not found")
        except Exception as e:
            raise Exception(f"Error fetching student: {str(e)}")
    
    async def get_student_by_user_id(self, user_id: str):
        try:
            student = await self.students_collection.find_one({"user_id": user_id})
            if student:
                student["_id"] = str(student["_id"])
                return student
            raise Exception("Student not found")
        except Exception as e:
            raise Exception(f"Error fetching student: {str(e)}")
    
    async def update_student(self, student_id: str, student: StudentUpdate):
        try:
            existing_student = await self.students_collection.find_one({"_id": ObjectId(student_id)})
            if not existing_student:
                raise Exception("Student not found")

            # Update user first
            user_data = UserUpdate(
                first_name=student.first_name,
                middle_name=student.middle_name,
                last_name=student.last_name,
                email=student.email,
                ph_no=student.ph_no,
                gender=student.gender
            )
            await user_mgr.update_user(existing_student["user_id"], user_data)

            # Update student
            updated_data = student.model_dump(exclude_none=True)
            updated_data["updated_at"] = datetime.now()
            
            updated_student = await self.students_collection.find_one_and_update(
                {"_id": ObjectId(student_id)},
                {"$set": updated_data},
                return_document=ReturnDocument.AFTER
            )
            
            if not updated_student:
                raise Exception("Failed to update student")
            
            updated_student["_id"] = str(updated_student["_id"])
            return updated_student
        except Exception as e:
            raise Exception(f"Error updating student: {str(e)}")
        
    async def delete_student(self, student_id: str):
        try:
            # Get student first
            student = await self.students_collection.find_one({"_id": ObjectId(student_id)})
            if not student:
                raise Exception("Student not found")

            # Delete student record first
            result = await self.students_collection.delete_one({"_id": ObjectId(student_id)})
            if result.deleted_count == 0:
                raise Exception("Failed to delete student")

            # Then delete user
            await user_mgr.delete_user(student["user_id"])
            
            return {"status": "success", "message": "Student and associated user deleted"}
        except Exception as e:
            raise Exception(f"Error deleting student: {str(e)}")

    async def update_by_user_id(self, user_id: str, data: dict):
        try:
            data["updated_at"] = datetime.now()
            student = await self.students_collection.find_one_and_update(
                {"user_id": user_id},
                {"$set": data},
                return_document=ReturnDocument.AFTER
            )
            if student:
                student["_id"] = str(student["_id"])
                return student
            return None
        except Exception as e:
            raise Exception(f"Error updating student: {str(e)}")
    
    async def get_students_by_ids(self, student_ids: List[str]):
        """
        Fetches multiple student documents based on a list of student IDs.
        """
        try:
            object_ids = []
            invalid_ids = []
            for s_id in student_ids:
                if ObjectId.is_valid(s_id):
                    object_ids.append(ObjectId(s_id))
                else:
                    invalid_ids.append(s_id)

            if invalid_ids:
                raise ValueError(f"Invalid ObjectId format for IDs: {', '.join(invalid_ids)}")

            if not object_ids:
                return [] 

            students_list = await self.students_collection.find({"_id": {"$in": object_ids}}).to_list(length=None)
            for student in students_list:
                student["_id"] = str(student["_id"])
            return students_list
        
        except ValueError as ve: 
            raise Exception(str(ve))
        except Exception as e:
            print(f"Database error fetching students by ID: {e}")
            raise Exception(f"Error fetching students by IDs: {str(e)}")
    async def get_drives_for_student(self, student_id: str):
        try:
            from pms.services.drive_services import drive_mgr
            drives = await drive_mgr.drive_collection.find(
                {
                    "eligible_students": {"$in": [student_id]},
                    "published": True
                }
            ).to_list(length=None)
            for drive in drives:
                drive["_id"] = str(drive["_id"])
            return drives
        except Exception as e:
            raise Exception(f"Error fetching drives for student: {str(e)}")

    async def sync_from_user(self, user_data: dict, user_id: str):
        """Synchronize student data when user is updated"""
        try:
            # Check if student record exists
            existing = await self.students_collection.find_one({"user_id": user_id})
            
            sync_data = {
                "first_name": user_data.get("first_name"),
                "middle_name": user_data.get("middle_name"),
                "last_name": user_data.get("last_name"),
                "email": user_data.get("email"),
                "ph_no": user_data.get("ph_no"),
                "gender": user_data.get("gender"),
                "updated_at": datetime.now()
            }

            if existing:
                # Update existing record
                await self.students_collection.update_one(
                    {"user_id": user_id},
                    {"$set": sync_data}
                )
            else:
                # Create new record
                sync_data["user_id"] = user_id
                sync_data["created_at"] = datetime.now()
                await self.students_collection.insert_one(sync_data)

        except Exception as e:
            raise Exception(f"Error syncing student data: {str(e)}")

    async def delete_by_user_id(self, user_id: str):
        """Delete student record by user_id"""
        try:
            result = await self.students_collection.delete_one({"user_id": user_id})
            return result.deleted_count > 0
        except Exception as e:
            raise Exception(f"Error deleting student record: {str(e)}")
               