import { useState, useEffect, useCallback } from 'react';
import { StudentAnalysisResult, FetchState } from '@/components/types/analysis'; // Adjust import path
import { getStudentAnalysis } from '@/components/services/analysisAPI'; // Adjust import path

/**
 * Custom hook to fetch and manage the state for student performance analysis data.
 *
 * @param studentId The ID of the student whose analysis data is to be fetched.
 * @param token Optional authentication token.
 * @returns An object containing the analysis data, loading state, and error state.
 */
export const useStudentAnalysis = (
    studentId: string | null | undefined,
    token?: string // Optional: Pass token if needed
): FetchState<StudentAnalysisResult> => {

    const [analysisData, setAnalysisData] = useState<StudentAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalysis = useCallback(async () => {
        // Only fetch if studentId is provided
        if (!studentId) {
            setAnalysisData(null);
            setIsLoading(false);
            setError(null); // Clear previous errors if ID becomes null
            return;
        }

        setIsLoading(true);
        setError(null); // Clear previous errors on new fetch

        try {
            const data = await getStudentAnalysis(studentId, token);
            setAnalysisData(data);
        } catch (err) {
            console.error("Error in useStudentAnalysis hook:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setAnalysisData(null); // Clear data on error
        } finally {
            setIsLoading(false);
        }
    }, [studentId, token]); // Dependency array includes studentId and token

    // Effect to trigger the fetch when studentId changes
    useEffect(() => {
        fetchAnalysis();
    }, [fetchAnalysis]); // fetchAnalysis is memoized by useCallback

    return { data: analysisData, isLoading, error };
};