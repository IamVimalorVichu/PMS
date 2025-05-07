# pms/services/job_services.py

from datetime import datetime, timedelta
import logging
from fastapi import HTTPException
from fastapi.exceptions import ResponseValidationError
from pydantic import ValidationError, BaseModel # Added BaseModel for potential use in mapping
from pms.models.job import Job, JobUpdate
from pymongo import ReturnDocument
from typing import Any, List, Dict, Optional
from bson import ObjectId
from pms.db.database import DatabaseConnection
from pms.services.drive_services import drive_mgr
from pms.core.config import config
from pms.services.requirement_services import requirement_mgr
from pms.services.student_services import student_mgr
from pms.services.student_performance_services import student_performance_mgr


class JobMgr:
    def __init__(self):
        self.db = None
        self.job_collection = None # Initialized to None

    async def initialize(self):
        self.db = DatabaseConnection()
        self.job_collection = await self.db.get_collection("jobs")
        # Add a check here too for good measure
        if self.job_collection is None:
             logging.critical("CRITICAL: Failed to initialize job collection in JobMgr.")
             raise Exception("Failed to initialize job collection")
        logging.info("Job Manager Initialized with collection.")


    async def _ensure_initialized(self):
        """Helper to check initialization before accessing collection."""
        if self.job_collection is None:
            logging.error("Job Manager collection accessed before initialization.")
            # Option A: Try to initialize again (can hide startup issues)
            # await self.initialize()
            # if self.job_collection is None: # Check again after trying
            #     raise HTTPException(status_code=500, detail="Job Service not properly initialized.")
            # Option B: Raise error immediately (better for diagnosing startup)
            raise HTTPException(status_code=500, detail="Job Service not properly initialized.")


    async def _map_doc_to_model(self, doc: dict) -> Optional[Job]:
        """Maps a MongoDB document to the Pydantic Job model."""
        if not doc:
            return None
        if "_id" in doc and isinstance(doc["_id"], ObjectId):
            doc["_id"] = str(doc["_id"])
        if "company" in doc and isinstance(doc.get("company"), ObjectId):
             doc["company"] = str(doc["company"])
        if "drive" in doc and isinstance(doc.get("drive"), ObjectId):
             doc["drive"] = str(doc["drive"])
        try:
            # Use model_validate for flexibility with potential extra fields from DB
            return Job.model_validate(doc)
        except ValidationError as e:
            logging.error(f"Validation error mapping job doc {doc.get('_id', 'N/A')}: {e}")
            return None

    # --- Method causing the error ---
    async def get_jobs_by_student_interaction(self, student_id: str) -> List[Job]:
        """
        Fetches all jobs where the given student_id appears in applied,
        eligible, or selected lists.
        """
        await self._ensure_initialized() # Use helper to check initialization
        try:
            query = {
                "$or": [
                    {"applied_students": student_id},
                    {"eligible_students": student_id},
                    {"selected_students": student_id}
                ]
            }
            # Access collection directly now that check passed
            job_docs_cursor = self.job_collection.find(query)
            job_docs = await job_docs_cursor.to_list(length=None)

            jobs = [await self._map_doc_to_model(doc) for doc in job_docs]
            return [job for job in jobs if job is not None]
        except Exception as e:
            # Log the specific error and raise a more generic one for the route
            logging.error(f"Error fetching jobs by student interaction ({student_id}): {str(e)}", exc_info=True)
            # Don't expose raw DB errors directly if possible
            raise Exception(f"Database error fetching jobs by student interaction.")
    # --- End Method causing the error ---


    async def get_jobs(self) -> List[Job]:
        await self._ensure_initialized()
        try:
            jobs_cursor = self.job_collection.find()
            jobs_docs = await jobs_cursor.to_list(length=None)
            if not jobs_docs: return []
            jobs = [await self._map_doc_to_model(doc) for doc in jobs_docs]
            return [job for job in jobs if job is not None]
        except Exception as e:
            logging.error(f"Error fetching jobs: {str(e)}", exc_info=True)
            raise Exception(f"Database error fetching jobs.")

    async def get_job(self, job_id: str) -> Optional[Job]:
        await self._ensure_initialized()
        try:
            job_doc = await self.job_collection.find_one({"_id": ObjectId(job_id)})
            if job_doc is None:
                raise HTTPException(status_code=404, detail="Job not found")
            return await self._map_doc_to_model(job_doc)
        except HTTPException as http_exc:
             raise http_exc
        except Exception as e:
            logging.error(f"Error fetching job {job_id}: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Database error fetching job data.")

    async def get_job_by_drive(self, drive_id: str) -> List[Job]:
        await self._ensure_initialized()
        try:
            jobs_cursor = self.job_collection.find({"drive": drive_id})
            jobs_docs = await jobs_cursor.to_list(length=None)
            if not jobs_docs: return []
            jobs = [await self._map_doc_to_model(doc) for doc in jobs_docs]
            return [job for job in jobs if job is not None]
        except Exception as e:
            logging.error(f"Error fetching jobs by drive ({drive_id}): {str(e)}", exc_info=True)
            raise Exception(f"Database error fetching jobs by drive.")

    async def get_job_by_company(self, company_id: str) -> List[Job]:
        await self._ensure_initialized()
        try:
            jobs_cursor = self.job_collection.find({"company": company_id})
            jobs_docs = await jobs_cursor.to_list(length=None)
            if not jobs_docs: return []
            jobs = [await self._map_doc_to_model(doc) for doc in jobs_docs]
            return [job for job in jobs if job is not None]
        except Exception as e:
            logging.error(f"Error fetching jobs by company ({company_id}): {str(e)}", exc_info=True)
            raise Exception(f"Database error fetching jobs by company.")

    async def get_job_by_drivecompany(self, drive_id: str, company_id: str) -> List[Job]:
        await self._ensure_initialized()
        try:
            jobs_cursor = self.job_collection.find({"drive": drive_id, "company": company_id})
            jobs_docs = await jobs_cursor.to_list(length=None)
            if not jobs_docs: return []
            jobs = [await self._map_doc_to_model(doc) for doc in jobs_docs]
            return [job for job in jobs if job is not None]
        except Exception as e:
            logging.error(f"Error fetching jobs by drive/company ({drive_id}/{company_id}): {str(e)}", exc_info=True)
            raise Exception(f"Database error fetching jobs by drive/company.")

    async def add_job(self, job: Job, drive_id: str, company_id:str) -> Dict[str, Any]:
        await self._ensure_initialized()
        try:
            job_data = job.model_dump(exclude_none=True, exclude={"id"})
            job_data["drive"] = drive_id
            job_data["company"] = company_id
            # Convert to ObjectId if schema needs it
            # try: job_data["drive"] = ObjectId(drive_id)
            # except: pass
            # try: job_data["company"] = ObjectId(company_id)
            # except: pass

            response = await self.job_collection.insert_one(job_data)
            inserted_job_doc = await self.job_collection.find_one({"_id": response.inserted_id})
            if not inserted_job_doc: raise Exception("Failed to retrieve job after insertion.")
            inserted_job_model = await self._map_doc_to_model(inserted_job_doc)
            if not inserted_job_model: raise Exception("Failed to map inserted job to model.")

            return { "status": "success", "message": "Job added successfully", "data": inserted_job_model.model_dump() }
        except Exception as e:
            logging.error(f"Error adding job: {str(e)}", exc_info=True)
            raise Exception(f"Database error adding job.")

    async def update_job(self, job_id:str, job_update: JobUpdate) -> Optional[Job]:
        await self._ensure_initialized()
        try:
            job_data = job_update.model_dump(exclude_unset=True)
            if not job_data: raise HTTPException(status_code=400, detail="No update data provided")
            # Convert related IDs if needed
            # ...

            updated_doc = await self.job_collection.find_one_and_update(
                {"_id": ObjectId(job_id)}, {"$set": job_data}, return_document=ReturnDocument.AFTER
            )
            if not updated_doc: raise HTTPException(status_code=404, detail="Job not found")
            return await self._map_doc_to_model(updated_doc)
        except HTTPException as http_exc: raise http_exc
        except Exception as e:
            logging.error(f"Error updating job {job_id}: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Database error updating job.")

    async def delete_job(self, job_id: str) -> Optional[Job]:
        await self._ensure_initialized()
        try:
            deleted_doc = await self.job_collection.find_one_and_delete({"_id": ObjectId(job_id)})
            if not deleted_doc: raise HTTPException(status_code=404, detail="Job not found")
            return await self._map_doc_to_model(deleted_doc)
        except HTTPException as http_exc: raise http_exc
        except Exception as e:
            logging.error(f"Error deleting job {job_id}: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Database error deleting job.")

    # --- Delete Many Methods ---
    async def delete_job_by_drive(self, drive_id: str) -> Dict[str, Any]:
        await self._ensure_initialized()
        try:
            result = await self.job_collection.delete_many({"drive": drive_id})
            return { "status": "success", "message": f"Deleted jobs for drive {drive_id}", "deleted_count": result.deleted_count }
        except Exception as e:
            logging.error(f"Error deleting jobs by drive {drive_id}: {str(e)}", exc_info=True)
            raise Exception(f"Database error deleting jobs by drive.")

    async def delete_job_by_company(self, company_id: str) -> Dict[str, Any]:
        await self._ensure_initialized()
        try:
            result = await self.job_collection.delete_many({"company": company_id})
            return { "status": "success", "message": f"Deleted jobs for company {company_id}", "deleted_count": result.deleted_count }
        except Exception as e:
            logging.error(f"Error deleting jobs by company {company_id}: {str(e)}", exc_info=True)
            raise Exception(f"Database error deleting jobs by company.")

    async def delete_job_by_drivecompany(self, drive_id:str, company_id:str) -> Dict[str, Any]:
        await self._ensure_initialized()
        try:
            result = await self.job_collection.delete_many({"drive": drive_id, "company": company_id})
            return { "status": "success", "message": f"Deleted jobs for drive {drive_id} and company {company_id}", "deleted_count": result.deleted_count }
        except Exception as e:
            logging.error(f"Error deleting jobs by drive/company ({drive_id}/{company_id}): {str(e)}", exc_info=True)
            raise Exception(f"Database error deleting jobs by drive/company.")

    async def apply_to_job(self, drive_id:str, job_id: str, student_id: str) -> Dict[str, Any]:
        await self._ensure_initialized()
        try:
            job_update_result = await self.job_collection.find_one_and_update(
                {"_id": ObjectId(job_id)}, {"$addToSet": {"applied_students": student_id}}, return_document=ReturnDocument.AFTER
            )
            if not job_update_result: raise HTTPException(status_code=404, detail="Job not found")
            # Ensure drive_mgr is initialized and has apply_to_drive
            await drive_mgr.apply_to_drive(drive_id, student_id)
            updated_job_model = await self._map_doc_to_model(job_update_result)
            if not updated_job_model: raise Exception("Failed to map updated job after applying.")
            return { "status": "success", "message": "Successfully applied to job", "data": updated_job_model.model_dump() }
        except HTTPException as http_exc: raise http_exc
        except Exception as e:
            logging.error(f"Error applying to job {job_id} for student {student_id}: {str(e)}", exc_info=True)
            raise Exception(f"Database error applying to job.")

    # --- Eligibility Methods ---
    async def get_eligible_students(self, job_id: str) -> List[str]:
        await self._ensure_initialized() # Check job collection
        # Also ensure other managers are initialized if needed
        if not requirement_mgr or not student_mgr or not student_performance_mgr:
             raise HTTPException(status_code=500, detail="Dependency services for eligibility check not initialized.")
        try:
            # ... (rest of the eligibility logic remains the same) ...
            # --- 1. Get Job Requirements ---
            job_requirements_list = await requirement_mgr.get_requirement_by_job(job_id)
            if not job_requirements_list:
                logging.warning(f"No requirements found for job_id: {job_id}")
                return []
            requirements = job_requirements_list[0]

            req_passout_year = requirements.get("passout_year")
            req_sslc_cgpa = requirements.get("sslc_cgpa")
            req_plustwo_cgpa = requirements.get("plustwo_cgpa")
            req_degree_cgpa = requirements.get("degree_cgpa")
            req_mca_cgpa_list = requirements.get("mca_cgpa")
            req_mca_cgpa = req_mca_cgpa_list[-1] if req_mca_cgpa_list else None

            # --- 2. Get All Students ---
            all_students_raw = await student_mgr.get_students()
            if not all_students_raw: return []

            # --- 3. Get All Performances ---
            all_performances_list = await student_performance_mgr.get_all_student_performances()
            performance_map: Dict[str, Dict[str, Any]] = {
                str(perf['student_id']): perf for perf in all_performances_list if 'student_id' in perf
            }

            # --- 4. Filter Students ---
            eligible_student_ids = []
            for student_raw in all_students_raw:
                student_id = str(student_raw.get("_id")) if student_raw.get("_id") else None
                if not student_id: continue
                is_eligible = True
                # ... (passout year check) ...
                join_date = student_raw.get("join_date")
                student_passout_year = None
                if isinstance(join_date, datetime):
                    program = student_raw.get("program", "MCA")
                    duration = 2 # Default MCA
                    if program in ["BCA", "BBA"]: duration = 3
                    elif program == "MBA": duration = 2
                    student_passout_year = join_date.year + duration
                if req_passout_year is not None:
                    if student_passout_year is None or student_passout_year > req_passout_year:
                        is_eligible = False

                # ... (performance check) ...
                if is_eligible:
                    performance = performance_map.get(student_id)
                    is_perf_required = req_sslc_cgpa is not None or req_plustwo_cgpa is not None or req_degree_cgpa is not None or req_mca_cgpa is not None
                    if not performance and is_perf_required:
                        is_eligible = False
                    elif performance:
                        if req_sslc_cgpa is not None:
                            stud_cgpa = performance.get("tenth_cgpa")
                            if stud_cgpa is None or stud_cgpa < req_sslc_cgpa: is_eligible = False
                        if is_eligible and req_plustwo_cgpa is not None:
                            stud_cgpa = performance.get("twelth_cgpa")
                            if stud_cgpa is None or stud_cgpa < req_plustwo_cgpa: is_eligible = False
                        if is_eligible and req_degree_cgpa is not None:
                            stud_cgpa = performance.get("degree_cgpa")
                            if stud_cgpa is None or stud_cgpa < req_degree_cgpa: is_eligible = False
                        if is_eligible and req_mca_cgpa is not None:
                            stud_mca_cgpa_list = performance.get("mca_cgpa")
                            if not stud_mca_cgpa_list: is_eligible = False
                            else:
                                stud_latest_mca_cgpa = stud_mca_cgpa_list[-1]
                                if stud_latest_mca_cgpa < req_mca_cgpa: is_eligible = False

                if is_eligible:
                    eligible_student_ids.append(student_id)

            return eligible_student_ids
        except Exception as e:
            logging.error(f"Error in get_eligible_students for job {job_id}: {str(e)}", exc_info=True)
            raise Exception(f"Database error determining eligible students.")


    async def set_eligible_students_for_job(self, job_id: str, studentList: List[str]) -> Optional[Job]:
        await self._ensure_initialized()
        try:
            response_doc = await self.job_collection.find_one_and_update(
                {"_id" : ObjectId(job_id)}, {"$set": {"eligible_students": studentList}}, return_document= ReturnDocument.AFTER
            )
            if not response_doc: raise HTTPException(status_code=404, detail="Job not found")
            drive_id = response_doc.get("drive")
            if drive_id:
                # Ensure drive_mgr is initialized
                await drive_mgr.set_eligible_students_for_drive(str(drive_id))
            return await self._map_doc_to_model(response_doc)
        except HTTPException as http_exc: raise http_exc
        except Exception as e:
            logging.error(f"Error setting eligible students for job {job_id}: {str(e)}", exc_info=True)
            raise Exception(f"Database error setting eligible students.")

    # --- Stage/Selection Methods ---
    async def update_stage_students(self, job_id: str, stage_students: List[List[str]]) -> Dict[str, Any]:
        await self._ensure_initialized()
        try:
            response_doc = await self.job_collection.find_one_and_update(
                {"_id": ObjectId(job_id)}, {"$set": {"stage_students": stage_students}}, return_document=ReturnDocument.AFTER
            )
            if not response_doc: raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")
            drive_id = response_doc.get("drive")
            if drive_id:
                # Ensure drive_mgr is initialized
                await drive_mgr.update_drive_stages(str(drive_id))
            updated_job_model = await self._map_doc_to_model(response_doc)
            if not updated_job_model: raise Exception("Failed to map updated job after stage update.")
            return { "status": "success", "message": "Stage students updated successfully", "data": updated_job_model.model_dump() }
        except HTTPException as http_exc: raise http_exc
        except Exception as e:
            logging.error(f"Error updating stage students for job {job_id}: {str(e)}", exc_info=True)
            raise Exception(f"Database error updating stage students.")

    async def confirm_selected_students(self, job_id: str, selected_students: List[str]) -> Dict[str, Any]:
        await self._ensure_initialized()
        try:
            response_doc = await self.job_collection.find_one_and_update(
                {"_id": ObjectId(job_id)}, {"$set": {"selected_students": selected_students}}, return_document=ReturnDocument.AFTER
            )
            if not response_doc: raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")
            drive_id = response_doc.get("drive")
            if drive_id:
                # Ensure drive_mgr is initialized
                await drive_mgr.update_drive_selected_students(str(drive_id))
            updated_job_model = await self._map_doc_to_model(response_doc)
            if not updated_job_model: raise Exception("Failed to map updated job after selection confirmation.")
            return { "status": "success", "message": "Selected students confirmed successfully", "data": updated_job_model.model_dump() }
        except HTTPException as http_exc: raise http_exc
        except Exception as e:
            logging.error(f"Error confirming selected students for job {job_id}: {str(e)}", exc_info=True)
            raise Exception(f"Database error confirming selected students.")

# Instantiate the manager globally
job_mgr = JobMgr()