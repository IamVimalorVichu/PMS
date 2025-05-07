from typing import List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from pms.models.company import Company
# from app.db.repository.base import BaseRepository

class CompanyRepository: # Or inherit from BaseRepository[Company]
    """Repository for Company related database operations."""

    def __init__(self, db: AsyncIOMotorDatabase):
         self._db = db
         self.collection = self._db["companies"] # Collection name

    async def _map_doc_to_model(self, doc: dict) -> Optional[Company]:
        """Maps a MongoDB document to the Pydantic Company model."""
        if not doc:
            return None
        if "_id" in doc and isinstance(doc["_id"], ObjectId):
            doc["_id"] = str(doc["_id"])
        return Company(**doc)

    async def get_by_id(self, company_id: str) -> Optional[Company]:
        """Fetches a company by its MongoDB _id."""
        try:
            oid = ObjectId(company_id)
        except Exception:
            return None # Invalid ObjectId format
        company_doc = await self.collection.find_one({"_id": oid})
        return await self._map_doc_to_model(company_doc)

    async def get_all(self) -> List[Company]:
        """Fetches all companies."""
        company_docs = await self.collection.find().to_list(length=None)
        return [await self._map_doc_to_model(doc) for doc in company_docs if doc]

    async def create(self, company_in: Company) -> Company:
        """Creates a new company document."""
        company_data = company_in.model_dump(exclude_none=True, exclude={"id"})
        insert_result = await self.collection.insert_one(company_data)
        created_company = await self.get_by_id(str(insert_result.inserted_id))
        if not created_company:
             raise Exception("Failed to create or retrieve company after insertion.")
        return created_company

    # Add other methods as needed (update, delete, find by name, etc.)