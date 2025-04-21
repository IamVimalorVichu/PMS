from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from fastapi import HTTPException, status

from pms.db.database import DatabaseConnection
from pms.models.comment import CommentCreate, Comment, CommentRead
from pms.models.user import User, UserBasicInfo
# Assuming user_mgr and post_mgr are initialized and accessible
from pms.services.user_services import user_mgr
from pms.services.post_services import post_mgr

class CommentMgr:
    """
    Service layer class for managing Comment operations.
    """
    def __init__(self):
        self.db = None
        self.comments_collection = None
        # Ensure dependencies are initialized
        if not hasattr(user_mgr, 'users_collection') or user_mgr.users_collection is None:
             print("Warning: UserMgr might not be initialized.")
        if not hasattr(post_mgr, 'posts_collection') or post_mgr.posts_collection is None:
            print("Warning: PostMgr might not be initialized.")


    async def initialize(self):
        """Initializes database connection and collection."""
        self.db = DatabaseConnection()
        self.comments_collection = await self.db.get_collection("comments")
        # Create indexes if they don't exist
        await self.comments_collection.create_index([("post_id", 1), ("created_at", -1)])
        await self.comments_collection.create_index([("author_id", 1)])

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

    async def create_comment(self, comment_data: CommentCreate, post_id: str, current_user: User) -> CommentRead:
        """Creates a new comment on a post, checking permissions."""
        if not current_user.can_comment:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User does not have permission to comment.")

        # Check if the post exists and is approved (optional, depends on requirements)
        # post = await post_mgr.get_post_by_id(post_id, current_user) # Reuse existing check logic
        # if not post:
        #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found or not accessible.")

        comment_doc = comment_data.model_dump()
        comment_doc["post_id"] = post_id
        comment_doc["author_id"] = str(current_user.id)
        comment_doc["created_at"] = datetime.utcnow()

        try:
            result = await self.comments_collection.insert_one(comment_doc)
            inserted_id = str(result.inserted_id)

            # Increment comment count on the post (fire and forget is okay here)
            await post_mgr.increment_comment_count(post_id)

            # Fetch the created comment data to return it with author info
            created_comment_doc = await self.comments_collection.find_one({"_id": result.inserted_id})
            if created_comment_doc:
                 created_comment_doc["_id"] = str(created_comment_doc["_id"])
                 author_info = await self._get_author_basic_info(created_comment_doc["author_id"])
                 return CommentRead(**created_comment_doc, author=author_info)
            else:
                 # Should not happen if insert succeeded, but handle defensively
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve created comment.")

        except Exception as e:
            # Catch specific exceptions like pymongo duplicate key errors if needed
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error creating comment: {str(e)}")

    async def get_comments_for_post(self, post_id: str, skip: int = 0, limit: int = 20) -> List[CommentRead]:
        """Fetches comments for a specific post with author info."""
        query = {"post_id": post_id}
        try:
            comments_cursor = self.comments_collection.find(query).sort("created_at", 1).skip(skip).limit(limit) # Sort oldest first
            comments = []
            async for comment_doc in comments_cursor:
                comment_doc["_id"] = str(comment_doc["_id"])
                author_info = await self._get_author_basic_info(comment_doc["author_id"])
                comments.append(CommentRead(**comment_doc, author=author_info))
            return comments
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error fetching comments: {str(e)}")

    async def delete_comment(self, comment_id: str, current_user: User) -> Dict[str, Any]:
        """Deletes a comment (requires Admin role or being the author)."""
        try:
            comment_doc = await self.comments_collection.find_one({"_id": ObjectId(comment_id)})
            if not comment_doc:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")

            # Permission check
            is_author = str(comment_doc.get("author_id")) == current_user.id
            is_admin = current_user.role == "admin"

            if not is_author and not is_admin:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User does not have permission to delete this comment.")

            # Proceed with deletion
            result = await self.comments_collection.delete_one({"_id": ObjectId(comment_id)})

            if result.deleted_count > 0:
                # Decrement comment count on the post
                await post_mgr.decrement_comment_count(comment_doc["post_id"])
                return {"status": "success", "message": "Comment deleted successfully."}
            else:
                # Should not happen if find_one succeeded before, but handle defensively
                 raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found during delete operation.")

        except HTTPException as he: # Re-raise HTTP exceptions
            raise he
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error deleting comment: {str(e)}")


# Instantiate the manager
comment_mgr = CommentMgr()