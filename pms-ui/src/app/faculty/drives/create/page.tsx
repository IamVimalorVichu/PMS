'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import GeneralDetailsTab from "../components/GeneralDetailsTab";
import { useDriveManagement } from "../components/useDriveManagement";

export default function Create() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const {
        drive_id,
        title, setTitle,
        desc, setDesc,
        location, setLocation,
        drive_date, setDriveDate,
        application_deadline, setApplicationDeadline,
        additional_instructions, setAdditionalInstructions,
        driveform_link, setDriveFormLink,
        stages, setStages,
        driveProgress,
        handleAddDrive,
    } = useDriveManagement();

    const handleCreateDrive = async () => {
        setIsSubmitting(true);
        setError(null);
        
        try {
            // Just call handleAddDrive directly since it already handles everything
            await handleAddDrive();
            
            if (drive_id) {
                router.push(`/faculty/drives/edit?id=${drive_id}`);
            } else {
                throw new Error("Drive created but no ID was returned");
            }
        } catch (error) {
            console.error("Failed to create drive:", error);
            setError(error instanceof Error ? error.message : "Failed to create drive");
        } finally {
            setIsSubmitting(false);
        }
    };

    const generalDetailsProps = {
        title,
        setTitle,
        desc,
        setDesc,
        location,
        setLocation,
        drive_date,
        setDriveDate,
        application_deadline,
        setApplicationDeadline,
        additional_instructions,
        setAdditionalInstructions,
        stages, 
        setStages,
        isUpdateMode: false,
        onSave: handleCreateDrive,
        driveProgress,
        form_link: driveform_link,
        setFormLink: setDriveFormLink,
        disabled: isSubmitting,
    };

    return (
        <div className="flex flex-col items-center p-4">
            <div className="w-full max-w-4xl">
                <h1 className="text-2xl font-bold mb-6">Create New Drive</h1>
                
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                <GeneralDetailsTab {...generalDetailsProps}>
                    <Button
                        color="primary"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        onClick={handleCreateDrive}
                        className="mt-4"
                    >
                        {isSubmitting ? "Creating Drive..." : "Create Drive"}
                    </Button>
                </GeneralDetailsTab>
            </div>
        </div>
    );
}
