// app/community/components/dm/ConversationPreview.tsx
"use client"; // Needed for useAuth and potentially client-side formatting

import { ConversationRead } from '@/app/community/types/conversation'; // Adjust path
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import Link from 'next/link';

// Helper function for relative time (you might have a better global one)
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return "Invalid Date";
  }
};

interface ConversationPreviewProps {
  conversation: ConversationRead;
}

export function ConversationPreview({ conversation }: ConversationPreviewProps) {
  const { user } = useAuth();
  const otherParticipants = conversation.participants?.filter(p => p._id !== user?._id) ?? [];

  return (
    <Link href={`/community/dm/${conversation._id}`}>
      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative">
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            {otherParticipants.map((participant) => (
              <div key={participant._id} className="font-medium text-gray-900 dark:text-white truncate">
                {participant.user_name || 'Unknown User'}
              </div>
            ))}
          </div>
          {conversation.last_message_at && (
            <span className="text-sm text-gray-500 shrink-0">
              {formatDate(conversation.last_message_at)}
            </span>
          )}
        </div>
        {conversation.last_message_preview && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
            {conversation.last_message_preview}
          </p>
        )}
      </div>
    </Link>
  );
}