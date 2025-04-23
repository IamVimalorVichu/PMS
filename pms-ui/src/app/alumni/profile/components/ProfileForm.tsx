// alumni/components/ProfileForm.tsx
import React from 'react';
import { Input, Select, SelectItem } from "@heroui/react";
import { AlumniProfile, FormSection, FormField } from './types';

interface ProfileFormProps {
  profile: AlumniProfile;
  formSections: FormSection[];
  isEditing: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  formSections,
  isEditing,
  handleInputChange,
  handleSelectChange
}) => {
  // Render a form field based on its type
  const renderField = (field: FormField) => {
    const id = field.id as keyof AlumniProfile;
    
    switch (field.type) {
      case 'select':
        return (
          <Select
            id={field.id}
            name={field.id}
            value={profile[id] as string}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              handleSelectChange(field.id, e.target.value)
            }
            disabled={!isEditing}
          >
            {field.options?.map(option => (
              <SelectItem key={option.key}>{option.value}</SelectItem>
            ))}
          </Select>
        );
      
      case 'email':
        return (
          <Input
            id={field.id}
            name={field.id}
            type="email"
            value={profile[id] as string}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        );
      
      case 'tel':
        return (
          <Input
            id={field.id}
            name={field.id}
            type="tel"
            value={profile[id] as string}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        );
      
      default:
        return (
          <Input
            id={field.id}
            name={field.id}
            value={profile[id] as string}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {formSections.map((section, sectionIndex) => (
        <React.Fragment key={sectionIndex}>
          {section.fields.map(field => (
            <div key={field.id} className="space-y-2">
              <label htmlFor={field.id}>{field.label}</label>
              {renderField(field)}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProfileForm;