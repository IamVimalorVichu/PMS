// JobDetailsTab.tsx
import { Tabs, Tab, Accordion, AccordionItem, Input, Button, Card, CardBody, Progress, Textarea } from "@heroui/react";
import { useState, useEffect } from "react";
import { Job, Company } from "./types";

interface JobDetailsTabProps {
    drive_companies: Company[];
    onAddJob: () => void;
    jobs: Job[];
    job_id: string;
    setJobId: (id: string) => void;
    onUpdateJob: () => void;
    onDeleteJob: () => void;
    company_id: string;
    setCompanyId: (id: string) => void;
    jobTitle: string;
    setJobTitle: (value: string) => void;
    jobExperience: number;
    setJobExperience: (value: number) => void;
    jobProgressList: { id: string; progress: number; }[]; // Add this prop
    desc: string;
    setJobDesc: (value: string) => void;
    jobLocation: string;
    setJobLocation: (value: string) => void;
    jobSalary: number;
    setJobSalary: (value: number) => void;
    joinDate: Date | null;
    setJoinDate: (value: Date) => void;
    lastDate: Date | null;
    setLastDate: (value: Date) => void;
    contactPerson: string;
    setContactPerson: (value: string) => void;
    contactEmail: string;
    setContactEmail: (value: string) => void;
    additional_instructions: string;
    setAdditionalInstructions: (value: string) => void;
    onAddRequirement: () => void;
    form_link: string;
    setFormLink: (value: string) => void;
}

const formatDateForInput = (date: string | Date | null): string => {
    if (!date) return "";
    // Ensure it's a Date object before calling methods
    const d = date instanceof Date ? date : new Date(date);
     if (isNaN(d.getTime())) return ""; // Handle invalid date strings/objects
    return d.toISOString().split('T')[0];
};

