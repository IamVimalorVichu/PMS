import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # Import standard form dependency
from pms.models.auth import UserLogin # Import if needed


# Assuming UserLogin model exists if needed by service, but form is used here
# from pms.models.auth import UserLogin
from pms.services.user_services import user_mgr

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/login") # Use the same path as tokenUrl in oauth2_scheme
async def login_for_access_token(
    # form_data: OAuth2PasswordRequestForm = Depends() # Use standard form data
        user_login_data: UserLogin

):
    """
    Logs in a user using email and password provided as form data.
    Returns an access token upon successful authentication.
    """
    try:
        # logger.info(f"Login attempt for user: {form_data.username}")
        # print(f"Login attempt for user: {form_data.username}")
        # user_login_data = UserLogin(email=form_data.username, password=form_data.password)
        # response = await user_mgr.login_user(user=user_login_data)
        response = await user_mgr.login_user(user=user_login_data)


        if not response or "access_token" not in response:
             logger.error(f"Login service for {user_login_data.email} did not return valid token structure.")
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Login service error.")

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
