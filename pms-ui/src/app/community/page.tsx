// app/community/page.tsx
"use client"; // Make the page a Client Component

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { fetchPostsAPI, fetchVoteStatusAPI } from '@/app/community/services/postAPI'; // Adjust path
import { PostPreview } from '@/app/community/components/posts/PostPreview'; // Adjust path (will be simplified)
import { Post } from '@/app/community/types/post';
import { APIResponse } from './types/api';

// Define a combined type for convenience
interface PostWithVoteStatus extends Post {
  voteStatus?: boolean; // true, false, or undefined if not loaded/error
  isLoadingVoteStatus?: boolean; // Track loading per post
}

// Use the loading component for initial page load via Suspense
// import CommunityLoading from './loading'; // Can still use loading.tsx for route transition

export default function CommunityFeedPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [postsWithStatus, setPostsWithStatus] = useState<PostWithVoteStatus[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // Add state for pagination if needed later
  const [currentPage,] = useState(0); // Example pagination state
  const postsPerPage = 10; // Example

  // Effect 1: Fetch posts when component mounts or page changes
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoadingPosts(true);
      setFetchError(null);
      setPostsWithStatus([]); // Clear previous posts

      try {
        const fetchedPosts = await fetchPostsAPI(currentPage * postsPerPage, postsPerPage);
        // Initialize posts with loading state for vote status
        setPostsWithStatus(fetchedPosts.map(p => ({ ...p, isLoadingVoteStatus: true })));
      } catch (error: unknown) {
        console.error("Error fetching community posts:", error);
        setFetchError((error as APIResponse).message || "Could not load posts.");
        setPostsWithStatus([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };
    loadPosts();
  }, [currentPage]); // Re-fetch if page changes

  // Effect 2: Fetch vote statuses after posts are loaded and user is authenticated
  useEffect(() => {
    // Only proceed if posts are loaded, auth is ready, and user is logged in
    if (isLoadingPosts || isAuthLoading || !isAuthenticated || !user?._id || postsWithStatus.length === 0) {
      // If user logs out while statuses are loading, reset status part
      if (!isAuthenticated && postsWithStatus.some(p => p.isLoadingVoteStatus)) {
          setPostsWithStatus(prev => prev.map(p => ({ ...p, voteStatus: false, isLoadingVoteStatus: false })));
      }
      return;
    }

    const userId = user._id;

    // Fetch statuses for posts that don't have it yet
    postsWithStatus.forEach((post, index) => {
      // Check if status needs fetching (only if isLoadingVoteStatus is true)
      if (post.isLoadingVoteStatus === true) {
        fetchVoteStatusAPI(post._id, userId)
          .then(statusResult => {
            setPostsWithStatus(prev => {
              const updated = [...prev];
              if (updated[index]?._id === post._id) { // Ensure index is still correct
                  updated[index] = { ...updated[index], voteStatus: statusResult.has_voted, isLoadingVoteStatus: false };
              }
              return updated;
            });
          })
          .catch(err => {
            console.error(`Failed to fetch vote status for post ${post._id}:`, err);
            // Set status to false on error and stop loading for this post
            setPostsWithStatus(prev => {
               const updated = [...prev];
               if (updated[index]?._id === post._id) {
                   updated[index] = { ...updated[index], voteStatus: false, isLoadingVoteStatus: false };
               }
               return updated;
            });
          });
      }
    });
  // Depend on the raw posts array identity, auth state, and user ID
  }, [postsWithStatus, isAuthLoading, isAuthenticated, user?._id, isLoadingPosts]); // Careful with dependencies to avoid infinite loops

  // Determine overall loading state (posts OR any vote status still loading)
  const isAnythingLoading = isLoadingPosts || postsWithStatus.some(p => p.isLoadingVoteStatus === true);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Community Feed</h1>
        <Link href="/community/create">
           <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out">
             Create Post
           </button>
        </Link>
      </div>

      {fetchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{fetchError}</span>
        </div>
      )}

      {/* Show loading skeletons if posts or statuses are loading */}
      {isAnythingLoading && !fetchError && (
         <div className="space-y-4">
            {[...Array(postsPerPage)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 animate-pulse">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                <div className="flex justify-between items-center text-sm">
                   <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                   <div className="flex gap-4">
                     <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-12"></div> {/* Button placeholder */}
                     <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-10"></div>
                   </div>
                </div>
              </div>
            ))}
          </div>
      )}

      {/* Render posts only when not loading and no error */}
      {!isAnythingLoading && !fetchError && postsWithStatus.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No posts found. Be the first to create one!
        </p>
      )}

      {!isAnythingLoading && !fetchError && (
        <div>
          {postsWithStatus.map((post) => (
            // Pass the fetched vote status down
            <PostPreview
                post={post}
                key={post._id}
                initialHasVoted={post.voteStatus} // Pass status (true/false/undefined)
            />
          ))}
        </div>
      )}

      {/* Add Pagination controls here, update currentPage state */}
    </div>
  );
}