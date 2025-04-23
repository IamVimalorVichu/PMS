// users/components/API.ts
import { User, UserFormData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetch all users
 */
export const fetchUsersAPI = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/user/get`, {
    method: "GET",
  });
  
  if (!response.ok) {
    throw new Error(`Server returned with an error: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Add a new user
 */
export const addUserAPI = async (userData: UserFormData): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/user/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to add user: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Update an existing user
 */
export const updateUserAPI = async (userId: string, userData: UserFormData): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/user/update/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Delete a user
 */
export const deleteUserAPI = async (userId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/user/delete/${userId}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.status}`);
  }
  
  return await response.json();
};