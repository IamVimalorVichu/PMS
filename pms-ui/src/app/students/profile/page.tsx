// page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useStudentManagement } from '@/app/students/components/useStudentManagement';
import useCurrentUser from '@/app/hooks/useUser';
import { Tab, Tabs, Spinner } from '@heroui/react';
import PersonalDetails from './components/PersonalDetails';
import AcademicDetails from './components/AcademicDetails';
import Documents from './components/Documents';

export default function StudentProfile() {
  const { user, userloading } = useCurrentUser();
  const [user_id, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  const {
    student,
    loading,
    performance,
    performanceLoading,
    handlefetchStudent,
    handleEditStudent,
    studentForm,
    handleStudentFormChange,
    handleFileUpload,
    handleDeleteDocument,
    error,
  } = useStudentManagement();

  useEffect(() => {
    if (user) {
      setUserId(user._id);
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const fetchStudents = async () => {
      if (user_id && mounted) {
        try {
          await handlefetchStudent(user_id);
        } catch (error) {
          console.error("Error fetching student:", error as Error);
        }
      }
    };
    fetchStudents();
    return () => {
      mounted = false;
    };
  }, [user_id, handlefetchStudent]);

  if (userloading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto px-6 py-8 text-red-500">Error: {error}</div>;
  }

  if (!student) {
    return <div className="container mx-auto px-6 py-8">No student data available</div>;
  }

  // Create a wrapper function for handleFileUpload to ensure it returns Promise<void>
  const handleFileUploadWrapper = async (
    files: FileList, 
    type: string, 
    studentId: string, 
    onProgress: (progress: number) => void
  ): Promise<void> => {
    await handleFileUpload(files, type, studentId, onProgress);
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <Tabs 
        aria-label="Profile" 
        variant="underlined"
        classNames={{ 
          base: "flex flex-col md:flex-row h-full gap-8",
          tabList: "w-full md:w-64 justify-start flex-none bg-gray-50 p-4 rounded-lg",
          cursor: "w-full md:w-1 bg-blue-600",
          tab: "max-w-full justify-start px-4 h-12 text-gray-600 data-[selected=true]:text-blue-600",
          tabContent: "group-data-[selected=true]:font-medium",
          panel: "flex-1 min-w-0"
        }}
        isVertical 
        color="primary"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key.toString())}
      >
        <Tab key="personal" title="Personal Details">
          <PersonalDetails 
            student={student} 
            studentForm={studentForm}
            handleStudentFormChange={handleStudentFormChange}
            handleEditStudent={handleEditStudent}
          />
        </Tab>
        <Tab key="academic" title="Academic Details">
          <AcademicDetails student={student} />
        </Tab>
        <Tab key="documents" title="Documents">
          {performanceLoading || !performance ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color="primary" />
            </div>
          ) : (
            <Documents 
              student={student}
              performance={performance}
              handleFileUpload={handleFileUploadWrapper}
              handleDeleteDocument={handleDeleteDocument}
            />
          )}
        </Tab>
      </Tabs>
    </div>
  );
}