// app/community/components/posts/PostForm.tsx
"use client"; // This component requires state and event handlers

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path to your global useAuth hook
import { createPostAPI } from '@/app/community/services/postAPI'; // Adjust path
import { PostCreate } from '@/app/community/types/post'; // Adjust path
import { Spinner } from '@heroui/react';

// Optional: Import shared UI components if you have them
// import Button from '@/components/common/Button';
// import Input from '@/components/common/Input';
// import Textarea from '@/components/common/Textarea';
// import Select from '@/components/common/Select';

export function PostForm() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [postType, setPostType] = useState<'text' | 'link' | 'media'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canUserPost = user?.can_post ?? false;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); // Clear previous errors
    setSuccessMessage(null);

    if (isAuthLoading || !isAuthenticated || !user) {
      setError("You must be logged in to create a post.");
      return;
    }

    if (!canUserPost) {
      setError("You do not have permission to create posts.");
      return;
    }

    // Basic client-side validation (backend will also validate)
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (postType === 'text' && !content.trim()) {
      setError("Content is required for text posts.");
      return;
    }
    if (postType === 'link' && !url.trim()) {
      setError("URL is required for link posts.");
      return;
    }
    if (postType === 'media' && !mediaUrl.trim()) {
      setError("Media URL is required for media posts.");
      return;
    }
    // Add URL validation if desired

    setIsLoading(true);

    const postData: PostCreate = {
      title: title.trim(),
      post_type: postType,
      content: postType === 'text' ? content.trim() : null,
      url: postType === 'link' ? url.trim() : null,
      media_url: postType === 'media' ? mediaUrl.trim() : null,
    };

    try {
      const result = await createPostAPI(postData, user._id);
      console.log("Post creation API result:", result);
      setSuccessMessage(result?.message || "Post submitted successfully! It may require admin approval.");

      // Clear form after a short delay
      setTimeout(() => {
        setTitle('');
        setContent('');
        setUrl('');
        setMediaUrl('');
        setPostType('text');
        setSuccessMessage(null);
        // Redirect back to the community feed
        router.push('/community');
        // Optionally refresh the page data if staying on the same page
        // router.refresh();
      }, 2000); // 2 second delay

    } catch (err: unknown) {
      console.error("Post creation failed:", err);
      setError((err as Error).message || "An unexpected error occurred while creating the post.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" color="primary" />
        <span className="ml-2 text-gray-700 dark:text-gray-300">Loading users...</span>
      </div>
    );
  }

  // Show a message when user is banned from posting
  if (!isAuthLoading && isAuthenticated && !canUserPost) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            Posting Temporarily Disabled
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You have been temporarily banned from creating posts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success: </strong>
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {/* Title Input with tooltip */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isLoading || !canUserPost}
          title={!canUserPost ? "You have been temporarily banned from posting" : ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={!canUserPost ? "Posting temporarily disabled" : "Enter post title"}
        />
      </div>

      {/* Post Type Selector with tooltip */}
      <div>
        <label htmlFor="postType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Post Type <span className="text-red-500">*</span>
        </label>
        <select
          id="postType"
          value={postType}
          onChange={(e) => setPostType(e.target.value as 'text' | 'link' | 'media')}
          disabled={isLoading || !canUserPost}
          title={!canUserPost ? "You have been temporarily banned from posting" : ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="text">Text</option>
          <option value="link">Link</option>
          <option value="media">Media (URL)</option>
        </select>
      </div>

      {/* Conditional Fields */}
      {postType === 'text' && (
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={isLoading || !canUserPost}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 disabled:opacity-50"
          />
        </div>
      )}

      {postType === 'link' && (
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={isLoading || !canUserPost}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 disabled:opacity-50"
          />
        </div>
      )}

      {postType === 'media' && (
        <div>
          <label htmlFor="mediaUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Media URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="mediaUrl"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            required
            disabled={isLoading || !canUserPost}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter the direct URL to an image or other media.</p>
        </div>
      )}

      {/* Update Submit Button with clearer messaging */}
      <div>
        <button
          type="submit"
          disabled={isLoading || !canUserPost || isAuthLoading}
          title={!canUserPost ? "You have been temporarily banned from posting" : ""}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Create Post'}
        </button>
        {!isAuthLoading && !canUserPost && (
          <p className="text-sm text-red-600 mt-2 text-center">
            You have been temporarily banned from creating posts.
          </p>
        )}
      </div>
    </form>
  );
}