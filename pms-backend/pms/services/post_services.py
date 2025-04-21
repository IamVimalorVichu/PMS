from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from fastapi import HTTPException, status
from pymongo import ReturnDocument

from pms.db.database import DatabaseConnection
from pms.models.post import PostCreate, Post, PostRead, VoteResult, VoteStatus
from pms.models.user import User, UserBasicInfo
# Assuming user_mgr is initialized and accessible
from pms.services.user_services import user_mgr

class PostMgr:
    """
    Service layer class for managing Post operations, including votes
    and admin approval workflows.
    """
    def __init__(self):
        self.db = None
        self.posts_collection = None
        # Ensure UserMgr is initialized before using it
        if not hasattr(user_mgr, 'users_collection') or user_mgr.users_collection is None:
             print("Warning: UserMgr might not be initialized.") # Or raise error / handle DI

    async def initialize(self):
        """Initializes database connection and collection."""
        self.db = DatabaseConnection()
        self.posts_collection = await self.db.get_collection("posts")
        # Create indexes if they don't exist (optional but recommended)
        await self.posts_collection.create_index([("author_id", 1)])
        await self.posts_collection.create_index([("created_at", -1)])
        await self.posts_collection.create_index([("is_approved", 1)])

    async def _get_author_basic_info(self, author_id: str) -> Optional[UserBasicInfo]:
        """Helper to fetch basic author details."""
        try:
            # Use the existing user_mgr instance
            user_data = await user_mgr.users_collection.find_one(
                {"_id": ObjectId(author_id)},
                {"_id": 1, "user_name": 1, "role": 1} # Projection
            )
            if user_data:
                user_data['_id'] = str(user_data['_id'])
                return UserBasicInfo(**user_data)
            return None
        except Exception:
            # Log error ideally
            return None

    async def create_post(self, post_data: PostCreate, current_user: User) -> Dict[str, Any]:
        """Creates a new post, checking permissions and setting approval status."""
        if not current_user.can_post:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User does not have permission to post.")

        post_doc = post_data.model_dump()
        post_doc["author_id"] = str(current_user.id) # Assuming current_user has id populated
        post_doc["created_at"] = datetime.utcnow()
        post_doc["upvoter_ids"] = []
        post_doc["comment_count"] = 0

        # Auto-approve if posted by admin, otherwise requires approval
        post_doc["is_approved"] = current_user.role == "admin"

        try:
            result = await self.posts_collection.insert_one(post_doc)
            inserted_id = str(result.inserted_id)
            return {"status": "success", "message": f"Post created with id: {inserted_id}", "id": inserted_id, "is_approved": post_doc["is_approved"]}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error creating post: {str(e)}")

    async def get_post_by_id(self, post_id: str, current_user: Optional[User] = None) -> Optional[PostRead]:
        """Fetches a single post by ID, populating author info."""
        try:
            post_doc = await self.posts_collection.find_one({"_id": ObjectId(post_id)})
            if not post_doc:
                return None

            # Check approval status unless user is admin or the author
            is_author = current_user and str(post_doc.get("author_id")) == current_user.id
            is_admin = current_user and current_user.role == "admin"

            if not post_doc.get("is_approved", False) and not is_admin and not is_author:
                 raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found or not approved.") # Treat as not found for non-admins

            post_doc["_id"] = str(post_doc["_id"])
            post_doc["upvote_count"] = len(post_doc.get("upvoter_ids", []))
            author_info = await self._get_author_basic_info(post_doc["author_id"])
            return PostRead(**post_doc, author=author_info)

        except Exception as e:
            # Avoid raising HTTP exception here if just not found, let caller handle None
             if "not found" in str(e).lower(): # Handle specific exceptions if needed
                return None
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error fetching post: {str(e)}")


    async def get_posts(self, skip: int = 0, limit: int = 10, current_user: Optional[User] = None) -> List[PostRead]:
        """Fetches a list of posts, filtering by approval status for non-admins."""
        query = {}
        # Non-admins only see approved posts
        if not current_user or current_user.role != "admin":
            query["is_approved"] = True

        try:
            posts_cursor = self.posts_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
            posts = []
            async for post_doc in posts_cursor:
                post_doc["_id"] = str(post_doc["_id"])
                post_doc["upvote_count"] = len(post_doc.get("upvoter_ids", []))
                author_info = await self._get_author_basic_info(post_doc["author_id"])
                posts.append(PostRead(**post_doc, author=author_info))
            return posts
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error fetching posts: {str(e)}")

    async def upvote_post(self, post_id: str, user_id: str) -> VoteResult:
        """Adds a user ID to the post's upvoter list."""
        try:
            result = await self.posts_collection.find_one_and_update(
                {"_id": ObjectId(post_id)},
                {"$addToSet": {"upvoter_ids": user_id}}, # $addToSet prevents duplicates
                projection={"upvoter_ids": 1}, # Only fetch needed field
                return_document=ReturnDocument.AFTER # Get the document *after* update
            )
            if not result:
                 raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

            new_count = len(result.get("upvoter_ids", []))
            return VoteResult(new_count=new_count, voted=True)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error upvoting post: {str(e)}")

    async def remove_upvote(self, post_id: str, user_id: str) -> VoteResult:
        """Removes a user ID from the post's upvoter list."""
        try:
            result = await self.posts_collection.find_one_and_update(
                {"_id": ObjectId(post_id)},
                {"$pull": {"upvoter_ids": user_id}}, # $pull removes the item
                projection={"upvoter_ids": 1},
                return_document=ReturnDocument.AFTER
            )
            if not result:
                 raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

            new_count = len(result.get("upvoter_ids", []))
            return VoteResult(new_count=new_count, voted=False)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error removing upvote: {str(e)}")

    async def get_user_vote_status(self, post_id: str, user_id: str) -> VoteStatus:
        """Checks if a specific user has upvoted a specific post."""
        try:
            # Check if the user_id exists within the upvoter_ids array for the given post_id
            post = await self.posts_collection.find_one(
                {"_id": ObjectId(post_id), "upvoter_ids": user_id},
                {"_id": 1} # Projection, just need to know if it exists
            )
            return VoteStatus(has_voted=bool(post))
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error checking vote status: {str(e)}")

    async def increment_comment_count(self, post_id: str):
        """Increments the denormalized comment count for a post."""
        try:
             await self.posts_collection.update_one(
                 {"_id": ObjectId(post_id)},
                 {"$inc": {"comment_count": 1}}
             )
        except Exception as e:
             # Log this error, but maybe don't raise HTTP exception to caller
             print(f"Error incrementing comment count for post {post_id}: {e}")

    async def decrement_comment_count(self, post_id: str):
        """Decrements the denormalized comment count (if a comment is deleted)."""
        try:
            await self.posts_collection.update_one(
                {"_id": ObjectId(post_id), "comment_count": {"$gt": 0}}, # Prevent going below 0
                {"$inc": {"comment_count": -1}}
            )
        except Exception as e:
            print(f"Error decrementing comment count for post {post_id}: {e}")


    # --- Admin Functions ---

    async def approve_post(self, post_id: str) -> Dict[str, Any]:
        """Sets a post's status to approved (Admin only)."""
        try:
            result = await self.posts_collection.update_one(
                {"_id": ObjectId(post_id)},
                {"$set": {"is_approved": True}}
            )
            if result.matched_count == 0:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
            if result.modified_count == 0:
                return {"status": "success", "message": "Post was already approved."}
            return {"status": "success", "message": "Post approved successfully."}
        except Exception as e:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error approving post: {str(e)}")

    async def reject_post(self, post_id: str) -> Dict[str, Any]:
        """Deletes a post, typically used for rejecting unapproved posts (Admin only)."""
        try:
            result = await self.posts_collection.delete_one({"_id": ObjectId(post_id)})
            if result.deleted_count > 0:
                return {"status": "success", "message": "Post rejected and deleted successfully."}
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error rejecting post: {str(e)}")


    async def get_pending_posts(self, skip: int = 0, limit: int = 10) -> List[PostRead]:
        """Fetches posts awaiting approval (Admin only)."""
        query = {"is_approved": False}
        try:
            posts_cursor = self.posts_collection.find(query).sort("created_at", 1).skip(skip).limit(limit) # Sort oldest first
            posts = []
            async for post_doc in posts_cursor:
                post_doc["_id"] = str(post_doc["_id"])
                post_doc["upvote_count"] = len(post_doc.get("upvoter_ids", []))
                author_info = await self._get_author_basic_info(post_doc["author_id"])
                posts.append(PostRead(**post_doc, author=author_info))
            return posts
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error fetching pending posts: {str(e)}")


# Instantiate the manager
post_mgr = PostMgr()