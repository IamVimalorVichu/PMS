// app/community/components/dm/MessageInput.tsx
"use client";

import React, { useState, FormEvent, useRef, KeyboardEvent } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { sendMessageAPI } from '@/app/community/services/dmAPI'; // Adjust path
import { MessageRead, MessageCreate } from '@/app/community/types/message'; // Adjust path
import { Button } from '@heroui/react'; // Assuming usage
import { IoSend } from "react-icons/io5"; // Example send icon

interface MessageInputProps {
  conversationId: string;
  onMessageSent: (newMessage: MessageRead) => void; // Callback to update parent state
}

export function MessageInput({ conversationId, onMessageSent }: MessageInputProps) {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for potential auto-resize

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault(); // Prevent default if called from form submit
    setError(null);

    const trimmedContent = content.trim();
    if (!isAuthenticated || !user?._id || !trimmedContent || isSending) {
      return;
    }

    setIsSending(true);
    const messageData: MessageCreate = { content: trimmedContent };

    try {
      const newMessage = await sendMessageAPI(conversationId, messageData, user._id);
      setContent(''); // Clear input on success
      onMessageSent(newMessage); // Notify parent
      // Focus back on textarea after sending
      textareaRef.current?.focus();
    } catch (err: unknown) {
      console.error("Failed to send message:", err);
      setError((err as Error).message || "Could not send message.");
      // Don't clear content on error
    } finally {
      setIsSending(false);
    }
  };

  // Handle Shift+Enter for new line, Enter to submit
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent new line on Enter
      handleSubmit(); // Trigger submit
    }
  };

  // Basic auto-resize for textarea (optional)
  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scroll height
    }
  };


  return (
    <form onSubmit={handleSubmit} className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1} // Start with 1 row
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          required
          disabled={isSending || !isAuthenticated}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 disabled:opacity-50 resize-none overflow-hidden max-h-32" // Added resize-none, overflow-hidden, max-h
          style={{ height: 'auto' }} // Ensure initial auto height works
        />
        <Button
          type="submit"
          color="primary" // Use HeroUI props
          isLoading={isSending} // Use HeroUI prop
          disabled={isSending || !content.trim() || !isAuthenticated}
          className="h-[42px]" // Match height roughly
          isIconOnly // Make it icon only if desired
          aria-label="Send message"
        >
          {!isSending && <IoSend size={18} />}
        </Button>
      </div>
    </form>
  );
}