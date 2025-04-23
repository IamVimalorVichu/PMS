// CompanyDetailsTab.tsx
import { Accordion, AccordionItem, Input, Button, Card, CardBody, Progress, Textarea } from "@heroui/react";
import { Company } from "./types";
import {PreviewModeWrapper, ReadOnlyField} from "./PreviewModeWrapper";

interface CompanyDetailsTabProps {
    drive_companies: Company[];
    onAddCompany: () => void;
    companyName: string;
    setCompanyName: (value: string) => void;
    branch: string;
    setBranch: (value: string) => void;
    onUpdateCompany: () => void;
    company_id: string;
    setCompanyId: (value: string) => void;
    onDeleteCompany: () => void;
    companyProgressList: { id: string; progress: number; }[];
    site: string;
    setSite: (value: string) => void;
    email: string;
    setEmail: (value: string) => void;
    ph_no: string;
    setPhNo: (value: string) => void;
    desc: string;
    setCompanyDesc: (value: string) => void;
    isPreviewMode?: boolean;
}

export default function CompanyDetailsTab({ 
    drive_companies,
    onAddCompany,
    setCompanyName,
    setBranch,
    onUpdateCompany,
    setCompanyId,
    onDeleteCompany,
    companyProgressList,
    setSite,
    setEmail,
    setPhNo,
    setCompanyDesc,
    isPreviewMode = false,
}: CompanyDetailsTabProps) 
{
    if (isPreviewMode) {
        return (
            <PreviewModeWrapper>
                {drive_companies.map((company) => (
                    <div key={company._id} className="mb-8 bg-white p-6 rounded-lg border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">{company.name}</h3>
                            <div className="w-40">
                                <Progress 
                                    value={companyProgressList.find(p => p.id === company._id)?.progress || 0}
                                    className="h-2"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadOnlyField label="Branch" value={company.branch} />
                            <ReadOnlyField label="Website" value={company.site} />
                            <ReadOnlyField label="Email" value={company.email} />
                            <ReadOnlyField label="Phone" value={company.ph_no} />
                        </div>
                        <ReadOnlyField label="Description" value={company.desc} />
                    </div>
                ))}
            </PreviewModeWrapper>
        );
    }

    return (
        <Card className="w-full max-w-4xl p-6 shadow-lg">
            <CardBody className="flex flex-col gap-6">
                <h2 className="text-2xl font-semibold text-gray-800">Company Details</h2>
                
                <Accordion
                    defaultSelectedKeys="all"
                    defaultExpandedKeys="all"
                    hideIndicator
                    selectionMode="multiple"
                    className="w-full gap-4"
                >
                    {drive_companies.map((company, index) => {
                        const progress = companyProgressList.find(p => p.id === company._id)?.progress || 0;
                        
                        return (
                            <AccordionItem 
                                key={company._id} 
                                aria-label={`Company ${index + 1}`} 
                                title={
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-lg font-medium">{company.name}</span>
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
                                    <span className="text-gray-600">{company.branch}</span>
                                }
                            >
                                <div className="flex flex-col gap-6 mt-4">
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Company Name"
                                            defaultValue={company.name}
                                            variant="bordered"
                                            classNames={{
                                                label: "font-medium"
                                            }}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                        />
                                        <Input
                                            label="Branch"
                                            variant="bordered"
                                            defaultValue={company.branch}
                                            classNames={{
                                                label: "font-medium"
                                            }}
                                            onChange={(e) => setBranch(e.target.value)}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="w-full">
                                        <Textarea
                                            label="Description"
                                            variant="bordered"
                                            defaultValue={company.desc}
                                            // classNames={{
                                            //     label: "font-medium",
                                            //     input: "min-h-[80px]"
                                            // }}
                                            onChange={(e) => setCompanyDesc(e.target.value)}
                                        />
                                    </div>

                                    {/* Contact Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input
                                            label="Website"
                                            variant="bordered"
                                            defaultValue={company.site}
                                            classNames={{
                                                label: "font-medium"
                                            }}
                                            onChange={(e) => setSite(e.target.value)}
                                        />
                                        <Input
                                            label="Email"
                                            type="email"
                                            variant="bordered"
                                            defaultValue={company.email}
                                            classNames={{
                                                label: "font-medium"
                                            }}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <Input
                                            label="Phone Number"
                                            variant="bordered"
                                            defaultValue={company.ph_no}
                                            classNames={{
                                                label: "font-medium"
                                            }}
                                            onChange={(e) => setPhNo(e.target.value)}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    {drive_companies.length >= 1 && (
                                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                                            <Button 
                                                className="flex-1"
                                                variant="bordered"
                                                color="primary"
                                                size="lg"
                                                onPress={() => {
                                                    setCompanyId(company._id);
                                                    onUpdateCompany();
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
                                                    setCompanyId(company._id);
                                                    onDeleteCompany();
                                                }}
                                            >
                                                Delete Company
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionItem>
                        );
                    })}
                </Accordion>

                {/* Add Company Button */}
                <Button 
                    color="primary"
                    variant="solid"
                    size="lg"
                    className="mt-4"
                    onPress={onAddCompany}
                >
                    + Add Company
                </Button>
            </CardBody>
        </Card>
    );
}
