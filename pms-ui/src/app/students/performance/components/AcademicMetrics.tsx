// students/components/dashboard/AcademicMetrics.tsx
import React from 'react';
import { Card, Progress } from '@heroui/react';
import { Line } from 'react-chartjs-2';
import { Performance } from './types';

interface AcademicMetricsProps {
  performance: Performance | null;
}

const AcademicMetrics: React.FC<AcademicMetricsProps> = ({ performance }) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Academic Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>10th CGPA</span>
              <span className="font-semibold">{performance?.tenth_cgpa || 'N/A'}</span>
            </div>
            <Progress 
              value={((performance?.tenth_cgpa || 0) / 10) * 100} 
              color="primary"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span>12th CGPA</span>
              <span className="font-semibold">{performance?.twelfth_cgpa || 'N/A'}</span>
            </div>
            <Progress 
              value={((performance?.twelfth_cgpa || 0) / 10) * 100} 
              color="primary"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span>Degree CGPA</span>
              <span className="font-semibold">{performance?.degree_cgpa || 'N/A'}</span>
            </div>
            <Progress 
              value={((performance?.degree_cgpa || 0) / 10) * 100} 
              color="primary"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">MCA Semester-wise CGPA</h3>
          {performance?.mca_cgpa && performance.mca_cgpa.length > 0 ? (
            <Line 
              data={{
                labels: performance.mca_cgpa.map((_, i) => `Sem ${i + 1}`),
                datasets: [{
                  label: 'CGPA',
                  data: performance.mca_cgpa,
                  borderColor: 'rgb(59, 130, 246)',
                  tension: 0.1
                }]
              }}
            />
          ) : (
            <p className="text-gray-500 text-center">No semester data available</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AcademicMetrics;