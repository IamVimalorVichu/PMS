// app/community/types/report.ts

import { UserBasicInfo } from "./auth";

// Import UserBasicInfo if needed for ReportRead later, assuming global for now
// import { UserBasicInfo } from '@/types/auth';

// Type for creating a report - matches backend input schema
export interface ReportCreate {
    reported_item_id: string;
    // Update item_type to include 'user'
    item_type: 'post' | 'comment' | 'user';
    reason?: string | null; // Optional reason
  }
  
  // Type representing a report object returned by the backend (e.g., for admin view)
  // Define based on what your backend /admin/community/reports endpoint returns
  export interface Report {
    _id: string; // or _id
    reporter_id: string;
    reported_item_id: string;
    item_type: 'post' | 'comment' | 'user';
    reason?: string;
    status: 'pending' | 'resolved' | 'dismissed';
    created_at: string; // ISO date string
    // Optional: Include reporter info if backend populates it for admin view
    // reporter?: UserBasicInfo;
  }
  
  // Type for updating a report's status (admin action)
  export interface ReportUpdate {
    status: 'pending' | 'resolved' | 'dismissed';
  }

  export interface ReportRead extends Report {
    // Optional: Include reporter info if backend populates it for admin view
    reporter?: UserBasicInfo;
    target_user_id: string ;

  }