// alumni/components/API.ts
import { AlumniProfile } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetch alumni profile by user ID
 */
export const fetchAlumniProfileAPI = async (userId: string): Promise<AlumniProfile> => {
  const response = await fetch(`${API_BASE_URL}/alumni/get-user/${userId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch alumni profile: ${response.status}`);
  }
  
  return await response.json();
};

/**
 * Update alumni profile
 */
export const updateAlumniProfileAPI = async (profileId: string, profileData: AlumniProfile): Promise<AlumniProfile> => {
  const response = await fetch(`${API_BASE_URL}/alumni/update/${profileId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update alumni profile: ${response.status}`);
  }
  
  return await response.json();
};