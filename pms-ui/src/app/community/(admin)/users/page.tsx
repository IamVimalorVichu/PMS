// app/community/(admin)/users/page.tsx
"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { fetchAdminUserListAPI } from '@/app/community/services/adminAPI'; // Adjust path
import { User } from '@/components/types/types'; // Adjust path
// Import the action component
import { AdminUserPermissionsToggle } from '@/app/community/components/admin/AdminUserPermissionsToggle'; // Adjust path

export default function ManageUsersPage() {
  const { user: adminUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Action state is now managed within AdminUserPermissionsToggle component

  // Function to load users, including search
  const loadUsers = useCallback(async (query?: string) => {
    if (!adminUser?._id || adminUser.role !== 'admin') {
        setIsLoading(false);
        if (adminUser && adminUser.role !== 'admin') setError("Access Denied.");
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedUsers = await fetchAdminUserListAPI(adminUser._id, 0, 50, query); // Fetch initial batch
      setUsers(fetchedUsers);
    } catch (err: unknown) {
      console.error("Failed to load users:", err);
      setError((err as Error).message || "Could not load users.");
    } finally {
      setIsLoading(false);
    }
  }, [adminUser]); // Dependency on admin user

  // Initial load
  useEffect(() => {
     if (!isAuthLoading && isAuthenticated && adminUser?.role === 'admin') {
      loadUsers(searchQuery); // Load with current search query
    } else if (!isAuthLoading && (!isAuthenticated || adminUser?.role !== 'admin')) {
        setIsLoading(false);
        setError("Access Denied.");
    }
  }, [isAuthenticated, isAuthLoading, adminUser?.role, loadUsers, searchQuery]); // Include searchQuery

  // Handler for search input change (consider debouncing for performance)
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setSearchQuery(newQuery);
    // Trigger reload with the new query (debouncing recommended here)
    loadUsers(newQuery);
  };

  // Callback for when permissions are changed by child component
  const handlePermissionsUpdate = useCallback((updatedUser: User) => {
      console.log(`Permissions updated for user ${updatedUser._id}`);
      // Update the user in the local state list
      setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
  }, []); // Empty dependency array

   // Optional: Callback for handling errors from child component
  const handleActionError = useCallback((userId: string, errorMessage: string) => {
      console.error(`Permission update failed for user ${userId}: ${errorMessage}`);
      // Show toast notification? Error state is managed within AdminUserPermissionsToggle
  }, []);

  // Render Loading or Error States
  if (isLoading || isAuthLoading) {
     return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Manage User Permissions</h1>
            <p>Loading users...</p> {/* Replace with skeleton/spinner */}
        </div>
     );
  }
  if (error) {
     return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Manage User Permissions</h1>
            <p className="text-red-500">Error loading users: {error}</p>
        </div>
     );
  }

  // Render Content
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Manage User Permissions</h1>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search users by name, username, email..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {users.length === 0 && !isLoading ? (
        <p className="text-gray-500 dark:text-gray-400">No users found{searchQuery ? ` matching '${searchQuery}'` : ''}.</p>
      ) : (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg border dark:border-gray-700">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="py-3 px-6">Name</th>
                <th scope="col" className="py-3 px-6">Username</th>
                <th scope="col" className="py-3 px-6">Email</th>
                <th scope="col" className="py-3 px-6">Role</th>
                <th scope="col" className="py-3 px-6">Status</th>
                <th scope="col" className="py-3 px-6 text-center">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                 <tr key={u._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                   <td className="py-4 px-6 font-medium text-gray-900 dark:text-white whitespace-nowrap">{u.first_name} {u.last_name}</td>
                   <td className="py-4 px-6">{u.user_name || '-'}</td>
                   <td className="py-4 px-6">{u.email || '-'}</td>
                   <td className="py-4 px-6 capitalize">{u.role}</td>
                   <td className="py-4 px-6">{u.status}</td>
                   {/* Use the dedicated action component for permissions */}
                   <td className="py-2 px-3">
                     <AdminUserPermissionsToggle
                        targetUser={u}
                        onPermissionsChanged={handlePermissionsUpdate}
                        onError={handleActionError} // Optional
                     />
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
       {/* Add pagination controls if needed */}
    </div>
  );
}