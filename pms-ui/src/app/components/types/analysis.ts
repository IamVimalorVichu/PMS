/**
 * Represents details about a specific job placement for a student.
 * Mirrors the backend PlacementDetail model.
 */
export interface PlacementDetail {
    job_id: string;
    job_title: string;
    company_id: string;
    company_name: string;
    salary?: number | null; // Optional salary for the specific job
}

/**
 * Represents the aggregated analysis results for a single student.
 * Mirrors the backend StudentAnalysisResult model.
 */
export interface StudentAnalysisResult {
    student_id: string;
    total_drives_applied: number;
    total_jobs_applied: number;
    total_jobs_eligible: number;
    total_jobs_selected: number; // Count of successful placements

    // Calculated Ratios
    overall_eligibility_rate: number; // eligible / applied (jobs)
    overall_selection_rate: number; // selected / eligible (jobs)
    overall_placement_rate: number; // selected / applied (jobs)

    // Placement Details
    placements: PlacementDetail[]; // List of jobs the student was selected for
}

/**
 * Represents the possible states for data fetching hooks.
 */
export interface FetchState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
}