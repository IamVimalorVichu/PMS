// app/community/types/post.ts

// Define UserBasicInfo here for encapsulation within community types
// Or import from a global type file if preferred (e.g., '@/types/auth')
export interface UserBasicInfo {
    id: string; // Or _id if backend uses that alias primarily in responses
    user_name?: string;
    role: "admin" | "faculty" | "student" | "alumni";
  }
  
  // Main Post type, matching backend PostRead schema
  export interface Post {
    _id: string; // Or _id
    title: string;
    content?: string; // For text posts
    post_type: 'text' | 'link' | 'media';
    url?: string; // For link posts (assuming backend sends HttpUrl as string)
    media_url?: string; // For media posts (assuming backend sends HttpUrl as string)
    created_at: string; // ISO date string from backend
    author_id: string;
    is_approved: boolean;
    upvoter_ids: string[]; // List of user IDs who upvoted
    comment_count: number;
    author?: UserBasicInfo; // Embedded author info
    // Optional: Add upvote_count if the backend calculates and sends it
    // upvote_count?: number;
  }
  
  // Type matching backend VoteStatus schema
  export interface VoteStatus {
    has_voted: boolean;
  }
  
  // Type matching backend VoteResult schema
  export interface VoteResult {
    new_count: number; // Note: 'int' isn't a standard TS type, use 'number'
    voted: boolean;
  }
  
  // Type correction for VoteResult
  export interface VoteResultCorrected {
    new_count: number;
    voted: boolean;
  }
   
  // --- New Type for Creating Posts ---
  
  // Matches the backend Pydantic PostCreate schema
  export interface PostCreate {
    title: string;
    content?: string | null; // Allow null if backend handles it, otherwise just optional string
    post_type: 'text' | 'link' | 'media';
    url?: string | null; // Allow null or make optional string
    media_url?: string | null; // Allow null or make optional string
  }


  export interface PostCreateResponse {
    status: "success" | "error";
    message: string;
    id: string;
    is_approved: boolean;
  }