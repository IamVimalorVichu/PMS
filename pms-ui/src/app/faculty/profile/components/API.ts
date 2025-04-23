// src/app/services/api.ts

import { FacultyProfile } from '@/app/faculty/profile/components/types'; // Adjust the import path as necessary

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


/**
 * Fetch faculty profile by user ID
 */
export const getFacultyProfileAPI = async (userId: string): Promise<FacultyProfile> => {
    const response = await fetch(`${API_BASE_URL}/faculty/get-user/${userId}`, {
      method: "GET",
    });
    
    if (!response.ok) {
      throw new Error(`Server returned with an error: ${response.status}`);
    }
    
    return await response.json();
  };
  
  /**
   * Update faculty profile
   */
  export const updateFacultyProfileAPI = async (profileId: string, profileData: FacultyProfile): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/faculty/update/${profileId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      throw new Error(`Server returned with an error: ${response.status}`);
    }
    
    return await response.json();
  };