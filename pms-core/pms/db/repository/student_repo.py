from typing import List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from pms.models.student import Student
# from app.db.repository.base import BaseRepository

class StudentRepository: # Or inherit from BaseRepository[Student]
    """Repository for Student related database operations."""

    def __init__(self, db: AsyncIOMotorDatabase):
         self._db = db
         self.collection = self._db["students"] # Collection name

    async def _map_doc_to_model(self, doc: dict) -> Optional[Student]:
        """Maps a MongoDB document to the Pydantic Student model."""
        if not doc:
            return None
        if "_id" in doc and isinstance(doc["_id"], ObjectId):
            doc["_id"] = str(doc["_id"])
        # Handle potential ObjectId for user_id if stored that way
        if "user_id" in doc and isinstance(doc["user_id"], ObjectId):
             doc["user_id"] = str(doc["user_id"])
        return Student(**doc)

    async def get_by_id(self, student_id: str) -> Optional[Student]:
        """Fetches a student by their MongoDB _id."""
        try:
            oid = ObjectId(student_id)
        except Exception:
            return None # Invalid ObjectId format
        student_doc = await self.collection.find_one({"_id": oid})
        return await self._map_doc_to_model(student_doc)

    async def get_by_user_id(self, user_id: str) -> Optional[Student]:
        """Fetches a student by their associated user_id."""
        # Assuming user_id is stored as string. Adjust if stored as ObjectId.
        student_doc = await self.collection.find_one({"user_id": user_id})
        # If user_id is stored as ObjectId:
        # try:
        #     query = {"user_id": ObjectId(user_id)}
        # except Exception: return None
        # student_doc = await self.collection.find_one(query)
        return await self._map_doc_to_model(student_doc)

    async def get_all(self) -> List[Student]:
        """Fetches all students."""
        student_docs = await self.collection.find().to_list(length=None)
        return [await self._map_doc_to_model(doc) for doc in student_docs if doc]

    async def create(self, student_in: Student) -> Student:
        """Creates a new student document."""
        student_data = student_in.model_dump(exclude_none=True, exclude={"id"})
        # Convert user_id to ObjectId if needed
        if 'user_id' in student_data and student_data['user_id']:
             try: student_data['user_id'] = ObjectId(student_data['user_id'])
             except: pass # Keep as string if invalid

        insert_result = await self.collection.insert_one(student_data)
        created_student = await self.get_by_id(str(insert_result.inserted_id))
        if not created_student:
             raise Exception("Failed to create or retrieve student after insertion.")
        return created_student

    # Add other methods as needed (update, delete, find by email, etc.)