// alumni/components/useAlumniProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { AlumniProfile, FormSection } from './types';
import { fetchAlumniProfileAPI, updateAlumniProfileAPI } from './API';
import useCurrentUser from '@/app/hooks/useUser';
import { toast } from 'react-toastify';

// Default profile data
const DEFAULT_PROFILE: AlumniProfile = {
  first_name: '',
  middle_name: '',
  last_name: '',
  dob: '',
  address: '',
  city: '',
  state: '',
  district: '',
  gender: '',
  email: '',
  alt_email: '',
  ph_no: '',
  alt_ph: '',
  program: '',
  batch: '',
  company: '',
  designation: '',
  linkedin: ''
};

// Form field definitions
export const formSections: FormSection[] = [
  {
    title: "Personal Information",
    fields: [
      { id: "first_name", label: "First Name", type: "text" },
      { id: "middle_name", label: "Middle Name", type: "text" },
      { id: "last_name", label: "Last Name", type: "text" },
      { 
        id: "gender", 
        label: "Gender", 
        type: "select",
        options: [
          { key: "Male", value: "Male" },
          { key: "Female", value: "Female" },
          { key: "Other", value: "Other" }
        ]
      }
    ]
  },
  {
    title: "Contact Information",
    fields: [
      { id: "email", label: "Email", type: "email" },
      { id: "alt_email", label: "Alternative Email", type: "email" },
      { id: "ph_no", label: "Phone Number", type: "tel" },
      { id: "alt_ph", label: "Alternative Phone", type: "tel" }
    ]
  },
  {
    title: "Academic Information",
    fields: [
      { 
        id: "program", 
        label: "Program", 
        type: "select",
        options: [
          { key: "MCA", value: "MCA" },
          { key: "MBA", value: "MBA" },
          { key: "BCA", value: "BCA" },
          { key: "BBA", value: "BBA" }
        ]
      },
      { id: "batch", label: "Batch", type: "text" }
    ]
  },
  {
    title: "Professional Information",
    fields: [
      { id: "company", label: "Company", type: "text" },
      { id: "designation", label: "Designation", type: "text" },
      { id: "linkedin", label: "LinkedIn Profile", type: "text" }
    ]
  },
  {
    title: "Address Information",
    fields: [
      { id: "address", label: "Address", type: "text" },
      { id: "city", label: "City", type: "text" },
      { id: "district", label: "District", type: "text" },
      { id: "state", label: "State", type: "text" }
    ]
  }
];

export const useAlumniProfile = () => {
  const { user, userloading } = useCurrentUser();
  const [profile, setProfile] = useState<AlumniProfile>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data when user is loaded
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchAlumniProfileAPI(user._id);
        setProfile(data);
      } catch (err: unknown) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        toast.error("Failed to fetch profile data");
        console.error("Error fetching profile:", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (!userloading) {
      fetchProfile();
    }
  }, [user, userloading]);

  // Handle form input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle select input changes
  const handleSelectChange = useCallback((name: string, value: string) => {
    setProfile(prev => ({ ...prev, [name]: value }));
  }, []);

  // Submit profile updates
  const handleSubmit = useCallback(async () => {
    if (!profile._id) {
      toast.error("Profile ID not found");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await updateAlumniProfileAPI(profile._id, profile);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err: unknown) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast.error("Failed to update profile");
      console.error("Error updating profile:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  return {
    profile,
    isEditing,
    loading: loading || userloading,
    error,
    formSections,
    handleInputChange,
    handleSelectChange,
    setIsEditing,
    handleSubmit
  };
};
