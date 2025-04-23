// faculty/components/types.ts

export type ProgramType = 'MCA' | 'MBA' | 'BCA' | 'BBA';
export type FacultyStatus = 'Active' | 'Resigned';

export interface Faculty {
  _id: string;
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  ph_no?: string;
  program: ProgramType;
  status: FacultyStatus;
}

export interface FacultyFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  ph_no: string;
  program: string;
  status: string;
}

export interface OptionType {
  value: string;
  label: string;
}