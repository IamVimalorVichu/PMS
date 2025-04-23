// components/ViewEligibleStudentsModal.tsx
import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { useViewEligibleStudentsManagement } from './useViewEligibleStudentsManagement'; // Adjust path
import { Student } from '@/app/students/components/types'; // Assuming Student type is here
import { ApplicationAndResumeModal } from '@/app/students/components/ApplicationAndResumeModal'; // New import

// --- REMOVE onSaveChanges from Props ---
interface ViewEligibleStudentsModalProps {
    isOpen: boolean;
    onClose: () => void; // Keep onClose to close the modal
    driveId: string | null;
    driveName?: string;
    // onSaveChanges prop is removed
}

export default function ViewEligibleStudentsModal({
    isOpen,
    onClose, // Use onClose passed from parent
    driveId,
    driveName = "Selected Drive",
    // onSaveChanges prop is removed
}: ViewEligibleStudentsModalProps) {

    // Destructure the hook's return values
    const {
        jobs, // List of jobs for tabs
        activeJobId, // Currently selected job tab ID
        handleTabChange, // Function to change tabs
        currentDisplayedStudents, // Students currently eligible for the active job
        availableToAddStudents, // Students available in the dropdown
        appliedStudentsSet, // Set of students who applied to the active job
        handleAddStudent, // Function to add a student
        handleRemoveStudent, // Function to remove a student
        isFetchingData, // Loading state for initial data fetch
        error, // Error state for initial data fetch
        saveChanges, // *** Function provided by the hook to save all changes ***
    } = useViewEligibleStudentsManagement({ isOpen, driveId }); // Pass props to the hook

    // Local state for the modal's saving process
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Handler for the "Save Changes" button click
    const handleSaveClick = async () => {
         // No need to check driveId here, hook handles context
         setIsSaving(true);
         setSaveError(null); // Clear previous save errors

         try {
             // *** Call the saveChanges function directly from the hook ***
             await saveChanges();
             // If saveChanges succeeds, close the modal.
             // The parent page (page.tsx) handles re-fetching data in its onClose handler if needed.
             onClose();
         } catch (err) {
             // If saveChanges throws an error (e.g., API call failed)
             console.error("Error saving eligible student changes:", err);
             setSaveError(`Failed to save changes: ${(err as Error).message}`);
             // Keep the modal open to show the error message
         } finally {
             setIsSaving(false); // Reset saving state regardless of outcome
         }
    };

    // Handler for the "Cancel" button or closing the modal
    const handleClose = () => {
        setSaveError(null); // Clear any save errors when closing
        onClose(); // Call the parent's onClose function
    }

    // --- Rendering Logic for the content of the active tab ---
    const renderActiveJobContent = () => {
        // Handle state where no job is selected yet (e.g., jobs are loading or empty)
        if (!activeJobId && jobs.length > 0) {
             return <p className="text-center text-gray-500">Select a job tab to view/edit eligible students.</p>;
        }

        // Display global loading/error states for the initial data fetch
        if (isFetchingData) return <p className="text-center">Loading data...</p>;
        if (error) return <p className="text-red-600 text-center">Error loading data: {error}</p>;

        // Render content for the active tab if data is loaded and no errors
        if (activeJobId) {
            return (
                <div>
                    <AddStudentDropdownView
                        students={availableToAddStudents}
                        onAddStudent={handleAddStudent}
                        isLoading={isFetchingData}
                        appliedStudentsSet={appliedStudentsSet}
                    />

                    <StudentListView
                        students={currentDisplayedStudents}
                        onRemoveStudent={handleRemoveStudent}
                        appliedStudentsSet={appliedStudentsSet}
                        jobId={activeJobId}
                        driveId={driveId || ''}
                        jobTitle={jobs.find(job => job._id === activeJobId)?.title || 'Job'}
                    />
                </div>
            );
        }
        // Fallback if no active job ID (should only happen if jobs array is empty after loading)
        return null;
    };

    // --- Main Modal Structure ---
    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="5xl">
            <ModalContent>
                <ModalHeader>View/Edit Eligible Students: {driveName}</ModalHeader>
                <ModalBody>
                    {/* Display loading/error or tab structure */}
                    {isFetchingData ? (
                        <div className="flex justify-center items-center min-h-[200px]">
                            <p>Loading...</p>
                        </div>
                    ) : error ? (
                         <p className="text-red-600 text-center">Error: {error}</p>
                    ) : jobs.length === 0 ? (
                         <p className="text-center text-gray-600">No jobs found for this drive.</p>
                    ) : (
                        // Tab structure
                        <div className="tabs-container border border-gray-300 rounded">
                           <div className="tab-list flex flex-wrap border-b border-gray-300 bg-gray-100" role="tablist">
                                {jobs.map(job => (
                                    <button
                                        key={job._id}
                                        role="tab"
                                        aria-selected={activeJobId === job._id}
                                        onClick={() => handleTabChange(job._id)} // Use hook's handler
                                        className={`px-4 py-2 border-b-2 focus:outline-none whitespace-nowrap ${
                                            activeJobId === job._id
                                            ? 'border-blue-500 text-blue-600 bg-white font-semibold'
                                            : 'border-transparent text-gray-600 hover:text-blue-500 hover:border-gray-300'
                                        }`}
                                    >
                                        {job.title}
                                    </button>
                                ))}
                            </div>
                           <div className="tab-panel p-4 bg-white min-h-[300px]">
                                {renderActiveJobContent()} {/* Render the dynamic content */}
                           </div>
                        </div>
                    )}
                     {/* Display saving error if it occurs */}
                     {saveError && <p className="text-red-600 mt-4 text-center">Save Error: {saveError}</p>}
                </ModalBody>
                <ModalFooter>
                    {/* Cancel Button */}
                    <Button variant="shadow" onPress={handleClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    {/* Save Changes Button */}
                    <Button
                        color="primary"
                        onPress={handleSaveClick} // Call the local save handler
                        // Disable if saving, initial data is loading, initial error occurred, or no jobs exist
                        disabled={isSaving || isFetchingData || !!error || jobs.length === 0}
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}


// --- StudentListView Component ---
// Displays Name, Reg No, Program and disables remove for applied students
interface StudentListViewProps {
    students: Student[];
    onRemoveStudent: (studentId: string) => void;
    appliedStudentsSet: Set<string>; // Set of IDs who have applied
    jobId: string; // Add this
    driveId: string; // Add this
    jobTitle: string; // Add this
}

const StudentListView: React.FC<StudentListViewProps> = ({ 
    students, 
    onRemoveStudent, 
    appliedStudentsSet,
    jobId,
    driveId,
    jobTitle
}) => {
    // Add state for modal
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    return (
        <div className="mt-4 border rounded max-h-96 overflow-y-auto">
            {students.length === 0 && <p className="p-3 text-gray-500">No eligible students currently selected for this job.</p>}
            {students.map((student, index) => {
                const hasApplied = appliedStudentsSet.has(student._id);
                return (
                    <div 
                        key={student._id} 
                        className={`p-3 ${index < students.length - 1 ? 'border-b' : ''} 
                            ${hasApplied ? 'bg-gray-100 opacity-70' : ''} 
                            cursor-pointer hover:bg-gray-50`} // Add cursor-pointer and hover effect
                        onClick={() => hasApplied && setSelectedStudent(student)} // Only allow click if student has applied
                    >
                        <div className="flex justify-between items-center">
                            {/* Existing student details */}
                            <div className="flex-grow mr-4">
                                <span className="font-medium block">{student.first_name} {student.last_name}</span>
                                <div className="text-sm text-gray-600">
                                    <span>Reg No: {student.reg_no || 'N/A'}</span>
                                    <span className="mx-2">|</span>
                                    <span>Program: {student.program || 'N/A'}</span>
                                </div>
                            </div>
                            {/* Existing Remove Button */}
                            <Button
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={(e:unknown) => {
                                    (e as React.MouseEvent).stopPropagation(); // Prevent row click when clicking button
                                    onRemoveStudent(student._id);
                                }}
                                className="ml-2 flex-shrink-0"
                                isDisabled={hasApplied}
                                title={hasApplied ? "Cannot remove student who has applied" : "Remove student"}
                            >
                                {hasApplied ? "Applied" : "Remove"}
                            </Button>
                        </div>
                    </div>
                );
            })}

            {/* Add ApplicationAndResumeModal */}
            {selectedStudent && (
                <ApplicationAndResumeModal
                    isOpen={!!selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    driveId={driveId}
                    jobId={jobId}
                    studentId={selectedStudent._id}
                    jobTitle={jobTitle}
                />
            )}
        </div>
    );
};


// --- AddStudentDropdownView Component ---
// Disables adding students who have already applied
interface AddStudentDropdownViewProps {
    students: Student[]; // Students available to add (not currently in the list)
    onAddStudent: (studentId: string) => void;
    isLoading: boolean; // Loading state for initial data (disables dropdown)
    appliedStudentsSet: Set<string>; // Set of IDs who have applied to the current job
}
const AddStudentDropdownView: React.FC<AddStudentDropdownViewProps> = ({ students, onAddStudent, isLoading, appliedStudentsSet }) => {
    const [selectedStudentId, setSelectedStudentId] = useState('');

    const handleAdd = () => {
        if (selectedStudentId) {
            onAddStudent(selectedStudentId);
            setSelectedStudentId(''); // Reset dropdown
        }
    };

    // Determine if the currently selected student in the dropdown has applied
    const isSelectedStudentApplied = selectedStudentId ? appliedStudentsSet.has(selectedStudentId) : false;

    return (
        <div className="flex gap-2 items-center mb-4">
            <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                disabled={isLoading || students.length === 0} // Disable if loading or no students to add
                className="border rounded p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">{isLoading ? "Loading students..." : students.length === 0 ? "No students available to add" : "Select student to add..."}</option>
                {students.map(student => (
                    // Disable individual options if that student has applied
                    <option key={student._id} value={student._id} disabled={appliedStudentsSet.has(student._id)}>
                        {student.first_name} {student.last_name} ({student.reg_no || 'No RegNo'})
                        {appliedStudentsSet.has(student._id) ? ' (Applied)' : ''}
                    </option>
                ))}
            </select>
            <Button
                onPress={handleAdd}
                // Disable button if no student selected, loading, or the selected student has applied
                isDisabled={!selectedStudentId || isLoading || isSelectedStudentApplied}
                size="md"
                title={isSelectedStudentApplied ? "Cannot add student who has applied" : "Add selected student"}
            >
                Add Student
            </Button>
        </div>
    );
};