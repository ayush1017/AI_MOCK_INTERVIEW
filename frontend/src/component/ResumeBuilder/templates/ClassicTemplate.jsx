import React from 'react';
import { FaGithub, FaLinkedin, FaPhone, FaEnvelope } from 'react-icons/fa';

const ClassicTemplate = ({ formData }) => {
    return (
        <div className="p-8 font-serif max-w-4xl mx-auto bg-white">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                <h1 className="text-4xl font-bold mb-2">{formData.personal?.fullName}</h1>
                <p className="text-xl mb-2">{formData.personal?.location}</p>
                <div className="flex justify-center items-center space-x-6 text-sm">
                    <span className="flex items-center">
                        <FaPhone className="mr-1" /> {formData.personal?.phone}
                    </span>
                    <span className="flex items-center">
                        <FaEnvelope className="mr-1" /> {formData.personal?.email}
                    </span>
                    {formData.personal?.github && (
                        <a href={formData.personal.github} className="flex items-center hover:text-blue-600">
                            <FaGithub className="mr-1" /> GitHub
                        </a>
                    )}
                    {formData.personal?.linkedin && (
                        <a href={formData.personal.linkedin} className="flex items-center hover:text-blue-600">
                            <FaLinkedin className="mr-1" /> LinkedIn
                        </a>
                    )}
                </div>
            </div>

            {/* Technical Skills */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-center">Technical Expertise</h2>
                <div className="grid grid-cols-1 gap-4">
                    <div className="border-b pb-2">
                        <span className="font-bold">Programming Languages:</span> {formData.technicalSkills?.languages}
                    </div>
                    <div className="border-b pb-2">
                        <span className="font-bold">Technologies & Frameworks:</span> {formData.technicalSkills?.technologies}
                    </div>
                    <div className="border-b pb-2">
                        <span className="font-bold">Additional Skills:</span> {formData.technicalSkills?.skills}
                    </div>
                </div>
            </div>

            {/* Professional Experience */}
            {formData.training?.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-center">Professional Experience</h2>
                    {formData.training.map((item, index) => (
                        <div key={index} className="mb-6">
                            <div className="flex justify-between mb-2">
                                <div>
                                    <h3 className="text-xl font-bold">{item.company}</h3>
                                    <p className="italic">{item.position}</p>
                                </div>
                                <p className="text-right">{item.duration}</p>
                            </div>
                            <ul className="list-disc ml-6">
                                {item.points?.map((point, idx) => (
                                    <li key={idx} className="mb-1">{point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* Projects */}
            {formData.projects?.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-center">Notable Projects</h2>
                    {formData.projects.map((project, index) => (
                        <div key={index} className="mb-6">
                            <div className="flex justify-between mb-2">
                                <h3 className="text-xl font-bold">{project.title}</h3>
                                <p>{project.duration}</p>
                            </div>
                            <p className="italic mb-2">{project.technologies}</p>
                            <ul className="list-disc ml-6">
                                {project.points?.map((point, idx) => (
                                    <li key={idx} className="mb-1">{point}</li>
                                ))}
                            </ul>
                            {project.githubLink && (
                                <p className="text-sm">
                                    <a href={project.githubLink} className="text-blue-600 hover:underline">
                                        View Project Repository
                                    </a>
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Education */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-center">Education</h2>
                {formData.education?.map((edu, index) => (
                    <div key={index} className="mb-4">
                        <div className="flex justify-between mb-1">
                            <h3 className="text-xl font-bold">{edu.institution}</h3>
                            <p>{edu.duration}</p>
                        </div>
                        <p className="italic">{edu.degree}</p>
                        <p>{edu.location}</p>
                        {edu.details && <p className="mt-1">{edu.details}</p>}
                    </div>
                ))}
            </div>

            {/* Certifications */}
            {formData.certifications?.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-center">Professional Certifications</h2>
                    {formData.certifications.map((cert, index) => (
                        <div key={index} className="mb-3 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold">{cert.title}</h3>
                                <p className="italic">{cert.platform}</p>
                                {cert.certificateLink && (
                                    <a 
                                        href={cert.certificateLink}
                                        className="text-blue-600 hover:underline text-sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Certificate
                                    </a>
                                )}
                            </div>
                            <p>{cert.date}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassicTemplate;