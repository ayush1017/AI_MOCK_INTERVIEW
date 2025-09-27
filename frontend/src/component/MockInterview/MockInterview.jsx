import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaMicrophone, FaVideo, FaCog, FaRegClock, FaRobot, FaFileUpload, FaFilePdf, FaFileWord, FaTimes, FaMicrophoneSlash, FaVideoSlash } from "react-icons/fa";
import Header from "../Header";
import Footer from "../Footer";
import axios from 'axios';
import Mic from "../Mice/Mic";
import InterviewResult from "./InterviewResult";

const DetectedSkill = {
    STRONG: "strong",
    MODERATE: "moderate",
    BASIC: "basic",
};

const MockInterview = () => {
    const [difficulty, setDifficulty] = useState("medium");
    const [isInterviewStarted, setIsInterviewStarted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [uploadError, setUploadError] = useState("");
    const [detectedTopics, setDetectedTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [promt, setpromt] = useState([]);
    const [skillloading, setskillloading] = useState(false);
    const [manualSkill, setManualSkill] = useState("");
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [audioRecordings, setAudioRecordings] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [interviewComplete, setInterviewComplete] = useState(false);
    const [interviewResults, setInterviewResults] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [transcripts, setTranscripts] = useState([]);
    const [recognition, setRecognition] = useState(null);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [isSpeechDetected, setIsSpeechDetected] = useState(false);
    const [transcriptionConfidence, setTranscriptionConfidence] = useState(0);
    const [speechError, setSpeechError] = useState(null);
    const [isTranscribing, setIsTranscribing] = useState(false);

    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recognitionRef = useRef(null);
    const baseUrl = "http://localhost:3001/";

    const [parsedResumeData, setParsedResumeData] = useState({
        skills: [],
        experience: [],
        projects: [],
    });

    // Timer functionality
    useEffect(() => {
        let interval;
        if (isTimerRunning && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            stopRecording();
            if (currentQuestionIndex < questions.length - 1) {
                moveToNextQuestion();
            } else {
                finishInterview();
            }
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeRemaining, currentQuestionIndex, questions]);

    useEffect(() => {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                setSpeechError('Speech recognition is not supported in your browser');
                return;
            }

            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onstart = () => {
                console.log('Speech recognition started');
                setIsTranscribing(true);
                setSpeechError(null);
            };

            recognitionInstance.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join(' ');

                console.log('Transcript received:', transcript);

                setCurrentTranscript(transcript);
                setIsSpeechDetected(true);

                // Save transcript immediately for current question
                setTranscripts(prev => {
                    const newTranscripts = [...prev];
                    newTranscripts[currentQuestionIndex] = transcript;
                    return newTranscripts;
                });
            };

            recognitionInstance.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setSpeechError(event.error);
                setIsTranscribing(false);

                if (event.error === 'no-speech') {
                    restartRecognition();
                }
            };

            recognitionInstance.onend = () => {
                console.log('Speech recognition ended');
                setIsTranscribing(false);

                if (isRecording) {
                    restartRecognition();
                }
            };

            setRecognition(recognitionInstance);
            recognitionRef.current = recognitionInstance;

        } catch (error) {
            console.error('Error initializing speech recognition:', error);
            setSpeechError('Failed to initialize speech recognition');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [recognitionRef, isRecording, currentQuestionIndex, questions]);

    const restartRecognition = () => {
        if (recognitionRef.current && isRecording) {
            setTimeout(() => {
                try {
                    recognitionRef.current.start();
                    console.log('Recognition restarted');
                } catch (error) {
                    console.error('Error restarting recognition:', error);
                }
            }, 100);
        }
    };

    const startRecording = async () => {
        try {
            if (recognitionRef.current) {
                // Clear previous transcript for new question
                setCurrentTranscript('');

                // Ensure previous instance is stopped
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore errors if recognition wasn't running
                }

                setTimeout(() => {
                    try {
                        recognitionRef.current.start();
                        setIsRecording(true);
                        console.log('Recording started');
                    } catch (error) {
                        console.error('Error starting recognition:', error);
                        setSpeechError('Failed to start recording');
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error in startRecording:', error);
            alert('Unable to start recording. Please check microphone permissions.');
        }
    };

    const stopRecording = () => {
        try {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                setIsRecording(false);
                console.log('Recording stopped');

                // Save final transcript for current question
                if (currentTranscript.trim()) {
                    setTranscripts(prev => {
                        const newTranscripts = [...prev];
                        newTranscripts[currentQuestionIndex] = currentTranscript.trim();
                        return newTranscripts;
                    });
                    console.log('Final transcript saved:', currentTranscript.trim());
                }
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    };

    const moveToNextQuestion = () => {
        // Save current transcript before moving to next question
        if (currentTranscript.trim()) {
            setTranscripts(prev => {
                const newTranscripts = [...prev];
                newTranscripts[currentQuestionIndex] = currentTranscript.trim();
                console.log('Saving transcript for question', currentQuestionIndex, ':', currentTranscript.trim());
                return newTranscripts;
            });
        }

        stopRecording();

        // Update question index and reset timer
        setCurrentQuestionIndex(prev => {
            const nextIndex = prev + 1;
            setCurrentQuestion(questions[nextIndex]);
            return nextIndex;
        });

        setTimeRemaining(60);

        // Start recording for next question after a short delay
        setTimeout(() => {
            startRecording();
        }, 500);
    };

    // Add debug logging for transcripts
    useEffect(() => {
        console.log('Current transcripts:', transcripts);
    }, [transcripts]);

    useEffect(() => {
        console.log('Current transcript for question', currentQuestionIndex, ':', currentTranscript);
    }, [currentTranscript, currentQuestionIndex]);

    const finishInterview = async () => {
        // Stop recording and timer
        stopRecording();
        setIsTimerRunning(false);
        setIsAnalyzing(true);

        // Turn off camera
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setIsCameraOn(false);
        }

        // Turn off microphone
        setIsMicOn(false);

        try {
            console.log('Preparing to analyze interview...');
            console.log('Questions:', questions);
            console.log('Transcripts:', transcripts);

            // Ensure we have transcripts for all questions
            const allTranscripts = questions.map((_, index) => {
                return transcripts[index] || "No response provided";
            });

            console.log('Sending request to analyze interview...');
            const response = await axios.post(`${baseUrl}api/analyze-interview`, {
                transcripts: allTranscripts,
                questions
            });

            console.log('Received analysis response:', response.data);

            if (response.data) {
                setInterviewResults(response.data);
                setInterviewComplete(true);
            } else {
                throw new Error('No data received from server');
            }
        } catch (error) {
            console.error('Error analyzing interview:', error);
            alert('Failed to analyze interview responses: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Format time for display
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Camera functionality
    const toggleCamera = async () => {
        try {
            if (!isCameraOn) {
                console.log('Attempting to access camera...');
                const constraints = {
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (!videoRef.current) {
                    console.error('Video ref is not available');
                    return;
                }
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play().catch(e => console.error('Error playing video:', e));
                };
                streamRef.current = stream;
                setIsCameraOn(true);
                console.log('Camera successfully enabled');
            } else {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => {
                        track.stop();
                        console.log('Camera track stopped');
                    });
                }
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }
                setIsCameraOn(false);
                console.log('Camera successfully disabled');
            }
        } catch (error) {
            console.error('Camera error:', error.name, error.message);
            if (error.name === 'NotAllowedError') {
                alert('Camera access was denied. Please check your browser permissions and make sure camera access is allowed.');
            } else if (error.name === 'NotFoundError') {
                alert('No camera device was found. Please make sure your camera is properly connected.');
            } else if (error.name === 'NotReadableError') {
                alert('Your camera might be in use by another application. Please close other apps that might be using the camera.');
            } else {
                alert(`Unable to access camera: ${error.message}`);
            }
            setIsCameraOn(false);
        }
    };

    // Microphone functionality
    const toggleMicrophone = async () => {
        try {
            if (!isMicOn) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                setIsMicOn(true);
            } else {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
                setIsMicOn(false);
            }
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Unable to access microphone. Please check permissions.');
        }
    };

    // Generate interview questions based on resume
    const generateQuestions = async (skills, experience, projects) => {
        try {
            // Enhanced formatting of the skills and experience data
            const skillsText = Array.isArray(skills) ? skills.join(', ') : '';

            // Better handling of experience data with more fields
            const experienceText = Array.isArray(experience) ?
                experience.map(exp => {
                    const title = exp.title || exp.position || exp.role || '';
                    const company = exp.company || exp.organization || '';
                    return title && company ? `${title} at ${company}` : title || company;
                }).filter(Boolean).join(', ') : '';

            // Better handling of project data with more fields
            const projectsText = Array.isArray(projects) ?
                projects.map(proj => {
                    const title = proj.title || proj.name || '';
                    const tech = proj.technologies || proj.tech_stack || '';
                    return title && tech ? `${title} (${tech})` : title;
                }).filter(Boolean).join(', ') : '';

            // More detailed prompt with structured information
            const prompt = `Generate 5 technical interview questions based on the following skills and experience:
                Skills: ${skillsText || 'General technical skills'}
                Experience: ${experienceText || 'General professional experience'}
                Projects: ${projectsText || 'General project experience'}

                Make questions specific to the candidate's background when possible.
                Include a mix of technical knowledge and practical application questions.`;

            console.log('Sending prompt to generate questions:', prompt);

            const response = await axios.post(`${baseUrl}api/generate`, { prompt });
            console.log('Response from question generation:', response.data);

            if (!response.data || !response.data.questions) {
                throw new Error('No questions received from the server');
            }

            const generatedQuestions = response.data.questions;

            // Ensure we only use 5 questions
            const limitedQuestions = generatedQuestions.slice(0, 5);
            setQuestions(limitedQuestions);
            if (limitedQuestions.length > 0) {
                setCurrentQuestion(limitedQuestions[0]);
                setCurrentQuestionIndex(0);
            } else {
                throw new Error('No valid questions were generated');
            }
        } catch (error) {
            console.error('Error generating questions:', error);
            alert('Failed to generate interview questions: ' + (error.response?.data?.message || error.message));
            throw error;
        }
    };

    const startInterview = async () => {
        if (!resumeFile) {
            alert("Please upload your resume first");
            return;
        }

        if (!parsedResumeData || !parsedResumeData.skills || parsedResumeData.skills.length === 0) {
            alert("Please add at least one skill to continue");
            return;
        }

        try {
            setIsLoading(true);
            console.log('Starting interview with parsed resume data:', parsedResumeData);

            await generateQuestions(
                parsedResumeData.skills.map(skill => skill.name),
                parsedResumeData.experience || [],
                parsedResumeData.projects || []
            );

            // Reset transcripts array for new interview
            setTranscripts([]);
            setCurrentTranscript('');

            setIsInterviewStarted(true);
            setIsTimerRunning(true);
            startRecording();
        } catch (err) {
            console.error('Error starting interview:', err);
            alert('Failed to start interview. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const fileType = file?.type;
        setskillloading(true)
        setUploadError("");
        if (!file) return;

        if (fileType !== "application/pdf" && fileType !== "application/msword" && fileType !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            setUploadError("Please upload a PDF or DOC/DOCX file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError("File size should be less than 5MB");
            return;
        }

        setResumeFile(file);
        setIsLoading(true);
        await analyzeResume(file);
        setIsLoading(false);
        setskillloading(false);
    };

    const uploadFileToCloud = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "Ashton"); // Replace with your Cloudinary preset
        formData.append("resource_type", "raw");

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/dwvnq0gjr/raw/upload"
                , {
                    method: "POST",
                    body: formData,
                });

            const data = await response.json();
            console.log(data.secure_url);
            return data.secure_url; // Cloudinary returns a secure file URL
        } catch (err) {
            console.error("File Upload Error:", err);
            return null;
        }
    };

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
                    setDetectedTopics([]);

                    return fallbackData;
                } else {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }
            }

            const data = await response.json();
            console.log("Resume parsing result:", data);

            // Enhanced formatting of resume data
            const formattedData = {
                skills: data.skills?.map((skill) => ({
                    name: skill,
                    level: DetectedSkill.MODERATE, // Default level
                    subtopics: [],
                    description: `Experience with ${skill}`
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
            setDetectedTopics(formattedData.skills.map((skill) => skill.name));
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
            setDetectedTopics([]);
            return fallbackData;
        }
    };

    const removeFile = () => {
        setResumeFile(null);
        setUploadError("");
        setParsedResumeData({
            skills: [],
            experience: [],
            projects: []
        });
        setDetectedTopics([]);
        setskillloading(false);
        setManualSkill("");
    };

    // Add a skill manually
    const addManualSkill = () => {
        if (!manualSkill.trim()) return;

        // Add the skill to parsedResumeData
        const newSkill = {
            name: manualSkill.trim(),
            level: DetectedSkill.MODERATE,
            subtopics: []
        };

        // Update parsed resume data
        const updatedSkills = [...parsedResumeData.skills, newSkill];
        setParsedResumeData({
            ...parsedResumeData,
            skills: updatedSkills
        });

        // Update detected topics
        setDetectedTopics([...detectedTopics, newSkill.name]);

        // Clear the input
        setManualSkill("");
    };

    useEffect(() => {
        setpromt(parsedResumeData.skills.map((skill) => skill.name));
    }, [parsedResumeData.skills]);

    const renderTranscriptSection = () => {
        if (!isInterviewStarted || interviewComplete) return null;

        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Current Response:</h3>
                <p className="text-gray-700">{currentTranscript || 'Listening...'}</p>
            </div>
        );
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-100">
                <div className="container mx-auto px-4 py-8">
                    {!isInterviewStarted ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg shadow-lg p-8">
                            <h1 className="text-3xl font-bold text-center mb-8">AI Mock Interview</h1>

                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    {!resumeFile ? (
                                        <div className="text-center">
                                            <input type="file" id="resume-upload" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                                            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                                                <FaFileUpload className="text-4xl text-gray-400 mb-2" />
                                                <p className="text-gray-600 mb-1">Drag & drop your resume or click to upload</p>
                                                <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX (Max 5MB)</p>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                {resumeFile.type.includes("pdf") ? <FaFilePdf className="text-red-500 text-xl" /> : <FaFileWord className="text-blue-500 text-xl" />}
                                                <div>
                                                    <p className="font-medium">{resumeFile.name}</p>
                                                    <p className="text-sm text-gray-500">{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <button onClick={removeFile} className="text-gray-500 hover:text-red-500">
                                                <FaTimes />
                                            </button>
                                        </div>
                                    )}
                                    {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                                </div>
                            </div>
                            {skillloading && <div className="text-black text-xl text-center ">
                                <div>
                                    Analyzing resume for skills...
                                </div>


                            </div>

                            }
                            {resumeFile && (
                                <div className="mt-6">
                                    <h2 className="text-xl font-semibold mb-4">{parsedResumeData.skills.length > 0 ? "Detected Skills" : "Add Your Skills"}</h2>

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
                                        {parsedResumeData.skills.length === 0 && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                {uploadError ? uploadError : "Please add at least one skill to continue."}
                                            </p>
                                        )}
                                    </div>

                                    {/* Display skills */}
                                    {parsedResumeData.skills.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {parsedResumeData.skills.map((skill, index) => (
                                                <div key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium text-center">
                                                    {skill.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Interview Controls */}
                            <div className="flex justify-center space-x-6 mt-8">
                                <button
                                    onClick={toggleCamera}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isCameraOn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    {isCameraOn ? <FaVideoSlash /> : <FaVideo />}
                                    <span>{isCameraOn ? 'Stop Camera' : 'Start Camera'}</span>
                                </button>
                                <button
                                    onClick={toggleMicrophone}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isMicOn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    {isMicOn ? <FaMicrophoneSlash /> : <FaMicrophone />}
                                    <span>{isMicOn ? 'Stop Mic' : 'Start Mic'}</span>
                                </button>
                            </div>

                            {/* Camera Preview */}
                            <div className="mt-6">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    style={{ display: isCameraOn ? 'block' : 'none' }}
                                    className="w-full h-64 bg-black rounded-lg"
                                />
                            </div>

                            <button
                                onClick={startInterview}
                                disabled={!resumeFile || isLoading}
                                className={`w-full mt-8 py-3 px-6 rounded-lg text-white font-semibold ${!resumeFile || isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {isLoading ? 'Preparing Interview...' : 'Start Interview'}
                            </button>
                        </motion.div>
                    ) : interviewComplete ? (
                        <InterviewResult
                            score={interviewResults?.overallScore || 0}
                            feedback={interviewResults?.feedback || []}
                            keyStrengths={interviewResults?.keyStrengths || []}
                            developmentAreas={interviewResults?.developmentAreas || []}
                            recommendations={interviewResults?.recommendations || []}
                            overallFeedback={interviewResults?.overallFeedback || ''}
                        />
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg shadow-lg p-8">
                            {isAnalyzing ? (
                                <div className="text-center py-12">
                                    <FaRobot className="text-5xl text-blue-600 mx-auto animate-bounce" />
                                    <h2 className="text-2xl font-semibold mt-4">Analyzing Your Responses...</h2>
                                    <p className="text-gray-600 mt-2">Please wait while we evaluate your interview performance.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold">AI Mock Interview</h2>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2 text-lg">
                                                <FaRegClock className={`${timeRemaining <= 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
                                                <span className={`font-mono ${timeRemaining <= 10 ? 'text-red-600' : ''}`}>{formatTime(timeRemaining)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="col-span-2">
                                            <video
                                                src={'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'}
                                                autoPlay
                                                playsInline
                                                muted
                                                loop={true}

                                                className="w-full h-96 bg-black rounded-lg"
                                            />
                                            <div className="mt-4 flex justify-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <FaMicrophone className={isRecording ? 'text-red-500' : 'text-gray-400'} />
                                                    <span className="text-sm">{isRecording ? 'Recording' : 'Not Recording'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-4">Question {currentQuestionIndex + 1} of {questions.length}:</h3>
                                            <p className="text-gray-700 mb-4">{currentQuestion}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2 text-lg">
                                                    <FaRegClock className={`${timeRemaining <= 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
                                                    <span className={`font-mono ${timeRemaining <= 10 ? 'text-red-600' : ''}`}>{formatTime(timeRemaining)}</span>
                                                </div>
                                                {currentQuestionIndex < questions.length - 1 && (
                                                    <button
                                                        onClick={moveToNextQuestion}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                    >
                                                        Next Question
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {renderTranscriptSection()}
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => setIsMicOn(!isMicOn)}
                                                    className={`p-2 rounded-full ${isMicOn ? 'bg-green-500' : 'bg-red-500'} text-white`}
                                                >
                                                    {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                                                </button>
                                                {/* Speech recognition status */}
                                                {isMicOn && (
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-3 h-3 rounded-full ${isSpeechDetected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                                        <span className="text-sm text-gray-600">
                                                            {isSpeechDetected ? 'Listening...' : 'No speech detected'}
                                                        </span>
                                                        {transcriptionConfidence > 0 && (
                                                            <span className="text-sm text-gray-500">
                                                                Confidence: {Math.round(transcriptionConfidence)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {speechError && (
                                                <div className="text-red-500 text-sm mb-2">
                                                    Error: {speechError}
                                                </div>
                                            )}
                                        </div>
                                        {/* Current transcript display */}
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-2">Your Response:</h3>
                                            <p className="text-gray-700">{currentTranscript || 'Start speaking to see your response...'}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MockInterview;
