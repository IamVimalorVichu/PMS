// app/community/services/postAPI.ts
import Cookies from 'js-cookie';
import { Post, PostCreate, VoteResultCorrected, VoteStatus } from '@/app/community/types/post'; // Adjust path as needed
import { APIResponse } from '@/app/community/types/api'; // Adjust path as needed
import { Comment, CommentCreate } from '../types/comment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const COMMUNITY_ENDPOINT = "/community"; // Base for community routes

/**
 * Fetches a list of posts (approved for non-admins).
 */
export const fetchPostsAPI = async (skip: number = 0, limit: number = 10): Promise<Post[]> => {
  const token = Cookies.get('access_token');
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${COMMUNITY_ENDPOINT}/posts?skip=${skip}&limit=${limit}`;
  console.log(`Fetching posts from: ${url}`); // Debug log

  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
    // Add cache control if needed, e.g., 'no-store' for Server Components
    // to always get fresh data, or rely on Next.js default caching.
    cache: 'no-store', // Example: Force fresh data fetch on server
  });

  if (!response.ok) {
    let errorDetail = `Failed to fetch posts (Status: ${response.status})`;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorDetail;
    } catch { /* Ignore if error response is not JSON */ }
    console.error("fetchPostsAPI error:", errorDetail);
    throw new Error(errorDetail);
  }

  const posts: Post[] = await response.json();
  console.log(`Fetched ${posts.length} posts.`); // Debug log
  return posts;
};

/**
 * Fetches a single post by its ID.
 */
export const fetchPostByIdAPI = async (postId: string): Promise<Post> => {
  if (!postId) {
    throw new Error("Post ID is required.");
  }
  const token = Cookies.get('access_token');
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${COMMUNITY_ENDPOINT}/posts/${postId}`;
  console.log(`Fetching post from: ${url}`); // Debug log

  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
    cache: 'no-store', // Fetch fresh data for individual posts too
  });

  if (!response.ok) {
    let errorDetail = `Failed to fetch post ${postId} (Status: ${response.status})`;
     // Handle 404 specifically if needed by checking response.status === 404
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorDetail;
    } catch { /* Ignore if error response is not JSON */ }
    console.error("fetchPostByIdAPI error:", errorDetail);
    throw new Error(errorDetail); // Let the page handle the error display
  }

  const post: Post = await response.json();
  console.log(`Fetched post: ${post.title}`); // Debug log
  return post;
};

export const createPostAPI = async (postData: PostCreate, user_id: string): Promise<APIResponse> => { // Return type 'any' for now, adjust based on actual backend response
  const token = Cookies.get('access_token');

  if (!token) {
    // Should ideally be checked before calling, but good failsafe
    throw new Error('Authentication required to create a post.');
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json', // Sending JSON body
    'Authorization': `Bearer ${token}`, // Add the Authorization header
  };

  const url = `${API_BASE_URL}${COMMUNITY_ENDPOINT}/posts/${user_id}`;
  console.log(`Creating post at: ${url} with data:`, postData); // Debug log

  // Basic validation before sending (optional but good practice)
  if (!postData.title || !postData.post_type) {
      throw new Error("Title and post type are required.");
  }
  if (postData.post_type === 'text' && !postData.content) {
      throw new Error("Content is required for text posts.");
  }
  if (postData.post_type === 'link' && !postData.url) {
      throw new Error("URL is required for link posts.");
  }
   if (postData.post_type === 'media' && !postData.media_url) {
      throw new Error("Media URL is required for media posts.");
  }


  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(postData), // Send data as JSON string
  });

  if (!response.ok) {
    let errorDetail = `Failed to create post (Status: ${response.status})`;
    try {
      const errorData = await response.json();
      // Check for FastAPI validation errors specifically
      if (response.status === 422 && errorData.detail) {
          // Format validation errors nicely if possible
          errorDetail = `Validation Error: ${JSON.stringify(errorData.detail)}`;
      } else {
          errorDetail = errorData.detail || errorDetail;
      }
    } catch { /* Ignore if error response is not JSON */ }
    console.error("createPostAPI error:", errorDetail);
    // Include status code in the error for better handling in the component
    const error = new Error(errorDetail);
    throw error;
  }

  // Assuming backend returns JSON on success (e.g., {"status": "success", "id": "...", "is_approved": false})
  const result = await response.json();
  console.log("Post creation successful:", result); // Debug log
  return result; // Return the success response body
};


