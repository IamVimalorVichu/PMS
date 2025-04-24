// app/community/components/posts/UpvoteButtonInternalFetch.tsx
// This version fetches its own initial status. Used by PostPreview.
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { upvotePostAPI, removeUpvoteAPI, fetchVoteStatusAPI } from '@/app/community/services/postAPI'; // Adjust path
import { APIResponse } from '../../types/api'; // Assuming you have this type
import { Button } from '@heroui/react'; // Assuming you use this
import { FaArrowUp } from 'react-icons/fa6';

interface UpvoteButtonProps {
  postId: string;
  initialUpvoteCount: number;
  userId: string;
  // initialHasVoted is NOT expected as a prop here
}

export default function UpvoteButtonInternalFetch({ postId, initialUpvoteCount, userId }: UpvoteButtonProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [currentVoteCount, setCurrentVoteCount] = useState(initialUpvoteCount);
  const [hasVoted, setHasVoted] = useState(false); // Default to false initially
  const [isLoadingVoteStatus, setIsLoadingVoteStatus] = useState(true); // Start loading
  const [isVoting, setIsVoting] = useState(false);
  const [, setError] = useState<string | null>(null);

  // Effect to fetch initial vote status
  useEffect(() => {
    if (!isAuthenticated || !userId || isAuthLoading) {
      setHasVoted(false); // Cannot determine status if not logged in
      setIsLoadingVoteStatus(false); // Not loading if not authenticated
      return;
    }

    // Reset loading state if dependencies change
    setIsLoadingVoteStatus(true);
    setError(null);

    fetchVoteStatusAPI(postId, userId)
      .then(statusResult => {
        setHasVoted(statusResult.has_voted);
      })
      .catch(err => {
        console.error("UpvoteButtonInternalFetch: Failed to fetch initial vote status:", err);
        setHasVoted(false); // Default to false on error
        setError("Could not check vote status.");
      })
      .finally(() => {
        setIsLoadingVoteStatus(false);
      });
  }, [postId, userId, isAuthenticated, isAuthLoading]); // Dependencies

  const handleVoteClick = async (userId: string) => {
    // Voting logic remains the same...
    if (!isAuthenticated || isVoting || isLoadingVoteStatus || isAuthLoading) {
      if (!isAuthenticated) console.log("User must be logged in to vote.");
      return;
    }
    setIsVoting(true);
    setError(null);
    const action = hasVoted ? removeUpvoteAPI : upvotePostAPI;
    const expectedVoteStateAfter = !hasVoted;
    try {
      const result = await action(postId, userId);
      setCurrentVoteCount(result.new_count);
      setHasVoted(result.voted);
      if (result.voted !== expectedVoteStateAfter) {
          console.warn("Vote state mismatch between client expectation and API response.");
      }
    } catch (err: unknown) {
      console.error("Voting failed:", err);
      setError((err as APIResponse)?.message || "Vote failed.");
    } finally {
      setIsVoting(false);
    }
  };

  // Button style depends on the current 'hasVoted' state
  const buttonClasses = `flex items-center px-2 py-1 transition-colors duration-150 ease-in-out text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
    hasVoted
      ? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300'
      : ' hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
  }`;
  // Disable button if auth is loading OR if the initial status is still loading OR during voting
  const isDisabled = !isAuthenticated || isAuthLoading || isLoadingVoteStatus || isVoting;

  return (
    <Button
      isIconOnly
      radius='full'
      size='md'
      onPress={() => handleVoteClick(userId)}
      disabled={isDisabled}
      className={buttonClasses}
      title={isAuthenticated ? (hasVoted ? "Remove upvote" : "Upvote") : "Log in to vote"}
      aria-pressed={hasVoted}
    >
      <FaArrowUp
        className={`h-4 w-4 mr-1 ${hasVoted ? 'text-blue-600 dark:text-blue-400' : ''}`}
        fill={hasVoted ? "currentColor" : ""}
      />
      {/* Show loading dots only while fetching initial status */}
      {isLoadingVoteStatus ? '...' : currentVoteCount}
    </Button>
  );
}