// components/Documents.tsx
import { useState } from 'react';
import { Button, Card, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { toast } from 'react-toastify';
import { MdDelete } from 'react-icons/md';
import { DocumentsProps, DeleteConfirmation } from '@/app/students/components/types';
import FileUploadModal from '@/app/students/components/FileUploadModal';
import PDFPreviewModal from '@/app/students/components/PDFPreviewModal';
import PDFThumbnail from '@/app/students/components/PDFThumbnail';

export default function Documents({ 
  student, 
  performance, 
  handleFileUpload, 
  handleDeleteDocument 
}: DocumentsProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ url: string; name: string } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    show: false,
    file: null,
    type: null
  });

  const handlePreview = (filepath: string, filename: string) => {
    setSelectedFile({
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${filepath}`,
      name: filename
    });
  };

  return (
    <Card className="p-6" shadow='none'>
      <div className="space-y-6">
        <div>
          <label className="text-sm text-gray-500">Certifications</label>
          {performance.certification_files.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-48 border rounded-lg p-3 mt-2'>
              <p className="text-sm text-gray-500 mb-4">No certifications uploaded</p>
              <Button 
                size="sm" 
                color="secondary" 
                variant="solid"
                onPress={() => setIsUploadModalOpen('certification')}
              >
                Upload Certification
              </Button>
            </div>
          ) : (
            <div className="mt-2">
              <div className="flex justify-end mb-4">
                <Button 
                  size="sm" 
                  color="secondary" 
                  variant="solid"
                  onPress={() => setIsUploadModalOpen('certification')}
                >
                  Upload Certification
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {performance.certification_files.map((cert, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-4 space-y-3">
                      <PDFThumbnail
                        fileUrl={`${cert.filepath}`}
                        onClick={() => handlePreview(cert.filepath, cert.filename)}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700 truncate" title={cert.filename}>
                          {cert.filename}
                        </p>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          isIconOnly
                          className="hover:bg-red-50"
                          onPress={() => setDeleteConfirmation({ show: true, file: cert, type: 'certification' })}
                        >
                          <MdDelete className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-500">Job Application Documents</label>
          {performance.job_application_files.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-48 border rounded-lg p-3 mt-2'>
              <p className="text-sm text-gray-500 mb-4">No documents uploaded</p>
              <Button 
                size="sm" 
                color="secondary" 
                variant="solid"
                onPress={() => setIsUploadModalOpen('job_application')}
              >
                Upload Document(s)
              </Button>
            </div>
          ) : (
            <div className="mt-2">
              <div className="flex justify-end mb-4">
                <Button 
                  size="sm" 
                  color="secondary" 
                  variant="solid"
                  onPress={() => setIsUploadModalOpen('job_application')}
                >
                  Upload Document(s)
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {performance.job_application_files.map((cert, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:border-primary-500 cursor-pointer">
                    <div className="flex flex-col space-y-2">
                      <PDFThumbnail
                        fileUrl={cert.filepath}
                        onClick={() => handlePreview(cert.filepath, cert.filename)}
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-sm truncate" title={cert.filename}>
                          {cert.filename}
                        </p>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => setDeleteConfirmation({ show: true, file: cert, type: 'job_application' })}
                          isIconOnly
                        >
                          <MdDelete/>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <FileUploadModal 
          isOpen={!!isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(null)}
          onUpload={async (files, onProgress) => {
            try {
              await handleFileUpload(
                files,
                isUploadModalOpen!,
                student._id,
                onProgress ?? (() => {})
              );
              toast.success('Documents uploaded successfully!', {
                position: "bottom-left",
              });
              setIsUploadModalOpen(null);
            } catch (error) {
              toast.error(`Failed to upload documents. Please try again: ${(error as Error).message}`, {
                position: "bottom-left",
              });
            }
          }}
        />

        <PDFPreviewModal
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          fileUrl={selectedFile?.url || ''}
          fileName={selectedFile?.name || ''}
          showDelete={true}
          onDelete={async () => {
            if (selectedFile) {
              try {
                // Extract filepath correctly from the new structure
                const filepath = selectedFile.url.split(`/uploads/${student._id}/`)[1];
                const type = performance.certification_files.some(f => f.filepath === filepath)
                  ? 'certification'
                  : 'job_application';
                await handleDeleteDocument(filepath, type);
                toast.success('Document deleted successfully!');
                setSelectedFile(null);
              } catch {
                toast.error('Failed to delete document. Please try again.');
              }
            }
          }}
        />

        <Modal 
          isOpen={deleteConfirmation.show} 
          onClose={() => setDeleteConfirmation({ show: false, file: null, type: null })}
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
                onPress={() => setDeleteConfirmation({ show: false, file: null, type: null })}
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={async () => {
                  if (deleteConfirmation.file && deleteConfirmation.type) {
                    try {
                      await handleDeleteDocument(deleteConfirmation.file.filepath, deleteConfirmation.type);
                      toast.success('Document deleted successfully!');
                      setDeleteConfirmation({ show: false, file: null, type: null });
                    } catch{
                      toast.error('Failed to delete document. Please try again.');
                    }
                  }
                }}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Card>
  );
}