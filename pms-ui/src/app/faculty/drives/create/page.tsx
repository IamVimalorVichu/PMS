'use client';
import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import GeneralDetailsTab from "../components/GeneralDetailsTab";
import CompanyDetailsTab from "../components/CompanyDetailsTab";
import JobDetailsTab from "../components/JobDetailsTab";
import AddCompanyModal from "../components/AddCompanyModal";
import AddJobModal from "../components/AddJobModal";
import RequirementsModal from "../components/RequirementsModal";
import { useDriveManagement } from "../components/useDriveManagement";

export default function Create() {
    const [addCompanyModal, setAddCompanyModal] = useState(false);
    const [addJobModal, setAddJobModal] = useState(false);
    const [requirementModal, setRequirementModal] = useState(false);

    const driveManagement = useDriveManagement();
    const {
        drive,
        title, setTitle,
        desc, setDesc,
        location, setLocation,
        drive_date, setDriveDate,
        application_deadline, setApplicationDeadline,
        additional_instructions, setAdditionalInstructions,
        drive_companies,
        all_companies,
        jobs,
        disabled,
        selected, setSelected: setSelectedState,
        startAddingDrive,
        startUpdatingDrive,
        startDeletingDrive,
        startAddingCompany,
        startUpdatingCompany,
        startDeletingCompany,
        startAddingJob,
        startUpdatingJob,
        startDeletingJob,
        driveform_link, setDriveFormLink,
        drive_id,
        job_id, setJobId,
        company_id, setCompanyId,
        companyName, setCompanyName,
        companyDesc, setCompanyDesc,
        jobTitle, setJobTitle,
        jobExperience, setJobExperience,
        jobDesc, setJobDesc,
        jobLocation, setJobLocation,
        jobSalary, setJobSalary,
        joinDate, setJoinDate,
        lastDate, setLastDate,
        job_additional_instructions, setJobInstructions,
        jobform_link, setJobFormLink,
        contactPerson, setContactPerson,
        contactEmail, setContactEmail,
        site, setSite,
        email, setEmail,
        ph_no, setPhNo,
        branch, setBranch,
        stages, setStages,
        jobProgressList,
        companyProgressList,
        driveProgress,
        sslcCgpa, setSslcCgpa,
        plustwoCgpa, setPlustwoCgpa,
        degreeCgpa, setDegreeCgpa,
        mcaCgpa, setMcaCgpa,
        contract, setContract,
        additionalCriteria, setAdditionalCriteria,
        skillsRequired, setSkillsRequired,
        skillInput, setSkillInput,
        preferredQualifications, setPreferredQualifications,
        requiredCertifications, setRequiredCertifications,
        languageRequirements, setLanguageRequirements,
        startAddingRequirement,
    } = driveManagement;

    const modalHandlers = {
        company: {
            close: () => setAddCompanyModal(false),
            open: () => setAddCompanyModal(true),
            submit: () => {
                startAddingCompany();
                setAddCompanyModal(false);
            }
        },
        job: {
            close: () => setAddJobModal(false),
            open: () => setAddJobModal(true),
            submit: () => {
                startAddingJob();
                setAddJobModal(false);
            }
        },
        requirement: {
            close: () => setRequirementModal(false),
            open: () => setRequirementModal(true),
            submit: () => {
                startAddingRequirement();
                setRequirementModal(false);
            }
        }
    };

    const generalDetailsProps = {
        drive,
        drive_id,
        title,
        setTitle,
        desc,
        setDesc,
        location,
        setLocation,
        drive_date,
        setDriveDate,
        application_deadline,
        setApplicationDeadline,
        additional_instructions,
        setAdditionalInstructions,
        onSaveDrive: startAddingDrive,
        onUpdateDrive: startUpdatingDrive,
        onDeleteDrive: startDeletingDrive,
        stages, 
        setStages,
        isUpdateMode: !!drive,
        onSave: startAddingDrive,
        driveProgress,
        form_link: driveform_link,
        setFormLink: setDriveFormLink,
    };

    const addCompanyModalProps = {
        isOpen: addCompanyModal,
        onClose: modalHandlers.company.close,
        onAddCompany: modalHandlers.company.submit,
        companyName,
        setCompanyName,
        all_companies,
        branch,
        setBranch,
        site,
        setSite,
        email,
        setEmail,
        ph_no,
        setPhNo,
        desc: companyDesc,
        setCompanyDesc,
    };

    const addJobModalProps = {
        isOpen: addJobModal,
        onClose: modalHandlers.job.close,
        onAddJob: modalHandlers.job.submit,
        drive_companies,
        jobTitle,
        setJobTitle,
        jobExperience,
        setJobExperience,
        desc: jobDesc,
        setJobDesc,
        jobLocation,
        setJobLocation,
        jobSalary,
        setJobSalary,
        joinDate,
        setJoinDate,
        lastDate,
        setLastDate,
        contactPerson,
        setContactPerson,
        contactEmail,
        setContactEmail,
        additional_instructions: job_additional_instructions,
        setAdditionalInstructions: setJobInstructions,
        form_link: jobform_link,
        setFormLink: setJobFormLink,
    };

    const requirementModalProps = {
        isOpen: requirementModal,
        onClose: modalHandlers.requirement.close,
        jobId: job_id,
        sslcCgpa,
        setSslcCgpa,
        plustwoCgpa,
        setPlustwoCgpa,
        degreeCgpa,
        setDegreeCgpa,
        mcaCgpa,
        setMcaCgpa,
        contract,
        setContract,
        additionalCriteria,
        setAdditionalCriteria,
        skillsRequired,
        setSkillsRequired,
        skillInput,
        setSkillInput,
        preferredQualifications,
        setPreferredQualifications,
        requiredCertifications,
        setRequiredCertifications,
        languageRequirements,
        setLanguageRequirements,
        onAddRequirement: modalHandlers.requirement.submit
    };

    const companyDetailsProps = {
        drive_companies,
        onAddCompany: modalHandlers.company.open,
        onUpdateCompany: startUpdatingCompany,
        onDeleteCompany: startDeletingCompany,
        company_id,
        setCompanyId,
        companyName,
        setCompanyName,
        branch,
        setBranch,
        companyProgressList,
        site,
        setSite,
        email,
        setEmail,
        ph_no,
        setPhNo,
        desc: companyDesc,
        setCompanyDesc
    };

    const jobDetailsProps = {
        drive_companies,
        onAddJob: modalHandlers.job.open,
        onUpdateJob: startUpdatingJob,
        onDeleteJob: startDeletingJob,
        jobs: jobs ?? [],
        job_id,
        setJobId,
        company_id,
        setCompanyId,
        jobTitle,
        setJobTitle,
        jobExperience,
        setJobExperience,
        jobProgressList,
        desc: jobDesc, 
        setJobDesc,
        jobLocation,
        setJobLocation,
        jobSalary,
        setJobSalary,
        joinDate,
        setJoinDate,
        lastDate,
        setLastDate,
        contactPerson,
        setContactPerson,
        contactEmail,
        setContactEmail,
        additional_instructions: job_additional_instructions,
        setAdditionalInstructions: setJobInstructions,
        onAddRequirement: modalHandlers.requirement.open,
        form_link: jobform_link,
        setFormLink: setJobFormLink,
    };

    return (
        <div className="flex flex-col items-center">
            <AddCompanyModal {...addCompanyModalProps} />
            <AddJobModal {...addJobModalProps} />
            <RequirementsModal {...requirementModalProps} />
            
            <Tabs 
                aria-label="Drive details"
                variant="underlined"
                size="lg"
                color="primary"
                selectedKey={selected}
                onSelectionChange={(key) => setSelectedState(key.toString())}
                disabledKeys={disabled}
                classNames={{
                    tabList: "flex items-center gap-4 border-b pb-2",
                }}
            >
                <Tab key="general" title="General Details">
                    <GeneralDetailsTab {...generalDetailsProps} />
                </Tab>

                <Tab key="Companies" title="Company Details">
                    <CompanyDetailsTab {...companyDetailsProps} />
                </Tab>

                <Tab key="Jobs" title="Job Details">
                    <JobDetailsTab {...jobDetailsProps} />
                </Tab>
            </Tabs>
        </div>
    );
}
