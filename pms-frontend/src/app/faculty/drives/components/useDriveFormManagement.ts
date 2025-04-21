// hooks/useDriveFormManagement.ts
import { useState, useEffect, useCallback } from 'react';
import { DriveForm, DriveFormUpdate } from './types'; // Adjust path
import { fetchDriveFormTemplateAPI, upsertDriveFormTemplateAPI } from './API'; // Adjust path

// Helper object for default values and labels (can be defined here or imported)
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

// Default fields to be true when creating a new template
const defaultTrueFields = new Set([
    'include_first_name', 'include_last_name', 'include_email', 'include_reg_no',
    'include_program', 'include_ph_no', 'include_tenth_cgpa', 'include_twelfth_cgpa',
    'include_degree_cgpa', 'include_mca_cgpa', 'include_skills', 'include_linkedin_url'
]);

interface UseDriveFormManagementProps {
    driveId: string | null;
}

export const useDriveFormManagement = ({ driveId }: UseDriveFormManagementProps) => {
    // State for the boolean flags of standard fields
    const [templateFlags, setTemplateFlags] = useState<Record<string, boolean>>({});
    // State for the list of custom question labels
    const [additionalLabels, setAdditionalLabels] = useState<string[]>([]);
    // State for the input field for adding new custom labels
    const [newCustomLabel, setNewCustomLabel] = useState('');

    // Loading and error states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // --- Fetch Initial Template ---
    const fetchTemplate = useCallback(async () => {
        if (!driveId) {
            setError("No Drive ID provided.");
            setTemplateFlags({});
            setAdditionalLabels([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSaveError(null);
        try {
            // Attempt to fetch existing template
            const fetchedTemplate: DriveForm | null = await fetchDriveFormTemplateAPI(driveId);
            
            // Initialize with default values whether template exists or not
            const initialFlags: Record<string, boolean> = {};
            Object.keys(standardFieldLabels).forEach(key => {
                if (fetchedTemplate) {
                    // Use existing template values if available
                    initialFlags[key] = !!(fetchedTemplate[key as keyof DriveForm] ?? false);
                } else {
                    // Use default values for new template
                    initialFlags[key] = defaultTrueFields.has(key);
                }
            });

            setTemplateFlags(initialFlags);
            // Initialize empty array for new template or use existing labels
            setAdditionalLabels(fetchedTemplate?.additional_field_labels ?? []);

        } catch {
            console.warn("No existing template found, starting with defaults");
            // Initialize with defaults instead of showing error
            const defaultFlags: Record<string, boolean> = {};
            Object.keys(standardFieldLabels).forEach(key => {
                defaultFlags[key] = defaultTrueFields.has(key);
            });
            setTemplateFlags(defaultFlags);
            setAdditionalLabels([]);
            // Don't set error state since this is an expected case
            setError(null);
        } finally {
            setIsLoading(false);
        }
    }, [driveId]); // Re-fetch only if driveId changes

    // Trigger fetch on mount or when driveId changes
    useEffect(() => {
        fetchTemplate();
    }, [fetchTemplate]);

    // --- Handlers ---

    // Toggle standard field inclusion
    const handleToggleStandardField = useCallback((fieldName: string) => {
        // Ensure the fieldName is a valid key before toggling
        if (fieldName in standardFieldLabels) {
            setTemplateFlags(prev => ({
                ...prev,
                [fieldName]: !prev[fieldName] // Toggle the boolean value
            }));
        } else {
            console.warn(`Attempted to toggle invalid field: ${fieldName}`);
        }
    }, []);

    // Add a new custom field label
    const handleAddCustomLabel = useCallback(() => {
        const trimmedLabel = newCustomLabel.trim();
        if (trimmedLabel && !additionalLabels.includes(trimmedLabel)) {
            setAdditionalLabels(prev => [...prev, trimmedLabel]);
            setNewCustomLabel(''); // Clear input
        } else if (additionalLabels.includes(trimmedLabel)) {
            console.warn("Custom label already exists:", trimmedLabel);
            // Optionally provide user feedback here
        }
    }, [newCustomLabel, additionalLabels]);

    // Remove a custom field label
    const handleRemoveCustomLabel = useCallback((labelToRemove: string) => {
        setAdditionalLabels(prev => prev.filter(label => label !== labelToRemove));
    }, []);

    // Save the template changes (Upsert logic)
    const saveChanges = useCallback(async (): Promise<DriveForm | void> => { // Return saved template or void
        if (!driveId) {
            setSaveError("Cannot save without a Drive ID.");
            throw new Error("Cannot save without a Drive ID."); // Throw error to be caught by caller
        }

        setIsSaving(true);
        setSaveError(null);

        // Construct the payload for the API (DriveFormUpdate type)
        // Include all current flag states and labels
        const updatePayload: DriveFormUpdate = {
            ...templateFlags, // Spread all boolean flags
            additional_field_labels: additionalLabels,
        };

        try {
            // API function performs the upsert
            const savedTemplate = await upsertDriveFormTemplateAPI(driveId, updatePayload);
            console.log("Template saved successfully:", savedTemplate);

            // Update local state to match saved state ONLY IF NECESSARY
            // Usually the API returns the saved state, which might have defaults applied
            // Re-fetching might be safer if backend modifies data upon save
            // For now, assume API returns the final state or re-fetch after save in the component
            // Example: If API returns the saved template:
            // const updatedFlags: Record<string, boolean> = {};
            // Object.keys(standardFieldLabels).forEach(key => {
            //     updatedFlags[key] = !!(savedTemplate as any)[key];
            // });
            // setTemplateFlags(updatedFlags);
            // setAdditionalLabels(savedTemplate.additional_field_labels || []);

            return savedTemplate; // Return saved data on success

        } catch (err) {
            console.error("Error saving drive form template:", err);
            const errorMsg = `Failed to save template: ${(err as Error).message}`;
            setSaveError(errorMsg);
            throw new Error(errorMsg); // Re-throw error for the component to handle
        } finally {
            setIsSaving(false);
        }
    }, [driveId, templateFlags, additionalLabels]); // Removed upsertDriveFormTemplateAPI from deps

    // --- Return Values ---
    // Expose state and handlers needed by the UI component
    return {
        templateFlags,
        additionalLabels,
        newCustomLabel,
        isLoading,
        error,
        isSaving,
        saveError,
        handleToggleStandardField,
        setNewCustomLabel, // Expose setter for the input field
        handleAddCustomLabel,
        handleRemoveCustomLabel,
        saveChanges, // Expose the save function
        fetchTemplate, // Expose refetch function if needed externally
    };
};