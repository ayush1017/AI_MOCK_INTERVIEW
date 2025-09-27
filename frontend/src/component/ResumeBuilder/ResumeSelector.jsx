import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../Header';
import Footer from '../Footer';

const ResumeSelector = () => {
    const [userResumes, setUserResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNewResumeModal, setShowNewResumeModal] = useState(false);
    const [newResumeTitle, setNewResumeTitle] = useState('');
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [resumeToDelete, setResumeToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const navigate = useNavigate();
    console.log('ResumeSelector component initialized');

    // Fetch user's resumes when component mounts
    useEffect(() => {
        fetchUserResumes();
    }, []);

    // Fetch user's resumes
    const fetchUserResumes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Log the API URL and token for debugging
            console.log('API URL:', import.meta.env.VITE_API_URL);
            console.log('Token available:', !!token);

            // Hardcoded API URL as fallback if environment variable is not set
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            console.log('Using API URL:', apiUrl);

            const response = await fetch(`${apiUrl}/resume/list`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to fetch resumes: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Resumes data:', data);
            setUserResumes(data.resumes || []);
        } catch (error) {
            console.error('Error fetching resumes:', error);
            setError('Failed to load your resumes. Please try again.');
            toast.error('Failed to load your resumes');
        } finally {
            setLoading(false);
        }
    };

    // Handle creating a new resume
    const handleCreateNewResume = async (e) => {
        e.preventDefault();

        if (!newResumeTitle.trim()) {
            toast.error('Please enter a resume title');
            return;
        }

        try {
            console.log('Creating new resume with title:', newResumeTitle);

            // Close the modal first
            setShowNewResumeModal(false);

            // Show a success message
            toast.success(`Creating new resume: ${newResumeTitle}`);

            // Create a new empty resume on the server first
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('You must be logged in to create a resume');
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            console.log('Using API URL for creating new resume:', apiUrl);

            const response = await fetch(`${apiUrl}/resume/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newResumeTitle,
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
                    education: [],
                    template: 'modern'
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('New resume created:', data);

                // Navigate to the resume builder with the new resume ID
                navigate(`/resume-builder/${data.resume._id}`);
            } else {
                throw new Error('Failed to create new resume');
            }
        } catch (error) {
            console.error('Error creating new resume:', error);
            toast.error('Failed to create new resume');
        }
    };

    // Handle selecting an existing resume
    const handleSelectResume = (resumeId) => {
        console.log('Selecting resume with ID:', resumeId);
        toast.info('Loading resume...');
        navigate(`/resume-builder/${resumeId}`);
    };

    // Handle deleting a resume
    const handleDeleteResume = async () => {
        if (!resumeToDelete) return;

        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('You must be logged in to delete a resume');
                return;
            }

            // Hardcoded API URL as fallback if environment variable is not set
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            console.log('Deleting resume with ID:', resumeToDelete);

            const response = await fetch(`${apiUrl}/resume/${resumeToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Delete response status:', response.status);

            if (response.ok) {
                // Remove the deleted resume from the list
                setUserResumes(prev => prev.filter(resume => resume._id !== resumeToDelete));
                toast.success('Resume deleted successfully');
                setShowDeleteModal(false);
                setResumeToDelete(null);
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to delete resume: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error deleting resume:', error);
            toast.error('Failed to delete resume');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <ToastContainer position="top-right" autoClose={3000} />
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
                        <p className="text-gray-600">Loading your resumes...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
                        <p className="mt-2 text-lg text-gray-600">Create a new resume or edit an existing one</p>
                    </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Your Resumes</h2>
                        <button
                            onClick={() => setShowNewResumeModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center"
                        >
                            <FaPlus className="mr-2" />
                            Create New Resume
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {userResumes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userResumes.map(resume => (
                                <div
                                    key={resume._id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-lg">{resume.title || 'Untitled Resume'}</h3>
                                        <button
                                            onClick={() => {
                                                setResumeToDelete(resume._id);
                                                setShowDeleteModal(true);
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete Resume"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                    <div className="text-sm text-gray-500 mb-4">
                                        <div>Created: {new Date(resume.createdAt).toLocaleDateString()}</div>
                                        <div>Last updated: {new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}</div>
                                    </div>

                                    <button
                                        onClick={() => handleSelectResume(resume._id)}
                                        className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center"
                                    >
                                        <FaEdit className="mr-2" />
                                        Edit Resume
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">You don't have any resumes yet. Create your first resume to get started!</p>
                            <button
                                onClick={() => setShowNewResumeModal(true)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center mx-auto"
                            >
                                <FaPlus className="mr-2" />
                                Create Your First Resume
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* New Resume Modal */}
            <AnimatePresence>
                {showNewResumeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                        >
                            <h3 className="text-xl font-bold mb-4">Create New Resume</h3>

                            <form onSubmit={handleCreateNewResume}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Resume Title
                                    </label>
                                    <input
                                        type="text"
                                        value={newResumeTitle}
                                        onChange={(e) => setNewResumeTitle(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., Software Developer Resume"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewResumeModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                                    >
                                        <FaArrowRight className="mr-2" />
                                        Continue
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                        >
                            <h3 className="text-xl font-bold mb-4">Delete Resume</h3>
                            <p className="mb-6">Are you sure you want to delete this resume? This action cannot be undone.</p>

                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setResumeToDelete(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteResume}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
                                >
                                    {isDeleting ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <FaTrash className="mr-2" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        <Footer />
        </>
    );
};

export default ResumeSelector;
