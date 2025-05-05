// src/services/types.ts

export interface Student {
  _id: string;
  user_id?: string;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  dob?: string; // ISO date string
  address?: string;
  city?: string;
  state?: string;
  district?: string;
  adm_no?: string;
  reg_no?: string;
  gender?: "Male" | "Female" | "Other" | "Select" | null;
  email: string;
  alt_email?: string;
  ph_no?: string;
  alt_ph?: string;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
  join_date?: string; // ISO date string
  end_date?: string; // ISO date string
  program?: 'MCA' | 'MBA' | 'BCA' | 'BBA';
  status?: 'Active' | 'Discontinued' | 'completed';
}

export interface StudentInputData {
  // Required fields
  first_name: string;
  email: string;
  
  // Optional fields - all others
  middle_name?: string;
  last_name?: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  district?: string;
  adm_no?: string;
  reg_no?: string;
  gender?: "Male" | "Female" | "Other" | "Select" | null;
  alt_email?: string;
  ph_no?: string;
  alt_ph?: string;
  join_date?: string;
  end_date?: string;
  program?: 'MCA' | 'MBA' | 'BCA' | 'BBA';
  status?: 'Active' | 'Discontinued' | 'completed';
}

export class ApiError extends Error {
  constructor(message: string, public status?: number, public details?: unknown) {
      super(message);
      this.name = 'ApiError';
  }
}

// Add Company types if they're needed in the same file
export interface Company {
  _id: string;
  name: string;
  site?: string;
  branch: string;
  desc?: string;
  email?: string | null;
  ph_no?: string;
  avg_salary?: number;
  placed_students?: string[];
}

export interface CompanyInputData {
  name: string;
  site?: string;
  branch: string;
  desc?: string;
  email?: string | null;
  ph_no?: string;
  avg_salary?: number;
  placed_students?: string[];
}

export interface StudentManagementState {
  students: Student[];
  isLoading: boolean;
  error: string | null;
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  currentStudent: Student | null;
  formData: StudentInputData;
  editFormData: StudentInputData;
  searchTerm: string;
  isSubmitting: boolean; // Add this
}