// ResumePDFDocument.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link, Font } from '@react-pdf/renderer';
import { Resume } from './types';

// // --- Hyphenation Setup 2.0 ---
// import createHyphenator from 'hyphen';
// import hyphenationPatternsEnUs from 'hyphenation.en-us';

// const hyphenate = createHyphenator(hyphenationPatternsEnUs);

// Font.registerHyphenationCallback(word => {
//     // Don't hyphenate short words or words with special characters/numbers
//     if (word.length < 6 || /[\d\W]/.test(word)) {
//         return [word];
//     }
//     // Attempt to hyphenate
//     try {
//         const result = hyphenate(word);
//         if (result instanceof Promise) {
//             console.warn("Async hyphenation not supported, returning original word");
//             return [word];
//         }
//         // Return syllables; @react-pdf needs an array of strings
//         return result.split('\u00AD'); // Split by soft hyphen added by hyphenate
//     } catch (e) {
//         console.error("Hyphenation error:", e);
//         return [word]; // Fallback
//     }
// });


// import  createHyphenator  from 'hyphen';
// import hyphenationPatternsEnUs from 'hyphenation.en-us';

// const hyphenate = createHyphenator(hyphenationPatternsEnUs);

// Font.registerHyphenationCallback(word => {
//     // Don't hyphenate short words or words with special characters/numbers
//     if (word.length < 6 || /[\d\W]/.test(word)) {
//         return [word];
//     }
//     // Attempt to hyphenate
//     try {
//         const hyphenated = hyphenate(word);
//         // Return syllables; @react-pdf needs an array of strings
//         if (typeof hyphenated === 'string' && hyphenated) {
//             const parts = hyphenated.split('\u00AD');
//             return parts.length > 0 ? parts : [word];
//         }
//         return [word]; // Return original word for undefined or Promise<string>
//     } catch (e) {
//         console.error("Hyphenation error:", e);
//         return [word]; // Fallback
//     }
// });

import Hypher from 'hypher';
import english from 'hyphenation.en-us';

// Initialize hyphenator
const hypher = new Hypher(english);

Font.registerHyphenationCallback(word => {
    // Don't hyphenate short words or words with special characters/numbers
    if (word.length < 6 || /[\d\W]/.test(word)) {
        return [word];
    }
    // Attempt to hyphenate
    try {
        const hyphenatedParts = hypher.hyphenate(word);
        return hyphenatedParts.length > 0 ? hyphenatedParts : [word];
    } catch (e) {
        console.error("Hyphenation error:", e);
        return [word]; // Fallback
    }
});

const formatDate = (date: string | Date | null): string => {
    if (!date) return "";
    // Ensure it's a Date object before calling methods
    const d = date instanceof Date ? date : new Date(date);
     if (isNaN(d.getTime())) return ""; // Handle invalid date strings/objects
    return d.toISOString().split('T')[0];
};

// --- Font Registration (Example - KEEP if you have it) ---
/*
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf' },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
    // ... other weights
  ],
});
*/

