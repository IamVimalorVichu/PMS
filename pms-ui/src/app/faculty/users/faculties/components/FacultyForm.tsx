// faculty/components/FacultyForm.tsx
import React from 'react';
import { Input, Select, SelectItem, Button } from '@heroui/react';
import { FacultyFormData, OptionType } from './types';

interface FacultyFormProps {
  formData: FacultyFormData;
  programOptions: OptionType[];
  statusOptions: OptionType[];
  onFormChange: (field: string, value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  isLoading?: boolean;
}

const FacultyForm: React.FC<FacultyFormProps> = ({
  formData,
  programOptions,
  statusOptions,
  onFormChange,
  onCancel,
  onSubmit,
  submitLabel,
  isLoading = false
}) => {
  return (
    <>
      <Input
        label="First Name"
        value={formData.first_name}
        onChange={(e) => onFormChange('first_name', e.target.value)}
        className="mb-3"
        isRequired
      />
      <Input
        label="Middle Name"
        value={formData.middle_name}
        onChange={(e) => onFormChange('middle_name', e.target.value)}
        className="mb-3"
      />
      <Input
        label="Last Name"
        value={formData.last_name}
        onChange={(e) => onFormChange('last_name', e.target.value)}
        className="mb-3"
        isRequired
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => onFormChange('email', e.target.value)}
        className="mb-3"
        isRequired
      />
      <Input
        label="Phone"
        value={formData.ph_no}
        onChange={(e) => onFormChange('ph_no', e.target.value)}
        className="mb-3"
      />
      <Select 
        label="Program"
        selectedKeys={[formData.program]}
        onChange={(e) => onFormChange('program', e.target.value)}
        className="mb-3"
      >
        {programOptions.map((program) => (
          <SelectItem key={program.value}>{program.label}</SelectItem>
        ))}
      </Select>
      <Select 
        label="Status"
        selectedKeys={[formData.status]}
        onChange={(e) => onFormChange('status', e.target.value)}
        className="mb-3"
      >
        {statusOptions.map((status) => (
          <SelectItem key={status.value}>{status.label}</SelectItem>
        ))}
      </Select>
      <div className="flex justify-end gap-2 mt-4">
        <Button color="danger" onPress={onCancel} isDisabled={isLoading}>
          Cancel
        </Button>
        <Button color="primary" onPress={onSubmit} isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </>
  );
};

export default FacultyForm;