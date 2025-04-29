// app/community/components/admin/AdminReportActions.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { resolveReportAPI } from '@/app/community/services/adminAPI'; // Adjust path
import { ReportUpdate } from '@/app/community/types/report'; // Adjust path

interface AdminReportActionsProps {
    reportId: string;
    currentStatus: 'pending' | 'resolved' | 'dismissed';
    // Callback with new status on success
    onStatusChanged: (reportId: string, newStatus: 'resolved' | 'dismissed') => void;
    onError?: (reportId: string, error: string) => void; // Optional error callback
}

export function AdminReportActions({ reportId, currentStatus, onStatusChanged, onError }: AdminReportActionsProps) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState<'resolved' | 'dismissed' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAction = async (newStatus: 'resolved' | 'dismissed') => {
        if (!user?._id || isLoading || currentStatus !== 'pending') return; // Only act on pending reports

        setIsLoading(newStatus);
        setError(null);
        const updateData: ReportUpdate = { status: newStatus };

        try {
            await resolveReportAPI(reportId, updateData, user._id);
            onStatusChanged(reportId, newStatus); // Notify parent
        } catch (err: unknown) {
            console.error(`Failed to set report ${reportId} status to ${newStatus}:`, err);
            const errorMessage = (err as Error).message || "Status update failed";
            setError(errorMessage);
            if (onError) {
                onError(reportId, errorMessage);
            }
        } finally {
            // Reset loading state regardless of success/failure if parent doesn't remove item
             setIsLoading(null);
        }
    };

    // Only show actions for pending reports
    if (currentStatus !== 'pending') {
        return <span className="text-xs italic text-gray-500">Actioned</span>;
    }

    return (
        <div className="flex space-x-2">
             {error && <p className="text-xs text-red-500 mr-auto">{error}</p>}
            <button
                onClick={() => handleAction('resolved')}
                disabled={!!isLoading}
                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                title="Mark as resolved (action taken/content removed)"
            >
                {isLoading === 'resolved' ? '...' : 'Resolve'}
            </button>
            <button
                onClick={() => handleAction('dismissed')}
                disabled={!!isLoading}
                className="text-xs px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                title="Dismiss report (no action needed)"
            >
                {isLoading === 'dismissed' ? '...' : 'Dismiss'}
            </button>
        </div>
    );
}