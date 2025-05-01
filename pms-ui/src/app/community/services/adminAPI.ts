// app/community/services/adminAPI.ts
import Cookies from 'js-cookie';
import { Post } from '@/app/community/types/post'; // Adjust path
import { ReportRead, ReportUpdate } from '@/app/community/types/report'; // Adjust path
import { User } from '@/components/types/types'; // Adjust path to global User type
import { UserUpdate } from '@/components/types/types'; // Adjust path
import { APIResponse } from '../types/api';
import { ApplyRestrictionsPayload } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ADMIN_ENDPOINT = "/admin/community"; // Base for admin routes

// --- Helper to get token and check adminUserId ---
const getAuthHeaders = (adminUserId: string, includeContentType: boolean = false): HeadersInit => {
    if (!adminUserId) {
        throw new Error("Admin User ID is required for admin actions.");
    }
    const token = Cookies.get('access_token');
    if (!token) {
        throw new Error('Authentication required for admin actions.');
    }
    const headers: HeadersInit = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

// --- Helper for Error Handling ---
const handleAdminApiError = async (response: Response, actionDesc: string): Promise<void> => {
    let errorDetail = `Failed to ${actionDesc} (Status: ${response.status})`;
    try {
        const errorData = await response.json();
        if (response.status === 403) {
            errorDetail = errorData.detail || "Admin privileges required.";
        } else if (response.status === 404) {
             errorDetail = errorData.detail || "Item not found.";
        } else if (response.status === 422 && errorData.detail) {
            errorDetail = `Validation Error: ${JSON.stringify(errorData.detail)}`;
        } else {
            errorDetail = errorData.detail || errorDetail;
        }
    } catch { /* Ignore if error response is not JSON */ }
    console.error(`${actionDesc} error:`, errorDetail);
    const error = new Error(errorDetail);
    throw error;
};


// --- Post Management API Calls ---

export const fetchPendingPostsAPI = async (adminUserId: string, skip: number = 0, limit: number = 20): Promise<Post[]> => {
    const headers = getAuthHeaders(adminUserId);
    const url = `${API_BASE_URL}${ADMIN_ENDPOINT}/posts/pending/${adminUserId}?skip=${skip}&limit=${limit}`;
    console.log(`Fetching pending posts from: ${url}`);
    const response = await fetch(url, { method: 'GET', headers: headers, cache: 'no-store' });
    if (!response.ok) await handleAdminApiError(response, "fetch pending posts");
    const posts: Post[] = await response.json();
    return posts;
};

export const fetchPostIdbyCommentIdAPI = async (commentId: string): Promise<string> => {
    if (!commentId) throw new Error("Comment ID required.");
    const url = `${API_BASE_URL}${ADMIN_ENDPOINT}/posts/comment/${commentId}`;
    console.log(`Fetching post ID by comment ID from: ${url}`);
    const response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' }, cache: 'no-store' });
    if (!response.ok) await handleAdminApiError(response, "fetch post ID by comment ID");
    const data = await response.json();
    console.log("Post ID fetched:", data);
    if (!data || !data.post_id) {
        throw new Error("Post ID not found for the given comment ID.");
    }
    return data.post_id;
};

export const approvePostAPI = async (postId: string, adminUserId: string): Promise<APIResponse> => {
    if (!postId) throw new Error("Post ID required for approval.");
    const headers = getAuthHeaders(adminUserId);
    const url = `${API_BASE_URL}${ADMIN_ENDPOINT}/posts/${postId}/approve/${adminUserId}`;
    console.log(`Approving post at: ${url}`);
    const response = await fetch(url, { method: 'POST', headers: headers });
    if (!response.ok) await handleAdminApiError(response, `approve post ${postId}`);
    return response.json();
};

export const rejectPostAPI = async (postId: string, adminUserId: string): Promise<APIResponse> => {
    if (!postId) throw new Error("Post ID required for rejection.");
    const headers = getAuthHeaders(adminUserId);
    const url = `${API_BASE_URL}${ADMIN_ENDPOINT}/posts/${postId}/reject/${adminUserId}`;
    console.log(`Rejecting post at: ${url}`);
    const response = await fetch(url, { method: 'DELETE', headers: headers });
    if (!response.ok) await handleAdminApiError(response, `reject post ${postId}`);
    return response.json();
};


// --- Report Management API Calls ---

export const fetchReportsAPI = async (adminUserId: string, statusFilter?: string, skip: number = 0, limit: number = 20): Promise<ReportRead[]> => {
    const headers = getAuthHeaders(adminUserId);
    let url = `${API_BASE_URL}${ADMIN_ENDPOINT}/reports/${adminUserId}?skip=${skip}&limit=${limit}`;
    if (statusFilter) {
        url += `&status_filter=${encodeURIComponent(statusFilter)}`;
    }
    console.log(`Fetching reports from: ${url}`);
    const response = await fetch(url, { method: 'GET', headers: headers, cache: 'no-store' });
    if (!response.ok) await handleAdminApiError(response, "fetch reports");
    const reports: ReportRead[] = await response.json();
    return reports;
};

export const resolveReportAPI = async (reportId: string, updateData: ReportUpdate, adminUserId: string): Promise<APIResponse> => {
    if (!reportId) throw new Error("Report ID required.");
    const headers = getAuthHeaders(adminUserId, true); // Include Content-Type
    const url = `${API_BASE_URL}${ADMIN_ENDPOINT}/reports/${reportId}/resolve/${adminUserId}`;
    console.log(`Resolving report at: ${url} with status: ${updateData.status}`);
    const response = await fetch(url, {
        method: 'POST', // Assuming POST for resolve action based on route definition
        headers: headers,
        body: JSON.stringify(updateData)
    });
    if (!response.ok) await handleAdminApiError(response, `resolve report ${reportId}`);
    return response.json();
};


// --- User Management API Calls ---

export const fetchAdminUserListAPI = async (adminUserId: string, skip: number = 0, limit: number = 50, searchQuery?: string): Promise<User[]> => {
    const headers = getAuthHeaders(adminUserId);
    let url = `${API_BASE_URL}${ADMIN_ENDPOINT}/users/${adminUserId}?skip=${skip}&limit=${limit}`;
    if (searchQuery && searchQuery.length >= 2) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
    }
    console.log(`Fetching admin user list from: ${url}`);
    const response = await fetch(url, { method: 'GET', headers: headers, cache: 'no-store' });
    if (!response.ok) await handleAdminApiError(response, "fetch admin user list");
    const users: User[] = await response.json();
    return users;
};

