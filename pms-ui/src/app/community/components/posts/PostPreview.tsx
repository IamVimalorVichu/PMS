// app/community/components/posts/PostPreview.tsx
'use client'; // Still needs to be client because it uses useAuth and renders UpvoteButton

import Link from 'next/link';
import { Post } from '@/app/community/types/post'; // Adjust path as needed
import { FaComments } from 'react-icons/fa6';
import UpvoteButton from './UpvoteButton'; // Use the *simplified* button
import { useAuth } from '@/app/components/services/useAuth'; // Adjust path

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return "Invalid Date";
  }
};
interface PostPreviewProps {
  post: Post;
  initialHasVoted?: boolean; // Receive status from parent page
}

export function PostPreview({ post, initialHasVoted }: PostPreviewProps) {
  const { user, isLoading: isAuthLoading } = useAuth(); // Still need user for userId
  const initialUpvoteCount = post.upvoter_ids?.length ?? 0;

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 transition-colors duration-200">
      {/* ... Link, Title, Content Previews ... */}
       <Link href={`/community/posts/${post._id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
        <h2 className="text-xl font-semibold mb-2 line-clamp-2">{post.title}</h2>
      </Link>
      {post.post_type === 'text' && post.content && <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">{post.content}</p>}
      {post.post_type === 'link' && post.url && <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline break-all block mb-3 text-sm">{post.url}</a>}
      {post.post_type === 'media' && <p className="text-gray-500 dark:text-gray-400 italic mb-3 text-sm">Media Post</p>}


      <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-2 items-center">
        {/* ... Author and Date ... */}
        <span>Posted by <span className="font-medium text-gray-700 dark:text-gray-300">{post.author?.user_name || 'Unknown User'}</span></span>
        <span>on {formatDate(post.created_at)}</span>

        {/* Interactions */}
        <div className="flex items-center gap-4">
            {/* Render button only when user ID is available */}
            {user?._id && (
               <UpvoteButton // Use the simplified button
                    postId={post._id}
                    initialUpvoteCount={initialUpvoteCount}
                    userId={user._id}
                    // Pass status received from parent page
                    initialHasVoted={initialHasVoted}
               />
             )}
             {/* Show placeholder if auth is loading */}
             {isAuthLoading && (
                 <div className="flex items-center px-2 py-1 rounded border border-gray-300 text-gray-400 text-sm animate-pulse h-[30px] w-[50px]">...</div>
             )}
            {/* ... Comment Count ... */}
             <span title="Comments" className="flex items-center text-gray-600 dark:text-gray-400">
                <FaComments className="h-4 w-4 inline mr-1" />
                {post.comment_count ?? 0}
            </span>
        </div>
      </div>
    </div>
  );
}