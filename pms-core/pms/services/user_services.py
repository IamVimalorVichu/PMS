from datetime import datetime, timedelta
import re
from typing import List, Optional
from bson.errors import InvalidId
from pymongo import ReturnDocument
from pms.models.user import User, UserBasicInfo, UserUpdate
from pms.models.auth import UserLogin
from pms.db.database import DatabaseConnection
from pms.core.config import config
from pms.services.auth_services import create_access_token
from pms.utils.utilities import util_mgr
from bson import ObjectId
from fastapi import HTTPException, logger, status

class UserMgr:
    def __init__(self):
        self.db = None
        self.users_collection = None
    
    async def initialize(self):
        self.db = DatabaseConnection()
        self.users_collection = await self.db.get_collection("users")

    async def get_users(self):
        try:
            users = await self.users_collection.find().to_list(length=100)
            for user in users:
                user["_id"] = str(user["_id"])
            return users
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
        

    async def add_user(self, user: User):
        try:
            user_data = user.model_dump()
            hashed_password = util_mgr.hash_password(user_data["password"])
            user_data["password"] = hashed_password
            response = await self.users_collection.insert_one(user_data)
            user_id = str(response.inserted_id)

            # Sync with role-specific collection
            if user_data["role"] in ["student", "faculty", "alumni"]:
                from pms.services.student_services import student_mgr
                from pms.services.faculty_services import faculty_mgr
                from pms.services.alumni_services import alumni_mgr

                role_mgr = {
                    "student": student_mgr,
                    "faculty": faculty_mgr,
                    "alumni": alumni_mgr
                }[user_data["role"]]

                await role_mgr.sync_from_user(user_data, user_id)

            return {
                "status": "success",
                "message": f"User added with id: {user_id}",
                "id": user_id
            }
        except Exception as e:
            raise Exception(f"Error adding user: {str(e)}")
        

    async def login_user(self, user: UserLogin):
        try:
            print('reached in user_services')
            user_data = await self.users_collection.find_one({"email": user.email})
            if user_data is None:
                raise Exception("User not found")
            if not util_mgr.verify_password(user.password, user_data["password"]):
                raise Exception("Incorrect password")
            if user_data["status"] == "inactive":
                raise Exception("User is inactive")
            access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={ 
                       "_id": str(user_data["_id"]),
                       "email": user_data["email"],
                       "role": user_data["role"],
                        "first_name": user_data["first_name"],
                        "last_name": user_data["last_name"]
                        }, expires_delta=access_token_expires
            )
            return {"access_token": access_token, "role": user_data["role"], "status": user_data["status"]}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": str(e)}
            )
        
    async def get_user(self, user_id: str):
        try:
            user = await self.users_collection.find_one({"_id": ObjectId(user_id)})
            if user:
                user["_id"] = str(user["_id"])
                return user
            raise Exception("User not found")
        except Exception as e:
            raise Exception(f"Error fetching user: {str(e)}")

    async def update_user(self, user_id: str, user: UserUpdate):
        try:
            user_data = user.model_dump(exclude_none=True)
            if "password" in user_data:
                user_data["password"] = util_mgr.hash_password(user_data["password"])
            
            updated_user = await self.users_collection.find_one_and_update(
                {"_id": ObjectId(user_id)},
                {"$set": user_data},
                return_document=True
            )
            
            if not updated_user:
                raise Exception("User not found")

            # Sync with role-specific collection
            if updated_user["role"] in ["student", "faculty", "alumni"]:
                from pms.services.student_services import student_mgr
                from pms.services.faculty_services import faculty_mgr
                from pms.services.alumni_services import alumni_mgr

                role_mgr = {
                    "student": student_mgr,
                    "faculty": faculty_mgr,
                    "alumni": alumni_mgr
                }[updated_user["role"]]

                await role_mgr.sync_from_user(user_data, user_id)

            updated_user["_id"] = str(updated_user["_id"])
            return updated_user
        except Exception as e:
            raise Exception(f"Error updating user: {str(e)}")

    async def delete_user(self, user_id: str):
        try:
            user = await self.users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                raise Exception("User not found")

            # Delete from role-specific collection first
            if user["role"] in ["student", "faculty", "alumni"]:
                from pms.services.student_services import student_mgr
                from pms.services.faculty_services import faculty_mgr
                from pms.services.alumni_services import alumni_mgr

                role_mgr = {
                    "student": student_mgr,
                    "faculty": faculty_mgr,
                    "alumni": alumni_mgr
                }[user["role"]]

                await role_mgr.delete_by_user_id(str(user["_id"]))

            result = await self.users_collection.delete_one({"_id": ObjectId(user_id)})
            if result.deleted_count > 0:
                return {"status": "success", "message": "User deleted successfully"}
            raise Exception("User not found")
        except Exception as e:
            raise Exception(f"Error deleting user: {str(e)}")
        
    async def search_users(self, query: str, current_user_id: str, limit: int = 10) -> List[UserBasicInfo]:
        """Searches for users by name, username, or email, excluding the current user."""
        if not query or len(query) < 2:  # Require minimum query length
            return []

        # Escape regex special characters in the query for safety
        safe_query = re.escape(query)
        # Case-insensitive regex search
        regex_query = re.compile(safe_query, re.IGNORECASE)

        # Fields to search across
        search_filter = {
            "$and": [
                {"_id": {"$ne": ObjectId(current_user_id)}},  # Exclude self
                {"status": "Active"},  # Optional: Only search active users?
                {"$or": [
                    {"first_name": regex_query},
                    {"last_name": regex_query},
                    {"user_name": regex_query},
                    {"email": regex_query}
                ]}
            ]
        }

        # Projection to return only basic info
        projection = {
            "_id": 1,
            "user_name": 1,
            "role": 1,
            "first_name": 1,
            "last_name": 1
        }

        try:
            cursor = self.users_collection.find(search_filter, projection).limit(limit)
            results = []
            async for user_doc in cursor:
                # Convert ObjectId to string before creating UserBasicInfo
                user_doc["_id"] = str(user_doc["_id"])
                # Construct a display name or use username
                display_name = f"{user_doc.get('first_name', '')} {user_doc.get('last_name', '')}".strip()
                user_doc["user_name"] = user_doc.get("user_name") or display_name or "User"
                
                # Create UserBasicInfo with string _id
                results.append(UserBasicInfo(**user_doc))
            return results
        except Exception as e:
            logger.error(f"Error searching users: {e}")  # Use logger instead of print
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error searching users: {str(e)}"
            )
    async def get_users_for_admin(self, skip: int = 0, limit: int = 20, search_query: Optional[str] = None) -> List[User]:
        """
        Fetches a list of users with relevant fields for admin management.
        Allows optional searching.
        """
        query = {}
        if search_query and len(search_query) >= 2:
            safe_query = re.escape(search_query)
            regex = re.compile(safe_query, re.IGNORECASE)
            query["$or"] = [
                {"first_name": regex},
                {"last_name": regex},
                {"user_name": regex},
                {"email": regex}
            ]

        # Projection: Select fields needed for the admin user list
        # Exclude password! Include permissions.
        projection = {
            "password": 0
        }

        try:
            cursor = self.users_collection.find(query, projection).sort("first_name", 1).skip(skip).limit(limit)
            users = []
            async for user_doc in cursor:
                # Ensure _id is stringified for Pydantic model
                user_doc["id"] = str(user_doc["_id"])
                # Pydantic model validation happens implicitly on return if route uses response_model=List[User]
                # Or explicitly validate here: users.append(User(**user_doc))
                users.append(user_doc) # Append raw dict for now, route model handles validation
            return users
        except Exception as e:
            print(f"Error fetching users for admin: {e}")
            # Log error properly
            raise Exception(f"Error fetching users for admin: {str(e)}")


    async def update_user_permissions(self, user_id: str, permissions: UserUpdate) -> Optional[User]:
        """
        Updates only the community permissions (can_post, can_comment) for a user.
        Returns the updated user document (excluding password).
        """
        # Ensure we only process permission fields from the input model
        update_data = {}
        if permissions.can_post is not None:
            update_data["can_post"] = permissions.can_post
        if permissions.can_comment is not None:
            update_data["can_comment"] = permissions.can_comment

        if not update_data:
            # If no valid permission fields were provided in the input
            # You could raise an error or just return the current user data
             print(f"No permission data provided for user {user_id}")
             # Fetch and return current user data without changes
             return await self.get_user(user_id)
             # Or raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No permission fields provided.")


        try:
            updated_user_doc = await self.users_collection.find_one_and_update(
                {"_id": ObjectId(user_id)},
                {"$set": update_data},
                # Return the document *after* the update
                return_document=ReturnDocument.AFTER,
                # Projection to exclude password from the returned document
                projection={"password": 0}
            )

            if not updated_user_doc:
                # User not found
                return None # Or raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

            # Convert _id to string for Pydantic model
            updated_user_doc["id"] = str(updated_user_doc["_id"])
            # Validate and return using Pydantic model
            return User(**updated_user_doc)
        except InvalidId:
             print(f"Invalid ObjectId format for user_id: {user_id}")
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format.")
        except Exception as e:
            print(f"Error updating user permissions for {user_id}: {e}")
            # Log error properly
            raise Exception(f"Error updating user permissions: {str(e)}")
    
    # async def logout_user(self, user_id: str):
    #     try:
    #         # No need to update any DB state for logout since we use JWTs
    #         # Just return a success response
    #         return {
    #             "status": "success",
    #             "message": "User logged out successfully"
    #       }

user_mgr = UserMgr()