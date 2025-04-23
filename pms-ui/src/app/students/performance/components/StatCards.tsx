// students/components/dashboard/StatCards.tsx
import React from 'react';
import { Card } from '@heroui/react';
import { MdTrendingUp, MdSchool, MdVerified } from 'react-icons/md';
import { Performance } from './types';

interface StatCardsProps {
  performance: Performance | null;
}

const StatCards: React.FC<StatCardsProps> = ({ performance }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="p-4 bg-blue-50">
        <div className="flex items-center space-x-3">
          <MdTrendingUp className="text-blue-600 text-2xl" />
          <div>
            <p className="text-sm text-gray-600">Current CGPA</p>
            <p className="text-xl font-bold text-blue-600">
              {performance?.mca_cgpa?.[performance.mca_cgpa.length - 1] || 'N/A'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-green-50">
        <div className="flex items-center space-x-3">
          <MdSchool className="text-green-600 text-2xl" />
          <div>
            <p className="text-sm text-gray-600">Current Semester</p>
            <p className="text-xl font-bold text-green-600">
              {performance?.semester || 'N/A'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-purple-50">
        <div className="flex items-center space-x-3">
          <MdVerified className="text-purple-600 text-2xl" />
          <div>
            <p className="text-sm text-gray-600">Certifications</p>
            <p className="text-xl font-bold text-purple-600">
              {performance?.certification_files?.length || 0}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatCards;