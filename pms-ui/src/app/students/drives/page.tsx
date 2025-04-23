'use client';
import { useStudentManagement } from '../components/useStudentManagement';
import { Spinner, Button } from '@heroui/react';
import { DriveCard } from '../components/DriveCard';
import { DriveDetails } from '../components/DriveDetails';

export default function DrivesPage() {
  const {
    drives,
    selectedDrive,
    driveLoading,
    driveError,
    handleViewDriveDetails,
    handleCloseDriveDetails
  } = useStudentManagement();

  if (driveLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Spinner color="primary" size="lg" label="Loading drives..." />
      </div>
    );
  }

  if (driveError) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-danger">
        {driveError}
      </div>
    );
  }

  if (selectedDrive) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            color="primary"
            variant="light"
            onPress={handleCloseDriveDetails}
            className="mb-4"
          >
            ← Back to Drives
          </Button>
          <DriveDetails
            drive={selectedDrive}
            jobs={selectedDrive.jobs ?? []}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Available Drives</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drives.map((drive) => (
          <DriveCard 
            key={drive._id} 
            drive={drive}
            onViewDetails={() => handleViewDriveDetails(drive._id!)}
          />
        ))}
      </div>
    </div>
  );
}
