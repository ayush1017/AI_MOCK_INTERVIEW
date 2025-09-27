import React from 'react';
import { FaGithub, FaLinkedin, FaPhone, FaEnvelope } from 'react-icons/fa';

const ModernTemplate = ({ formData }) => {
    return (
        <div className="p-8 font-[system-ui] max-w-4xl mx-auto bg-white shadow-sm">
            {/* Personal Information */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold mb-2">{formData.personal?.fullName}</h1>
                <p className="text-lg text-gray-600 mb-2">{formData.personal?.location}</p>
                <div className="flex justify-center items-center space-x-4 text-sm">
                    <div className="flex items-center">
                        <FaPhone className="mr-1 w-4 h-4" />
                        {formData.personal?.phone}
                    </div>
                    <div className="flex items-center">
                        <FaEnvelope className="mr-1 w-4 h-4" />
                        <a href={`mailto:${formData.personal?.email}`} className="text-blue-600 hover:underline">
                            {formData.personal?.email}
                        </a>
                    </div>
                    {formData.personal?.github && (
                        <div className="flex items-center">
                            <FaGithub className="mr-1 w-4 h-4" />
                            <a href={formData.personal.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                GitHub
                            </a>
                        </div>
                    )}
                    {formData.personal?.linkedin && (
                        <div className="flex items-center">
                            <FaLinkedin className="mr-1 w-4 h-4" />
                            <a href={formData.personal.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                LinkedIn
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Technical Skills */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-3">Technical Skills</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold mb-1">Languages</h3>
                        <p>{formData.technicalSkills?.languages}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-1">Technologies</h3>
                        <p>{formData.technicalSkills?.technologies}</p>
                    </div>
                </div>
                <div className="mt-2">
                    <h3 className="font-semibold mb-1">Skills</h3>
                    <p>{formData.technicalSkills?.skills}</p>
                </div>
            </div>

            {/* Experience/Training */}
            {formData.training?.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-3">Professional Experience</h2>
                    {formData.training.map((item, index) => (
                        <div key={index} className="mb-4">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-xl font-semibold">{item.position}</h3>
                                <span className="text-gray-600">{item.duration}</span>
                            </div>
                            <p className="text-gray-700 italic mb-2">{item.company}</p>
                            <ul className="list-disc ml-5">
                                {item.points?.map((point, idx) => (
                                    <li key={idx} className="text-gray-700 mb-1">{point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* Projects */}
            {formData.projects?.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-3">Projects</h2>
                    {formData.projects.map((project, index) => (
                        <div key={index} className="mb-4">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-xl font-semibold">{project.title}</h3>
                                <span className="text-gray-600">{project.duration}</span>
                            </div>
                            <p className="text-gray-700 italic mb-2">{project.technologies}</p>
                            <ul className="list-disc ml-5">
                                {project.points?.map((point, idx) => (
                                    <li key={idx} className="text-gray-700 mb-1">{point}</li>
                                ))}
                            </ul>
                            {project.githubLink && (
                                <p className="text-sm text-blue-600 hover:underline">
                                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                                        View on GitHub
                                    </a>
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Education */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-3">Education</h2>
                {formData.education?.map((edu, index) => (
                    <div key={index} className="mb-4">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-xl font-semibold">{edu.institution}</h3>
                            <span className="text-gray-600">{edu.duration}</span>
                        </div>
                        <p className="text-gray-700">{edu.degree}</p>
                        <p className="text-gray-600">{edu.location}</p>
                        {edu.details && <p className="text-gray-700 mt-1">{edu.details}</p>}
                    </div>
                ))}
            </div>

            {/* Certifications */}
            {formData.certifications?.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold border-b-2 border-blue-500 pb-2 mb-3">Certifications</h2>
                    {formData.certifications.map((cert, index) => (
                        <div key={index} className="mb-3">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-lg font-semibold">{cert.title}</h3>
                                <span className="text-gray-600">{cert.date}</span>
                            </div>
                            <p className="text-gray-700">{cert.platform}</p>
                            {cert.certificateLink && (
                                <a 
                                    href={cert.certificateLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    View Certificate
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ModernTemplate;