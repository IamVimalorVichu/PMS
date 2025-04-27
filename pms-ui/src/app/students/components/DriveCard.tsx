import { Drive, Company, Job, Requirement } from './types';
import { Modal, Button, Tabs, Tab, Card, CardBody, Chip, ModalHeader, ModalBody, ModalFooter, CardHeader, CardFooter } from '@heroui/react';
import { format } from 'date-fns';

interface DriveCardProps {
  drive: Drive;
  onViewDetails: (driveId: string) => void;
}

export function DriveCard({ drive, onViewDetails }: DriveCardProps) {
  // Calculate total jobs only if companies exist and have jobs
  const totalJobs = drive.companies?.reduce((sum, company) => 
    sum + (company.jobs?.length || 0), 0) || drive.jobs?.length || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">{drive.title}</h2>
          <div className="flex gap-2 text-sm text-gray-600">
            {totalJobs > 0 && (
              <span>{totalJobs} {totalJobs === 1 ? 'position' : 'positions'}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {drive.stages?.[0] && (
            <Chip color="primary" size="sm">{drive.stages[0]}</Chip>
          )}
        </div>
      </CardHeader>
      
      <CardBody>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            {drive.location && (
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{drive.location}</p>
              </div>
            )}
            {drive.drive_date && (
              <div>
                <p className="text-sm text-gray-500">Drive Date</p>
                <p className="font-medium">{format(new Date(drive.drive_date), 'PP')}</p>
              </div>
            )}
          </div>
          {drive.desc && (
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-sm line-clamp-2">{drive.desc}</p>
            </div>
          )}
          {drive.stages && drive.stages.length > 0 && (
            <div>
              <h4 className="text-sm text-gray-500 mb-2">Selection Process</h4>
              <div className="flex flex-wrap gap-2">
                {drive.stages.map((stage, index) => (
                  <Chip key={index} color="primary" size="sm">{stage}</Chip>
                ))}
              </div>
            </div>
          )}
          {drive.companies && drive.companies.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Participating Companies</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {drive.companies.slice(0, 3).map((company) => (
                  <Chip key={company._id} size="sm" variant="flat">
                    {company.name}
                    {typeof company.avg_salary === 'number' && (
                      <span className="ml-1 text-xs">
                        • ₹{(company.avg_salary/100000).toFixed(1)}L
                      </span>
                    )}
                  </Chip>
                ))}
                {drive.companies.length > 3 && (
                  <Chip size="sm" variant="dot">
                    +{drive.companies.length - 3} more
                  </Chip>
                )}
              </div>
            </div>
          )}
        </div>
      </CardBody>
      
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm">
          {drive.application_deadline && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Apply by:</span>
              <span className={`font-medium ${
                new Date(drive.application_deadline) < new Date() 
                  ? 'text-danger' 
                  : 'text-success'
              }`}>
                {format(new Date(drive.application_deadline), 'PP')}
              </span>
            </div>
          )}
        </div>
        <Button 
          color="primary"
          variant="solid"
          size="sm"
          onPress={() => onViewDetails(drive._id)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}