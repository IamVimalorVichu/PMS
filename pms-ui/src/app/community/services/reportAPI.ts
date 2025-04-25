// app/community/services/reportAPI.ts
import Cookies from 'js-cookie';
import { ReportCreate } from '@/app/community/types/report'; // Adjust path as needed
import { APIResponse } from '../types/api';
// Import admin-related types if needed later for admin report fetching
// import { ReportRead, ReportUpdate } from '@/app/community/types/report';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// Define endpoint base - adjust if needed (e.g., if it's under /admin/community)
const REPORT_ENDPOINT = "/reports"; // Or adjust as per your backend route

/**
 * Submits a report against a post, comment, or user. Requires authentication.
 */
export const submitReportAPI = async (reportData: ReportCreate, userId: string): Promise<APIResponse> => {
  if (!userId) {
    throw new Error("User ID is required to submit a report.");
  }
  if (!reportData.reported_item_id || !reportData.item_type) {
    throw new Error("Reported item ID and type are required.");
  }

  const token = Cookies.get('access_token');
  if (!token) {
    throw new Error('Authentication required to submit a report.');
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Adjust URL based on how userId is passed (path param or inferred from token later)
  const url = `${API_BASE_URL}${REPORT_ENDPOINT}/create/${userId}`; // Example assuming userId in path
  // const url = `${API_BASE_URL}${REPORT_ENDPOINT}`; // If backend gets userId from token

  console.log(`Submitting report to: ${url} with data:`, reportData); // Debug log

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(reportData),
  });

  if (!response.ok) {
    let errorDetail = `Failed to submit report (Status: ${response.status})`;
    try {
      const errorData = await response.json();
      if (response.status === 404 && errorData.detail?.toLowerCase().includes('not found')) {
          errorDetail = `Cannot report item: ${errorData.detail}`; // More specific 404
      } else if (response.status === 422 && errorData.detail) {
          errorDetail = `Validation Error: ${JSON.stringify(errorData.detail)}`;
      } else {
          errorDetail = errorData.detail || errorDetail;
      }
    } catch  { /* Ignore if error response is not JSON */ }
    console.error("submitReportAPI error:", errorDetail);
    const error = new Error(errorDetail);
    throw error;
  }

  // Assuming backend returns a simple success message on 200 or 202
  // e.g., {"status": "success", "message": "Report submitted successfully."}
  const result = await response.json();
  console.log("Report submission successful:", result); // Debug log
  return result;
};


// --- Admin Report API Functions (To be added in Phase 6) ---
/*
export const fetchReportsAPI = async (userId: string, statusFilter?: string, skip: number = 0, limit: number = 20): Promise<ReportRead[]> => {
    // GET /admin/community/reports?status=...
}

export const resolveReportAPI = async (reportId: string, updateData: ReportUpdate, userId: string): Promise<any> => {
    // POST /admin/community/reports/{reportId}/resolve
}
*/