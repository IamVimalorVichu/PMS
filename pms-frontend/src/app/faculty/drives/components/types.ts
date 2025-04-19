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
    experience: number;
    salary?: number;
    join_date: string | Date;
    last_date: string | Date;
    contact_person?: string;
    contact_email?: string;
    additional_instructions?: string;
    form_link?: string;
    eligible_students?: string[];
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