// app/community/posts/[postId]/page.tsx
import { fetchPostByIdAPI } from '@/app/community/services/postAPI'; // Adjust path
import { PostDetail } from '@/app/community/components/posts/PostDetail'; // Adjust path
import Link from 'next/link';

// This is a Server Component
export default async function SinglePostPage({ params }: { params: { postId: string } }) {
  const { postId } = params;
  let post = null;
  let fetchError = null;

  try {
    post = await fetchPostByIdAPI(postId);
  } catch (error: unknown) {
    console.error(`Error fetching post ${postId}:`, error);
    // Basic check if the error message indicates 'not found'
    if ((error as Error).message?.includes('404') || (error as Error).message?.toLowerCase().includes('not found')) {
       fetchError = "Post not found.";
    } else {
       fetchError = (error as Error).message || "Could not load post.";
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
       <div className="mb-4">
          <Link href="/community" className="text-blue-600 hover:underline dark:text-blue-400">
            ← Back to Community Feed
          </Link>
       </div>

      {fetchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{fetchError}</span>
        </div>
      )}

      {post && !fetchError && (
        <PostDetail post={post} />
      )}
    </div>
  );
}


