"use client";

import { UserBasicInfo } from '@/app/community/types/auth';
import { ProfileHoverCard } from '../profile/ProfileHoverCard';

interface UserNameDisplayProps {
  userInfo: UserBasicInfo & { first_name?: string; last_name?: string };
  className?: string;
}

export function UserNameDisplay({ userInfo, className = "" }: UserNameDisplayProps) {
  return (
    <ProfileHoverCard userInfo={userInfo}>
      <span className={`cursor-pointer hover:underline ${className}`}>
        {userInfo.user_name || `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || 'Unknown User'}
      </span>
    </ProfileHoverCard>
  );
}