// app/community/(admin)/layout.tsx
"use client"; // Required to use hooks like useAuth and potentially useRouter

import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path to global useAuth
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Optional: Import a spinner or loading component
// import { Spinner } from '@/components/common/Spinner';

export default function AdminCommunityLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect non-admins or logged-out users away after loading is complete
    if (!isAuthLoading && (!isAuthenticated || user?.role !== 'admin')) {
      console.warn("AdminCommunityLayout: Access denied. User not admin or not logged in.");
      router.replace('/community'); // Redirect to main community page or login
    }
  }, [user, isAuthenticated, isAuthLoading, router]);

  // Show loading state while checking authentication/role
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        {/* Optional: Replace with a proper spinner component */}
        <p>Loading Admin Access...</p>
      </div>
    );
  }

  // Show access denied message or redirect immediately (useEffect handles redirect)
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          You do not have permission to view this admin section.
        </p>
        <Link href="/community" className="text-blue-600 hover:underline">
          Return to Community Feed
        </Link>
      </div>
    );
  }

  // Render the actual admin page content if user is an admin
  return (
    <div className="container mx-auto px-4 py-6">
        {/* Optional: Add Admin specific navigation/header here */}
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