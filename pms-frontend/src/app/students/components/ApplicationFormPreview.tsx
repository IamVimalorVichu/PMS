// components/ApplicationFormPreview.tsx
import React from 'react';
import { Spinner } from "@heroui/react"; // Adjust imports
import { useApplicationFormPreview } from './useApplicationFormPreview'; // Adjust path
import { ApplicationForm } from './types';

// Add these constant mappings
const standardFieldLabels: Record<string, string> = {
    include_first_name: "first_name",
    include_middle_name: "middle_name",
    include_last_name: "last_name",
    include_address: "address",
    include_city: "city",
    include_state: "state",
    include_district: "district",
    include_adm_no: "adm_no",
    include_reg_no: "reg_no",
    include_gender: "gender",
    include_email: "email",
    include_alt_email: "alt_email",
    include_ph_no: "ph_no",
    include_alt_ph: "alt_ph",
    include_program: "program",
    include_student_status: "student_status",
    include_tenth_cgpa: "tenth_cgpa",
    include_twelfth_cgpa: "twelfth_cgpa",
    include_degree_cgpa: "degree_cgpa",
    include_mca_cgpa: "mca_cgpa",
    include_skills: "skills",
    include_current_status: "current_status",
    include_mca_percentage: "mca_percentage",
    include_linkedin_url: "linkedin_url",
};

const displayLabels: Record<string, string> = {
    first_name: "First Name",
    middle_name: "Middle Name",
    last_name: "Last Name",
    address: "Address",
    city: "City",
    state: "State",
    district: "District",
    adm_no: "Admission No.",
    reg_no: "Register No.",
    gender: "Gender",
    email: "Email",
    alt_email: "Alternate Email",
    ph_no: "Phone No.",
    alt_ph: "Alternate Phone",
    program: "Program",
    student_status: "Student Status",
    tenth_cgpa: "10th CGPA",
    twelfth_cgpa: "12th CGPA",
    degree_cgpa: "Degree CGPA",
    mca_cgpa: "MCA CGPA",
    skills: "Skills",
    current_status: "Current Status",
    mca_percentage: "MCA Percentage",
    linkedin_url: "LinkedIn URL"
};

interface ApplicationFormPreviewProps {
    driveId: string | null;
    jobId: string | null;
    studentId: string | null;
    jobTitle?: string;
    driveTitle?: string;
}

// Keep the existing standardFieldLabels and displayLabels...


export default function ApplicationFormPreview({
    driveId,
    jobId,
    studentId,
    jobTitle,
}: ApplicationFormPreviewProps) {
    const {
        submission,
        student,
        isLoading,
        error,
    } = useApplicationFormPreview({ isOpen: true, driveId, jobId, studentId }); // Note: isOpen is always true now

    // Helper function to render a field=value pair
    const renderField = (label: string, value: string | undefined | null) => {
        if (value === null || value === undefined) return null;
        const displayValue = value === '' ? <span className="italic text-gray-500">Not Provided</span> : value;
        return (
            <div key={label} className="py-1 grid grid-cols-3 gap-4 text-sm">
                <dt className="font-medium text-gray-600">{label}:</dt>
                <dd className="text-gray-800 col-span-2 whitespace-pre-wrap">{displayValue}</dd>
            </div>
        );
    };

    // Keep the existing field processing logic...
    const fieldsToDisplay: { label: string; value: string | undefined | null }[] = [];
    const customAnswersToDisplay: { label: string; value: string | undefined | null }[] = [];

    if (submission) {
        // Standard fields - updated to check submission data correctly
        Object.entries(standardFieldLabels).forEach(([, fieldKey]) => {
            const value = submission[fieldKey as keyof ApplicationForm];
            if (value !== undefined && value !== null) {
                fieldsToDisplay.push({
                    label: displayLabels[fieldKey] || fieldKey,
                    value: String(value)
                });
            }
        });

        // Additional answers
        if (submission.additional_answers && typeof submission.additional_answers === 'object') {
            Object.entries(submission.additional_answers).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    customAnswersToDisplay.push({
                        label: key,
                        value: String(value)
                    });
                }
            });
        }
    }

    return (
        <div className="w-full bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
                <h2 className="text-xl font-semibold">
                    Application Preview
                    {student && ` - ${student.first_name} ${student.last_name}`}
                    {jobTitle && ` for ${jobTitle}`}
                </h2>
            </div>
            
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                        <Spinner label="Loading application details..." />
                    </div>
                ) : error ? (
                    <p className="text-red-600 text-center p-4">Error: {error}</p>
                ) : !submission ? (
                    <p className="text-gray-500 text-center p-4">No application submission found.</p>
                ) : (
                    <>
                        {/* Standard Information Section */}
                        {fieldsToDisplay.length > 0 && (
                            <section>
                                <h4 className="text-lg font-semibold mb-2 border-b pb-1 text-gray-800">Submitted Information</h4>
                                <dl>
                                    {fieldsToDisplay.map(field => renderField(field.label, field.value))}
                                </dl>
                            </section>
                        )}
                        
                        {/* Additional Questions Section */}
                        {customAnswersToDisplay.length > 0 && (
                            <section>
                                <h4 className="text-lg font-semibold mb-2 border-b pb-1 text-gray-800">Additional Questions</h4>
                                <dl>
                                    {customAnswersToDisplay.map(field => renderField(field.label, field.value))}
                                </dl>
                            </section>
                        )}
                        
                        {/* Display submission timestamp */}
                        {submission.submitted_at && (
                            <p className="text-xs text-gray-500 text-right mt-4">
                                Submitted on: {new Date(submission.submitted_at).toLocaleString()}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
