import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { useState, useEffect } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  cgpa: number;
  eligible_jobs: string[];
}

interface ViewEligibleStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  driveId: string;
}

export default function ViewEligibleStudentsModal({ isOpen, onClose, driveId }: ViewEligibleStudentsModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEligibleStudents = async () => {
      try {
        const response = await fetch(`/api/drives/${driveId}/eligible-students`);
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Failed to fetch eligible students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchEligibleStudents();
    }
  }, [driveId, isOpen]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
    >
      <ModalContent>
        <ModalHeader>Eligible Students</ModalHeader>
        <ModalBody>
          {isLoading ? (
            <div>Loading students...</div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="border p-4 rounded">
                  <div><strong>Name:</strong> {student.name}</div>
                  <div><strong>Email:</strong> {student.email}</div>
                  <div><strong>Department:</strong> {student.department}</div>
                  <div><strong>CGPA:</strong> {student.cgpa}</div>
                  <div><strong>Eligible Jobs:</strong> {student.eligible_jobs.join(", ")}</div>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}