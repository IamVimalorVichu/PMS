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
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(typeof data.detail === 'object' ? JSON.stringify(data.detail) : data.detail);
  }
  
  return data;
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

  const data = await response.json();
  
  if (!response.ok) {
    if (Array.isArray(data.detail)) {
      throw new Error(data.detail.map((err: { msg: string }) => err.msg).join('\n'));
    }
    throw new Error(data.detail);
  }

  return data;
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

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(typeof data.detail === 'object' ? JSON.stringify(data.detail) : data.detail);
  }

  return data;
};

/**
 * Delete a user
 */
export const deleteUserAPI = async (userId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/user/delete/${userId}`, {
    method: "DELETE",
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(typeof data.detail === 'object' ? JSON.stringify(data.detail) : data.detail);
  }

  return data;
};