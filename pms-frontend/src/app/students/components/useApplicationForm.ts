// hooks/useApplicationForm.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
// Assuming API functions exist and are imported correctly
import {
    fetchStudentByStudentIdAPI,
    fetchStudentPerformanceAPI,
    // Use the specific API to check for existing submission for this student/drive/job
    fetchStudentApplicationByDriveAndJobAPI,
    submitApplicationFormAPI, // Maps to create_application backend
} from './API';
// Import necessary types
import { DriveForm } from '@/app/faculty/drives/components/types'; // Adjust path as needed
// Only need ApplicationForm now, not Update
import { ApplicationForm } from './types';
import { Student } from '@/app/students/components/types';
import { Performance } from './types';
import { fetchDriveFormTemplateAPI } from '@/app/faculty/drives/components/API';



// Helper labels mapping include_ flags to actual field names
const standardFieldLabels: Record<string, string> = {
    include_first_name: "first_name", include_middle_name: "middle_name", include_last_name: "last_name",
    include_address: "address", include_city: "city", include_state: "state", include_district: "district",
    include_adm_no: "adm_no", include_reg_no: "reg_no", include_gender: "gender",
    include_email: "email", include_alt_email: "alt_email", include_ph_no: "ph_no",
    include_alt_ph: "alt_ph", include_program: "program", include_student_status: "status", // Matches alias in Pydantic model if used
    include_tenth_cgpa: "tenth_cgpa", include_twelfth_cgpa: "twelfth_cgpa", include_degree_cgpa: "degree_cgpa",
    include_mca_cgpa: "mca_cgpa", include_skills: "skills", include_current_status: "current_status", // Performance status
    include_mca_percentage: "mca_percentage", include_linkedin_url: "linkedin_url",
};

// Define keys of ApplicationForm that correspond to standard fields for type safety
type StandardFormFieldKey = keyof Omit<ApplicationForm, 'id' | '_id' | 'drive_id' | 'job_id' | 'student_id' | 'additional_answers' | 'submitted_at' | 'updated_at'>;


interface UseApplicationFormProps {
    driveId: string | null;
    jobId: string | null;
    studentId: string | null;
}



