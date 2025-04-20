import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Tabs, Tab } from "@heroui/react";
import { useState } from "react";

interface InternalApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  onApply: (resumeFile: File) => void;
}

export function InternalApplyModal({ isOpen, onClose, jobTitle, onApply }: InternalApplyModalProps) {
  const [selectedTab, setSelectedTab] = useState("form");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleResumeSelect = (file: File | null) => {
    setResumeFile(file);
    setSelectedTab("review");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Apply for {jobTitle}</ModalHeader>
        <ModalBody>
          <Tabs 
            selectedKey={selectedTab} 
            onSelectionChange={(key) => setSelectedTab(key.toString())}
          >
            <Tab key="form" title="Application Form">
              <div className="space-y-4 py-4">
                <div className="text-gray-600">
                  {/* Dummy form fields - can be expanded later */}
                  <p>Application form content will go here</p>
                </div>
                <div className="flex justify-end">
                  <Button
                    color="primary"
                    onPress={() => setSelectedTab("review")}
                  >
                    Choose Resume →
                  </Button>
                </div>
              </div>
            </Tab>
            <Tab key="review" title="Review & Submit">
              <div className="space-y-4 py-4">
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
                  <p className="text-sm text-gray-600">
                    Selected: {resumeFile.name}
                  </p>
                )}
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
            isDisabled={!resumeFile}
            onPress={() => {
              if (resumeFile) {
                onApply(resumeFile);
                onClose();
              }
            }}
          >
            Submit Application
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}