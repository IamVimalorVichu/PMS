// useDriveManagement.ts
'use client';
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  fetchDriveByIdAPI, fetchCompaniesAPI, fetchCompaniesByDriveAPI, 
  addDriveAPI, addCompanyAPI, updateCompanyAPI, addDriveCompanyAPI, 
  addJobAPI, fetchJobsByDriveAPI, updateJobAPI, deleteJobAPI, 
  deleteJobByDriveCompanyAPI, deleteJobByDriveAPI, deleteDriveAPI, 
  deleteDriveCompanyByCompanyAPI, deleteDriveCompanyByDriveAPI, 
  updateDriveAPI, addRequirementAPI, fetchRequirementsByJobAPI, updateRequirementAPI, 
  publishDriveAPI,
  fetchStudentsAPI,
  setEligibleStudentsforJobAPI,
} from "./API";

import { Drive, Company, Job, Requirement, ProgressTracker, ActionStates } from "./types";
import { Student } from "@/app/students/components/types";

export const useDriveManagement = () => {
    const router = useRouter();

    const [students, setStudents] = useState<Student[]>([]);
    
    // Drive states
    const [drive, setDrive] = useState<Drive | undefined>();
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [location, setLocation] = useState("");
    const [drive_date, setDriveDate] = useState<Date | null>(null);
    const [stages, setStages] = useState<string[]>([""]);
    const [application_deadline, setApplicationDeadline] = useState<Date | null>(null);
    const [additional_instructions, setAdditionalInstructions] = useState("");
    const [driveform_link, setDriveFormLink] = useState("");

    // Company states
    const [all_companies, setCompanies] = useState<Company[]>([]);
    const [drive_companies, setDriveCompanies] = useState<Company[]>([]);
    const [companyName, setCompanyName] = useState("");
    const [companyDesc, setCompanyDesc] = useState("");
    const [branch, setBranch] = useState("");
    const [site, setSite] = useState("");
    const [email, setEmail] = useState("");
    const [ph_no, setPhNo] = useState("");
    const [avg_salary, setAvgSalary] = useState<number>(0);

    // Job states
    const [jobs, setJobs] = useState<Job[] | undefined>();
    const [jobTitle, setJobTitle] = useState("");
    const [jobDesc, setJobDesc] = useState("");
    const [jobLocation, setJobLocation] = useState("");
    const [jobRequirement, setJobRequirement] = useState("");
    const [jobExperience, setJobExperience] = useState(0);
    const [jobSalary, setJobSalary] = useState(0);
    const [joinDate, setJoinDate] = useState<Date | null>(null);
    const [lastDate, setLastDate] = useState<Date | null>(null);
    const [contactPerson, setContactPerson] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [job_additional_instructions, setJobInstructions] = useState("");
    const [jobform_link, setJobFormLink] = useState("");

    // Requirement states
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [requirementDesc, setRequirementDesc] = useState("");
    const [requirement_id, setRequirementId] = useState("");
    
    // Additional requirement states
    const [sslcCgpa, setSslcCgpa] = useState(0);
    const [plustwoCgpa, setPlustwoCgpa] = useState(0);
    const [degreeCgpa, setDegreeCgpa] = useState(0);
    const [mcaCgpa, setMcaCgpa] = useState<number[]>([]);
    const [contract, setContract] = useState(0);
    const [additionalCriteria, setAdditionalCriteria] = useState("");
    const [skillsRequired, setSkillsRequired] = useState<string[]>([]);
    const [preferredQualifications, setPreferredQualifications] = useState<string[]>([]);
    const [requiredCertifications, setRequiredCertifications] = useState<string[]>([]);
    const [languageRequirements, setLanguageRequirements] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState("");

    // UI states
    const [selected, setSelected] = useState("general");
    const [disabled, setDisabled] = useState(["Companies", "Jobs"]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Action states
    const [actionStates, setActionStates] = useState<ActionStates>({
        addingDrive: false,
        updatingDrive: false,
        deletingDrive: false,
        addingCompany: false,
        updatingCompany: false,
        deletingCompany: false,
        addingJob: false,
        updatingJob: false,
        deletingJob: false,
        addingRequirement: false,
        updatingRequirement: false,
        deletingRequirement: false
    });

    // Entity IDs
    const [drive_id, setDriveId] = useState("");
    const [drive_company_ids, setDriveCompanyIds] = useState<string[]>([]);
    const [company_id, setCompanyId] = useState("");
    const [job_id, setJobId] = useState("");

    // Progress states
    const [companyProgressList, setCompanyProgressList] = useState<ProgressTracker[]>([]);
    const [jobProgressList, setJobProgressList] = useState<ProgressTracker[]>([]);
    const [driveProgress, setDriveProgress] = useState(0);

    // Helper functions
    const calculateDriveProgress = useCallback((drive: Partial<Drive>): number => {
        const requiredFields = ['title'];
        const optionalFields = ['desc', 'location', 'drive_date', 'stages', 'application_deadline', 'additional_instructions', 'form_link'];
        
        let progress = 0;
        const totalWeight = requiredFields.length * 2 + optionalFields.length;

        requiredFields.forEach(field => {
            const value = drive[field as keyof Drive];
            if (value && String(value).trim() !== '') progress += 2;
        });

        optionalFields.forEach(field => {
            const value = drive[field as keyof Drive];
            if (value) {
                if (Array.isArray(value)) {
                    if (value.some(item => item && String(item).trim() !== '')) progress += 1;
                } else if (value instanceof Date) {
                    progress += 1;
                } else if (String(value).trim() !== '') {
                    progress += 1;
                }
            }
        });
        
        return Math.min(100, Math.round((progress / totalWeight) * 100));
    }, []);

    const calculateCompanyProgress = useCallback((company: Company): number => {
        const requiredFields = ['name', 'branch'];
        const optionalFields = ['site', 'desc', 'email', 'ph_no'];
        
        let progress = 0;
        const totalWeight = requiredFields.length * 2 + optionalFields.length;

        requiredFields.forEach(field => {
            const value = company[field as keyof Company];
            if (value && String(value).trim() !== '') progress += 2;
        });

        optionalFields.forEach(field => {
            const value = company[field as keyof Company];
            if (value && String(value).trim() !== '') progress += 1;
        });
        
        return Math.min(100, Math.round((progress / totalWeight) * 100));
    }, []);

    const calculateJobProgress = useCallback((job: Job): number => {
        const requiredFields = ['title'];
        const optionalFields = ['desc', 'loc', 'salary', 'join_date', 'last_date', 'contact_person', 'contact_email', 'form_link'];
        
        let progress = 0;
        const totalWeight = requiredFields.length * 2 + optionalFields.length;

        requiredFields.forEach(field => {
            const value = job[field as keyof Job];
            if (value && (typeof value === 'number' || String(value).trim() !== '')) progress += 2;
        });

        optionalFields.forEach(field => {
            const value = job[field as keyof Job];
            if (value && (typeof value === 'number' || String(value).trim() !== '')) progress += 1;
        });
        
        return Math.min(100, Math.round((progress / totalWeight) * 100));
    }, []);

    // Fetch student data
    const handleFetchStudents = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetchStudentsAPI();
            if (!response) {
                throw new Error('No student data received');
            }
            setStudents(response);
        } catch (error) {
            console.error('Error in fetching students data:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch students data');
        } finally {
            setLoading(false);
        }
    }, []);

    const filterCompanies = useCallback(async () => {
        if (!drive_company_ids || !all_companies) {
            return;
        }
        
        const value = all_companies.filter((company: Company) => {
            if (company._id && drive_company_ids.length > 0 && company._id.toString) {
                const stringId = company._id.toString();
                return drive_company_ids.includes(stringId);
            }
            return company._id ? drive_company_ids.includes(company._id) : false;
        });
        
        setDriveCompanies(value);
    }, [all_companies, drive_company_ids]);

    const startAction = useCallback((actionName: keyof ActionStates) => {
        setActionStates(prev => ({ ...prev, [actionName]: true }));
    }, []);

    // API functions
    const fetchCompanies = useCallback(async () => {
        try {
            const data = await fetchCompaniesAPI();
            setCompanies(data);
        } catch (err: unknown) {
            console.error("Error fetching all_companies:", (err as Error).message);
            setError((err as Error).message);
        }
    }, []);
    const fetchCompaniesByDrive = useCallback(async (driveId: string) => {
        try {
            const data = await fetchCompaniesByDriveAPI(driveId);
            if (JSON.stringify(data) !== JSON.stringify(drive_company_ids)) {
                setDriveCompanyIds(data);
            }
            await filterCompanies();
        } catch (err: unknown) {
            setError((err as Error).message);
        }
    }, [drive_company_ids, filterCompanies]);

    const fetchRequirementsByJob = useCallback(async (jobId: string) => {
        try {
            const data = await fetchRequirementsByJobAPI(jobId);
            setRequirements(data);
            
            // If we have requirements data, set all the states with the first requirement
            if (data && data.length > 0) {
                const requirement = data[0];
                setJobExperience(requirement.experience_required || 0);
                setSslcCgpa(requirement.sslc_cgpa || 0);
                setPlustwoCgpa(requirement.plustwo_cgpa || 0);
                setDegreeCgpa(requirement.degree_cgpa || 0);
                setMcaCgpa(requirement.mca_cgpa || []);
                setContract(requirement.contract || 0);
                setAdditionalCriteria(requirement.additional_criteria || '');
                setSkillsRequired(requirement.skills_required || []);
                setPreferredQualifications(requirement.preferred_qualifications || []);
                setRequiredCertifications(requirement.required_certifications || []);
                setLanguageRequirements(requirement.language_requirements || []);
                setRequirementId(requirement._id || '');
            }
            
            return data;
        } catch (err: unknown) {
            console.error("Error fetching requirements:", (err as Error).message);
            setError((err as Error).message);
        }
    }, []);

    const fetchJobsByDrive = useCallback(async (driveId: string) => {
        try {
            const data = await fetchJobsByDriveAPI(driveId);
            setJobs(data);
            
            // For each job, fetch its requirements
            if (data && data.length > 0) {
                for (const job of data) {
                    await fetchRequirementsByJob(job._id);
                }
            }

            if (data) {
                const jobProgress = data.map((job: Job) => ({
                    id: job._id || '',
                    progress: calculateJobProgress(job)
                }));
                setJobProgressList(jobProgress);
            }
            return data;
        } catch (err: unknown) {
            console.error("Error fetching jobs by drive:", (err as Error).message);
            setError((err as Error).message);
        }
    }, [calculateJobProgress, fetchRequirementsByJob]);

    // Action handlers
    const handleAddDrive = useCallback(async () => {
        try {
            const driveData: Partial<Drive> = {
                title,
                ...(desc && { desc }),
                ...(location && { location }),
                ...(drive_date && { drive_date: drive_date.toISOString() }),
                ...(application_deadline && { application_deadline: application_deadline.toISOString() }),
                ...(additional_instructions && { additional_instructions }),
                ...(driveform_link && { form_link: driveform_link }),
                ...(stages && { stages }),
            };
            
            const data = await addDriveAPI(driveData);
            setDrive(data.data);
            setDriveId(data.data._id);
            setTitle(data.title);
            setDesc(data.desc);
            setLocation(data.location);
            setDriveDate(data.drive_date ? new Date(data.drive_date) : null);
            setApplicationDeadline(data.application_deadline ? new Date(data.application_deadline) : null);
            setAdditionalInstructions(data.additional_instructions);
            setDriveFormLink(data.form_link);
            setStages(data.data.stages || []);
            setSelected("Companies");
            
            return data;
        } catch (err: unknown) {
            console.error("Error in handleAddDrive:", (err as Error).message);
            setError((err as Error).message);
            throw err;
        }
    }, [
        title, desc, location, drive_date, application_deadline, 
        additional_instructions, driveform_link, stages
    ]);

    const handleUpdateDrive = useCallback(async (driveId: string) => {
        try {
            const driveData: Partial<Drive> = {
                ...(title && { title }),
                ...(desc && { desc }),
                ...(location && { location }),
                ...(drive_date && { drive_date: drive_date.toISOString() }),
                ...(application_deadline && { application_deadline }),
                ...(additional_instructions && { additional_instructions }),
                ...(driveform_link && { form_link: driveform_link }),
                stages: stages,
            };
            
            const data = await updateDriveAPI(driveId, driveData);
            setTitle(data.data.title);
            setDesc(data.data.desc);
            setLocation(data.data.location);
            setDriveDate(data.data.drive_date ? new Date(data.data.drive_date) : null);
            setApplicationDeadline(data.data.application_deadline ? new Date(data.data.application_deadline) : null);
            setDriveFormLink(data.data.form_link);
            setAdditionalInstructions(data.data.additional_instructions);
            setStages(data.data.stages || []);

            if(!jobs){
                setDisabled(["Jobs"]);
            }
            setSelected("Companies");
            return data;
        } catch (err: unknown) {
            console.error("Error in handleUpdateDrive:", (err as Error).message);
            setError((err as Error).message);
            throw err;
        }
    }, [
        title, desc, location, drive_date, application_deadline, 
        additional_instructions, driveform_link, stages, jobs
    ]);

    const handleDeleteCompaniesByDrive = useCallback(async (driveId: string) => {
        try {
            return await deleteDriveCompanyByDriveAPI(driveId);
        } catch (err: unknown) {
            console.error("Error in handleDeleteCompaniesByDrive:", (err as Error).message);
            setError((err as Error).message);
            throw err;
        }
    }, []);

    const handleDeleteJobsByDrive = useCallback(async (driveId: string) => {
        try {
            return await deleteJobByDriveAPI(driveId);
        } catch (err: unknown) {
            console.error("Error in handleDeleteJobsByDrive:", (err as Error).message);
            setError((err as Error).message);
            throw err;
        }
    }, []);

    const handleDeleteDrive = useCallback(async (driveId: string) => {
        try {
            await handleDeleteJobsByDrive(driveId);
            await handleDeleteCompaniesByDrive(driveId);
            const response = await deleteDriveAPI(driveId);
            
            // Reset all states
            setTitle("");
            setLocation("");
            setDisabled(["Companies","Jobs"]);
            setSelected("general");
            setDriveId("");
            setDesc("");
            setAdditionalInstructions("");
            setStages([]);
            setDriveDate(null);
            setApplicationDeadline(null);
            
            // Navigate to drives list page after successful deletion
            router.push("/faculty/drives");
            
            return response;
        } catch (err: unknown) {
            console.error("Error in handleDeleteDrive:", (err as Error).message);
            setError((err as Error).message);
            throw err;
        }
    }, [router, handleDeleteCompaniesByDrive, handleDeleteJobsByDrive]);

    const handleAddDriveCompany = useCallback(async (driveId: string, companyId: string) => {
        try {
            const data = await addDriveCompanyAPI(driveId, companyId);
            await fetchCompaniesByDrive(driveId);
            await filterCompanies();
            return data;
        } catch (err: unknown) {
            console.error("Error in handleAddDriveCompany:", (err as Error).message);
            setError((err as Error).message);
            throw err;
        }
    }, [fetchCompaniesByDrive, filterCompanies]);

    const handleAddCompany = useCallback(async () => {
        // Add a guard clause to prevent multiple submissions
        if (loading) return;
        
        try {
            setLoading(true); // Set loading state immediately
            
            // Validate required fields
            if (!companyName?.trim() || !branch?.trim()) {
                throw new Error('Company name and branch are required');
            }

            const companyData: Partial<Company> = {
                name: companyName.trim(),
                branch: branch.trim(),
                desc: companyDesc?.trim(),
                site: site?.trim(),
                email: email?.trim(),
                ph_no: ph_no?.trim(),
                avg_salary
            };
            
            const data = await addCompanyAPI(companyData);
            
            if (!data?._id) {
                throw new Error('Failed to create company');
            }
            
            setCompanyId(data._id);
            
            // Update progress immediately after adding
            const newProgress = calculateCompanyProgress(data);
            setCompanyProgressList(prev => [...prev, { id: data._id, progress: newProgress }]);
            
            // Only proceed with drive company association if we have both IDs
            if (data._id && drive_id) {
                await handleAddDriveCompany(drive_id, data._id);
                await fetchCompaniesByDrive(drive_id);
            }
            
            // Reset form
            setCompanyName("");
            setBranch("");
            setSite("");
            setEmail("");
            setPhNo("");
            setCompanyDesc("");
            setDisabled([]);
            setSelected("Jobs");
            
            return data;
        } catch (err: unknown) {
            console.error("Error in handleAddCompany:", (err as Error).message);
            setError((err as Error).message);
            throw err;
        } finally {
            setLoading(false); // Ensure loading state is reset
        }
    }, [
        loading,
        companyName,
        branch,
        companyDesc,
        site,
        email,
        ph_no,
        avg_salary,
        drive_id,
        calculateCompanyProgress,
        fetchCompaniesByDrive,
        handleAddDriveCompany
    ]);

    const handleUpdateCompany = useCallback(async (companyId: string) => {
        try {
            const currentCompany = drive_companies.find(company => company._id === companyId);
            if (!currentCompany) {
                throw new Error("Company not found");
            }

            const companyData: Partial<Company> = {
                name: companyName?.trim?.() || currentCompany.name,
                branch: branch?.trim?.() || currentCompany.branch,
                desc: companyDesc || currentCompany.desc,
                site: site?.trim?.() || currentCompany.site,
                email: email?.trim?.() || currentCompany.email,
                ph_no: ph_no?.trim?.() || currentCompany.ph_no,
            };

            const data = await updateCompanyAPI(companyId, companyData);
            await fetchCompanies();
            await fetchCompaniesByDrive(drive_id);
            setCompanyName(data.data.name);
            setBranch(data.data.branch);
            setSite(data.data.site);
            setEmail(data.data.email);
            setPhNo(data.data.ph_no);
            setCompanyDesc(data.data.desc);
            console.log(drive_companies);
            setDisabled([]);
            
            return data;
        } catch (err: unknown) {
            console.error("Error in handleUpdateCompany:", (err as Error).message);
            setError((err as Error).message);
            throw err;
        }
    }, [
        drive_companies, companyName, branch, companyDesc, site, email, 
        ph_no, drive_id, fetchCompaniesByDrive, fetchCompanies
    ]);

    const handleDeleteDriveCompanyByCompany = useCallback(async (companyId: string) => {
        try {
            return await deleteDriveCompanyByCompanyAPI(companyId);
        } catch (err: unknown) {
            console.error("Error in handleDeleteDriveCompanyByCompany:", (err as Error).message);
            setError((err as Error).message);
            throw err;
        }
    }, []);

    const handleAddJob = useCallback(async (driveId: string, companyId: string, jobTitle: string, jobExperience: number) => {
        if (loading) return;
    
        try {
            setLoading(true);
            
            // Validate required fields
            if (!jobTitle?.trim()) {
                throw new Error('Job title is required');
            }
    
            const jobData = {
                company: companyId,
                drive: driveId,
                title: jobTitle.trim(),
                experience: jobExperience || 0,
                desc: jobDesc?.trim(),
                loc: jobLocation?.trim(),
                requirement: jobRequirement?.trim(),
                salary: jobSalary || 0,
                ...(joinDate && { join_date: joinDate }),
                ...(lastDate && { last_date: lastDate }),
                contact_person: contactPerson?.trim(),
                contact_email: contactEmail?.trim(),
                form_link: jobform_link?.trim(),
                additional_instructions: job_additional_instructions?.trim()
            };
    
            const data = await addJobAPI(driveId, companyId, jobData);
            
            if (!data?._id) {
                throw new Error('Failed to create job');
            }
    
            // Update progress tracking
            const newProgress = calculateJobProgress(data);
            setJobProgressList(prev => [...prev, { id: data._id, progress: newProgress }]);
    
            // Reset form fields
            setJobTitle('');
            setJobDesc('');
            setJobLocation('');
            setJobRequirement('');
            setJobExperience(0);
            setJobSalary(0);
            setJoinDate(null);
            setLastDate(null);
            setContactPerson('');
            setContactEmail('');
            setJobInstructions('');
            setJobFormLink('');
    
            // Refresh jobs list
            await fetchJobsByDrive(driveId);
    
            return data;
        } catch (err: unknown) {
            console.error("Error in handleAddJob:", err);
            setError((err as Error).message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [
        loading,
        jobDesc,
        jobLocation,
        jobRequirement,
        jobSalary,
        joinDate,
        lastDate,
        contactPerson,
        contactEmail,
        jobform_link,
        job_additional_instructions,
        fetchJobsByDrive,
        calculateJobProgress
    ]);

    const handleUpdateJob = useCallback(async (jobId: string, jobTitle: string, jobExperience: number) => {
        try {
            const currentJob = jobs?.find(job => job._id === jobId);
            if (!currentJob) {
                throw new Error("Job not found");
            }

            const jobData: Partial<Job> = {
                title: jobTitle?.trim?.() === "" ? currentJob.title : jobTitle,
                experience: jobExperience ?? currentJob.experience,                
                desc: jobDesc?.trim?.() === "" ? currentJob.desc : jobDesc,
                loc: jobLocation?.trim?.() === "" ? currentJob.loc : jobLocation,
                salary: jobSalary ? jobSalary : currentJob.salary,
                join_date: !joinDate ? currentJob.join_date : joinDate,
                last_date: !lastDate ? currentJob.last_date : lastDate,
                contact_person: contactPerson?.trim?.() === "" ? currentJob.contact_person : contactPerson,
                contact_email: contactEmail?.trim?.() === "" ? currentJob.contact_email : contactEmail,
                form_link: jobform_link?.trim?.() === "" ? currentJob.form_link : jobform_link,
                additional_instructions: job_additional_instructions?.trim?.() === "" ? currentJob.additional_instructions : job_additional_instructions
            };

            const data = await updateJobAPI(jobId, jobData);
            await fetchJobsByDrive(drive_id);
            
            // Update form states with response data
            setJobTitle(data.title);
            setJobExperience(data.experience);
            setJobDesc(data.desc);
            setJobLocation(data.loc);
            setJobSalary(data.salary);
            setJoinDate(data.join_date);
            setLastDate(data.last_date);
            setContactPerson(data.contact_person);
            setContactEmail(data.contact_email);
            setJobInstructions(data.additional_instructions);
            setJobFormLink(data.form_link);
            setDisabled([]);
            
            return data;
        } catch (err: unknown) {
            console.error("Error in handleUpdateJob:", (err as Error).message);
            setError((err as Error).message);
            throw err;
        }
    }, [
        jobs, jobDesc, jobLocation, jobSalary, joinDate, lastDate,
        contactPerson, contactEmail, job_additional_instructions, 
        jobform_link, drive_id, fetchJobsByDrive
    ]);

    const handleDeleteJob = useCallback(async (jobId: string) => {
        try {
            const data = await deleteJobAPI(jobId);
            await fetchJobsByDrive(drive_id);
            setDisabled([]);
            return data;
        } catch (err: unknown) {
            console.error("Error in handleDeleteJob:", (err as Error).message);
            setError((err as Error).message);
            throw err;
        }
    }, [drive_id, fetchJobsByDrive]);

    const handleDeleteJobsByDriveCompany = useCallback(async (driveId: string, companyId: string) => {
        try {
            return await deleteJobByDriveCompanyAPI(driveId, companyId);
        } catch (err: unknown) {
            console.error("Error in handleDeleteJobsByDriveCompany:", (err as Error).message);
            setError((err as Error).message);
            throw err;
        }
    }, []);

    const handleUpdateRequirement = useCallback(async (requirementId: string) => {
        try {
            const currentRequirement = requirements.find(req => req._id === requirementId);

            if (!currentRequirement) {
                throw new Error("Requirement not found");
            }

            const requirementData: Partial<Requirement> = {
                job: currentRequirement.job,
                experience_required: Number(jobExperience) || 0,
                sslc_cgpa: Number(sslcCgpa) || 0,
                plustwo_cgpa: Number(plustwoCgpa) || 0,
                degree_cgpa: Number(degreeCgpa) || 0,
                mca_cgpa: mcaCgpa || [],
                contract: Number(contract) || 0,
                additional_criteria: additionalCriteria || '',
                skills_required: skillsRequired || [],
                preferred_qualifications: preferredQualifications || [],
                required_certifications: requiredCertifications || [],
                language_requirements: languageRequirements || []
            };

            const response = await updateRequirementAPI(requirementId, requirementData);

            if (!response) {
                throw new Error('No response from update API');
            }

            // Update local state with the response data
            setRequirementId(response._id);
            setSslcCgpa(response.sslc_cgpa);
            setPlustwoCgpa(response.plustwo_cgpa);
            setDegreeCgpa(response.degree_cgpa);
            setMcaCgpa(response.mca_cgpa || []);
            setContract(response.contract);
            setAdditionalCriteria(response.additional_criteria || '');
            setSkillsRequired(response.skills_required || []);
            setPreferredQualifications(response.preferred_qualifications || []);
            setRequiredCertifications(response.required_certifications || []);
            setLanguageRequirements(response.language_requirements || []);

            // Refresh requirements list
            await fetchRequirementsByJob(currentRequirement.job);
            
            return response;
        } catch (err: unknown) {
            console.error('Error in handleUpdateRequirement:', {
                message: (err as Error).message,
                stack: (err as Error).stack
            });
            setError((err as Error).message);
            throw err;
        }
    }, [
        requirements, jobExperience, sslcCgpa, plustwoCgpa, degreeCgpa, mcaCgpa,
        contract, additionalCriteria, skillsRequired, preferredQualifications,
        requiredCertifications, languageRequirements, fetchRequirementsByJob
    ]);

    const handleAddRequirement = useCallback(async (jobId: string) => {
        try {
            const existingRequirement = requirements.find(req => req.job === jobId);
            
            const requirementData: Partial<Requirement> = {
                job: jobId,
                experience_required: jobExperience,
                sslc_cgpa: sslcCgpa,
                plustwo_cgpa: plustwoCgpa,
                degree_cgpa: degreeCgpa,
                mca_cgpa: mcaCgpa,
                contract: contract,
                additional_criteria: additionalCriteria,
                skills_required: skillsRequired,
                preferred_qualifications: preferredQualifications,
                required_certifications: requiredCertifications,
                language_requirements: languageRequirements
            };
            
            let data;
            if (existingRequirement && existingRequirement._id) {
                await handleUpdateRequirement(existingRequirement._id);
            } else {
                data = await addRequirementAPI(jobId, requirementData);
            }
            
            if (data) {
                setRequirementId(data._id || '');
                setSslcCgpa(data.sslc_cgpa || 0);
                setPlustwoCgpa(data.plustwo_cgpa || 0);
                setDegreeCgpa(data.degree_cgpa || 0);
                setMcaCgpa(data.mca_cgpa || []);
                setContract(data.contract || 0);
                setAdditionalCriteria(data.additional_criteria || "");
                setSkillsRequired(data.skills_required || []);
                setPreferredQualifications(data.preferred_qualifications || []);
                setRequiredCertifications(data.required_certifications || []);
                setLanguageRequirements(data.language_requirements || []);
                setRequirementDesc(data.requirement_desc || "");
            }
            
            await fetchRequirementsByJob(jobId);
            return data;
        } catch (err: unknown) {
            console.error('Error in handleAddRequirement:', {
                message: (err as Error).message,
                stack: (err as Error).stack
            });
            setError((err as Error).message);
            throw err;
        }
    }, [
        requirements, jobExperience, sslcCgpa, plustwoCgpa, degreeCgpa, mcaCgpa,
        contract, additionalCriteria, skillsRequired, preferredQualifications,
        requiredCertifications, languageRequirements, fetchRequirementsByJob, handleUpdateRequirement
    ]);

    const handlePublishDrive = useCallback(async (driveId: string, finalStudentMap: Record<string, string[]>) => {
        setLoading(true); 
        setError(""); // Clear previous errors

        try {
            const jobUpdatePromises = Object.entries(finalStudentMap).map(([jobId, studentList]) => {
                console.log(`Updating job ${jobId} with eligible students:`, studentList);
                return setEligibleStudentsforJobAPI(jobId, studentList ); 
            });

            await Promise.all(jobUpdatePromises);
            console.log("All jobs updated successfully with eligible students.");

            console.log(`Publishing drive ${driveId}`);
            await publishDriveAPI(driveId); 
            console.log(`Drive ${driveId} published successfully.`);
        } catch (err: unknown) {
            console.error("Error during publishing process:", {
                message: (err as Error).message,
                stack: (err as Error).stack
            });
            setError(`Publishing failed: ${(err as Error).message}`);
            throw err; 
        } finally {
            setLoading(false);
        }
    }, [ setLoading, setError ]);

    const fetchCompleteDrive = useCallback(async (driveId: string) => {
        try {
            setLoading(true);
            
            const driveData = await fetchDriveByIdAPI(driveId);
            setDrive(driveData);
            setTitle(driveData.title);
            setLocation(driveData.location);
            setDesc(driveData.desc);
            setDriveDate(driveData.drive_date ? new Date(driveData.drive_date) : null);
            setApplicationDeadline(driveData.application_deadline ? new Date(driveData.application_deadline) : null);
            setAdditionalInstructions(driveData.additional_instructions);
            setDriveFormLink(driveData.form_link);
            setStages(driveData.stages || []);
            
            setDriveProgress(calculateDriveProgress(driveData));
            
            await fetchCompanies();
            await fetchCompaniesByDrive(driveId);
            
            await fetchJobsByDrive(driveId);
            
            setDisabled([]);
        } catch (err: unknown) {
            console.error("Error in fetchCompleteDrive:", {
                message: (err as Error).message,
                stack: (err as Error).stack
            });
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [
        calculateDriveProgress, fetchCompanies, 
        fetchCompaniesByDrive, fetchJobsByDrive
    ]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    useEffect(() => {
        if (drive_id) {
            fetchCompaniesByDrive(drive_id);
            fetchJobsByDrive(drive_id);
        }
    }, [drive_id, drive_company_ids, fetchCompaniesByDrive, fetchJobsByDrive]);

    useEffect(() => {
        let mounted = true;

        const handleActions = async () => {
            if (!mounted) return;
            
            try {
                setLoading(true);
                if (actionStates.addingCompany && drive_id) {
                    await handleAddCompany();
                    setActionStates(prev => ({ ...prev, addingCompany: false }));
                }
                if (actionStates.addingDrive) await handleAddDrive();
                if (actionStates.updatingDrive && drive_id) await handleUpdateDrive(drive_id);
                if (actionStates.deletingDrive && drive_id) await handleDeleteDrive(drive_id);
                if (actionStates.updatingCompany && company_id) await handleUpdateCompany(company_id);
                if (actionStates.deletingCompany && company_id) {
                    await handleDeleteJobsByDriveCompany(drive_id, company_id);
                    await handleDeleteDriveCompanyByCompany(company_id);
                    await fetchCompaniesByDrive(drive_id);
                }
                if (actionStates.addingJob && company_id) await handleAddJob(drive_id, company_id, jobTitle, jobExperience);
                if (actionStates.updatingJob && job_id) await handleUpdateJob(job_id, jobTitle, jobExperience);
                if (actionStates.deletingJob && job_id) await handleDeleteJob(job_id);
                if (actionStates.addingRequirement && job_id) await handleAddRequirement(job_id);
            } catch (err: unknown) {
                if (mounted) {
                    setError((err as Error).message);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
                setActionStates({
                    addingDrive: false,
                    updatingDrive: false,
                    deletingDrive: false,
                    addingCompany: false,
                    updatingCompany: false,
                    deletingCompany: false,
                    addingJob: false,
                    updatingJob: false,
                    deletingJob: false,
                    addingRequirement: false,
                    updatingRequirement: false,
                    deletingRequirement: false
                });
            }
        };

        if (Object.values(actionStates).some(state => state)) {
            handleActions();
        }

        return () => {
            mounted = false;
        };
    }, [
        actionStates, drive_id, company_id, job_id, jobTitle, jobExperience,
        handleAddDrive, handleUpdateDrive, handleDeleteDrive,
        handleAddCompany, handleUpdateCompany, handleDeleteJobsByDriveCompany,
        handleDeleteDriveCompanyByCompany, fetchCompaniesByDrive,
        handleAddJob, handleUpdateJob, handleDeleteJob, handleAddRequirement
    ]);

    useEffect(() => {
        const driveData = {
            title,
            desc,
            location,
            drive_date: drive_date || undefined,
            stages,
            application_deadline: application_deadline || undefined,
            additional_instructions,
            form_link: driveform_link || undefined
        };
        setDriveProgress(calculateDriveProgress(driveData));
    }, [
        title, desc, location, drive_date, stages, 
        application_deadline, additional_instructions, driveform_link, calculateDriveProgress
    ]);

    useEffect(() => {
        if (drive_companies) {
            const progressList = drive_companies.map(company => ({
                id: company._id || '',
                progress: calculateCompanyProgress(company)
            }));
            setCompanyProgressList(progressList);
        }
    }, [drive_companies, calculateCompanyProgress]);

    useEffect(() => {
        if (jobs) {
            const progressList = jobs.map(job => ({
                id: job._id || '',
                progress: calculateJobProgress(job)
            }));
            setJobProgressList(progressList);
        }
    }, [jobs, calculateJobProgress]);

    return {
        students, handleFetchStudents, 

        drive, setDrive,
        title, setTitle,
        desc, setDesc,
        location, setLocation,
        drive_date, setDriveDate,
        stages, setStages,
        application_deadline, setApplicationDeadline,
        additional_instructions, setAdditionalInstructions,
        driveform_link, setDriveFormLink,
        handlePublishDrive,

        drive_companies,
        all_companies,
        companyName, setCompanyName,
        companyDesc, setCompanyDesc,
        branch, setBranch,
        site, setSite,
        email, setEmail,
        ph_no, setPhNo,
        avg_salary, setAvgSalary,

        jobs, setJobs,
        jobTitle, setJobTitle,
        jobDesc, setJobDesc,
        jobLocation, setJobLocation,
        jobRequirement, setJobRequirement,
        jobExperience, setJobExperience,
        jobSalary, setJobSalary,
        joinDate, setJoinDate,
        lastDate, setLastDate,
        contactPerson, setContactPerson,
        contactEmail, setContactEmail,
        job_additional_instructions, setJobInstructions,
        jobform_link, setJobFormLink,

        requirements,
        requirementDesc, setRequirementDesc,
        requirement_id, setRequirementId,
        sslcCgpa, setSslcCgpa,
        plustwoCgpa, setPlustwoCgpa,
        degreeCgpa, setDegreeCgpa,
        mcaCgpa, setMcaCgpa,
        contract, setContract,
        additionalCriteria, setAdditionalCriteria,
        skillsRequired, setSkillsRequired,
        preferredQualifications, setPreferredQualifications,
        requiredCertifications, setRequiredCertifications,
        languageRequirements, setLanguageRequirements,
        skillInput, setSkillInput,
        
        drive_id, setDriveId,
        company_id, setCompanyId,
        job_id, setJobId,

        disabled,
        selected, setSelected,
        error,
        loading,

        startAddingDrive: () => startAction('addingDrive'),
        startUpdatingDrive: () => startAction('updatingDrive'),
        startDeletingDrive: () => startAction('deletingDrive'),
        startAddingCompany: () => startAction('addingCompany'),
        startUpdatingCompany: () => startAction('updatingCompany'),
        startDeletingCompany: () => startAction('deletingCompany'),
        startAddingJob: () => startAction('addingJob'),
        startUpdatingJob: () => startAction('updatingJob'),
        startDeletingJob: () => startAction('deletingJob'),
        startAddingRequirement: () => startAction('addingRequirement'),
        startUpdatingRequirement: () => startAction('updatingRequirement'),
        startDeletingRequirement: () => startAction('deletingRequirement'),
        
        fetchCompleteDrive,
        fetchRequirementsByJob,
        
        driveProgress,
        companyProgressList,
        jobProgressList,
        handleAddDrive
    };
};