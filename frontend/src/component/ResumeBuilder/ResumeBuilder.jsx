import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../Header';
import Footer from '../Footer';
import { FaPhone, FaEnvelope, FaGithub, FaLinkedin, FaPlus, FaTrash, FaMagic, FaDownload, FaEye, FaCheck, FaSave, FaSpinner } from 'react-icons/fa';
import PreviewModal from './PreviewModal';
import ResumePreview from './ResumePreview';
import ResizableDivider from './ResizableDivider';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResumeBuilder = () => {
    // Initialize navigate hook
    const navigate = useNavigate();
    const location = useLocation();

    // Log component initialization
    console.log('ResumeBuilder component initialized');
    console.log('Navigate function available:', !!navigate);

    // Add a window-level error handler to catch any navigation errors
    useEffect(() => {
        window.onerror = function(message, source, lineno, colno, error) {
            console.error('Global error caught:', { message, source, lineno, colno, error });
            toast.error('An error occurred. Please try again.');
            return false;
        };

        return () => {
            window.onerror = null;
        };
    }, []);

    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [resumeId, setResumeId] = useState(null);
    const [resumeTitle, setResumeTitle] = useState('My Resume');
    const [lastSaved, setLastSaved] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Split-screen layout state
    const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
    const [previewWidth, setPreviewWidth] = useState(500); // Default preview width
    const contentRef = useRef(null);

    // Auto-save timer reference
    const autoSaveTimerRef = useRef(null);

    const [sections, setSections] = useState([
        { id: 'personal', title: 'Personal Information', isVisible: true },
        { id: 'technicalSkills', title: 'Technical Skills', isVisible: true },
        { id: 'training', title: 'Experience', isVisible: true },
        { id: 'projects', title: 'Projects', isVisible: true },
        { id: 'education', title: 'Education', isVisible: true },
        { id: 'certifications', title: 'Certifications', isVisible: false }
    ]);

    const [formData, setFormData] = useState({
        personal: {
            fullName: '',
            location: '',
            phone: '',
            email: '',
            github: '',
            linkedin: ''
        },
        technicalSkills: {
            languages: '',
            technologies: '',
            skills: ''
        },
        training: [],
        projects: [],
        certifications: [],
        education: []
    });

    // Log when component is mounted
    useEffect(() => {
        console.log('ResumeBuilder component mounted');
        console.log('Current location:', location);
    }, []);

    // Get resume ID and title from URL parameters or location state
    useEffect(() => {
        const fetchResumeData = async () => {
            setInitialLoading(true);

            const token = localStorage.getItem('token');
            if (!token) {
                try {
                    console.log('No token found, redirecting to login');
                    navigate('/login');
                } catch (error) {
                    console.error('Navigation error:', error);
                    // Fallback to window.location if navigate fails
                    window.location.href = '/login';
                }
                return;
            }

            // Get the current URL path
            const path = window.location.pathname;

            console.log('Current path:', path);
            console.log('Location state:', location.state);

            // Check if we're creating a new resume
            if (path.includes('/resume-builder/new') || path.endsWith('/new')) {
                // Get title from location state if available
                let title = 'My Resume';

                // Check if we have a title in the location state
                if (location.state && location.state.title) {
                    title = location.state.title;
                    console.log('Using title from location state:', title);
                } else {
                    console.log('No title in location state, using default');
                }

                // Reset form data for new resume
                setFormData({
                    personal: {
                        fullName: '',
                        location: '',
                        phone: '',
                        email: '',
                        github: '',
                        linkedin: ''
                    },
                    technicalSkills: {
                        languages: '',
                        technologies: '',
                        skills: ''
                    },
                    training: [],
                    projects: [],
                    certifications: [],
                    education: []
                });

                // Reset resume ID and set title
                setResumeId(null);
                setResumeTitle(title);
                setLastSaved(null);
                setHasUnsavedChanges(false);

                setInitialLoading(false);
                return;
            }

            // Extract resume ID from URL
            const resumeId = path.split('/resume-builder/')[1];
            console.log('Extracted resume ID from URL:', resumeId);

            // If no resume ID, redirect to resume selector
            if (!resumeId || resumeId === 'undefined' || resumeId === 'null') {
                console.log('No valid resume ID found, redirecting to resume selector');
                try {
                    navigate('/resume-selector');
                } catch (error) {
                    console.error('Navigation error:', error);
                    // Fallback to window.location if navigate fails
                    window.location.href = '/resume-selector';
                }
                return;
            }

            // If resumeId is 'new', handle it as a new resume
            if (resumeId === 'new') {
                console.log('Creating a new resume');
                // Get title from location state if available
                let title = 'My Resume';

                // Check if we have a title in the location state
                if (location.state && location.state.title) {
                    title = location.state.title;
                    console.log('Using title from location state:', title);
                } else {
                    console.log('No title in location state, using default');
                }

                // Reset form data for new resume
                setFormData({
                    personal: {
                        fullName: '',
                        location: '',
                        phone: '',
                        email: '',
                        github: '',
                        linkedin: ''
                    },
                    technicalSkills: {
                        languages: '',
                        technologies: '',
                        skills: ''
                    },
                    training: [],
                    projects: [],
                    certifications: [],
                    education: []
                });

                // Reset resume ID and set title
                setResumeId(null);
                setResumeTitle(title);
                setLastSaved(null);
                setHasUnsavedChanges(false);

                setInitialLoading(false);
                return;
            }

            try {
                // Hardcoded API URL as fallback if environment variable is not set
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                console.log('Using API URL:', apiUrl);
                console.log('Fetching resume with ID:', resumeId);

                // Fetch the specific resume
                const response = await fetch(`${apiUrl}/resume/${resumeId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        toast.error('Resume not found');
                        try {
                            navigate('/resume-selector');
                        } catch (error) {
                            console.error('Navigation error:', error);
                            // Fallback to window.location if navigate fails
                            window.location.href = '/resume-selector';
                        }
                        return;
                    }
                    throw new Error('Failed to fetch resume data');
                }

                const data = await response.json();

                // Update form data with saved resume
                setFormData({
                    personal: data.personal || formData.personal,
                    technicalSkills: data.technicalSkills || formData.technicalSkills,
                    training: data.training || formData.training,
                    projects: data.projects || formData.projects,
                    certifications: data.certifications || formData.certifications,
                    education: data.education || formData.education
                });

                // Set template if available
                if (data.template) {
                    setSelectedTemplate(data.template);
                }

                // Set resume ID and title
                setResumeId(data._id);
                setResumeTitle(data.title || 'My Resume');
                setLastSaved(new Date(data.updatedAt || data.createdAt));

                toast.success(`Resume "${data.title}" loaded successfully`);
            } catch (error) {
                console.error('Error fetching resume:', error);
                setLoadError('Failed to load your resume. Starting with a blank template.');
                toast.error('Failed to load your resume');
            } finally {
                setInitialLoading(false);
                setHasUnsavedChanges(false);
            }
        };

        fetchResumeData();
    }, [navigate, location]);

    const handleTemplateChange = (template) => {
        setSelectedTemplate(template);
        setHasUnsavedChanges(true);
        toast.success(`Template changed to ${template} style`);
    };

    const toggleSection = (id) => {
        setSections(prev => prev.map(section =>
            section.id === id ? { ...section, isVisible: !section.isVisible } : section
        ));
        setHasUnsavedChanges(true);
    };

    const addNewSection = () => {
        const hiddenSections = sections.filter(section => !section.isVisible);
        if (hiddenSections.length > 0) {
            const sectionToAdd = hiddenSections[0];
            setSections(prev => prev.map(section =>
                section.id === sectionToAdd.id
                    ? { ...section, isVisible: true }
                    : section
            ));
            toast.success(`${sectionToAdd.title} section added`);
        } else {
            toast.info('All sections are already visible');
        }
    };

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
        setHasUnsavedChanges(true);
    };

    const handleArrayFieldChange = (section, index, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
        setHasUnsavedChanges(true);
    };

    const addArrayItem = (section, template = {}) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], { id: Date.now(), ...template }]
        }));
        setHasUnsavedChanges(true);
    };

    const removeArrayItem = (section, index) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
        setHasUnsavedChanges(true);
    };

    // Auto-save functionality
    useEffect(() => {
        // Set up auto-save timer
        if (hasUnsavedChanges && !isSaving) {
            // Clear any existing timer
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }

            // Set new timer for 30 seconds
            autoSaveTimerRef.current = setTimeout(() => {
                autoSaveResume();
            }, 30000); // 30 seconds
        }

        // Cleanup function
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [formData, hasUnsavedChanges, isSaving]);

    // Auto-save function
    const autoSaveResume = async () => {
        // Don't auto-save if there are no changes or if we're already saving
        if (!hasUnsavedChanges || isSaving) return;

        // Don't auto-save if we don't have a resume ID yet (new resume)
        // User should explicitly save new resumes first
        if (!resumeId) return;

        // Don't auto-save if the title is empty
        if (!resumeTitle.trim()) return;

        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Can't auto-save without login, but don't show error
                setIsSaving(false);
                return;
            }

            // Hardcoded API URL as fallback if environment variable is not set
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            console.log('Using API URL for auto-save:', apiUrl);
            console.log('Auto-saving resume with ID:', resumeId);

            const response = await fetch(`${apiUrl}/resume/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    _id: resumeId,
                    title: resumeTitle,
                    ...formData,
                    template: selectedTemplate
                })
            });

            if (response.ok) {
                const data = await response.json();
                setResumeId(data.resume._id);
                setLastSaved(new Date());
                setHasUnsavedChanges(false);
                // Show subtle notification
                toast.success('Auto-saved', {
                    autoClose: 2000,
                    hideProgressBar: true,
                    position: 'bottom-right'
                });
            } else {
                // Auto-save failed, but don't disrupt user
                console.error('Auto-save failed');
            }
        } catch (error) {
            console.error('Error during auto-save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveResume = async () => {
        setSaveLoading(true);
        setSaveError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to save resume');
                return;
            }

            // Validate resume title
            if (!resumeTitle.trim()) {
                setSaveError('Resume title is required');
                toast.error('Resume title is required');
                setSaveLoading(false);
                return;
            }

            // Hardcoded API URL as fallback if environment variable is not set
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            console.log('Using API URL for save:', apiUrl);
            console.log('Saving resume with ID:', resumeId || 'new resume');

            const response = await fetch(`${apiUrl}/resume/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    _id: resumeId,
                    title: resumeTitle,
                    ...formData,
                    template: selectedTemplate
                })
            });

            if (response.ok) {
                const data = await response.json();
                const newResumeId = data.resume._id;
                setResumeId(newResumeId);
                setLastSaved(new Date());
                setHasUnsavedChanges(false);

                // If this was a new resume, update the URL to include the resume ID
                if (!resumeId) {
                    window.history.replaceState(null, '', `/resume-builder/${newResumeId}`);
                }

                toast.success('Resume saved successfully!');
                setShowSaveModal(false);
            } else {
                throw new Error('Failed to save resume');
            }
        } catch (error) {
            console.error('Error saving resume:', error);
            setSaveError('Failed to save resume. Please try again.');
            toast.error('Failed to save resume');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDownloadResume = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to download resume');
                return;
            }

            // Hardcoded API URL as fallback if environment variable is not set
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            console.log('Using API URL for download:', apiUrl);

            const response = await fetch(`${apiUrl}/resume/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    formData,
                    template: selectedTemplate
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to download resume');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resume.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast.success('Resume downloaded successfully!');
        } catch (error) {
            console.error('Error downloading resume:', error);
            toast.error(error.message || 'Failed to download resume');
        }
    };

    const [saveAsNew, setSaveAsNew] = useState(false);
    const [userResumes, setUserResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [isLoadingResumes, setIsLoadingResumes] = useState(false);

    // Fetch user's resumes for the modal
    const fetchUserResumes = async () => {
        setIsLoadingResumes(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Hardcoded API URL as fallback if environment variable is not set
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            console.log('Using API URL for fetching resumes:', apiUrl);

            const response = await fetch(`${apiUrl}/resume/list`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserResumes(data.resumes || []);
            }
        } catch (error) {
            console.error('Error fetching user resumes:', error);
        } finally {
            setIsLoadingResumes(false);
        }
    };

    // Load a specific resume
    const loadResume = async (id) => {
        setInitialLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Hardcoded API URL as fallback if environment variable is not set
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            console.log('Using API URL for loading resume:', apiUrl);
            console.log('Loading resume with ID:', id);

            const response = await fetch(`${apiUrl}/resume/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Update form data with loaded resume
                setFormData({
                    personal: data.personal || formData.personal,
                    technicalSkills: data.technicalSkills || formData.technicalSkills,
                    training: data.training || formData.training,
                    projects: data.projects || formData.projects,
                    certifications: data.certifications || formData.certifications,
                    education: data.education || formData.education
                });

                // Set template if available
                if (data.template) {
                    setSelectedTemplate(data.template);
                }

                // Set resume ID and title
                setResumeId(data._id);
                setResumeTitle(data.title || 'My Resume');
                setLastSaved(new Date(data.updatedAt || data.createdAt));
                setHasUnsavedChanges(false);

                toast.success(`Resume "${data.title}" loaded successfully`);
                setShowSaveModal(false);
            } else {
                toast.error('Failed to load resume');
            }
        } catch (error) {
            console.error('Error loading resume:', error);
            toast.error('Error loading resume');
        } finally {
            setInitialLoading(false);
        }
    };

    // Handle creating a new resume
    const handleCreateNewResume = () => {
        // Reset form data
        setFormData({
            personal: {
                fullName: '',
                location: '',
                phone: '',
                email: '',
                github: '',
                linkedin: ''
            },
            technicalSkills: {
                languages: '',
                technologies: '',
                skills: ''
            },
            training: [],
            projects: [],
            certifications: [],
            education: []
        });

        // Reset resume ID and set default title
        setResumeId(null);
        setResumeTitle('My Resume');
        setLastSaved(null);
        setHasUnsavedChanges(false);
        setShowSaveModal(false);

        toast.success('Created new resume');
    };

    // Pre-fetch resumes when component mounts to avoid modal flickering
    useEffect(() => {
        // Fetch resumes in the background when component mounts
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserResumes();
        }
    }, []);

    // Handle opening the save modal
    const handleOpenSaveModal = () => {
        setShowSaveModal(true);
    };

    const SaveModal = () => {
        // Memoize the modal content to prevent unnecessary re-renders
        const modalContent = (
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
            >
                <h3 className="text-xl font-bold mb-4">Save Resume</h3>

                {/* Resume Title Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resume Title
                    </label>
                    <input
                        type="text"
                        value={resumeTitle}
                        onChange={(e) => setResumeTitle(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter a descriptive title for your resume"
                    />
                    {!resumeTitle.trim() && (
                        <p className="mt-1 text-red-500 text-sm">Resume title is required</p>
                    )}
                </div>

                {/* Save Options */}
                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <input
                            id="save-current"
                            type="radio"
                            checked={!saveAsNew}
                            onChange={() => setSaveAsNew(false)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="save-current" className="ml-2 block text-sm font-medium text-gray-700">
                            Update Current Resume
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="save-new"
                            type="radio"
                            checked={saveAsNew}
                            onChange={() => setSaveAsNew(true)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="save-new" className="ml-2 block text-sm font-medium text-gray-700">
                            Save as New Resume
                        </label>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        {saveAsNew
                            ? "This will create a new resume version with the current content."
                            : resumeId
                                ? "This will update your existing resume with the latest changes."
                                : "This will save your resume for the first time."}
                    </p>
                </div>

                {saveError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                        {saveError}
                    </div>
                )}

                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => setShowSaveModal(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        disabled={saveLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (saveAsNew) {
                                // Clear resumeId to create a new one
                                setResumeId(null);
                            }
                            handleSaveResume();
                        }}
                        disabled={saveLoading || !resumeTitle.trim()}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        {saveLoading ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" />
                                Saving...
                            </>
                        ) : saveAsNew ? (
                            <>
                                <FaPlus className="mr-2" />
                                Save as New
                            </>
                        ) : (
                            <>
                                <FaSave className="mr-2" />
                                Save Resume
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        );

        return (
            <AnimatePresence>
                {showSaveModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                    >
                        {modalContent}
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    // Toggle preview collapse
    const togglePreviewCollapse = () => {
        setIsPreviewCollapsed(!isPreviewCollapsed);
    };

    // Handle preview width resize
    const handlePreviewResize = (newWidth) => {
        setPreviewWidth(newWidth);
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                {/* Resume Title Header */}
                <div className="max-w-7xl mx-auto mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-800">
                            {initialLoading ? (
                                <div className="flex items-center">
                                    <FaSpinner className="animate-spin mr-2" />
                                    Loading Resume...
                                </div>
                            ) : (
                                resumeTitle || 'Untitled Resume'
                            )}
                        </h1>
                        <button
                            onClick={() => navigate('/resume-selector')}
                            className="px-4 py-2 text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            Back to Resume List
                        </button>
                    </div>
                </div>

                {/* Template Selection */}
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800">Choose Your Template</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleTemplateChange('modern')}
                                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                                    selectedTemplate === 'modern'
                                        ? 'border-blue-500 ring-2 ring-blue-200'
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                                    <div className="p-4">
                                        <h4 className="text-lg font-semibold mb-2">Modern Template</h4>
                                        <p className="text-sm text-gray-600">Clean and contemporary design</p>
                                    </div>
                                </div>
                                {selectedTemplate === 'modern' && (
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full">
                                        <FaCheck className="w-4 h-4" />
                                    </div>
                                )}
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleTemplateChange('classic')}
                                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                                    selectedTemplate === 'classic'
                                        ? 'border-blue-500 ring-2 ring-blue-200'
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                                    <div className="p-4">
                                        <h4 className="text-lg font-semibold mb-2">Classic Template</h4>
                                        <p className="text-sm text-gray-600">Traditional and professional layout</p>
                                    </div>
                                </div>
                                {selectedTemplate === 'classic' && (
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full">
                                        <FaCheck className="w-4 h-4" />
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Split-screen layout */}
                <div className="max-w-7xl mx-auto flex flex-col" ref={contentRef}>
                    {/* Section Management */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800">Manage Sections</h3>
                        <div className="flex flex-wrap gap-3">
                            {sections.map(section => (
                                <motion.button
                                    key={section.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleSection(section.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        section.isVisible
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {section.title}
                                </motion.button>
                            ))}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={addNewSection}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-all duration-200 shadow-md"
                            >
                                + Add Section
                            </motion.button>
                        </div>
                    </div>

                    {/* Split-screen content area */}
                    <div className="flex h-[calc(100vh-400px)] mb-8">
                        {/* Form panel */}
                        <div className="flex-1 overflow-y-auto bg-white rounded-l-xl shadow-lg border border-gray-100 p-6">
                            <div className="space-y-8">
                                {/* Form sections rendered here */}
                                {/* Personal Information Section */}
                                {sections.find(s => s.id === 'personal')?.isVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={formData.personal.fullName}
                                                    onChange={(e) => handleInputChange('personal', 'fullName', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                                <input
                                                    type="text"
                                                    placeholder="City, Country"
                                                    value={formData.personal.location}
                                                    onChange={(e) => handleInputChange('personal', 'location', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                                <input
                                                    type="tel"
                                                    placeholder="+1 234 567 890"
                                                    value={formData.personal.phone}
                                                    onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                                <input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={formData.personal.email}
                                                    onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://github.com/username"
                                                    value={formData.personal.github}
                                                    onChange={(e) => handleInputChange('personal', 'github', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://linkedin.com/in/username"
                                                    value={formData.personal.linkedin}
                                                    onChange={(e) => handleInputChange('personal', 'linkedin', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Technical Skills Section */}
                                {sections.find(s => s.id === 'technicalSkills')?.isVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-xl font-bold text-gray-800">Technical Skills</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Programming Languages
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., JavaScript, Python, Java"
                                                    value={formData.technicalSkills.languages}
                                                    onChange={(e) => handleInputChange('technicalSkills', 'languages', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Technologies & Frameworks
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., React, Node.js, Docker"
                                                    value={formData.technicalSkills.technologies}
                                                    onChange={(e) => handleInputChange('technicalSkills', 'technologies', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Additional Skills
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Agile, Git, CI/CD"
                                                    value={formData.technicalSkills.skills}
                                                    onChange={(e) => handleInputChange('technicalSkills', 'skills', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Experience Section */}
                                {sections.find(s => s.id === 'training')?.isVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-gray-800">Experience</h3>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => addArrayItem('training', {
                                                    company: '',
                                                    position: '',
                                                    duration: '',
                                                    points: ['']
                                                })}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md flex items-center"
                                            >
                                                <FaPlus className="mr-2" />
                                                Add Experience
                                            </motion.button>
                                        </div>

                                        {formData.training.map((exp, index) => (
                                            <motion.div
                                                key={exp.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                                            >
                                                <div className="flex justify-between mb-4">
                                                    <h4 className="font-medium">Experience {index + 1}</h4>
                                                    <button
                                                        onClick={() => removeArrayItem('training', index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Company Name"
                                                            value={exp.company}
                                                            onChange={(e) => handleArrayFieldChange('training', index, 'company', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Position</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Position"
                                                            value={exp.position}
                                                            onChange={(e) => handleArrayFieldChange('training', index, 'position', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g., 2020 - 2022"
                                                            value={exp.duration}
                                                            onChange={(e) => handleArrayFieldChange('training', index, 'duration', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700">Key Responsibilities/Achievements</label>
                                                    {exp.points?.map((point, pointIndex) => (
                                                        <div key={pointIndex} className="flex items-center space-x-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Describe your responsibilities or achievements"
                                                                value={point}
                                                                onChange={(e) => {
                                                                    const newPoints = [...exp.points];
                                                                    newPoints[pointIndex] = e.target.value;
                                                                    handleArrayFieldChange('training', index, 'points', newPoints);
                                                                }}
                                                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newPoints = [...exp.points];
                                                                    if (newPoints.length > 1) {
                                                                        newPoints.splice(pointIndex, 1);
                                                                        handleArrayFieldChange('training', index, 'points', newPoints);
                                                                    }
                                                                }}
                                                                className="text-red-500 hover:text-red-700"
                                                                disabled={exp.points.length <= 1}
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => {
                                                            const newPoints = [...exp.points, ''];
                                                            handleArrayFieldChange('training', index, 'points', newPoints);
                                                        }}
                                                        className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                                                    >
                                                        <FaPlus className="mr-1" /> Add Point
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Projects Section */}
                                {sections.find(s => s.id === 'projects')?.isVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-gray-800">Projects</h3>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => addArrayItem('projects', {
                                                    title: '',
                                                    technologies: '',
                                                    duration: '',
                                                    points: [''],
                                                    githubLink: ''
                                                })}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md flex items-center"
                                            >
                                                <FaPlus className="mr-2" />
                                                Add Project
                                            </motion.button>
                                        </div>

                                        {formData.projects.map((project, index) => (
                                            <motion.div
                                                key={project.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                                            >
                                                <div className="flex justify-between mb-4">
                                                    <h4 className="font-medium">Project {index + 1}</h4>
                                                    <button
                                                        onClick={() => removeArrayItem('projects', index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Project Title</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Project Title"
                                                            value={project.title}
                                                            onChange={(e) => handleArrayFieldChange('projects', index, 'title', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Technologies Used</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g., React, Node.js, MongoDB"
                                                            value={project.technologies}
                                                            onChange={(e) => handleArrayFieldChange('projects', index, 'technologies', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g., Jan 2022 - Mar 2022"
                                                            value={project.duration}
                                                            onChange={(e) => handleArrayFieldChange('projects', index, 'duration', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">GitHub Link</label>
                                                        <input
                                                            type="url"
                                                            placeholder="https://github.com/username/project"
                                                            value={project.githubLink}
                                                            onChange={(e) => handleArrayFieldChange('projects', index, 'githubLink', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700">Project Details</label>
                                                    {project.points?.map((point, pointIndex) => (
                                                        <div key={pointIndex} className="flex items-center space-x-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Describe the project, your role, or achievements"
                                                                value={point}
                                                                onChange={(e) => {
                                                                    const newPoints = [...project.points];
                                                                    newPoints[pointIndex] = e.target.value;
                                                                    handleArrayFieldChange('projects', index, 'points', newPoints);
                                                                }}
                                                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newPoints = [...project.points];
                                                                    if (newPoints.length > 1) {
                                                                        newPoints.splice(pointIndex, 1);
                                                                        handleArrayFieldChange('projects', index, 'points', newPoints);
                                                                    }
                                                                }}
                                                                className="text-red-500 hover:text-red-700"
                                                                disabled={project.points.length <= 1}
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => {
                                                            const newPoints = [...project.points, ''];
                                                            handleArrayFieldChange('projects', index, 'points', newPoints);
                                                        }}
                                                        className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                                                    >
                                                        <FaPlus className="mr-1" /> Add Point
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Education Section */}
                                {sections.find(s => s.id === 'education')?.isVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-gray-800">Education</h3>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => addArrayItem('education', {
                                                    institution: '',
                                                    degree: '',
                                                    location: '',
                                                    duration: '',
                                                    details: ''
                                                })}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md flex items-center"
                                            >
                                                <FaPlus className="mr-2" />
                                                Add Education
                                            </motion.button>
                                        </div>

                                        {formData.education.map((edu, index) => (
                                            <motion.div
                                                key={edu.id || index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                                            >
                                                <div className="flex justify-between mb-4">
                                                    <h4 className="font-medium">Education {index + 1}</h4>
                                                    <button
                                                        onClick={() => removeArrayItem('education', index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Institution</label>
                                                        <input
                                                            type="text"
                                                            placeholder="University/College Name"
                                                            value={edu.institution}
                                                            onChange={(e) => handleArrayFieldChange('education', index, 'institution', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Degree</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g., Bachelor of Science in Computer Science"
                                                            value={edu.degree}
                                                            onChange={(e) => handleArrayFieldChange('education', index, 'degree', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Location</label>
                                                        <input
                                                            type="text"
                                                            placeholder="City, Country"
                                                            value={edu.location}
                                                            onChange={(e) => handleArrayFieldChange('education', index, 'location', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g., 2018 - 2022"
                                                            value={edu.duration}
                                                            onChange={(e) => handleArrayFieldChange('education', index, 'duration', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700">Additional Details</label>
                                                    <textarea
                                                        placeholder="GPA, achievements, relevant coursework, etc."
                                                        value={edu.details}
                                                        onChange={(e) => handleArrayFieldChange('education', index, 'details', e.target.value)}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        rows="3"
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Certifications Section */}
                                {sections.find(s => s.id === 'certifications')?.isVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-gray-800">Certifications</h3>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => addArrayItem('certifications', {
                                                    title: '',
                                                    platform: '',
                                                    date: '',
                                                    certificateLink: ''
                                                })}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md flex items-center"
                                            >
                                                <FaPlus className="mr-2" />
                                                Add Certification
                                            </motion.button>
                                        </div>

                                        {formData.certifications.map((cert, index) => (
                                            <motion.div
                                                key={cert.id || index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                                            >
                                                <div className="flex justify-between mb-4">
                                                    <h4 className="font-medium">Certification {index + 1}</h4>
                                                    <button
                                                        onClick={() => removeArrayItem('certifications', index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Certification Title</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g., AWS Certified Solutions Architect"
                                                            value={cert.title}
                                                            onChange={(e) => handleArrayFieldChange('certifications', index, 'title', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Issuing Platform</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g., Amazon Web Services"
                                                            value={cert.platform}
                                                            onChange={(e) => handleArrayFieldChange('certifications', index, 'platform', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Date</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g., May 2022"
                                                            value={cert.date}
                                                            onChange={(e) => handleArrayFieldChange('certifications', index, 'date', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Certificate Link</label>
                                                        <input
                                                            type="url"
                                                            placeholder="https://example.com/certificate"
                                                            value={cert.certificateLink}
                                                            onChange={(e) => handleArrayFieldChange('certifications', index, 'certificateLink', e.target.value)}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Resizable divider */}
                        <ResizableDivider onResize={handlePreviewResize} />

                        {/* Preview panel */}
                        <ResumePreview
                            formData={formData}
                            template={selectedTemplate}
                            isCollapsed={isPreviewCollapsed}
                            toggleCollapse={togglePreviewCollapse}
                            previewWidth={previewWidth}
                            className="rounded-r-xl"
                        />
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="sticky bottom-0 bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex justify-between items-center"
                    >
                        {/* Save Status Indicator */}
                        <div className="flex items-center text-sm text-gray-600">
                            {initialLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                                    <span>Loading resume...</span>
                                </div>
                            ) : isSaving ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500 mr-2"></div>
                                    <span>Saving...</span>
                                </div>
                            ) : hasUnsavedChanges ? (
                                <span className="text-amber-600">Unsaved changes</span>
                            ) : lastSaved ? (
                                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                            ) : (
                                <span>Not saved yet</span>
                            )}

                            {resumeTitle && (
                                <span className="ml-4 font-medium">{resumeTitle}</span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleOpenSaveModal}
                                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 shadow-md flex items-center"
                                disabled={isSaving || initialLoading}
                            >
                                <FaPlus className="mr-2" />
                                Save Resume
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsPreviewOpen(true)}
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md flex items-center"
                            >
                                <FaEye className="mr-2" />
                                Full Preview
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDownloadResume}
                                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 shadow-md flex items-center"
                            >
                                <FaDownload className="mr-2" />
                                Download PDF
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                formData={formData}
                template={selectedTemplate}
            />
            <SaveModal />
        </>
    );
};

export default ResumeBuilder;