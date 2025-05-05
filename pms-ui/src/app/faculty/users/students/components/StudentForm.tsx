import React from 'react';
import { Input, Button, Select, SelectItem } from '@heroui/react';
import { Student, StudentInputData } from './types';

interface StudentFormProps {
  formData: Partial<Student>;
  onFormChange: (field: keyof StudentInputData, value: unknown) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel: string;
  error?: string;
}

const StudentForm: React.FC<StudentFormProps> = ({
  formData,
  onFormChange,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel,
  error
}) => {
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input 
        autoFocus 
        label="First Name *" 
        value={formData.first_name} 
        onValueChange={v => onFormChange('first_name', v)} 
        isRequired 
      />
      <Input 
        label="Middle Name" 
        value={formData.middle_name} 
        onValueChange={v => onFormChange('middle_name', v)} 
      />
      <Input 
        label="Last Name" 
        value={formData.last_name} 
        onValueChange={v => onFormChange('last_name', v)} 
      />
      <Input 
        label="Email *" 
        type="email" 
        value={formData.email} 
        onValueChange={v => onFormChange('email', v)} 
        isRequired 
      />
      <Input 
        label="Phone Number" 
        type="tel"
        minLength={10}
        maxLength={14}
        pattern="[0-9]{10,14}"
        value={formData.ph_no} 
        onValueChange={v => onFormChange('ph_no', v)} 
      />
      <Input 
        label="Alternative Phone" 
        type="tel"
        minLength={10}
        maxLength={14}
        pattern="[0-9]{10,14}"
        value={formData.alt_ph} 
        onValueChange={v => onFormChange('alt_ph', v)} 
      />
      <Input 
        label="Alternative Email" 
        type="email" 
        value={formData.alt_email || ''} 
        onValueChange={v => onFormChange('alt_email', v)} 
      />
      <Input 
        label="Address" 
        value={formData.address} 
        onValueChange={v => onFormChange('address', v)} 
      />
      <Input 
        label="City" 
        value={formData.city} 
        onValueChange={v => onFormChange('city', v)} 
      />
      <Input 
        label="District" 
        value={formData.district} 
        onValueChange={v => onFormChange('district', v)} 
      />
      <Input 
        label="State" 
        value={formData.state} 
        onValueChange={v => onFormChange('state', v)} 
      />
      <Input 
        label="Admission Number" 
        value={formData.adm_no} 
        onValueChange={v => onFormChange('adm_no', v)} 
      />
      <Input 
        label="Registration Number" 
        value={formData.reg_no} 
        onValueChange={v => onFormChange('reg_no', v)} 
      />
      <Select 
        label="Gender" 
        selectedKeys={formData.gender ? [formData.gender] : []}
        onChange={e => onFormChange('gender', e.target.value === 'Select' ? null : e.target.value)}
      >
        <SelectItem key="Select">Select</SelectItem>
        <SelectItem key="Male">Male</SelectItem>
        <SelectItem key="Female">Female</SelectItem>
        <SelectItem key="Other">Other</SelectItem>
      </Select>
      <Select 
        label="Program" 
        selectedKeys={formData.program ? [formData.program] : []}
        onChange={e => onFormChange('program', e.target.value)}
      >
        <SelectItem key="MCA">MCA</SelectItem>
        <SelectItem key="MBA">MBA</SelectItem>
        <SelectItem key="BCA">BCA</SelectItem>
        <SelectItem key="BBA">BBA</SelectItem>
      </Select>
      <Select 
        label="Status" 
        selectedKeys={formData.status ? [formData.status] : []}
        onChange={e => onFormChange('status', e.target.value)}
      >
        <SelectItem key="Active">Active</SelectItem>
        <SelectItem key="Discontinued">Discontinued</SelectItem>
        <SelectItem key="completed">Completed</SelectItem>
      </Select>
      <Input 
        label="Date of Birth" 
        type="date" 
        value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''} 
        onChange={e => onFormChange('dob', e.target.value)} 
      />
      <Input 
        label="Join Date" 
        type="date" 
        value={formData.join_date ? new Date(formData.join_date).toISOString().split('T')[0] : ''} 
        onChange={e => onFormChange('join_date', e.target.value)} 
      />
      <Input 
        label="End Date" 
        type="date" 
        value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ''} 
        onChange={e => onFormChange('end_date', e.target.value)} 
      />

      {error && <p className="col-span-2 text-sm text-red-500">{error}</p>}

      <div className="col-span-2 mt-6 flex justify-end gap-2">
        <Button variant="light" onPress={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          color="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;