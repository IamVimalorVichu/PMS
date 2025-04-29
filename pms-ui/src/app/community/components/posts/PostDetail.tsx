// app/community/components/posts/PostDetail.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Post } from '@/app/community/types/post'; // Adjust path
import UpvoteButton from './UpvoteButton'; // Import the *simplified* button
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { fetchVoteStatusAPI } from '@/app/community/services/postAPI'; // Import API call
import { ReportModalTrigger } from '@/app/community/components/report/ReportModalTrigger';
import { UserNameDisplay } from '../common/UserNameDisplay'; // Import UserNameDisplay

// Re-use or create a shared date formatter
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return "Invalid Date";
  }
};

interface PostDetailProps {
  post: Post;
}

export function PostDetail({ post }: PostDetailProps) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const initialUpvoteCount = post.upvoter_ids?.length ?? 0;

  // State within PostDetail to hold the fetched vote status
  const [voteStatus, setVoteStatus] = useState<boolean | undefined>(undefined); // Undefined initially means unknown/loading
  const [, setIsLoadingStatus] = useState<boolean>(true); // Separate loading for status fetch

  // Effect to fetch vote status when component mounts or user/post changes
  useEffect(() => {
    // Reset if user logs out or auth is loading
    if (!isAuthenticated || !user?._id || isAuthLoading) {
        setVoteStatus(undefined); // Set to undefined if user isn't fully ready
        setIsLoadingStatus(!isAuthLoading); // Status isn't loading if auth is loading/failed
        return;
    }

    // Fetch status only if we have the necessary IDs
    if (post?._id && user?._id) {
        setIsLoadingStatus(true);
        fetchVoteStatusAPI(post._id, user._id)
            .then(statusResult => {
                setVoteStatus(statusResult.has_voted);
            })
            .catch(err => {
                console.error("PostDetail: Failed to fetch vote status:", err);
                setVoteStatus(false); // Default to false on error
            })
            .finally(() => {
                setIsLoadingStatus(false);
            });
    } else {
        // If no post/user ID, status is effectively false and not loading
        setVoteStatus(false);
        setIsLoadingStatus(false);
    }
    // Depend on post ID and user ID specifically
  }, [post?._id, user?._id, isAuthenticated, isAuthLoading]);

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border dark:border-gray-700">
      {/* Post Header */}
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words">
          {post.title}
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Posted by{' '}
          {post.author && (
            <UserNameDisplay 
              userInfo={post.author} 
              className="text-gray-700 dark:text-gray-300"
            />
          )}
          {/* --- Add Report Trigger for the Author --- */}
          {isAuthenticated && user?._id && post.author_id && user._id !== post.author_id && ( // Don't report self
                <span className="ml-2 inline-block">
                    <ReportModalTrigger
                        itemId={post.author_id}
                        itemType="user"
                        reportedItemDescription={`user '${post.author?.user_name || 'Unknown'}'`}
                        triggerElement={<span className="text-xs text-gray-400 hover:text-red-500 cursor-pointer">(Report User)</span>}
                    />
                </span>
           )}


          {' '}on {formatDate(post.created_at)}
        </div>
      </header>

      {/* Post Content */}
      <div className="prose dark:prose-invert max-w-none mb-6 break-words">
        {post.post_type === 'text' && post.content && <p>{post.content}</p>}
        {post.post_type === 'link' && post.url && <p>Link: <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{post.url}</a></p>}
        {post.post_type === 'media' && post.media_url && <p>Media: <a href={post.media_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{post.media_url}</a></p>}
        {post.post_type === 'media' && !post.media_url && <p className="italic text-gray-500">[Media post - No URL provided]</p>}
      </div>

      {/* Post Footer - Interactions */}
      <footer className="flex items-center justify-between border-t dark:border-gray-700 pt-4">
         <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
           {/* Render button only when user ID is available */}
           {user?._id && (
             <UpvoteButton // Use the simplified button
                  postId={post._id}
                  initialUpvoteCount={initialUpvoteCount}
                  userId={user._id}
                  // Pass the fetched status (will be undefined initially, then true/false)
                  initialHasVoted={voteStatus}
             />
           )}
           {/* Show placeholder/disabled state while loading auth */}
           {isAuthLoading && (
                <div className="flex items-center px-2 py-1 rounded border border-gray-300 text-gray-400 text-sm animate-pulse h-[30px] w-[50px]">...</div>
           )}
           {/* Comment Count Display */}
           <span title="Comments" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
             {post.comment_count ?? 0}
           </span>
         </div>
         <div>
            {/* --- Add Report Trigger for the Post --- */}
            {isAuthenticated && user?._id && ( // Only show if logged in
                <ReportModalTrigger
                    itemId={post._id}
                    itemType="post"
                    reportedItemDescription={`post titled '${post.title.substring(0, 50)}...'`} // Provide context
                />
            )}
         </div>
      </footer>
      {/* Comments Section (Rendered via CommentList component in page.tsx) */}
    </article>
  );
}