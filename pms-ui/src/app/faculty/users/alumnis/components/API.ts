// src/app/services/alumniApi.ts
import { Alumni, AlumniFormData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetch all alumni records
 */
export const fetchAlumniAPI = async (): Promise<Alumni[]> => {
  const response = await fetch(`${API_BASE_URL}/alumni/get`, {
    method: "GET",
  });
  
  if (!response.ok) {
    throw new Error(`Server returned with an error: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Add a new alumni record
 */
export const addAlumniAPI = async (formData: AlumniFormData): Promise<Alumni> => {
  const response = await fetch(`${API_BASE_URL}/alumni/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to add alumni");
  }
  
  return await response.json();
};

/**
 * Update an existing alumni record
 */
export const updateAlumniAPI = async (alumniId: string, formData: AlumniFormData): Promise<Alumni> => {
  const response = await fetch(`${API_BASE_URL}/alumni/update/${alumniId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update alumni: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Delete an alumni record
 */
export const deleteAlumniAPI = async (alumniId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/alumni/delete/${alumniId}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete alumni: ${response.status}`);
  }
  
  return await response.json();
};