// hooks/useApplicationForm.ts
import { useState, useEffect, useCallback } from 'react';
// Assuming API functions exist and are imported correctly
import {
    fetchStudentByStudentIdAPI,
    fetchStudentApplicationByDriveAndJobAPI,
} from './API';
// Import necessary types
import { DriveForm } from '@/app/faculty/drives/components/types'; // Adjust path as needed
// Only need ApplicationForm now, not Update
import { ApplicationForm, Student } from './types';
import { fetchDriveFormTemplateAPI } from '@/app/faculty/drives/components/API';

interface UseApplicationFormPreviewProps {
    isOpen: boolean; // Only fetch when modal is open
    driveId: string | null;
    jobId: string | null;
    studentId: string | null;
}

export const useApplicationFormPreview = ({ isOpen, driveId, jobId, studentId }: UseApplicationFormPreviewProps) => {
    // --- State for fetched data ---
    const [submission, setSubmission] = useState<ApplicationForm | null>(null);
    const [formTemplate, setFormTemplate] = useState<DriveForm | null>(null); // Needed for context/labels
    const [student, setStudent] = useState<Student | null>(null); // For displaying name etc.

    // --- Loading / Error States ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Fetch Data ---
    const loadPreviewData = useCallback(async () => {
        // Ensure all required IDs are present before fetching
        if (!driveId || !jobId || !studentId) {
            setError("Missing required IDs (Drive, Job, or Student).");
            setIsLoading(false);
            setSubmission(null); // Clear data if IDs missing
            setFormTemplate(null);
            setStudent(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSubmission(null); // Clear previous data
        setFormTemplate(null);
        setStudent(null);

        try {
            // Fetch submission, template, and student details concurrently
            const [submissionRes, templateRes, studentRes] = await Promise.all([
                fetchStudentApplicationByDriveAndJobAPI(studentId, driveId, jobId),
                fetchDriveFormTemplateAPI(driveId),
                fetchStudentByStudentIdAPI(studentId)
            ]);

            // Update: Remove array check since API returns single object
            setSubmission(submissionRes);
            setFormTemplate(templateRes || null);
            setStudent(studentRes || null);

            // Update error handling
            if (!submissionRes) {
                setError("No application submission found for this student and job.");
            }

        } catch (err) {
            console.error("Error loading application preview data:", err);
            setError(`Failed to load application details: ${(err as Error).message}`);
            // Clear data on error
            setSubmission(null);
            setFormTemplate(null);
            setStudent(null);
        } finally {
            setIsLoading(false);
        }
    }, [driveId, jobId, studentId]); // Dependencies for fetching

    // Trigger fetch only when modal is open and IDs are valid
    useEffect(() => {
        if (isOpen && driveId && jobId && studentId) {
            loadPreviewData();
        } else {
            // Clear data if modal is closed or IDs become invalid
            setSubmission(null);
            setFormTemplate(null);
            setStudent(null);
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, driveId, jobId, studentId, loadPreviewData]); // Include loadPreviewData

    // --- Return Values ---
    return {
        submission,     // The fetched ApplicationForm data
        formTemplate,   // The related DriveForm template (for context)
        student,        // Basic student details
        isLoading,      // Loading state
        error,          // Error message, if any
        loadPreviewData // Expose reload function if needed
    };
};