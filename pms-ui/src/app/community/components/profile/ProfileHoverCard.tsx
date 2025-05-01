// app/community/components/profile/ProfileHoverCard.tsx
"use client";

import React, { useState, useRef, ReactNode, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserBasicInfo } from '@/app/community/types/auth'; // Or global User type
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { findOrCreateConversationAPI } from '@/app/community/services/dmAPI'; // Adjust path
import { Button, Avatar } from '@heroui/react'; // Assuming HeroUI
import { FaSpinner } from 'react-icons/fa'; // Loading icon
import { ReportModalTrigger } from '@/app/community/components/report/ReportModalTrigger';

interface ProfileHoverCardProps {
  userInfo: UserBasicInfo & { first_name?: string, last_name?: string }; // Need names for display
  children: ReactNode; // The element that triggers the hover (e.g., the username span)
}

export function ProfileHoverCard({ userInfo, children }: ProfileHoverCardProps) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null); // Ref for positioning
  const triggerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const openCard = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsOpen(true);
  }, []);

  const closeCard = useCallback(() => {
    // Delay closing to allow moving mouse onto the card
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setError(null); // Clear error on close
    }, 200); // Adjust delay as needed
  }, []);

  const handleCardMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleCardMouseLeave = () => {
    closeCard();
  };

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Position the card below the trigger element
      setPosition({
        top: rect.bottom + scrollY,
        left: Math.max(
          0, // Prevent going off-screen to the left
          Math.min(
            rect.left + scrollX,
            window.innerWidth - 256 // 256px is the card width (w-64)
          )
        ),
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      // Update position on scroll and resize
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, updatePosition]);

  const handleStartChat = async () => {
    if (!currentUser?._id || !userInfo?._id || isStartingChat) return;

    setIsStartingChat(true);
    setError(null);
    try {
      const conversation = await findOrCreateConversationAPI(userInfo._id, currentUser._id);
      router.push(`/community/dm/${conversation._id}`);
      setIsOpen(false); // Close card on success
    } catch (err: unknown) {
      console.error("Failed to start chat:", err);
      setError((err as Error).message || "Could not start chat.");
    } finally {
      setIsStartingChat(false);
    }
  };

  // Don't show hover card for the current user
  if (currentUser?._id === userInfo?._id) {
    return <>{children}</>;
  }

  const displayName = userInfo.user_name || `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || 'User';
  const realName = `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim();

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block" 
      onMouseEnter={openCard} 
      onMouseLeave={closeCard}
    >
      {/* The trigger element */}
      {children}

      {/* The Popover Card */}
      {isOpen && (
        <div
          ref={cardRef}
          className="fixed z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 p-4"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="flex items-center space-x-3 mb-3">
            <Avatar
              src={`https://ui-avatars.com/api/?name=${displayName}&background=random`} // Placeholder
              alt={`${displayName}'s profile picture`}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={displayName}>
                {displayName}
              </p>
              {realName && realName !== displayName && (
                 <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={realName}>
                   {realName}
                 </p>
              )}
               <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userInfo.role}</p>
            </div>
          </div>

          <div className="space-y-2"> {/* Added container for buttons */}
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

            {isAuthenticated && (
              <>
                <Button
                  color="primary"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                  onPress={handleStartChat}
                  disabled={isStartingChat}
                >
                  {isStartingChat ? (
                    <>
                      <FaSpinner className="animate-spin h-4 w-4" />
                      Starting chat...
                    </>
                  ) : (
                    'Message'
                  )}
                </Button>

                {/* Add Report User button */}
                {currentUser?._id !== userInfo._id && (
                  <ReportModalTrigger
                    itemId={userInfo._id}
                    itemType="user"
                    reportedItemDescription={`user '${displayName}'`}
                    triggerElement={
                      <button
                        className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Report User
                      </button>
                    }
                  />
                )}
              </>
            )}
            
            {!isAuthenticated && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Log in to interact
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}