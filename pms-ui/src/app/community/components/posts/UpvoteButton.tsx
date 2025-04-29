// app/community/components/posts/UpvoteButton.tsx
// This version relies on the parent component (like PostDetail)
// to fetch and provide the initial vote status.
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { upvotePostAPI, removeUpvoteAPI } from '@/app/community/services/postAPI'; // Adjust path
import { APIResponse } from '../../types/api'; // Assuming you have this type
import { Button } from '@heroui/react'; // Assuming you use this
import { FaArrowUp } from 'react-icons/fa6';

interface UpvoteButtonProps {
  postId: string;
  initialUpvoteCount: number;
  userId: string;
  // Prop is now crucial for initial state if known by parent
  initialHasVoted?: boolean; // Can be true, false, or undefined (if parent is loading)
}

export default function UpvoteButton({ postId, initialUpvoteCount, userId, initialHasVoted }: UpvoteButtonProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [currentVoteCount, setCurrentVoteCount] = useState(initialUpvoteCount);
  // Initialize directly from prop if available, otherwise default to false
  const [hasVoted, setHasVoted] = useState(initialHasVoted ?? false);
  const [isVoting, setIsVoting] = useState(false);
  const [, setError] = useState<string | null>(null);

  // Effect to update internal state if the initial prop changes or auth status changes
  useEffect(() => {
      // Update based on prop if it's defined
      if (initialHasVoted !== undefined) {
          setHasVoted(initialHasVoted);
      }
      // If user logs out, reset to non-voted state unless prop says otherwise
      if (!isAuthenticated) {
          setHasVoted(initialHasVoted ?? false);
      }
  }, [initialHasVoted, isAuthenticated]);

  const handleVoteClick = async (userId: string) => {
    if (!isAuthenticated || isVoting || isAuthLoading || initialHasVoted === undefined) {
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


  // Disable button if auth is loading OR if the initial status is still unknown (prop is undefined) OR during voting
  const isDisabled = !isAuthenticated || isAuthLoading || initialHasVoted === undefined || isVoting;

  return (
    <Button
      isIconOnly
      radius='full'
      size='md'
      className={'bg-transparent'}
      onPress={() => handleVoteClick(userId)}
      disabled={isDisabled}
      title={isAuthenticated ? (hasVoted ? "Remove upvote" : "Upvote") : "Log in to vote"}
      aria-pressed={hasVoted}
    >
      <FaArrowUp
        className={`h-4 w-4 mr-1 ${hasVoted ? 'text-blue-600 dark:text-blue-400' : ''}`}
        fill={hasVoted ? "currentColor" : ""}
      />
      {/* Display count immediately */}
      {currentVoteCount}
    </Button>
  );
}