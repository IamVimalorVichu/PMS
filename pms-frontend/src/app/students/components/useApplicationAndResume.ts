import { useState, useEffect } from 'react';
import { JobApplication, Resume } from './types';
import { getJobApplicationAPI, getResumeAPI } from './API';

interface UseApplicationAndResumeProps {
  isOpen: boolean;
  driveId: string;
  jobId: string;
  studentId: string;
}

export const useApplicationAndResume = ({ 
  isOpen, 
  jobId, 
  studentId 
}: UseApplicationAndResumeProps) => {
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !jobId || !studentId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch job application
        const applicationData = await getJobApplicationAPI(jobId, studentId);
        setApplication(applicationData);

        // If application has saved_resume, fetch it
        if (applicationData?.saved_resume) {
          const resumeData = await getResumeAPI(applicationData.saved_resume);
          setResume(resumeData);
        }
      } catch (err) {
        console.error('Error fetching job application and resume:', err);
        setError(err instanceof Error ? err.message : 'Failed to load application data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, jobId, studentId]);

  return {
    application,
    resume,
    loading,
    error
  };
};