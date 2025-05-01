// app/community/components/admin/AdminReportActions.tsx
"use client";

import React, { useState } from 'react';
// Removed unused API/Type imports for direct actions
// import { useAuth } from '@/app/components/services/useAuth';
// import { resolveReportAPI } from '@/app/community/services/adminAPI';
// import { ReportUpdate } from '@/app/community/types/report';
import { ReportRead } from '@/app/community/types/report'; // Keep ReportRead type
import { ResolveReportModal } from './ResolveReportModal'; // Import the new modal

interface AdminReportActionsProps {
    report: ReportRead; // Pass the full report object now
    // Callback when modal completes action (passes final status)
    onResolutionComplete: (reportId: string, finalStatus: 'resolved' | 'dismissed') => void;
    // onError is likely handled within the modal now, but can keep if needed
    // onError?: (reportId: string, error: string) => void;
}

export function AdminReportActions({ report, onResolutionComplete }: AdminReportActionsProps) {
    // State to control the modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // This function is passed to the modal to be called on successful submission
    const handleModalCompletion = (reportId: string, finalStatus: 'resolved' | 'dismissed') => {
        onResolutionComplete(reportId, finalStatus); // Pass the info up to the page
        // Modal closes itself internally on success usually
    };

    // Only show the action button for pending reports
    if (report.status !== 'pending') {
        return <span className="text-xs italic text-gray-500 dark:text-gray-400">Actioned ({report.status})</span>;
    }

    return (
        <>
            <button
                onClick={handleOpenModal}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                title="Resolve or dismiss this report and take optional actions"
            >
                Take Action
            </button>

            <ResolveReportModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                report={report}
                onResolutionComplete={handleModalCompletion}
            />
        </>
    );
}
