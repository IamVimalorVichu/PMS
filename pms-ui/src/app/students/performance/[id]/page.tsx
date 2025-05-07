'use client'; // Required because StudentAnalysis uses hooks

import React from 'react';
import { useParams } from 'next/navigation'; // Hook to get route parameters in Client Components
import StudentAnalysis from '../components/StudentAnalysis'; // Adjust path
import { FaArrowUp } from 'react-icons/fa'; // Adjust import based on your icon library
import Link from 'next/link'; // For navigation

// Optional: Add metadata if needed (can be done in layout or here if static)
// export const metadata = {
//   title: 'Student Performance Analysis',
// };

export default function StudentPerformancePage() {
    const params = useParams();
    const studentId = params?.id as string | undefined; // Get the 'id' from the route path

    // Basic loading/error state for the ID itself
    if (!studentId) {
        // This might happen briefly during render or if the route is invalid
        return (
            <div className="container mx-auto p-4">
                <p>Loading student information...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {/* Back Navigation (Example) */}
            <Link
                href={`/students/${studentId}`} // Link back to the main student detail page (adjust path if needed)
                className="inline-flex items-center text-sm text-blue-600 hover:underline mb-4"
            >
                <FaArrowUp className="mr-1 h-4 w-4" />
                Back to Student Profile
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold mb-6">
                Performance Analysis
                {/* You might want to fetch and display the student's name here */}
            </h1>

            {/* Render the analysis component, passing the extracted ID */}
            <StudentAnalysis studentId={studentId} />

        </div>
    );
}