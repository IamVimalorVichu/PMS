// app/community/services/postAPI.ts
import Cookies from '../../../../node_modules/@types/js-cookie';
import { Post, PostCreate, PostCreateResponse } from '@/app/community/types/post'; // Adjust path as needed

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

export const createPostAPI = async (postData: PostCreate): Promise<PostCreateResponse> => { // Return type 'any' for now, adjust based on actual backend response
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

  const url = `${API_BASE_URL}${COMMUNITY_ENDPOINT}/posts`;
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
