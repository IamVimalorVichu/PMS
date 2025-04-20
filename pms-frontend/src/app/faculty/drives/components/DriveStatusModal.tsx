// components/DriveStatusModal.tsx
import React, { useState, useCallback } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Checkbox } from "@heroui/react"; // Assuming Checkbox and Input exist
import { useDriveStatusManagement } from './useDriveStatusManagement'; // Adjust path


interface DriveStatusModalProps {
    isOpen: boolean;
    onClose: () => void; // Function to close the modal
    driveId: string | null;
    driveName?: string;
    // No onSave prop needed, save logic is handled via hook actions
}

export default function DriveStatusModal({
    isOpen,
    onClose,
    driveId,
    driveName = "Selected Drive",
}: DriveStatusModalProps) {

    // Instantiate the hook to get state and actions
    const {
        // Data
        driveData,
        jobs,
        activeJobId,
        currentStageIndex,
        driveStages,
        studentsToDisplay,
        currentSelections, // Set of selected student IDs for the active job/stage

        // UI State
        isLoading,
        error,
        isSaving, // Loading state for shortlisting/confirming
        saveError, // Error state for shortlisting/confirming
        isUpdatingStages, // Loading state for adding/removing stages
        stageUpdateError, // Error state for adding/removing stages
        canShortlistCurrentStage,
        isLastStage, // Boolean indicating if current stage is the last one

        // Handlers
        handleTabChange,
        handleStageChange, // Function to change stage index
        handleStudentSelectionToggle, // Function to toggle a student's selection state
        handleShortlistForNextStage, // Function for the "Shortlist" button
        handleConfirmFinalPlacements, // Function for the "Confirm Placement" button
        handleAddStage, // Function to add a new stage name
        handleRemoveStage, // Function to remove an upcoming stage by index
    } = useDriveStatusManagement({ isOpen, driveId });

    // Local state specifically for the "Add Stage" input field
    const [newStageName, setNewStageName] = useState('');

    // Local handler for adding a stage (clears input on success)
    const handleAddStageClick = useCallback(async () => {
        if (!newStageName.trim()) return;
        try {
            await handleAddStage(newStageName.trim());
            setNewStageName(''); // Clear input on success
        } catch (err) {
            // Error is already handled and set in the hook's state (stageUpdateError)
            console.error("Add stage failed:", err);
        }
    }, [newStageName, handleAddStage]);

    // Local handler for removing a stage
    const handleRemoveStageClick = useCallback(async (indexToRemove: number) => {
        // The hook's handleRemoveStage already contains the index validation logic
        try {
            await handleRemoveStage(indexToRemove);
        } catch (err) {
            // Error is already handled and set in the hook's state (stageUpdateError)
            console.error("Remove stage failed:", err);
        }
    }, [handleRemoveStage]);


    // --- Rendering Logic ---

    // Renders stage navigation controls
    const renderStageControls = () => {
        if (!driveStages || driveStages.length === 0) {
            return <p className="text-center text-gray-500 my-4">No stages defined for this drive.</p>;
        }

        const currentStageName = driveStages[currentStageIndex] || `Stage ${currentStageIndex + 1}`;

        return (
            <div className="flex justify-between items-center mb-4 p-2 bg-gray-100 rounded">
                <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => handleStageChange(currentStageIndex - 1)}
                    isDisabled={currentStageIndex === 0 || isSaving || isUpdatingStages} // Disable on first stage or during actions
                >
                    Prev Stage
                </Button>
                <span className="font-semibold text-center">
                    Stage {currentStageIndex + 1}: {currentStageName}
                </span>
                <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => handleStageChange(currentStageIndex + 1)}
                    isDisabled={currentStageIndex >= driveStages.length - 1 || isSaving || isUpdatingStages} // Disable on last stage or during actions
                >
                    Next Stage
                </Button>
            </div>
        );
    };

    // Renders the list of students with checkboxes
    const renderStudentList = () => {
        return (
            <div className="mt-4 border rounded max-h-80 overflow-y-auto"> {/* Adjusted max height */}
                {studentsToDisplay.length === 0 && (
                    <p className="p-3 text-gray-500">
                        {currentStageIndex === 0
                            ? "No eligible students found for this job."
                            : "No students shortlisted from the previous stage."}
                    </p>
                )}
                {studentsToDisplay.map((student, index) => (
                    <div key={student._id} className={`flex items-center p-3 ${index < studentsToDisplay.length - 1 ? 'border-b' : ''}`}>
                        <Checkbox
                            isSelected={currentSelections.has(student._id)}
                            onValueChange={() => handleStudentSelectionToggle(student._id)}
                            className="mr-3 flex-shrink-0"
                            aria-label={`Select student ${student.first_name} ${student.last_name}`}
                            isDisabled={isSaving || isUpdatingStages} // Disable during actions
                        />
                        <div className="flex-grow">
                            <span className="font-medium block">{student.first_name} {student.last_name}</span>
                            <div className="text-sm text-gray-600">
                                <span>Reg No: {student.reg_no || 'N/A'}</span>
                                <span className="mx-2">|</span>
                                <span>Program: {student.program || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Renders the UI for adding/removing stages
    const renderStageManagement = () => {
        return (
            <div className="mt-6 p-4 border-t">
                <h4 className="font-semibold mb-3 text-gray-700">Manage Stages</h4>
                {/* Add Stage Section */}
                <div className="flex gap-2 mb-4 items-center">
                    <Input
                        placeholder="New stage name (e.g., Final Interview)"
                        value={newStageName}
                        onValueChange={setNewStageName}
                        className="flex-grow"
                        isDisabled={isUpdatingStages || isSaving}
                    />
                    <Button
                        size="sm"
                        color="default"
                        variant="ghost"
                        onPress={handleAddStageClick}
                        isDisabled={!newStageName.trim() || isUpdatingStages || isSaving}
                        isLoading={isUpdatingStages} // Show loading indicator on button if supported
                    >
                        Add Stage After Current
                    </Button>
                </div>

                {/* Remove Stage Section */}
                <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-600">Upcoming Stages:</h5>
                    {driveStages.length > currentStageIndex + 1 ? (
                        driveStages.slice(currentStageIndex + 1).map((stageName, relativeIndex) => {
                            const actualIndex = currentStageIndex + 1 + relativeIndex;
                            return (
                                <div key={actualIndex} className="flex justify-between items-center text-sm p-1 bg-gray-50 rounded">
                                    <span>{actualIndex + 1}. {stageName}</span>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        color="danger"
                                        onPress={() => handleRemoveStageClick(actualIndex)}
                                        isDisabled={isUpdatingStages || isSaving}
                                        isLoading={isUpdatingStages} // Show loading indicator
                                        className="ml-2"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-gray-500 italic">No upcoming stages defined.</p>
                    )}
                </div>
                 {/* Display Stage Update Errors */}
                 {stageUpdateError && <p className="text-red-600 mt-2 text-sm">Stage Update Error: {stageUpdateError}</p>}
            </div>
        );
    };

    // Renders the main content area for the selected job tab
    const renderActiveJobContent = () => {
        // Display loading/error states first
        if (isLoading) return <p className="text-center p-4">Loading job data...</p>; // Specific loading for job data if needed
        if (!activeJobId && jobs.length > 0) {
             return <p className="text-center text-gray-500 p-4">Select a job tab.</p>;
        }
        const currentJob = jobs.find(job => job._id === activeJobId);
        if (!currentJob) {
             // This case might occur briefly or if jobs array is empty
             return <p className="text-center text-gray-500 p-4">Job details not available.</p>;
        }

        // Render stage controls, student list, and stage management for the active job
        return (
            <>
                {renderStageControls()}
                {renderStudentList()}
                {renderStageManagement()}
            </>
        );
    };

    // --- Main Modal Structure ---
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="5xl"> {/* Made modal wider */}
            <ModalContent>
                <ModalHeader>Update Drive Status: {driveName}</ModalHeader>
                <ModalBody>
                    {/* Display initial loading indicator or error */}
                    {isLoading ? (
                        <div className="flex justify-center items-center min-h-[300px]">
                            <p>Loading Drive Data...</p> {/* Or use a spinner */}
                        </div>
                    ) : error ? (
                         <p className="text-red-600 text-center p-4">Error: {error}</p>
                    ) : !driveData || jobs.length === 0 ? (
                         <p className="text-center text-gray-600 p-4">No jobs found or drive data unavailable.</p>
                    ) : (
                        // Main Tab Structure
                        <div className="tabs-container border border-gray-300 rounded">
                           {/* Job Tabs */}
                           <div className="tab-list flex flex-wrap border-b border-gray-300 bg-gray-100" role="tablist">
                                {jobs.map(job => (
                                    <button
                                        key={job._id}
                                        role="tab"
                                        aria-selected={activeJobId === job._id}
                                        onClick={() => handleTabChange(job._id)}
                                        className={`px-4 py-2 border-b-2 focus:outline-none whitespace-nowrap ${
                                            activeJobId === job._id
                                            ? 'border-blue-500 text-blue-600 bg-white font-semibold'
                                            : 'border-transparent text-gray-600 hover:text-blue-500 hover:border-gray-300'
                                        }`}
                                        // Disable tabs while saving/updating stages? Maybe not necessary.
                                        // disabled={isSaving || isUpdatingStages}
                                    >
                                        {job.title}
                                    </button>
                                ))}
                            </div>
                           {/* Content Panel for Active Job/Stage */}
                           <div className="tab-panel p-4 bg-white min-h-[400px]"> {/* Increased min-height */}
                                {renderActiveJobContent()}
                           </div>
                        </div>
                    )}
                     {/* Display saving error if it occurs */}
                     {saveError && <p className="text-red-600 mt-4 text-center">Save Error: {saveError}</p>}
                </ModalBody>
                <ModalFooter>
                    <Button variant="shadow" onPress={onClose} disabled={isSaving || isUpdatingStages}>
                        Cancel
                    </Button>

                    {/* Conditional Action Button */}
                    {!isLastStage ? (
                        // "Shortlist" button
                        <div className="flex flex-col items-end"> {/* Wrapper for button and message */}
                            <Button
                                color="primary"
                                onPress={handleShortlistForNextStage}
                                // *** UPDATED isDisabled check ***
                                isDisabled={
                                    !canShortlistCurrentStage || // <-- Check if previous stage allows shortlisting
                                    isSaving ||
                                    isUpdatingStages ||
                                    isLoading ||
                                    !activeJobId ||
                                    currentSelections.size === 0 // Still disable if nothing selected
                                }
                                isLoading={isSaving}
                                title={!canShortlistCurrentStage && currentStageIndex > 0 ? "Shortlist students from the previous stage first" : undefined}
                            >
                                Shortlist ({currentSelections.size}) for Next Stage
                            </Button>
                            {/* *** ADD Conditional Message *** */}
                            {!canShortlistCurrentStage && currentStageIndex > 0 && (
                                <p className="text-xs text-red-600 mt-1">Shortlist students from the previous stage first.</p>
                            )}
                        </div>
                    ) : (
                        // "Confirm Placement" button
                         <div className="flex flex-col items-end"> {/* Wrapper for button and message */}
                            <Button
                                color="success"
                                variant="solid"
                                onPress={handleConfirmFinalPlacements}
                                // *** UPDATED isDisabled check ***
                                isDisabled={
                                    !canShortlistCurrentStage || // <-- Check if previous stage allows placement
                                    isSaving ||
                                    isUpdatingStages ||
                                    isLoading ||
                                    !activeJobId ||
                                    currentSelections.size === 0 // Still disable if nothing selected
                                }
                                isLoading={isSaving}
                                title={!canShortlistCurrentStage && currentStageIndex > 0 ? "Shortlist students from the previous stage first" : undefined}
                            >
                                Confirm Final Placements ({currentSelections.size})
                            </Button>
                             {/* *** ADD Conditional Message *** */}
                             {!canShortlistCurrentStage && currentStageIndex > 0 && (
                                <p className="text-xs text-red-600 mt-1">Shortlist students from the previous stage first.</p>
                            )}
                        </div>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}