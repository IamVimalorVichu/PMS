// services/userAPI.ts (or wherever your global user API calls reside)
import Cookies from 'js-cookie';
import { User } from '@/components/types/types';
import { UserBasicInfo } from '@/app/community/types/auth';

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

// services/userAPI.ts (or app/community/services/userAPI.ts)


// --- Existing fetchUserProfileAPI ---
// ...

/**
 * Searches for users based on a query string.
 * Requires authentication and the current user's ID.
 */
export const searchUsersAPI = async (query: string, currentUserId: string, limit: number = 10): Promise<UserBasicInfo[]> => {
  if (!currentUserId) {
    throw new Error("Current User ID is required for search.");
  }
  if (!query || query.length < 2) {
    // Don't call API for short/empty queries
    return [];
  }

  const token = Cookies.get('access_token');
  if (!token) {
    throw new Error('Authentication required to search users.');
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Encode the query parameter
  const encodedQuery = encodeURIComponent(query);
  // Construct URL based on backend route
  const url = `${API_BASE_URL}/user/search/${currentUserId}?q=${encodedQuery}&limit=${limit}`;

  console.log(`Searching users: ${url}`); // Debug

  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
    cache: 'no-store', // Search results should likely be fresh
  });

  if (!response.ok) {
    let errorDetail = `Failed to search users (Status: ${response.status})`;
    try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } catch { /* Ignore */ }
    console.error("searchUsersAPI error:", errorDetail);
    const error = new Error(errorDetail); 
    throw error;
  }

  const users: UserBasicInfo[] = await response.json();
  console.log(`Found ${users.length} users matching query.`); // Debug
  return users;
};

export const updateUserAPI = async (userId: string, updateData: Partial<UserBasicInfo>): Promise<void> => {
  const token = Cookies.get('access_token');
  if (!token) {
    throw new Error('Authentication required to update user.');
  }

  const response = await fetch(`${API_BASE_URL}/user/update/${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    let errorDetail = `Failed to update user (Status: ${response.status})`;
    try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } catch { /* Ignore */ }
    console.error("updateUserAPI error:", errorDetail);
    throw new Error(errorDetail);
  }
}