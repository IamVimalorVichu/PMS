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

export class ApiError extends Error {
    constructor(message: string, public status?: number, public details?: unknown) {
        super(message);
        this.name = 'ApiError';
    }
}