export interface FacultyProfile {
  _id?: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  district: string;
  gender: string;
  email: string;
  alt_email?: string;
  ph_no?: string;
  alt_ph?: string;
  program: string;
}