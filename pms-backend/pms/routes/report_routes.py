from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from typing import List, Optional

from pms.models.post import (
    PostCreate, PostRead, VoteStatus, VoteResult
)
from pms.models.comment import CommentCreate, CommentRead
from pms.models.user import User
# Assuming you have these auth dependencies
from pms.services.auth_services import get_current_active_user

# Import the service managers
from pms.services.post_services import post_mgr
from pms.services.comment_services import comment_mgr

router = APIRouter()

# --- Post Endpoints ---

@router.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_new_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Creates a new post. Requires admin approval unless posted by an admin.
    """
    try:
        # The service handles checking user's can_post permission
        result = await post_mgr.create_post(post_data, current_user)
        # Return the result dictionary from the service
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create post.")

@router.get("/posts", response_model=List[PostRead])
async def list_posts(
    skip: int = 0,
    limit: int = Query(default=10, le=50), # Limit results per page
    current_user: User = Depends(get_current_active_user) # Pass user to service for filtering
):
    """
    Retrieves a list of approved posts. Admins see all posts.
    Sorted by creation date descending.
    """
    try:
        posts = await post_mgr.get_posts(skip=skip, limit=limit, current_user=current_user)
        return posts
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve posts.")

@router.get("/posts/{post_id}", response_model=PostRead)
async def get_single_post(
    post_id: str,
    current_user: User = Depends(get_current_active_user) # Pass user to service for access check
):
    """
    Retrieves a single post by its ID.
    Requires the post to be approved unless viewed by admin or author.
    """
    try:
        post = await post_mgr.get_post_by_id(post_id, current_user)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found or not accessible.")
        return post
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve post.")

# --- Comment Endpoints ---

@router.post("/posts/{post_id}/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
async def add_comment_to_post(
    post_id: str,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Adds a comment to a specific post.
    """
    try:
        # Service handles checking user's can_comment permission
        comment = await comment_mgr.create_comment(comment_data, post_id, current_user)
        return comment
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add comment.")

@router.get("/posts/{post_id}/comments", response_model=List[CommentRead])
async def get_post_comments(
    post_id: str,
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    current_user: User = Depends(get_current_active_user) # Needed for dependency check, might use later
):
    """
    Retrieves comments for a specific post. Sorted oldest first.
    """
    try:
        # First, check if the post itself is accessible to the user
        post_accessible = await post_mgr.get_post_by_id(post_id, current_user)
        if not post_accessible:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found or not accessible.")

        comments = await comment_mgr.get_comments_for_post(post_id, skip=skip, limit=limit)
        return comments
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve comments.")

@router.delete("/comments/{comment_id}", status_code=status.HTTP_200_OK)
async def delete_a_comment(
    comment_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Deletes a comment. Requires user to be the author or an admin.
    """
    try:
        result = await comment_mgr.delete_comment(comment_id, current_user)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete comment.")


# --- Vote Endpoints ---

@router.post("/posts/{post_id}/upvote", response_model=VoteResult)
async def upvote_a_post(
    post_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Adds the current user's upvote to a post. Idempotent.
    Returns the new vote count and the user's vote status (true).
    """
    try:
        # Ensure post exists and is accessible first (implicit check in service is possible too)
        post_accessible = await post_mgr.get_post_by_id(post_id, current_user)
        if not post_accessible:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found or not accessible.")

        result = await post_mgr.upvote_post(post_id, str(current_user.id))
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to upvote post.")

@router.delete("/posts/{post_id}/upvote", response_model=VoteResult)
async def remove_post_upvote(
    post_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Removes the current user's upvote from a post. Idempotent.
    Returns the new vote count and the user's vote status (false).
    """
    try:
        # Ensure post exists and is accessible first
        post_accessible = await post_mgr.get_post_by_id(post_id, current_user)
        if not post_accessible:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found or not accessible.")

        result = await post_mgr.remove_upvote(post_id, str(current_user.id))
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to remove upvote.")

@router.get("/posts/{post_id}/vote-status", response_model=VoteStatus)
async def get_my_vote_status_for_post(
    post_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Checks if the currently logged-in user has upvoted the specified post.
    """
    try:
        # Ensure post exists and is accessible first
        post_accessible = await post_mgr.get_post_by_id(post_id, current_user)
        if not post_accessible:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found or not accessible.")

        status = await post_mgr.get_user_vote_status(post_id, str(current_user.id))
        return status
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to check vote status.")