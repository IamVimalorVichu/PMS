'use client';

import { Resume, Education, WorkExperience, Project, Certificate } from './types';
import { Button } from '@heroui/react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

interface ResumeFormProps {
    formData: Resume;
    setFormData: (data: Resume) => void;
}

export default function ResumeForm({ formData, setFormData }: ResumeFormProps) {
    const handleChange = (section: keyof Resume, value: any) => {
        setFormData({ ...formData, [section]: value });
    };

    // Update the handleArrayChange function to handle both objects and primitive values
    const handleArrayChange = (section: keyof Resume, index: number, value: any) => {
        const newArray = [...(formData[section] as any[] || [])];
        if (section === 'achievements') {
            // For achievements, directly set the string value
            newArray[index] = value;
        } else {
            // For objects (education, projects, etc.), spread the existing object
            newArray[index] = { ...newArray[index], ...value };
        }
        setFormData({ ...formData, [section]: newArray });
    };

    // Update the addArrayItem function to handle achievements
    const addArrayItem = (section: keyof Resume, template: any) => {
        const newArray = [...(formData[section] as any[] || [])];
        if (section === 'achievements') {
            // For achievements, add an empty string
            newArray.push('');
        } else {
            // For objects, add the template object
            newArray.push(template);
        }
        setFormData({ ...formData, [section]: newArray });
    };

    const removeArrayItem = (section: keyof Resume, index: number) => {
        const newArray = (formData[section] as any[] || []).filter((_, i) => i !== index);
        setFormData({ ...formData, [section]: newArray });
    };

    return (
        <form className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Personal Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={formData.first_name || ''}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={formData.last_name || ''}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className=''>Objective</label>
                        <textarea
                            className="w-full p-2 border rounded"
                            value={formData.objective || ''}
                            onChange={(e) => handleChange('objective', e.target.value)}
                            placeholder="Write your objective here"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 border rounded"
                            value={formData.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                            type="tel"
                            className="w-full p-2 border rounded"
                            value={formData.ph_no || ''}
                            onChange={(e) => handleChange('ph_no', e.target.value)}
                            maxLength={10}
                        />
                    </div>
                    <div>
                        <label className=''>Address</label>
                        <textarea
                            className="w-full p-2 border rounded"
                            value={formData.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                            placeholder="Enter your address"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className=''>City</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={formData.city || ''}
                            onChange={(e) => handleChange('city', e.target.value)}
                            placeholder="Enter your city"
                        />
                    </div>
                    <div>
                        <label className=''>State</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={formData.state || ''}
                            onChange={(e) => handleChange('state', e.target.value)}
                            placeholder="Enter your state"
                        /> 
                    </div> 
                </div>
            </div>

            {/* Education */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Education</h2>
                    <Button
                        variant="light"
                        onPress={() => addArrayItem('education', {
                            institute: '',
                            university: '',
                            course: '',
                            start_time: '',
                            end_time: '',
                            gpa: ''
                        })}
                        className="flex items-center gap-2"
                    >
                        <FiPlus /> Add Education
                    </Button>
                </div>
                {formData.education?.map((edu, index) => (
                    <div key={index} className="p-4 border rounded space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="Institute"
                                className="w-full p-2 border rounded"
                                value={edu.institute}
                                onChange={(e) => handleArrayChange('education', index, { institute: e.target.value })}
                            />
                            <input
                                placeholder="University"
                                className="w-full p-2 border rounded"
                                value={edu.university}
                                onChange={(e) => handleArrayChange('education', index, { university: e.target.value })}
                            />
                            <input
                                placeholder="Course"
                                className="w-full p-2 border rounded"
                                value={edu.course}
                                onChange={(e) => handleArrayChange('education', index, { course: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="GPA"
                                className="w-full p-2 border rounded"
                                value={edu.gpa || ''}
                                onChange={(e) => handleArrayChange('education', index, { gpa: parseFloat(e.target.value) })}
                            />
                            <input
                                type="date"
                                placeholder="Start Date"
                                className="w-full p-2 border rounded"
                                value={edu.start_time}
                                onChange={(e) => handleArrayChange('education', index, { start_time: e.target.value })}
                            />
                            <input
                                type="date"
                                placeholder="End Date"
                                className="w-full p-2 border rounded"
                                value={edu.end_time}
                                onChange={(e) => handleArrayChange('education', index, { end_time: e.target.value })}
                            />
                        </div>
                        <Button
                            variant="ghost"
                            onPress={() => removeArrayItem('education', index)}
                            className="text-red-600"
                        >
                            <FiTrash2 /> Remove
                        </Button>
                    </div>
                ))}
            </div>

            {/* Work Experience */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Work Experience</h2>
                    <Button
                        variant="light"
                        onPress={() => addArrayItem('work_experience', {
                            company: '',
                            job_title: '',
                            description: '',
                            start_time: '',
                            end_time: ''
                        })}
                        className="flex items-center gap-2"
                    >
                        <FiPlus /> Add Experience
                    </Button>
                </div>
                {formData.work_experience?.map((exp, index) => (
                    <div key={index} className="p-4 border rounded space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="Company"
                                className="w-full p-2 border rounded"
                                value={exp.company}
                                onChange={(e) => handleArrayChange('work_experience', index, { company: e.target.value })}
                            />
                            <input
                                placeholder="Job Title"
                                className="w-full p-2 border rounded"
                                value={exp.job_title}
                                onChange={(e) => handleArrayChange('work_experience', index, { job_title: e.target.value })}
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full p-2 border rounded col-span-2"
                                value={exp.description || ''}
                                onChange={(e) => handleArrayChange('work_experience', index, { description: e.target.value })}
                            />
                            <input
                                type="date"
                                placeholder="Start Date"
                                className="w-full p-2 border rounded"
                                value={exp.start_time}
                                onChange={(e) => handleArrayChange('work_experience', index, { start_time: e.target.value })}
                            />
                            <input
                                type="date"
                                placeholder="End Date"
                                className="w-full p-2 border rounded"
                                value={exp.end_time}
                                onChange={(e) => handleArrayChange('work_experience', index, { end_time: e.target.value })}
                            />
                        </div>
                        <Button
                            variant="ghost"
                            onPress={() => removeArrayItem('work_experience', index)}
                            className="text-red-600"
                        >
                            <FiTrash2 /> Remove
                        </Button>
                    </div>
                ))}
            </div>

            {/* Skills */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Skills</h2>
                <textarea
                    className="w-full p-2 border rounded"
                    placeholder="Enter your skills (comma separated)"
                    value={formData.skills?.join(', ') || ''}
                    onChange={(e) => handleChange('skills', e.target.value.split(',').map(skill => skill.trim()))}
                />
            </div>

            {/* Achievements */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Achievements</h2>
                    <Button
                        variant="light"
                        onPress={() => addArrayItem('achievements', '')}
                        className="flex items-center gap-2"
                    >
                        <FiPlus /> Add Achievement
                    </Button>
                </div>
                {formData.achievements?.map((achievement, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <input
                            placeholder="Achievement"
                            className="w-full p-2 border rounded"
                            value={achievement}
                            onChange={(e) => handleArrayChange('achievements', index, e.target.value)}
                        />
                        <Button
                            variant="ghost"
                            onPress={() => removeArrayItem('achievements', index)}
                            className="text-red-600"
                        >
                            <FiTrash2 />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Projects */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Projects</h2>
                    <Button
                        variant="light"
                        onPress={() => addArrayItem('projects', {
                            title: '',
                            description: '',
                            url: '',
                            start_time: '',
                            end_time: ''
                        })}
                        className="flex items-center gap-2"
                    >
                        <FiPlus /> Add Project
                    </Button>
                </div>
                {formData.projects?.map((project, index) => (
                    <div key={index} className="p-4 border rounded space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="Project Title"
                                className="w-full p-2 border rounded"
                                value={project.title}
                                onChange={(e) => handleArrayChange('projects', index, { title: e.target.value })}
                            />
                            <input
                                placeholder="Project URL"
                                className="w-full p-2 border rounded"
                                value={project.url || ''}
                                onChange={(e) => handleArrayChange('projects', index, { url: e.target.value })}
                            />
                            <textarea
                                placeholder="Project Description"
                                className="w-full p-2 border rounded col-span-2"
                                value={project.description}
                                onChange={(e) => handleArrayChange('projects', index, { description: e.target.value })}
                            />
                            <input
                                type="date"
                                placeholder="Start Date"
                                className="w-full p-2 border rounded"
                                value={project.start_time}
                                onChange={(e) => handleArrayChange('projects', index, { start_time: e.target.value })}
                            />
                            <input
                                type="date"
                                placeholder="End Date"
                                className="w-full p-2 border rounded"
                                value={project.end_time}
                                onChange={(e) => handleArrayChange('projects', index, { end_time: e.target.value })}
                            />
                        </div>
                        <Button
                            variant="ghost"
                            onPress={() => removeArrayItem('projects', index)}
                            className="text-red-600"
                        >
                            <FiTrash2 /> Remove
                        </Button>
                    </div>
                ))}
            </div>

            {/* Certificates */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Certificates</h2>
                    <Button
                        variant="light"
                        onPress={() => addArrayItem('certificates', {
                            title: '',
                            institute: '',
                            issue_date: '',
                            url: '',
                        })}
                        className="flex items-center gap-2"
                    >
                        <FiPlus /> Add Certificate
                    </Button>
                </div>
                {formData.certificates?.map((cert, index) => (
                    <div key={index} className="p-4 border rounded space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="Certificate Title"
                                className="w-full p-2 border rounded"
                                value={cert.title}
                                onChange={(e) => handleArrayChange('certificates', index, { title: e.target.value })}
                            />
                            <input
                                placeholder="Institute"
                                className="w-full p-2 border rounded"
                                value={cert.institute}
                                onChange={(e) => handleArrayChange('certificates', index, { institute: e.target.value })}
                            />
                            <input
                                type="date"
                                placeholder="Issue Date"
                                className="w-full p-2 border rounded"
                                value={cert.issued_date}
                                onChange={(e) => handleArrayChange('certificates', index, { issue_date: e.target.value })}
                            />
                            <input
                                placeholder="Certificate URL"
                                className="w-full p-2 border rounded"
                                value={cert.url || ''}
                                onChange={(e) => handleArrayChange('certificates', index, { url: e.target.value })}
                            />
                        </div>
                        <Button
                            variant="ghost"
                            onPress={() => removeArrayItem('certificates', index)}
                            className="text-red-600"
                        >
                            <FiTrash2 /> Remove
                        </Button>
                    </div>
                ))}
                </div>
        </form>
    );
}