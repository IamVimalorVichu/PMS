// app/community/components/profile/ProfileEditCard.tsx
"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { Input, Button, Avatar } from '@heroui/react'; // Assuming HeroUI components
import { updateUserAPI } from '@/components/services/userAPI'; // Assuming global user update API exists
import { UserUpdate } from '@/components/types/types'; // Assuming global UserUpdate type exists

interface ProfileEditCardProps {
  onClose?: () => void;
}

export function ProfileEditCard({ onClose }: ProfileEditCardProps) {
  const { user, isLoading: isAuthLoading, refetchUser } = useAuth(); // Assuming refetchUser exists in context to update global state
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize username state when user data loads
  useEffect(() => {
    if (user?.user_name) {
      setUsername(user.user_name);
    } else if (user) {
        // If username is empty/null initially, allow editing immediately?
        setUsername('');
        // setIsEditing(true); // Optional: auto-open edit if username is missing
    }
  }, [user]);

  const handleEditToggle = () => {
    if (!isEditing && user?.user_name) {
        setUsername(user.user_name); // Reset to current username when opening edit
    }
    setError(null);
    setSuccess(null);
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?._id || !username.trim()) {
        setError("Username cannot be empty.");
        return;
    }
    // Optional: Add username validation (length, characters)
    if (username.trim() === user.user_name) {
        setIsEditing(false); // No change, just close edit mode
        return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const updateData: UserUpdate = {
      user_name: username.trim(),
    };

    try {
      // Assuming updateUserAPI takes userId and update payload
      await updateUserAPI(user._id, updateData);
      setSuccess("Username updated successfully!");
      setIsEditing(false);
      // Trigger refetch of user data in AuthContext if available
      if (refetchUser) {
          await refetchUser();
      }
      // Close modal after successful update
      if (onClose) {
        setTimeout(onClose, 1500); // Give time to see success message
      }
      // Optionally update local state immediately if refetch isn't instant
      // setUser({...user, user_name: username.trim()}); // Requires setUser in context
    } catch (err: unknown) {
      console.error("Failed to update username:", err);
      setError((err as Error).message || "Could not update username. It might already be taken.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || !user) {
    // Skeleton loader for the card
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Basic Avatar Placeholder - Replace with actual image logic later */}
          <Avatar
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random`} // Example placeholder
            alt={`${user.first_name}'s profile picture`}
            size="md" // Adjust size as needed
          />
          {!isEditing ? (
            <span className="font-medium text-gray-800 dark:text-white truncate">
              {user.user_name || `${user.first_name} ${user.last_name}` || 'User'}
              {!user.user_name && <span className="text-xs text-gray-500 ml-1">(No username set)</span>}
            </span>
          ) : (
            <span className="font-medium text-gray-800 dark:text-white">Edit Profile</span>
          )}
        </div>
        <Button
          size="sm"
          variant="light" // Adjust HeroUI variant
          onClick={handleEditToggle}
          disabled={isLoading}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-green-500">{success}</p>}
          <div>
            <label htmlFor="usernameEdit" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Username
            </label>
            <Input
              id="usernameEdit"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a unique username"
              required
              disabled={isLoading}
              // Add HeroUI specific props if needed
            />
          </div>
          {/* Placeholder for Profile Picture Upload - Complex feature */}
          {/* <div><label className="text-xs ...">Profile Picture</label><Input type="file" disabled /></div> */}
          <Button
            type="submit"
            color="primary" // Adjust HeroUI color
            size="sm"
            isLoading={isLoading}
            disabled={isLoading || !username.trim() || username.trim() === user.user_name}
            className="w-full"
          >
            Save Changes
          </Button>
        </form>
      )}
    </div>
  );
}