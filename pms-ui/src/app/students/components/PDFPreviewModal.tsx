import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { useState } from "react";
import PDFViewer from "./PDFViewer";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  onDelete?: () => Promise<void>;
  showDelete?: boolean;
}

export default function PDFPreviewModal({ 
  isOpen, 
  onClose, 
  fileUrl, 
  fileName,
  onDelete,
  showDelete = false 
}: PDFPreviewModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
      onClose();
    }
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
        className="h-[90vh]"
      >
        <ModalContent className="h-full">
          <ModalHeader className="border-b flex justify-between items-center">
            <span>{fileName}</span>
          </ModalHeader>
          <ModalBody className="flex-1 p-0">
          
            <div className="h-full w-full">
              <PDFViewer fileUrl={fileUrl} fileName={fileName} />
            </div>
          </ModalBody>
          <ModalFooter className="border-t">
          {showDelete && (
              <Button
                size="sm"
                color="danger"
                variant="light"
                onPress={() => setConfirmDelete(true)}
              >
                Delete document
              </Button>
            )}
            <Button color="danger" variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal 
        isOpen={confirmDelete} 
        onClose={() => setConfirmDelete(false)}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this document?
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}