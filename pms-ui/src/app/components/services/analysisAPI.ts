import { StudentAnalysisResult } from '../types/analysis'; // Adjust import path as needed

// Define the base URL for your API.
// It's best practice to use environment variables for this.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;// Example fallback

/**
 * Fetches the performance analysis data for a specific student.
 *
 * @param studentId The MongoDB _id of the student.
 * @param token Optional authentication token (if required by the backend).
 * @returns A promise that resolves to the StudentAnalysisResult.
 * @throws An error if the fetch operation fails or the API returns an error.
 */
export const getStudentAnalysis = async (
    studentId: string,
    token?: string // Optional: Include if your API requires authentication
): Promise<StudentAnalysisResult> => {

    if (!studentId) {
        throw new Error("Student ID is required.");
    }

    const url = `${API_BASE_URL}/analysis/students/${studentId}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Add Authorization header if a token is provided
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('Attempting to connect to API at:', process.env.NEXT_PUBLIC_API_BASE_URL);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
        });

        // Check if the response status indicates success (e.g., 200 OK)
        if (!response.ok) {
            // Try to parse error details from the response body
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                // Ignore if response body is not valid JSON
            }
            const errorMessage = errorData?.detail || `Error: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }

        // Parse the JSON response body
        const data: StudentAnalysisResult = await response.json();
        return data;

    } catch (error) {
        console.error("Failed to fetch student analysis:", error);
        // Re-throw the error so it can be caught by the calling code (e.g., the hook)
        // You might want to customize the error message further here.
        if (error instanceof Error) {
            throw new Error(`Failed to fetch student analysis: ${error.message}`);
        } else {
            throw new Error("An unknown error occurred while fetching student analysis.");
        }
    }
};

// Add functions for company analysis later (e.g., getCompanyAnalysis)
// export const getCompanyAnalysis = async (companyId: string, token?: string): Promise<CompanyAnalysisResult> => { ... }