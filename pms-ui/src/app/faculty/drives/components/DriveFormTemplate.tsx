// components/DriveFormTemplate.tsx
import React from 'react';
import { Switch, Button, Input, Card, CardBody, CardHeader, CardFooter, Listbox, ListboxItem } from "@heroui/react"; // Adjust imports
import { DriveForm } from './types'; // Adjust path
import { useDriveFormManagement } from './useDriveFormManagement'; // Adjust path
import { MdDelete } from 'react-icons/md';
import { PreviewModeWrapper } from './PreviewModeWrapper';

interface DriveFormTemplateProps {
    driveId: string | null;
    onSaveSuccess?: (updatedTemplate: DriveForm) => void;
    onCancel?: () => void;
    isPreviewMode?: boolean;
}

// Helper labels (can be defined here or imported)
const standardFieldLabels: Record<string, string> = {
    include_first_name: "First Name", include_middle_name: "Middle Name", include_last_name: "Last Name",
    include_address: "Address", include_city: "City", include_state: "State", include_district: "District",
    include_adm_no: "Admission No.", include_reg_no: "Register No.", include_gender: "Gender",
    include_email: "Email", include_alt_email: "Alternate Email", include_ph_no: "Phone No.",
    include_alt_ph: "Alternate Phone No.", include_program: "Program", include_student_status: "Student Status",
    include_tenth_cgpa: "10th CGPA", include_twelfth_cgpa: "12th CGPA", include_degree_cgpa: "Degree CGPA",
    include_mca_cgpa: "MCA CGPA (Latest)", include_skills: "Skills", include_current_status: "Current Status (Performance)",
    include_mca_percentage: "MCA Percentage", include_linkedin_url: "LinkedIn URL",
};

// Separate keys for easier rendering
const studentFieldKeys = Object.keys(standardFieldLabels).filter(k => k.startsWith('include_student_') || ['include_first_name', 'include_middle_name', 'include_last_name', 'include_address', 'include_city', 'include_state', 'include_district', 'include_adm_no', 'include_reg_no', 'include_gender', 'include_email', 'include_alt_email', 'include_ph_no', 'include_alt_ph', 'include_program'].includes(k));
const performanceFieldKeys = Object.keys(standardFieldLabels).filter(k => !studentFieldKeys.includes(k));


