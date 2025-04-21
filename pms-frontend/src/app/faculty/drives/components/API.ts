//API.ts
import { Drive, Company, Job, Requirement, DriveFormUpdate } from "./types";
import { Performance, Student } from "@/app/students/components/types";

export const fetchStudentsAPI = async (): Promise<Student[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student/get`, {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const fetchEligibleStudentsforJobAPI = async (job_id: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/${job_id}/eligible-students`, {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};
export const fetchCompaniesAPI = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/get`, {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const fetchCompaniesByDriveAPI = async (driveId: string) => {

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive_company/get/drive/${driveId}`, {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};


// driveAPI.ts
export const addDriveAPI = async (drive: Partial<Drive>) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(drive),
    });

    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};
    
export const fetchDriveByIdAPI = async (driveId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive/get/${driveId}`, {
        method: "GET",
    });
    
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    
    return await response.json();
};

export const updateDriveAPI = async (driveId: string, drive: Partial<Drive>) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive/update/${driveId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(drive),
    });

    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};


export const deleteDriveAPI = async (driveId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive/delete/${driveId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

    
export const addCompanyAPI = async (company: Partial<Company>) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(company),
    });
    
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const updateCompanyAPI = async (companyId: string, company: Partial<Company>) => {
	console.log("this api did get called");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/update/${companyId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(company),
    });
    
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const addDriveCompanyAPI = async (driveId: string, companyId: string) => {
    const newDriveCompany = {
        drive_id: driveId,
        company_id: companyId,
    };
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive_company/add/${driveId}/${companyId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newDriveCompany),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned with an error: ${response.status} - ${errorText}`);
    }
    return await response.json();
};

export const deleteDriveCompanyByCompanyAPI = async (companyId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive_company/delete/company/${companyId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const deleteDriveCompanyByDriveAPI = async (driveId: string) => {

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive_company/delete/drive/${driveId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const fetchJobsByDriveAPI = async (driveId: string): Promise<Job[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/get/drive/${driveId}`, {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

// In API.ts
export const addJobAPI = async (driveId: string, companyId: string, job: Partial<Job>) => {
    console.log("Sending job data:", JSON.stringify(job));
    console.log(`To URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}/job/add/${driveId}/${companyId}`);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/add/${driveId}/${companyId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(job),
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server returned with an error: ${response.status} - ${errorText}`);
    }
    return await response.json();
};

export const updateJobAPI = async (jobId: string, job: Partial<Job>) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/update/${jobId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(job),
    });
    
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const deleteJobAPI = async (jobId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/delete/${jobId}`, {
        method: "DELETE",
    });
    
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const deleteJobByCompanyAPI = async (companyId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/delete/company/${companyId}`, {
        method: "DELETE",
    });
    
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const deleteJobByDriveAPI = async (driveId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/delete/drive/${driveId}`, {
        method: "DELETE",
    });
    
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const deleteJobByDriveCompanyAPI = async (driveId: string, companyId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/delete/drivecompany/${driveId}/${companyId}`, {
        method: "DELETE",
    });
    
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
}

// Requirement APIs
export const fetchRequirementsAPI = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/requirement/get`, {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const fetchRequirementByIdAPI = async (requirementId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/requirement/get/${requirementId}`, {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const fetchRequirementsByJobAPI = async (jobId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/requirements/get/job/${jobId}`, {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const addRequirementAPI = async (jobId: string, requirement: Partial<Requirement>) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/requirements/add/${jobId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requirement),
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const updateRequirementAPI = async (requirementId: string, requirement: Partial<Requirement>) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/requirements/update/${requirementId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requirement),
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const updateRequirementByJobAPI = async (jobId: string, requirement: Partial<Requirement>) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/requirements/update/job/${jobId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requirement),
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const deleteRequirementAPI = async (requirementId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/requirements/delete/${requirementId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const deleteRequirementByJobAPI = async (jobId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/requirements/delete/job/${jobId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};


export const publishDriveAPI = async (driveId: string) => {

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive/publish/${driveId}`, {
        method: "PATCH",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();

};

export const setEligibleStudentsforJobAPI = async (job_id: string, studentList: string[]) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/${job_id}/set-eligible`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(studentList),
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const fetchAllPerformancesAPI = async (): Promise<Performance[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/student-performance/get`); // Example endpoint
    if (!response.ok) {
        throw new Error(`Failed to fetch all performances: ${response.status}`);
    }
    return await response.json();
  };

export const updateStagesForJobAPI = async (jobId: string, stageStudents: string[][]) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/${jobId}/update-stage-students`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ stage_students: stageStudents }),
    });

    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};


export const confirmFinalSelectedStudentsAPI = async (jobId: string, selectedStudents: string[]) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/${jobId}/confirm-selected`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedStudents),
    });

    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};


export const fetchDriveFormTemplateAPI = async (drive_id: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive-forms/drive/${drive_id}`, {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};

export const upsertDriveFormTemplateAPI = async (driveId: string, formData: DriveFormUpdate) => {
    console.log("Sending form data:", JSON.stringify(formData));
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive-forms/${driveId}/update`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });
    if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
    }
    return await response.json();
};
