// app/community/dm/[conversationId]/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import hooks
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { getMessagesForConversationAPI, getConversationByIdAPI } from '@/app/community/services/dmAPI'; // Adjust path
import { MessageRead } from '@/app/community/types/message'; // Adjust path
import { MessageBubble } from '@/app/community/components/dm/MessageBubble'; // Adjust path
import { MessageInput } from '@/app/community/components/dm/MessageInput'; // Adjust path
import Link from 'next/link';
import { APIResponse } from '../../types/api';
import { UserBasicInfo } from '../../types/auth';
import { ReportModalTrigger } from '@/app/community/components/report/ReportModalTrigger'; // Adjust path

// Basic polling interval (e.g., 5 seconds) - adjust as needed
const POLLING_INTERVAL = 5000; // ms

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter(); // For potential redirects
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const canUserMessage = user?.can_message ?? false;
  const conversationId = params?.conversationId as string | undefined; // Get ID from URL

  const [messages, setMessages] = useState<MessageRead[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationPartner, setConversationPartner] = useState<string | null>(null); // Optional: Store partner name
  const [partnerInfo, setPartnerInfo] = useState<UserBasicInfo | null>(null); // Store partner info

  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref to scroll to bottom
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null); // Ref for polling timer

  // Function to scroll to the bottom of the messages list
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []); // No dependencies needed if ref is stable

  // Function to fetch messages
  const fetchMessages = useCallback(async (isInitialLoad = false) => {
    if (!conversationId || !user?._id || (!isInitialLoad && !isAuthenticated)) {
        if (isInitialLoad) setIsLoadingMessages(false);
        return; // Don't fetch if prerequisites aren't met
    }

    try {
        // If it's initial load, first fetch conversation details
        if (isInitialLoad) {
            try {
                const conversation = await getConversationByIdAPI(conversationId, user._id);
                const otherParticipant = conversation.participants?.find(p => p._id !== user._id);
                if (otherParticipant) {
                    console.log('Found partner from conversation:', otherParticipant);
                    setPartnerInfo(otherParticipant);
                    setConversationPartner(otherParticipant.user_name || 'Conversation');
                }
            } catch (error) {
                console.error('Error fetching conversation details:', error);
            }
        }

        // Fetch messages
        const fetchedMessages = await getMessagesForConversationAPI(conversationId, user._id, 0, 100);
        console.log('Fetched messages:', fetchedMessages.length);
        setMessages(fetchedMessages);

        // Scroll handling
        if (isInitialLoad || fetchedMessages.length > messages.length) {
            setTimeout(scrollToBottom, 100);
        }

    } catch (err: unknown) {
        console.error("Failed to fetch messages:", err);
        // Handle specific errors like 403 Forbidden (not a participant)
        if ((err as APIResponse).status === 403) {
            setError("You do not have access to this conversation.");
            // Optionally redirect
            router.push('/community/dm');
        } else if ((err as APIResponse).status === 404) {
            setError("Conversation not found.");
        } else {
            setError((err as APIResponse).message || "Could not load messages.");
        }
        if (isInitialLoad) setMessages([]); // Clear messages on initial load error
    } finally {
        if (isInitialLoad) setIsLoadingMessages(false);
    }
  }, [conversationId, user?._id, router, isAuthenticated, messages.length, scrollToBottom]);

  // Effect for initial message load
  useEffect(() => {
    if (conversationId && user?._id) {
      fetchMessages(true); // Initial load
    }
  }, [conversationId, user?._id, fetchMessages]); // Run when ID/user is available

  // Effect for polling new messages
  useEffect(() => {
    // Start polling only when authenticated and conversation ID is present
    if (isAuthenticated && conversationId && user?._id) {
      // Clear any existing timer before starting a new one
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

      pollingTimerRef.current = setInterval(() => {
        // console.log("Polling for new messages...");
        fetchMessages(false); // Fetch updates (not initial load)
      }, POLLING_INTERVAL);

      // Cleanup function to clear interval when component unmounts or dependencies change
      return () => {
        if (pollingTimerRef.current) {
          // console.log("Clearing polling timer.");
          clearInterval(pollingTimerRef.current);
        }
      };
    } else {
        // Clear timer if user logs out or navigates away
         if (pollingTimerRef.current) {
          // console.log("Clearing polling timer due to auth/nav change.");
          clearInterval(pollingTimerRef.current);
        }
    }
  }, [isAuthenticated, conversationId, user?._id, fetchMessages]); // Dependencies for polling

  // Handler for when a new message is sent via MessageInput
  const handleMessageSent = (newMessage: MessageRead) => {
    // Optimistically add the new message to the list
    setMessages(prevMessages => [...prevMessages, newMessage]);
    // Scroll to bottom after adding
    setTimeout(scrollToBottom, 50); // Small delay for render
     // Optional: Clear polling timer briefly and restart to avoid immediate fetch after sending
     if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
     pollingTimerRef.current = setInterval(() => fetchMessages(false), POLLING_INTERVAL);
  };

  // Render loading state for auth or initial messages
  if (isAuthLoading || (isLoadingMessages && messages.length === 0)) {
    return (
        <div className="flex flex-col h-[calc(100vh-theme_header_height)]"> {/* Adjust height based on your layout */}
            <div className="p-3 border-b dark:border-gray-700 text-center animate-pulse">Loading Conversation...</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2"></div>
            <div className="p-3 border-t dark:border-gray-700 h-[66px] bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        </div>
    );
  }

  // Render error state
  if (error) {
     return (
        <div className="flex flex-col h-[calc(100vh-theme_header_height)] items-center justify-center p-4">
             <p className="text-red-600 mb-4">{error}</p>
             <Link href="/community/dm" className="text-blue-600 hover:underline">Back to Messages</Link>
        </div>
     );
  }

  // Render conversation UI
  return (
    <div className="flex flex-col h-[calc(100vh-theme_header_height)] bg-white dark:bg-gray-900"> {/* Adjust height */}
      {/* Header */}
      <div className="p-3 border-b dark:border-gray-700 flex items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
        <Link href="/community/dm" className="mr-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
          ←
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <h2 className="text-lg font-semibold truncate text-gray-800 dark:text-white">
            {partnerInfo ? partnerInfo.user_name : (conversationPartner || 'Loading...')}
          </h2>
          {isAuthenticated && partnerInfo && user?._id !== partnerInfo._id && (
            <ReportModalTrigger
              itemId={partnerInfo._id}
              itemType="user"
              reportedItemDescription={`user '${partnerInfo.user_name}'`}
              triggerElement={
                <button className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                  Report
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwnMessage={msg.sender_id === user?._id}
          />
        ))}
        {/* Empty div to mark the end for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {conversationId && (
        <>
          {canUserMessage ? (
            <MessageInput
              conversationId={conversationId}
              onMessageSent={handleMessageSent}
            />
          ) : (
            <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="text-center text-sm text-red-600 dark:text-red-400 py-2">
                <span role="alert">
                  You have been temporarily banned from sending messages
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}