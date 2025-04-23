import { Student, Company, Job, Requirement, Drive, Resume, ApplicationForm, JobApplication } from "./types";
import { PrefillData } from './types';

export const fetchStudentByIdAPI = async (userId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/get-user/${userId}`, {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
}

export const fetchStudentByStudentIdAPI = async (studentId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/get/${studentId}`, {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
}


export const fetchStudentPerformanceAPI = async (student_id: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student-performance/get/${student_id}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch student performance');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching student performance:', error);
        throw error;
    }
};


export const updateStudentAPI = async (id: string, updatedData: Partial<Student>) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/update/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error('Failed to update student');
        }

        return await response.json();
    }
    catch (error) {
        console.error('Error updating student:', error);
        throw error;
    }
}


export const fetchDrivesAPI = async (student_id: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/${student_id}/get-drives`);
    if (!response.ok) throw new Error('Failed to fetch drives');
    const drives: Drive[] = await response.json();

    // For each drive, fetch the participating companies count
    const drivesWithMeta = await Promise.all(
      drives.map(async (drive) => {
        const companiesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/drive_company/get/drive/${drive._id}`
        );
        if (!companiesResponse.ok) throw new Error('Failed to fetch drive companies');
        const companies = await companiesResponse.json();

        return {
          ...drive,
          companiesCount: companies.length
        };
      })
    );

    return drivesWithMeta;
  } catch (error) {
    console.error('Error fetching drives:', error);
    throw error;
  }
};

