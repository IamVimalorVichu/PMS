// app/community/page.tsx
import { fetchPostsAPI } from '@/app/community/services/postAPI'; // Adjust path
import { PostPreview } from '@/app/community/components/posts/PostPreview'; // Adjust path
import Link from 'next/link'; // For the Create Post button
import { Post } from '@/app/community/types/post'; // Adjust path as needed
import { Button } from '@heroui/react';

// This is a Server Component by default in App Router
export default async function CommunityFeedPage() {
  let posts = [] as Post[]; // Initialize posts as an empty array
  let fetchError = null;

  try {
    // Fetch initial batch of posts
    posts = await fetchPostsAPI(0, 20); // Fetch first 20 posts
  } catch (error: unknown) {
    console.error("Error fetching community posts:", error);
    fetchError = (error as Error).message || "Could not load posts. Please try again later.";
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Community Feed</h1>
        {/* Add a button to navigate to the create post page (Phase 2) */}
        <Link href="/community/create">
             <Button color='secondary' variant='faded' onPress={() => window.location.href = '/community/create'}>
             Create Post
             </Button>
        </Link>
      </div>

      {fetchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{fetchError}</span>
        </div>
      )}

      {posts.length === 0 && !fetchError && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No posts found. Be the first to create one!
        </p>
      )}

      <div>
        {posts.map((post) => (
          <PostPreview post={post} key={post._id} />
        ))}
      </div>

      {/* Basic Pagination Placeholder - requires client-side logic or search params */}
      {/* {posts.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button className="px-4 py-2 border rounded-l-md hover:bg-gray-100 dark:hover:bg-gray-700">Previous</button>
          <button className="px-4 py-2 border-t border-b hover:bg-gray-100 dark:hover:bg-gray-700">Next</button>
          <button className="px-4 py-2 border rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-700">Load More</button>
        </div>
      )} */}
    </div>
  );
}

