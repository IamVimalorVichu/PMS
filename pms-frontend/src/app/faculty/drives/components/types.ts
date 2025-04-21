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

// models/drive_form.ts or types/drive_form.ts

// Interface corresponding to the DriveForm Pydantic model
export interface DriveForm {
    id?: string | null; // Corresponds to _id from MongoDB
    drive_id: string;

    // Standard Student Fields (Flags)
    include_first_name?: boolean | null;
    include_middle_name?: boolean | null;
    include_last_name?: boolean | null;
    include_address?: boolean | null;
    include_city?: boolean | null;
    include_state?: boolean | null;
    include_district?: boolean | null;
    include_adm_no?: boolean | null;
    include_reg_no?: boolean | null;
    include_gender?: boolean | null;
    include_email?: boolean | null;
    include_alt_email?: boolean | null;
    include_ph_no?: boolean | null;
    include_alt_ph?: boolean | null;
    include_program?: boolean | null;
    include_student_status?: boolean | null; // Matches 'include_status' alias

    // Standard Performance Fields (Flags)
    include_tenth_cgpa?: boolean | null;
    include_twelfth_cgpa?: boolean | null;
    include_degree_cgpa?: boolean | null;
    include_mca_cgpa?: boolean | null;
    include_skills?: boolean | null;
    include_current_status?: boolean | null; // Performance current_status
    include_mca_percentage?: boolean | null;
    include_linkedin_url?: boolean | null;

    // Additional Custom Fields
    additional_field_labels: string[];

    // Metadata
    created_at?: string | null; // Dates often come as ISO strings
    updated_at?: string | null;
}

// Interface corresponding to the DriveFormUpdate Pydantic model
export interface DriveFormUpdate {
    // All fields are optional for PATCH updates
    include_first_name?: boolean | null;
    include_middle_name?: boolean | null;
    include_last_name?: boolean | null;
    include_address?: boolean | null;
    include_city?: boolean | null;
    include_state?: boolean | null;
    include_district?: boolean | null;
    include_adm_no?: boolean | null;
    include_reg_no?: boolean | null;
    include_gender?: boolean | null;
    include_email?: boolean | null;
    include_alt_email?: boolean | null;
    include_ph_no?: boolean | null;
    include_alt_ph?: boolean | null;
    include_program?: boolean | null;
    include_student_status?: boolean | null;

    include_tenth_cgpa?: boolean | null;
    include_twelfth_cgpa?: boolean | null;
    include_degree_cgpa?: boolean | null;
    include_mca_cgpa?: boolean | null;
    include_skills?: boolean | null;
    include_current_status?: boolean | null;
    include_mca_percentage?: boolean | null;
    include_linkedin_url?: boolean | null;

    additional_field_labels?: string[] | null;
}