// --- StyleSheet (with adjustments for wrapping and labels) ---
const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica', // Or your registered font
        fontSize: 10,
        padding: 40, // Approx 1.5cm margin on A4
        lineHeight: 1.4,
        color: '#374151',
        backgroundColor: '#ffffff',
    },
    // --- Header ---
    header: {
        textAlign: 'center',
        marginBottom: 20,
    },
    name: {
        fontSize: 24, // Adjusted size slightly
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#11182C',
    },
    objective: {
        textAlign: 'justify',
        marginBottom: 10,
        marginHorizontal: 'auto',
        maxWidth: '95%', // Ensure it doesn't hit page edge
        fontSize: 10, // Match base font size or adjust
        // Hyphenation callback registered globally will apply here
    },
    contactInfo: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10, // Adjusted gap
        rowGap: 5,
        fontSize: 9,
        marginTop: 5,
    },
    contactLink: {
        color: '#2563EB',
        textDecoration: 'none',
    },
    contactText: {
       // Address might need more careful wrapping/structuring if very long
       maxWidth: 180, // Example: Limit width of address block if needed
       textAlign: 'center', // Keep centered if wrapped
    },

    // --- Sections ---
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        borderBottomWidth: 1.5,
        borderBottomColor: '#D1D5DB',
        paddingBottom: 3,
        marginBottom: 8,
        textTransform: 'uppercase',
    },

    // --- Label Style ---
    label: {
        fontWeight: 'bold', // Make labels stand out
        marginRight: 4,     // Add a little space after the label
        color: '#1F2937',   // Slightly darker/bolder color for label
    },

    // --- Skills ---
    skillsContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6, // Increased gap slightly
    },
    skillItem: {
       backgroundColor: '#E5E7EB',
       color: '#1F2937',
       paddingHorizontal: 10, // Adjusted padding
       paddingVertical: 4,
       borderRadius: 12,
       fontSize: 9,
    },

    // --- Generic List Item Styling ---
    listItemContainer: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 3,
        paddingLeft: 10, // Indent bullet points
    },
    bulletPoint: {
        width: 15, // Wider to ensure alignment
        fontSize: 10,
        // Ensure bullet is rendered consistently if needed:
        // position: 'absolute', left: 0, top: 0, // Alternative positioning
    },
    listItemText: {
        flex: 1,
        // Hyphenation callback applies here too
    },

    // --- Education, Experience, Projects, Certs ---
    itemContainer: {
        marginBottom: 12, // Increased spacing
    },
    itemHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 3, // Increased spacing
        flexWrap: 'wrap', // Allow wrapping if title/date are long
    },
    itemTitle: { // Now contains Title/Job Role/Project Name etc.
        fontSize: 11,
        fontWeight: 'semibold', // Use numeric weight if font registered
        color: '#1F2937',
        // No label needed here usually, it's the main identifier
        flexBasis: '70%', // Give title more space before wrapping
        marginRight: 10,
    },
    itemSubtitle: { // Company / Course / Institute
        fontSize: 10,
        // fontWeight: 'medium', // May need specific font support
        color: '#374151',
        marginBottom: 2, // Increased spacing
        // Label added dynamically below
    },
    itemTertiary: { // University / GPA / etc.
        fontSize: 9,
        color: '#4B5563',
        marginBottom: 3,
        // Label added dynamically below
    },
    itemDate: {
        fontSize: 9,
        color: '#4B5563',
        textAlign: 'right',
        minWidth: 100, // Ensure enough space for date range
        flexShrink: 0, // Prevent date from shrinking too much
    },
    itemUrl: {
        color: '#2563EB',
        fontSize: 9,
        textDecoration: 'none',
        marginLeft: 5,
    },
    itemDescription: {
        marginTop: 4, // Space before description points
    },
    itemTechnologies: {
       fontSize: 9,
       fontStyle: 'italic',
       color: '#4B5563',
       marginBottom: 4,
    },
    // --- Certifications --- (Slightly different structure often)
    certItemHeader: {
       display: 'flex',
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'flex-start',
       flexWrap: 'wrap',
    },
    certDetails: {
       flexBasis: '75%', // Allow more space for title/institute
       marginRight: 10,
       marginBottom: 3,
    },
    certDate: { // Combined with Issuer potentially
        fontSize: 9,
        color: '#4B5563',
        textAlign: 'right',
        minWidth: 80,
        flexShrink: 0,
    },
});

// (Keep ensureUrlHasProtocol helper function as before)
const ensureUrlHasProtocol = (url: string | undefined | null): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `https://${url}`; // Default to https
}

interface ResumePDFDocumentProps {
    formData: Resume;
}

interface ResumePDFDocumentProps {
    formData: Resume;
}

export default function ResumePDFDocument({ formData }: ResumePDFDocumentProps) {

    const renderBulletedList = (text: string | undefined | null) => {
        if (!text) return null;
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map((line, index) => (
                // Apply hyphenation to list items
                <View key={index} style={styles.listItemContainer}>
                    <Text style={styles.bulletPoint}>•</Text>
                    {/* Text component will use global hyphenation */}
                    <Text style={styles.listItemText}>{line}</Text>
                </View>
            ));
    };

    return (
        <Document title={`${formData.first_name} ${formData.last_name} - Resume`}>
            {/* Apply hyphenation globally via Font.registerHyphenationCallback */}
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    {/* Name should generally not need hyphenation unless extremely long */}
                    <Text style={styles.name}>
                        {formData.first_name} {formData.middle_name} {formData.last_name}
                    </Text>
                    {/* Objective will use hyphenation */}
                    {formData.objective && (
                        <Text style={styles.objective}>{formData.objective}</Text>
                    )}
                    {/* Contact Info */}
                    <View style={styles.contactInfo}>
                        {formData.email && <Link style={styles.contactLink} src={`mailto:${formData.email}`}>{formData.email}</Link>}
                        {formData.ph_no && <Text style={styles.contactText}>{formData.ph_no}</Text>}
                        {(formData.address || formData.city || formData.state) && (
                            <Text style={styles.contactText}>
                                {/* Maybe add label? Or just let context imply address */}
                                {`${formData.address ? formData.address + ', ' : ''}${formData.city ? formData.city + ', ' : ''}${formData.state || ''}`}
                            </Text>
                        )}
                         {/* Links usually don't need hyphenation */}
                         {formData.linkedin_url && ( <Link style={styles.contactLink} src={ensureUrlHasProtocol(formData.linkedin_url)}>LinkedIn</Link> )}
                         {formData.github_url && ( <Link style={styles.contactLink} src={ensureUrlHasProtocol(formData.github_url)}>GitHub</Link> )}
                    </View>
                </View>

                {/* Skills */}
                {formData.skills && formData.skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsContainer}>
                            {formData.skills.map((skill, index) => skill.trim() && (
                                <Text key={index} style={styles.skillItem}>
                                    {skill.trim()}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}

                {/* Education */}
                {formData.education && formData.education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {formData.education.map((edu, index) => (
                            <View key={index} style={styles.itemContainer} wrap={false}> {/* Prevent breaking item across pages if possible */}
                                <View style={styles.itemHeader}>
                                    {/* Institute is the primary identifier */}
                                    <Text style={styles.itemTitle}>{edu.institute}</Text>
                                    <Text style={styles.itemDate}>
                                        {formatDate(edu.start_time ?? null)} - {edu.end_time === 'Present' ? 'Present' : formatDate(edu.end_time ?? null)}
                                    </Text>
                                </View>
                                {/* Add Labels for Course/GPA/University */}
                                <Text style={styles.itemSubtitle}>
                                    <Text style={styles.label}>Course:</Text> {edu.course} {edu.gpa && `- ${edu.gpa} GPA`}
                                </Text>
                                <Text style={styles.itemTertiary}>
                                    <Text style={styles.label}>University:</Text> {edu.university}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                 {/* Work Experience */}
                 {formData.work_experience && formData.work_experience.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Work Experience</Text>
                        {formData.work_experience.map((exp, index) => (
                            <View key={index} style={styles.itemContainer} wrap={false}>
                                <View style={styles.itemHeader}>
                                     {/* Job Title is primary */}
                                    <Text style={styles.itemTitle}>{exp.job_title}</Text>
                                    <Text style={styles.itemDate}>
                                        {formatDate(exp.start_time ?? null)} - {exp.end_time === 'Present' ? 'Present' : formatDate(exp.end_time ?? null)}
                                    </Text>
                                </View>
                                 {/* Add Label for Company */}
                                <Text style={styles.itemSubtitle}>
                                    <Text style={styles.label}>Company:</Text> {exp.company}
                                </Text>
                                {exp.description && (
                                    <View style={styles.itemDescription}>
                                        {renderBulletedList(exp.description)}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Projects */}
                {formData.projects && formData.projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {formData.projects.map((project, index) => (
                            <View key={index} style={styles.itemContainer} wrap={false}>
                                <View style={styles.itemHeader}>
                                    {/* Project Title is primary */}
                                    <Text style={styles.itemTitle}>
                                        {project.title}
                                        {project.url && (
                                            <Link style={styles.itemUrl} src={ensureUrlHasProtocol(project.url)}> [Link]</Link>
                                        )}
                                    </Text>
                                    <Text style={styles.itemDate}>
                                        {formatDate(project.start_time ?? null)} - {formatDate(project.end_time ?? null) || 'Ongoing'}
                                    </Text>
                                </View>
                                {project.technologies && (
                                    <Text style={styles.itemTechnologies}>
                                        <Text style={styles.label}>Technologies:</Text> {project.technologies}
                                    </Text>
                                )}
                                {project.description && (
                                    <View style={styles.itemDescription}>
                                        {renderBulletedList(project.description)}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Achievements */}
                {formData.achievements && formData.achievements.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Achievements</Text>
                         {/* Achievements are usually just a list */}
                        {formData.achievements.map((achievement, index) => achievement.trim() && (
                           <View key={index} style={styles.listItemContainer} wrap={false}>
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text style={styles.listItemText}>{achievement.trim()}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Certificates */}
                {formData.certificates && formData.certificates.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Certifications</Text>
                        {formData.certificates.map((cert, index) => (
                            <View key={index} style={styles.itemContainer} wrap={false}>
                                <View style={styles.certItemHeader}>
                                    <View style={styles.certDetails}>
                                        {/* Cert Title is primary */}
                                        <Text style={styles.itemTitle}>
                                             {cert.title}
                                             {cert.url && (
                                                <Link style={styles.itemUrl} src={ensureUrlHasProtocol(cert.url)}> [Link]</Link>
                                            )}
                                        </Text>
                                         {/* Add Label for Institute */}
                                        <Text style={styles.itemSubtitle}>
                                            <Text style={styles.label}>Institute:</Text> {cert.institute}
                                        </Text>
                                    </View>
                                    <Text style={styles.certDate}>
                                        {cert.issued_date && `Issued: ${formatDate(cert.issued_date)}`}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

            </Page>
        </Document>
    );
}