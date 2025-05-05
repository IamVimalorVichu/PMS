// AddCompanyModal.tsx
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Autocomplete, AutocompleteItem, Input } from "@heroui/react";
import { Company } from "./types";


interface AddCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyName: string;
    setCompanyName: (value: string) => void;
    branch: string;
    setBranch: (value: string) => void;
    onAddCompany: () => void;
    all_companies: Company[];
    site: string;
    setSite: (value: string) => void;
    email: string;
    setEmail: (value: string) => void;
    ph_no: string;
    setPhNo: (value: string) => void;
    desc: string;
    setCompanyDesc: (value: string) => void;
}

export default function AddCompanyModal({
    isOpen,
    onClose,
    companyName,
    setCompanyName,
    branch,
    setBranch,
    onAddCompany,
    all_companies,
    site,
    setSite,
    email,
    setEmail,
    ph_no,
    setPhNo,
    desc, 
    setCompanyDesc,
}: AddCompanyModalProps) {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            className="max-w-xl mx-auto"
        >
            <ModalContent className="p-6 shadow-xl rounded-xl bg-gradient-to-b from-white to-gray-50">
                <ModalHeader className="text-2xl font-semibold text-center border-b pb-4 mb-6 text-gray-800">
                    <h2 className="flex items-center justify-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        Add Company Details
                    </h2>
                </ModalHeader>
                <ModalBody className="space-y-6">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        onAddCompany();
                    }} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <Autocomplete
                                isRequired
                                allowsCustomValue
                                label="Company Name"
                                variant="bordered"
                                value={companyName}
                                onInputChange={(value) => setCompanyName(value)}
                                className="w-full"
                                labelPlacement="outside"
                                errorMessage={!companyName && "Company name is required"}
                                isInvalid={!companyName}
                            >
                                {all_companies.map((company) => (
                                    <AutocompleteItem key={company._id}>
                                        {company.name}
                                    </AutocompleteItem>
                                ))}
                            </Autocomplete>
                            <Autocomplete
                                isRequired
                                allowsCustomValue
                                label="Branch"
                                value={branch}
                                variant="bordered"
                                onInputChange={(value) => setBranch(value)}
                                className="w-full"
                                labelPlacement="outside"
                                errorMessage={!branch && "Branch is required"}
                                isInvalid={!branch}
                            >
                                {all_companies.map((company) => (
                                    <AutocompleteItem key={company._id}>
                                        {company.branch}
                                    </AutocompleteItem>
                                ))}
                            </Autocomplete>
                        </div>
                        
                        <Input
                            label="Description"
                            variant="bordered"
                            value={desc}
                            onChange={(e) => setCompanyDesc(e.target.value)}
                            className="w-full transition-all duration-200 focus:scale-[1.01]"
                            labelPlacement="outside"
                            placeholder="Enter company description"
                        />
                        
                        <div className="grid grid-cols-2 gap-6">
                            <Input
                                label="Website"
                                variant="bordered"
                                value={site}
                                onChange={(e) => setSite(e.target.value)}
                                className="w-full"
                                labelPlacement="outside"
                                placeholder="https://"
                            />
                            <Input
                                label="Email"
                                type="email"
                                variant="bordered"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full"
                                labelPlacement="outside"
                                placeholder="company@example.com"
                            />
                        </div>
                        
                        <Input
                            label="Phone Number"
                            variant="bordered"
                            min={10}
                            max={14}
                            type="tel"
                            value={ph_no}
                            onChange={(e) => setPhNo(e.target.value)}
                            className="w-full transition-all duration-200 focus:scale-[1.01]"
                            labelPlacement="outside"
                            placeholder="+91"
                        />
                        
                        <div className="flex justify-end">
                            <Button 
                                type="submit"
                                color="primary" 
                                className="px-8 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
                                isDisabled={!companyName || !branch}
                            >
                                Add Company
                            </Button>
                        </div>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}


