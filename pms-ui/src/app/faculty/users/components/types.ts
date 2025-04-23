// users/components/types.ts

export type UserRole = 'admin' | 'faculty' | 'student' | 'alumni';
export type UserStatus = 'Active' | 'Inactive';
export type Gender = 'Male' | 'Female' | 'Other';

export interface User {
  _id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  ph_no: string;
  role: UserRole;
  status: UserStatus;
}

export interface UserFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  ph_no: string;
  role: string;
}

export interface OptionType {
  value: string;
  label: string;
}