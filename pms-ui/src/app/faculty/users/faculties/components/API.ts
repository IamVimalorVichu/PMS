// faculty/components/api.ts
import { Faculty, FacultyFormData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetch all faculty members
 */
export const fetchFacultyAPI = async (): Promise<Faculty[]> => {
  const response = await fetch(`${API_BASE_URL}/faculty/get`);
  
  if (!response.ok) {
    throw new Error(`Server returned with an error: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Add a new faculty member
 */
export const addFacultyAPI = async (formData: FacultyFormData): Promise<Faculty> => {
  const response = await fetch(`${API_BASE_URL}/faculty/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to add faculty");
  }
  
  return await response.json();
};

/**
 * Update an existing faculty member
 */
export const updateFacultyAPI = async (facultyId: string, formData: FacultyFormData): Promise<Faculty> => {
  const response = await fetch(`${API_BASE_URL}/faculty/update/${facultyId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update faculty: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Delete a faculty member
 */
export const deleteFacultyAPI = async (facultyId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/faculty/delete/${facultyId}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete faculty: ${response.status}`);
  }
  
  return await response.json();
};