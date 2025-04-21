// components/ApplicationFormDisplay.tsx
import React from 'react';
import { Button, Input, Card, CardBody, CardHeader, CardFooter, Spinner } from "@heroui/react"; // Adjust imports
import { useApplicationForm } from './useApplicationForm'; // Adjust path
import { ApplicationForm } from './types'; // Adjust path if models are elsewhere


interface ApplicationFormDisplayProps {
    driveId: string | null;
    jobId: string | null;
    studentId: string | null; // Assuming this comes from user context or props
    onSubmitted?: (submission: ApplicationForm) => void; // Optional callback on successful submission
    onCancel?: () => void; // Optional callback for cancelling/closing
}

// Helper labels mapping include_ flags to actual field names
const standardFieldLabels: Record<string, string> = {
    include_first_name: "first_name", include_middle_name: "middle_name", include_last_name: "last_name",
    include_address: "address", include_city: "city", include_state: "state", include_district: "district",
    include_adm_no: "adm_no", include_reg_no: "reg_no", include_gender: "gender",
    include_email: "email", include_alt_email: "alt_email", include_ph_no: "ph_no",
    include_alt_ph: "alt_ph", include_program: "program", include_student_status: "status",
    include_tenth_cgpa: "tenth_cgpa", include_twelfth_cgpa: "twelfth_cgpa", include_degree_cgpa: "degree_cgpa",
    include_mca_cgpa: "mca_cgpa", include_skills: "skills", include_current_status: "current_status",
    include_mca_percentage: "mca_percentage", include_linkedin_url: "linkedin_url",
};

// Map field names back to user-friendly labels for display
const displayLabels: Record<string, string> = {
    first_name: "First Name", middle_name: "Middle Name", last_name: "Last Name",
    address: "Address", city: "City", state: "State", district: "District",
    adm_no: "Admission No.", reg_no: "Register No.", gender: "Gender",
    email: "Email", alt_email: "Alternate Email", ph_no: "Phone No.",
    alt_ph: "Alternate Phone No.", program: "Program", status: "Student Status",
    tenth_cgpa: "10th CGPA", twelfth_cgpa: "12th CGPA", degree_cgpa: "Degree CGPA",
    mca_cgpa: "MCA CGPA (Latest)", skills: "Skills (comma-separated)", current_status: "Current Status (Performance)",
    mca_percentage: "MCA Percentage", linkedin_url: "LinkedIn URL",
};

// Fields that should typically be read-only for the student filling the form
const readOnlyFields = new Set([
    'first_name', 'middle_name', 'last_name', 'adm_no', 'reg_no', 'program', 'email',
    'tenth_cgpa', 'degree_cgpa', 'mca_cgpa', 'mca_percentage' // Example: Academic details are usually read-only
]);

