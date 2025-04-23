import { Input, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress } from "@heroui/react";
import { useRef, useState } from "react";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList, onProgress: (progress: number) => void) => Promise<void>;
}

export default function FileUploadModal({ isOpen, onClose, onUpload }: FileUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles) {
      try {
        setUploading(true);
        await onUpload(selectedFiles, (progress) => {
          setUploadProgress(progress);
        });
        
        // Reset form
        setSelectedFiles(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setUploading(false);
        setUploadProgress(0);
        onClose();
      } catch (error) {
        setUploading(false);
        setUploadProgress(0);
        // Handle error here
      }
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Upload Document</ModalHeader>
        <ModalBody>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            multiple
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100"
          />
          
          {uploading && (
            <div className="mt-4 space-y-2">
              <Progress 
                value={uploadProgress} 
                color="secondary"
                className="w-full"
                aria-label="Upload progress"
              />
              <p className="text-sm text-center text-gray-600">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button 
            color="danger" 
            variant="light" 
            onPress={onClose}
            isDisabled={uploading}
          >
            Cancel
          </Button>
          <Button 
            color="primary" 
            onPress={handleUpload}
            isDisabled={!selectedFiles || uploading}
            isLoading={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}