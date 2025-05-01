export interface User {
  _id: string;
  user_name?: string;
  avatarUrl?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  gender?: 'Male' | 'Female' | 'Other';
  email?: string;
  ph_no?: string;
  password?: string;
  role?: 'admin' | 'faculty' | 'student' | 'alumni';
  status?: 'Inactive' | 'Active';
  can_post?: boolean;
  can_comment?: boolean;
  can_message?: boolean;
  restricted_until?: string | null; // Frontend usually receives dates as ISO strings or null

}

export interface UserUpdate {
  user_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  gender?: 'Male' | 'Female' | 'Other';
  email?: string;
  ph_no?: string;
  password?: string;
  role?: 'admin' | 'faculty' | 'student' | 'alumni';
  status?: 'Inactive' | 'Active';
  can_post?: boolean;
  can_comment?: boolean;
  can_message?: boolean;
  restricted_until?: string | null; // Frontend usually receives dates as ISO strings or null

}

export interface Requirement {
    _id?: string;
    job: string;
    experience_required: number;
    sslc_cgpa?: number;
    plustwo_cgpa?: number;
    degree_cgpa?: number;
    mca_cgpa?: number[];
    contract?: number;
    additional_criteria?: string;
    skills_required?: string[];
    preferred_qualifications?: string[];
    required_certifications?: string[];
    language_requirements?: string[];
  }

  export interface Student {
    _id: string;
    user_id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    dob: Date;
    address: string;
    city: string;
    state: string;
    district: string;
    adm_no: string;
    reg_no: string;
    gender: string;
    email: string;
    alt_email: string;
    ph_no: string;
    alt_ph: string;
    join_date: string;
    end_date: Date;  
    program: string;
    status: string;
  }
  
  export interface FileInfo {
    filename: string;
    filepath: string;
  }
  
  export interface Performance {
    _id: string;
    student_id: string;
    semester: number;
    tenth_cgpa: number;
    twelfth_cgpa: number;
    degree_cgpa: number;
    mca_cgpa: number[];
    certification_files: FileInfo[]; 
    job_application_files: FileInfo[]; 
    skills: string[];
    current_status: string;
    year: number;
    mca_percentage: number;
    linkedin_url: string;
  }
  
  export interface StudentWithPerformance {
      student: Student; // The full student object
      performance: Performance | null; // The corresponding performance object (or null if not found)
    }
  
  export interface JobApplication {
    _id?: string;
    student_id: string;
    job_id: string;
    status: string;
    applied_date?: Date;
    shortlisted_date?: Date;
    rejected_date?: Date;
    created_at?: Date;
    updated_at?: Date;
  }
  
  // ...existing code...
  
  export interface Education {
    start_time?: string;
    end_time?: string;
    institute: string;
    university: string;
    course: string;
    gpa?: number;
  }
  
  export interface Project {
    title: string;
    description: string;
    technologies?: string[];
    start_time?: string;
    end_time?: string;
    url?: string;
  }
  
  export interface WorkExperience {
    company: string;
    job_title: string;
    start_time?: string;
    end_time?: string;
    description?: string;
  }
  
  export interface Certificate {
    title: string;
    institute: string;
    url?: string;
    issued_date?: string;
  }
  
  export interface Resume {
    _id?: string;
    title: string;
    student_id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    objective?: string;
    dob?: string;
    address?: string;
    city?: string;
    state?: string;
    ph_no?: string;
    alt_ph?: string;
    email: string;
    alt_email?: string;
    achievements?: string[];
    skills?: string[];
    created_at?: string;
    updated_at?: string;
    education?: Education[];
    projects?: Project[];
    work_experience?: WorkExperience[];
    certificates?: Certificate[];
    linkedin_url?: string;
    github_url?: string;
  }
  
  
  export interface PrefillData {
    fullName: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber?: string;
    department?: string;
    semester?: string;
    registerNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    district?: string;
    alt_email?: string;
    alt_ph?: string;
    join_date?: string;
    program?: string;
    status?: string;
    linkedin_url?: string;
    current_status?: string;
    tenth_cgpa?: number;
    twelfth_cgpa?: number;
    mca_cgpa?: number[];
    skills?: string[];
    mca_percentage?: number;
    certification_files?: FileInfo[];
    job_application_files?: FileInfo[];
  }
  
  // Add these to your existing types.ts file
  
  export interface StudentForm {
    first_name: string;
    middle_name: string;
    last_name: string;
    address: string;
    city: string;
    district: string;
    state: string;
  }
  
  export interface PersonalDetailsProps {
    student: Student;
    studentForm: StudentForm;
    handleStudentFormChange: (field: string, value: string) => void;
    handleEditStudent: (student: Student) => void;
  }
  
  export interface AcademicDetailsProps {
    student: Student;
  }
  
  export interface DocumentsProps {
    student: Student;
    performance: Performance; // This should remain as is, but we'll handle null in page.tsx
    handleFileUpload: (files: FileList, type: string, studentId: string, onProgress: (progress: number) => void) => Promise<void>;
    handleDeleteDocument: (filepath: string, type: string) => Promise<void>;
  }
  
  export interface DeleteConfirmation {
    show: boolean;
    file: FileInfo | null;
    type: 'certification' | 'job_application' | null;
  }


  // Type definitions
export interface Drive {
    _id: string;
    title: string;
    desc?: string;
    location?: string;
    drive_date?: string | Date;
    applied_students?: string[];
    stages?: string[];
    selected_students?: string[];
    send_to?: string[];
    created_at?: string;
    application_deadline?: string | Date;
    additional_instructions?: string;
    form_link?: string;
    eligible_students?: string[];
    published?: boolean;
    stage_students?: string[][];
}

export interface Company {
    _id: string;
    name: string;
    site?: string;
    branch: string;
    desc?: string;
    email?: string;
    ph_no?: string;
    avg_salary?: number;
    placed_students?: string[];
}

export interface Job {
    _id: string;
    company: string;
    drive: string;
    title: string;
    desc?: string;
    loc?: string;
    requirement?: string;
    experience?: number;
    salary?: number;
    join_date: string | Date;
    last_date: string | Date;
    contact_person?: string;
    contact_email?: string;
    additional_instructions?: string;
    form_link?: string;
    eligible_students?: string[];
    applied_students?: string[];
    selected_students?: string[];
    stage_students?: string[][];
}

export interface Requirement {
    _id?: string;
    job: string;
    experience_required: number;
    sslc_cgpa?: number;
    plustwo_cgpa?: number;
    degree_cgpa?: number;
    mca_cgpa?: number[];
    contract?: number;
    additional_criteria?: string;
    skills_required?: string[];
    preferred_qualifications?: string[];
    required_certifications?: string[];
    language_requirements?: string[];
    requirement_desc?: string;
}

export interface ProgressTracker {
    id: string;
    progress: number;
}

export interface ActionStates {
    addingDrive: boolean;
    updatingDrive: boolean;
    deletingDrive: boolean;
    addingCompany: boolean;
    updatingCompany: boolean;
    deletingCompany: boolean;
    addingJob: boolean;
    updatingJob: boolean;
    deletingJob: boolean;
    addingRequirement: boolean;
    updatingRequirement: boolean;
    deletingRequirement: boolean;
}