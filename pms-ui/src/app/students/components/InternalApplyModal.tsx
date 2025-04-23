import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Tabs, Tab, Spinner } from "@heroui/react";
import { useState } from "react";
import { ApplicationForm, Resume } from './types';
import ResumePreview from './ResumePreview';
import { FiDownload, FiEye } from 'react-icons/fi';
import { useStudentManagement } from "./useStudentManagement";
import ApplicationFormDisplay from './ApplicationFormDisplay';
import { submitApplicationFormAPI } from "./API";

interface InternalApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  onApply: (resumeFile: File | null, savedResumeId?: string) => void;
  driveId: string;
  jobId: string;
}


export function InternalApplyModal({ isOpen, onClose, jobTitle, onApply, driveId, jobId }: InternalApplyModalProps) {
  const [selectedTab, setSelectedTab] = useState("form");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [savedResumeId, setSavedResumeId] = useState<string | null>(null);

  const {
    resumes,
    resumeLoading,
    resumeError,
    student,
    loading: studentLoading
  } = useStudentManagement();

  // Handle preview in modal
  const handlePreviewClick = (resume: Resume) => {
    setPreviewResume(resume);
  };

  // Modified download function that returns the generated PDF blob
  const handleResumeSelect = (file: File | null) => {
    setResumeFile(file);
    setSavedResumeId(null); // Clear any selected saved resume
    if (file) {
      setSelectedTab("review");
    }
  };

  const handleDownloadAndSelect = async (resume: Resume) => {
    if (!resume || !resume._id) return;

    setSavedResumeId(resume._id);
    setSelectedResume(resume);
    setResumeFile(null); // Clear any uploaded file
    setSelectedTab("review");
  };

  const handleFormSubmitted = async (submission: ApplicationForm) => {
    // Move to the resume tab after form submission
    if (!student?._id) return;
    await submitApplicationFormAPI(submission, student._id);
    setSelectedTab("review");
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>Apply for {jobTitle}</ModalHeader>
          <ModalBody>
            <Tabs 
              selectedKey={selectedTab} 
              onSelectionChange={(key) => setSelectedTab(key.toString())}
            >
                <Tab key="form" title="Application Form">
                <div className="space-y-4 py-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  {studentLoading ? (
                  <div className="flex justify-center p-4">
                    <Spinner label="Loading student data..." />
                  </div>
                  ) : !student?._id ? (
                  <div className="text-center text-gray-600 p-4">
                    Student data not available. Please try again later.
                  </div>
                  ) : (
                  <ApplicationFormDisplay
                    driveId={driveId}
                    jobId={jobId}
                    studentId={student._id}
                    onSubmitted={handleFormSubmitted}
                    onCancel={() => onClose()}
                  />
                  )}
                </div>
                </Tab>
              <Tab key="review" title="Review & Submit">
                <div className="space-y-4 py-4">
                  <Tabs isVertical>
                    <Tab key="saved" title="Select from Saved Resume">
                      <div className="p-4">
                        {resumeLoading ? (
                          <p>Loading resumes...</p>
                        ) : resumeError ? (
                          <p className="text-red-500">{resumeError}</p>
                        ) : resumes.length === 0 ? (
                          <p className="text-sm text-gray-600">No saved resumes found.</p>
                        ) : (
                          <div className="space-y-4">
                            {resumes.map((resume) => (
                              <div 
                                key={resume._id}
                                className={`p-4 border rounded-lg ${selectedResume?._id === resume._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-medium">{resume.title || `${resume.first_name} ${resume.last_name}'s Resume`}</h3>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onPress={() => handlePreviewClick(resume)}
                                    >
                                      <FiEye /> Preview
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onPress={() => handleDownloadAndSelect(resume)}
                                    >
                                      <FiDownload /> Download
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Tab>
                    <Tab key="upload" title="Upload New Resume">
                      <div className="p-4">
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleResumeSelect(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-primary-50 file:text-primary-700
                              hover:file:bg-primary-100"
                          />
                        </div>
                        {resumeFile && (
                          <p className="text-sm text-gray-600 mt-2">
                            Selected: {resumeFile.name}
                          </p>
                        )}
                      </div>
                    </Tab>
                  </Tabs>
                </div>
              </Tab>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!resumeFile && !savedResumeId}
              onPress={() => {
                onApply(resumeFile, savedResumeId || undefined);
                onClose();
              }}
            >
              Submit Application
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Preview Modal */}
      <Modal 
        isOpen={!!previewResume} 
        onClose={() => setPreviewResume(null)}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Resume Preview</ModalHeader>
          <ModalBody>
            {previewResume && <ResumePreview formData={previewResume} />}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setPreviewResume(null)}>
              Close Preview
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}