export const updateUserPermissionsAPI = async (targetUserId: string, permissions: UserUpdate, adminUserId: string): Promise<User> => {
    if (!targetUserId) throw new Error("Target User ID required.");
    // Include can_message in the payload
    const payload = {
        can_post: permissions.can_post,
        can_comment: permissions.can_comment,
        can_message: permissions.can_message  // Add this line
    };
    const headers = getAuthHeaders(adminUserId, true); // Include Content-Type
    const url = `${API_BASE_URL}${ADMIN_ENDPOINT}/users/${targetUserId}/permissions/${adminUserId}`;
    console.log(`Updating permissions for user ${targetUserId} at: ${url}`);
    const response = await fetch(url, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(payload) // Send only relevant fields
    });
    if (!response.ok) await handleAdminApiError(response, `update permissions for user ${targetUserId}`);
    const updatedUser: User = await response.json();
    return updatedUser;
};

/**
 * Admin: Applies restrictions to a target user.
 */
export const applyUserRestrictionsAPI = async (
    targetUserId: string,
    payload: ApplyRestrictionsPayload,
    adminUserId: string
): Promise<User> => {
    if (!targetUserId) throw new Error("Target User ID required.");

    // Use getAuthHeaders if defined in this file, otherwise implement header logic here
    const token = Cookies.get('access_token');
    if (!token) throw new Error('Authentication required.');
    const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
    // --- End Header Logic ---

    const url = `${API_BASE_URL}/admin/community/users/${targetUserId}/restrict/${adminUserId}`; // Match backend route
    console.log(`Applying restrictions to user ${targetUserId} at: ${url}`);

    const response = await fetch(url, {
        method: 'POST', // Assuming POST for this action based on route definition
        headers: headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        // Use handleAdminApiError if defined, otherwise implement error handling
        let errorDetail = `Failed to apply restrictions (Status: ${response.status})`;
        try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } catch { /* Ignore */ }
        console.error("applyUserRestrictionsAPI error:", errorDetail);
        const error = new Error(errorDetail); 
        throw error;
        // --- End Error Handling ---
    }

    const updatedUser: User = await response.json();
    console.log(`Restrictions applied successfully for user ${targetUserId}`);
    return updatedUser;
};