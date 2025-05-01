// app/community/components/comments/CommentForm.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { createCommentAPI } from '@/app/community/services/postAPI'; // Adjust path
import { Comment as CommentType, CommentCreate } from '@/app/community/types/comment'; // Adjust path
import { APIResponse } from '../../types/api';

interface CommentFormProps {
  postId: string;
  onCommentAdded: (newComment: CommentType) => void; // Callback on success
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUserComment = user?.can_comment ?? false;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isAuthenticated || !user?._id) {
      setError("You must be logged in to comment.");
      return;
    }

    if (!canUserComment) {
        setError("You do not have permission to comment.");
        return;
    }

    if (!content.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    setIsLoading(true);
    const commentData: CommentCreate = { content: content.trim() };

    try {
      const newComment = await createCommentAPI(postId, commentData, user._id);
      setContent(''); // Clear the form
      onCommentAdded(newComment); // Notify parent to update list
    } catch (err) {
      console.error("Failed to create comment:", err);
      setError((err as APIResponse).message || "Could not post comment.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return <div className="h-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>;
  }

  if (!isAuthenticated) {
    return <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please log in to comment.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <label htmlFor="commentContent" className="sr-only">Add a comment</label>
      <textarea
        id="commentContent"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={canUserComment 
          ? "Add your comment..." 
          : "You have been temporarily banned from commenting"}
        required
        disabled={isLoading || !canUserComment}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 disabled:opacity-50"
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {!canUserComment && (
        <p className="text-xs text-red-500 mt-1">
          You have been temporarily banned from commenting
        </p>
      )}
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !canUserComment}
          title={!canUserComment ? "You have been temporarily banned from commenting" : ""}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isLoading ? 'Posting...' : 'Add Comment'}
        </button>
      </div>
    </form>
  );
}