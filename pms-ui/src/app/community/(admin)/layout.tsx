// app/community/(admin)/layout.tsx
"use client"; // Required to use hooks like useAuth and potentially useRouter

import React, { ReactNode } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path to global useAuth
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Optional: Import a spinner or loading component
// import { Spinner } from '@/components/common/Spinner';

export default function AdminCommunityLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Add debug logging
  console.log('AdminLayout State:', {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role
  });

  // Wait for BOTH auth check and profile to be loaded
  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p>Loading Admin Access...</p>
      </div>
    );
  }

  // Now we can be sure we have the full user profile
  if (!isAuthenticated || user.role !== 'admin') {
    console.warn("AdminCommunityLayout: Access denied.", {
      isAuthenticated,
      userRole: user?.role
    });
    // Use redirect instead of replace for a cleaner navigation
    router.push('/community');
    return null; // Return null while redirecting
  }

  // Only render admin content when we're sure the user is an admin
  return (
    <div className="container mx-auto px-4 py-6">
      <nav className="mb-6 pb-2 border-b dark:border-gray-700">
        <ul className="flex space-x-4 text-sm font-medium">
          <li><Link href="/community/pending" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">Pending Posts</Link></li>
          <li><Link href="/community/reports" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">Reports</Link></li>
          <li><Link href="/community/users" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">User Permissions</Link></li>
        </ul>
      </nav>
      {children}
    </div>
  );
}