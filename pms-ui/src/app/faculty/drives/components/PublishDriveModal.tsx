// components/PublishDriveModal.tsx
import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
// Assuming Tabs, Tab components exist and are imported if needed
// import { Tabs, Tab } from './YourTabComponent';
import { usePublishManagement } from './usePublishManagement'; // Adjust path as needed
// Import necessary types, including the helper type and your Performance type
import { Job } from './types';
import { Student, StudentWithPerformance } from '@/app/students/components/types';

interface PublishDriveModalProps {
    isOpen: boolean;
    onClose: () => void;
    drive_id: string | null;
    driveName?: string;
    jobs: Job[] | undefined;
    // This function now receives the final map from the hook
    onPublishDrive: (finalMap: Record<string, string[]>) => Promise<void>;
}

export default function PublishDriveModal({
    isOpen,
    onClose,
    drive_id,
    driveName = "Selected Drive",
    jobs = [], // Default to empty array
    onPublishDrive
}: PublishDriveModalProps) {

    // Updated destructuring based on the modified usePublishManagement hook
    const {
        activeJobId,
        handleTabChange,
        currentDisplayedStudentsWithPerformance, // <-- Use the combined data
        availableToAddStudents,
        // --- UPDATED Loading/Error States ---
        isFetchingInitialData,          // Loading state for ALL students + ALL performances
        initialDataError,               // Error state for ALL students + ALL performances
        isFetchingEligibleLists, // <-- Get new loading state for all eligible lists
        eligibleListError,       // <-- Get new error state for all eligible lists
        handleAddStudent,
        handleRemoveStudent,
        getFinalStudentMap,
    } = usePublishManagement({ isOpen, drive_id, jobs });

    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);

    const handlePublishClick = async () => {
         if (!drive_id) return;
         setIsPublishing(true);
         setPublishError(null);

         const finalMap = getFinalStudentMap();

         try {
             await onPublishDrive(finalMap); // Call the callback prop with the map
             onClose(); // Close modal on success
         } catch (error) {
             console.error("Error publishing drive:", error);
             setPublishError(`Failed to publish: ${(error as Error).message}`);
         } finally {
             setIsPublishing(false);
         }
    };

    // Close handler resets publishing error
    const handleClose = () => {
        setPublishError(null);
        onClose();
    }

    // --- Rendering Logic ---
    const renderActiveJobContent = () => {
        // This specific content depends on the active tab, but loading/errors are global for initial fetches
        if (!activeJobId && jobs.length > 0) {
             return <p className="text-center text-gray-500">Select a job tab to view details.</p>;
        }

        // Display global loading/error states first
        if (isFetchingInitialData) return <p className="text-center">Loading initial student data...</p>;
        if (isFetchingEligibleLists) return <p className="text-center">Calculating eligible students for all jobs...</p>;
        if (initialDataError) return <p className="text-red-600 text-center">Error loading initial data: {initialDataError}</p>;
        if (eligibleListError) return <p className="text-red-600 text-center">Error calculating eligibility: {eligibleListError}</p>;

        // If no global errors and not loading, render the content for the active tab
        if (activeJobId) {
            return (
                <div>
                    {/* Pass isFetchingInitialData to disable dropdown while students/performances load */}
                    <AddStudentDropdown
                        students={availableToAddStudents}
                        onAddStudent={handleAddStudent}
                        isLoading={isFetchingInitialData}
                    />

                    {/* Pass the combined data structure to StudentList */}
                    <StudentList
                        studentsWithPerformance={currentDisplayedStudentsWithPerformance}
                        onRemoveStudent={handleRemoveStudent}
                    />
                </div>
            );
        }

        // Fallback if no active job ID (e.g., no jobs in the drive)
        return null;
    };

    return (
        // Added size="5xl" for potentially large lists/more space
        <Modal isOpen={isOpen} onClose={handleClose} size="5xl">
            <ModalContent>
                <ModalHeader>Publish Drive: {driveName}</ModalHeader>
                <ModalBody>
                    {/* Show loading indicator while fetching initial data or eligible lists */}
                    {isFetchingInitialData || isFetchingEligibleLists ? (
                        <div className="flex justify-center items-center min-h-[200px]">
                            <p>Loading drive data and eligibility...</p> {/* Or use a spinner component */}
                        </div>
                    ) : jobs.length === 0 ? (
                         <p className="text-center text-gray-600">No jobs found for this drive. Add jobs before publishing.</p>
                    ) : (
                        // Tab structure
                        <div className="tabs-container border border-gray-300 rounded">
                           <div className="tab-list flex flex-wrap border-b border-gray-300 bg-gray-100" role="tablist"> {/* Added flex-wrap */}
                                {(jobs || []).map(job => ( // Ensure jobs is an array
                                    <button
                                        key={job._id}
                                        role="tab"
                                        aria-selected={activeJobId === job._id}
                                        onClick={() => handleTabChange(job._id)}
                                        // Example styling - adapt to your design system
                                        className={`px-4 py-2 border-b-2 focus:outline-none whitespace-nowrap ${ // Added whitespace-nowrap
                                            activeJobId === job._id
                                            ? 'border-blue-500 text-blue-600 bg-white font-semibold'
                                            : 'border-transparent text-gray-600 hover:text-blue-500 hover:border-gray-300'
                                        }`}
                                    >
                                        {job.title}
                                    </button>
                                ))}
                            </div>
                           {/* Added min-height to prevent collapse when loading */}
                           <div className="tab-panel p-4 bg-white min-h-[300px]">
                                {renderActiveJobContent()}
                           </div>
                        </div>
                    )}
                     {/* Display publishing error if it occurs */}
                     {publishError && <p className="text-red-600 mt-4 text-center">Publishing Error: {publishError}</p>}
                </ModalBody>
                <ModalFooter>
                    <Button variant="shadow" onPress={handleClose} disabled={isPublishing}>
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        onPress={handlePublishClick}
                        // Disable if publishing, initial data failed, eligible list failed, or no jobs
                        disabled={isPublishing || jobs.length === 0 || !!initialDataError || !!eligibleListError}
                        // Add loading state if Button component supports it
                        // isLoading={isPublishing}
                    >
                        {isPublishing ? "Publishing..." : "Approve and Publish"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}


// --- StudentList Component ---
// Accepts the combined StudentWithPerformance structure
interface StudentListProps {
    studentsWithPerformance: StudentWithPerformance[];
    onRemoveStudent: (studentId: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ studentsWithPerformance, onRemoveStudent }) => {

    // Helper to format CGPA - adjust as needed
    const formatCGPA = (cgpa: number | null | undefined): string => {
        // Check for null or undefined explicitly
        if (cgpa === null || cgpa === undefined) return 'N/A';
        // Ensure it's a number before calling toFixed
        if (typeof cgpa === 'number' && !isNaN(cgpa)) {
             return cgpa.toFixed(2);
        }
        return 'N/A'; // Return N/A if not a valid number
    }

    // Helper to format latest MCA CGPA
    const formatLatestMcaCGPA = (mcaCgpa: number[] | null | undefined): string => {
        if (mcaCgpa && mcaCgpa.length > 0) {
            // Assuming the last element is the latest and is a valid number
            const latest = mcaCgpa[mcaCgpa.length - 1];
            if (typeof latest === 'number' && !isNaN(latest)) {
                return latest.toFixed(2);
            }
        }
        return 'N/A';
    }

    return (
        // Increased max height for better scrolling with more details
        <div className="mt-4 border rounded max-h-96 overflow-y-auto">
            {studentsWithPerformance.length === 0 && <p className="p-3 text-gray-500">No eligible students selected for this job.</p>}
            {studentsWithPerformance.map(({ student, performance }, index) => (
                <div key={student._id} className={`p-3 ${index < studentsWithPerformance.length - 1 ? 'border-b' : ''}`}>
                    {/* Student Name and Remove Button */}
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{student.first_name} {student.last_name}
                        </span>
                        <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => onRemoveStudent(student._id)}
                            className="ml-2 flex-shrink-0" // Prevent button shrinking
                        >
                            Remove
                        </Button>
                    </div>
                    {/* Display Performance Details */}
                    {performance ? (
                        // Using grid for better alignment of performance data
                        <div className="text-sm text-gray-600 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1">
                           <span>10th: <span className="font-medium">{formatCGPA(performance.tenth_cgpa)}</span></span>
                           {/* Ensure correct field name for 12th - using twelfth_cgpa from your type */}
                           <span>12th: <span className="font-medium">{formatCGPA(performance.twelth_cgpa)}</span></span>
                           <span>Degree: <span className="font-medium">{formatCGPA(performance.degree_cgpa)}</span></span>
                           <span>MCA: <span className="font-medium">{formatLatestMcaCGPA(performance.mca_cgpa)}</span></span>
                           {/* Add more fields if needed, e.g., Skills */}
                           {/* <span className="col-span-full">Skills: {performance.skills?.join(', ') || 'N/A'}</span> */}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Performance data not available.</p>
                    )}
                </div>
            ))}
        </div>
    );
};


// --- AddStudentDropdown Component (Remains Unchanged) ---
interface AddStudentDropdownProps {
    students: Student[];
    onAddStudent: (studentId: string) => void;
    isLoading: boolean;
}
const AddStudentDropdown: React.FC<AddStudentDropdownProps> = ({ students, onAddStudent, isLoading }) => {
    const [selectedStudent, setSelectedStudent] = useState('');

    const handleAdd = () => {
        if (selectedStudent) {
            onAddStudent(selectedStudent);
            setSelectedStudent(''); // Reset dropdown
        }
    };

    return (
        <div className="flex gap-2 items-center mb-4">
            <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={isLoading || students.length === 0}
                className="border rounded p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500" // Added styling
            >
                <option value="">{isLoading ? "Loading students..." : students.length === 0 ? "No students available to add" : "Select student to add..."}</option>
                {students.map(student => (
                    <option key={student._id} value={student._id}>
                        {student.first_name} {student.last_name} ({student._id}) - {student.email}
                    </option>
                ))}
            </select>
            <Button onPress={handleAdd} disabled={!selectedStudent || isLoading} size="md"> {/* Adjusted size */}
                Add Student
            </Button>
        </div>
    );
};

