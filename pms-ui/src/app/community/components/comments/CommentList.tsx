// app/community/components/comments/CommentList.tsx
"use client";

import React, { useState } from 'react';
import { Comment as CommentType } from '@/app/community/types/comment';
import { Comment } from './comment'; // Import the display component
import { CommentForm } from './CommentForm'; // Import the form component
import { ReportModalTrigger } from '@/app/community/components/report/ReportModalTrigger';

interface CommentListProps {
  postId: string;
  initialComments: CommentType[];
}

export function CommentList({ postId, initialComments }: CommentListProps) {
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  // Add state for loading more, errors specific to comments, etc. if needed

  // Handler for when a new comment is successfully created by CommentForm
  const handleCommentAdded = (newComment: CommentType) => {
    setComments(prevComments => [newComment, ...prevComments]); // Add to top optimistically
  };

  // Handler for when a comment is successfully deleted by Comment component
  const handleCommentDeleted = (deletedCommentId: string) => {
    setComments(prevComments => prevComments.filter(comment => comment._id !== deletedCommentId));
  };

  // TODO: Add logic for fetching more comments (pagination) if desired

  return (
    <div className="mt-8 border-t dark:border-gray-700 pt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Comments ({comments.length})
      </h3>

      {/* --- Comment Form --- */}
      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />

      {/* --- List of Comments --- */}
      <div className="mt-6 space-y-4">
        {comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment._id} className="flex justify-between items-start">
              <Comment
                comment={comment}
                onCommentDeleted={handleCommentDeleted}
              />
              <ReportModalTrigger
                itemId={comment._id}
                itemType="comment"
                reportedItemDescription={`Comment by ${comment.author?.user_name}`}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Be the first to comment!
          </p>
        )}
      </div>
       {/* TODO: Add "Load More" button if implementing pagination */}
    </div>
  );
}