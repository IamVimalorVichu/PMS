// GeneralDetailsTab.tsx
import React from "react"; // Import React
import { Input, Button, Card, CardBody, Progress, Textarea } from "@heroui/react"; // Assuming these imports are correct
import { PreviewModeWrapper, ReadOnlyField } from "./PreviewModeWrapper";

interface GeneralDetailsTabProps {
    isUpdateMode: boolean; // Use a boolean flag instead of checking drive object directly
    isPreviewMode?: boolean; // Add isPreviewMode to props
    title: string;
    setTitle: (value: string) => void;
    location: string;
    setLocation: (value: string) => void;
    desc: string;
    setDesc: (value: string) => void;
    drive_date: Date | null;
    setDriveDate: (value: Date | null) => void; // Allow setting null
    application_deadline: Date | null;
    setApplicationDeadline: (value: Date | null) => void; // Allow setting null
    additional_instructions: string;
    setAdditionalInstructions: (value: string) => void;
    stages: string[];
    setStages: (value: string[]) => void;
    onSave: () => void; // Renamed for clarity (used for both create/update)
    onDelete?: () => void; // Optional delete action for update mode
    driveProgress: number; // Add this prop
    form_link?: string;
    setFormLink: (value: string) => void;
}

// Helper to format Date to YYYY-MM-DD string for input[type=date]
const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    // Ensure it's a Date object before calling methods
    const d = date instanceof Date ? date : new Date(date);
     if (isNaN(d.getTime())) return ""; // Handle invalid date strings/objects
    return d.toISOString().split('T')[0];
};

