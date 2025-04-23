// src/services/studentAPI.ts

import { Student, StudentInputData, ApiError } from "./types"; // Adjust the import path as necessary

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const STUDENT_ENDPOINT = `${API_BASE_URL}/student`; 

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
        const response = await fetch(`${STUDENT_ENDPOINT}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(studentData),
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                throw new ApiError(`Server responded with status: ${response.status}`, response.status);
            }
            const message = errorData?.message || errorData?.detail || `Failed to add student (${response.status})`;
            throw new ApiError(message, response.status, errorData);
        }

        return await response.json();

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
export const updateStudent = async (id: string, studentData: Partial<StudentInputData>) => {
    try {
        const response = await fetch(`${STUDENT_ENDPOINT}/update/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(studentData),
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                throw new ApiError(`Server responded with status: ${response.status}`, response.status);
            }
            const message = errorData?.message || errorData?.detail || `Failed to update student (${response.status})`;
            throw new ApiError(message, response.status, errorData);
        }

        return await response.json();

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
                    throw new ApiError(`Server responded with status: ${response.status}`, response.status);
                }
            } catch {
                throw new ApiError(`Server responded with status: ${response.status}`, response.status);
            }
            const message = errorData?.message || errorData?.detail || `Failed to delete student (${response.status})`;
            throw new ApiError(message, response.status, errorData);
        }

        if (response.status === 204) {
            return { success: true };
        }
        
        return await response.json();

    } catch (err) {
        console.error("API Error [deleteStudent]:", err);
        if (err instanceof ApiError) {
            throw err;
        }
        throw new Error(`Failed to delete student: ${err instanceof Error ? err.message : String(err)}`);
    }
};