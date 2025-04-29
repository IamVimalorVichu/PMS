// app/community/components/dm/MessageBubble.tsx
"use client"; // Can be client for consistency or future features

import React from 'react';
import { MessageRead } from '@/app/community/types/message'; // Adjust path

// Optional: Date formatting
const formatMessageTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  } catch {
    return '';
  }
};

interface MessageBubbleProps {
  message: MessageRead;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const bubbleClasses = `max-w-[75%] md:max-w-[65%] rounded-lg px-3 py-2 shadow-sm ${
    isOwnMessage
      ? 'bg-blue-500 text-white ml-auto' // Own messages on the right, blue background
      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 mr-auto' // Others' messages on the left, gray background
  }`;

  const containerClasses = `flex mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`;

  return (
    <div className={containerClasses}>
      <div className={bubbleClasses}>
        {/* Optional: Show sender name for group chats or if needed */}
        {/* {!isOwnMessage && message.sender?.user_name && (
          <p className="text-xs font-semibold mb-1">{message.sender.user_name}</p>
        )} */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100 opacity-75 text-right' : 'text-gray-500 dark:text-gray-400 text-right'}`}>
          {formatMessageTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}