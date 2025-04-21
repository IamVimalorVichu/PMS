from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from typing import List, Optional

from pms.models.post import PostRead
from pms.models.report import ReportRead, ReportUpdate
from pms.models.user import User, UserUpdate # Need UserUpdate for permissions
# Assuming an admin-specific dependency
from pms.services.auth_services import get_current_admin_user

# Import relevant service managers
from pms.services.post_services import post_mgr
from pms.services.report_services import report_mgr
from pms.services.user_services import user_mgr # Need user_mgr for permissions

router = APIRouter()

# --- Admin Post Management ---

@router.get("/posts/pending", response_model=List[PostRead])
async def get_pending_approval_posts(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    current_admin: User = Depends(get_current_admin_user) # Dependency ensures admin role
):
    """
    Retrieves posts that are awaiting admin approval.
    """
    try:
        posts = await post_mgr.get_pending_posts(skip=skip, limit=limit)
        return posts
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve pending posts.")

@router.post("/posts/{post_id}/approve", status_code=status.HTTP_200_OK)
async def approve_a_post(
    post_id: str,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Approves a pending post.
    """
    try:
        result = await post_mgr.approve_post(post_id)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to approve post.")

@router.delete("/posts/{post_id}/reject", status_code=status.HTTP_200_OK)
async def reject_a_post(
    post_id: str,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Rejects (deletes) a pending post.
    """
    try:
        result = await post_mgr.reject_post(post_id)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to reject post.")

# --- Admin Report Management ---

@router.get("/reports", response_model=List[ReportRead])
async def get_submitted_reports(
    status_filter: Optional[str] = Query(default="pending", enum=["pending", "resolved", "dismissed"]),
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Retrieves reports submitted by users, filterable by status.
    Defaults to 'pending' reports.
    """
    try:
        reports = await report_mgr.get_reports(status_filter=status_filter, skip=skip, limit=limit)
        return reports
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve reports.")

@router.post("/reports/{report_id}/resolve", status_code=status.HTTP_200_OK)
async def resolve_a_report(
    report_id: str,
    update_data: ReportUpdate, # Contains the new status
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Updates the status of a report (e.g., to 'resolved' or 'dismissed').
    """
    try:
        result = await report_mgr.resolve_report(report_id, update_data)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to resolve report.")

# --- Admin User Permission Management ---

@router.patch("/users/{user_id}/permissions", response_model=User) # Return updated user
async def update_user_community_permissions(
    user_id: str,
    # Use UserUpdate model, but only care about can_post/can_comment
    permissions: UserUpdate = Body(..., embed=True), # Embed ensures {"permissions": {"can_post": false}} structure
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Updates a user's permission to post or comment in the community.
    Expects body like: {"permissions": {"can_post": false, "can_comment": true}}
    Only updates fields provided (can_post, can_comment).
    """
    # Ensure we only process relevant fields
    update_data = UserUpdate(
        can_post=permissions.can_post,
        can_comment=permissions.can_comment
    )
    update_dict = update_data.model_dump(exclude_unset=True)

    if not update_dict:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid permission fields provided (can_post, can_comment).")

    try:
        # Assuming user_mgr has an 'update_user' method that handles partial updates
        updated_user = await user_mgr.update_user(user_id, UserUpdate(**update_dict))
        return updated_user
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update user permissions.")