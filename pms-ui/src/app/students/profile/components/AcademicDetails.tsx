// components/AcademicDetails.tsx
import { Card } from '@heroui/react';
import { format } from 'date-fns';
import { AcademicDetailsProps } from '@/app/students/components/types';

export default function AcademicDetails({ student }: AcademicDetailsProps) {
  return (
    <Card className="p-6 space-y-6" shadow='none'>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Admission Number</label>
              <p>{student.adm_no}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Registration Number</label>
              <p>{student.reg_no || 'Not assigned'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Program</label>
              <p>{student.program}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <p>{student.status}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Important Dates</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Join Date</label>
              <p>{student.join_date ? format(new Date(student.join_date), 'PP') : 'Not specified'}</p>
            </div>
            {student.end_date && (
              <div>
                <label className="text-sm text-gray-500">End Date</label>
                <p>{format(new Date(student.end_date), 'PP')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}