import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pms.models.auth import UserLogin
from pms.services.user_services import UserMgr
from pms.db.database import DatabaseConnection, get_db

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

async def get_user_mgr(db: DatabaseConnection = Depends(get_db)) -> UserMgr:
    return UserMgr(db)

@router.post("/login") # Use the same path as tokenUrl in oauth2_scheme
async def login_for_access_token(
    user_login_data: UserLogin,
    user_mgr: UserMgr = Depends(get_user_mgr)
):
    """
    Logs in a user using email and password provided as form data.
    Returns an access token upon successful authentication.
    """
    try:
        response = await user_mgr.login_user(user=user_login_data)

        if not response or "access_token" not in response:
             logger.error(f"Login failed for {user_login_data.email}")
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        return response

    except HTTPException as he:
        # If login_user raises HTTPException (e.g., 401 for bad credentials), re-raise it
        logger.warning(f"Login failed for {user_login_data.email}: {he.detail} (Status: {he.status_code})")
        raise he
    except Exception as e:
        # Catch any other unexpected errors from the login service
        logger.error(f"Unexpected error during login for {user_login_data.email}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal error occurred during login.",
        )


'''change password'''
