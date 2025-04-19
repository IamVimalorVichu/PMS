'use client';
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, Tab, Switch, Button } from "@heroui/react";
import GeneralDetailsTab from "../components/GeneralDetailsTab";
import CompanyDetailsTab from "../components/CompanyDetailsTab";
import JobDetailsTab from "../components/JobDetailsTab";
import AddCompanyModal from "../components/AddCompanyModal";
import AddJobModal from "../components/AddJobModal";
import RequirementsModal from "../components/RequirementsModal";
import PublishDriveModal from "../components/PublishDriveModal";
import ViewEligibleStudentsModal from "../components/ViewEligibleStudentsModal";
import { Job } from "../components/types";
import { useDriveManagement } from "../components/useDriveManagement";

export default function Edit() {
    const [addCompanyModal, setAddCompanyModal] = useState(false);
    const [addJobModal, setAddJobModal] = useState(false);
    const [requirementModal, setRequirementModal] = useState(false);
    const [publishDriveModal, setPublishDriveModal] = useState(false);
    const [viewEligibleStudentsModal, setViewEligibleStudentsModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const driveManagement = useDriveManagement();
    const {
        drive,
        title, setTitle,
        location, setLocation,
        drive_companies,
        all_companies,
        jobs,
        drive_id, setDriveId,
        driveform_link, setDriveFormLink,
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
        job_id, setJobId,
        company_id,setCompanyId,
        companyDesc, setCompanyDesc,
        companyName, setCompanyName,
        jobTitle, setJobTitle,
        jobExperience, setJobExperience,
        branch, setBranch,
        fetchCompleteDrive,
        desc, setDesc,
        jobform_link, setJobFormLink,
        jobDesc, setJobDesc,
        jobLocation, setJobLocation,
        jobSalary, setJobSalary,
        joinDate, setJoinDate,
        lastDate, setLastDate,
        contactPerson, setContactPerson,
        contactEmail, setContactEmail,
        job_additional_instructions, setJobInstructions,
        site, setSite,
        email, setEmail,
        ph_no, setPhNo,
        drive_date, setDriveDate,
        application_deadline, setApplicationDeadline,
        additional_instructions, setAdditionalInstructions,
        stages, setStages,
        driveProgress,
        companyProgressList,
        jobProgressList,
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

    // Add state for edit/preview mode

    useEffect(() => {
        if (!id) return;
        
        setDriveId(id);
        fetchCompleteDrive(id)
            .then(() => setIsLoading(false))
            .catch((error) => {
                console.error("Error loading drive:", error);
                setIsLoading(false);
            });
             // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, setDriveId]);

    if (isLoading) {
        return <div>Loading drive details...</div>;
    }

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
        },
        publish: {
            close: () => setPublishDriveModal(false),
            open: () => setPublishDriveModal(true),
            submit: () => {
                // startPublishingDrive();
                setPublishDriveModal(false);
            }
        },
        viewEligibleStudents: {
            close: () => setViewEligibleStudentsModal(false),
            open: () => setViewEligibleStudentsModal(true)
        }
    };

    const publishDriveModalProps = {
            isOpen: publishDriveModal,
            onClose: modalHandlers.publish.close,
             drive_id, // Pass drive_id
             drivetitle: title, // Pass drive title for display
           jobs: jobs as Job[] | undefined, // Pass jobs, ensure type matches
           onPublishDrive: async (finalMap: Record<string, string[]>) => {
            if (drive_id) {
              try {
                  // Directly call the modified handlePublishDrive from the hook
                  await driveManagement.handlePublishDrive(drive_id, finalMap); 
                  setPublishDriveModal(false); // Close on success
              } catch (publishError) {
                  console.error("Publish failed in page:", publishError); 
               setPublishDriveModal(false); // Close modal after attempting publish
              }
           }},
    
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
        isUpdateMode: !!id,
        onSave: !!id ? startUpdatingDrive : startAddingDrive,
        onDelete: startDeletingDrive,
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
        setCompanyDesc
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
        desc: jobDesc,
        form_link: jobform_link,
        setFormLink: setJobFormLink
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
        site,
        setSite,
        email,
        setEmail,
        ph_no,
        setPhNo,
        desc: companyDesc,
        setDesc,
        companyProgressList,
        setCompanyDesc,
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
        jobDesc,
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
        jobProgressList,
        desc: jobDesc,
        onAddRequirement: modalHandlers.requirement.open,
        form_link: jobform_link,
        setFormLink: setJobFormLink,
    };


    return (
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-end items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
            <Switch
                defaultSelected
                size="sm"
                color="primary"
                thumbIcon={({ isSelected }) => 
                    isSelected ? (
                    "Edit"
                    ) : (
                    "Preview"
                    )
                }
                onValueChange={setIsEditMode}
                >
                {isEditMode ? "Edit" : "Preview"}
                </Switch>
              
                {!drive?.published ? (
                <Button 
                  color="primary" 
                  variant="solid"
                  onPress={modalHandlers.publish.open}
                >
                  Publish Drive
                </Button>
                ) : drive?.drive_date && new Date(drive.drive_date) > new Date() ? (
                <Button 
                  color="primary" 
                  variant="solid"
                  onPress={modalHandlers.viewEligibleStudents.open}
                >
                  View Eligible Students
                </Button>
                ) : (
                <Button 
                  color="primary" 
                  variant="solid"
                  onPress={() => console.log("Manage phases")}
                >
                  Manage Phases
                </Button>
                )}
            </div>
          </div>
          
          <AddCompanyModal {...addCompanyModalProps} />
          <AddJobModal {...addJobModalProps} />
          <RequirementsModal {...requirementModalProps} />
          <PublishDriveModal {...publishDriveModalProps} />
          <ViewEligibleStudentsModal 
            isOpen={viewEligibleStudentsModal}
            onClose={modalHandlers.viewEligibleStudents.close}
            driveId={drive_id || ""}
          />
      
          <Tabs 
            aria-label="Drive details"
            size="lg"
            color="primary"
            selectedKey={selected}
            onSelectionChange={(key) => setSelectedState(key.toString())}
            disabledKeys={disabled}
            classNames={{
              tabList: "flex items-center gap-4 border-b pb-2 mt-4",
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

