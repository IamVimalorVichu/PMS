from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from pms.db.database import DatabaseConnection
from pms.models.comment import CommentCreate, Comment, CommentRead
from pms.models.user import UserBasicInfo
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

    async def create_comment(self, comment_data: CommentCreate, post_id: str, user_id: str) -> CommentRead:
        """Creates a new comment on a post."""
        comment_doc = comment_data.model_dump()
        comment_doc["post_id"] = post_id
        comment_doc["author_id"] = user_id  # Add user_id as author_id
        comment_doc["created_at"] = datetime.now()

        try:
            result = await self.comments_collection.insert_one(comment_doc)
            # Increment comment count on the post
            await post_mgr.increment_comment_count(post_id)

            created_comment_doc = await self.comments_collection.find_one({"_id": result.inserted_id})
            if created_comment_doc:
                created_comment_doc["_id"] = str(created_comment_doc["_id"])
                author_info = await self._get_author_basic_info(created_comment_doc["author_id"])
                return CommentRead(**created_comment_doc, author=author_info)
            else:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                  detail="Failed to retrieve created comment.")
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                              detail=f"Error creating comment: {str(e)}")

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

    async def delete_comment(self, comment_id: str, user_id: str) -> Dict[str, Any]:
        """Deletes a comment if user is author or admin."""
        try:
            # First check if comment exists and get its details
            comment_doc = await self.comments_collection.find_one({"_id": ObjectId(comment_id)})
            if not comment_doc:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                  detail="Comment not found.")

            # Check if user is author or admin
            user = await user_mgr.users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                  detail="User not found.")

            if user["role"] != "admin" and str(comment_doc["author_id"]) != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                  detail="Not authorized to delete this comment.")

            result = await self.comments_collection.delete_one({"_id": ObjectId(comment_id)})
            if result.deleted_count > 0:
                await post_mgr.decrement_comment_count(comment_doc["post_id"])
                return {"status": "success", "message": "Comment deleted successfully."}
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                  detail="Comment not found during delete operation.")
        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                              detail=f"Error deleting comment: {str(e)}")

    async def get_comment_by_id(self, comment_id: str) -> Optional[Dict[str, Any]]:
        """Fetches a single comment document by its ID."""
        try:
            comment_doc = await self.comments_collection.find_one({"_id": ObjectId(comment_id)})
            if comment_doc:
                # No need to stringify ID here, just return the raw doc or relevant fields
                return comment_doc
            return None
        except InvalidId:
            print(f"Invalid ObjectId format for comment_id: {comment_id}")
            return None
        except Exception as e:
            print(f"Error fetching comment {comment_id}: {e}")
            # Don't raise HTTP exceptions from internal service calls usually
            return None # Indicate failure to fetch
    
    async def delete_comments_by_post_id(self, post_id: str) -> Dict[str, Any]:
        """Deletes all comments associated with a specific post."""
        try:
            result = await self.comments_collection.delete_many({"post_id": post_id})
            if result.deleted_count > 0:
                return {"status": "success", "message": f"{result.deleted_count} comments deleted."}
            else:
                return {"status": "info", "message": "No comments found for this post."}
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                              detail=f"Error deleting comments: {str(e)}")


# Instantiate the manager
comment_mgr = CommentMgr()