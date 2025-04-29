// app/community/components/admin/AdminPostActions.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { approvePostAPI, rejectPostAPI } from '@/app/community/services/adminAPI'; // Adjust path

interface AdminPostActionsProps {
    postId: string;
    onActionComplete: (postId: string) => void; // Callback when action succeeds
    onError?: (postId: string, error: string) => void; // Optional error callback
}

export function AdminPostActions({ postId, onActionComplete, onError }: AdminPostActionsProps) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState<'approve' | 'reject' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAction = async (actionType: 'approve' | 'reject') => {
        if (!user?._id || isLoading) return;

        // Optional: Confirmation for reject
        if (actionType === 'reject' && !window.confirm(`Are you sure you want to reject (delete) post ${postId}?`)) {
            return;
        }

        setIsLoading(actionType);
        setError(null);
        const apiCall = actionType === 'approve' ? approvePostAPI : rejectPostAPI;

        try {
            await apiCall(postId, user._id);
            onActionComplete(postId); // Notify parent
        } catch (err: unknown) {
            console.error(`Failed to ${actionType} post ${postId}:`, err);
            const errorMessage = (err as Error).message || `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} failed`;
            setError(errorMessage);
            if (onError) {
                onError(postId, errorMessage);
            }
            setIsLoading(null); // Reset loading on error
        }
        // No finally needed if parent removes the item on success
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 flex justify-end items-center space-x-3">
            {error && <p className="text-xs text-red-500 mr-auto">{error}</p>}
            <button
                onClick={() => handleAction('approve')}
                disabled={!!isLoading} // Disable if any action is loading
                className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
            >
                {isLoading === 'approve' ? 'Approving...' : 'Approve'}
            </button>
            <button
                onClick={() => handleAction('reject')}
                disabled={!!isLoading}
                className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
            >
                {isLoading === 'reject' ? 'Rejecting...' : 'Reject'}
            </button>
        </div>
    );
}