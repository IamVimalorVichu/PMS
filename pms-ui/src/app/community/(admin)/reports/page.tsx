// app/community/(admin)/reports/page.tsx
"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { fetchReportsAPI } from '@/app/community/services/adminAPI'; // Adjust path
import { ReportRead } from '@/app/community/types/report'; // Adjust path
// Import the action component
import { AdminReportActions } from '@/app/community/components/admin/AdminReportActions'; // Adjust path

// Helper function to format dates
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
  } catch { return "Invalid Date"; }
};

export default function ManageReportsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [reports, setReports] = useState<ReportRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');
  // Action state is now managed within AdminReportActions component

  // Function to load reports
  const loadReports = useCallback(async () => {
    if (!user?._id || user.role !== 'admin') {
        setIsLoading(false);
        if (user && user.role !== 'admin') setError("Access Denied.");
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedReports = await fetchReportsAPI(user._id, statusFilter);
      setReports(fetchedReports);
    } catch (err: unknown) {
      console.error("Failed to load reports:", err);
      setError((err as Error).message || "Could not load reports.");
    } finally {
      setIsLoading(false);
    }
  }, [user, statusFilter]); // Reload when filter or user changes

  // Initial load and reload on filter change
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user?.role === 'admin') {
      loadReports();
    } else if (!isAuthLoading && (!isAuthenticated || user?.role !== 'admin')) {
        setIsLoading(false);
        setError("Access Denied.");
    }
  }, [isAuthenticated, isAuthLoading, user?.role, loadReports]); // Use loadReports as dependency

  // Handler for filter dropdown change
  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value as 'pending' | 'resolved' | 'dismissed');
    // loadReports will be triggered by the useEffect dependency change
  };

  // Callback for when status is changed by child component
  const handleReportStatusChanged = useCallback((reportId: string, newStatus: 'resolved' | 'dismissed') => {
      console.log(`Report ${reportId} status changed to ${newStatus}`);
      // Update status locally for immediate feedback
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      // Optionally filter out if viewing pending (or refetch)
      if (statusFilter === 'pending') {
          setReports(prev => prev.filter(r => r.id !== reportId));
      }
      // Alternatively, trigger a full refetch: loadReports();
  }, [statusFilter]); // Include statusFilter if filtering logic depends on it

   // Optional: Callback for handling errors from child component
  const handleActionError = useCallback((reportId: string, errorMessage: string) => {
      console.error(`Action failed for report ${reportId}: ${errorMessage}`);
      // Show toast notification? Error state is managed within AdminReportActions
  }, []);

  // Helper to get link to reported item (needs refinement based on actual routes)
  const getItemLink = (itemType: string, itemId: string): string => {
      if (itemType === 'post') return `/community/posts/${itemId}`;
      // TODO: Determine how to link directly to a comment (e.g., post link + hash)
      if (itemType === 'comment') return `/community/posts/UNKNOWN_POST_ID?comment=${itemId}`; // Placeholder
      // TODO: Link to user profile page if it exists
      if (itemType === 'user') return `/profile/${itemId}`; // Placeholder
      return '#';
  };

  // Render Loading or Error States
  if (isLoading || isAuthLoading) {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Manage Reports</h1>
            <p>Loading reports...</p> {/* Replace with skeleton/spinner */}
        </div>
    );
  }
  if (error) {
     return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Manage Reports</h1>
            <p className="text-red-500">Error loading reports: {error}</p>
        </div>
     );
  }

  // Render Content
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Manage Reports</h1>

      {/* Filter Controls */}
      <div className="mb-4">
        <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={handleStatusChange}
          className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {reports.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No reports found with status {statusFilter}.</p>
      ) : (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg border dark:border-gray-700">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="py-3 px-6">Reported Item</th>
                <th scope="col" className="py-3 px-6">Type</th>
                <th scope="col" className="py-3 px-6">Reason</th>
                <th scope="col" className="py-3 px-6">Reporter</th>
                <th scope="col" className="py-3 px-6">Date</th>
                <th scope="col" className="py-3 px-6">Status</th>
                <th scope="col" className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                 <tr key={report.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                   <td className="py-4 px-6">
                     <Link href={getItemLink(report.item_type, report.reported_item_id)} className="text-blue-600 hover:underline" title={report.reported_item_id}>
                         View Item
                     </Link>
                   </td>
                   <td className="py-4 px-6 capitalize">{report.item_type}</td>
                   <td className="py-4 px-6 max-w-xs truncate" title={report.reason}>{report.reason || '-'}</td>
                   <td className="py-4 px-6">{report.reporter?.user_name || report.reporter_id.substring(0, 8) + '...'}</td>
                   <td className="py-4 px-6 whitespace-nowrap">{formatDate(report.created_at)}</td>
                   <td className="py-4 px-6 capitalize">{report.status}</td>
                   <td className="py-4 px-6">
                     {/* Use the dedicated action component */}
                     <AdminReportActions
                        reportId={report.id}
                        currentStatus={report.status}
                        onStatusChanged={handleReportStatusChanged}
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