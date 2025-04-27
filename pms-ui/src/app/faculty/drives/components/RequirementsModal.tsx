import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Tabs,
    Tab,
    Input,
    Textarea,
  } from "@heroui/react";
  
  interface RequirementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string; // Assuming jobId might be needed later, keeping it for now.
    sslcCgpa: number;
    setSslcCgpa: (value: number) => void;
    plustwoCgpa: number;
    setPlustwoCgpa: (value: number) => void;
    degreeCgpa: number;
    setDegreeCgpa: (value: number) => void;
    mcaCgpa: number[]; // Note: mcaCgpa/setMcaCgpa aren't used in the provided modal body.
    setMcaCgpa: (value: number[]) => void; // Consider removing if unused.
    contract: number;
    setContract: (value: number) => void;
    additionalCriteria: string;
    setAdditionalCriteria: (value: string) => void;
    skillsRequired: string[];
    setSkillsRequired: (value: string[]) => void;
    preferredQualifications: string[];
    setPreferredQualifications: (value: string[]) => void;
    requiredCertifications: string[];
    setRequiredCertifications: (value: string[]) => void;
    languageRequirements: string[];
    setLanguageRequirements: (value: string[]) => void;
    onAddRequirement: () => void;
    skillInput: string;
    setSkillInput: (value: string) => void;
  }
  
  // --- DynamicListInput Component ---
  interface DynamicListInputProps {
    items: string[];
    onItemsChange: (items: string[]) => void;
    label: string;
    placeholder: string;
  }
  
  const DynamicListInput = ({
    items,
    onItemsChange,
    label,
    placeholder,
  }: DynamicListInputProps) => {
    const addNewItem = () => {
      onItemsChange([...items, ""]);
    };
  
    const removeItem = (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      onItemsChange(newItems);
    };
  
    const updateItem = (index: number, value: string) => {
      const newItems = [...items];
      newItems[index] = value;
      onItemsChange(newItems);
    };
  
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          <Button size="sm" variant="light" color="primary" onPress={addNewItem}>
            + Add
          </Button>
        </div>
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className="flex-grow"
            />
            <Button
              size="sm"
              variant="light"
              color="danger"
              isIconOnly
              onPress={() => removeItem(index)}
              aria-label={`Remove ${label} item ${index + 1}`} // Added aria-label for accessibility
            >
              X {/* Consider using an icon component instead of 'X' */}
            </Button>
          </div>
        ))}
      </div>
    );
  };
  
  // --- RequirementsModal Component ---
  export default function RequirementsModal({
    isOpen,
    onClose,
    jobId, // Unused prop in the component body
    sslcCgpa,
    setSslcCgpa,
    plustwoCgpa,
    setPlustwoCgpa,
    degreeCgpa,
    setDegreeCgpa,
    contract,
    setContract,
    additionalCriteria,
    setAdditionalCriteria,
    skillsRequired,
    setSkillsRequired,
    preferredQualifications,
    setPreferredQualifications,
    requiredCertifications,
    setRequiredCertifications,
    languageRequirements,
    setLanguageRequirements,
    onAddRequirement,
    skillInput,
    setSkillInput,
  }: RequirementsModalProps) {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            size="3xl" 
            scrollBehavior="inside"
            classNames={{
                base: "max-h-[90vh]",
                header: "border-b pb-4",
                body: "py-6",
                footer: "border-t pt-4"
            }}
        >
            <ModalContent>
                <ModalHeader className="text-xl font-bold flex items-center gap-2">
                    <span>Job Requirements</span>
                    {jobId && <span className="text-sm text-gray-500">ID: {jobId}</span>}
                </ModalHeader>
                <ModalBody>
                    <Tabs
                        aria-label="Job Requirements Sections"
                        className="w-full"
                        variant="bordered"
                        classNames={{
                            tabList: "gap-4 p-4 bg-gray-50 rounded-lg mb-4",
                            cursor: "w-full bg-primary",
                            tab: "px-4 py-2 rounded-lg hover:bg-gray-100"
                        }}
                    >
                        {/* Academic Tab */}
                        <Tab key="academic" title="Academic Requirements">
                            <div className="space-y-6 p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        type="number"
                                        label="SSLC CGPA"
                                        placeholder="Enter SSLC CGPA"
                                        value={String(sslcCgpa || "")}
                                        onChange={(e) => setSslcCgpa(Number(e.target.value))}
                                        min="0"
                                        max="99"
                                        step="1"
                                        classNames={{
                                            label: "font-medium",
                                            input: "text-right"
                                        }}
                                    />
                                    <Input
                                        type="number"
                                        label="Plus Two CGPA"
                                        placeholder="Enter +2 CGPA"
                                        value={String(plustwoCgpa || "")}
                                        onChange={(e) => setPlustwoCgpa(Number(e.target.value))}
                                        min="0"
                                        max="99"
                                        step="1.0"
                                        classNames={{
                                            label: "font-medium",
                                            input: "text-right"
                                        }}
                                    />
                                    <Input
                                        type="number"
                                        label="Degree CGPA"
                                        placeholder="Enter Degree CGPA"
                                        value={String(degreeCgpa || "")}
                                        onChange={(e) => setDegreeCgpa(Number(e.target.value))}
                                        min="0"
                                        max="99"
                                        step="1"
                                        classNames={{
                                            label: "font-medium",
                                            input: "text-right"
                                        }}
                                    />
                                    <Input
                                        type="number"
                                        label="Contract Period (months)"
                                        placeholder="Enter duration"
                                        value={String(contract || "")}
                                        onChange={(e) => setContract(Number(e.target.value))}
                                        min="0"
                                        classNames={{
                                            label: "font-medium",
                                            input: "text-right"
                                        }}
                                    />
                                </div>
                            </div>
                        </Tab>

                        {/* Technical Tab */}
                        <Tab key="technical" title="Technical Requirements">
                            <div className="space-y-8 p-4">
                                {/* Skills Section */}
                                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                    <h3 className="font-medium text-gray-700">Required Skills</h3>
                                    <Input
                                        label="Add Skills"
                                        placeholder="Type skill & press Enter/Space"
                                        value={skillInput}
                                        variant="bordered"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                const newSkill = skillInput.trim();
                                                if (newSkill && !skillsRequired.includes(newSkill)) {
                                                    setSkillsRequired([...skillsRequired, newSkill]);
                                                    setSkillInput("");
                                                }
                                            }
                                        }}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                    />
                                    {skillsRequired.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {skillsRequired.map((skill, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-primary-100 rounded-full text-primary-800"
                                                >
                                                    <span>{skill}</span>
                                                    <button
                                                        onClick={() => setSkillsRequired(skillsRequired.filter((_, i) => i !== index))}
                                                        className="ml-1 hover:text-primary-900 focus:outline-none"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Certifications & Languages */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <DynamicListInput
                                            items={requiredCertifications}
                                            onItemsChange={setRequiredCertifications}
                                            label="Required Certifications"
                                            placeholder="Enter certification"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <DynamicListInput
                                            items={languageRequirements}
                                            onItemsChange={setLanguageRequirements}
                                            label="Language Requirements"
                                            placeholder="Enter language"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Tab>

                        {/* Other Tab */}
                        <Tab key="other" title="Additional Requirements">
                            <div className="space-y-6 p-4">
                                <DynamicListInput
                                    items={preferredQualifications}
                                    onItemsChange={setPreferredQualifications}
                                    label="Preferred Qualifications"
                                    placeholder="Enter qualification"
                                />
                                <Textarea
                                    label="Additional Criteria"
                                    placeholder="Enter any additional requirements..."
                                    value={additionalCriteria || ""}
                                    onChange={(e) => setAdditionalCriteria(e.target.value)}
                                    minRows={4}
                                    classNames={{
                                        input: "resize-y min-h-[120px]"
                                    }}
                                />
                            </div>
                        </Tab>
                    </Tabs>
                </ModalBody>
                <ModalFooter className="flex justify-end gap-3">
                    <Button 
                        color="danger" 
                        variant="light" 
                        onPress={onClose}
                        size="lg"
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        variant="solid"
                        onPress={onAddRequirement}
                        size="lg"
                    >
                        Save Requirements
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}