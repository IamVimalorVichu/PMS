// Corresponding loading state file:
// app/community/posts/[postId]/loading.tsx
export default function PostLoading() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl animate-pulse">
           <div className="mb-4">
               <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
           </div>
           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border dark:border-gray-700">
               {/* Header */}
               <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
               <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
               {/* Content */}
               <div className="space-y-3 mb-6">
                   <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                   <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                   <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                   <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
               </div>
               {/* Footer */}
               <div className="flex items-center justify-between border-t dark:border-gray-700 pt-4">
                   <div className="flex gap-4">
                       <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                       <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                   </div>
                   <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
               </div>
               {/* Comments section placeholder */}
               <div className="mt-8 border-t dark:border-gray-700 pt-6">
                   <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                   <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
               </div>
           </div>
        </div>
    );
  }