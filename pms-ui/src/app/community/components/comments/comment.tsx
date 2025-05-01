// app/community/components/comments/Comment.tsx
"use client"; // Needed for potential delete button interaction & useAuth

import React, { useState } from 'react';
import { Comment as CommentType } from '@/app/community/types/comment'; // Adjust path
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { deleteCommentAPI } from '@/app/community/services/postAPI'; // Adjust path
import { ReportModalTrigger } from '@/app/community/components/report/ReportModalTrigger';
import { UserNameDisplay } from '../common/UserNameDisplay'; // Adjust path

// Re-use or create a shared date formatter
const formatDate = (dateString: string): string => {
  try {
    // More relative time formatting might be nice here eventually
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'short', timeStyle: 'short'
    });
  } catch {
    return "Invalid Date";
  }
};

interface CommentProps {
  comment: CommentType;
  onCommentDeleted: (commentId: string) => void; // Callback to update parent state
}

export function Comment({ comment, onCommentDeleted }: CommentProps) {
  const { user, isAuthenticated } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if the current user can delete this comment
  const canDelete = isAuthenticated && user && (
    user.role === 'admin' || user._id === comment.author_id
  );

  const handleDelete = async () => {
    if (!canDelete || isDeleting || !user?._id) return;

    // Optional: Add a confirmation dialog
    if (!window.confirm("Are you sure you want to delete this comment?")) {
        return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await deleteCommentAPI(comment._id, user._id);
      onCommentDeleted(comment._id); // Notify parent component
      // No need to set state here, parent will re-render list
    } catch (err: unknown) {
      console.error("Failed to delete comment:", err);
      setError((err as Error).message || "Could not delete comment.");
      setIsDeleting(false); // Re-enable button on error
    }
    // No finally block needed as component might unmount on success
  };

  return (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex justify-between items-start mb-1">
        <div className="text-sm">
          {comment.author ? (
            <UserNameDisplay 
              userInfo={comment.author}
              className="font-semibold text-gray-800 dark:text-gray-200"
            />
          ) : (
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              Unknown User
            </span>
          )}
         
          <span className="text-gray-500 dark:text-gray-400 ml-2">
            ({comment.author?.role || 'N/A'})
          </span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {formatDate(comment.created_at)}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
        {comment.content}
      </p>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {/* Actions: Delete and Report Comment */}
      <div className="text-right mt-1 space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150"> {/* Show actions on hover */}
         {/* --- Add Report Trigger for the Comment --- */}
         {isAuthenticated && user?._id && (
            <ReportModalTrigger
                itemId={comment._id}
                itemType="comment"
                reportedItemDescription={`comment by ${comment.author?.user_name || 'Unknown'}`}
                // Use default trigger (text link)
            />
         )}
         {/* Delete Button */}
         {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
         )}
      </div>
    </div>
  );
}