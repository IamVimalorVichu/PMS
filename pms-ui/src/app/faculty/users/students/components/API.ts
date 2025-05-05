// src/services/studentAPI.ts

import { Student, StudentInputData, ApiError } from "./types"; // Adjust the import path as necessary

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const STUDENT_ENDPOINT = `${API_BASE_URL}/student`;

// Define the placeholder value used in the frontend Select component
const GENDER_PLACEHOLDER = "Select"; // <-- Make sure this matches the value/key in your SelectItem

/**
 * Helper function to prepare student data for API submission.
 * Converts the gender placeholder to null and handles empty strings for optional fields.
 */
const prepareStudentDataForApi = (studentData: StudentInputData): Record<string, unknown> => {
    const dataToSend = { ...studentData }; // Create a shallow copy to avoid modifying the original object

    // --- Handle Gender Placeholder ---
    if (dataToSend.gender === GENDER_PLACEHOLDER) {
        dataToSend.gender = null; // Convert placeholder to null for the API
    }

    // --- Handle other optional fields (convert empty strings to null) ---
    // (Keep the logic you might already have for update, apply it generally)
    const cleanedData = Object.entries(dataToSend).reduce((acc, [key, value]) => {
        // Required fields (adjust if needed)
        if (key === 'first_name' || key === 'email') {
            return { ...acc, [key]: value };
        }
        // Optional fields: convert empty string to null, otherwise keep the value
        // (This also correctly handles the gender if it was already null or a valid value)
        return {
            ...acc,
            [key]: value === '' ? null : value
        };
    }, {});


    return cleanedData;
};


/**
 * Fetches all students from the API.
 */
export const getStudents = async (): Promise<Student[]> => {
    try {
        const response = await fetch(`${STUDENT_ENDPOINT}/get`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                throw new ApiError(`Server responded with status: ${response.status}`, response.status);
            }
            const message = errorData?.message || errorData?.detail || `Failed to fetch students (${response.status})`;
            throw new ApiError(message, response.status, errorData);
        }

        return await response.json() as Student[];

    } catch (err) {
        console.error("API Error [getStudents]:", err);
        if (err instanceof ApiError) {
            throw err;
        }
        throw new Error(`Failed to fetch students: ${err instanceof Error ? err.message : String(err)}`);
    }
};

/**
 * Fetches a single student by ID.
 */
export const getStudent = async (id: string): Promise<Student> => {
    // ... (no changes needed here)
    try {
        const response = await fetch(`${STUDENT_ENDPOINT}/get/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                throw new ApiError(`Server responded with status: ${response.status}`, response.status);
            }
            const message = errorData?.message || errorData?.detail || `Failed to fetch student (${response.status})`;
            throw new ApiError(message, response.status, errorData);
        }

        return await response.json() as Student;

    } catch (err) {
        console.error("API Error [getStudent]:", err);
        if (err instanceof ApiError) {
            throw err;
        }
        throw new Error(`Failed to fetch student: ${err instanceof Error ? err.message : String(err)}`);
    }
};

/**
 * Adds a new student via the API.
 */
export const addStudent = async (studentData: StudentInputData) => {
    try {
        const dataToSend = prepareStudentDataForApi(studentData);

        const response = await fetch(`${STUDENT_ENDPOINT}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
        });

        const data = await response.json();

        if (!response.ok) {
            let message = `Failed to add student (${response.status})`;
            if (data?.detail) {
                if (Array.isArray(data.detail)) {
                    message = data.detail.map((err: { msg: string, loc: string[] }) => 
                        `${err.loc.join('.')} - ${err.msg}`).join('; ');
                } else if (typeof data.detail === 'string') {
                    message = data.detail;
                }
            }
            throw new ApiError(message, response.status, data);
        }

        // Make sure to return the response data
        return data;

    } catch (err) {
        console.error("API Error [addStudent]:", err);
        if (err instanceof ApiError) {
            throw err;
        }
        throw new Error(`Failed to add student: ${err instanceof Error ? err.message : String(err)}`);
    }
};

/**
 * Updates an existing student via the API.
 */
export const updateStudent = async (studentId: string, studentData: StudentInputData): Promise<Student> => {
    try {
        // Prepare data: handle gender placeholder and empty strings
        const dataToSend = prepareStudentDataForApi(studentData);

        const response = await fetch(`${API_BASE_URL}/student/update/${studentId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend) // Send the prepared data
        });

        const data = await response.json();

        if (!response.ok) {
            let message = `Failed to update student (${response.status})`;
             if (data?.detail) {
                 if (Array.isArray(data.detail)) {
                     message = data.detail.map((err: { msg: string, loc: string[] }) => `${err.loc.join('.')} - ${err.msg}`).join('; ');
                 } else if (typeof data.detail === 'string') {
                     message = data.detail;
                 }
            } else if (data?.message) {
                message = data.message;
            }
            throw new ApiError(message, response.status, data);
        }

        return data as Student;

    } catch (err) {
        console.error("API Error [updateStudent]:", err);
        if (err instanceof ApiError) {
            throw err;
        }
        throw new Error(`Failed to update student: ${err instanceof Error ? err.message : String(err)}`);
    }
};

/**
 * Deletes a student via the API.
 */
export const deleteStudent = async (id: string) => {
    // ... (no changes needed here)
    try {
        const response = await fetch(`${STUDENT_ENDPOINT}/delete/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            let errorData;
            try {
                if (response.status !== 204) {
                    errorData = await response.json();
                } else {
                    // Handle 204 specifically if needed, otherwise treat as error for consistency
                     throw new ApiError(`Server responded with status: ${response.status}`, response.status);
                }
            } catch {
                 // If parsing fails or it was 204
                throw new ApiError(`Server responded with status: ${response.status}`, response.status);
            }
            const message = errorData?.message || errorData?.detail || `Failed to delete student (${response.status})`;
            throw new ApiError(message, response.status, errorData);
        }

        // Handle successful deletion (200 OK with body or potentially 204 No Content)
        if (response.status === 204) {
            return { success: true, message: "Student deleted successfully" }; // Or just return void/true
        }

        // If status is 200 OK and has a body
        try {
             return await response.json();
        } catch {
            // If response is 200 OK but body is empty or not JSON
             return { success: true, message: "Student deleted successfully" };
        }


    } catch (err) {
        console.error("API Error [deleteStudent]:", err);
        if (err instanceof ApiError) {
            throw err;
        }
        throw new Error(`Failed to delete student: ${err instanceof Error ? err.message : String(err)}`);
    }
};