export default function GeneralDetailsTab({
    isUpdateMode,
    isPreviewMode = false, // Add isPreviewMode with default value
    title, setTitle,
    location, setLocation,
    desc, setDesc,
    drive_date, setDriveDate,
    application_deadline, setApplicationDeadline,
    additional_instructions, setAdditionalInstructions,
    stages, setStages,
    onSave,
    onDelete,
    driveProgress,
    form_link, setFormLink,
}: GeneralDetailsTabProps) {

    if (isPreviewMode) {
        return (
            <PreviewModeWrapper>
                <div className="space-y-6">
                    <ReadOnlyField label="Title" value={title} />
                    <ReadOnlyField label="Description" value={desc} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ReadOnlyField label="Location" value={location} />
                        <ReadOnlyField 
                            label="Drive Date" 
                            value={drive_date ? new Date(drive_date).toLocaleDateString() : '-'} 
                        />
                        <ReadOnlyField 
                            label="Application Deadline" 
                            value={application_deadline ? new Date(application_deadline).toLocaleDateString() : '-'} 
                        />
                        <ReadOnlyField label="Form Link" value={form_link || '-'} />
                    </div>
                    <ReadOnlyField label="Additional Instructions" value={additional_instructions} />
                    
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Recruitment Stages</h3>
                        <div className="space-y-2">
                            {stages.map((stage, index) => (
                                <div key={index} className="bg-white p-3 rounded border">
                                    {index + 1}. {stage}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </PreviewModeWrapper>
        );
    }

    // Handler for stage input changes
    const handleStageChange = (index: number, value: string) => {
        const newStages = [...stages];
        newStages[index] = value;
        setStages(newStages);
    };

    // Handler for adding a new stage
    const addStage = () => {
        setStages([...stages, ""]); // Add a new empty stage
    };

    // Handler for removing a stage
    const removeStage = (index: number) => {
        // Prevent removing the last stage if you require at least one
        if (stages.length <= 1) {
           console.warn("Cannot remove the last stage.");
           // Optionally provide user feedback here
           return;
        }
        const newStages = stages.filter((_, i) => i !== index);
        setStages(newStages);
    };

    return (
        <Card className="w-full max-w-4xl p-6 sm:p-8 transition-all duration-300 min-h-[300px] shadow-lg">
            <CardBody>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800">Drive Details</h2>
                    <div className="w-40">
                        <Progress 
                            value={driveProgress} 
                            className="h-3 rounded-full"
                            color={driveProgress < 30 ? "danger" : driveProgress < 70 ? "warning" : "success"}
                        />
                        <span className="text-sm text-gray-500 mt-2 block text-right">{driveProgress}% complete</span>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Basic Information Section */}
                    <div className="space-y-6">
                        <Input
                            label="Title"
                            isRequired
                            variant="underlined"
                            color="primary"
                            classNames={{
                                input: "text-lg",
                                label: "text-gray-600"
                            }}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        
                        <Textarea
                            label="Description"
                            variant="underlined"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            minRows={5}
                            className="mt-4"
                            classNames={{
                                label: "text-gray-600",
                                input: "min-h-[120px] resize-y"
                            }}
                            placeholder="Enter drive description..."
                        />
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <Input
                            label="Location"
                            variant="underlined"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                        <Input
                            type="date"
                            label="Drive Date"
                            variant="underlined"
                            value={formatDateForInput(drive_date)}
                            onChange={(e) => setDriveDate(e.target.value ? new Date(e.target.value) : null)}
                        />
                        <Input
                            type="date"
                            label="Application Deadline"
                            variant="underlined"
                            value={formatDateForInput(application_deadline)}
                            onChange={(e) => setApplicationDeadline(e.target.value ? new Date(e.target.value) : null)}
                        />
                        <Input
                            label="Form Link"
                            variant="underlined"
                            value={form_link}
                            onChange={(e) => setFormLink(e.target.value)}
                            placeholder="e.g., https://example.com/form"
                        />
                    </div>

                    {/* Additional Instructions Section */}
                    <div className="mt-6">
                        <Textarea
                            label="Additional Instructions"
                            variant="underlined"
                            value={additional_instructions}
                            onChange={(e) => setAdditionalInstructions(e.target.value)}
                            minRows={4}
                            classNames={{
                                label: "text-gray-600",
                                input: "min-h-[100px] resize-y"
                            }}
                            placeholder="Enter any additional instructions..."
                        />
                    </div>

                    {/* Stages Section */}
                    <div className="flex flex-col gap-4 mt-8 border-t pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Recruitment Stages</h3>
                            <Button
                                color="primary"
                                variant="flat"
                                size="sm"
                                onPress={addStage}
                                className="px-4"
                            >
                                Add Stage
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {stages.map((stage, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <Input
                                        className="flex-grow"
                                        label={`Stage ${index + 1}`}
                                        variant="bordered" // Example variant
                                        value={stage}
                                        isRequired={index === 0} // Keep first stage required if needed
                                        onChange={(e) => handleStageChange(index, e.target.value)}
                                        placeholder="e.g., Aptitude Test, Technical Interview"
                                    />
                                    {/* Only show remove button if there's more than one stage */}
                                    {stages.length > 1 && (
                                        <Button
                                            color="danger"
                                            variant="light" // Example variant
                                            isIconOnly // Assuming heroUI has icon-only buttons
                                            size="sm"
                                            onPress={() => removeStage(index)}
                                            aria-label={`Remove Stage ${index + 1}`} // Accessibility
                                        >
                                           {/* Add an Icon here e.g., <TrashIcon /> */}
                                           X
                                        </Button>
                                    )}
                                </div>
                            ))}
                             {stages.length === 0 && ( // Optional: Message if no stages exist (shouldn't happen with hook init)
                                <p className="text-sm text-gray-500 text-center">Click Add Stage to define the recruitment process.</p>
                             )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
                        <Button color="primary" className="flex-1 h-12 text-base font-medium" onPress={onSave}>
                            {isUpdateMode ? "Save Changes" : "Create Drive"}
                        </Button>
                        {onDelete && (
                            <Button color="danger" className="flex-1 h-12 text-base font-medium" onPress={onDelete}>
                                Delete Drive
                            </Button>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}