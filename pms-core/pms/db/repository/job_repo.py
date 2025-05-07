from typing import List, Optional
from bson import ObjectId # Import ObjectId if your IDs are stored as such
from motor.motor_asyncio import AsyncIOMotorDatabase # Assuming Motor

# Import your Job model and potentially a base repository if you have one
from pms.models.job import Job
# from app.db.repository.base import BaseRepository # Example if you have a base class

# Assuming you get the db instance somehow (e.g., dependency injection)
# Or define a function get_database() that returns the Motor database instance

class JobRepository: # Or inherit from BaseRepository[Job]
    """Repository for Job related database operations."""

    def __init__(self, db: AsyncIOMotorDatabase): # Example: Inject db
         self._db = db
         self.collection = self._db["jobs"] # Or whatever your collection name is

    async def _map_doc_to_model(self, doc: dict) -> Optional[Job]:
        """Maps a MongoDB document to the Pydantic Job model."""
        if not doc:
            return None
        # Handle ObjectId conversion if necessary
        if "_id" in doc and isinstance(doc["_id"], ObjectId):
            doc["_id"] = str(doc["_id"])
        return Job(**doc)

    async def get_by_id(self, job_id: str) -> Optional[Job]:
        """Fetches a job by its MongoDB _id."""
        try:
            oid = ObjectId(job_id)
        except Exception:
            # Invalid ObjectId format
            return None
        job_doc = await self.collection.find_one({"_id": oid})
        return await self._map_doc_to_model(job_doc)

    async def get_all(self) -> List[Job]:
        """Fetches all jobs."""
        job_docs = await self.collection.find().to_list(length=None)
        return [await self._map_doc_to_model(doc) for doc in job_docs if doc]

    async def create(self, job_in: Job) -> Job:
        """Creates a new job document."""
        # Exclude 'id' if it's None, MongoDB generates _id
        job_data = job_in.model_dump(exclude_none=True, exclude={"id"})
        # Convert string IDs back to ObjectId if needed for relations (e.g., company, drive)
        if 'company' in job_data:
             try: job_data['company'] = ObjectId(job_data['company'])
             except: pass # Keep as string if invalid ObjectId
        if 'drive' in job_data:
             try: job_data['drive'] = ObjectId(job_data['drive'])
             except: pass # Keep as string if invalid ObjectId

        insert_result = await self.collection.insert_one(job_data)
        created_job = await self.get_by_id(str(insert_result.inserted_id))
        if not created_job:
             raise Exception("Failed to create or retrieve job after insertion.") # Or specific exception
        return created_job

    # --- NEW METHOD for Analysis Service ---
    async def get_jobs_by_student_interaction(self, student_id: str) -> List[Job]:
        """
        Fetches all jobs where the given student_id appears in applied,
        eligible, or selected lists.
        """
        # Note: student_id should be stored consistently (e.g., as string)
        # in the applied/eligible/selected lists within the Job documents.
        query = {
            "$or": [
                {"applied_students": student_id},
                {"eligible_students": student_id},
                {"selected_students": student_id}
            ]
        }
        # Fetch all matching documents
        job_docs_cursor = self.collection.find(query)
        job_docs = await job_docs_cursor.to_list(length=None)

        # Map documents to Job models
        jobs = [await self._map_doc_to_model(doc) for doc in job_docs if doc]
        return jobs

    async def get_jobs_by_company(self, company_id: str) -> List[Job]:
        """Fetches all jobs associated with a specific company ID."""
        # Assuming company ID is stored as string in Job model,
        # but might be ObjectId in DB if you convert on insert. Adjust query as needed.
        query = {"company": company_id}
        # If company is stored as ObjectId in the DB:
        # try:
        #     query = {"company": ObjectId(company_id)}
        # except Exception:
        #     return [] # Invalid company_id format

        job_docs_cursor = self.collection.find(query)
        job_docs = await job_docs_cursor.to_list(length=None)
        jobs = [await self._map_doc_to_model(doc) for doc in job_docs if doc]
        return jobs

    # Add other methods as needed (update, delete, etc.)