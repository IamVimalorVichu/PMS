from pms.db.database import DatabaseConnection
from pms.models.faculty import Faculty, FacultyUpdate
from datetime import datetime
from pymongo import ReturnDocument
from bson import ObjectId
from pms.services.user_services import user_mgr
from pms.models.user import User, UserUpdate

class FacultyMgr:
    def __init__(self):
        self.db = None
        self.faculty_collection = None
        
    async def initialize(self):
        self.db = DatabaseConnection()
        self.faculty_collection = await self.db.get_collection("faculties")

    async def get_faculties(self):
        try:
            faculties = await self.faculty_collection.find().to_list(length=100)
            for faculty in faculties:
                faculty["_id"] = str(faculty["_id"])
            return faculties
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
        
    async def add_faculty(self, faculty: Faculty):
        try:
            # First create the user
            user = User(
                first_name=faculty.first_name,
                middle_name=faculty.middle_name,
                last_name=faculty.last_name,
                email=faculty.email,
                ph_no=faculty.ph_no,
                role="faculty",
                gender=faculty.gender,
                status="Active"
            )
            
            # Add user first
            user_response = await user_mgr.add_user(user)
            user_id = user_response["id"]
            
            # Add user_id to faculty data
            faculty_data = faculty.model_dump()
            faculty_data["user_id"] = user_id
            faculty_data["created_at"] = datetime.now()
            faculty_data["updated_at"] = datetime.now()
            
            # Create faculty record
            response = await self.faculty_collection.insert_one(faculty_data)
            
            return {
                "status": "success",
                "message": f"Faculty added with id: {response.inserted_id}",
                "faculty_id": str(response.inserted_id),
                "user_id": user_id
            }
        except Exception as e:
            if 'user_id' in locals():
                await user_mgr.delete_user(user_id)
            raise Exception(f"Error adding faculty: {str(e)}")
    
    async def get_faculty(self, faculty_id: str):
        try:
            faculty = await self.faculty_collection.find_one({"_id": ObjectId(faculty_id)})
            if faculty:
                faculty["_id"] = str(faculty["_id"])
                return faculty
            raise Exception("Faculty not found")
        except Exception as e:
            raise Exception(f"Error fetching faculty: {str(e)}")
    
    async def get_faculty_by_user_id(self, user_id: str):
        try:
            faculty = await self.faculty_collection.find_one({"user_id": user_id})
            if faculty:
                faculty["_id"] = str(faculty["_id"])
                return faculty
            raise Exception("Faculty not found")
        except Exception as e:
            raise Exception(f"Error fetching faculty: {str(e)}")
    
    async def update_faculty(self, faculty_id: str, faculty: FacultyUpdate):
        try:
            existing_faculty = await self.faculty_collection.find_one({"_id": ObjectId(faculty_id)})
            if not existing_faculty:
                raise Exception("Faculty not found")

            # Update user first
            user_data = UserUpdate(
                first_name=faculty.first_name,
                middle_name=faculty.middle_name,
                last_name=faculty.last_name,
                email=faculty.email,
                ph_no=faculty.ph_no,
                gender=faculty.gender
            )
            await user_mgr.update_user(existing_faculty["user_id"], user_data)

            # Update faculty
            updated_data = faculty.model_dump(exclude_none=True)
            updated_data["updated_at"] = datetime.now()
            
            updated_faculty = await self.faculty_collection.find_one_and_update(
                {"_id": ObjectId(faculty_id)},
                {"$set": updated_data},
                return_document=ReturnDocument.AFTER
            )
            
            if not updated_faculty:
                raise Exception("Failed to update faculty")
            
            updated_faculty["_id"] = str(updated_faculty["_id"])
            return updated_faculty
        except Exception as e:
            raise Exception(f"Error updating faculty: {str(e)}")
        
    async def delete_faculty(self, faculty_id: str):
        try:
            # Get faculty first
            faculty = await self.faculty_collection.find_one({"_id": ObjectId(faculty_id)})
            if not faculty:
                raise Exception("Faculty not found")

            # Delete faculty record first
            result = await self.faculty_collection.delete_one({"_id": ObjectId(faculty_id)})
            if result.deleted_count == 0:
                raise Exception("Failed to delete faculty")

            # Then delete user
            await user_mgr.delete_user(faculty["user_id"])
            
            return {"status": "success", "message": "Faculty and associated user deleted"}
        except Exception as e:
            raise Exception(f"Error deleting faculty: {str(e)}")

    async def update_by_user_id(self, user_id: str, data: dict):
        try:
            data["updated_at"] = datetime.now()
            faculty = await self.faculty_collection.find_one_and_update(
                {"user_id": user_id},
                {"$set": data},
                return_document=ReturnDocument.AFTER
            )
            if faculty:
                faculty["_id"] = str(faculty["_id"])
                return faculty
            return None
        except Exception as e:
            raise Exception(f"Error updating faculty: {str(e)}")

    async def sync_from_user(self, user_data: dict, user_id: str):
        """Synchronize faculty data when user is updated"""
        try:
            existing = await self.faculty_collection.find_one({"user_id": user_id})
            
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
                await self.faculty_collection.update_one(
                    {"user_id": user_id},
                    {"$set": sync_data}
                )
            else:
                sync_data["user_id"] = user_id
                sync_data["created_at"] = datetime.now()
                await self.faculty_collection.insert_one(sync_data)

        except Exception as e:
            raise Exception(f"Error syncing faculty data: {str(e)}")

    async def delete_by_user_id(self, user_id: str):
        """Delete faculty record by user_id"""
        try:
            result = await self.faculty_collection.delete_one({"user_id": user_id})
            return result.deleted_count > 0
        except Exception as e:
            raise Exception(f"Error deleting faculty record: {str(e)}")