// src/app/types/alumni.ts

export type AlumniStatus = 'Employed' | 'Unemployed';

export interface Alumni {
  _id: string;
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  ph_no?: string;
  adm_no?: string;
  passout_year?: Date | string;
  status: AlumniStatus;
}

export interface AlumniFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  email?: string | null;
  ph_no?: string | null;
  adm_no: string;
  status: AlumniStatus | string;
}

export interface StatusOption {
  value: AlumniStatus;
  label: string;
}