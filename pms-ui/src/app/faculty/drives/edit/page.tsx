// page.tsx
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
// *** ADD DriveStatusModal Import ***
import DriveStatusModal from "../components/DriveStatusModal";
import { Job } from "../components/types";
import { useDriveManagement } from "../components/useDriveManagement";
import DriveFormTemplate from "../components/DriveFormTemplate";
import { upsertDriveFormTemplateAPI } from "../components/API";

export default function Edit() {
    // --- State for Modals and UI ---
    const [addCompanyModal, setAddCompanyModal] = useState(false);
    const [addJobModal, setAddJobModal] = useState(false);
    const [requirementModal, setRequirementModal] = useState(false);
    const [publishDriveModal, setPublishDriveModal] = useState(false);
    const [viewEligibleStudentsModal, setViewEligibleStudentsModal] = useState(false);
    // *** ADD State for Drive Status Modal ***
    const [driveStatusModalOpen, setDriveStatusModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // --- Hooks ---
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    // Main hook for managing drive data
    const driveManagement = useDriveManagement();
    const {
        drive,
        title, setTitle,
        desc, setDesc,
        location, setLocation,
        drive_date, setDriveDate,
        application_deadline, setApplicationDeadline,
        additional_instructions, setAdditionalInstructions,
        driveform_link, setDriveFormLink,
        stages, setStages,
        drive_id, setDriveId,
        drive_companies,
        all_companies,
        company_id, setCompanyId,
        companyName, setCompanyName,
        companyDesc, setCompanyDesc,
        branch, setBranch,
        site, setSite,
        email, setEmail,
        ph_no, setPhNo,
        jobs,
        job_id, setJobId,
        jobTitle, setJobTitle,
        jobDesc, setJobDesc,
        jobLocation, setJobLocation,
        jobExperience, setJobExperience,
        jobSalary, setJobSalary,
        joinDate, setJoinDate,
        lastDate, setLastDate,
        contactPerson, setContactPerson,
        contactEmail, setContactEmail,
        job_additional_instructions, setJobInstructions,
        jobform_link, setJobFormLink,
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
        startAddingRequirement,
        handlePublishDrive,
        fetchCompleteDrive,
        driveProgress,
        companyProgressList,
        jobProgressList,
    } = driveManagement;

    // --- Effects ---
    useEffect(() => {
        if (!id) {
            setIsLoading(false);
            return;
        }
        setDriveId(id);
        setIsLoading(true);
        fetchCompleteDrive(id)
            .catch((error) => console.error("Error loading drive:", error))
            .finally(() => setIsLoading(false));
             // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // --- Loading State ---
    if (isLoading) {
        return <div className="text-center p-10">Loading drive details...</div>;
    }

    // --- Modal Handlers ---
    const modalHandlers = {
        company: { close: () => setAddCompanyModal(false), open: () => setAddCompanyModal(true) },
        job: { close: () => setAddJobModal(false), open: () => setAddJobModal(true) },
        requirement: { close: () => setRequirementModal(false), open: () => setRequirementModal(true) },
        publish: { close: () => setPublishDriveModal(false), open: () => setPublishDriveModal(true) },
        viewEligibleStudents: {
            close: () => {
                setViewEligibleStudentsModal(false);
                if (drive_id) fetchCompleteDrive(drive_id); // Re-fetch on close
            },
            open: () => setViewEligibleStudentsModal(true)
        },
        // *** ADD Handler for Drive Status Modal ***
        driveStatus: {
            close: () => {
                setDriveStatusModalOpen(false);
                if (drive_id) fetchCompleteDrive(drive_id); // Re-fetch on close
            },
            open: () => setDriveStatusModalOpen(true)
        }
    };

    // --- Props for Modals ---
    const publishDriveModalProps = {
        isOpen: publishDriveModal,
        onClose: modalHandlers.publish.close,
        drive_id,
        driveName: title,
        jobs: jobs as Job[] | undefined,
        onPublishDrive: async (finalMap: Record<string, string[]>) => {
            if (drive_id) {
                try {
                    await handlePublishDrive(drive_id, finalMap);
                    await fetchCompleteDrive(drive_id); // Re-fetch after publish
                    setPublishDriveModal(false);
                } catch (publishError) {
                    console.error("Publish failed in page:", publishError);
                    // Decide on error handling UX
                }
            }
        },
    };

    const viewEligibleModalProps = {
        isOpen: viewEligibleStudentsModal,
        onClose: modalHandlers.viewEligibleStudents.close,
        driveId: drive_id,
        driveName: title,
    };

    // *** ADD Props for Drive Status Modal ***
    const driveStatusModalProps = {
        isOpen: driveStatusModalOpen,
        onClose: modalHandlers.driveStatus.close,
        driveId: drive_id,
        driveName: title,
        // No onSave prop needed
    };

    // Props for other modals and tabs (assuming these are correct)
    const addCompanyModalProps = { isOpen: addCompanyModal, onClose: modalHandlers.company.close, onAddCompany: startAddingCompany, companyName, setCompanyName, all_companies, branch, setBranch, site, setSite, email, setEmail, ph_no, setPhNo, desc: companyDesc, setCompanyDesc };
    const addJobModalProps = { isOpen: addJobModal, onClose: modalHandlers.job.close, onAddJob: startAddingJob, drive_companies, jobTitle, setJobTitle, jobExperience, setJobExperience, setJobDesc, jobLocation, setJobLocation, jobSalary, setJobSalary, joinDate, setJoinDate, lastDate, setLastDate, contactPerson, setContactPerson, contactEmail, setContactEmail, additional_instructions: job_additional_instructions, setAdditionalInstructions: setJobInstructions, desc: jobDesc, form_link: jobform_link, setFormLink: setJobFormLink };
    const requirementModalProps = { isOpen: requirementModal, onClose: modalHandlers.requirement.close, jobId: job_id, sslcCgpa, setSslcCgpa, plustwoCgpa, setPlustwoCgpa, degreeCgpa, setDegreeCgpa, mcaCgpa, setMcaCgpa, contract, setContract, additionalCriteria, setAdditionalCriteria, skillsRequired, setSkillsRequired, skillInput, setSkillInput, preferredQualifications, setPreferredQualifications, requiredCertifications, setRequiredCertifications, languageRequirements, setLanguageRequirements, onAddRequirement: startAddingRequirement };
    const generalDetailsProps = { drive, drive_id, title, setTitle, desc, setDesc, location, setLocation, drive_date, setDriveDate, application_deadline, setApplicationDeadline, additional_instructions, setAdditionalInstructions, onSaveDrive: startAddingDrive, onUpdateDrive: startUpdatingDrive, onDeleteDrive: startDeletingDrive, stages, setStages, isUpdateMode: !!id, onSave: !!id ? startUpdatingDrive : startAddingDrive, onDelete: startDeletingDrive, driveProgress, form_link: driveform_link, setFormLink: setDriveFormLink, isEditMode };
    const companyDetailsProps = { drive_companies, onAddCompany: modalHandlers.company.open, onUpdateCompany: startUpdatingCompany, onDeleteCompany: startDeletingCompany, company_id, setCompanyId, companyName, setCompanyName, branch, setBranch, site, setSite, email, setEmail, ph_no, setPhNo, desc: companyDesc, setCompanyDesc, companyProgressList, isEditMode };
    const jobDetailsProps = { drive_companies, onAddJob: modalHandlers.job.open, onUpdateJob: startUpdatingJob, onDeleteJob: startDeletingJob, jobs: jobs ?? [], job_id, setJobId, company_id, setCompanyId, jobTitle, setJobTitle, jobExperience, setJobExperience, jobDesc, setJobDesc, jobLocation, setJobLocation, jobSalary, setJobSalary, joinDate, setJoinDate, lastDate, setLastDate, contactPerson, setContactPerson, contactEmail, setContactEmail, additional_instructions: job_additional_instructions, setAdditionalInstructions: setJobInstructions, jobProgressList, desc: jobDesc, onAddRequirement: modalHandlers.requirement.open, form_link: jobform_link, setFormLink: setJobFormLink, isEditMode };

    // --- Helper to check if drive date has passed ---
    const hasDriveDatePassed = () => {
        if (!drive?.drive_date) return false; // If no date, assume not passed
        // Ensure drive_date is a Date object for comparison
        const driveDateObj = typeof drive.drive_date === 'string' ? new Date(drive.drive_date) : drive.drive_date;
        return driveDateObj <= new Date(); // Check if drive date is today or in the past
    };

    // --- Render Component ---
    return (
        <div className="flex flex-col items-center p-4 md:p-6">
          {/* Top Control Bar */}
          <div className="w-full flex justify-end items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              {/* Edit/Preview Switch */}
              <Switch
                isSelected={isEditMode}
                size="lg"
                color="primary"
                thumbIcon={({ isSelected }) => isSelected ? "Edit" : "Preview" }
                onValueChange={setIsEditMode}
              >
                {isEditMode ? "Edit Mode" : "Preview Mode"}
              </Switch>

              {/* Conditional Buttons */}
              {!drive?.published ? (
                  // Drive NOT published -> Show Publish Button
                  <Button
                    color="primary"
                    variant="solid"
                    onPress={modalHandlers.publish.open}
                    disabled={isLoading || !drive_id}
                  >
                    Publish Drive
                  </Button>
              ) : hasDriveDatePassed() ? (
                  // Drive IS published AND date has passed -> Show Update Status Button
                  <Button
                    color="primary" // Different color for status update
                    variant="ghost"
                    onPress={modalHandlers.driveStatus.open} // Open the new Drive Status modal
                    disabled={isLoading || !drive_id}
                  >
                    Update Drive Status
                  </Button>
              ) : (
                  // Drive IS published BUT date has NOT passed -> Show View/Edit Eligible Button
                  <Button
                    color="secondary"
                    variant="bordered"
                    onPress={modalHandlers.viewEligibleStudents.open}
                    disabled={isLoading || !drive_id}
                  >
                    View/Edit Eligible Students
                  </Button>
              )}
            </div>
          </div>

          {/* Render Modals */}
          {addCompanyModal && <AddCompanyModal {...addCompanyModalProps} />}
          {addJobModal && <AddJobModal {...addJobModalProps} />}
          {requirementModal && <RequirementsModal {...requirementModalProps} />}
          {publishDriveModal && <PublishDriveModal {...publishDriveModalProps} />}
          {viewEligibleStudentsModal && <ViewEligibleStudentsModal {...viewEligibleModalProps} />}
          {/* *** ADD Drive Status Modal Rendering *** */}
          {driveStatusModalOpen && <DriveStatusModal {...driveStatusModalProps} />}

          {/* Main Content Tabs */}
          <Tabs
            aria-label="Drive details"
            size="lg"
            color="primary"
            selectedKey={selected}
            onSelectionChange={(key) => setSelectedState(key.toString())}
            disabledKeys={isEditMode ? [] : ["general", "Companies", "Jobs", "FormTemplate"]}
            classNames={{
              tabList: "flex flex-wrap items-center gap-4 border-b pb-2 mt-4",
            }}
          >
            <Tab key="general" title="General Details">
              <GeneralDetailsTab {...generalDetailsProps} isPreviewMode={!isEditMode} />
            </Tab>
            <Tab key="Companies" title="Company Details">
              <CompanyDetailsTab {...companyDetailsProps} isPreviewMode={!isEditMode} />
            </Tab>
            <Tab key="Jobs" title="Job Details">
              <JobDetailsTab {...jobDetailsProps} isPreviewMode={!isEditMode} />
            </Tab>
            <Tab key="FormTemplate" title="Form Template">
              <DriveFormTemplate 
                  driveId={drive_id}
                  onSaveSuccess={(updatedTemplate) => {
                      // Optionally handle successful template save
                      // For example, show a success message or refresh drive data
                      if (drive_id) {
                          upsertDriveFormTemplateAPI(drive_id, updatedTemplate)
                              .then(() => {
                                  console.log("Template saved successfully");
                                  // Optionally refresh the drive data or show a success message
                              }
                              )
                              .catch((error) => {
                                  console.error("Error saving template:", error);
                                  // Optionally show an error message
                              }
                          );
                      }
                  }}
                  onCancel={() => {
                      // Optionally handle cancel
                      // For example, switch back to another tab
                      setSelectedState("general");
                  }}
                  isPreviewMode={!isEditMode}
              />
            </Tab>
          </Tabs>
        </div>
      );
}