import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Tabs, Tab, Spinner, Chip } from "@heroui/react";
import ResumePreview from './ResumePreview';
import { useApplicationAndResume } from './useApplicationAndResume';
import { useState } from 'react';
import ApplicationFormPreview from './ApplicationFormPreview';

interface ApplicationAndResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  driveId: string;
  jobId: string;
  studentId: string;
  jobTitle: string;
}

export function ApplicationAndResumeModal({
  isOpen,
  onClose,
  driveId,
  jobId,
  studentId,
  jobTitle
}: ApplicationAndResumeModalProps) {
  const [activeTab, setActiveTab] = useState("application");
  
  const { application, resume, loading, error } = useApplicationAndResume({
    isOpen,
    driveId,
    jobId,
    studentId
  });

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalContent>
          <ModalBody className="flex items-center justify-center py-8">
            <Spinner size="lg" />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalContent>
          <ModalBody className="text-center py-8 text-red-600">
            {error}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Application Details - {jobTitle}</h3>
            {application && (
              <div className="flex gap-2 items-center">
                <Chip 
                  color={
                    application.status === 'Placed' ? 'success' :
                    application.status === 'Shortlisted' ? 'warning' :
                    application.status === 'Rejected' ? 'danger' :
                    'primary'
                  }
                >
                  {application.status}
                </Chip>
                <span className="text-sm text-gray-500">
                  Applied on: {new Date(application.applied_date!).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </ModalHeader>
        <ModalBody>
          <Tabs 
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
            <Tab key="application" title="Application Details">
              <div className="py-4">
                <h4 className="font-medium mb-2">Application Status</h4>
                <div className="space-y-2">
                  {application && (
                    <>
                      <p>Status: {application.status}</p>
                      <p>Applied Date: {new Date(application.applied_date!).toLocaleDateString()}</p>
                      {application.shortlisted_date && (
                        <p>Shortlisted Date: {new Date(application.shortlisted_date).toLocaleDateString()}</p>
                      )}
                      {application.rejected_date && (
                        <p>Rejected Date: {new Date(application.rejected_date).toLocaleDateString()}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Tab>
            <Tab key="form" title="Application Form">
              <div className="py-4">
                <ApplicationFormPreview
                  driveId={driveId}
                  jobId={jobId}
                  studentId={studentId}
                  jobTitle={jobTitle}
                />
              </div>
            </Tab>
            <Tab key="resume" title="Applied Resume">
              <div className="h-[600px] w-full overflow-y-auto">
                {application?.saved_resume && resume ? (
                  <ResumePreview formData={resume} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No resume found for this application
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}