export const fetchCommentsForPostAPI = async (postId: string, skip: number = 0, limit: number = 20): Promise<Comment[]> => {
  if (!postId) {
    throw new Error("Post ID is required to fetch comments.");
  }
  const token = Cookies.get('access_token'); // Needed even for GET if post access depends on auth
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${COMMUNITY_ENDPOINT}/posts/${postId}/comments?skip=${skip}&limit=${limit}`;
  console.log(`Fetching comments from: ${url}`); // Debug log

  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
    cache: 'no-store', // Fetch fresh comments
  });

  if (!response.ok) {
    // Handle cases where the post itself might not be found or accessible (backend might return 404)
    let errorDetail = `Failed to fetch comments for post ${postId} (Status: ${response.status})`;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorDetail;
    } catch { /* Ignore */ }
    console.error("fetchCommentsForPostAPI error:", errorDetail);
    throw new Error(errorDetail);
  }

  const comments: Comment[] = await response.json();
  console.log(`Fetched ${comments.length} comments for post ${postId}.`); // Debug log
  return comments;
};

/**
 * Creates a new comment on a specific post. Requires authentication.
 */
export const createCommentAPI = async (postId: string, commentData: CommentCreate, userId: string): Promise<Comment> => {
  if (!postId) {
    throw new Error("Post ID is required to create a comment.");
  }
  if (!commentData.content || !commentData.content.trim()) {
      throw new Error("Comment content cannot be empty.");
  }
  if (!userId) {
    throw new Error("User ID is required to create a comment.");
  }

  const token = Cookies.get('access_token');
  if (!token) {
    throw new Error('Authentication required to comment.');
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const url = `${API_BASE_URL}${COMMUNITY_ENDPOINT}/posts/${postId}/comments/${userId}`;
  console.log(`Creating comment at: ${url}`); // Debug log

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(commentData),
  });

  if (!response.ok) {
    let errorDetail = `Failed to create comment (Status: ${response.status})`;
    try {
      const errorData = await response.json();
       if (response.status === 403) { // Specific check for permission denied
           errorDetail = errorData.detail || "You do not have permission to comment.";
       } else if (response.status === 422 && errorData.detail) {
           errorDetail = `Validation Error: ${JSON.stringify(errorData.detail)}`;
       } else {
           errorDetail = errorData.detail || errorDetail;
       }
    } catch { /* Ignore */ }
    console.error("createCommentAPI error:", errorDetail);
    const error = new Error(errorDetail);
    // (error as APIResponse).status = response.status;
    throw error;
  }

  // Backend should return the created comment object including author info
  const createdComment: Comment = await response.json();
  console.log("Comment creation successful:", createdComment); // Debug log
  return createdComment;
};

/**
 * Deletes a specific comment. Requires authentication (author or admin).
 */
export const deleteCommentAPI = async (commentId: string, userId: string): Promise<APIResponse> => { // Return type 'any' for success message
   if (!commentId) {
    throw new Error("Comment ID is required to delete.");
  }
  if (!userId) {
    throw new Error("User ID is required to delete a comment.");
  }
  const token = Cookies.get('access_token');
  if (!token) {
    throw new Error('Authentication required to delete a comment.');
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const url = `${API_BASE_URL}${COMMUNITY_ENDPOINT}/comments/${commentId}/${userId}`;
  console.log(`Deleting comment at: ${url}`); // Debug log

  const response = await fetch(url, {
    method: 'DELETE',
    headers: headers,
  });

  if (!response.ok) {
    let errorDetail = `Failed to delete comment ${commentId} (Status: ${response.status})`;
    try {
      const errorData = await response.json();
       if (response.status === 403) { // Specific check for permission denied
           errorDetail = errorData.detail || "You do not have permission to delete this comment.";
       } else {
           errorDetail = errorData.detail || errorDetail;
       }
    } catch { /* Ignore */ }
    console.error("deleteCommentAPI error:", errorDetail);
     const error = new Error(errorDetail);
    // (error as unknown).status = response.status;
    throw error;
  }

  // Expecting a success message like {"status": "success", "message": "..."}
  const result = await response.json();
  console.log("Comment deletion successful:", result); // Debug log
  return result;
};


/**
 * Upvotes a specific post. Requires authentication.
 */
export const upvotePostAPI = async (postId: string, userId: string): Promise<VoteResultCorrected> => {
  if (!postId) throw new Error("Post ID is required to upvote.");
  const token = Cookies.get('access_token');
  if (!token) throw new Error('Authentication required to upvote.');

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const url = `${API_BASE_URL}${COMMUNITY_ENDPOINT}/posts/${postId}/upvote/${userId}`; // Same URL, different method
  console.log(`Upvoting post at: ${url}`); // Debug log

  const response = await fetch(url, { method: 'POST', headers: headers });

  if (!response.ok) {
    let errorDetail = `Failed to upvote post ${postId} (Status: ${response.status})`;
    try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } 
    catch { /* Ignore */ }
    console.error("upvotePostAPI error:", errorDetail);
    const error = new Error(errorDetail); 
    throw error;
  }

  const result: VoteResultCorrected = await response.json();
  console.log("Upvote successful:", result); // Debug log
  return result;
};

/**
 * Removes an upvote from a specific post. Requires authentication.
 */
export const removeUpvoteAPI = async (postId: string, userId: string): Promise<VoteResultCorrected> => {
  if (!postId) throw new Error("Post ID is required to remove upvote.");
  const token = Cookies.get('access_token');
  if (!token) throw new Error('Authentication required to remove upvote.');

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const url = `${API_BASE_URL}${COMMUNITY_ENDPOINT}/posts/${postId}/upvote/${userId}`; // Same URL, different method
  console.log(`Removing upvote at: ${url}`); // Debug log

  const response = await fetch(url, { method: 'DELETE', headers: headers });

  if (!response.ok) {
    let errorDetail = `Failed to remove upvote for post ${postId} (Status: ${response.status})`;
    try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } 
    catch { /* Ignore */ }
    console.error("removeUpvoteAPI error:", errorDetail);
    const error = new Error(errorDetail);
    throw error;
  }

  const result: VoteResultCorrected = await response.json();
  console.log("Remove upvote successful:", result); // Debug log
  return result;
};

/**
 * Fetches the current user's vote status for a specific post. Requires authentication.
 */
export const fetchVoteStatusAPI = async (postId: string, userId: string): Promise<VoteStatus> => {
  if (!postId) throw new Error("Post ID is required to check vote status.");
  if (!userId) throw new Error("User ID is required to check vote status.");
  const token = Cookies.get('access_token');
  // If no token, user hasn't voted (or can't vote)
  if (!token) return { has_voted: false };

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  const url = `${API_BASE_URL}${COMMUNITY_ENDPOINT}/posts/${postId}/vote-status?user_id=${userId}`;
  console.log(`Fetching vote status from: ${url}`);
  
  const response = await fetch(url, { 
    method: 'GET', 
    headers: headers, 
    cache: 'no-store' 
  });

  if (!response.ok) {
    let errorDetail = `Failed to fetch vote status for post ${postId} (Status: ${response.status})`;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorDetail;
    } catch { /* Ignore */ }
    console.error("fetchVoteStatusAPI error:", errorDetail);
    throw new Error(errorDetail);
  }

  const result = await response.json();
  return result;
};

export const deletePostAPI = async (postId: string, userId: string): Promise<APIResponse> => {
  if (!postId) {
    throw new Error("Post ID is required to delete.");
  }
  if (!userId) {
    throw new Error("User ID is required to delete a post.");
  }
  const token = Cookies.get('access_token');
  if (!token) {
    throw new Error('Authentication required to delete a post.');
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const url = `${API_BASE_URL}${COMMUNITY_ENDPOINT}/posts/${postId}/${userId}`;
  console.log(`Deleting post at: ${url}`);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: headers,
  });

  if (!response.ok) {
    let errorDetail = `Failed to delete post ${postId} (Status: ${response.status})`;
    try {
      const errorData = await response.json();
      if (response.status === 403) {
        errorDetail = errorData.detail || "You do not have permission to delete this post.";
      } else {
        errorDetail = errorData.detail || errorDetail;
      }
    } catch { /* Ignore */ }
    console.error("deletePostAPI error:", errorDetail);
    throw new Error(errorDetail);
  }

  const result = await response.json();
  console.log("Post deletion successful:", result);
  return result;
};