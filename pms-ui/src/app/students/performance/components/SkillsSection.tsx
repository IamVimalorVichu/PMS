// students/components/dashboard/SkillsSection.tsx
import React from 'react';
import { Card, Button } from '@heroui/react';
import { Performance } from './types';
import PDFThumbnail from '@/app/students/components/PDFThumbnail';

interface SkillsSectionProps {
  performance: Performance | null;
  onUploadClick: (type: string) => void;
  onFilePreview: (fileUrl: string, fileName: string) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ 
  performance, 
  onUploadClick,
  onFilePreview 
}) => {
  return (
    <Card className="p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Skills & Certifications</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Technical Skills</h3>
          <div className="flex flex-wrap gap-2">
            {performance?.skills?.map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
            {(!performance?.skills || performance.skills.length === 0) && (
              <p className="text-gray-500">No skills added yet</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Certifications</h3>
            <Button 
              size="sm"
              color="primary"
              variant="flat"
              onPress={() => onUploadClick('certification')}
            >
              Upload Certificate
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {performance?.certification_files?.map((cert, index) => (
              <div key={index} className="border rounded-lg p-3">
                <PDFThumbnail
                  fileUrl={cert.filepath}
                  onClick={() => onFilePreview(cert.filepath, cert.filename)}
                />
                <p className="text-sm mt-2 truncate">{cert.filename}</p>
              </div>
            ))}
            {(!performance?.certification_files || performance.certification_files.length === 0) && (
              <p className="text-gray-500">No certifications uploaded yet</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SkillsSection;