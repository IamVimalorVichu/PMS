'use client';

import { Button } from '@heroui/react';
import { useState } from 'react';
import {  FiPlus, FiEye, FiTrash2, FiDownload } from 'react-icons/fi';
import { Resume } from '../components/types';
import { useStudentManagement } from '../components/useStudentManagement';

// --- Import necessary functions/components for PDF generation ---
import { pdf } from '@react-pdf/renderer';
import ResumePDFDocument from '../components/ResumePDF'; // Adjust path if needed

const formatDate = (date: string | Date | null): string => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
     if (isNaN(d.getTime())) return "";
    // Using a more common locale format might be better than ISO split
    try {
        return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
    } catch {
        return d.toISOString().split('T')[0]; // Fallback
    }
};

export default function ResumesPage() {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const {
        resumes,
        resumeLoading,
        resumeError,
        handleDeleteResume,
        // handleFetchStudentResumes, // Assuming this is implicitly called or handled by the hook
        // handleDownloadResume, // We won't use the hook's download function directly here
    } = useStudentManagement();

    // --- Client-side PDF Generation and Download ---
    const handleDownloadClick = async (resume: Resume) => {
        if (!resume || !resume._id) {
            console.error('Invalid resume data for download');
            // Add user feedback (e.g., toast notification)
            return;
        }

        setDownloadingId(resume._id);
        console.log(`Generating PDF for ${resume.first_name}...`);

        try {
            // 1. Generate the PDF blob client-side
            const blob = await pdf(<ResumePDFDocument formData={resume} />).toBlob();

            // 2. Create a URL for the blob
            const url = URL.createObjectURL(blob);

            // 3. Create a temporary link element
            const link = document.createElement('a');
            link.href = url;

            // 4. Set the download filename
            const filename = `${resume.first_name || 'Resume'}_${resume.last_name || ''}_${resume.title || 'CV'}.pdf`.replace(/ /g, '_');
            link.download = filename;

            // 5. Simulate a click to trigger the download
            document.body.appendChild(link); // Required for Firefox
            link.click();

            // 6. Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log(`PDF download initiated for ${resume.first_name}`);

        } catch (error) {
            console.error('Failed to generate or download PDF:', error);
            // Add user feedback (e.g., toast notification)
        } finally {
            setDownloadingId(null); // Reset loading state regardless of success/failure
        }
    };


    const handleDelete = async (resumeId: string) => {
        if (confirm('Are you sure you want to delete this resume?')) {
            try {
                await handleDeleteResume(resumeId); // Assuming this updates the 'resumes' list via the hook
            } catch (error) {
                console.error('Failed to delete resume:', error);
                 // Add user feedback
            }
        }
    };


    // --- Render Logic (mostly unchanged) ---

    if (resumeLoading) {
        return <div className="flex justify-center items-center h-96">Loading...</div>;
    }

    if (resumeError) {
        return <div className="text-red-500 text-center">{resumeError}</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">My Resumes</h1>
                    <p className="text-gray-600 text-sm mt-1">Manage your resumes and CV documents</p>
                </div>
                 {/* Buttons for Create/Upload remain the same */}
                <div className="space-x-4">
                     <Button
                        variant="light"
                        onPress={() => window.location.href = '/students/resumes/create'} // Assuming this path exists
                        className="flex items-center gap-2"
                    >
                        <FiPlus /> Create Resume
                    </Button>
                    {/* Add upload functionality if needed */}
                    {/* <Button
                        variant="light"
                        onPress={() => console.log('Upload resume')}
                        className="flex items-center gap-2"
                    >
                        <FiUpload /> Upload Resume
                    </Button> */}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="divide-y">
                    {resumes.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No resumes found. Create a new resume or upload existing ones.
                        </div>
                    ) : (
                        resumes.map((resume: Resume) => (
                            <div
                                key={resume._id}
                                className="p-4 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 gap-3 sm:gap-0" // Added gap for stacking
                            >
                                <div className="flex-grow"> {/* Allow text to take space */}
                                    <h3 className="text-lg font-medium">
                                        {/* Use resume title if available, otherwise fallback name */}
                                        {resume.title || `${resume.first_name} ${resume.last_name}'s Resume`}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Last updated: {formatDate(resume.updated_at || resume.created_at || '')}
                                    </p>
                                </div>
                                {/* Action Buttons */}
                                <div className="flex gap-2 flex-shrink-0"> {/* Prevent buttons shrinking */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        // Navigate to a view/edit page for this specific resume
                                        onPress={() => window.location.href = `/students/resumes/edit?id=${resume._id}`} // Adjust path as needed
                                    >
                                        <FiEye /> View/Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        isDisabled={downloadingId === resume._id}
                                        // Call the *new* client-side download handler
                                        onPress={() => handleDownloadClick(resume)}
                                    >
                                        <FiDownload />
                                        {downloadingId === resume._id ? 'Generating...' : 'Download'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-1 text-red-600"
                                        onPress={() => handleDelete(resume._id!)} // Ensure ID exists
                                    >
                                        <FiTrash2 /> Delete
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}