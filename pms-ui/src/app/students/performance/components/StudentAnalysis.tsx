'use client'; // Needed because we use the custom hook useStudentAnalysis

import React from 'react';
import { useStudentAnalysis } from '../components/useStudentAnalysis'; // Adjust path
import MetricDisplay from '../components/MetricDisplay'; // Adjust path
import { Spinner } from "@heroui/react";
import { PlacementDetail } from '@/components/types/analysis'; // Adjust path

interface StudentAnalysisProps {
    studentId: string | null | undefined;
    // Optional: Pass token if needed by the hook/service
    // token?: string;
}

/**
 * Displays the performance analysis metrics for a given student.
 * Fetches data using the useStudentAnalysis hook.
 */
const StudentAnalysis: React.FC<StudentAnalysisProps> = ({ studentId /*, token */ }) => {
    // Fetch data using the hook
    const { data, isLoading, error } = useStudentAnalysis(studentId /*, token */);

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Spinner className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg">Loading Analysis...</span>
            </div>
        );
    }

    // --- Error State ---
    if (error) {
        return (
            <div className="my-4 rounded border border-red-400 bg-red-100 p-4 text-red-700" role="alert">
            <strong className="font-bold">Error Fetching Analysis</strong>
            <p className="mt-1 block sm:inline">{error}</p>
            </div>
        );
    }

    // --- No Data State (or if studentId was initially null/undefined) ---
    if (!data) {
        // You might want a different message if studentId was valid but no data returned
        return (
            <div className="p-4 text-center text-gray-500">
                No analysis data available for this student.
            </div>
        );
    }

    // --- Success State: Display Data ---
    const formatRate = (rate: number): string => {
        return `${(rate * 100).toFixed(1)}%`; // Format as percentage with 1 decimal place
    };

    return (
        <div className="space-y-6 p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Student Performance Analysis
            </h3>

            {/* Key Metrics Grid */}
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <MetricDisplay label="Drives Applied To" value={data.total_drives_applied} />
                <MetricDisplay label="Jobs Applied To" value={data.total_jobs_applied} />
                <MetricDisplay label="Jobs Eligible For" value={data.total_jobs_eligible} />
                <MetricDisplay label="Jobs Selected For" value={data.total_jobs_selected} />
                <MetricDisplay
                    label="Eligibility Rate"
                    value={formatRate(data.overall_eligibility_rate)}
                    unit="" // Unit is already % from formatRate
                />
                 <MetricDisplay
                    label="Selection Rate (vs Eligible)"
                    value={formatRate(data.overall_selection_rate)}
                    unit=""
                />
                <MetricDisplay
                    label="Overall Placement Rate (vs Applied)"
                    value={formatRate(data.overall_placement_rate)}
                    unit=""
                />
            </dl>

            {/* Placement Details Section */}
            <div>
                <h4 className="text-lg font-medium text-gray-700 mb-3">Placement Details</h4>
                {data.placements.length > 0 ? (
                    <ul className="space-y-3">
                        {data.placements.map((placement: PlacementDetail) => (
                            <li key={placement.job_id} className="p-3 border rounded-md bg-green-50 text-sm">
                                <p className="font-semibold text-green-800">
                                    {placement.job_title} at {placement.company_name}
                                </p>
                                {placement.salary && (
                                    <p className="text-green-700">
                                        Salary: ₹{placement.salary.toLocaleString()}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Job ID: {placement.job_id} | Company ID: {placement.company_id}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic text-sm">No placements recorded.</p>
                )}
            </div>
        </div>
    );
};

export default StudentAnalysis;