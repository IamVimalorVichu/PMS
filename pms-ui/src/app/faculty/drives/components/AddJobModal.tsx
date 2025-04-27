// AddJobModal.tsx
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input } from "@heroui/react";
import { Company } from "./types";

interface AddJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
    setJobTitle: (value: string) => void;
    jobExperience: number;
    setJobExperience: (value: number) => void;
    onAddJob: () => Promise<void>;
    drive_companies: Company[];
    desc: string;
    setJobDesc: (value: string) => void;
    jobLocation: string;
    setJobLocation: (value: string) => void;
    jobSalary: number;
    setJobSalary: (value: number) => void;
    joinDate: Date | null;
    setJoinDate: (value: Date) => void;
    lastDate: Date | null;
    setLastDate: (value: Date) => void;
    contactPerson: string;
    setContactPerson: (value: string) => void;
    contactEmail: string;
    setContactEmail: (value: string) => void;
    additional_instructions: string;
    setAdditionalInstructions: (value: string) => void;
    form_link: string;
    setFormLink: (value: string) => void;
    loading?: boolean; // Add loading prop
}

const formatDateForInput = (date: string | Date | null): string => {
    if (!date) return "";
    // Ensure it's a Date object before calling methods
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return ""; // Handle invalid date strings/objects
    return d.toISOString().split('T')[0];
};

export default function AddJobModal({
    isOpen,
    onClose,
    jobTitle,
    setJobTitle,
    jobExperience,
    setJobExperience,
    onAddJob,
    desc,
    setJobDesc,
    jobLocation,
    setJobLocation,
    jobSalary,
    setJobSalary,
    joinDate,
    setJoinDate,
    lastDate,
    setLastDate,
    contactPerson,
    setContactPerson,
    contactEmail,
    setContactEmail,
    additional_instructions,
    setAdditionalInstructions,
    form_link,
    setFormLink,
    loading = false, // Add default value
}: AddJobModalProps) {
    // Add validation function
    const validateForm = () => {
        if (!jobTitle?.trim()) {
            return false;
        }
        return true;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (!loading) {
                    onClose();
                }
            }}
        >
            <ModalContent>
                <ModalHeader>
                    Add Job Details
                </ModalHeader>
                <ModalBody className="space-y-4">
                    <Input
                        label="Job Title"
                        variant="underlined"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                    />
                    <Input
                        label="Job Description"
                        variant="underlined"
                        value={desc}
                        onChange={(e) => setJobDesc(e.target.value)}
                    />
                    <Input
                        label="Location"
                        variant="underlined"
                        value={jobLocation}
                        onChange={(e) => setJobLocation(e.target.value)}
                    />
                    <Input
                        label="Experience (years)"
                        type="number"
                        variant="underlined"
                        value={String(jobExperience)}
                        onChange={(e) => setJobExperience(Number(e.target.value))}
                    />
                    <Input
                        label="Salary"
                        type="number"
                        variant="underlined"
                        value={String(jobSalary)}
                        onChange={(e) => setJobSalary(Number(e.target.value))}
                    />
                    <Input
                        type="date"
                        label="Joining Date"
                        variant="underlined"
                        value={formatDateForInput(joinDate)}
                        onChange={(e) => setJoinDate(new Date(e.target.value))}
                    />
                    <Input
                        type="date"
                        label="Last Date to Apply"
                        variant="underlined"
                        value={formatDateForInput(lastDate)}
                        onChange={(e) => setLastDate(new Date(e.target.value))}
                    />
                    <Input
                        label="Contact Person"
                        variant="underlined"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                    />
                    <Input
                        label="Contact Email"
                        type="email"
                        variant="underlined"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                    />
                    <Input
                        label="Additional Instructions"
                        variant="underlined"
                        value={additional_instructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                    />
                    <Input
                        label="Form Link"
                        variant="underlined"
                        value={form_link}
                        onChange={(e) => setFormLink(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="light"
                            onPress={() => {
                                if (!loading) {
                                    onClose();
                                }
                            }}
                            isDisabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onPress={async () => {
                                if (loading || !validateForm()) return;

                                try {
                                    await onAddJob();
                                    onClose();
                                } catch (error) {
                                    console.error('Error adding job:', error);
                                }
                            }}
                            isDisabled={loading || !validateForm()}
                        >
                            {loading ? 'Adding...' : 'Add Job'}
                        </Button>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
