// src/app/hooks/useFacultyProfile.ts

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FacultyProfile } from './types'; // Adjust the import path as necessary
import { getFacultyProfileAPI, updateFacultyProfileAPI } from './API';
import useCurrentUser from '@/app/hooks/useUser';

const DEFAULT_PROFILE: FacultyProfile = {
  first_name: '',
  middle_name: '',
  last_name: '',
  dob: '',
  address: '',
  city: '',
  state: '',
  district: '',
  gender: '',
  email: null,
  alt_email: null,
  ph_no: null,
  alt_ph: null,
  program: ''
};

export const useFacultyProfile = () => {
  const { user, userloading } = useCurrentUser();
  const [profile, setProfile] = useState<FacultyProfile>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch profile data when user is loaded
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id) return;
      
      setIsLoading(true);
      try {
        const data = await getFacultyProfileAPI(user._id);
        setProfile(data);
      } catch (error) {
        toast.error("Failed to fetch profile data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!userloading) {
      fetchProfile();
    }
  }, [user, userloading]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle select input changes
  const handleSelectChange = (name: string, value: string) => {
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Submit profile updates
  const updateProfile = async () => {
    if (!profile._id) return;
    
    setIsLoading(true);
    try {
      await updateFacultyProfileAPI(profile._id, profile);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isEditing,
    isLoading: isLoading || userloading,
    handleInputChange,
    handleSelectChange,
    setIsEditing,
    updateProfile
  };
};