export const useApplicationForm = ({ driveId, jobId, studentId }: UseApplicationFormProps) => {
    // --- State ---
    const [formTemplate, setFormTemplate] = useState<DriveForm | null>(null);
    const [studentData, setStudentData] = useState<Student | null>(null);
    const [performanceData, setPerformanceData] = useState<Performance | null>(null);
    const [existingSubmission, setExistingSubmission] = useState<ApplicationForm | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const hasSubmitted = useMemo(() => !!existingSubmission, [existingSubmission]);

    // --- Fetch Initial Data ---
    const loadInitialData = useCallback(async () => {
        if (!driveId || !jobId || !studentId) {
            let errorMessage = "Missing: ";
            if (!driveId) errorMessage += "Drive ID, ";
            if (!jobId) errorMessage += "Job ID, ";
            if (!studentId) errorMessage += "Student ID, ";
            errorMessage = errorMessage.slice(0, -2); // Remove trailing comma and space
            setError(errorMessage);
            setIsLoading(false);
            setFormTemplate(null);
            setStudentData(null);
            setPerformanceData(null);
            setExistingSubmission(null);
            setFormData({});
            console.log(studentId);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSubmitError(null);
        setFormData({});
        setExistingSubmission(null);

        try {
            const [templateRes, studentRes, performanceRes, submissionRes] = await Promise.all([
                fetchDriveFormTemplateAPI(driveId),
                fetchStudentByStudentIdAPI(studentId),
                fetchStudentPerformanceAPI(studentId),
                fetchStudentApplicationByDriveAndJobAPI(studentId, driveId, jobId)
            ]);

            const template = templateRes || null;
            const student = studentRes || null;
            const performance = performanceRes || null;
            // Update this line to handle null response
            const submission = submissionRes || null;

            setFormTemplate(template);
            setStudentData(student);
            setPerformanceData(performance);
            setExistingSubmission(submission);

            const initialFormData: Record<string, string> = {};

            if (submission) {
                // Load from existing submission
                Object.keys(standardFieldLabels).forEach(includeKey => {
                    const fieldName = standardFieldLabels[includeKey] as StandardFormFieldKey;
                    if (fieldName && submission.hasOwnProperty(fieldName)) {
                        initialFormData[fieldName] = String((submission as ApplicationForm)[fieldName] ?? ''); // Use 'as any' carefully or define better type for submission if needed
                    }
                });
                Object.assign(initialFormData, submission.additional_answers || {});

            } else if (template && (student || performance)) {
                // Pre-fill if not submitted
                Object.entries(template).forEach(([key, include]) => {
                    if (key.startsWith('include_') && include === true) {
                        const fieldName = standardFieldLabels[key];
                        if (!fieldName) return;

                        let value: string | number | string[] | number[] | Date | null | undefined = null;
                        if (student && fieldName in student) {
                            value = student[fieldName as keyof Student];
                        } else if (performance && fieldName in performance) {
                            value = performance[fieldName as keyof Performance];
                        }

                        if (value !== null && value !== undefined) {
                            if (Array.isArray(value)) {
                                if (key === 'include_mca_cgpa' && value.length > 0) initialFormData[fieldName] = String(value[value.length - 1] ?? '');
                                else if (key === 'include_skills') initialFormData[fieldName] = value.join(', ');
                            } else if (value instanceof Date) {
                                // Decide date format if needed, e.g., value.toISOString().split('T')[0] for YYYY-MM-DD
                                // For now, just stringify
                                initialFormData[fieldName] = String(value);
                            } else {
                                initialFormData[fieldName] = String(value);
                            }
                        } else {
                             initialFormData[fieldName] = '';
                        }
                    }
                });
                (template.additional_field_labels || []).forEach((label: string) => {
                    initialFormData[label] = '';
                });
            }
            setFormData(initialFormData);

        } catch (err) { // Use the 'err' variable
            console.error("Error loading application form data:", err);
            // Update error handling to be more specific
            if (err instanceof Error) {
                if (err.message.includes("404") || err.message.includes("not found")) {
                    // Document was deleted/not found - this is actually OK
                    console.log("No existing application found - starting fresh");
                    setExistingSubmission(null);
                } else {
                    setError(`Failed to load form data: ${err.message}`);
                }
            } else {
                setError("Failed to load form data: An unknown error occurred");
            }
            
            // Only clear these if there's an actual error
            if (!(err instanceof Error && err.message.includes("404"))) {
                setFormTemplate(null);
                setStudentData(null);
                setPerformanceData(null);
                setFormData({});
            }
        } finally {
            setIsLoading(false);
        }
    }, [driveId, jobId, studentId]);

    useEffect(() => { loadInitialData(); }, [loadInitialData]);

    // --- Handlers ---
    const handleInputChange = useCallback((fieldNameOrLabel: string, value: string) => {
        if (hasSubmitted) return;
        setFormData(prev => ({ ...prev, [fieldNameOrLabel]: value }));
    }, [hasSubmitted]);

    // Handle form submission
    const submitApplication = useCallback(async (): Promise<ApplicationForm | void> => {
        if (hasSubmitted || !driveId || !jobId || !studentId || !formTemplate) {
            const errorMsg = hasSubmitted ? "Application already submitted." : "Missing required information or template.";
            setSubmitError(errorMsg);
            console.warn("Submit blocked:", errorMsg);
            throw new Error(errorMsg);
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const customLabelsToRender = formTemplate.additional_field_labels || [];
            // Create submission payload with additional answers
            const submissionPayload: ApplicationForm = {
                drive_id: driveId,
                job_id: jobId,
                student_id: studentId,
                // Convert custom fields to additional_answers
                additional_answers: customLabelsToRender.reduce((acc: Record<string, string>, fieldName: string) => ({
                    ...acc,
                    [fieldName]: formData[fieldName] || ''
                }), {}),
                ...formData // Spread the rest of form data
            };

            console.log('Submitting application with payload:', submissionPayload);
            
            const response = await submitApplicationFormAPI(submissionPayload, studentId);
            
            // Check if response has the expected structure
            if (!response || !response.data) {
                throw new Error('Invalid response from server');
            }

            const savedSubmission = response.data;
            console.log("Application submitted successfully:", savedSubmission);
            
            setExistingSubmission(savedSubmission);
            return savedSubmission;

        } catch (err) {
            console.error("Error submitting application:", err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setSubmitError(`Failed to submit application: ${errorMessage}`);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    }, [driveId, jobId, studentId, formTemplate, formData,hasSubmitted]);

    // --- Return Values ---
    return {
        formTemplate,
        studentData,
        performanceData,
        formData,
        existingSubmission,
        isLoading,
        error,
        isSubmitting,
        submitError,
        hasSubmitted,
        handleInputChange,
        submitApplication,
        loadInitialData,
    };
}; // End of hook