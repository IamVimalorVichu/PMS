// src/app/components/AlumniForm.tsx
import React from 'react';
import { Input, Select, SelectItem, Button } from '@heroui/react';
import { AlumniFormData, StatusOption } from './types';

interface AlumniFormProps {
  formData: AlumniFormData;
  statusOptions: StatusOption[];
  onFormChange: (field: string, value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  isLoading?: boolean;
}

const AlumniForm: React.FC<AlumniFormProps> = ({
  formData,
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
      />
      <Input
        label="Email"
        type="email"
        value={formData.email ?? ''}
        onChange={(e) => onFormChange('email', e.target.value)}
        className="mb-3"
        isRequired
      />
      <Input
        label="Phone"
        value={formData.ph_no ?? ''}
        onChange={(e) => onFormChange('ph_no', e.target.value)}
        className="mb-3"
      />
      <Input
        label="Admission Number"
        value={formData.adm_no}
        onChange={(e) => onFormChange('adm_no', e.target.value)}
        className="mb-3"
      />
      
      <Select 
        label="Status"
        selectedKeys={[formData.status]}
        onChange={(e) => onFormChange('status', e.target.value)}
        className="mb-3"
      >
        {statusOptions.map((status) => (
          <SelectItem key={status.value}>
            {status.label}
          </SelectItem>
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

export default AlumniForm;