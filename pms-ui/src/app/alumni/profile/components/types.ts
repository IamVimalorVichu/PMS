// alumni/components/types.ts

export interface AlumniProfile {
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
    alt_email: string;
    ph_no: string;
    alt_ph: string;
    program: string;
    batch: string;
    company: string;
    designation: string;
    linkedin: string;
  }
  
  export interface SelectOption {
    key: string;
    value: string;
  }
  
  export interface FormSection {
    title: string;
    fields: FormField[];
  }
  
  export type FormField = 
    | { id: string; label: string; type: 'text' | 'email' | 'tel' }
    | { id: string; label: string; type: 'select'; options: SelectOption[] };