export default function ApplicationFormDisplay({
    driveId,
    jobId,
    studentId,
    onSubmitted,
    onCancel
}: ApplicationFormDisplayProps) {

    // Use the custom hook to manage state and logic
    const {
        formTemplate,
        formData, // formData holds pre-filled or submitted values
        isLoading,
        error,
        isSubmitting,
        submitError,
        hasSubmitted, // Flag indicating if already submitted
        handleInputChange,
        submitApplication,
    } = useApplicationForm({ driveId, jobId, studentId });

    // Add a ref to track submission status
    const isSubmittingRef = React.useRef(false);

    // Updated handler for form submission
    const handleSubmit = async () => {
        // Prevent double submission
        if (hasSubmitted || isSubmittingRef.current) {
            return;
        }

        try {
            isSubmittingRef.current = true;
            const savedSubmission = await submitApplication();
            if (savedSubmission && onSubmitted) {
                onSubmitted(savedSubmission);
            }
        } catch (err) {
            console.error("Submission failed in component:", err);
        } finally {
            isSubmittingRef.current = false;
        }
    };

    // --- Rendering Logic ---

    // Show loading spinner while fetching initial data
    if (isLoading) {
        return <div className="p-6 text-center"><Spinner label="Loading application form..." /></div>;
    }

    // Show error message if initial loading failed
    if (error) {
        return <div className="p-6 text-center text-red-600">Error: {error}</div>;
    }

    // Handle case where template couldn't be loaded (and not already submitted)
    // If already submitted, we can still show the submitted data even without the template
    if (!formTemplate && !hasSubmitted) {
        return <div className="p-6 text-center text-gray-500">Application form template not found or unavailable. Please contact support.</div>;
    }

    // Determine which fields/labels to render based on template (if available) or formData keys (if submitted)
    const standardFieldsToRender = formTemplate
        ? Object.entries(formTemplate)
            .filter(([key, include]) => key.startsWith('include_') && include === true)
            .map(([key]) => standardFieldLabels[key])
            .filter(fieldName => !!fieldName)
        : Object.keys(formData || {}).filter(key => key in displayLabels); // Fallback to formData keys if submitted

    const customLabelsToRender = formTemplate
        ? (formTemplate.additional_field_labels || [])
        : Object.keys(formData || {}).filter(key => !(key in displayLabels)); // Fallback

    return (
        <Card className="w-full max-w-3xl mx-auto my-4"> {/* Added margin */}
            <CardHeader className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Application Form</h3>
                {/* Show success message if submitted */}
                {hasSubmitted && (
                    <p className="text-sm text-green-600 font-medium">Application Submitted Successfully!</p>
                )}
            </CardHeader>

            {/* Render Read-Only View if already submitted */}
            {hasSubmitted ? (
                 <CardBody className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">You have already submitted your application for this job. Your submitted details are shown below.</p>
                    {/* Standard Information Section */}
                    {standardFieldsToRender.length > 0 && (
                        <section className="space-y-2 p-3 border rounded bg-gray-50">
                            <h4 className="font-medium text-gray-700">Standard Information</h4>
                            {standardFieldsToRender.map(fieldName => (
                                <div key={fieldName} className="text-sm py-1">
                                    <span className="font-semibold text-gray-600 w-1/3 inline-block pr-2">{displayLabels[fieldName] || fieldName}: </span>
                                    <span className="text-gray-800">{formData[fieldName] || 'N/A'}</span>
                                </div>
                            ))}
                        </section>
                    )}

                    {customLabelsToRender.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="font-medium">Additional Information</h4>
                            {customLabelsToRender.map((fieldName) => (
                                <div key={fieldName} className="grid grid-cols-2 gap-4">
                                    <span className="text-gray-600">{fieldName}</span>
                                    <span>{formData[fieldName] || ''}</span>
                                </div>
                            ))}
                        </div>
                    )}
                 </CardBody>
            ) : (
                // Render Editable Form if not submitted
                <form onSubmit={handleSubmit}>
                    <CardBody className="space-y-4">
                        {/* Standard Fields Section */}
                        {standardFieldsToRender.length > 0 && (
                            <section className="space-y-3 p-3 border rounded">
                                <h4 className="font-medium text-gray-700">Standard Information</h4>
                                {standardFieldsToRender.map(fieldName => (
                                    <Input
                                        key={fieldName}
                                        label={displayLabels[fieldName] || fieldName} // User-friendly label
                                        value={formData[fieldName] || ''} // Bind value to formData state
                                        onValueChange={(value) => handleInputChange(fieldName, value)} // Update state on change
                                        isReadOnly={readOnlyFields.has(fieldName)} // Apply read-only based on set
                                        isDisabled={isSubmitting} // Disable while submitting
                                        // Add isRequired based on your application logic if needed
                                        className={readOnlyFields.has(fieldName) ? 'bg-gray-100 opacity-70' : ''} // Style read-only
                                    />
                                ))}
                            </section>
                        )}

                        {customLabelsToRender.map((fieldName) => (
                            <div key={fieldName} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {fieldName}
                                </label>
                                <Input
                                    type="text"
                                    name={fieldName}
                                    value={formData[fieldName] || ''}
                                    onChange={(e) => handleInputChange(fieldName, e.target.value)}
                                    disabled={hasSubmitted}
                                    required
                                />
                            </div>
                        ))}

                    </CardBody>
                    <CardFooter className="flex flex-col items-end gap-3">
                        {/* Display Submission Error */}
                        {submitError && <p className="text-red-600 text-sm w-full text-right">Error: {submitError}</p>}
                        <div className="flex gap-3">
                            {/* Cancel Button */}
                            {onCancel && (
                                <Button variant="ghost" onPress={onCancel} isDisabled={isSubmitting}>
                                    Cancel
                                </Button>
                            )}
                            {/* Submit Button (only shown if not submitted) */}
                            <Button
                                type="button" // Change to button type
                                color="primary"
                                isLoading={isSubmitting}
                                isDisabled={isSubmitting || isLoading || isSubmittingRef.current}
                                onPress={handleSubmit} // Use onPress instead of form submit
                            >
                                {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            )}
             {/* If submitted, show only a Close button in the footer */}
             {hasSubmitted && !isLoading && (
                 <CardFooter className="flex justify-end">
                     <Button variant="ghost" onPress={onCancel}>Close</Button>
                 </CardFooter>
             )}
        </Card>
    );
}