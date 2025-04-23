// app/community/components/posts/PostDetail.tsx
import { Post } from '@/app/community/types/post'; // Adjust path
import { FaRegComments } from 'react-icons/fa6';
import { BiUpArrow } from 'react-icons/bi'; // Upvote icon

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
  const upvoteCount = post.upvoter_ids?.length ?? 0;

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
          <p>{post.content}</p> // Render simple text, consider markdown later
        )}
        {post.post_type === 'link' && post.url && (
          <p>
            Link: <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{post.url}</a>
          </p>
        )}
         {post.post_type === 'media' && post.media_url && (
            // Basic media handling: Link for now. Could embed later.
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
           {/* Placeholder for Upvote Button */}
           <span title="Upvotes" className="flex items-center">
             <BiUpArrow className="h-5 w-5 mr-1" />
             {upvoteCount}
           </span>
           <span title="Comments" className="flex items-center">
             <FaRegComments className="h-5 w-5 mr-1" />
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

        {/* Area for Comments Section (to be added in Phase 3) */}
        <div className="mt-8 border-t dark:border-gray-700 pt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Comments</h3>
            {/* Comments list and form will go here */}
            <p className="text-gray-500 dark:text-gray-400 text-sm">Comments section coming soon...</p>
        </div>
    </article>
  );
}