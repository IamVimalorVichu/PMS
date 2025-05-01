export interface UserBasicInfo {
    _id: string; // Or _id if backend uses that alias primarily in responses
    user_name?: string;
    role: "admin" | "faculty" | "student" | "alumni";
  }

  export interface ApplyRestrictionsPayload {
    disable_posts?: boolean | null; // Use boolean | null if backend expects null for no change
    disable_comments?: boolean | null;
    disable_messaging?: boolean | null;
    restriction_days?: number | null; // Duration in days (null means no timed restriction)
  }