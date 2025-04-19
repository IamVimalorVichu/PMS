// hooks/usePublishManagement.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAllPerformancesAPI, fetchEligibleStudentsforJobAPI, fetchStudentsAPI } from './API'; // Assuming API functions are here or imported correctly
import { Job } from './types'; // Assuming types are defined/imported correctly
import { Performance, Student, StudentWithPerformance } from '@/app/students/components/types';

interface UsePublishManagementProps {
    isOpen: boolean;
    drive_id: string | null;
    jobs: Job[] | undefined; // Jobs for the current drive
}



export const usePublishManagement = ({ isOpen, drive_id, jobs = [] }: UsePublishManagementProps) => {
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [allStudents, setAllStudents] = useState<Student[]>([]); // For the "Add" dropdown
    const [allPerformancesMap, setAllPerformancesMap] = useState<Record<string, Performance>>({});

    // State for caching and modifications
    const [eligibleStudentsCache, setEligibleStudentsCache] = useState<Record<string, string[]>>({});
    const [modifiedEligibleStudents, setModifiedEligibleStudents] = useState<Record<string, string[]>>({});

    // State for loading/error handling
    const [isFetchingEligibleLists, setIsFetchingEligibleLists] = useState(false); // NEW: For fetching all eligible lists
    const [eligibleListError, setEligibleListError] = useState<string | null>(null); // NEW: Error for eligible lists fetch
    const [isFetchingInitialData, setIsFetchingInitialData] = useState(false); // Combined loading for students + performances
    const [initialDataError, setInitialDataError] = useState<string | null>(null); // Combined error for students + performances

    // --- Helper: Reset State ---
    const resetState = useCallback(() => {
        setActiveJobId(jobs.length > 0 ? jobs[0]._id : null);
        // Keep allStudents fetched unless drive_id changes significantly
        // setAllStudents([]); 
        setEligibleStudentsCache({});
        setModifiedEligibleStudents({});
        setInitialDataError(null);
        setEligibleListError(null); 
        // setIsFetchingInitialData(false); // Don't reset this unless refetching
    }, [jobs]);

    // --- Data Fetching ---

    // Fetch all students once when the modal opens or drive_id changes
    useEffect(() => {
        if (isOpen && drive_id) {
            const loadInitialData = async () => {
                setIsFetchingInitialData(true);
                setInitialDataError(null);
                setAllStudents([]);
                setAllPerformancesMap({});
                resetState(); // Reset job-specific caches/states
                try {
                    // Fetch students and performances concurrently
                    const [studentsResponse, performancesResponse] = await Promise.all([
                        fetchStudentsAPI(),
                        fetchAllPerformancesAPI() // Fetch all performances
                    ]);

                    setAllStudents(studentsResponse || []);

                    // Create the performance map from the fetched list
                    const perfMap: Record<string, Performance> = {};
                    (performancesResponse || []).forEach((perf) => {
                        if (perf && perf.student_id) {
                            perfMap[perf.student_id] = perf;
                        }
                    });
                    setAllPerformancesMap(perfMap);

                } catch (error) {
                    console.error("Error fetching initial modal data (students/performances):", error);
                    setInitialDataError(`Failed to load initial data: ${(error as Error).message}`);
                } finally {
                    setIsFetchingInitialData(false);
                }
            };
            loadInitialData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, drive_id]); // Rerun only when modal opens or drive changes
     // Set initial active job ID when jobs load
     // Step 2: Fetch eligible students for ALL jobs once initial data is loaded
    useEffect(() => {
        // Ensure jobs is treated as an array, even if undefined initially
        const currentJobs = jobs || [];
        // Only run if modal is open, initial data is loaded, jobs exist, and not already fetching eligible lists
        if (isOpen && !isFetchingInitialData && !initialDataError && currentJobs.length > 0) {

            const fetchAllEligible = async () => {
                setIsFetchingEligibleLists(true);
                setEligibleListError(null);
                setEligibleStudentsCache({}); // Clear previous cache before fetching all

                try {
                    type FetchResult = {
                        jobId: string;
                        studentIds: string[];
                        error?: boolean;
                    };

                    // Create an array of promises
                    const fetchPromises = currentJobs.map(job =>
                        fetchEligibleStudentsforJobAPI(job._id)
                            .then(studentIds => ({ jobId: job._id, studentIds: studentIds || [] })) // Return object with jobId
                            .catch(err => {
                                console.error(`Error fetching eligible students for job ${job._id}:`, err);
                                // Return error state for this specific job if needed, or just log
                                return { jobId: job._id, studentIds: [], error: true };
                            })
                    );

                    // Wait for all promises to settle
                    const results = await Promise.all<FetchResult>(fetchPromises);

                    // Process results and update the cache
                    const newCache: Record<string, string[]> = {};
                    let encounteredError = false;
                    results.forEach(result => {
                        if (!result.error) {
                            newCache[result.jobId] = result.studentIds;
                        } else {
                            encounteredError = true; // Mark if any fetch failed
                        }
                    });
                    setEligibleStudentsCache(newCache);
                    if (encounteredError) {
                         setEligibleListError("Failed to fetch eligibility for one or more jobs.");
                    }

                } catch (error) { // Catch errors from Promise.all itself (less likely)
                    console.error("Error fetching all eligible students:", error);
                    setEligibleListError(`Failed to load eligibility lists: ${(error as Error).message}`);
                } finally {
                    setIsFetchingEligibleLists(false);
                }
            };

            fetchAllEligible();
        }
    // Only re-run if these core conditions change (jobs array identity might change)
    // Using JSON.stringify on jobs might be too expensive if jobs array is large or changes often unnecessarily.
    // A better approach might be to pass a stable reference or only trigger based on drive_id/isOpen if jobs are fetched reliably with the drive.
    // For simplicity now, including jobs, but be mindful of performance implications.
    }, [isOpen, isFetchingInitialData, initialDataError, jobs]);


     // Set initial active job ID when jobs load (after initial data fetch)
     useEffect(() => {
        // Wait for eligible lists too? Maybe not necessary, UI can show loading.
        if (isOpen && !isFetchingInitialData && jobs.length > 0 && !activeJobId) {
            setActiveJobId(jobs[0]._id);
        }
    }, [isOpen, isFetchingInitialData, jobs, activeJobId]);


    // --- State Derivation ---
    const currentDisplayedStudentIds = useMemo((): string[] => {
        if (!activeJobId) return [];
        // Return modified list if it exists, otherwise the cached list, or empty array
        return modifiedEligibleStudents[activeJobId] ?? eligibleStudentsCache[activeJobId] ?? [];
    }, [activeJobId, modifiedEligibleStudents, eligibleStudentsCache]);

    // Create a map of all students for efficient lookup (only needed once)
    const allStudentsMap = useMemo(() => {
        return new Map(allStudents.map(s => [s._id, s]));
    }, [allStudents]);

    // Derive Combined Student + Performance Data using the allPerformancesMap
    const currentDisplayedStudentsWithPerformance = useMemo((): StudentWithPerformance[] => {
        const combinedList: StudentWithPerformance[] = [];
        currentDisplayedStudentIds.forEach(id => {
            const student = allStudentsMap.get(id);
            if (student) {
                const performance : Performance | null = allPerformancesMap[id] || null;
                combinedList.push({ student, performance });
            }
        });
        return combinedList;
    }, [currentDisplayedStudentIds, allStudentsMap, allPerformancesMap]);


     // Get students available to be added
     const availableToAddStudents = useMemo((): Student[] => {
        const currentIdsSet = new Set(currentDisplayedStudentIds);
        return allStudents.filter(s => !currentIdsSet.has(s._id));
    }, [allStudents, currentDisplayedStudentIds]);

    // --- Event Handlers ---
    const handleTabChange = useCallback((newJobId: string) => {
        setActiveJobId(newJobId);
    }, []);

    const handleRemoveStudent = useCallback((studentIdToRemove: string) => {
        if (!activeJobId) return;
        const currentList = modifiedEligibleStudents[activeJobId] ?? eligibleStudentsCache[activeJobId] ?? [];
        const newList = currentList.filter(id => id !== studentIdToRemove);
        setModifiedEligibleStudents(prev => ({ ...prev, [activeJobId]: newList }));
    }, [activeJobId, modifiedEligibleStudents, eligibleStudentsCache]);

    const handleAddStudent = useCallback((studentIdToAdd: string) => {
        if (!activeJobId || !studentIdToAdd) return;
        const currentList = modifiedEligibleStudents[activeJobId] ?? eligibleStudentsCache[activeJobId] ?? [];
        if (!currentList.includes(studentIdToAdd)) {
            const newList = [...currentList, studentIdToAdd];
            setModifiedEligibleStudents(prev => ({ ...prev, [activeJobId]: newList }));
        }
    }, [activeJobId, modifiedEligibleStudents, eligibleStudentsCache]);

    // --- Data for Publishing ---
    const getFinalStudentMap = useCallback((): Record<string, string[]> => {
         const finalMap: Record<string, string[]> = {};
         (jobs || []).forEach(job => {
             finalMap[job._id] = modifiedEligibleStudents[job._id] ?? eligibleStudentsCache[job._id] ?? [];
         });
         return finalMap;
    }, [jobs, modifiedEligibleStudents, eligibleStudentsCache]);

    

    // --- Return Values ---
    return {
        activeJobId,
        handleTabChange,
        currentDisplayedStudentsWithPerformance, // Use this for the list
        availableToAddStudents, // For dropdown

        // Loading/Error states for the initial data load (students + all performances)
        isFetchingInitialData,
        initialDataError,
        // Loading/Error for the bulk fetch of eligible student lists
        isFetchingEligibleLists,
        eligibleListError,

        handleAddStudent,
        handleRemoveStudent,
        getFinalStudentMap,
    };
};
