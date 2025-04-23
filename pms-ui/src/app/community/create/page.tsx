// app/community/create/page.tsx
import { PostForm } from '@/app/community/components/posts/PostForm'; // Adjust path
import Link from 'next/link';

// This page can be a Server Component or Client Component.
// Making it a Client Component allows easy use of hooks if needed later,
// but for just rendering the form, Server Component is fine too.
// Let's make it simple for now.
export default function CreatePostPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
       <div className="mb-4">
          <Link href="/community" className="text-blue-600 hover:underline dark:text-blue-400">
            ← Back to Community
          </Link>
       </div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Create New Post</h1>
      <PostForm />
    </div>
  );
}