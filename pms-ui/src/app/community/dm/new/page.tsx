// app/community/dm/new/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { searchUsersAPI } from '@/components/services/userAPI'; // Adjust path to where searchUsersAPI is defined
import { findOrCreateConversationAPI } from '@/app/community/services/dmAPI'; // Adjust path
import { UserBasicInfo } from '@/app/community/types/auth'; // Adjust path
import { Input } from '@heroui/react'; // Assuming usage
import { FaSpinner } from 'react-icons/fa'; // Example loading icon
import { toast } from 'react-toastify';

// Debounce helper function - Improved Typing
// Use specific types for args and return type if possible,
// otherwise use 'unknown' which is safer than 'any'.
function debounce<Args extends unknown[], Return>(
    func: (...args: Args) => Return,
    waitFor: number
): (...args: Args) => void { // The debounced function itself doesn't return the original value
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Args) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced;
}


export default function NewDirectMessagePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserBasicInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isCreatingConvo, setIsCreatingConvo] = useState(false);
  const [createConvoError, setCreateConvoError] = useState<string | null>(null);

  const canUserMessage = user?.can_message ?? false;

  // Redirect if not logged in or banned from messaging
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!canUserMessage) {
        toast.error("Messaging temporarily disabled.");
        router.replace('/community/dm'); // Redirect to DM index where ban message is shown
      }
    }
  }, [isAuthLoading, isAuthenticated, canUserMessage, router]);

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (query: string, userId: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      setSearchError(null);
      try {
        // Assuming searchUsersAPI is a stable import
        const results = await searchUsersAPI(query, userId);
        // Setters from useState are stable
        setSearchResults(results);
      } catch (err: unknown) { // Use unknown for better type safety
        console.error("User search failed:", err);
        // Type assertion for error message access
        setSearchError((err as Error)?.message || "Failed to search users.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [] // Tell ESLint we intentionally have no dependencies here for debounce
  );

  // Effect to trigger search when query changes
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      debouncedSearch(searchQuery, user._id);
    } else {
      // Clear results if user logs out
      setSearchResults([]);
    }
  }, [searchQuery, isAuthenticated, user?._id, debouncedSearch]);

  // Handler when a user result is clicked
  const handleUserSelect = async (selectedUser: UserBasicInfo) => {
    if (!user?._id || isCreatingConvo) return;

    setIsCreatingConvo(true);
    setCreateConvoError(null);
    try {
      const conversation = await findOrCreateConversationAPI(selectedUser._id, user._id);
      // Redirect to the conversation page
      router.push(`/community/dm/${conversation._id}`);
    } catch (err: unknown) {
      console.error("Failed to create/find conversation:", err);
      setCreateConvoError((err as Error).message || "Could not start conversation.");
      setIsCreatingConvo(false); // Allow retry on error
    }
    // No finally needed as we navigate away on success
  };


  // Show loading state while checking auth and permissions
  if (isAuthLoading || !isAuthenticated) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  // Show temporary message while redirecting banned users
  if (!canUserMessage) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Messaging Temporarily Disabled
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You have been temporarily banned from sending messages.
            </p>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">New Message</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Search for a user to start a conversation.</p>

      {/* Search Input */}
      <div className="relative mb-4">
        <Input
          type="search"
          placeholder="Search by name, username, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full" // Ensure input takes full width
          disabled={isCreatingConvo}
        />
        {isSearching && (
          <FaSpinner className="animate-spin absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        )}
      </div>

      {searchError && (
        <p className="text-red-500 text-sm mb-4">{searchError}</p>
      )}
      {createConvoError && (
        <p className="text-red-500 text-sm mb-4">{createConvoError}</p>
      )}

      {/* Search Results */}
      <div className="space-y-2 max-h-80 overflow-y-auto border dark:border-gray-700 rounded-md">
        {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
          <p className="p-4 text-center text-gray-500 dark:text-gray-400">No users found matching {searchQuery}.</p>
        )}
        {searchResults.map((resultUser) => (
          <button
            key={resultUser._id}
            onClick={() => handleUserSelect(resultUser)}
            disabled={isCreatingConvo}
            className="flex items-center w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-wait transition-colors duration-150 ease-in-out border-b dark:border-gray-700 last:border-b-0"
          >
            {/* Basic Avatar Placeholder */}
            <div className="flex-shrink-0 mr-3 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold">
              {(resultUser.user_name || '?').substring(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{resultUser.user_name || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{resultUser.role}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}