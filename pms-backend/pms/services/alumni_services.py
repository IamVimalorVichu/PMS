import traceback
from pms.db.database import DatabaseConnection
from pms.models.alumni import Alumni, AlumniUpdate
from datetime import datetime
from pymongo import ReturnDocument
from bson import ObjectId
from pms.services.user_services import user_mgr
from pms.models.user import User, UserUpdate

class AlumniMgr:
    def __init__(self):
        self.db = None
        self.alumni_collection = None
        
    async def initialize(self):
        self.db = DatabaseConnection()
        self.alumni_collection = await self.db.get_collection("alumni")

    async def get_alumni_list(self):
        try:
            alumni_list = await self.alumni_collection.find().to_list(length=100)
            for alumni in alumni_list:
                alumni["_id"] = str(alumni["_id"])
            return alumni_list
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
        
    async def add_alumni(self, alumni: Alumni):
        print(alumni)
        try:
            # First create the user
            user = User(
                first_name=alumni.first_name,
                middle_name=alumni.middle_name,
                last_name=alumni.last_name,
                email=alumni.email,
                ph_no=alumni.ph_no,
                role="alumni",
                status="Active",
                can_post=True,
                can_comment=True
                )
            
            # Add user first
            user_response = await user_mgr.add_user(user)
            user_id = user_response["id"]
            
            # Add user_id to alumni data
            alumni_data = alumni.model_dump()
            alumni_data["user_id"] = user_id
            print(alumni_data)
            
            # Create alumni record
            response = await self.alumni_collection.insert_one(alumni_data)
            
            return {
                "status": "success",
                "message": f"Alumni added with id: {response.inserted_id}",
                "alumni_id": str(response.inserted_id),
                "user_id": user_id
            }
        except Exception as e:
            if 'user_id' in locals():
                # Cleanup if user was created but alumni creation failed
                await user_mgr.delete_user(user_id)
            print("General error:", e)
            traceback.print_exc()
            raise Exception(f"Error adding alumni: {str(e)}")
    
    async def get_alumni(self, alumni_id: str):
        try:
            alumni = await self.alumni_collection.find_one({"_id": ObjectId(alumni_id)})
            if alumni:
                alumni["_id"] = str(alumni["_id"])
                return alumni
            raise Exception("Alumni not found")
        except Exception as e:
            raise Exception(f"Error fetching alumni: {str(e)}")
    
    async def get_alumni_by_user_id(self, user_id: str):
        try:
            alumni = await self.alumni_collection.find_one({"user_id": user_id})
            if alumni:
                alumni["_id"] = str(alumni["_id"])
                return alumni
            raise Exception("Alumni not found")
        except Exception as e:
            raise Exception(f"Error fetching alumni: {str(e)}")
    
    async def update_alumni(self, alumni_id: str, alumni: AlumniUpdate):
        try:
            existing_alumni = await self.alumni_collection.find_one({"_id": ObjectId(alumni_id)})
            if not existing_alumni:
                raise Exception("Alumni not found")

            # Update user first
            user_data = UserUpdate(
                first_name=alumni.first_name,
                middle_name=alumni.middle_name,
                last_name=alumni.last_name,
                email=alumni.email,
                ph_no=alumni.ph_no
            )
            await user_mgr.update_user(existing_alumni["user_id"], user_data)

            # Update alumni
            updated_data = alumni.model_dump(exclude_none=True)
            
            updated_alumni = await self.alumni_collection.find_one_and_update(
                {"_id": ObjectId(alumni_id)},
                {"$set": updated_data},
                return_document=ReturnDocument.AFTER
            )
            
            if not updated_alumni:
                raise Exception("Failed to update alumni")
            
            updated_alumni["_id"] = str(updated_alumni["_id"])
            return updated_alumni
        except Exception as e:
            raise Exception(f"Error updating alumni: {str(e)}")
        
    async def delete_alumni(self, alumni_id: str):
        try:
            # Get alumni first
            alumni = await self.alumni_collection.find_one({"_id": ObjectId(alumni_id)})
            if not alumni:
                raise Exception("Alumni not found")

            # Delete alumni record first
            result = await self.alumni_collection.delete_one({"_id": ObjectId(alumni_id)})
            if result.deleted_count == 0:
                raise Exception("Failed to delete alumni")

            # Then delete user
            await user_mgr.delete_user(alumni["user_id"])
            
            return {"status": "success", "message": "Alumni and associated user deleted"}
        except Exception as e:
            raise Exception(f"Error deleting alumni: {str(e)}")

    async def update_by_user_id(self, user_id: str, data: dict):
        try:
            alumni = await self.alumni_collection.find_one_and_update(
                {"user_id": user_id},
                {"$set": data},
                return_document=ReturnDocument.AFTER
            )
            if alumni:
                alumni["_id"] = str(alumni["_id"])
                return alumni
            return None
        except Exception as e:
            raise Exception(f"Error updating alumni: {str(e)}")

    async def sync_from_user(self, user_data: dict, user_id: str):
        """Synchronize alumni data when user is updated"""
        try:
            existing = await self.alumni_collection.find_one({"user_id": user_id})
            
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
                await self.alumni_collection.update_one(
                    {"user_id": user_id},
                    {"$set": sync_data}
                )
            else:
                sync_data["user_id"] = user_id
                sync_data["created_at"] = datetime.now()
                await self.alumni_collection.insert_one(sync_data)

        except Exception as e:
            raise Exception(f"Error syncing alumni data: {str(e)}")

    async def delete_by_user_id(self, user_id: str):
        """Delete alumni record by user_id"""
        try:
            result = await self.alumni_collection.delete_one({"user_id": user_id})
            return result.deleted_count > 0
        except Exception as e:
            raise Exception(f"Error deleting alumni record: {str(e)}")
               