export default function JobDetailsTab({
    drive_companies,
    onAddJob,
    jobs,
    setJobId,
    onUpdateJob,
    onDeleteJob,
    setCompanyId,
    setJobTitle,
    setJobExperience,
    jobProgressList,
    setJobDesc,
    setJobLocation,
    setJobSalary,
    setJoinDate,
    setLastDate,
    setContactPerson,
    setContactEmail,
    setAdditionalInstructions,
    onAddRequirement,
    setFormLink,
}: JobDetailsTabProps) {
    const [selectedCompany, setSelectedCompany] = useState("");

    useEffect(() => {
        if (drive_companies?.length > 0 && !selectedCompany) {
            setSelectedCompany(drive_companies[0]._id);
            setCompanyId(drive_companies[0]._id);
        }
    }, [drive_companies, selectedCompany, setCompanyId]);

    return (
        <Card className="w-full max-w-5xl p-6 shadow-lg">
            <CardBody className="flex flex-col items-center">
                <h1 className="text-2xl font-semibold mb-6 text-gray-800">Job Details</h1>
                {drive_companies?.length > 0 ? (
                    <Tabs 
                        aria-label="Company Jobs"
                        selectedKey={selectedCompany}
                        onSelectionChange={(key) => {
                            setSelectedCompany(key.toString());
                            setCompanyId(key.toString());
                        }}
                        className="w-full"
                        isVertical
                        classNames={{
                            tabList: "gap-2 p-4 bg-gray-50 rounded-lg",
                            cursor: "w-full bg-primary",
                            tab: "max-w-full px-4 py-3 rounded-lg hover:bg-gray-100"
                        }}
                    >
                        {drive_companies.map((company) => {
                            const companyJobs = jobs.filter(job => job.company === company._id);
                            
                            return (
                                <Tab key={company._id} title={company.name}>
                                    <div className="py-6 px-4 flex flex-col items-center w-full">
                                        <h2 className="text-xl font-medium mb-4 text-gray-700">
                                            {company.name} - {company.branch}
                                        </h2>
                                        
                                        <div className="space-y-6 mt-4 mb-6 w-full">
                                            {companyJobs.length > 0 ? (
                                                <Accordion
                                                    defaultSelectedKeys="all"
                                                    defaultExpandedKeys="all"
                                                    hideIndicator
                                                    selectionMode="multiple"
                                                    className="w-full gap-4"
                                                    variant="bordered"
                                                >
                                                    {companyJobs.map((job, index) => {
                                                        const progress = jobProgressList.find(p => p.id === job._id)?.progress || 0;
                                                        
                                                        return (
                                                            <AccordionItem 
                                                                key={job._id} 
                                                                aria-label={`Job ${index + 1}`} 
                                                                title={
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <span className="text-lg font-medium">{job.title}</span>
                                                                        <div className="w-40">
                                                                            <Progress 
                                                                                value={progress} 
                                                                                className="h-2 rounded-full"
                                                                                color={progress < 30 ? "danger" : progress < 70 ? "warning" : "success"}
                                                                            />
                                                                            <span className="text-sm text-gray-500 mt-1 block text-right">{progress}%</span>
                                                                        </div>
                                                                    </div>
                                                                }
                                                                subtitle={
                                                                    <span className="text-gray-600">Experience: {job.experience} years</span>
                                                                }
                                                            >
                                                                <div className="flex flex-col gap-6 mt-4">
                                                                    {/* Basic Details Section */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <Input
                                                                            label="Form Link"
                                                                            variant="bordered"
                                                                            defaultValue={job.form_link}
                                                                            onChange={(e) => setFormLink(e.target.value)}
                                                                        />
                                                                        <Input
                                                                            label="Job Title"
                                                                            variant="bordered"
                                                                            defaultValue={job.title}
                                                                            onChange={(e) => setJobTitle(e.target.value)}
                                                                        />
                                                                    </div>

                                                                    {/* Description Section */}
                                                                    <Textarea
                                                                        label="Job Description"
                                                                        variant="bordered"
                                                                        defaultValue={job.desc}
                                                                        onChange={(e) => setJobDesc(e.target.value)}
                                                                        className="w-full"
                                                                        minRows={6}
                                                                        classNames={{
                                                                            input: "resize-y min-h-[150px]"
                                                                        }}
                                                                    />

                                                                    {/* Job Details Grid */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                        <Input
                                                                            label="Location"
                                                                            variant="bordered"
                                                                            defaultValue={job.loc}
                                                                            onChange={(e) => setJobLocation(e.target.value)}
                                                                        />
                                                                        <Input
                                                                            label="Experience (years)"
                                                                            variant="bordered"
                                                                            defaultValue={String(job.experience)}
                                                                            onChange={(e) => setJobExperience(Number(e.target.value) || 0)}
                                                                        />
                                                                        <Input
                                                                            label="Salary"
                                                                            type="number"
                                                                            variant="bordered"
                                                                            defaultValue={String(job.salary)}
                                                                            onChange={(e) => setJobSalary(Number(e.target.value))}
                                                                        />
                                                                    </div>

                                                                    {/* Dates Section */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <Input
                                                                            type="date"
                                                                            label="Joining Date"
                                                                            variant="bordered"
                                                                            defaultValue={formatDateForInput(job.join_date)}
                                                                            onChange={(e) => setJoinDate(new Date(e.target.value))}
                                                                        />
                                                                        <Input
                                                                            type="date"
                                                                            label="Last Date to Apply"
                                                                            variant="bordered"
                                                                            defaultValue={formatDateForInput(job.last_date)}
                                                                            onChange={(e) => setLastDate(new Date(e.target.value))}
                                                                        />
                                                                    </div>

                                                                    {/* Additional Instructions */}
                                                                    <Textarea
                                                                        label="Additional Instructions"
                                                                        variant="bordered"
                                                                        defaultValue={job.additional_instructions}
                                                                        minRows={4}
                                                                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                                                                        classNames={{
                                                                            input: "resize-y min-h-[100px]"
                                                                        }}
                                                                    />

                                                                    {/* Contact Information */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <Input
                                                                            label="Contact Person"
                                                                            variant="bordered"
                                                                            defaultValue={job.contact_person}
                                                                            onChange={(e) => setContactPerson(e.target.value)}
                                                                        />
                                                                        <Input
                                                                            label="Contact Email"
                                                                            type="email"
                                                                            variant="bordered"
                                                                            defaultValue={job.contact_email}
                                                                            onChange={(e) => setContactEmail(e.target.value)}
                                                                        />
                                                                    </div>

                                                                    {/* Action Buttons */}
                                                                    <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t">
                                                                        <Button 
                                                                            className="flex-1"
                                                                            variant="solid" 
                                                                            color="primary"
                                                                            size="lg"
                                                                            onPress={() => {
                                                                                setJobId(job._id);
                                                                                onAddRequirement();
                                                                            }}
                                                                        >
                                                                            Manage Requirements
                                                                        </Button>
                                                                        
                                                                        {jobs.length >= 1 && (
                                                                            <>
                                                                                <Button 
                                                                                    className="flex-1"
                                                                                    variant="bordered" 
                                                                                    color="primary"
                                                                                    size="lg"
                                                                                    onPress={() => {
                                                                                        if (job._id) {
                                                                                            setJobId(job._id);
                                                                                            onUpdateJob();
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    Save Changes
                                                                                </Button>
                                                                                <Button 
                                                                                    className="flex-1"
                                                                                    variant="flat" 
                                                                                    color="danger"
                                                                                    size="lg"
                                                                                    onPress={() => {
                                                                                        if (job._id) {
                                                                                            setJobId(job._id);
                                                                                            onDeleteJob();
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    Delete Job
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </AccordionItem>
                                                        );
                                                    })}
                                                </Accordion>
                                            ) : (
                                                <p className="text-center text-gray-500 py-8">No jobs added yet</p>
                                            )}
                                        </div>
                                        
                                        <Button 
                                            variant="solid" 
                                            color="primary" 
                                            size="lg"
                                            className="px-8"
                                            onPress={() => {
                                                setCompanyId(company._id);
                                                onAddJob();
                                            }}
                                        >
                                            + Add New Job
                                        </Button>
                                    </div>
                                </Tab>
                            );
                        })}
                    </Tabs>
                ) : (
                    <p className="text-center text-gray-500 py-8">Please add companies first</p>
                )}
            </CardBody>
        </Card>
    );
}
