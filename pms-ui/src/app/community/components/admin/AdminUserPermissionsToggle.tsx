// app/community/components/admin/AdminUserPermissionsToggle.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { updateUserPermissionsAPI } from '@/app/community/services/adminAPI'; // Adjust path
import { UserUpdate } from '@/components/types/types'; // Adjust path to global UserUpdate type
import { User } from '@/components/types/types'; // Adjust path to global User type

// Optional: Import a Switch component from HeroUI or another library
// import { Switch } from '@heroui/react';

interface AdminUserPermissionsToggleProps {
    targetUser: User; // Pass the full user object to get current state
    onPermissionsChanged: (updatedUser: User) => void; // Callback with updated user data
    onError?: (userId: string, error: string) => void; // Optional error callback
}

export function AdminUserPermissionsToggle({ targetUser, onPermissionsChanged, onError }: AdminUserPermissionsToggleProps) {
    const { user: adminUser } = useAuth();
    // Use local state to manage loading for each permission type
    const [isLoading, setIsLoading] = useState<'can_post' | 'can_comment' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handlePermissionChange = async (permission: 'can_post' | 'can_comment', currentValue: boolean) => {
        if (!adminUser?._id || isLoading) return;

        const newValue = !currentValue; // Toggle the value
        setIsLoading(permission);
        setError(null);

        const updateData: UserUpdate = {
            [permission]: newValue
        };

        try {
            const updatedUser = await updateUserPermissionsAPI(targetUser._id, updateData, adminUser._id);
            onPermissionsChanged(updatedUser); // Notify parent with the full updated user
        } catch (err: unknown) {
            console.error(`Failed to update ${permission} for user ${targetUser._id}:`, err);
            const errorMessage = (err as Error).message || "Update failed";
            setError(errorMessage);
            if (onError) {
                onError(targetUser._id, errorMessage);
            }
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="space-y-1">
            {/* Can Post Toggle/Button */}
            <div className="flex items-center justify-center">
                 {/* Example using simple buttons */}
                 <button
                    onClick={() => handlePermissionChange('can_post', targetUser.can_post ?? true)} // Default to true if undefined
                    disabled={isLoading === 'can_post'}
                    className={`w-12 px-2 py-0.5 text-xs rounded ${targetUser.can_post ?? true ? 'bg-green-200 text-green-800 hover:bg-green-300' : 'bg-red-200 text-red-800 hover:bg-red-300'} disabled:opacity-50`}
                    title={`Click to ${targetUser.can_post ?? true ? 'Disable' : 'Enable'} Posting`}
                >
                    {isLoading === 'can_post' ? '...' : (targetUser.can_post ?? true ? 'Yes' : 'No')}
                </button>
                 {/* Example using a hypothetical Switch component
                 <Switch
                     checked={targetUser.can_post ?? true}
                     onChange={(checked) => handlePermissionChange('can_post', !checked)} // Pass the *current* value before toggle
                     disabled={isLoading === 'can_post'}
                     size="sm" // Example size prop
                 />
                 */}
            </div>

            {/* Can Comment Toggle/Button */}
             <div className="flex items-center justify-center">
                 <button
                    onClick={() => handlePermissionChange('can_comment', targetUser.can_comment ?? true)}
                    disabled={isLoading === 'can_comment'}
                    className={`w-12 px-2 py-0.5 text-xs rounded ${targetUser.can_comment ?? true ? 'bg-green-200 text-green-800 hover:bg-green-300' : 'bg-red-200 text-red-800 hover:bg-red-300'} disabled:opacity-50`}
                     title={`Click to ${targetUser.can_comment ?? true ? 'Disable' : 'Enable'} Commenting`}
                >
                    {isLoading === 'can_comment' ? '...' : (targetUser.can_comment ?? true ? 'Yes' : 'No')}
                </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1 text-center">{error}</p>}
        </div>
    );
}