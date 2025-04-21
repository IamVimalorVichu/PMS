import logging # Added logging
from datetime import datetime, timedelta, timezone # Use timezone aware datetime
from typing import Dict, Any, Optional

from fastapi import Depends, HTTPException, status # Import status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError

from pms.core.config import config
from pms.models.user import User

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Exceptions ---
credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

forbidden_exception = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Operation not permitted", # Changed detail message slightly
)


# --- Token Creation (Corrected) ---
# NOTE: Ensure this function is called correctly from your user_mgr.login_user
# It MUST receive the user_id in the 'data' dictionary to set the 'sub' claim.
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Creates a JWT access token.

    Args:
        data: Dictionary containing payload data. MUST include user ID
              under a key like '_id' or 'id'.
        expires_delta: Optional timedelta for token expiry. Defaults to config.

    Returns:
        The encoded JWT string.

    Raises:
        ValueError: If SECRET_KEY is not set or user ID is missing in data.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc) # Use timezone-aware UTC now

    if expires_delta:
        expire = now + expires_delta
    else:
        # Use configured expiry time
        expire = now + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": now}) # Add issued-at timestamp

    # --- CRITICAL: Set the 'sub' (subject) claim ---
    user_id = None
    if "_id" in to_encode:
         user_id = str(to_encode["_id"])
         del to_encode["_id"] # Remove original _id if present
    elif "id" in to_encode:
         user_id = str(to_encode["id"])
         del to_encode["id"]

    if not user_id:
        raise ValueError("User ID ('_id' or 'id') must be included in token data for 'sub' claim.")
    to_encode["sub"] = user_id
    # --- End 'sub' claim logic ---

    if not config.SECRET_KEY:
            raise ValueError("SECRET_KEY is not set in the config.")

    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return encoded_jwt


# --- OAuth2 Scheme ---
# Make sure '/auth/login' matches the EXACT path of your login endpoint below
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# --- Token Verification Dependency ---
async def verify_token(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Internal dependency: Verifies the JWT token and returns the payload if valid.
    Raises credentials_exception if token is invalid or expired.
    """
    try:
        payload = jwt.decode(
            token, config.SECRET_KEY, algorithms=[config.ALGORITHM]
        )
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            logger.warning("User ID ('sub') not found in token payload.")
            raise credentials_exception

        # Check expiry using 'exp' claim (standard)
        expires = payload.get("exp")
        if not expires or datetime.now(timezone.utc) > datetime.fromtimestamp(expires, tz=timezone.utc):
            logger.info("Token has expired.")
            raise credentials_exception

        return payload

    except jwt.ExpiredSignatureError:
        logger.info("JWT Expired Signature Error")
        raise credentials_exception
    except JWTError as e:
        logger.warning(f"JWTError during token decode: {e}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Unexpected error during token decode: {e}", exc_info=True)
        raise credentials_exception


# --- User Fetching Dependencies ---
async def get_current_user(payload: Dict[str, Any] = Depends(verify_token)) -> User:
    """
    Dependency: Verifies token, fetches user from DB based on 'sub' claim.
    Returns the User object. Raises credentials_exception if validation fails.
    """
    user_id = payload.get("sub") # Already validated by verify_token

    try:
        # Ensure user_mgr is usable
        from pms.services.user_services import user_mgr
        if not hasattr(user_mgr, 'get_user') or not callable(user_mgr.get_user):
             logger.critical("UserMgr or get_user method not available/initialized.")
             raise RuntimeError("User service unavailable.") # Internal server error

        user_data = await user_mgr.get_user(user_id)
        if user_data is None:
            logger.warning(f"User with ID {user_id} from valid token not found in DB.")
            raise credentials_exception

        if not isinstance(user_data, dict):
            logger.error(f"User data fetched for {user_id} is not a dict: {type(user_data)}")
            raise credentials_exception

        # Validate DB data against Pydantic model
        user = User(**user_data)
        return user

    except ValidationError as e:
        logger.error(f"Pydantic Validation Error fetching user {user_id}: {e}")
        raise credentials_exception # Treat validation error as credential issue
    except Exception as e:
        logger.error(f"Error fetching/parsing user {user_id}: {e}", exc_info=True)
        # Don't expose internal error details directly
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error processing user data.")


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency: Ensures the fetched user is 'Active'.
    Raises forbidden_exception if inactive.
    """
    if current_user.status != "Active":
        logger.info(f"Access denied for inactive user {current_user.id} (status: {current_user.status})")
        raise forbidden_exception
    return current_user


async def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Dependency: Ensures the fetched user is 'Active' and has the 'admin' role.
    Raises forbidden_exception if not an admin.
    """
    if current_user.role != "admin":
        logger.info(f"Admin access denied for user {current_user.id} (role: {current_user.role})")
        raise forbidden_exception
    return current_user