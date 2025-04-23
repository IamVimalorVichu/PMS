// app/community/services/postAPI.ts
import Cookies from '../../../../node_modules/@types/js-cookie';
import { Post } from '@/app/community/types/post'; // Adjust path as needed

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