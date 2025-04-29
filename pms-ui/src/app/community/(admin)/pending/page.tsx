// app/community/(admin)/pending/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { fetchPendingPostsAPI } from '@/app/community/services/adminAPI'; // Adjust path
import { Post } from '@/app/community/types/post'; // Adjust path
import { PostPreview } from '@/app/community/components/posts/PostPreview'; // Adjust path
// Import the action component
import { AdminPostActions } from '@/app/community/components/admin/AdminPostActions'; // Adjust path

// Optional: Import a loading spinner component
// import { Spinner } from '@/components/common/Spinner';

export default function PendingPostsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Action state is now managed within AdminPostActions component

  // Function to load pending posts
  const loadPendingPosts = useCallback(async () => {
    // Ensure user is loaded and is an admin before fetching
    if (!user?._id || user.role !== 'admin') {
        // If called before auth is ready or user is not admin, do nothing or set appropriate state
        setIsLoading(false); // Stop loading if we can't fetch
        if (user && user.role !== 'admin') setError("Access Denied."); // Should be caught by layout, but defensive
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const posts = await fetchPendingPostsAPI(user._id);
      setPendingPosts(posts);
    } catch (err: unknown) {
      console.error("Failed to load pending posts:", err);
      setError((err as Error).message || "Could not load pending posts.");
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Dependency on user ID and role

  // Initial load effect
  useEffect(() => {
    // Trigger load only when authentication is confirmed and user is identified
    if (!isAuthLoading && isAuthenticated && user?.role === 'admin') {
      loadPendingPosts();
    } else if (!isAuthLoading && (!isAuthenticated || user?.role !== 'admin')) {
        // Handle cases where user is loaded but not admin (layout should ideally handle this)
        setIsLoading(false);
        setError("Access Denied.");
    }
  }, [isAuthenticated, isAuthLoading, user?.role, loadPendingPosts]); // Run when auth state is ready

  // Callback for when an action succeeds in the child component
  const handleActionSuccess = useCallback((postId: string) => {
      console.log(`Action completed for post ${postId}, removing from list.`);
      // Remove the post from the state after successful action
      setPendingPosts(prev => prev.filter(p => p._id !== postId));
  }, []); // Empty dependency array as it only uses setter

  // Optional: Callback for handling errors from child component
  const handleActionError = useCallback((postId: string, errorMessage: string) => {
      console.error(`Action failed for post ${postId}: ${errorMessage}`);
      // Display a temporary message or use a toast notification system
      // Error state is managed within the AdminPostActions component itself
  }, []); // Empty dependency array

  // Render Loading State
  if (isLoading || isAuthLoading) {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Pending Post Approval</h1>
            <p>Loading pending posts...</p> {/* Replace with skeleton/spinner */}
        </div>
    );
  }

  // Render Error State
  if (error) {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Pending Post Approval</h1>
            <p className="text-red-500">Error loading posts: {error}</p>
        </div>
    );
  }

  // Render Content
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Pending Post Approval</h1>

      {pendingPosts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No posts are currently awaiting approval.</p>
      ) : (
        <div className="space-y-4">
          {pendingPosts.map((post) => (
             <div key={post._id} className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                 {/* Display post preview */}
                 <PostPreview post={post} />
                 {/* Use the dedicated action component */}
                 <AdminPostActions
                     postId={post._id}
                     onActionComplete={handleActionSuccess}
                     onError={handleActionError}
                 />
             </div>
          ))}
        </div>
      )}
    </div>
  );
}