from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from fastapi import HTTPException, status
from pymongo import ReturnDocument
import pymongo

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

    async def create_post(self, post_data: PostCreate, user_id: str) -> Dict[str, Any]:
        """Creates a new post."""
        post_doc = post_data.model_dump(mode="json")
        post_doc["created_at"] = datetime.now()
        post_doc["author_id"] = user_id  # Set the author ID
        post_doc["upvoter_ids"] = []
        post_doc["comment_count"] = 0
        from pms.services.user_services import user_mgr
        # Check if the user is an admin
        user = await user_mgr.users_collection.find_one({"_id": ObjectId(user_id)})
        if user and user.get("role") == "admin":
            post_doc["is_approved"] = True
        else:
            post_doc["is_approved"] = False  # All other posts require approval

        try:
            result = await self.posts_collection.insert_one(post_doc)
            inserted_id = str(result.inserted_id)
            return {
                "status": "success",
                "message": f"Post created with id: {inserted_id}",
                "id": inserted_id,
                "is_approved": post_doc["is_approved"]
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail=f"Error creating post: {str(e)}"
            )

    async def get_post_by_id(self, post_id: str) -> Optional[PostRead]:
        """Fetches a single post by ID."""
        try:
            post_doc = await self.posts_collection.find_one({"_id": ObjectId(post_id)})
            if not post_doc:
                return None

            if not post_doc.get("is_approved", False):
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                  detail="Post not found or not approved.")

            post_doc["_id"] = str(post_doc["_id"])
            post_doc["upvote_count"] = len(post_doc.get("upvoter_ids", []))
            author_info = await self._get_author_basic_info(post_doc["author_id"])
            return PostRead(**post_doc, author=author_info)
        except Exception as e:
            if "not found" in str(e).lower():
                return None
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                              detail=f"Error fetching post: {str(e)}")

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
        except HTTPException as http_exc:
            # Re-raise HTTP exceptions as they are
            raise http_exc
        except ValueError as val_err:
            # Handle value errors, such as invalid ObjectId
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid input: {str(val_err)}")
        except TypeError as type_err:
            # Handle type errors, such as unexpected data types
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Type error: {str(type_err)}")
        except KeyError as key_err:
            # Handle missing keys in data
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Missing key: {str(key_err)}")
        except AttributeError as attr_err:
            # Handle attribute errors, such as NoneType issues
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Attribute error: {str(attr_err)}")
        except pymongo.errors.PyMongoError as pymongo_err:
            # Handle MongoDB-specific errors
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(pymongo_err)}")
        except Exception as e:
            # Catch-all for any other exceptions
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Unexpected error: {str(e)}")
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
    
    async def delete_post(self, post_id: str, user_id: str) -> Dict[str, Any]:
        """Deletes a post if the user is the author or an admin."""
        try:
            # First check if post exists and get author info
            post = await self.posts_collection.find_one({"_id": ObjectId(post_id)})
            if not post:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

            # Check if user is author or admin
            user = await user_mgr.users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

            if str(post["author_id"]) != user_id and user.get("role") != "admin":
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                                  detail="Not authorized to delete this post.")
            
            # Delete comments first
            from pms.services.comment_services import comment_mgr
            await comment_mgr.delete_comments_by_post_id(post_id)


            # Delete the post
            result = await self.posts_collection.delete_one({"_id": ObjectId(post_id)})
            if result.deleted_count > 0:
                return {"status": "success", "message": "Post deleted successfully."}
            
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                              detail=f"Error deleting post: {str(e)}")


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
    
    async def get_post_id_by_comment_id(self, comment_id: str) -> Optional[str]:
        """Fetches the post ID associated with a given comment ID."""
        try:
            # Assuming comments are stored in a separate collection
            from pms.services.comment_services import comment_mgr
            comment_doc = await comment_mgr.comments_collection.find_one({"_id": ObjectId(comment_id)}, {"post_id": 1})
            if comment_doc:
                return str(comment_doc["post_id"])
            return None
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error fetching post ID by comment ID: {str(e)}")


# Instantiate the manager
post_mgr = PostMgr()