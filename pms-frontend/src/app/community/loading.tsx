// Corresponding loading state file:
// app/community/loading.tsx
export default function CommunityLoading() {
    return (
      <div className="container mx-auto px-4 py-6">
         <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Community Feed</h1>
           <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        {/* Skeleton loader for posts */}
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 animate-pulse">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
              <div className="flex justify-between items-center text-sm">
                 <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                 <div className="flex gap-4">
                   <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-10"></div>
                   <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-10"></div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }