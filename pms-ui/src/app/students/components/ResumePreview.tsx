//ResumePreview.ts

'use client';

import { Resume } from './types';

const formatDate = (date: string | Date | null): string => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split('T')[0]; // Simple YYYY-MM-DD format
};

interface ResumePreviewProps {
    formData: Resume;
}

export default function ResumePreview({ formData }: ResumePreviewProps) {
    return (
        // Standard A4 width approx. 21cm. Added min-h-screen for better viewing if content is short.
        // overflow-hidden helps ensure nothing bleeds out,配合 break-words
        <div className="w-[21cm] min-h-[29.7cm] mx-auto bg-white shadow-lg p-8 overflow-hidden">
            <div className="space-y-6">
                {/* Header/Personal Info */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-bold mb-2 break-words"> {/* Added break-words */}
                        {formData.first_name} {formData.middle_name} {formData.last_name}
                    </h1>

                    {/* Objective/Summary */}
                    {formData.objective && (
                        <p className="text-gray-700 text-justify mb-4 max-w-3xl mx-auto break-words"> {/* Added break-words */}
                            {formData.objective}
                        </p>
                    )}

                    {/* Contact Details */}
                    <div className="text-gray-700 flex flex-wrap items-center justify-center gap-x-4 gap-y-1"> {/* Adjusted gap */}
                        {formData.email && (
                            <a href={`mailto:${formData.email}`} className="text-blue-600 hover:underline break-all"> {/* Use break-all for emails/URLs */}
                                {formData.email}
                            </a>
                        )}
                       {formData.ph_no && (
                           <a href={`tel:${formData.ph_no}`} className="hover:underline break-words"> {/* Added break-words */}
                               {formData.ph_no}
                           </a>
                       )}
                        {formData.address && (
                            <span className="break-words"> {/* Added break-words */}
                                {formData.address}{formData.city && `, ${formData.city}`}{formData.state && `, ${formData.state}`}
                            </span>
                        )}
                        {formData.linkedin_url && (
                            <a href={formData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all"> {/* Use break-all */}
                                {formData.linkedin_url.replace(/^https?:\/\//, '')} {/* Simplified display */}
                            </a>
                        )}
                        {formData.github_url && (
                            <a href={formData.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all"> {/* Use break-all */}
                                {formData.github_url.replace(/^https?:\/\//, '')} {/* Simplified display */}
                            </a>
                        )}
                    </div>
                </div>

                {/* Skills Section */}
                {formData.skills && formData.skills.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3">
                            SKILLS
                        </h2>
                        {/* Using flex-wrap for skills can be visually cleaner than a simple list */}
                        <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill, index) => (
                                <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm break-words"> {/* Added break-words */}
                                    {skill}
                                </span>
                            ))}
                        </div>
                        {/* --- OR Keep the list format if preferred ---
                         <ul className="list-disc list-inside space-y-1">
                            {formData.skills.map((skill, index) => (
                                <li key={index} className="text-gray-700 break-words"> // Added break-words
                                    {skill}
                                </li>
                            ))}
                        </ul> */}
                    </div>
                )}

                {/* Education Section */}
                {formData.education && formData.education.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3">
                            EDUCATION
                        </h2>
                        <div className="space-y-4">
                            {formData.education.map((edu, index) => (
                                <div key={index}> {/* Removed grid layout for simpler flow */}
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1">
                                        <h3 className="font-semibold text-gray-800 break-words">{edu.institute}</h3> {/* Added break-words */}
                                        <p className="text-gray-600 text-sm sm:text-right whitespace-nowrap"> {/* Prevent date range wrapping */}
                                            {edu.start_time && formatDate(edu.start_time)} - {edu.end_time === 'Present' ? 'Present' : edu.end_time ? formatDate(edu.end_time) : ''}
                                        </p>
                                    </div>
                                    <p className="font-medium text-gray-700 break-words"> {/* Added break-words */}
                                         {edu.course} {edu.gpa && `- ${edu.gpa} GPA`}
                                     </p>
                                     <p className="text-gray-600 break-words">{edu.university}</p> {/* Added break-words */}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                 {/* Work Experience Section */}
                {formData.work_experience && formData.work_experience.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3">
                            WORK EXPERIENCE
                        </h2>
                        <div className="space-y-4">
                            {formData.work_experience.map((exp, index) => (
                                <div key={index}>
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1">
                                        <h3 className="font-semibold text-gray-800 break-words">{exp.job_title}</h3> {/* Added break-words */}
                                        <p className="text-gray-600 text-sm sm:text-right whitespace-nowrap"> {/* Prevent date range wrapping */}
                                            {exp.start_time && formatDate(exp.start_time)} - {exp.end_time === 'Present' ? 'Present' : exp.end_time ? formatDate(exp.end_time) : ''}
                                        </p>
                                    </div>
                                    <p className="text-gray-700 font-medium break-words">{exp.company}</p> {/* Added break-words */}
                                    {/* Ensure description is treated as potentially multi-line */}
                                    {exp.description && (
                                         <ul className="list-disc list-outside ml-5 text-gray-700 mt-1 space-y-1">
                                             {/* Split description by newline for bullet points */}
                                             {exp.description.split('\n').map((bullet, i) => bullet.trim() && (
                                                 <li key={i} className="break-words"> {/* Added break-words */}
                                                     {bullet.trim()}
                                                 </li>
                                             ))}
                                         </ul>
                                     )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects Section */}
                {formData.projects && formData.projects.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3">
                            PROJECTS
                        </h2>
                        <div className="space-y-4">
                            {formData.projects.map((project, index) => (
                                <div key={index}>
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-1"> {/* Changed to items-start */}
                                        <h3 className="font-semibold text-gray-800 break-words"> {/* Added break-words */}
                                            {project.title}
                                            {project.url && (
                                                <a
                                                    href={project.url.startsWith('http') ? project.url : `https://${project.url}`} // Ensure protocol
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 text-sm ml-2 hover:underline break-all" // Use break-all for URLs
                                                >
                                                    [Link]
                                                </a>
                                            )}
                                        </h3>
                                         <p className="text-gray-600 text-sm sm:text-right whitespace-nowrap mt-1 sm:mt-0"> {/* Prevent date range wrapping */}
                                             {project.start_time && formatDate(project.start_time)} - {project.end_time ? formatDate(project.end_time) : 'Ongoing'}
                                         </p>
                                    </div>
                                     {/* Display technologies if provided */}
                                     {project.technologies && (
                                         <p className="text-gray-600 text-sm italic mb-1 break-words"> {/* Added break-words */}
                                             Technologies: {project.technologies}
                                         </p>
                                     )}
                                     {/* Ensure description is treated as potentially multi-line */}
                                     {project.description && (
                                         <ul className="list-disc list-outside ml-5 text-gray-700 space-y-1">
                                             {project.description.split('\n').map((bullet, i) => bullet.trim() && (
                                                 <li key={i} className="break-words"> {/* Added break-words */}
                                                     {bullet.trim()}
                                                 </li>
                                             ))}
                                         </ul>
                                     )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Achievements Section */}
                {formData.achievements && formData.achievements.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3">
                            ACHIEVEMENTS
                        </h2>
                        <ul className="list-disc list-outside ml-5 space-y-1"> {/* Reduced space */}
                            {formData.achievements.map((achievement, index) => achievement.trim() && (
                                <li key={index} className="text-gray-700 break-words"> {/* Added break-words */}
                                    {achievement.trim()}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Certificates Section */}
                {formData.certificates && formData.certificates.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3">
                            CERTIFICATIONS
                        </h2>
                        <div className="space-y-3"> {/* Adjusted spacing */}
                            {formData.certificates.map((cert, index) => (
                                <div key={index} className="flex flex-col sm:flex-row justify-between sm:items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 break-words"> {/* Added break-words */}
                                            {cert.title}
                                            {cert.url && (
                                                <a
                                                    href={cert.url.startsWith('http') ? cert.url : `https://${cert.url}`} // Ensure protocol
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 text-sm ml-2 hover:underline break-all" // Use break-all for URLs
                                                >
                                                    [Link]
                                                </a>
                                            )}
                                        </h3>
                                        <p className="text-gray-600 break-words">{cert.institute}</p> {/* Added break-words */}
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1 sm:mt-0 sm:text-right whitespace-nowrap"> {/* Prevent date wrap */}
                                        {cert.issued_date && `Issued: ${formatDate(cert.issued_date)}`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}