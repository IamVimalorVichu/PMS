// app/community/types/comment.ts

// Import UserBasicInfo if it's defined globally, or define it here if needed
// Assuming it's defined globally or in post.ts for now

// Matches the backend CommentCreate schema
export interface CommentCreate {
  content: string;
}

// Matches the backend CommentRead schema
export interface Comment {
  _id: string;
  content: string;
  post_id: string;
  author_id: string;
  created_at: string;
  author?: {
    _id: string;
    user_name: string;
    role: "admin" | "faculty" | "student" | "alumni";
  };
}