export const fetchDriveDetailsAPI = async (driveId: string) => {
  try {
    // Fetch drive details
    const driveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive/get/${driveId}`);
    if (!driveResponse.ok) throw new Error('Failed to fetch drive details');
    const drive: Drive = await driveResponse.json();

    // Fetch participating companies
    const driveCompaniesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/drive_company/get/drive/${driveId}`
    );
    if (!driveCompaniesResponse.ok) throw new Error('Failed to fetch drive companies');
    const companyIds = await driveCompaniesResponse.json();

    // Fetch company details and jobs for each company ID
    const companies = await Promise.all(
      companyIds.map(async (companyId: string) => {
        // Fetch company details
        const companyResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/company/get/${companyId}`
        );
        if (!companyResponse.ok) throw new Error('Failed to fetch company details');
        const company: Company = await companyResponse.json();

        // Fetch jobs for this company in this drive
        const jobsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/job/get/drivecompany/${driveId}/${companyId}`
        );
        if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
        const jobs: Job[] = await jobsResponse.json();

        // Fetch requirements for each job
        const jobsWithRequirements = await Promise.all(
          jobs.map(async (job) => {
            const requirementResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/requirements/get/job/${job._id}`
            );
            if (!requirementResponse.ok) throw new Error('Failed to fetch requirement');
            const requirements: Requirement[] = await requirementResponse.json();
            
            return {
              ...job,
              requirements: requirements[0] // Assuming one requirement per job
            };
          })
        );

        return {
          ...company,
          jobs: jobsWithRequirements
        };
      })
    );

    return {
      ...drive,
      companies
    };
  } catch (error) {
    console.error('Error fetching drive details:', error);
    throw error;
  }
};

// export const applyToDriveAPI = async (driveId: string, studentId: string) => {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/drive/apply/${driveId}/${studentId}`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       }
//     );

//     if (!response.ok) throw new Error('Failed to apply to drive');
//     return await response.json();
//   } catch (error) {
//     console.error('Error applying to drive:', error);
//     throw error;
//   }
// };

export const applyToJobAPI = async (
  jobId: string,
  studentId: string,
  driveId: string,
  companyId: string,
  resumeFile: File | null,
  savedResumeId?: string
) => {
  try {
    // Create payload object first
    const payload: Partial<JobApplication> = {
      job_id: jobId,
      student_id: studentId,
      drive_id: driveId,
      company_id: companyId
    };

    // Add saved_resume if present
    if (savedResumeId) {
      payload.saved_resume = savedResumeId;
    }

    // If we have a resume file, use FormData
    if (resumeFile) {
      const formData = new FormData();
      // Add all payload fields to FormData
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      // Add the file last
      formData.append('resume', resumeFile);

      console.log("Sending FormData payload with file");
      
      return await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/job-applications/add`,
        {
          method: 'POST',
          body: formData, // Don't set Content-Type header - browser will set it with boundary
        }
      );
    } else {
      // No file, send JSON payload
      console.log("Sending JSON payload:", payload);
      
      return await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/job-applications/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
    }

  } catch (error) {
    console.error('API Error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to apply to job');
  }
};

export const getStudentApplicationsAPI = async (studentId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job-applications/get/student/${studentId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch student applications');
  }

  return response.json();
};

// Company APIs
export const fetchCompaniesAPI = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/get`);
  if (!response.ok) {
    throw new Error('Failed to fetch companies');
  }
  return response.json();
};

// Drive Company APIs
export const fetchCompaniesByDriveAPI = async (driveId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive_company/get/drive/${driveId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch companies for drive');
  }
  return response.json();
};

// Job APIs
export const fetchJobsByDriveAPI = async (driveId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/get/drive/${driveId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  return response.json();
};

export const fetchJobsByCompanyAPI = async (companyId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/get/company/${companyId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch jobs for company');
  }
  return response.json();
};

export const fetchJobsByDriveCompanyAPI = async (driveId: string, companyId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/get/drivecompany/${driveId}/${companyId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch jobs for drive and company');
  }
  return response.json();
};

// Requirement APIs
export const fetchRequirementsByJobAPI = async (jobId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/requirements/get/job/${jobId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch requirements');
  }
  return response.json();
};

export const fetchRequirementAPI = async (requirementId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/requirements/get/${requirementId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch requirement details');
  }
  return response.json();
};

// Resume APIs
export const createResumeAPI = async (resume: Resume, studentId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/resume/create/${studentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resume),
  });

  if (!response.ok) {
    throw new Error('Failed to create resume');
  }
  return response.json();
};

export const getResumeAPI = async (resumeId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/resume/${resumeId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch resume');
  }
  return response.json();
};

export const getStudentResumesAPI = async (studentId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/resume/student/${studentId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch student resumes');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : []; // Always return an array, empty if no resumes
};

export const updateResumeAPI = async (resumeId: string, resume: Partial<Resume>) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/resume/update/${resumeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resume),
  });

  if (!response.ok) {
    throw new Error('Failed to update resume');
  }
  return response.json();
};

export const deleteResumeAPI = async (resumeId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/resume/${resumeId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete resume');
  }
  return response.json();
};

export const downloadResumeAPI = async (resumeId: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/resume/download/${resumeId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to download resume');
    }

    // Ensure we're getting a PDF
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error('Invalid response format');
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error downloading resume:', error);
    throw error;
  }
};

export const prefillGoogleFormAPI = async (formUrl: string, studentData: PrefillData) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/prefill-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formUrl,
        userData: studentData
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to prefill form');
    }

    const { prefilledUrl } = await response.json();
    return prefilledUrl;
  } catch (error) {
    console.error('Error prefilling form:', error);
    throw error;
  }
};

export const fetchStudentApplicationByDriveAndJobAPI = async (
  studentId: string,
  driveId: string,
  jobId: string
): Promise<ApplicationForm | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/applications-form/student/${studentId}/drive/${driveId}/job/${jobId}`
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch application');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const submitApplicationFormAPI = async (
    applicationData: ApplicationForm,
    studentId: string
): Promise<{ data: ApplicationForm }> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/applications-form/submit/${studentId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(applicationData),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to submit application');
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error('API Error:', error);
        throw error instanceof Error 
            ? error 
            : new Error('Failed to submit application form');
    }
};

export const getJobApplicationAPI = async (jobId: string, studentId: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/job-applications/job-student/${jobId}/${studentId}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch job application');
    }

    return await response.json();
}