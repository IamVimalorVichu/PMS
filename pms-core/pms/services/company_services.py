# pms/services/company_services.py

from datetime import datetime, timedelta
import logging # Import logging
from pms.models.company import Company, CompanyUpdate
from pymongo import ReturnDocument
from typing import List, Dict, Any, Optional # Added Optional
from bson import ObjectId
from pms.db.database import DatabaseConnection
from pms.core.config import config
from pms.utils.utilities import UtilMgr # Assuming UtilMgr is correctly imported
from fastapi import HTTPException # Import HTTPException
from pydantic import ValidationError # Import ValidationError


class CompanyMgr:
    def __init__(self) -> None:
        self.db = None
        self.companies_collection = None # Initialize to None

    async def initialize(self) -> None:
        self.db = DatabaseConnection()
        self.companies_collection = await self.db.get_collection("companies")
        if self.companies_collection is None:
            logging.critical("CRITICAL: Failed to initialize companies collection in CompanyMgr.")
            raise Exception("Failed to initialize companies collection")
        logging.info("Company Manager Initialized with collection.")

    async def _ensure_initialized(self):
        """Helper to check initialization before accessing collection."""
        if self.companies_collection is None:
            logging.error("Company Manager collection accessed before initialization.")
            raise HTTPException(status_code=500, detail="Company Service not properly initialized.")

    async def _map_doc_to_model(self, doc: dict) -> Optional[Company]:
        """Maps a MongoDB document to the Pydantic Company model."""
        if not doc:
            return None
        if "_id" in doc and isinstance(doc["_id"], ObjectId):
            doc["_id"] = str(doc["_id"]) # Convert ObjectId to string for the 'id' field alias
        try:
            # Use model_validate for flexibility
            return Company.model_validate(doc)
        except ValidationError as e:
            logging.error(f"Validation error mapping company doc {doc.get('_id', 'N/A')}: {e}")
            return None

    async def get_companies(self) -> List[Company]: # Return List[Company]
        await self._ensure_initialized()
        try:
            # await self.db.connect() # Connect likely handled by initialize
            companies_cursor = self.companies_collection.find()
            companies_docs = await companies_cursor.to_list(length=None) # Fetch all
            if not companies_docs:
                logging.info("No companies found in the database.")
                return []

            # Map documents to models
            companies = [await self._map_doc_to_model(doc) for doc in companies_docs]
            # Filter out None results from mapping errors
            return [company for company in companies if company is not None]
        except Exception as e:
            logging.error(f"Error fetching companies: {str(e)}", exc_info=True)
            # Raise a standard exception or HTTPException
            raise HTTPException(status_code=500, detail=f"Database error fetching companies.")

    async def get_company(self, company_id: str) -> Optional[Company]: # Return Optional[Company]
        await self._ensure_initialized()
        try:
            try:
                object_id = ObjectId(company_id)
            except Exception:
                # Use HTTPException for client errors
                raise HTTPException(status_code=400, detail=f"Invalid company ID format: {company_id}")

            company_doc = await self.companies_collection.find_one({"_id": object_id})
            if company_doc is None:
                 # Use HTTPException for not found
                raise HTTPException(status_code=404, detail=f"Company with ID {company_id} not found")

            # Map and return the model instance
            return await self._map_doc_to_model(company_doc)

        except HTTPException as http_exc:
            # Re-raise specific HTTP exceptions
            raise http_exc
        except Exception as e:
            # Log other errors and raise a generic 500
            logging.error(f"Error fetching company {company_id}: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Database error fetching company.")

    # --- Method needed by AnalysisService ---
    async def get_company_by_id(self, company_id: str) -> Optional[Company]:
        """Alias for get_company for clarity in AnalysisService."""
        return await self.get_company(company_id)
    # ---

    async def add_company(self, company: Company) -> Company: # Return Company model instance
        await self._ensure_initialized()
        try:
            # Check for existing company with same name and branch
            existing = await self.companies_collection.find_one({
                "name": company.name,
                "branch": company.branch
            })
            if existing:
                # Use HTTPException for duplicate conflict
                raise HTTPException(
                    status_code=409, # Conflict
                    detail=f"Company with name '{company.name}' and branch '{company.branch}' already exists"
                )

            # Use model_dump for serialization, exclude 'id' if it's None
            company_data = company.model_dump(exclude_none=True, exclude={"id"})
            response = await self.companies_collection.insert_one(company_data)

            # Get the inserted document and map it back to the model
            inserted_company_doc = await self.companies_collection.find_one({"_id": response.inserted_id})
            if not inserted_company_doc:
                 raise Exception("Failed to retrieve company after insertion.") # Should not happen

            inserted_company_model = await self._map_doc_to_model(inserted_company_doc)
            if not inserted_company_model:
                 raise Exception("Failed to map inserted company to model.")

            return inserted_company_model # Return the model instance

        except HTTPException as http_exc:
            raise http_exc # Re-raise HTTP exceptions
        except Exception as e:
            logging.error(f"Error adding company '{company.name}': {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Database error adding company.")


    async def update_company(self, company_id: str, company_update: CompanyUpdate) -> Optional[Company]: # Return Optional[Company]
        await self._ensure_initialized()
        try:
            try:
                object_id = ObjectId(company_id)
            except Exception:
                raise HTTPException(status_code=400, detail=f"Invalid company ID format: {company_id}")

            # Use exclude_unset=True for partial updates
            company_data = company_update.model_dump(exclude_unset=True)
            if not company_data:
                 raise HTTPException(status_code=400, detail="No update data provided")

            # If name or branch is being updated, check for duplicates (excluding self)
            if "name" in company_data or "branch" in company_data:
                current = await self.companies_collection.find_one({"_id": object_id})
                if not current: # Should not happen if ObjectId is valid, but check anyway
                     raise HTTPException(status_code=404, detail=f"Company with ID {company_id} not found for duplicate check.")
                search_filter = {
                    "name": company_data.get("name", current.get("name")),
                    "branch": company_data.get("branch", current.get("branch")),
                    "_id": {"$ne": object_id} # Exclude the current document
                }
                existing = await self.companies_collection.find_one(search_filter)
                if existing:
                    raise HTTPException(
                        status_code=409, # Conflict
                        detail=f"Another company with name '{search_filter['name']}' and branch '{search_filter['branch']}' already exists"
                    )

            # Perform the update
            updated_doc = await self.companies_collection.find_one_and_update(
                {"_id": object_id},
                {"$set": company_data},
                return_document=ReturnDocument.AFTER
            )

            if not updated_doc:
                raise HTTPException(status_code=404, detail=f"Company with ID {company_id} not found for update.")

            # Map and return the updated model instance
            return await self._map_doc_to_model(updated_doc)

        except HTTPException as http_exc:
            raise http_exc # Re-raise HTTP exceptions
        except Exception as e:
            logging.error(f"Error updating company {company_id}: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Database error updating company.")

    async def delete_company(self, company_id: str) -> Dict[str, str]: # Keep return type for confirmation
        await self._ensure_initialized()
        try:
            try:
                object_id = ObjectId(company_id)
            except Exception:
                raise HTTPException(status_code=400, detail=f"Invalid company ID format: {company_id}")

            response = await self.companies_collection.delete_one({"_id": object_id})
            if response.deleted_count == 0:
                raise HTTPException(status_code=404, detail=f"Company with ID {company_id} not found for deletion.")

            return {
                "status": "success",
                "message": "Company deleted successfully"
            }
        except HTTPException as http_exc:
            raise http_exc # Re-raise HTTP exceptions
        except Exception as e:
            logging.error(f"Error deleting company {company_id}: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Database error deleting company.")

# Instantiate the manager globally
company_mgr = CompanyMgr()