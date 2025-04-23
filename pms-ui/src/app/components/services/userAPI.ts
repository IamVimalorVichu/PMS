// services/userAPI.ts (or wherever your global user API calls reside)
import Cookies from '../../../../node_modules/@types/js-cookie';
import { User } from '@/components/types/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetches the full user profile for the given user ID.
 * Requires a valid access token in cookies.
 */
export const fetchUserProfileAPI = async (userId: string): Promise<User> => {
  const token = Cookies.get('access_token');

  // Handle case where token might be missing, though this function
  // should ideally only be called if a user ID (from a token) exists.
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(`${API_BASE_URL}/user/get/${userId}`, { // Corrected path based on your info
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // Add the Authorization header
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    // Attempt to parse error details if available
    let errorDetail = `Failed to fetch user profile (Status: ${response.status})`;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorDetail;
    } catch {
      // Ignore if error response is not JSON
    }
    console.error("fetchUserProfileAPI error:", errorDetail);
    throw new Error(errorDetail);
  }

  const userData: User = await response.json();

  // IMPORTANT: Make sure the User type includes all necessary fields
  // fetched from the backend, including username, can_post, can_comment, etc.
  return userData;
};