export default function DriveFormTemplate({
    driveId,
    onSaveSuccess,
    onCancel,
    isPreviewMode = false
}: DriveFormTemplateProps) {

    // Use the custom hook to manage state and logic
    const {
        templateFlags,
        additionalLabels,
        newCustomLabel,
        isLoading,
        error,
        isSaving,
        saveError,
        handleToggleStandardField,
        setNewCustomLabel,
        handleAddCustomLabel,
        handleRemoveCustomLabel,
        saveChanges, // Get the save function from the hook
    } = useDriveFormManagement({ driveId });

    // Local handler for the save button click
    const handleSaveClick = async () => {
        try {
            const savedTemplate = await saveChanges(); // Call the hook's save function
            if (savedTemplate && onSaveSuccess) {
                onSaveSuccess(savedTemplate); // Call success callback if provided
            }
            // Optionally show success message here (e.g., toast)
        } catch (err) {
            // Error is already set in the hook's state (saveError)
            // Optionally show error message here (e.g., toast)
            console.error("Save failed in component:", err);
        }
    };

    // --- Rendering ---

    if (isLoading) {
        return <div className="p-4 text-center">Loading Form Template...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-600">Error: {error}</div>;
    }

    if (!driveId) {
         return <div className="p-4 text-center text-gray-500">Please select a drive first.</div>;
    }

    if (isPreviewMode) {
        return (
            <PreviewModeWrapper>
                <div className="space-y-6">
                    {/* Standard Fields Section */}
                    <section>
                        <h3 className="text-lg font-semibold mb-4">Standard Fields</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(standardFieldLabels).map(([key, label]) => (
                                <div key={key} 
                                    className={`p-3 rounded border ${
                                        templateFlags?.[key] ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        <span className={templateFlags?.[key] ? 'text-green-600' : 'text-gray-400'}>
                                            {templateFlags?.[key] ? '✓' : '✕'}
                                        </span>
                                        <span className={templateFlags?.[key] ? 'text-gray-900' : 'text-gray-500'}>
                                            {label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Custom Fields Section */}
                    {additionalLabels && additionalLabels.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold mb-4">Custom Fields</h3>
                            <div className="space-y-2">
                                {additionalLabels.map((label, index) => (
                                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded">
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </PreviewModeWrapper>
        );
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <h3 className="text-lg font-semibold">Configure Drive Application Form</h3>
                <p className="text-sm text-gray-500">
                    {templateFlags && Object.keys(templateFlags).length > 0 
                        ? "Select standard fields and add custom questions for this drive."
                        : "Create a new application form template with standard and custom fields."
                    }
                </p>
            </CardHeader>
            <CardBody className="space-y-6">
                {/* Standard Student Fields Section */}
                <section>
                    <h4 className="font-medium mb-2 border-b pb-1">Standard Student Fields</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {studentFieldKeys.map(key => (
                            <div key={key} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                                <label htmlFor={key} className="text-sm mr-2">{standardFieldLabels[key]}</label>
                                <Switch
                                    id={key}
                                    isSelected={!!templateFlags[key]} // Use state from hook
                                    onValueChange={() => handleToggleStandardField(key)} // Use handler from hook
                                    size="sm"
                                    isDisabled={isSaving} // Disable during save
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Standard Performance Fields Section */}
                <section>
                    <h4 className="font-medium mb-2 border-b pb-1">Standard Performance Fields</h4>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {performanceFieldKeys.map(key => (
                            <div key={key} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                                <label htmlFor={key} className="text-sm mr-2">{standardFieldLabels[key]}</label>
                                <Switch
                                    id={key}
                                    isSelected={!!templateFlags[key]} // Use state from hook
                                    onValueChange={() => handleToggleStandardField(key)} // Use handler from hook
                                    size="sm"
                                    isDisabled={isSaving} // Disable during save
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Custom Fields Section */}
                <section>
                    <h4 className="font-medium mb-2 border-b pb-1">Custom Questions</h4>
                    {/* Input to add new custom field */}
                    <div className="flex gap-2 mb-4">
                        <Input
                            placeholder="Enter custom question label"
                            value={newCustomLabel} // Use state from hook
                            onValueChange={setNewCustomLabel} // Use handler from hook
                            className="flex-grow"
                            isDisabled={isSaving}
                        />
                        <Button
                            size="sm"
                            onPress={handleAddCustomLabel} // Use handler from hook
                            isDisabled={!newCustomLabel.trim() || isSaving}
                        >
                            Add Question
                        </Button>
                    </div>
                    {/* List of existing custom fields */}
                    <div className="border rounded p-2 max-h-48 overflow-y-auto">
                        {additionalLabels.length === 0 ? (
                            <p className="text-sm text-gray-500 italic text-center py-2">No custom questions added yet.</p>
                        ) : (
                            <Listbox aria-label="Custom Questions List">
                                {additionalLabels.map((label, index) => (
                                    <ListboxItem
                                        key={`${label}-${index}`}
                                        textValue={label}
                                        className="data-[selected=true]:bg-transparent"
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span className="text-sm flex-grow mr-2">{label}</span>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="danger"
                                                onPress={() => handleRemoveCustomLabel(label)} // Use handler from hook
                                                aria-label={`Remove question: ${label}`}
                                                isDisabled={isSaving}
                                            >
                                                <MdDelete />
                                            </Button>
                                        </div>
                                    </ListboxItem>
                                ))}
                            </Listbox>
                        )}
                    </div>
                </section>

            </CardBody>
            <CardFooter className="flex justify-end gap-3">
                 {/* Display Save Error */}
                 {saveError && <p className="text-red-600 text-sm mr-auto">Error: {saveError}</p>}
                 {onCancel && (
                    <Button variant="ghost" onPress={onCancel} isDisabled={isSaving}>
                        Cancel
                    </Button>
                 )}
                <Button
                    color="primary"
                    onPress={handleSaveClick} // Call local handler which calls hook's saveChanges
                    isLoading={isSaving} // Use state from hook
                    isDisabled={isSaving || isLoading} // Disable while saving or initial loading
                >
                    Save Template Changes
                </Button>
            </CardFooter>
        </Card>
    );
}