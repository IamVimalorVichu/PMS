'use client';

import React, { useState } from 'react';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import ResumeForm from '../../components/ResumeForm';
import ResumePreview from '../../components/ResumePreview';
import { useStudentManagement } from '../../components/useStudentManagement';
import { Resume } from '../../components/types';

export default function CreateResume() {
    const router = useRouter();
    const { student, handleCreateResume } = useStudentManagement();
    const [view, setView] = useState<'form' | 'preview'>('form');
    const [formData, setFormData] = useState<Resume>({
        student_id: student?._id || '',
        first_name: student?.first_name || '',
        last_name: student?.last_name || '',
        email: student?.email || '',
        title: '',
        education: [],
        work_experience: [],
        skills: [],
        projects: [],
        achievements: [],
        certificates: []
    });

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            alert('Please enter a resume title');
            return;
        }
        try {
            await handleCreateResume(formData);
            router.push('/students/resumes');
        } catch (error) {
            console.error('Failed to create resume:', error);
            // You might want to add error handling UI here
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Create Resume</h1>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Enter Resume Title"
                            className="px-3 py-1 border rounded-md"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                        {!formData.title && 
                            <span className="text-red-500 text-sm">*Required</span>
                        }
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Creating as</p>
                        <p className="font-medium">{student?.first_name} {student?.last_name}</p>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant={view === 'form' ? 'solid' : 'light'}
                            onPress={() => setView('form')}
                        >
                            Edit
                        </Button>
                        <Button
                            variant={view === 'preview' ? 'solid' : 'light'}
                            onPress={() => setView('preview')}
                        >
                            Preview
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                {view === 'form' ? (
                    <>
                        <ResumeForm formData={formData} setFormData={setFormData} />
                        <div className="mt-6 flex justify-end gap-4">
                            <Button
                                variant="light"
                                onPress={() => router.push('/students/resumes')}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onPress={handleSubmit}
                            >
                                Create Resume
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                    <ResumePreview formData={formData} />
                    <div className="mt-6 flex justify-end gap-4">
                            <Button
                                variant="light"
                                onPress={() => router.push('/students/resumes')}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onPress={handleSubmit}
                            >
                                Create Resume
                            </Button>
                        </div>
                        </>
                )}
            </div>
        </div>
    );
}