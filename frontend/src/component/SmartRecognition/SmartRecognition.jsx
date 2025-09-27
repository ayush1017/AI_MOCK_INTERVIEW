import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaFileUpload, FaFilePdf, FaFileWord, FaTimes, FaSearch, FaLightbulb, FaBriefcase } from "react-icons/fa";
import Header from "../Header";
import Footer from "../Footer";
import axios from 'axios';

const SmartRecognition = () => {
    const [resumeFile, setResumeFile] = useState(null);
    const [uploadError, setUploadError] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [roleRecommendations, setRoleRecommendations] = useState([]);
    const [skillsAnalysis, setSkillsAnalysis] = useState([]);
    const [parsedResumeData, setParsedResumeData] = useState({
        skills: [],
        experience: [],
        projects: []
    });
    const [manualSkill, setManualSkill] = useState("");

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileType = file.type;
        if (
            fileType !== "application/pdf" &&
            fileType !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
            fileType !== "application/msword"
        ) {
            setUploadError("Please upload a PDF or Word document");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError("File size should be less than 5MB");
            return;
        }

        setResumeFile(file);
        setUploadError("");
        setIsUploading(true);

        try {
            await analyzeResume(file);
        } catch (err) {
            console.error("Error analyzing resume:", err);
            setUploadError("Failed to analyze resume. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // Upload file to Cloudinary
    const uploadFileToCloud = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "Ashton"); // Replace with your Cloudinary preset
        formData.append("resource_type", "raw");

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/dwvnq0gjr/raw/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("File uploaded to Cloudinary:", data.secure_url);
            return data.secure_url; // Cloudinary returns a secure file URL
        } catch (err) {
            console.error("File Upload Error:", err);
            throw new Error("Failed to upload file to cloud storage");
        }
    };

    // Analyze resume using backend proxy to APILayer
    const analyzeResume = async (file) => {
        if (!file) return;

        // Upload to Cloudinary and get a URL
        const fileUrl = await uploadFileToCloud(file);
        if (!fileUrl) {
            setUploadError("Failed to upload resume. Please try again.");
            return;
        }

        try {
            console.log("Analyzing resume from URL:", fileUrl);

            // Use our backend proxy instead of calling API Layer directly
            // This avoids CORS issues since the request now comes from our server
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            // Construct the correct URL based on the environment
            let resumeParserUrl;
            if (apiUrl === 'http://localhost:3001') {
                // Local development
                resumeParserUrl = `${apiUrl}/api/resume-parser`;
            } else if (apiUrl.endsWith('/api')) {
                // Production with /api suffix
                resumeParserUrl = `${apiUrl.slice(0, -4)}/api/resume-parser`;
            } else {
                // Production without /api suffix
                resumeParserUrl = `${apiUrl}/resume-parser`;
            }

            console.log("Using resume parser URL:", resumeParserUrl);

            const response = await fetch(`${resumeParserUrl}?url=${encodeURIComponent(fileUrl)}`, {
                method: "GET",
            });

            if (!response.ok) {
                // Handle rate limiting error specifically
                if (response.status === 429) {
                    console.warn("API rate limit exceeded. Using fallback method.");
                    // Set a specific message for rate limiting
                    setUploadError("API rate limit exceeded. Please enter your skills manually below.");

                    // Return a minimal object with empty skills array that will be populated manually
                    const fallbackData = {
                        skills: [],
                        experience: [],
                        projects: []
                    };

                    setParsedResumeData(fallbackData);
                    setSkillsAnalysis([]);

                    // Show manual entry UI by setting resumeFile but with empty skills
                    return fallbackData;
                } else {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }
            }

            const data = await response.json();
            console.log("Resume parsing result:", data);

            // Enhanced formatting of resume data with better field mapping
            const formattedData = {
                skills: data.skills?.map((skill) => ({
                    name: skill,
                    level: "Intermediate", // Default level
                    description: `Experience with ${skill}`,
                })) || [],
                experience: data.experience?.map(exp => ({
                    ...exp,
                    title: exp.title || exp.position || exp.role || '',
                    company: exp.company || exp.organization || '',
                    duration: exp.dates || exp.duration || ''
                })) || [],
                projects: data.projects?.map(proj => ({
                    ...proj,
                    title: proj.title || proj.name || '',
                    technologies: proj.technologies || proj.tech_stack || '',
                    duration: proj.dates || proj.duration || ''
                })) || [],
                education: data.education || []
            };

            console.log("Formatted resume data:", formattedData);
            setParsedResumeData(formattedData);

            // Just store the extracted skills for now - we'll get the full analysis from the AI
            setSkillsAnalysis(formattedData.skills.map(skill => ({
                name: skill.name,
                level: "Extracted", // Temporary level until AI analysis
                description: `Skill extracted from resume`
            })));
            console.log("Skills extracted from resume:", formattedData.skills);

            return formattedData;
        } catch (err) {
            setUploadError("Failed to analyze resume. Please try again or enter skills manually.");
            console.error("Resume Parsing Error:", err);

            // Return a minimal object with empty skills array that will be populated manually
            const fallbackData = {
                skills: [],
                experience: [],
                projects: []
            };

            setParsedResumeData(fallbackData);
            return fallbackData;
        }
    };

    // Remove uploaded file
    const removeFile = () => {
        setResumeFile(null);
        setUploadError("");
        setAnalysisResults(null);
        setRoleRecommendations([]);
        setSkillsAnalysis([]);
        setParsedResumeData({
            skills: [],
            experience: [],
            projects: []
        });
        setManualSkill("");
    };

    // Add a skill manually
    const addManualSkill = () => {
        if (!manualSkill.trim()) return;

        // Add the skill to parsedResumeData
        const newSkill = {
            name: manualSkill.trim(),
            level: "Intermediate",
            description: `Experience with ${manualSkill.trim()}`
        };

        // Update parsed resume data
        const updatedSkills = [...parsedResumeData.skills, newSkill];
        setParsedResumeData({
            ...parsedResumeData,
            skills: updatedSkills
        });

        // Update skills analysis
        setSkillsAnalysis([...skillsAnalysis, {
            name: newSkill.name,
            level: "Extracted",
            description: `Skill manually added`
        }]);

        // Clear the input
        setManualSkill("");
    };

    // Start analysis process
    const startAnalysis = async () => {
        if (!resumeFile) {
            setUploadError("Please upload your resume first");
            return;
        }

        if (parsedResumeData.skills.length === 0 && skillsAnalysis.length === 0) {
            setUploadError("Please add at least one skill to continue");
            return;
        }

        setIsAnalyzing(true);
        try {
            // Get auth token if available
            const token = localStorage.getItem('token');
            const headers = token ? { "Authorization": `Bearer ${token}` } : {};

            console.log("Starting AI analysis for skills and career paths...");
            console.log("Sending parsed resume data:", parsedResumeData);

            // Create a more detailed version of the data to send to the backend
            const enhancedData = {
                skills: parsedResumeData.skills.map(skill => skill.name),
                experience: parsedResumeData.experience?.map(exp => ({
                    title: exp.title || exp.position || exp.role || '',
                    company: exp.company || exp.organization || '',
                    duration: exp.dates || exp.duration || '',
                    description: exp.description || ''
                })) || [],
                projects: parsedResumeData.projects?.map(proj => ({
                    title: proj.title || proj.name || '',
                    technologies: proj.technologies || proj.tech_stack || '',
                    description: proj.description || ''
                })) || [],
                education: parsedResumeData.education?.map(edu => ({
                    institution: edu.institution || edu.school || '',
                    degree: edu.degree || edu.qualification || '',
                    field: edu.field || edu.major || ''
                })) || []
            };

            console.log("Enhanced data for backend:", enhancedData);

            // Get the correct base URL
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            // Construct the correct URL based on the environment
            let smartRecognitionUrl;
            if (apiUrl === 'http://localhost:3001') {
                // Local development
                smartRecognitionUrl = `${apiUrl}/api/smart-recognition`;
            } else if (apiUrl.endsWith('/api')) {
                // Production with /api suffix
                smartRecognitionUrl = `${apiUrl.slice(0, -4)}/api/smart-recognition`;
            } else {
                // Production without /api suffix
                smartRecognitionUrl = `${apiUrl}/smart-recognition`;
            }

            console.log("Using smart recognition URL:", smartRecognitionUrl);

            // Send the enhanced data to the backend for AI analysis
            const analysisResponse = await axios.post(smartRecognitionUrl, {
                resumeData: enhancedData,
                useAI: true // Explicitly request AI analysis
            }, { headers });

            if (!analysisResponse.data) {
                throw new Error("Failed to analyze resume");
            }

            console.log("AI analysis results received:", analysisResponse.data);
            setAnalysisResults(analysisResponse.data);

            // Use the AI-generated skills analysis
            if (analysisResponse.data.skillsAnalysis && analysisResponse.data.skillsAnalysis.length > 0) {
                setSkillsAnalysis(analysisResponse.data.skillsAnalysis);
                console.log("Using AI-generated skills analysis");
            } else {
                console.warn("No AI-generated skills analysis received");
                // Use the extracted skills as fallback
                if (parsedResumeData.skills.length > 0) {
                    setSkillsAnalysis(parsedResumeData.skills.map(skill => ({
                        name: skill.name,
                        level: "Intermediate",
                        description: `Experience with ${skill.name}`
                    })));
                    console.log("Using extracted skills as fallback");
                }
            }

            // Use the AI-generated role recommendations
            if (analysisResponse.data.roleRecommendations && analysisResponse.data.roleRecommendations.length > 0) {
                setRoleRecommendations(analysisResponse.data.roleRecommendations);
                console.log("Using AI-generated role recommendations");
            } else {
                console.warn("No AI-generated role recommendations received");
                // Could add fallback role recommendations here if needed
            }
        } catch (err) {
            console.error("Analysis Error:", err);
            console.error("Error details:", err.response?.data || err.message);
            setUploadError("Failed to get AI analysis. Please try again.");

            // We won't use fallbacks here since we want to ensure AI-generated content
            // Instead, show an error message encouraging the user to try again
            setRoleRecommendations([]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Skill level badge component
    const SkillLevelBadge = ({ level }) => {
        let bgColor = "bg-gray-200";
        let textColor = "text-gray-800";

        if (level === "Expert") {
            bgColor = "bg-green-100";
            textColor = "text-green-800";
        } else if (level === "Intermediate") {
            bgColor = "bg-blue-100";
            textColor = "text-blue-800";
        } else if (level === "Beginner") {
            bgColor = "bg-yellow-100";
            textColor = "text-yellow-800";
        }

        return (
            <span className={`${bgColor} ${textColor} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                {level}
            </span>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-5xl mx-auto"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800">
                        Smart Recognition
                    </h1>
                    <p className="text-center text-gray-600 mb-8">
                        Upload your resume to analyze your skills and find matching job opportunities
                    </p>

                    {/* Resume Upload Section */}
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            Upload Your Resume
                        </h2>

                        {!resumeFile ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <FaFileUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                                <p className="text-gray-600 mb-4">
                                    Drag and drop your resume file here, or click to browse
                                </p>
                                <input
                                    type="file"
                                    id="resume-upload"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept=".pdf,.doc,.docx"
                                />
                                <label
                                    htmlFor="resume-upload"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors"
                                >
                                    Browse Files
                                </label>
                                {uploadError && (
                                    <p className="text-red-500 mt-2">{uploadError}</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                                <div className="flex items-center">
                                    {resumeFile.type.includes("pdf") ? (
                                        <FaFilePdf className="text-red-500 text-2xl mr-3" />
                                    ) : (
                                        <FaFileWord className="text-blue-500 text-2xl mr-3" />
                                    )}
                                    <span className="font-medium text-gray-800">
                                        {resumeFile.name}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <button
                                        onClick={removeFile}
                                        className="text-gray-500 hover:text-red-500 p-1"
                                        aria-label="Remove file"
                                        disabled={isUploading}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>
                        )}

                        {isUploading && (
                            <div className="mt-4 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                                <span className="text-gray-700">Analyzing resume for skills...</span>
                            </div>
                        )}

                        {/* Display detected skills immediately after upload */}
                        {!isUploading && resumeFile && !analysisResults && (
                            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <FaLightbulb className="text-yellow-500 mr-2" /> {skillsAnalysis.length > 0 ? "Detected Skills" : "Add Your Skills"}
                                </h3>

                                {/* Manual skill entry */}
                                <div className="mb-4">
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={manualSkill}
                                            onChange={(e) => setManualSkill(e.target.value)}
                                            placeholder="Enter a skill (e.g., JavaScript, Project Management)"
                                            className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onKeyDown={(e) => e.key === 'Enter' && addManualSkill()}
                                        />
                                        <button
                                            onClick={addManualSkill}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-r-lg transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {skillsAnalysis.length === 0 && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            {uploadError ? uploadError : "Please add at least one skill to continue."}
                                        </p>
                                    )}
                                </div>

                                {/* Display skills */}
                                {skillsAnalysis.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {skillsAnalysis.map((skill, index) => (
                                            <div key={index} className="bg-white border border-blue-100 rounded-lg p-2 text-center">
                                                <span className="text-gray-800 font-medium">{skill.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4 text-center">
                                    <button
                                        onClick={startAnalysis}
                                        disabled={isAnalyzing || skillsAnalysis.length === 0}
                                        className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors ${
                                            isAnalyzing || skillsAnalysis.length === 0 ? "opacity-70 cursor-not-allowed" : ""
                                        }`}
                                    >
                                        {isAnalyzing ? "Finding Career Paths..." : "Find Suitable Career Paths"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Analysis Results Section */}
                    {analysisResults && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {/* Skills Analysis */}
                            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                                <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                                    <FaLightbulb className="text-yellow-500 mr-2" />
                                    Skills Analysis
                                </h2>

                                {skillsAnalysis.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {skillsAnalysis.map((skill, index) => (
                                            <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="font-medium text-gray-800">{skill.name}</h3>
                                                    <SkillLevelBadge level={skill.level} />
                                                </div>
                                                <p className="text-sm text-gray-600">{skill.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600">No skills analysis available.</p>
                                )}
                            </div>

                            {/* Role Recommendations */}
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                                    <FaBriefcase className="text-blue-500 mr-2" />
                                    Recommended Career Paths
                                </h2>

                                {roleRecommendations.length > 0 ? (
                                    <div className="space-y-4">
                                        {roleRecommendations.map((role, index) => (
                                            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="font-medium text-lg text-gray-800">{role.roleType}</h3>
                                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                                        {role.suitabilityScore}% Match
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-700 mb-3">{role.description}</p>

                                                <div className="mb-3">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills:</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {role.requiredSkills.map((skill, idx) => (
                                                            <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Career Progression:</h4>
                                                    <p className="text-sm text-gray-600">{role.careerPath}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600">No role recommendations available.</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default SmartRecognition;
