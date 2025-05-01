// app/community/dm/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { getMyConversationsAPI } from '@/app/community/services/dmAPI'; // Adjust path
import { ConversationRead } from '@/app/community/types/conversation'; // Adjust path
import { ConversationPreview } from '@/app/community/components/dm/ConversationPreview'; // Adjust path
import Link from 'next/link'; // Optional: Link to start new convo

export default function DirectMessagesPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [conversations, setConversations] = useState<ConversationRead[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canUserMessage = user?.can_message ?? false;

  useEffect(() => {
    // Don't fetch if auth is loading or user isn't logged in
    if (isAuthLoading || !isAuthenticated || !user?._id) {
      // If user logs out, clear conversations
      if (!isAuthenticated && conversations.length > 0) setConversations([]);
      setIsLoadingConversations(!isAuthLoading); // Stop loading if auth fails/loads
      return;
    }

    const loadConversations = async () => {
      setIsLoadingConversations(true);
      setError(null);
      try {
        if (!user?._id) {
          throw new Error("User ID is required to fetch conversations.");
        }
        const fetchedConversations = await getMyConversationsAPI(user._id); // Pass userId
        setConversations(fetchedConversations);
      } catch (err: unknown) {
        console.error("Failed to load conversations:", err);
        setError((err as Error).message || "Could not load conversations.");
        setConversations([]); // Clear on error
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, [user?._id, isAuthenticated, isAuthLoading, conversations.length]); // Re-fetch if user changes

  const isLoading = isAuthLoading || isLoadingConversations;



  return (
    <div className="container mx-auto px-0 md:px-4 py-6 max-w-3xl"> {/* Max width for chat list */}
      <div className="flex justify-between items-center mb-4 px-4 md:px-0">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Messages</h1>
        {canUserMessage ? (
          <Link 
            href="/community/dm/new" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            New Message
          </Link>
        ) : (
          <button 
            disabled
            title="You have been temporarily banned from messaging"
            className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed opacity-50"
          >
            New Message
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
        {isLoading && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading conversations...</div>
          // Add skeleton loaders here for better UX
        )}

        {!isLoading && error && (
          <div className="p-4 text-center text-red-600">{error}</div>
        )}

        {!isLoading && !error && conversations.length === 0 && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            You have no conversations yet.
          </div>
        )}

        {!isLoading && !error && conversations.length > 0 && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((convo) => (
              <div key={convo._id} className="relative"> {/* Add relative positioning */}
                <ConversationPreview conversation={convo} />
              </div>
            ))}
          </div>
        )}
      </div>
       {/* Add pagination controls if needed */}
    </div>
  );
}