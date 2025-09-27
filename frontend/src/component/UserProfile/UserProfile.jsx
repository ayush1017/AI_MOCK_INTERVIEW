import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaFileAlt, FaHistory, FaCog, FaSignOutAlt, FaEdit, FaDownload, FaTrash, FaEye, FaPlus } from 'react-icons/fa';
import Header from '../Header';
import Footer from '../Footer';
import { useNavigate } from 'react-router-dom';
import PreviewModal from '../ResumeBuilder/PreviewModal';

const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [resumeData, setResumeData] = useState(null);
    const [userResumes, setUserResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [interviewHistory, setInterviewHistory] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [resumeToDelete, setResumeToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/resume/user-data`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUserData(data);

                // Fetch all user resumes
                const resumesResponse = await fetch(`${import.meta.env.VITE_API_URL}/resume/list`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (resumesResponse.ok) {
                    const data = await resumesResponse.json();
                    setUserResumes(data.resumes || []);

                    // If there are resumes, set the first one as selected and fetch its data
                    if (data.resumes && data.resumes.length > 0) {
                        setSelectedResumeId(data.resumes[0]._id);

                        // Fetch the first resume's data
                        const resumeResponse = await fetch(`${import.meta.env.VITE_API_URL}/resume/${data.resumes[0]._id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (resumeResponse.ok) {
                            const resumeData = await resumeResponse.json();
                            setResumeData(resumeData);
                        }
                    }
                }

                // Fetch interview history (assuming you have this endpoint)
                const historyResponse = await fetch(`${import.meta.env.VITE_API_URL}/interview/history`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (historyResponse.ok) {
                    const data = await historyResponse.json();
                    setInterviewHistory(data);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    // Handle selecting a resume to view
    const handleSelectResume = async (resumeId) => {
        setSelectedResumeId(resumeId);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/resume/${resumeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setResumeData(data);
            } else {
                throw new Error('Failed to fetch resume data');
            }
        } catch (error) {
            console.error('Error fetching resume:', error);
        }
    };

    // Handle editing a specific resume
    const handleEditResume = (resumeId) => {
        // Navigate to resume builder with the selected resume ID
        navigate(`/resume-builder/${resumeId || selectedResumeId}`);
    };

    // Handle previewing a resume
    const handlePreviewResume = () => {
        if (resumeData) {
            setIsPreviewOpen(true);
        }
    };

    // Handle downloading a resume
    const handleDownloadResume = async (resumeId) => {
        try {
            const token = localStorage.getItem('token');
            const id = resumeId || selectedResumeId;

            if (!id) {
                console.error('No resume selected for download');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/resume/download/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resume-${id}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error('Failed to download resume');
            }
        } catch (error) {
            console.error('Error downloading resume:', error);
        }
    };

    // Handle deleting a resume
    const handleDeleteResume = async () => {
        if (!resumeToDelete) return;

        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/resume/${resumeToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Remove the deleted resume from the list
                setUserResumes(prev => prev.filter(resume => resume._id !== resumeToDelete));

                // If the deleted resume was the selected one, select another one if available
                if (resumeToDelete === selectedResumeId) {
                    const remainingResumes = userResumes.filter(resume => resume._id !== resumeToDelete);
                    if (remainingResumes.length > 0) {
                        handleSelectResume(remainingResumes[0]._id);
                    } else {
                        setResumeData(null);
                        setSelectedResumeId(null);
                    }
                }

                setShowDeleteModal(false);
                setResumeToDelete(null);
            } else {
                throw new Error('Failed to delete resume');
            }
        } catch (error) {
            console.error('Error deleting resume:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Confirmation modal for resume deletion
    const DeleteConfirmationModal = () => (
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${showDeleteModal ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
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
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-100 py-12">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Profile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-lg p-6 mb-6"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-4xl text-white">{userData?.fullName?.[0]}</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{userData?.fullName}</h1>
                                <p className="text-gray-600">{userData?.email}</p>
                                <p className="text-gray-500">{userData?.ageCategory}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Profile Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Resume Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-lg shadow-lg p-6 md:col-span-2"
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                <FaFileAlt className="mr-2 text-blue-500" />
                                Your Resumes
                            </h2>

                            {userResumes.length > 0 ? (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        {userResumes.map(resume => (
                                            <div
                                                key={resume._id}
                                                className={`border rounded-lg p-4 transition-all duration-200 ${selectedResumeId === resume._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-medium text-lg">{resume.title || 'Untitled Resume'}</h4>
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

                                                <div className="text-sm text-gray-500 mb-3">
                                                    <div>Created: {new Date(resume.createdAt).toLocaleString()}</div>
                                                    <div>Last updated: {new Date(resume.updatedAt || resume.createdAt).toLocaleString()}</div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => handleSelectResume(resume._id)}
                                                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-all duration-200 text-sm flex items-center"
                                                    >
                                                        <FaEye className="mr-1" size={12} />
                                                        Select
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditResume(resume._id)}
                                                        className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-all duration-200 text-sm flex items-center"
                                                    >
                                                        <FaEdit className="mr-1" size={12} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadResume(resume._id)}
                                                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-all duration-200 text-sm flex items-center"
                                                    >
                                                        <FaDownload className="mr-1" size={12} />
                                                        Download
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Selected Resume Preview */}
                                    {resumeData && (
                                        <div className="border-t pt-4 mt-4">
                                            <h4 className="font-medium mb-3">Selected Resume: {resumeData.title || 'Untitled Resume'}</h4>
                                            <div className="flex flex-wrap gap-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handlePreviewResume}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                                                >
                                                    <FaEye className="mr-2" />
                                                    Full Preview
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleEditResume(selectedResumeId)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                                                >
                                                    <FaEdit className="mr-2" />
                                                    Edit
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleDownloadResume(selectedResumeId)}
                                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                                                >
                                                    <FaDownload className="mr-2" />
                                                    Download PDF
                                                </motion.button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => navigate('/resume-selector')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                                        >
                                            <FaPlus className="mr-2" />
                                            Create New Resume
                                        </motion.button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-gray-600 mb-4">You don't have any saved resumes yet. Create one to get started.</p>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/resume-selector')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                                    >
                                        <FaPlus className="mr-2" />
                                        Create Resume
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>

                        {/* Interview History */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-lg shadow-lg p-6"
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                <FaHistory className="mr-2 text-blue-500" />
                                Interview History
                            </h2>
                            {interviewHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {interviewHistory.map((interview, index) => (
                                        <div
                                            key={index}
                                            className="border-l-4 border-blue-500 pl-4 py-2"
                                        >
                                            <p className="font-semibold">{interview.topic}</p>
                                            <p className="text-sm text-gray-600">{interview.date}</p>
                                            <p className="text-sm">Score: {interview.score}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center">No interview history available</p>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                formData={resumeData}
                template={resumeData?.template || 'modern'}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
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
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default UserProfile;