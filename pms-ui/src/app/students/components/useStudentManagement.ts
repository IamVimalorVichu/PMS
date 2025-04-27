'use client';
import { useState, useEffect, useCallback } from "react";
import { 
  applyToJobAPI, 
  downloadResumeAPI, 
  fetchStudentByIdAPI, 
  fetchStudentPerformanceAPI, 
  updateStudentAPI, 
  prefillGoogleFormAPI,
  fetchDrivesAPI, 
  fetchDriveDetailsAPI,
  fetchCompaniesAPI, 
  fetchCompaniesByDriveAPI,
  fetchJobsByDriveAPI,
  fetchRequirementsByJobAPI,
  fetchJobsByDriveCompanyAPI,
  getStudentApplicationsAPI,
  createResumeAPI, 
  getResumeAPI, 
  getStudentResumesAPI, 
  updateResumeAPI, 
  deleteResumeAPI 
} from "./API";
import useCurrentUser from "@/app/hooks/useUser";

import { Student, Performance, Drive, Company, Job, Requirement, JobApplication, Resume, PrefillData } from "./types";

export const useStudentManagement = () => {
  const { user, userloading } = useCurrentUser();
  
  // Student states
  const [user_id, setUserId] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Performance states
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  
  // Form states
  const [studentForm, setStudentForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    alt_email: "",
    ph_no: "",
    alt_ph: "",
    address: "",
    city: "",
    state: "",
    district: "",
  });

  const [performanceForm, setPerformanceForm] = useState({
    skills: [] as string[],
    current_status: "",
    linkedin_url: "",
  });

  // Drive states
  const [drives, setDrives] = useState<Drive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);
  const [driveLoading, setDriveLoading] = useState(true);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveCompanies, setDriveCompanies] = useState<Company[]>([]);
  const [, setDriveCompanyIds] = useState<string[]>([]);
  
  // Job states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  
  // Resume states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('Student Management State:', {
      userLoading: userloading,
      userId: user?._id,
      studentId: student?._id,
      currentUserId: user_id
    });
  }, [userloading, user, student, user_id]);

  // Set user ID when user is loaded
  useEffect(() => {
    if (!userloading && user?._id) {
      console.log('User loaded, setting userId:', user._id);
      setUserId(user._id);
    }
  }, [userloading, user]);

  // Form change handlers
  const handleStudentFormChange = useCallback((field: string, value: unknown) => {
    setStudentForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handlePerformanceFormChange = useCallback((field: string, value: unknown) => {
    setPerformanceForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Fetch performance data
  const handleFetchPerformance = useCallback(async (student_id: string) => {
    setPerformanceLoading(true);
    setPerformanceError(null);
    console.log('Fetching performance for student ID:', student_id);
    try {
      const response = await fetchStudentPerformanceAPI(student_id);
      setPerformance(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch performance data';
      setPerformanceError(errorMessage);
      console.error(`Error in fetching student performance: ${errorMessage}`);
    } finally {
      setPerformanceLoading(false);
    }
  }, []);

  // Fetch student data
  const handlefetchStudent = useCallback(async (userid: string) => {
    if (!userid) {
      console.error('handlefetchStudent called without userid');
      return;
    }
  
    console.log('Fetching student for userid:', userid);
    try {
      setLoading(true);
      console.log(userid);
      const response = await fetchStudentByIdAPI(userid);
      if (!response) {
        throw new Error('No student data received');
      }
      console.log('Student fetched successfully:', response._id);
      setStudent(response);
      await handleFetchPerformance(response._id);
    } catch (error) {
      console.error('Error in fetching student data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  }, [handleFetchPerformance]);

  

  // Fetch drives
  const handleFetchDrives = useCallback(async () => {
    setDriveLoading(true);
    setDriveError(null);
    try {
      if(!student){
        await handlefetchStudent(user_id);
      }
      if (student){
      const data = await fetchDrivesAPI(student._id);
      setDrives(data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load drives';
      setDriveError(errorMessage);
      console.error('Error fetching drives:', error);
    } finally {
      setDriveLoading(false);
    }
  }, [student, user_id, handlefetchStudent]);

  // View drive details
  const handleViewDriveDetails = useCallback(async (driveId: string) => {
    try {
      setDriveLoading(true);
      
      // 1. Fetch drive details
      const driveDetails = await fetchDriveDetailsAPI(driveId);
      
      // 2. Fetch jobs for this drive
      const jobsList = await fetchJobsByDriveAPI(driveId);
      
      // 3. Fetch student's applications if logged in
      let studentApps: JobApplication[] = [];
      if (student?._id) {
        studentApps = await getStudentApplicationsAPI(student._id);
      }
      
      // 4. Fetch requirements and mark applied jobs
      const jobsWithRequirements = await Promise.all(
        jobsList.map(async (job: Job) => {
          if (!job._id) throw new Error('Job ID is undefined');
          const requirements = await fetchRequirementsByJobAPI(job._id);
          return {
            ...job,
            requirement: requirements[0],
            hasApplied: studentApps.some(app => app.job_id === job._id)
          };
        })
      );
      
      const completedriveDetails = {
        ...driveDetails,
        jobs: jobsWithRequirements
      };
      
      setSelectedDrive(completedriveDetails);
      
    } catch (error) {
      console.error('Error fetching drive details:', error);
      setDriveError(error instanceof Error ? error.message : 'Failed to load drive details');
    } finally {
      setDriveLoading(false);
    }
  }, [student]);

  // Fetch applications
  const handleFetchApplications = useCallback(async (studentId: string) => {
    try {
      const apps = await getStudentApplicationsAPI(studentId);
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(error instanceof Error ? error.message : 'Failed to load applications');
    }
  }, []);

  // Apply to job
  const handleApplyToJob = useCallback(async (
    jobId: string, 
    driveId: string, 
    companyId: string, 
    resumeFile: File | null,
    savedResumeId?: string
  ) => {
    console.log('handleApplyToJob called with:', {
      jobId,
      driveId,
      companyId,
      resumeFileName: resumeFile?.name,
      savedResumeId
    });
  
    if (!student || !student._id) {
      console.error('No student ID found');
      setError('No student ID found');
      return;
    }
  
    if (!resumeFile && !savedResumeId) {
      console.error('No resume selected');
      setError('Please select or upload a resume');
      return;
    }
  
    try {
      setDriveLoading(true);
      console.log('Calling applyToJobAPI...');
      
      if (savedResumeId) {
        // Apply with saved resume
        await applyToJobAPI(
          jobId,
          student._id,
          driveId,
          companyId,
          null, // no file
          savedResumeId // pass the saved resume ID
        );
      } else if (resumeFile) {
        // Apply with uploaded file
        await applyToJobAPI(
          jobId,
          student._id,
          driveId,
          companyId,
          resumeFile
        );
      }
  
      console.log('Application successful, resetting state...');
      setResumeFile(null);
      
      await handleFetchApplications(student._id);
      if (selectedDrive?._id) {
        await handleViewDriveDetails(selectedDrive._id);
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      setError(error instanceof Error ? error.message : 'Failed to apply to job');
    } finally {
      setDriveLoading(false);
    }
  }, [student, selectedDrive, handleFetchApplications, handleViewDriveDetails]);

  // Close drive details
  const handleCloseDriveDetails = useCallback(() => {
    setSelectedDrive(null);
  }, []);

  // Edit student
  const handleEditStudent = useCallback(async (student: Student) => {
    try {
      const updateData = {
        first_name: studentForm.first_name || student.first_name,
        middle_name: studentForm.middle_name || student.middle_name,
        last_name: studentForm.last_name || student.last_name,
        address: studentForm.address || student.address,
        city: studentForm.city || student.city,
        state: studentForm.state || student.state,
        district: studentForm.district || student.district,
        email: studentForm.email || student.email,
        alt_email: studentForm.alt_email || student.alt_email,
        ph_no: studentForm.ph_no || student.ph_no,
        alt_ph: studentForm.alt_ph || student.alt_ph,
      };
      
      const response = await updateStudentAPI(student._id, updateData);
      setStudent(response);
    } catch (error) {
      console.error(`Error in updating student name:`, error);
      setError(error instanceof Error ? error.message : 'Failed to update student');
    }
  }, [studentForm]);

  // File upload
  const handleFileUpload = useCallback(async (
    files: FileList, 
    type: string, 
    studentId: string,
    onProgress?: (progress: number) => void
  ) => {
    try {
      const formData = new FormData();
      
      // Add files to the correct field based on type
      const fieldName = type === 'certification' ? 'certification_files' : 'job_application_files';
      Array.from(files).forEach((file) => {
        formData.append(fieldName, file);
      });

      // Add minimal performance data
      const performanceData = {};
      formData.append('performance_data', JSON.stringify(performanceData));
      console.log('performance data', performanceData);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        if (onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded * 100) / event.total);
              onProgress(progress);
            }
          };
        }

        xhr.onload = async () => {
          if (xhr.status === 200) {
            // Refresh student performance data after upload
            await handleFetchPerformance(studentId);
            resolve(xhr.response);
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error'));
        };

        // Use PATCH for existing performance, POST for new one
        const method = 'PATCH'; // or check if performance exists and use POST/PATCH accordingly
        const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/student-performance/update/${studentId}`;
        
        xhr.open(method, endpoint);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
      throw error;
    }
  }, [handleFetchPerformance]);

  // Delete document
  const handleDeleteDocument = useCallback(async (filepath: string, type: string) => {
    if (!student || !student._id) {
      console.error('No student ID found');
      throw new Error('No student ID found');
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student-performance/documents`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filepath,
          type,
          student_id: student._id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Refresh performance data after deletion
      await handleFetchPerformance(student._id);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }, [student, handleFetchPerformance]);

  // Fetch companies by drive
  const fetchCompaniesByDrive = useCallback(async (driveId: string) => {
    try {
      const companyIds = await fetchCompaniesByDriveAPI(driveId);
      setDriveCompanyIds(companyIds);
      
      const companies = await fetchCompaniesAPI();
      const filteredCompanies = companies.filter((company: Company) => 
        companyIds.includes(company._id)
      );
      setDriveCompanies(filteredCompanies);
      
      return filteredCompanies;
    } catch (error) {
      console.error('Error fetching companies for drive:', error);
      setError(error instanceof Error ? error.message : 'Failed to load companies');
      return [];
    }
  }, []);

  // Fetch jobs by drive
  const fetchJobsByDrive = useCallback(async (driveId: string) => {
    try {
      // First get all companies for this drive
      const companyIds = await fetchCompaniesByDriveAPI(driveId);
      setDriveCompanyIds(companyIds);
      
      // Then fetch jobs for each company in this drive
      const allJobs = [];
      for (const companyId of companyIds) {
        const driveCompanyJobs = await fetchJobsByDriveCompanyAPI(driveId, companyId);
        allJobs.push(...driveCompanyJobs);
      }
      
      setJobs(allJobs);
      return allJobs;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load jobs');
      return [];
    }
  }, []);

  // Fetch requirements by job
  const fetchRequirementsByJob = useCallback(async (jobId: string) => {
    try {
      const requirementsData = await fetchRequirementsByJobAPI(jobId);
      setRequirements(requirementsData);
      return requirementsData;
    } catch (error) {
      console.error('Error fetching requirements:', error);
      setError(error instanceof Error ? error.message : 'Failed to load requirements');
      return [];
    }
  }, []);

  // Handle company select
  const handleCompanySelect = useCallback(async (companyId: string) => {
    try {
      if (!selectedDrive?._id) return;
      
      const company = driveCompanies.find(c => c._id === companyId);
      setSelectedCompany(company || null);
      
      // Fetch jobs specific to this company in the current drive
      const companyJobs = await fetchJobsByDriveCompanyAPI(selectedDrive._id, companyId);
      setJobs(companyJobs);
      
      // Clear previous requirements
      setRequirements([]);
      
      // If there are jobs, fetch requirements for the first job
      if (companyJobs.length > 0) {
        const jobRequirements = await fetchRequirementsByJobAPI(companyJobs[0]._id);
        setRequirements(jobRequirements);
      }
    } catch (error) {
      console.error('Error selecting company:', error);
      setError(error instanceof Error ? error.message : 'Failed to load company details');
    }
  }, [selectedDrive, driveCompanies]);


  // Fetch student resumes
  const handleFetchStudentResumes = useCallback(async (studentId: string) => {
    setResumeLoading(true);
    setResumeError(null);
    try {
      const resumes = await getStudentResumesAPI(studentId);
      setResumes(resumes || []); // Ensure we set an empty array if no resumes
      return resumes || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch resumes';
      setResumeError(errorMessage);
      console.error('Error fetching resumes:', error);
      return []; // Return empty array on error
    } finally {
      setResumeLoading(false);
    }
  }, []);
  

  // Resume file change
  const handleResumeFileChange = useCallback((file: File | null) => {
    console.log('Resume file changed:', file?.name);
    setResumeFile(file);
  }, []);

  // Create resume
  const handleCreateResume = useCallback(async (resumeData: Resume) => {
    if (!student || !student._id) {
      console.error('No student ID found');
      throw new Error('No student ID found');
    }

    setResumeLoading(true);
    setResumeError(null);
    try {
      const response = await createResumeAPI(resumeData, student._id);
      await handleFetchStudentResumes(student._id);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create resume';
      setResumeError(errorMessage);
      throw error;
    } finally {
      setResumeLoading(false);
    }
  }, [student, handleFetchStudentResumes]);


  // Update resume
  const handleUpdateResume = useCallback(async (resumeId: string, updateData: Partial<Resume>) => {
    if (!student || !student._id) {
      console.error('No student ID found');
      throw new Error('No student ID found');
    }

    setResumeLoading(true);
    setResumeError(null);
    try {
      const updatedResume = await updateResumeAPI(resumeId, updateData);
      await handleFetchStudentResumes(student._id);
      return updatedResume;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update resume';
      setResumeError(errorMessage);
      throw error;
    } finally {
      setResumeLoading(false);
    }
  }, [student, handleFetchStudentResumes]);

    // Delete resume
    const handleDeleteResume = useCallback(async (resumeId: string) => {
      if (!student || !student._id) {
        console.error('No student ID found');
        throw new Error('No student ID found');
      }
  
      setResumeLoading(true);
      setResumeError(null);
      try {
        await deleteResumeAPI(resumeId);
        await handleFetchStudentResumes(student._id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete resume';
        setResumeError(errorMessage);
        throw error;
      } finally {
        setResumeLoading(false);
      }
    }, [student, handleFetchStudentResumes]);
  
    // Fetch resume by ID
    const handleFetchResumeById = useCallback(async (resumeId: string) => {
      setResumeLoading(true);
      setResumeError(null);
      try {
        const resume = await getResumeAPI(resumeId);
        setSelectedResume(resume);
        return resume;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch resume';
        setResumeError(errorMessage);
        console.error('Error fetching resume:', error);
        throw error;
      } finally {
        setResumeLoading(false);
      }
    }, []);
  
    // Download resume
    const handleDownloadResume = useCallback(async (resumeId: string, fileName: string) => {
      try {
        const blob = await downloadResumeAPI(resumeId);
        
        // Create and trigger download
        const url = window.URL.createObjectURL(
          new Blob([blob], { type: 'application/pdf' })
        );
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.pdf`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error in handleDownloadResume:', error);
        throw new Error('Failed to download resume. Please try again.');
      }
    }, []);
  
    // Prefill form
    const handleFormPrefill = useCallback(async (formUrl: string) => {
      if (!student || !performance) {
        console.error('Missing student or performance data');
        return formUrl;
      }
  
      try {
        setLoading(true);
        const prefillData: PrefillData = {
          fullName: `${student.first_name} ${student.last_name}`,
          firstname: student.first_name,
          lastname: student.last_name,
          email: student.email,
          phoneNumber: student.ph_no,
          department: student.program,
          registerNumber: student.reg_no,
          address: student.address,
          city: student.city,
          state: student.state,
          district: student.district,
          alt_email: student.alt_email,
          alt_ph: student.alt_ph,
          tenth_cgpa: performance.tenth_cgpa,
          twelfth_cgpa: performance.twelth_cgpa,
          current_status: performance.current_status,
          linkedin_url: performance.linkedin_url,
        };
  
        const prefilledUrl = await prefillGoogleFormAPI(formUrl, prefillData);
        return prefilledUrl;
      } catch (error) {
        console.error('Error prefilling form:', error);
        return formUrl; // Fallback to original URL
      } finally {
        setLoading(false);
      }
    }, [student, performance]);
  
    // Apply click handler
    const handleApplyClick = useCallback(async (formLink: string) => {
      try {
        setLoading(true);
        const prefilledUrl = await handleFormPrefill(formLink);
        window.open(prefilledUrl, '_blank', 'noopener,noreferrer');
        return prefilledUrl;
      } catch (error) {
        console.error('Error handling form prefill:', error);
        // Fallback to original form URL
        window.open(formLink, '_blank', 'noopener,noreferrer');
        return formLink;
      } finally {
        setLoading(false);
      }
    }, [handleFormPrefill]);
  
    // Fetch student data when user_id changes
    useEffect(() => {
      const fetchData = async () => {
        if (!user_id) {
          console.log('No user_id available yet');
          return;
        }
  
        try {
          console.log('Fetching student data for:', user_id);
          setLoading(true);
          const response = await fetchStudentByIdAPI(user_id);
          if (!response) {
            throw new Error('No student data received');
          }
          console.log('Student data fetched:', response._id);
          setStudent(response);
          await handleFetchPerformance(response._id);
        } catch (error) {
          console.error('Error fetching student:', error);
          setError(error instanceof Error ? error.message : 'Failed to fetch student data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [user_id, handleFetchPerformance]);
  
    // Update student form when student changes
    useEffect(() => {
      if (student) {
        setStudentForm({
          first_name: student.first_name || "",
          middle_name: student.middle_name || "",
          last_name: student.last_name || "",
          email: student.email || "",
          alt_email: student.alt_email || "",
          ph_no: student.ph_no || "",
          alt_ph: student.alt_ph || "",
          address: student.address || "",
          city: student.city || "",
          state: student.state || "",
          district: student.district || "",
        });
      }
    }, [student]);
  
    // Update performance form when performance changes
    useEffect(() => {
      if (performance) {
        setPerformanceForm({
          skills: performance.skills || [],
          current_status: performance.current_status || "",
          linkedin_url: performance.linkedin_url || "",
        });
      }
    }, [performance]);
  
    // Fetch drives on mount
    useEffect(() => {
      handleFetchDrives();
    }, [handleFetchDrives]);
  
    // Fetch resumes when student changes
    useEffect(() => {
      if (student?._id) {
        handleFetchStudentResumes(student._id);
      }
    }, [student, handleFetchStudentResumes]);
  
    // Debug performance
    useEffect(() => {
      console.log(performance);
    }, [performance]);
  
    return {
      // Student states
      student, 
      setStudent,
      studentForm,
      setStudentForm,
      performanceForm,
      setPerformanceForm,
      loading, 
      setLoading,
      error, 
      setError,
      
      // Performance states
      performance, 
      setPerformance,
      performanceLoading,
      performanceError,
      
      // Student handlers
      handlefetchStudent,
      handleFetchPerformance,
      handleEditStudent,
      handleStudentFormChange,
      handlePerformanceFormChange,
      handleFileUpload,
      handleDeleteDocument,
      
      // Drive states
      drives,
      selectedDrive,
      driveLoading,
      driveError,
      driveCompanies,
      
      // Drive handlers
      handleFetchDrives,
      handleViewDriveDetails,
      handleApplyToJob,
      handleCloseDriveDetails,
      
      // Job states
      jobs,
      requirements,
      selectedCompany,
      setSelectedCompany,
      selectedJob,
      setSelectedJob,
      applications,
      
      // Job handlers
      fetchCompaniesByDrive,
      fetchJobsByDrive,
      fetchRequirementsByJob,
      handleCompanySelect,
      handleFetchApplications,
      
      // Resume states
      resumeFile,
      resumes,
      selectedResume,
      resumeLoading,
      resumeError,
      
      // Resume handlers
      handleResumeFileChange,
      handleCreateResume,
      handleFetchStudentResumes,
      handleUpdateResume,
      handleDeleteResume,
      setSelectedResume,
      handleFetchResumeById,
      handleDownloadResume,
      
      // Form handlers
      handleFormPrefill,
      handleApplyClick,
    };
  };