import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress } from "@heroui/react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList, onProgress?: (progress: number) => void) => Promise<void>;
}

export default function FileUploadModal({
  isOpen,
  onClose,
  onUpload
}: FileUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Validate file types
      const invalidFiles = Array.from(files).filter(
        file => !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
      );
      
      if (invalidFiles.length > 0) {
        toast.error('Only PDF, JPEG, and PNG files are allowed');
        return;
      }

      // Validate file sizes
      const largeFiles = Array.from(files).filter(
        file => file.size > 5 * 1024 * 1024 // 5MB
      );
      
      if (largeFiles.length > 0) {
        toast.error('Files must be less than 5MB');
        return;
      }

      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles) {
      setIsUploading(true);
      try {
        await onUpload(selectedFiles, (progress) => {
          setUploadProgress(progress);
        });
        onClose();
        setSelectedFiles(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          Upload Files
        </ModalHeader>
        <ModalBody>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            disabled={isUploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100"
          />
          {isUploading && (
            <Progress value={uploadProgress} className="mt-4" />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={handleUpload}
            isDisabled={!selectedFiles || isUploading}
            isLoading={isUploading}
          >
            Upload
          </Button>
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}