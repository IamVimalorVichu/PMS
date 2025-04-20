from datetime import datetime, timedelta
import logging

from fastapi import HTTPException
from fastapi.exceptions import ResponseValidationError
from pydantic import ValidationError
from pms.models.job import Job, JobUpdate
from pymongo import ReturnDocument
from typing import Any, List, Dict
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
        self.job_collection = None
        
    async def initialize(self):
        self.db = DatabaseConnection()
        self.job_collection = await self.db.get_collection("jobs")
    
    async def get_jobs(self):
        try:
            await self.db.connect()
            jobs = await self.job_collection.find().to_list(length=100)
            if len(jobs) == 0:
                print("No jobs added")
            for job in jobs:
                job["_id"] = str(job["_id"])
            return jobs
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
    
    async def get_job(self, job_id: str):
        try:
            job = await self.job_collection.find_one({"_id": ObjectId(job_id)})
            if job is None:
                raise Exception(status_code=404, detail="Job not found")
            job["_id"] = str(job["_id"])
            return job
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
    
    async def get_job_by_drive(self, drive_id: str):
        try:
            jobs = await self.job_collection.find({"drive": drive_id}).to_list(length=100)
            if len(jobs) == 0:
                print("No jobs added")
            for job in jobs:
                job["_id"] = str(job["_id"])
            return jobs
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
    
    async def get_job_by_company(self, company_id: str):
        try:
            jobs = await self.job_collection.find({"company": company_id}).to_list(length=100)
            if len(jobs) == 0:
                print("No jobs added")
            for job in jobs:
                job["_id"] = str(job["_id"])
            return jobs
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
    
    async def get_job_by_drivecompany(self, drive_id: str, company_id: str):
        try:
            jobs = await self.job_collection.find({"drive": drive_id, "company": company_id}).to_list(length=100)
            if len(jobs) == 0:
                print("No jobs added")
            for job in jobs:
                job["_id"] = str(job["_id"])
            return jobs
        except Exception as e:
            raise Exception(f"Error fetching data: {str(e)}")
    
    async def add_job(self, job: Job, drive_id: str, company_id:str):
        try:
            job_data = job.model_dump()
            job_data["drive"] = drive_id
            job_data["company"] = company_id
            response = await self.job_collection.insert_one(job_data)
            inserted_job = await self.job_collection.find_one({"_id": response.inserted_id})
            inserted_job["_id"] = str(inserted_job["_id"])
            return {
                "status": "success",
                "message": "Job added successfully",
                "data": inserted_job
            }
        except Exception as e:
            raise Exception(f"Error adding job: {str(e)}")
    
    async def update_job(self, job_id:str, job: JobUpdate):
        try:
            job_data = job.model_dump(exclude_none=True)
            response = await self.job_collection.find_one_and_update(
                {"_id": ObjectId(job_id)},
                {"$set": job_data},
                return_document=ReturnDocument.AFTER,
                projection=None
            )
            if not response:
                raise Exception("Job not found")
            response["_id"] = str(response["_id"])
            return response
        except Exception as e:
            raise Exception(f"Error updating job: {str(e)}")
        
    async def delete_job(self, job_id: str):
        try:
            response = await self.job_collection.find_one_and_delete({"_id": ObjectId(job_id)})
            if not response:
                raise Exception("Job not found")
            response["_id"] = str(response["_id"])
            return response
        except Exception as e:
            raise Exception(f"Error deleting job: {str(e)}")
    
    async def delete_job_by_drive(self, drive_id: str):
        try:
            response = await self.job_collection.delete_many({"drive": drive_id})
            return {
                "status": "success",
                "message": "Jobs deleted successfully"
            }
        except Exception as e:
            raise Exception(f"Error deleting jobs: {str(e)}")
    
    async def delete_job_by_company(self, company_id: str):
        try:
            response = await self.job_collection.delete_many({"company": company_id})
            return {
                "status": "success",
                "message": "Jobs deleted successfully"
            }
        except Exception as e:
            raise Exception(f"Error deleting jobs: {str(e)}")
    
    async def delete_job_by_drivecompany(self, drive_id:str, company_id:str):
        try: 
            response = await self.job_collection.delete_many({"drive": drive_id, "company": company_id})
            return {
                "status": "success",
                "message": "Jobs deleted successfully",
                "data": response
            }
        except Exception as e:
            raise Exception(f"Error deleting jobs: {str(e)}")
    
    async def apply_to_job(self, drive_id:str, job_id: str, student_id: str):
        try:
            response = await self.job_collection.find_one_and_update(
                {"_id": ObjectId(job_id)},
                {"$addToSet": {"applied_students": student_id}},  # Use addToSet to avoid duplicates
                return_document=ReturnDocument.AFTER
            )
            if not response:
                raise Exception("Job not found")
            response["_id"] = str(response["_id"])

            await drive_mgr.apply_to_drive(drive_id, student_id)
            return {
                "status": "success",
                "message": "Successfully applied to job",
                "data": response
            }
        except Exception as e:
            raise Exception(f"Error applying to job: {str(e)}")

    async def get_eligible_students(self, job_id: str) -> List[str]:
        """
        Filters and returns a list of student IDs eligible for the given job_id
        based on passout year and CGPA requirements.
        """
        try:
            # --- 1. Get Job Requirements ---
            job_requirements_list = await requirement_mgr.get_requirement_by_job(job_id)
            if not job_requirements_list:
                print(f"No requirements found for job_id: {job_id}")
                return [] 
            
            # Assuming one requirement document per job for simplicity
            requirements = job_requirements_list[0] 
            
            req_passout_year = requirements.get("passout_year")
            req_sslc_cgpa = requirements.get("sslc_cgpa")
            req_plustwo_cgpa = requirements.get("plustwo_cgpa")
            req_degree_cgpa = requirements.get("degree_cgpa")
            req_mca_cgpa_list = requirements.get("mca_cgpa")
            req_mca_cgpa = req_mca_cgpa_list[-1] if req_mca_cgpa_list else None

            # --- 2. Get All Students ---
            all_students = await student_mgr.get_students()
            if not all_students:
                return [] 

            all_performances_list = await student_performance_mgr.get_all_student_performances()
            
            # Create a map for quick lookup: student_id -> performance_doc
            performance_map: Dict[str, Dict[str, Any]] = {
                perf['student_id']: perf for perf in all_performances_list if 'student_id' in perf
            }

            # --- 4. Filter Students ---
            eligible_student_ids = []
            for student in all_students:
                student_id = student.get("_id")
                if not student_id:
                    continue

                is_eligible = True 

                # --- a) Check Passout Year ---
                join_date = student.get("join_date")
                student_passout_year = None
                if isinstance(join_date, datetime):
                    student_passout_year = join_date.year + 2
                
                if req_passout_year is not None:
                    if student_passout_year is None or student_passout_year > req_passout_year:
                        is_eligible = False
                        print(f"Student {student_id} ineligible: Passout year mismatch (Req: {req_passout_year}, Stud: {student_passout_year})")


                # --- b) Check Performance (if still eligible) ---
                if is_eligible:
                    performance = performance_map.get(student_id)
                    if not performance:
                        # If performance record is required to meet any CGPA criteria, mark ineligible
                        if req_sslc_cgpa is not None or req_plustwo_cgpa is not None or req_degree_cgpa is not None or req_mca_cgpa is not None:
                             is_eligible = False
                             print(f"Student {student_id} ineligible: Performance record not found")
                    else:
                        # Check SSLC CGPA (uses 'tenth_cgpa' from performance model)
                        if req_sslc_cgpa is not None:
                            stud_cgpa = performance.get("tenth_cgpa")
                            if stud_cgpa is None or stud_cgpa < req_sslc_cgpa:
                                is_eligible = False
                                print(f"Student {student_id} ineligible: SSLC CGPA mismatch (Req: {req_sslc_cgpa}, Stud: {stud_cgpa})")


                        # Check Plus Two CGPA (uses 'twelth_cgpa' from performance model)
                        if is_eligible and req_plustwo_cgpa is not None:
                            stud_cgpa = performance.get("twelth_cgpa")
                            if stud_cgpa is None or stud_cgpa < req_plustwo_cgpa:
                                is_eligible = False
                                print(f"Student {student_id} ineligible: +2 CGPA mismatch (Req: {req_plustwo_cgpa}, Stud: {stud_cgpa})")


                        # Check Degree CGPA
                        if is_eligible and req_degree_cgpa is not None:
                            stud_cgpa = performance.get("degree_cgpa")
                            if stud_cgpa is None or stud_cgpa < req_degree_cgpa:
                                is_eligible = False
                                print(f"Student {student_id} ineligible: Degree CGPA mismatch (Req: {req_degree_cgpa}, Stud: {stud_cgpa})")


                        # Check MCA CGPA 
                        # Simplification: Compare required vs student's latest (last element)
                        if is_eligible and req_mca_cgpa is not None:
                            stud_mca_cgpa_list = performance.get("mca_cgpa")
                            if not stud_mca_cgpa_list: # Checks if None or empty list
                                is_eligible = False
                                print(f"Student {student_id} ineligible: MCA CGPA missing")
                            else:
                                stud_latest_mca_cgpa = stud_mca_cgpa_list[-1] # Get the last element
                                if stud_latest_mca_cgpa < req_mca_cgpa:
                                    is_eligible = False
                                    print(f"Student {student_id} ineligible: MCA CGPA mismatch (Req: {req_mca_cgpa}, Stud: {stud_latest_mca_cgpa})")


                # --- Add to list if all checks passed ---
                if is_eligible:
                    eligible_student_ids.append(student_id)
                    print(f"Student {student_id} is eligible.")
            
            return eligible_student_ids
        
        except ResponseValidationError as rve:
            logging.error(f"ResponseValidationError in get_eligible_students for job {job_id}: {str(rve)}")
            raise Exception(f"Failed to return eligible students due to response validation error: {str(rve)}")
            
        except ValidationError as ve:
            logging.error(f"ValidationError in get_eligible_students for job {job_id}: {str(ve)}")
            raise Exception(f"Failed to determine eligible students due to validation error: {str(ve)}")
        except KeyError as ke:
            logging.error(f"KeyError in get_eligible_students for job {job_id}: {str(ke)}")
            raise Exception(f"Failed to determine eligible students due to missing key: {str(ke)}")
        except TypeError as te:
            logging.error(f"TypeError in get_eligible_students for job {job_id}: {str(te)}")
            raise Exception(f"Failed to determine eligible students due to type error: {str(te)}")

        except Exception as e:
            # Log the error for debugging
            print(f"Error in get_eligible_students for job {job_id}: {str(e)}")
            # Re-raise the exception to be caught by the route handler
            raise Exception(f"Failed to determine eligible students: {str(e)}")
    
    async def set_eligible_students_for_job(self,job_id: str, studentList: List[str]):
        try:
            response = await self.job_collection.find_one_and_update(
                {"_id" : ObjectId(job_id)},
                {"$set": {"eligible_students": studentList}},  # Use $set for clarity
                return_document= ReturnDocument.AFTER
            )
            if not response:
                raise ValueError("Job not found")
            response["_id"] = str(response["_id"]) 
            print(response)
            drive_id = response["drive"]
            await drive_mgr.set_eligible_students_for_drive(drive_id)
            return response  # Return the updated document
        except ValueError as ve:
            logging.error(f"ValueError: {str(ve)}")
            raise
        except Exception as e:
            # Log the error for debugging
            print(f"Error in setting eligible students for job {job_id}: {str(e)}")
            # Re-raise the exception to be caught by the route handler
            raise Exception(f"Failed to set eligible students: {str(e)}")

    async def update_stage_students(self, job_id: str, stage_students: List[List[str]]):
        """
        Updates the stage_students array for a specific job.
        
        Args:
            job_id (str): The ID of the job to update
            stage_students (List[List[str]]): List of lists containing student IDs for each stage
        
        Returns:
            dict: The updated job document
        """
        try:
            response = await self.job_collection.find_one_and_update(
                {"_id": ObjectId(job_id)},
                {"$set": {"stage_students": stage_students}},
                return_document=ReturnDocument.AFTER
            )
            
            if not response:
                raise HTTPException(
                    status_code=404,
                    detail=f"Job with ID {job_id} not found"
                )

            drive_id = response.get("drive")
            if drive_id:
                # Update drive's aggregated stages
                await drive_mgr.update_drive_stages(drive_id)
                
            response["_id"] = str(response["_id"])
            return {
                "status": "success",
                "message": "Stage students updated successfully",
                "data": response
            }
            
        except Exception as e:
            logging.error(f"Error updating stage students for job {job_id}: {str(e)}")
            raise Exception(f"Failed to update stage students: {str(e)}")

    async def confirm_selected_students(self, job_id: str, selected_students: List[str]):
        """
        Updates the selected_students array for a job and triggers drive update.
        
        Args:
            job_id (str): The ID of the job to update
            selected_students (List[str]): List of student IDs who are finally selected
            
        Returns:
            dict: The updated job document with confirmation status
        """
        try:
            # Update job's selected students
            response = await self.job_collection.find_one_and_update(
                {"_id": ObjectId(job_id)},
                {
                    "$set": {
                        "selected_students": selected_students,
                    }
                },
                return_document=ReturnDocument.AFTER
            )
            
            if not response:
                raise HTTPException(
                    status_code=404,
                    detail=f"Job with ID {job_id} not found"
                )

            # Get drive_id from the job
            drive_id = response.get("drive")
            if drive_id:
                # Update drive's selected students
                await drive_mgr.update_drive_selected_students(drive_id)
                
            response["_id"] = str(response["_id"])
            return {
                "status": "success",
                "message": "Selected students confirmed successfully",
                "data": response
            }
            
        except Exception as e:
            logging.error(f"Error confirming selected students for job {job_id}: {str(e)}")
            raise Exception(f"Failed to confirm selected students: {str(e)}")

job_mgr = JobMgr()
