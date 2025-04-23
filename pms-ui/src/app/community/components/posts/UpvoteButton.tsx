// app/community/components/posts/UpvoteButton.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { upvotePostAPI, removeUpvoteAPI, fetchVoteStatusAPI } from '@/app/community/services/postAPI'; // Adjust path
import { APIResponse } from '../../types/api';
import { Button } from '@heroui/react';
import { FaArrowUp } from 'react-icons/fa6';

interface UpvoteButtonProps {
  postId: string;
  initialUpvoteCount: number;
  userId: string; // Optional: If you want to track the user who upvoted
  // Optional: Pass initial voted status if fetched by parent (e.g., on detail page)
  initialHasVoted?: boolean;
}

export default function UpvoteButton({ postId, initialUpvoteCount, initialHasVoted, userId }: UpvoteButtonProps) {
  const {  isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [currentVoteCount, setCurrentVoteCount] = useState(initialUpvoteCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted ?? false); // Use initial prop or default to false
  const [isLoadingVoteStatus, setIsLoadingVoteStatus] = useState(!initialHasVoted); // Only load if not provided
  const [isVoting, setIsVoting] = useState(false);
  const [ ,setError] = useState<string | null>(null);

  // Fetch initial vote status only if authenticated and not provided via props
  useEffect(() => {
    // Reset state if user logs out while component is mounted
    if (!isAuthenticated) {
        setHasVoted(false);
        setIsLoadingVoteStatus(false);
        return;
    }

    // Only fetch if status wasn't passed via props
    if (initialHasVoted === undefined && isAuthenticated && !isAuthLoading) {
      setIsLoadingVoteStatus(true);
      setError(null);
      fetchVoteStatusAPI(postId)
        .then(statusResult => {
          setHasVoted(statusResult.has_voted);
        })
        .catch(err => {
          console.error("Failed to fetch initial vote status:", err);
          // Don't block voting if status check fails, default to false
          setHasVoted(false);
          setError("Could not check vote status."); // Minor error display
        })
        .finally(() => {
          setIsLoadingVoteStatus(false);
        });
    } else {
        // If initialHasVoted was provided, or user not authenticated, no need to load
        setIsLoadingVoteStatus(false);
    }
  }, [postId, initialHasVoted, isAuthenticated, isAuthLoading]); // Rerun if auth state changes

  const handleVoteClick = async (userId: string) => {
    if (!isAuthenticated || isVoting || isLoadingVoteStatus || isAuthLoading) {
      // Optionally prompt login or just do nothing
      if (!isAuthenticated) console.log("User must be logged in to vote.");
      return;
    }

    setIsVoting(true);
    setError(null);
    const action = hasVoted ? removeUpvoteAPI : upvotePostAPI;
    const expectedVoteStateAfter = !hasVoted; // What we expect 'voted' to be after the API call

    try {
      const result = await action(postId, userId);
      // Update state based on the response from the API
      setCurrentVoteCount(result.new_count);
      setHasVoted(result.voted);

      // Optional: Verify if API response matches expected state
      if (result.voted !== expectedVoteStateAfter) {
          console.warn("Vote state mismatch between client expectation and API response.");
          // Could force a re-fetch of status here if needed
      }

    } catch (err: unknown) {
      console.error("Voting failed:", err);
      setError((err as APIResponse).message || "Vote failed.");
      // Revert optimistic update if you implemented one
    } finally {
      setIsVoting(false);
    }
  };

  // Determine button style based on vote state
  const buttonClasses = `flex items-center px-2 py-1 transition-colors duration-150 ease-in-out text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
    hasVoted
      ? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300'
      : ' hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
  }`;

  const isDisabled = !isAuthenticated || isVoting || isLoadingVoteStatus || isAuthLoading;

  return (
    <Button
      isIconOnly
      radius='full'
      size='md'
      onPress={() => handleVoteClick(userId)} // Pass userId if needed
      disabled={isDisabled}
      className={buttonClasses}
      title={isAuthenticated ? (hasVoted ? "Remove upvote" : "Upvote") : "Log in to vote"}
      aria-pressed={hasVoted} // Accessibility
    >
      {/* Simple Arrow Icon */}
      <FaArrowUp
        className={`h-4 w-4 mr-1 ${hasVoted ? 'text-blue-600 dark:text-blue-400' : ''}`}
        fill={hasVoted ? "currentColor" : ""} // Fill if voted
      />
      {/* Display loading state or count */}
      {isLoadingVoteStatus ? '...' : currentVoteCount}
      {/* Optional: Display error briefly */}
      {/* {error && <span className="text-red-500 text-xs ml-2">!</span>} */}
    </Button>
  );
}