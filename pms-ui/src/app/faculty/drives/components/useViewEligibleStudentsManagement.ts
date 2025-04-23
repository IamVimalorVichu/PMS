// hooks/useViewEligibleStudentsManagement.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
// Assuming API functions exist and are imported correctly
import {
    fetchJobsByDriveAPI, // Needs to return eligible_students and applied_students
    fetchStudentsAPI,
    setEligibleStudentsforJobAPI // API to save changes per job
} from './API';
// Import necessary types
import { Job } from './types'; // Assuming Job type includes eligible_students and applied_students
import { Student } from '@/app/students/components/types';

interface UseViewEligibleStudentsProps {
    isOpen: boolean;
    driveId: string | null;
}

export const useViewEligibleStudentsManagement = ({ isOpen, driveId }: UseViewEligibleStudentsProps) => {
    // State for fetched data
    const [jobs, setJobs] = useState<Job[]>([]);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);

    // State to track modifications *since the modal opened*
    // Initialized with data fetched from the job documents
    const [modifiedEligibleStudents, setModifiedEligibleStudents] = useState<Record<string, string[]>>({});

    // Loading/Error states
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Helper: Reset State ---
    // Clears state when modal opens or driveId changes
    const resetState = useCallback(() => {
        setJobs([]);
        // Keep allStudents fetched unless driveId changes significantly? Or refetch?
        // For now, assume allStudents is relatively stable and doesn't need reset here.
        setActiveJobId(null);
        setModifiedEligibleStudents({});
        setError(null);
    }, []);

    // --- Data Fetching ---
    // Fetch jobs (with eligible/applied lists) and all students when modal opens
    useEffect(() => {
        if (isOpen && driveId) {
            const loadData = async () => {
                setIsFetchingData(true);
                setError(null);
                resetState(); // Clear previous state before fetching

                try {
                    // Fetch students and jobs concurrently
                    const [studentsResponse, jobsResponse] = await Promise.all([
                        fetchStudentsAPI(),
                        fetchJobsByDriveAPI(driveId) // Ensure this returns eligible_students & applied_students
                    ]);

                    setAllStudents(studentsResponse || []);
                    const fetchedJobs = jobsResponse || [];
                    setJobs(fetchedJobs);

                    // Initialize modified state with fetched eligible students from backend
                    const initialEligibleMap: Record<string, string[]> = {};
                    fetchedJobs.forEach(job => {
                        // Use job._id as the key
                        initialEligibleMap[job._id] = job.eligible_students || [];
                    });
                    setModifiedEligibleStudents(initialEligibleMap);

                    // Set initial active tab
                    if (fetchedJobs.length > 0) {
                        setActiveJobId(fetchedJobs[0]._id);
                    }

                } catch (err) {
                    console.error("Error fetching data for view eligible modal:", err);
                    setError(`Failed to load data: ${(err as Error).message}`);
                } finally {
                    setIsFetchingData(false);
                }
            };
            loadData();
        }
    // Only trigger refetch if modal opens or driveId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, driveId]);

    // --- State Derivation ---

    // Map for quick student lookup by ID
    const allStudentsMap = useMemo(() => {
        return new Map(allStudents.map(s => [s._id, s]));
    }, [allStudents]);

    // Get the full Job object for the currently active tab
    const currentJob = useMemo(() => {
        return jobs.find(job => job._id === activeJobId);
    }, [activeJobId, jobs]);

    // Get the set of student IDs who have applied to the current job
    const appliedStudentsSet = useMemo((): Set<string> => {
        // Ensure applied_students is treated as an array
        return new Set(currentJob?.applied_students || []);
    }, [currentJob]);

    // Get the list of student IDs currently displayed for the active job (from modified state)
    const currentDisplayedStudentIds = useMemo((): string[] => {
        if (!activeJobId) return [];
        // Return the list from our state map, default to empty array if not found
        return modifiedEligibleStudents[activeJobId] || [];
    }, [activeJobId, modifiedEligibleStudents]);

    // Get full student objects for the displayed list using the derived IDs and the student map
    const currentDisplayedStudents = useMemo((): Student[] => {
        return currentDisplayedStudentIds
            .map(id => allStudentsMap.get(id)) // Look up each student by ID
            .filter((s): s is Student => s !== undefined); // Filter out any potential misses and assert type
    }, [currentDisplayedStudentIds, allStudentsMap]);

     // Get students available to be added (all students minus those already in the current displayed list)
     const availableToAddStudents = useMemo((): Student[] => {
        const currentIdsSet = new Set(currentDisplayedStudentIds);
        return allStudents.filter(s => !currentIdsSet.has(s._id));
    }, [allStudents, currentDisplayedStudentIds]);

    // --- Event Handlers ---

    // Handles changing the active job tab
    const handleTabChange = useCallback((newJobId: string) => {
        setActiveJobId(newJobId);
    }, []);

    // Adds a student to the modified list for the active job, preventing addition if applied
    const handleAddStudent = useCallback((studentIdToAdd: string) => {
        if (!activeJobId || !studentIdToAdd || appliedStudentsSet.has(studentIdToAdd)) {
            console.warn(`Cannot add student ${studentIdToAdd} as they have already applied.`);
            // Optionally set an error message for the user via state if needed
            return; // Prevent adding applied students
        }
        // Get the current list for the active job from state
        const currentList = modifiedEligibleStudents[activeJobId] || [];
        // Add only if not already present
        if (!currentList.includes(studentIdToAdd)) {
            const newList = [...currentList, studentIdToAdd];
            // Update the state map for the active job ID
            setModifiedEligibleStudents(prev => ({ ...prev, [activeJobId]: newList }));
        }
    }, [activeJobId, modifiedEligibleStudents, appliedStudentsSet]);

    // Removes a student from the modified list for the active job, preventing removal if applied
    const handleRemoveStudent = useCallback((studentIdToRemove: string) => {
        if (!activeJobId || appliedStudentsSet.has(studentIdToRemove)) {
             console.warn(`Cannot remove student ${studentIdToRemove} as they have already applied.`);
             // Optionally set an error message for the user via state if needed
            return; // Prevent removing applied students
        }
        // Get the current list for the active job from state
        const currentList = modifiedEligibleStudents[activeJobId] || [];
        // Create a new list excluding the student to remove
        const newList = currentList.filter(id => id !== studentIdToRemove);
        // Update the state map for the active job ID
        setModifiedEligibleStudents(prev => ({ ...prev, [activeJobId]: newList }));
    }, [activeJobId, modifiedEligibleStudents, appliedStudentsSet]);

    // --- Save Functionality ---
    // This function will be called by the modal's save button handler
    const saveChanges = useCallback(async (): Promise<void> => {
        // Use the state directly managed by the hook
        const modifiedMap = modifiedEligibleStudents;
        console.log("Saving changes from hook:", modifiedMap);

        // Create an array of promises, one for each job update API call
        const updatePromises = Object.entries(modifiedMap).map(([jobId, studentList]) => {
            // Call the specific API function to update the eligible list for this job
            return setEligibleStudentsforJobAPI(jobId, studentList);
        });

        // Wait for all updates to complete. Promise.all throws if any promise rejects.
        await Promise.all(updatePromises);

        console.log("Eligible student changes saved successfully via hook.");
        // The function implicitly returns Promise<void> on success.
        // Errors will be thrown and should be caught by the calling component (modal).

    }, [modifiedEligibleStudents]); // Dependency: the state being saved

    // --- Return Values ---
    // Expose state and functions needed by the modal component
    return {
        jobs, // List of jobs for rendering tabs
        allStudents, // List of all students (primarily for the 'Add' dropdown)
        activeJobId, // ID of the currently selected job tab
        handleTabChange, // Function to change the active tab

        // Data derived for the active tab's display
        currentDisplayedStudents, // Array of Student objects currently eligible for the active job
        availableToAddStudents, // Array of Student objects available to be added to the active job's list
        appliedStudentsSet, // Set of student IDs who have applied to the active job (for disabling actions)

        // Handlers for modifying the eligible list
        handleAddStudent,
        handleRemoveStudent,

        // Loading/Error states for data fetching
        isFetchingData,
        error,

        // Function to trigger the save operation
        saveChanges,
    };
};