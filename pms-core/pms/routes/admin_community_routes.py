# pms/routes/admin_community_routes.py

from fastapi import APIRouter, BackgroundTasks, HTTPException, status, Query, Body, Path
from typing import List, Optional
from pms.models.post import PostRead
from pms.models.report import ReportRead, ReportUpdate
from pms.models.user import ApplyRestrictionsPayload, User, UserUpdate
# Import service managers
from pms.services.post_services import post_mgr
from pms.services.report_services import report_mgr
from pms.services.user_services import user_mgr
# Import ObjectId for potential validation if needed, though service layer handles it
from bson import ObjectId, errors as bson_errors

# Define router
router = APIRouter()

# --- Helper Function Placeholder for Admin Check ---
# You would implement this properly, likely calling user_mgr
async def verify_is_admin(admin_user_id: str):
    """Placeholder: Verifies if the given user ID belongs to an admin."""
    # --- !!! IMPLEMENT THIS CHECK THOROUGHLY !!! ---
    # Example:
    # try:
    #     user = await user_mgr.get_user(admin_user_id)
    #     if not user or user.get('role') != 'admin':
    #         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Action requires admin privileges.")
    # except Exception as e:
    #     # Log error
    #     raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error verifying admin status.")
    # --- End Implementation Placeholder ---
    print(f"TODO: Verify admin status for user ID: {admin_user_id}") # Remove in production
    # For now, let it pass through during development IF NEEDED, but this is insecure.
    # DO NOT DEPLOY without implementing the actual check.
    pass


# --- Admin Post Management ---

@router.get("/posts/pending/{admin_user_id}", response_model=List[PostRead])
async def get_pending_approval_posts(
    admin_user_id: str = Path(..., description="ID of the admin performing the action"),
    skip: int = 0,
    limit: int = Query(default=20, le=100),
):
    """Admin: Retrieves posts awaiting approval."""
    await verify_is_admin(admin_user_id) # Perform admin check
    try:
        posts = await post_mgr.get_pending_posts(skip=skip, limit=limit)
        return posts
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve pending posts.")

@router.post("/posts/{post_id}/approve/{admin_user_id}", status_code=status.HTTP_200_OK)
async def approve_a_post(
    post_id: str = Path(..., description="ID of the post to approve"),
    admin_user_id: str = Path(..., description="ID of the admin performing the action"),
):
    """Admin: Approves a pending post."""
    await verify_is_admin(admin_user_id) # Perform admin check
    try:
        result = await post_mgr.approve_post(post_id)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to approve post.")

@router.delete("/posts/{post_id}/reject/{admin_user_id}", status_code=status.HTTP_200_OK)
async def reject_a_post(
    post_id: str = Path(..., description="ID of the post to reject"),
    admin_user_id: str = Path(..., description="ID of the admin performing the action"),
):
    """Admin: Rejects (deletes) a pending post."""
    await verify_is_admin(admin_user_id) # Perform admin check
    try:
        result = await post_mgr.reject_post(post_id)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to reject post.")

# --- Admin Report Management ---

@router.get("/reports/{admin_user_id}", response_model=List[ReportRead])
async def get_submitted_reports(
    admin_user_id: str = Path(..., description="ID of the admin performing the action"),
    status_filter: Optional[str] = Query(default="pending", enum=["pending", "resolved", "dismissed"]),
    skip: int = 0,
    limit: int = Query(default=20, le=100),
):
    """Admin: Retrieves reports submitted by users, filterable by status."""
    await verify_is_admin(admin_user_id) # Perform admin check
    try:
        reports = await report_mgr.get_reports(status_filter=status_filter, skip=skip, limit=limit)
        return reports
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve reports.")

@router.post("/reports/{report_id}/resolve/{admin_user_id}", status_code=status.HTTP_200_OK)
async def resolve_a_report(
    report_id: str = Path(..., description="ID of the report to resolve"),
    admin_user_id: str = Path(..., description="ID of the admin performing the action"),
    update_data: ReportUpdate = Body(..., description="New status for the report"),
):
    """Admin: Updates the status of a report (e.g., to 'resolved' or 'dismissed')."""
    await verify_is_admin(admin_user_id) # Perform admin check
    try:
        result = await report_mgr.resolve_report(report_id, update_data)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to resolve report.")

# --- Admin User Permission Management ---

@router.get("/users/{admin_user_id}", response_model=List[User])
async def get_admin_user_list(
    admin_user_id: str = Path(..., description="ID of the admin performing the action"),
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    search: Optional[str] = Query(None, alias="q", min_length=2, max_length=50),
):
    """Admin: Fetches a list of users for management. Allows searching."""
    await verify_is_admin(admin_user_id) # Perform admin check
    try:
        users = await user_mgr.get_users_for_admin(skip=skip, limit=limit, search_query=search)
        return users
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve user list.")


@router.patch("/users/{user_id}/permissions/{admin_user_id}", response_model=User)
async def admin_update_user_permissions(
    user_id: str = Path(..., description="ID of the user whose permissions are being changed"),
    admin_user_id: str = Path(..., description="ID of the admin performing the action"),
    permissions: UserUpdate = Body(..., description="Permission flags to update (can_post, can_comment, can_message)"),
):
    """
    Admin: Updates a target user's community permissions.
    Allows updating can_post, can_comment, and can_message flags.
    """
    await verify_is_admin(admin_user_id)
    try:
        # Validate that at least one permission field is being updated
        if all(getattr(permissions, field) is None 
               for field in ['can_post', 'can_comment', 'can_message']):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one permission field must be provided"
            )
            
        updated_user = await user_mgr.update_user_permissions(user_id, permissions)
        if updated_user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target user not found"
            )
        return updated_user
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user permissions"
        )

@router.post("/users/{target_user_id}/restrict/{admin_user_id}", response_model=User)
async def admin_apply_user_restrictions(
    background_tasks: BackgroundTasks, # Inject BackgroundTasks dependency
    target_user_id: str = Path(..., description="ID of the user to apply restrictions to"),
    admin_user_id: str = Path(..., description="ID of the admin performing the action"),
    payload: ApplyRestrictionsPayload = Body(...)
):
    """
    Admin: Applies restrictions (posting, commenting, messaging) to a user
    for a specified duration (in days). Schedules automatic removal.
    """
    await verify_is_admin(admin_user_id) # Perform admin check

    try:
        updated_user = await user_mgr.apply_user_restrictions(
            target_user_id=target_user_id,
            payload=payload,
            background_tasks=background_tasks # Pass background tasks instance
        )
        if updated_user is None:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found.")
        return updated_user
    except HTTPException as he:
        raise he
    except Exception as e:
        # Log e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to apply restrictions.")
    
@router.get("/posts/comment/{comment_id}")
async def get_post_id_by_comment_id(
            comment_id: str = Path(..., description="ID of the comment"),
        ):
            """Admin: Gets the post ID for a given comment ID."""
            try:
                post_id = await post_mgr.get_post_id_by_comment_id(comment_id)
                if not post_id:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Post not found for the given comment ID"
                    )
                return {"post_id": post_id}
            except HTTPException as he:
                raise he
            except Exception as e:
                # Log e
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to retrieve post ID"
                )