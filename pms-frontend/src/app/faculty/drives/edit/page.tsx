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
import ViewEligibleStudentsModal from "../components/ViewEligibleStudentsModal"; // Import the view modal
import { Job } from "../components/types";
import { useDriveManagement } from "../components/useDriveManagement";
// No longer needed here if save logic is fully in the hook
// import { setEligibleStudentsforJobAPI } from "../components/API";

export default function Edit() {
    // --- State for Modals and UI ---
    const [addCompanyModal, setAddCompanyModal] = useState(false);
    const [addJobModal, setAddJobModal] = useState(false);
    const [requirementModal, setRequirementModal] = useState(false);
    const [publishDriveModal, setPublishDriveModal] = useState(false);
    const [viewEligibleStudentsModal, setViewEligibleStudentsModal] = useState(false); // State for the view modal
    const [isEditMode, setIsEditMode] = useState(true); // State for Edit/Preview mode
    const [isLoading, setIsLoading] = useState(true); // Loading state for initial drive fetch

    // --- Hooks ---
    const searchParams = useSearchParams();
    const id = searchParams.get("id"); // Get drive ID from URL

    // Main hook for managing drive, company, job data and actions
    const driveManagement = useDriveManagement();
    const {
        // Drive Data & Setters
        drive, // The fetched drive object (includes 'published' status)
        title, setTitle,
        desc, setDesc,
        location, setLocation,
        drive_date, setDriveDate,
        application_deadline, setApplicationDeadline,
        additional_instructions, setAdditionalInstructions,
        driveform_link, setDriveFormLink,
        stages, setStages,
        drive_id, setDriveId, // Current drive ID being edited/viewed

        // Company Data & Setters
        drive_companies, // Companies associated with this drive
        all_companies, // All companies (for AddCompanyModal dropdown)
        company_id, setCompanyId,
        companyName, setCompanyName,
        companyDesc, setCompanyDesc,
        branch, setBranch,
        site, setSite,
        email, setEmail,
        ph_no, setPhNo,

        // Job Data & Setters
        jobs, // Jobs associated with this drive
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

        // Requirement Data & Setters (likely used in RequirementsModal)
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

        // UI State from Hook
        disabled, // Which tabs might be disabled
        selected, setSelected: setSelectedState, // Currently selected tab

        // Action Triggers from Hook
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
        handlePublishDrive, // Function to handle the publish action (takes driveId, finalMap)

        // Data Fetching Function from Hook
        fetchCompleteDrive, // Function to fetch all drive details

        // Progress Indicators from Hook
        driveProgress,
        companyProgressList,
        jobProgressList,

    } = driveManagement;

    // --- Effects ---
    // Fetch drive data when component mounts or ID changes
    useEffect(() => {
        if (!id) {
            setIsLoading(false); // Stop loading if no ID
            return;
        }
        setDriveId(id); // Set the drive ID in the management hook
        setIsLoading(true); // Start loading
        fetchCompleteDrive(id)
            .catch((error) => {
                console.error("Error loading drive:", error);
                // Handle error display if needed
            })
            .finally(() => {
                setIsLoading(false); // Stop loading regardless of outcome
            });
             // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Dependency: only the id from URL

    // --- Loading State ---
    if (isLoading) {
        return <div className="text-center p-10">Loading drive details...</div>;
    }

    // --- Modal Handlers ---
    // Simple open/close handlers for each modal
    const modalHandlers = {
        company: {
            close: () => setAddCompanyModal(false),
            open: () => setAddCompanyModal(true),
            // Submit action is handled by the modal calling startAddingCompany via props
        },
        job: {
            close: () => setAddJobModal(false),
            open: () => setAddJobModal(true),
            // Submit action is handled by the modal calling startAddingJob via props
        },
        requirement: {
            close: () => setRequirementModal(false),
            open: () => setRequirementModal(true),
            // Submit action is handled by the modal calling startAddingRequirement via props
        },
        publish: { // Handler for the PublishDriveModal
            close: () => setPublishDriveModal(false),
            open: () => setPublishDriveModal(true),
        },
        viewEligibleStudents: { // Handler for the ViewEligibleStudentsModal
            close: () => {
                setViewEligibleStudentsModal(false);
                // Optional: Re-fetch drive data after closing the modal
                // This ensures the main page reflects any saved changes immediately
                if (drive_id) {
                     fetchCompleteDrive(drive_id);
                }
            },
            open: () => setViewEligibleStudentsModal(true)
        }
    };

    // --- Props for Modals ---

    // Props passed to the PublishDriveModal
    const publishDriveModalProps = {
            isOpen: publishDriveModal,
            onClose: modalHandlers.publish.close,
             drive_id, // Pass current drive ID
             driveName: title, // Pass current drive title
             jobs: jobs as Job[] | undefined, // Pass the list of jobs for this drive
             // Pass the function from useDriveManagement to handle the actual publish logic
             onPublishDrive: async (finalMap: Record<string, string[]>) => {
                if (drive_id) {
                  try {
                      // Call the publish function from useDriveManagement hook
                      await handlePublishDrive(drive_id, finalMap);
                      // Re-fetch data after successful publish to update drive status and potentially job lists
                      await fetchCompleteDrive(drive_id);
                      setPublishDriveModal(false); // Close modal on success
                  } catch (publishError) {
                      console.error("Publish failed in page:", publishError);
                      // Error will be displayed within the modal if caught there,
                      // or handle additional error display here if needed.
                      // Decide whether to close modal on error or not.
                      // setPublishDriveModal(false); // Example: Close even on error
                  }
               }
            },
    };

    // Props passed to the ViewEligibleStudentsModal
    const viewEligibleModalProps = {
        isOpen: viewEligibleStudentsModal,
        onClose: modalHandlers.viewEligibleStudents.close, // Use the handler that includes re-fetch
        driveId: drive_id, // Pass current drive ID (hook handles null)
        driveName: title, // Pass current drive title
        // onSaveChanges prop is REMOVED - save logic is now inside the hook/modal interaction
    };

    // Props for other modals and tabs (assuming these are correct)
    const addCompanyModalProps = { isOpen: addCompanyModal, onClose: modalHandlers.company.close, onAddCompany: startAddingCompany, companyName, setCompanyName, all_companies, branch, setBranch, site, setSite, email, setEmail, ph_no, setPhNo, desc: companyDesc, setCompanyDesc };
    const addJobModalProps = { isOpen: addJobModal, onClose: modalHandlers.job.close, onAddJob: startAddingJob, drive_companies, jobTitle, setJobTitle, jobExperience, setJobExperience, setJobDesc, jobLocation, setJobLocation, jobSalary, setJobSalary, joinDate, setJoinDate, lastDate, setLastDate, contactPerson, setContactPerson, contactEmail, setContactEmail, additional_instructions: job_additional_instructions, setAdditionalInstructions: setJobInstructions, desc: jobDesc, form_link: jobform_link, setFormLink: setJobFormLink };
    const requirementModalProps = { isOpen: requirementModal, onClose: modalHandlers.requirement.close, jobId: job_id, sslcCgpa, setSslcCgpa, plustwoCgpa, setPlustwoCgpa, degreeCgpa, setDegreeCgpa, mcaCgpa, setMcaCgpa, contract, setContract, additionalCriteria, setAdditionalCriteria, skillsRequired, setSkillsRequired, skillInput, setSkillInput, preferredQualifications, setPreferredQualifications, requiredCertifications, setRequiredCertifications, languageRequirements, setLanguageRequirements, onAddRequirement: startAddingRequirement };
    const generalDetailsProps = { drive, drive_id, title, setTitle, desc, setDesc, location, setLocation, drive_date, setDriveDate, application_deadline, setApplicationDeadline, additional_instructions, setAdditionalInstructions, onSaveDrive: startAddingDrive, onUpdateDrive: startUpdatingDrive, onDeleteDrive: startDeletingDrive, stages, setStages, isUpdateMode: !!id, onSave: !!id ? startUpdatingDrive : startAddingDrive, onDelete: startDeletingDrive, driveProgress, form_link: driveform_link, setFormLink: setDriveFormLink, isEditMode };
    const companyDetailsProps = { drive_companies, onAddCompany: modalHandlers.company.open, onUpdateCompany: startUpdatingCompany, onDeleteCompany: startDeletingCompany, company_id, setCompanyId, companyName, setCompanyName, branch, setBranch, site, setSite, email, setEmail, ph_no, setPhNo, desc: companyDesc, setCompanyDesc, companyProgressList, isEditMode };
    const jobDetailsProps = { drive_companies, onAddJob: modalHandlers.job.open, onUpdateJob: startUpdatingJob, onDeleteJob: startDeletingJob, jobs: jobs ?? [], job_id, setJobId, company_id, setCompanyId, jobTitle, setJobTitle, jobExperience, setJobExperience, jobDesc, setJobDesc, jobLocation, setJobLocation, jobSalary, setJobSalary, joinDate, setJoinDate, lastDate, setLastDate, contactPerson, setContactPerson, contactEmail, setContactEmail, additional_instructions: job_additional_instructions, setAdditionalInstructions: setJobInstructions, jobProgressList, desc: jobDesc, onAddRequirement: modalHandlers.requirement.open, form_link: jobform_link, setFormLink: setJobFormLink, isEditMode };


    // --- Render Component ---
    return (
        <div className="flex flex-col items-center p-4 md:p-6"> {/* Added padding */}
          {/* Top Control Bar */}
          <div className="w-full flex justify-end items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              {/* Edit/Preview Switch */}
              <Switch
                isSelected={isEditMode} // Bind to state
                size="sm"
                color="primary"
                thumbIcon={({ isSelected }) => isSelected ? "Edit" : "Preview" }
                onValueChange={setIsEditMode} // Update state on change
              >
                {isEditMode ? "Edit Mode" : "Preview Mode"}
              </Switch>

              {/* Conditional Buttons: Publish or View/Edit */}
              {!drive?.published ? (
                  // Show Publish button if drive is not published
                  <Button
                    color="primary"
                    variant="solid"
                    onPress={modalHandlers.publish.open} // Open Publish modal
                    disabled={isLoading || !drive_id} // Disable if loading or no drive ID
                  >
                    Publish Drive
                  </Button>
              ) : (
                  // Show View/Edit button if drive IS published
                  <Button
                    color="secondary" // Different style for published state action
                    variant="bordered"
                    onPress={modalHandlers.viewEligibleStudents.open} // Open View/Edit modal
                    disabled={isLoading || !drive_id} // Disable if loading or no drive ID
                  >
                    View/Edit Eligible Students
                  </Button>
                  // Optionally add "Manage Phases" button based on other conditions
                  // {drive?.drive_date && new Date(drive.drive_date) <= new Date() && (
                  //     <Button color="success" variant="solid" onPress={() => console.log("Manage phases")}>
                  //         Manage Phases
                  //     </Button>
                  // )}
              )}
            </div>
          </div>

          {/* Render Modals (Conditionally based on their state) */}
          {addCompanyModal && <AddCompanyModal {...addCompanyModalProps} />}
          {addJobModal && <AddJobModal {...addJobModalProps} />}
          {requirementModal && <RequirementsModal {...requirementModalProps} />}
          {publishDriveModal && <PublishDriveModal {...publishDriveModalProps} />}
          {/* Render the view/edit modal */}
          {viewEligibleStudentsModal && <ViewEligibleStudentsModal {...viewEligibleModalProps} />}

          {/* Main Content Tabs */}
          <Tabs
            aria-label="Drive details"
            size="lg"
            color="primary"
            selectedKey={selected}
            onSelectionChange={(key) => setSelectedState(key.toString())}
            // Disable tabs based on edit mode or initial disabled state from hook
            disabledKeys={isEditMode ? disabled : ["general", "Companies", "Jobs"]}
            classNames={{
              tabList: "flex flex-wrap items-center gap-4 border-b pb-2 mt-4", // Added flex-wrap
            }}
          >
            <Tab key="general" title="General Details">
              {/* Pass isEditMode down to child tabs */}
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