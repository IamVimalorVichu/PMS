"use client";

// app/community/components/posts/PostDetail.tsx
import { Post } from '@/app/community/types/post'; // Adjust path
import UpvoteButton  from './UpvoteButton'; // Import the button
import { useAuth } from '@/app/components/services/useAuth';


// Re-use or create a shared date formatter
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return "Invalid Date";
  }
};

interface PostDetailProps {
  post: Post;
}

// This component can be a Server Component as it just displays data initially
export function PostDetail({ post }: PostDetailProps) {
  const { user } = useAuth();
  const initialUpvoteCount = post.upvoter_ids?.length ?? 0;

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border dark:border-gray-700">
      {/* Post Header */}
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words">
          {post.title}
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Posted by{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {post.author?.user_name || 'Unknown User'} ({post.author?.role || 'N/A'})
          </span>{' '}
          on {formatDate(post.created_at)}
        </div>
      </header>

      {/* Post Content */}
      <div className="prose dark:prose-invert max-w-none mb-6 break-words">
        {post.post_type === 'text' && post.content && (
          <p>{post.content}</p>
        )}
        {post.post_type === 'link' && post.url && (
          <p>
            Link: <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{post.url}</a>
          </p>
        )}
         {post.post_type === 'media' && post.media_url && (
             <p>
                Media: <a href={post.media_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{post.media_url}</a>
             </p>
        )}
         {post.post_type === 'media' && !post.media_url && (
            <p className="italic text-gray-500">[Media post - No URL provided]</p>
        )}
      </div>

      {/* Post Footer - Interactions */}
      <footer className="flex items-center justify-between border-t dark:border-gray-700 pt-4">
         <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
           {/* Integrate Upvote Button */}
           {user?._id && (
             <UpvoteButton
                  postId={post._id}
                  initialUpvoteCount={initialUpvoteCount}
                  userId={user._id}
                  // Let the button fetch its own status here
             />
           )}
           {/* Comment Count Display */}
           <span title="Comments" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
             {post.comment_count ?? 0}
           </span>
         </div>
         <div>
            {/* Placeholder for Report Button */}
             <button className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400">
                 Report
             </button>
         </div>
      </footer>

        {/* Comments Section (Handled by CommentList component passed from page.tsx) */}
        {/* The CommentList component will be rendered by the page */}

    </article>
  );
}