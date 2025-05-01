// app/community/(admin)/reports/page.tsx
"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path
import { fetchReportsAPI, fetchPostIdbyCommentIdAPI } from '@/app/community/services/adminAPI'; // Adjust path
import { ReportRead } from '@/app/community/types/report'; // Adjust path
// Import the MODIFIED action component
import { AdminReportActions } from '@/app/community/components/admin/AdminReportActions'; // Adjust path


export default function ManageReportsPage() {
  // ... (state variables: user, reports, isLoading, error, statusFilter remain the same) ...
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [reports, setReports] = useState<ReportRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');
  const [itemLinks, setItemLinks] = useState<Record<string, string>>({});

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
    } catch { return "Invalid Date"; }
  };

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

  // Add useEffect to fetch links when reports change
  useEffect(() => {
    const fetchLinks = async () => {
        const links: Record<string, string> = {};
        for (const report of reports) {
            links[report._id] = await getItemLink(
                report.item_type, 
                report.reported_item_id,
                report.target_user_id
            );
        }
        setItemLinks(links);
    };
    
    fetchLinks();
  }, [reports]);

  // Handler for filter dropdown change
  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value as 'pending' | 'resolved' | 'dismissed');
    // loadReports will be triggered by the useEffect dependency change
  };

  // *** MODIFIED CALLBACK ***
  // Renamed and adjusted to reflect the modal's completion signal
  const handleResolutionComplete = useCallback((reportId: string, finalStatus: 'resolved' | 'dismissed') => {
      console.log(`Resolution completed for report ${reportId} with status ${finalStatus}`);
      // Option 1: Update local state (faster UI feedback)
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: finalStatus } : r));
      // Optionally filter out if viewing pending
      if (statusFilter === 'pending') {
          setReports(prev => prev.filter(r => r._id !== reportId));
      }
      // Option 2: Trigger a full refetch (simpler state logic, ensures data consistency)
      // loadReports();
  }, [statusFilter]); // Include statusFilter if filtering logic depends on it

// Helper to get link to reported item
  const getItemLink = async (itemType: string, itemId: string, targetUserId?: string): Promise<string> => {
    switch (itemType) {
        case 'post':
            return `/community/posts/${itemId}`;
        case 'comment':
            try {
                // Make this async and await the API call
                const postId = await fetchPostIdbyCommentIdAPI(itemId);
                return `/community/posts/${postId}?comment=${itemId}`;
            } catch (err) {
                console.error('Failed to fetch post ID for comment:', err);
                return '#';
            }
        case 'user':
            // Use targetUserId instead of itemId for user reports
            const profileId = targetUserId || itemId;
            return `/profile/${profileId}`;
        default:
            return '#';
    }
  };

  // Render Loading or Error States
  if (isLoading || isAuthLoading) {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Manage Reports</h1>
            <p>Loading reports...</p> 
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
              <tr> {/* ... headers ... */} </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                 <tr key={report._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                   {/* ... table cells for report data ... */}
                    <td className="py-4 px-6"> 
                      <Link 
                        href={itemLinks[report._id] || '#'} 
                        className="text-blue-600 hover:underline" 
                        title={report.reported_item_id}
                      >
                        View Item
                      </Link>
                    </td>
                    <td className="py-4 px-6 capitalize">{report.item_type}</td>
                    <td className="py-4 px-6 max-w-xs truncate" title={report.reason}>{report.reason || '-'}</td>
                    <td className="py-4 px-6">{report.reporter?.user_name || report.reporter_id.substring(0, 8) + '...'}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{formatDate(report.created_at)}</td>
                    <td className="py-4 px-6 capitalize">{report.status}</td>
                   <td className="py-4 px-6">
                     {/* Use the MODIFIED action component */}
                     <AdminReportActions
                        report={report} // Pass the full report object
                        onResolutionComplete={handleResolutionComplete}
                        // onError prop is removed as error is handled in modal mostly
                     />
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}






