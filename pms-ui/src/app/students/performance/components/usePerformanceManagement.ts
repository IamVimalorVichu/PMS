// students/components/usePerformanceManagement.ts
import { useState, useEffect, useCallback } from 'react';
import { Performance } from './types';
import { fetchStudentPerformanceAPI, uploadFileAPI } from './API';
import useCurrentUser from '@/app/hooks/useUser';

export const usePerformanceManagement = () => {
  const { user, userloading } = useCurrentUser();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Performance state
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState<string | null>(null);

  // Fetch student ID from user data
  useEffect(() => {
    const fetchStudentId = async () => {
      if (!user || userloading) return;
      
      setLoading(true);
      try {
        // Fetch student data to get the student ID
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/user/${user._id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch student data');
        }
        
        const data = await response.json();
        setStudentId(data._id);
      } catch (err: unknown) {
        setError((err as Error).message);
        console.error('Error fetching student ID:', (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentId();
  }, [user, userloading]);

  // Fetch performance data
  const fetchPerformance = useCallback(async (id?: string) => {
    const targetId = id || studentId;
    if (!targetId) return;
    
    setPerformanceLoading(true);
    setPerformanceError(null);
    
    try {
      const data = await fetchStudentPerformanceAPI(targetId);
      setPerformance(data);
    } catch (err: unknown) {
      setPerformanceError((err as Error).message);
      console.error('Error fetching performance:', (err as Error).message);
    } finally {
      setPerformanceLoading(false);
    }
  }, [studentId]);

  // Fetch performance when studentId is available
  useEffect(() => {
    if (studentId) {
      fetchPerformance();
    }
  }, [studentId, fetchPerformance]);

  // Handle file upload
  const uploadFile = useCallback(async (
    files: FileList,
    fileType: string,
    id?: string,
    onProgress?: (progress: number) => void
  ) => {
    const targetId = id || studentId;
    if (!targetId) {
      throw new Error('Student ID not found');
    }
    
    try {
      const result = await uploadFileAPI(targetId, fileType, files, onProgress);
      // Refresh performance data after successful upload
      await fetchPerformance(targetId);
      return result;
    } catch (err: unknown) {
      console.error('Error uploading file:', (err as Error).message);
      throw err;
    }
  }, [studentId, fetchPerformance]);

  return {
    studentId,
    loading,
    error,
    performance,
    performanceLoading,
    performanceError,
    fetchPerformance,
    uploadFile
  };
};