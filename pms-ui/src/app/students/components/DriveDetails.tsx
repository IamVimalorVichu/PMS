import { Drive, Company, Job } from './types';
import {  Button, Tabs, Tab, Card, CardBody, Chip, Accordion, AccordionItem } from '@heroui/react';
import { format } from 'date-fns';
import { useStudentManagement } from './useStudentManagement';
import { useState } from 'react';
import { IoLocationOutline, IoCalendarOutline, IoCashOutline, IoBusinessOutline, IoTimeOutline } from 'react-icons/io5';
import { InternalApplyModal } from './InternalApplyModal';
import { ApplicationAndResumeModal } from './ApplicationAndResumeModal';

interface DriveDetailsProps {
  drive: Drive;
  jobs: Job[];
}

export function DriveDetails({ 
  drive, 
  jobs,
}: DriveDetailsProps) {

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{drive.title}</h2>
        <div className="flex gap-4 text-gray-600">
          {drive.location && (
            <div className="flex items-center gap-1">
              <IoLocationOutline />
              <span>{drive.location}</span>
            </div>
          )}
          {drive.drive_date && (
            <div className="flex items-center gap-1">
              <IoCalendarOutline />
              <span>{format(new Date(drive.drive_date), 'PP')}</span>
            </div>
          )}
        </div>
      </header>

      <Tabs 
        defaultSelectedKey="jobs"
        className="w-full"
        aria-label="Drive sections"
      >
        <Tab key="jobs" title="Open Positions">
          <div className="space-y-6 py-4">
            {jobs.map((job) => (
              <JobCard 
                key={job._id}
                job={job}
                company={drive.companies?.find(c => c._id === job.company)}
                driveId={drive._id}
              />
            ))}
          </div>
        </Tab>

        <Tab key="details" title="Drive Details">
          <div className="space-y-6 py-4">
            {drive.desc && (
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold mb-2">About This Drive</h3>
                  <p className="text-gray-600">{drive.desc}</p>
                </CardBody>
              </Card>
            )}

            {drive.stages && drive.stages.length > 0 && (
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold mb-4">Selection Process</h3>
                  <div className="flex flex-wrap gap-2">
                    {drive.stages.map((stage, index) => (
                      <div key={index} className="flex items-center">
                        <Chip
                          color="primary"
                          variant="flat"
                          startContent={<span className="font-bold">{index + 1}</span>}
                        >
                          {stage}
                        </Chip>
                        {index < drive.stages!.length - 1 && (
                          <span className="mx-2 text-gray-400">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {drive.additional_instructions && (
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold mb-2">Important Instructions</h3>
                  <div className="prose prose-sm max-w-none text-gray-600">
                    {drive.additional_instructions}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

function JobCard({ job, company, driveId }: { job: Job; company?: Company; driveId: string }) {
  const { handleApplyToJob, handleApplyClick } = useStudentManagement();
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const { student } = useStudentManagement();

  const handleApply = () => {
    if (job.form_link) {
      handleApplyClick(job.form_link);
    } else {
      setIsInternalModalOpen(true);
    }
  };

  const handleInternalApply = async (resumeFile: File | null, savedResumeId?: string) => {
    if (!company?._id) {
      console.error('Company ID is missing');
      return;
    }
    
    if (!resumeFile && !savedResumeId) {
      console.error('Resume file or saved resume ID is missing');
      return;
    }
    
    setLoading(true);
    try {
      await handleApplyToJob(job._id, driveId, company._id, resumeFile, savedResumeId);
      setShowPreviewModal(true);
      // Handle success - you might want to show a success message
    } catch (error) {
      console.error('Error applying:', error);
      // Handle error - you might want to show an error message
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = () => {
    // Only show preview modal for internal applications (no form_link)
    if (job.hasApplied && student?._id && !job.form_link) {
      setShowPreviewModal(true);
    }
  };

  return (
    <Card 
      className="border border-gray-200 shadow-sm"
      isPressable={job.hasApplied && !job.form_link} // Only make internal applications clickable
      onPress={handleViewApplication}
    >
      <CardBody className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{job.title}</h3>
            <div className="flex gap-2 items-center text-gray-600">
              <IoBusinessOutline />
              <span>{company?.name}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {job.job_type && (
              <Chip color="primary" variant="flat" size="sm">{job.job_type}</Chip>
            )}
            {job.hasApplied && (
              <Chip 
                color="success" 
                variant="flat" 
                size="sm"
                className={!job.form_link ? "cursor-pointer" : ""} // Only add cursor pointer for internal applications
                onClick={!job.form_link ? handleViewApplication : undefined}
              >
                Applied
              </Chip>
            )}
          </div>
        </div>

        <Accordion>
          <AccordionItem 
            key="details" 
            title="View Job & Company Details"
            className="px-0"
          >
            <div className="space-y-4 pt-2">
              {/* Job Details */}
              <div className="grid grid-cols-2 gap-4">
                {job.requirement?.experience_required && (
                  <div className="flex items-center gap-2">
                    <IoTimeOutline className="text-gray-500" />
                    <span>{job.requirement.experience_required} years experience</span>
                  </div>
                )}
                {job.salary_range && (
                  <div className="flex items-center gap-2">
                    <IoCashOutline className="text-gray-500" />
                    <span>₹{job.salary_range[0]} - ₹{job.salary_range[1]} LPA</span>
                  </div>
                )}
              </div>

              {/* Requirements Section */}
              {job.requirement && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Requirements</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {job.requirement.skills_required && (
                      <div>
                        <p className="text-gray-500 mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {job.requirement.skills_required.map((skill, index) => (
                            <Chip key={index} size="sm" variant="flat" color="primary">
                              {skill}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                    {job.requirement.preferred_qualifications && (
                      <div>
                        <p className="text-gray-500 mb-2">Preferred Qualifications</p>
                        <div className="flex flex-wrap gap-1">
                          {job.requirement.preferred_qualifications.map((qual, index) => (
                            <Chip key={index} size="sm" variant="dot">
                              {qual}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Company Details */}
              {company && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">About {company.name}</h4>
                  {company.desc && <p className="text-gray-600">{company.desc}</p>}
                  <div className="flex gap-4">
                    {company.site && (
                      <Button
                        as="a"
                        href={company.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="light"
                        size="sm"
                      >
                        Visit Website
                      </Button>
                    )}
                    {company.avg_salary && (
                      <Chip color="success" variant="flat">
                        Avg. Package: ₹{company.avg_salary.toLocaleString()} LPA
                      </Chip>
                    )}
                  </div>
                </div>
              )}
            </div>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center gap-4 pt-2">
          {job.hasApplied ? (
            job.form_link ? (
              // For external applications, just show static "Applied" button
              <Button
                color="success"
                variant="flat"
                size="lg"
                isDisabled
              >
                Applied via Form
              </Button>
            ) : (
              // For internal applications, show view application button
              <Button
                color="success"
                variant="flat"
                size="lg"
                onPress={handleViewApplication}
              >
                View Application
              </Button>
            )
          ) : (
            <Button
              color="primary"
              size="lg"
              onPress={handleApply}
              isLoading={loading}
            >
              {job.form_link ? 'Apply via Form' : 'Apply Now'}
            </Button>
          )}
        </div>

        {/* Only render modal for internal applications */}
        {student?._id && !job.form_link && (
          <ApplicationAndResumeModal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            driveId={driveId}
            jobId={job._id}
            studentId={student._id}
            jobTitle={job.title}
          />
        )}

        <InternalApplyModal
          isOpen={isInternalModalOpen}
          onClose={() => setIsInternalModalOpen(false)}
          jobTitle={job.title}
          onApply={handleInternalApply}
          driveId={driveId}
          jobId={job._id}
        />
      </CardBody>
    </Card>
  );
}