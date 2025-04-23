// hooks/useDriveStatusManagement.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
// Assuming API functions exist and are imported correctly
import {
    fetchDriveByIdAPI, // Needs to return stages
    fetchJobsByDriveAPI, // Needs to return eligible_students, applied_students, stage_students, selected_students
    fetchStudentsAPI,
    updateDriveAPI, // Assumes: updateDriveAPI(driveId, payload)
    confirmFinalSelectedStudentsAPI,
    updateStagesForJobAPI
} from './API';
// Import necessary types
import { Drive, Job } from './types'; // Use your defined types
import { Student } from '@/app/students/components/types';

interface UseDriveStatusManagementProps {
    isOpen: boolean;
    driveId: string | null;
}

export const useDriveStatusManagement = ({ isOpen, driveId }: UseDriveStatusManagementProps) => {
    // --- Core Data State ---
    const [driveData, setDriveData] = useState<Drive | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [allStudents, setAllStudents] = useState<Student[]>([]);

    // --- UI/Interaction State ---
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [currentStageIndex, setCurrentStageIndex] = useState<number>(0); // 0-based index
    // Stores selections made *in the current session* for the next stage/final placement, keyed by Job ID
    const [selectedStudentsMap, setSelectedStudentsMap] = useState<Record<string, Set<string>>>({});

    // --- Loading / Error State ---
    const [isLoading, setIsLoading] = useState(false); // For initial data load
    const [error, setError] = useState<string | null>(null); // For initial data load errors
    const [isSaving, setIsSaving] = useState(false); // For shortlist/placement actions
    const [saveError, setSaveError] = useState<string | null>(null); // For shortlist/placement errors
    const [isUpdatingStages, setIsUpdatingStages] = useState(false); // For add/remove stage actions
    const [stageUpdateError, setStageUpdateError] = useState<string | null>(null); // For stage update errors

    // --- Helper: Reset State ---
    // Resets state when modal opens or driveId changes
    const resetState = useCallback(() => {
        setDriveData(null);
        setJobs([]);
        // Keep allStudents? Assume it's fetched once if relatively stable.
        setActiveJobId(null);
        setCurrentStageIndex(0);
        setSelectedStudentsMap({});
        setError(null);
        setSaveError(null);
        setStageUpdateError(null);
    }, []);

    // --- Data Fetching ---
    // Fetch Drive, Jobs (including stage_students), and All Students when modal opens
    useEffect(() => {
        if (isOpen && driveId) {
            const loadData = async () => {
                setIsLoading(true);
                setError(null);
                resetState(); // Clear previous state

                try {
                    // Fetch drive, jobs, and students concurrently
                    const [driveRes, jobsRes, studentsRes] = await Promise.all([
                        fetchDriveByIdAPI(driveId),
                        fetchJobsByDriveAPI(driveId), // CRITICAL: Ensure this API returns stage_students field
                        fetchStudentsAPI()
                    ]);

                    const fetchedDrive = driveRes || null;
                    const fetchedJobs = jobsRes || [];

                    setDriveData(fetchedDrive);
                    setJobs(fetchedJobs);
                    setAllStudents(studentsRes || []);

                    // Set initial active tab and stage index
                    setCurrentStageIndex(0);
                    if (fetchedJobs.length > 0) {
                        setActiveJobId(fetchedJobs[0]._id);
                    }

                } catch (err) {
                    console.error("Error fetching data for drive status modal:", err);
                    setError(`Failed to load drive data: ${(err as Error).message}`);
                } finally {
                    setIsLoading(false);
                }
            };
            loadData();
        }
    // Only re-run fetch when modal opens or the driveId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, driveId]);

    // --- State Derivation ---

    // Memoized map of all students for quick lookups
    const allStudentsMap = useMemo(() => {
        return new Map(allStudents.map(s => [s._id, s]));
    }, [allStudents]);

    // Get the full Job object for the currently active tab
    const currentJob = useMemo(() => {
        return jobs.find(job => job._id === activeJobId);
    }, [activeJobId, jobs]);

    // Get the defined stages from the drive data
    const driveStages = useMemo(() => driveData?.stages || [], [driveData]);

    // --- MODIFIED LOGIC for determining the list of student IDs ---
    const studentIdsForCurrentStageView = useMemo((): string[] => {
        if (!currentJob) return [];

        // Always start with the base eligible list for the job
        const baseEligibleIds = currentJob.eligible_students || [];

        if (currentStageIndex === 0) {
            // For the first stage, the base list is the list to display
            return baseEligibleIds;
        } else {
            // For subsequent stages, get the IDs shortlisted from the previous stage
            const previousStageShortlistIds = currentJob.stage_students?.[currentStageIndex - 1];

            // If there's no shortlist data for the previous stage, no one can proceed
            if (!previousStageShortlistIds || previousStageShortlistIds.length === 0) {
                return [];
            }

            // Filter the base eligible list: only keep students who are ALSO in the previous shortlist
            const previousStageSet = new Set(previousStageShortlistIds);
            return baseEligibleIds.filter(id => previousStageSet.has(id));
        }
    }, [currentJob, currentStageIndex]); // Dependencies: currentJob and currentStageIndex


    // Get the full Student objects for the list to be displayed
    const studentsToDisplay = useMemo((): Student[] => {
        return studentIdsForCurrentStageView
            .map(id => allStudentsMap.get(id))
            .filter((s): s is Student => s !== undefined);
    }, [studentIdsForCurrentStageView, allStudentsMap]);

    // Get the Set of currently selected student IDs for the active job
    const currentSelections = useMemo((): Set<string> => {
        return selectedStudentsMap[activeJobId || ''] || new Set<string>();
    }, [selectedStudentsMap, activeJobId]);

    // Check if the current stage is the last defined stage
    const isLastStage = useMemo(() => {
        return currentStageIndex >= driveStages.length - 1;
    }, [currentStageIndex, driveStages]);

    // *** NEW: Check if shortlisting is possible based on previous stage ***
    const canShortlistCurrentStage = useMemo((): boolean => {
        // Always possible for the first stage (index 0) if there are eligible students
        if (currentStageIndex === 0) {
            return true; // Depends on eligible_students, handled by list display
        }
        // For subsequent stages, check if the previous stage had any shortlisted students
        const previousStageShortlist = currentJob?.stage_students?.[currentStageIndex - 1];
        // Return true only if the previous stage data exists and is not empty
        return Array.isArray(previousStageShortlist) && previousStageShortlist.length > 0;
    }, [currentStageIndex, currentJob]);

    // --- Event Handlers ---

    // Change the active job tab
    const handleTabChange = useCallback((newJobId: string) => {
        setActiveJobId(newJobId);
        // Note: Selections in selectedStudentsMap persist per job ID
    }, []);

    // Change the active stage being viewed
    const handleStageChange = useCallback((newStageIndex: number) => {
        if (newStageIndex >= 0 && newStageIndex < driveStages.length) {
            setCurrentStageIndex(newStageIndex);
            // Clear local selections when changing stage? Or persist them?
            // Let's clear for simplicity now, user re-selects for the new stage context.
            // setSelectedStudentsMap(prev => ({ ...prev, [activeJobId || '']: new Set<string>() }));
            // Actually, maybe better *not* to clear, let user see previous selections if they go back/forth?
            // Let's *not* clear for now.
        }
    }, [driveStages.length]); // Add activeJobId if clearing selection

    // Toggle selection for a student in the current view
    const handleStudentSelectionToggle = useCallback((studentId: string) => {
        if (!activeJobId) return;
        setSelectedStudentsMap(prevMap => {
            const currentSet = new Set(prevMap[activeJobId] || []); // Clone the set
            if (currentSet.has(studentId)) {
                currentSet.delete(studentId);
            } else {
                currentSet.add(studentId);
            }
            return { ...prevMap, [activeJobId]: currentSet };
        });
    }, [activeJobId]);

    // --- Action Handlers (Interacting with Backend) ---

    // Action for "Shortlist for Next Stage" button
    const handleShortlistForNextStage = useCallback(async () => {
        if (!activeJobId || !currentJob || isLastStage) return;

        setIsSaving(true);
        setSaveError(null);

        const selectedIds = Array.from(selectedStudentsMap[activeJobId] || new Set());
        const currentStageData = currentJob.stage_students || [];

        // Create the updated stage_students array
        // Ensure the array has enough empty slots up to the current index if needed
        const updatedStageData = [...currentStageData];
        while (updatedStageData.length <= currentStageIndex) {
            updatedStageData.push([]); // Add empty arrays for stages not yet processed
        }
        updatedStageData[currentStageIndex] = selectedIds; // Set the shortlist for the *next* stage

        try {
            // Call API to update the job document
            await updateStagesForJobAPI(activeJobId, updatedStageData );

            // Optimistic UI update: Update local job state
            setJobs(prevJobs => prevJobs.map(job =>
                job._id === activeJobId ? { ...job, stage_students: updatedStageData } : job
            ));

            // Move to the next stage view
            setCurrentStageIndex(prevIndex => prevIndex + 1);
            // Clear selections for the *newly* displayed stage? Yes, makes sense.
            setSelectedStudentsMap(prevMap => ({ ...prevMap, [activeJobId]: new Set<string>() }));


        } catch (err) {
            console.error("Error shortlisting for next stage:", err);
            setSaveError(`Failed to save shortlist: ${(err as Error).message}`);
        } finally {
            setIsSaving(false);
        }
    }, [activeJobId, currentJob, isLastStage, selectedStudentsMap, currentStageIndex]); // updatejobapi removed, currentstageindex added

    // Action for "Confirm Final Placements" button
    const handleConfirmFinalPlacements = useCallback(async () => {
        if (!activeJobId || !currentJob || !isLastStage) return;

        setIsSaving(true);
        setSaveError(null);

        const finalSelectionIds = Array.from(selectedStudentsMap[activeJobId] || new Set());

        try {
            // Call API to update the job's selected_students field
            await confirmFinalSelectedStudentsAPI(activeJobId, finalSelectionIds);

             // Optimistic UI update: Update local job state
             setJobs(prevJobs => prevJobs.map(job =>
                job._id === activeJobId ? { ...job, selected_students: finalSelectionIds } : job
            ));

            // Provide feedback - maybe disable button or show success?
            // No stage change needed here. Clear selections? Maybe.
            setSelectedStudentsMap(prevMap => ({ ...prevMap, [activeJobId]: new Set<string>() }));


        } catch (err) {
            console.error("Error confirming final placements:", err);
            setSaveError(`Failed to confirm placements: ${(err as Error).message}`);
        } finally {
            setIsSaving(false);
        }
    }, [activeJobId, currentJob, isLastStage, selectedStudentsMap]);

    // Action to add a new stage
    const handleAddStage = useCallback(async (newStageName: string) => {
        if (!driveId || !driveData || !newStageName.trim()) return;

        setIsUpdatingStages(true);
        setStageUpdateError(null);

        const currentStages = driveData.stages || [];
        // Insert the new stage *after* the current one
        const newStages = [
            ...currentStages.slice(0, currentStageIndex + 1),
            newStageName.trim(),
            ...currentStages.slice(currentStageIndex + 1)
        ];

        try {
            await updateDriveAPI(driveId, { stages: newStages });
            // Update local drive data state
            setDriveData(prev => prev ? { ...prev, stages: newStages } : null);
        } catch (err) {
            console.error("Error adding stage:", err);
            setStageUpdateError(`Failed to add stage: ${(err as Error).message}`);
        } finally {
            setIsUpdatingStages(false);
        }
    }, [driveId, driveData, currentStageIndex]);

    // Action to remove an upcoming stage
    const handleRemoveStage = useCallback(async (stageIndexToRemove: number) => {
        // Can only remove stages *after* the current active one
        if (!driveId || !driveData || stageIndexToRemove <= currentStageIndex || stageIndexToRemove >= (driveData.stages?.length || 0)) return;

        setIsUpdatingStages(true);
        setStageUpdateError(null);

        const currentStages = driveData.stages || [];
        const newStages = currentStages.filter((_, index) => index !== stageIndexToRemove);

        try {
            await updateDriveAPI(driveId, { stages: newStages });
            // Update local drive data state
            setDriveData(prev => prev ? { ...prev, stages: newStages } : null);
            // Potentially adjust currentStageIndex if the removed stage affected the total count?
            // No, currentStageIndex should remain valid as we only remove future stages.
        } catch (err) {
            console.error("Error removing stage:", err);
            setStageUpdateError(`Failed to remove stage: ${(err as Error).message}`);
        } finally {
            setIsUpdatingStages(false);
        }
    }, [driveId, driveData, currentStageIndex]);


    // --- Return Values ---
    return {
        // Data
        driveData,
        jobs,
        allStudents, // Needed for student details lookup
        activeJobId,
        currentStageIndex,
        driveStages, // Derived list of stage names
        studentsToDisplay, // Students to show in the list for the current view
        currentSelections, // Set of selected student IDs for the active job/stage

        // UI State
        isLoading,
        error,
        isSaving,
        saveError,
        isUpdatingStages,
        stageUpdateError,
        canShortlistCurrentStage,
        isLastStage, // Boolean indicating if current stage is the last one

        // Handlers
        handleTabChange,
        handleStageChange, // Function to change stage index (e.g., via prev/next buttons)
        handleStudentSelectionToggle, // Function to toggle a student's selection state
        handleShortlistForNextStage, // Function for the "Shortlist" button
        handleConfirmFinalPlacements, // Function for the "Confirm Placement" button
        handleAddStage, // Function to add a new stage name
        handleRemoveStage, // Function to remove an upcoming stage by index
    };
};