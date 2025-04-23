'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import ResumeForm from '../../components/ResumeForm';
import ResumePreview from '../../components/ResumePreview';
import { useStudentManagement } from '../../components/useStudentManagement';
import { Resume } from '../../components/types';

export default function EditResumePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resumeId = searchParams.get('id');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [view, setView] = useState<'form' | 'preview'>('form');
    const [formData, setFormData] = useState<Resume>({
        title: '',
        student_id: '',
        first_name: '',
        last_name: '',
        email: '',
        education: [],
        work_experience: [],
        skills: [],
        projects: [],
        certificates: []
    });

    const { handleUpdateResume, handleFetchResumeById } = useStudentManagement();

    useEffect(() => {
        const fetchResume = async () => {
            if (!resumeId) {
                setError('Resume ID not found');
                setLoading(false);
                return;
            }

            try {
                const resume = await handleFetchResumeById(resumeId);
                if (resume) {
                    setFormData(resume);
                }
            } catch (err) {
                setError('Failed to fetch resume');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResume();
    }, [resumeId, handleFetchResumeById]);

    const handleSubmit = async () => {
        if (!resumeId) return;

        try {
            await handleUpdateResume(resumeId, formData);
            router.push('/students/resumes');
        } catch (error) {
            console.error('Failed to update resume:', error);
            setError('Failed to update resume');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Edit Resume</h1>
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
                                Update Resume
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
                            Update Resume
                        </Button>
                    </div>
                </>
                )}
            </div>
        </div>
    );
}