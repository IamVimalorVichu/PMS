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
    form_data: UserLogin # Use standard form data
):
    """
    Logs in a user using email and password provided as form data.
    Returns an access token upon successful authentication.
    """
    try:
        # Adapt the call to user_mgr.login_user if it expects a model.
        # Option 1: If login_user expects email/password strings:
        # response = await user_mgr.login_user(email=form_data.username, password=form_data.password)

        # Option 2: If login_user MUST take the UserLogin model:
        user_login_data = UserLogin(email=form_data.email, password=form_data.password)
        response = await user_mgr.login_user(user_login_data)

        # Assuming user_mgr.login_user was adapted or already takes email/password:
        # Note: OAuth2PasswordRequestForm uses 'username' field for the first identifier (email in your case)
        # logger.info(f"Login attempt for user: {form_data.username}")
        # response = await user_mgr.login_user(email=form_data.username, password=form_data.password)

        # The login_user service should return a dictionary compatible with token response,
        # typically {"access_token": "...", "token_type": "bearer"}
        # It should raise specific HTTPExceptions on failure (e.g., 401, 400).
        if not response or "access_token" not in response:
             logger.error(f"Login service for {form_data.username} did not return valid token structure.")
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Login service error.")

        # Return the exact response from the service if it includes token_type etc.
        return response

    except HTTPException as he:
        # If login_user raises HTTPException (e.g., 401 for bad credentials), re-raise it
        logger.warning(f"Login failed for {form_data.username}: {he.detail} (Status: {he.status_code})")
        raise he
    except Exception as e:
        # Catch any other unexpected errors from the login service
        logger.error(f"Unexpected error during login for {form_data.username}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal error occurred during login.",
        )

# --- Logout Endpoint (Commented Out - Recommended Removal for Stateless JWT) ---
# @router.post("/logout")
# async def logout():
#     """
#     Placeholder for logout. Note: Stateless JWT logout is typically handled
#     client-side by discarding the token. Server-side requires a blocklist.
#     """
#     # If you implement a blocklist:
#     # try:
#     #     # Example: Get token from header, add to blocklist via a service
#     #     # token = Depends(oauth2_scheme)
#     #     # await auth_service.add_token_to_blocklist(token)
#     #     return {"message": "Logout successful (token invalidated if blocklist used)"}
#     # except Exception as e:
#     #     logger.error(f"Error during logout: {e}", exc_info=True)
#     #     raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Logout error.")
#     return {"message": "Logout endpoint hit. Client should discard token."}