// app/community/components/admin/AdminUserPermissionsToggle.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { updateUserPermissionsAPI } from '@/app/community/services/adminAPI'; // Adjust path
import { UserUpdate } from '@/components/types/types'; // Adjust path to global UserUpdate type
import { User } from '@/components/types/types'; // Adjust path to global User type

// Optional: Import a Switch component from HeroUI or another library
import { Button } from '@heroui/react';

interface AdminUserPermissionsToggleProps {
    targetUser: User; // Pass the full user object to get current state
    onPermissionsChanged: (updatedUser: User) => void; // Callback with updated user data
    onError?: (userId: string, error: string) => void; // Optional error callback
}

export function AdminUserPermissionsToggle({ targetUser, onPermissionsChanged, onError }: AdminUserPermissionsToggleProps) {
    const { user: adminUser } = useAuth();
    // Update the loading state type to include can_message
    const [isLoading, setIsLoading] = useState<'can_post' | 'can_comment' | 'can_message' | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Update the handlePermissionChange function to include can_message
    const handlePermissionChange = async (permission: 'can_post' | 'can_comment' | 'can_message', currentValue: boolean) => {
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
            <Button
                onPress={() => handlePermissionChange('can_post', targetUser.can_post ?? true)}
                radius='md'
                disabled={isLoading === 'can_post'}
                variant='ghost'
                color={targetUser.can_post ?? true ? 'danger' : 'success'}
                size="sm"
                title={`Click to ${targetUser.can_post ?? true ? 'Disable' : 'Enable'} Posting`}
                className='w-32'
            >
                {isLoading === 'can_post' ? '...' : (targetUser.can_post ?? true ? 'Disable posting' : 'Enable posting')}
            </Button>
            </div>

            {/* Can Comment Toggle/Button */}
            <div className="flex items-center justify-center">
            <Button
                onPress={() => handlePermissionChange('can_comment', targetUser.can_comment ?? true)}
                radius='md'
                disabled={isLoading === 'can_comment'}
                variant='ghost'
                color={targetUser.can_comment ?? true ? 'danger' : 'success'}
                size="sm"
                title={`Click to ${targetUser.can_comment ?? true ? 'Disable' : 'Enable'} Commenting`}
                className='w-32'
            >
                {isLoading === 'can_comment' ? '...' : (targetUser.can_comment ?? true ? 'Disable commenting' : 'Enable commenting')}
            </Button>
            </div>

            {/* Add new Can Message Toggle/Button */}
            <div className="flex items-center justify-center">
                <Button
                    onPress={() => handlePermissionChange('can_message', targetUser.can_message ?? true)}
                    radius='md'
                    disabled={isLoading === 'can_message'}
                    variant='ghost'
                    color={targetUser.can_message ?? true ? 'danger' : 'success'}
                    size="sm"
                    title={`Click to ${targetUser.can_message ?? true ? 'Disable' : 'Enable'} Messaging`}
                    className='w-32'
                >
                    {isLoading === 'can_message' ? '...' : (targetUser.can_message ?? true ? 'Disable messaging' : 'Enable messaging')}
                </Button>
            </div>
            
            {error && <p className="text-xs text-red-500 mt-1 text-center">{error}</p>}
        </div>
    );
}