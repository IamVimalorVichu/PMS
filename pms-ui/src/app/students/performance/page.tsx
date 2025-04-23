'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { usePerformanceManagement } from './components/usePerformanceManagement'
import FileUploadModal from '../components/FileUploadModal';
import PDFPreviewModal from '../components/PDFPreviewModal';
import StatCards from './components/StatCards';
import AcademicMetrics from './components/AcademicMetrics';
import SkillsSection from './components/SkillsSection';

export default function StudentPerformance() {
  const { 
    loading,
    error,
    performance,
    performanceLoading,
    performanceError,
    uploadFile
  } = usePerformanceManagement();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{url: string, name: string} | null>(null);

  const handleUpload = async (files: FileList) => {
    try {
      await uploadFile(
        files,
        isUploadModalOpen || 'certification',
        undefined, // Use the studentId from the hook
        (progress) => {
          // Handle upload progress if needed
          console.log('Upload progress:', progress);
        }
      );
      toast.success('File uploaded successfully');
      setIsUploadModalOpen(null);
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('Upload error:', error);
    }
  };

  const handleFilePreview = (fileUrl: string, fileName: string) => {
    setPreviewFile({ url: fileUrl, name: fileName });
  };

  if (loading || performanceLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || performanceError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error loading performance data</p>
          <p className="text-sm">{error || performanceError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Performance Dashboard</h1>
        <p className="text-gray-600">Track your academic progress and achievements</p>
      </div>

      <StatCards performance={performance} />
      <AcademicMetrics performance={performance} />
      <SkillsSection 
        performance={performance} 
        onUploadClick={(type) => setIsUploadModalOpen(type)}
        onFilePreview={handleFilePreview}
      />

      {/* Modals */}
      <FileUploadModal 
        isOpen={!!isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(null)}
        onUpload={handleUpload}
      />
      
      {previewFile && (
        <PDFPreviewModal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          fileUrl={previewFile.url}
          fileName={previewFile.name}
        />
      )}
    </div>
  );
}