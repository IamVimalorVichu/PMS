from datetime import datetime
from typing import List, Optional, Dict, Any, Literal
from bson import ObjectId
from fastapi import HTTPException, status
from pms.services.post_services import post_mgr
from pms.services.comment_services import comment_mgr
from pms.db.database import DatabaseConnection
from pms.models.report import ReportCreate, Report, ReportRead, ReportUpdate
from pms.models.user import User, UserBasicInfo
# Assuming user_mgr is initialized and accessible
from pms.services.user_services import user_mgr


class ReportMgr:
    """
    Service layer class for managing Report operations.
    """
    def __init__(self):
        self.db = None
        self.reports_collection = None
        # Ensure UserMgr is initialized before using it
        if not hasattr(user_mgr, 'users_collection') or user_mgr.users_collection is None:
             print("Warning: UserMgr might not be initialized.")

    async def initialize(self):
        """Initializes database connection and collection."""
        self.db = DatabaseConnection()
        self.reports_collection = await self.db.get_collection("reports")
        # Create indexes if they don't exist
        await self.reports_collection.create_index([("status", 1), ("created_at", -1)])
        await self.reports_collection.create_index([("reporter_id", 1)])
        await self.reports_collection.create_index([("reported_item_id", 1), ("item_type", 1)])


    async def _get_reporter_basic_info(self, reporter_id: str) -> Optional[UserBasicInfo]:
        """Helper to fetch basic reporter details."""
        try:
            user_data = await user_mgr.users_collection.find_one(
                {"_id": ObjectId(reporter_id)},
                {"_id": 1, "user_name": 1, "role": 1} # Projection
            )
            if user_data:
                user_data['_id'] = str(user_data['_id'])
                return UserBasicInfo(**user_data)
            return None
        except Exception:
            return None

    async def create_report(self, report_data: ReportCreate, reporter_id: str) -> Dict[str, Any]:
        """Creates a new report."""
        report_doc = report_data.model_dump()
        report_doc["reporter_id"] = reporter_id
        report_doc["created_at"] = datetime.utcnow()
        report_doc["status"] = "pending"

        try:
            result = await self.reports_collection.insert_one(report_doc)
            inserted_id = str(result.inserted_id)
            return {
                "status": "success", 
                "message": f"Report submitted successfully with id: {inserted_id}", 
                "_id": inserted_id
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail=f"Error creating report: {str(e)}"
            )

    # --- Admin Functions ---

    async def get_reports(self, status_filter: Optional[Literal['pending', 'resolved', 'dismissed']] = "pending", skip: int = 0, limit: int = 20) -> List[ReportRead]:
        """Fetches reports, usually filtered by status (Admin only)."""
        query = {}
        if status_filter:
            query["status"] = status_filter

        try:
            reports_cursor = self.reports_collection.find(query).sort("created_at", 1).skip(skip).limit(limit) # Oldest pending first
            reports = []
            async for report_doc in reports_cursor:
                report_doc["_id"] = str(report_doc["_id"])
                reporter_info = await self._get_reporter_basic_info(report_doc["reporter_id"])
                reports.append(ReportRead(**report_doc, reporter=reporter_info))
            return reports
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error fetching reports: {str(e)}")


    async def resolve_report(self, report_id: str, report_update_data: ReportUpdate) -> Dict[str, Any]:
        """Updates the status of a report (Admin only)."""
        update_data = report_update_data.model_dump(exclude_unset=True) # Use exclude_unset for PATCH-like behavior
        if not update_data:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided.")

        try:
            result = await self.reports_collection.update_one(
                {"_id": ObjectId(report_id)},
                {"$set": update_data}
            )
            if result.matched_count == 0:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
            # modified_count check is less useful here as status might be set to the same value
            return {"status": "success", "message": f"Report status updated to {update_data['status']}."}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error resolving report: {str(e)}")

    async def get_reports(self, status_filter: Optional[Literal['pending', 'resolved', 'dismissed']] = "pending", skip: int = 0, limit: int = 20) -> List[Dict[str, Any]]: # Return list of dicts now
        """Fetches reports, populating reporter info and target user ID."""
        query = {}
        if status_filter:
            query["status"] = status_filter

        try:
            reports_cursor = self.reports_collection.find(query).sort("created_at", 1).skip(skip).limit(limit)
            reports_list = []
            async for report_doc in reports_cursor:
                report_doc["id"] = str(report_doc["_id"]) # Use 'id' for consistency
                report_doc.pop("_id", None) # Remove original _id

                # Populate reporter info
                reporter_info = await self._get_reporter_basic_info(report_doc["reporter_id"])
                report_doc["reporter"] = reporter_info.model_dump() if reporter_info else None

                # --- Determine and add target_user_id ---
                target_user_id = None
                item_type = report_doc.get("item_type")
                item_id = report_doc.get("reported_item_id")

                if item_type == 'user':
                    target_user_id = item_id # The reported item *is* the user
                elif item_type == 'post' and item_id:
                    # Fetch post to get author_id
                    # Use a lightweight fetch if possible, or ensure get_post_by_id is efficient
                    post_doc = await post_mgr.posts_collection.find_one(
                        {"_id": ObjectId(item_id)},
                        {"author_id": 1} # Only fetch author_id
                    )
                    if post_doc:
                        target_user_id = str(post_doc.get("author_id"))
                elif item_type == 'comment' and item_id:
                    # Fetch comment to get author_id
                    comment_doc = await comment_mgr.get_comment_by_id(item_id)
                    if comment_doc:
                        target_user_id = str(comment_doc.get("author_id"))

                report_doc["target_user_id"] = target_user_id
                # -----------------------------------------

                reports_list.append(report_doc)

            # Validate using Pydantic model before returning if needed,
            # but returning dicts allows flexibility if model isn't perfectly matched yet.
            # validated_reports = [ReportRead(**r) for r in reports_list]
            # return validated_reports
            return reports_list # Return list of dictionaries

        except Exception as e:
            print(f"Error fetching reports for admin: {e}")
            # Log error properly
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error fetching reports: {str(e)}")

    async def resolve_report(self, report_id: str, report_update_data: ReportUpdate) -> Dict[str, Any]:
        """Updates the status of a report (Admin only)."""
        # ... (resolve_report logic remains the same - it just updates status) ...
        update_data = report_update_data.model_dump(exclude_unset=True)
        if not update_data:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided.")
        try:
            result = await self.reports_collection.update_one(
                {"_id": ObjectId(report_id)},
                {"$set": update_data}
            )
            if result.matched_count == 0:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
            return {"status": "success", "message": f"Report status updated to {update_data['status']}."}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error resolving report: {str(e)}")

# Instantiate the manager
report_mgr = ReportMgr()