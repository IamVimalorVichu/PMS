import { Performance } from "./types";

/**
 * Fetch student performance data
 */
export const fetchStudentPerformanceAPI = async (studentId: string): Promise<Performance> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student-performance/student/${studentId}`, {
      method: "GET",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch performance data: ${response.status}`);
    }
    
    return await response.json();
  };
  
  /**
   * Upload a file for a student
   */
  export const uploadFileAPI = async (
    studentId: string, 
    fileType: string, 
    files: FileList,
    onProgress?: (progress: number) => void
  ): Promise<unknown> => {
    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('fileType', fileType);
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    const xhr = new XMLHttpRequest();
    
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }
    
    return new Promise((resolve, reject) => {
      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/upload`);
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Network error occurred during upload'));
      };
      
      xhr.send(formData);
    });
  };