import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import {
    FaRobot, FaFileAlt, FaUserTie, FaKeyboard,
    FaVideo, FaMicrophone, FaMagic, FaGraduationCap,
    FaChartLine, FaDownload, FaRegKeyboard
} from 'react-icons/fa';

const FeatureSection = ({ title, description, icon: Icon, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-xl shadow-lg p-8 mb-8"
    >
        <div className="flex items-center mb-6">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Icon className="text-2xl text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="space-y-4">{children}</div>
    </motion.div>
);

const Shortcut = ({ keys, description }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-gray-600">{description}</span>
        <div className="flex space-x-2">
            {keys.map((key, index) => (
                <span key={index} className="px-3 py-1 bg-gray-200 rounded text-sm font-mono">
                    {key}
                </span>
            ))}
        </div>
    </div>
);

const LearnMore = () => {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Welcome to RRR Documentation
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Learn how to make the most of our AI-powered platform for resume building
                            and interview preparation.
                        </p>
                    </motion.div>

                    {/* Resume Builder Section */}
                    <FeatureSection
                        title="AI Resume Builder"
                        description="Create professional resumes tailored to your industry with our advanced AI technology."
                        icon={FaFileAlt}
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-blue-50 p-6 rounded-lg">
                                <h3 className="font-semibold mb-3 flex items-center">
                                    <FaMagic className="mr-2" /> AI Features
                                </h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• Automatic content suggestions</li>
                                    <li>• Skills analysis and recommendations</li>
                                    <li>• Industry-specific templates</li>
                                    <li>• Professional formatting</li>
                                </ul>
                            </div>
                            <div className="bg-green-50 p-6 rounded-lg">
                                <h3 className="font-semibold mb-3">Key Features</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• Multiple section management</li>
                                    <li>• Real-time preview</li>
                                    <li>• PDF export</li>
                                    <li>• Custom formatting options</li>
                                </ul>
                            </div>
                        </div>
                    </FeatureSection>

                    {/* Mock Interview Section */}
                    <FeatureSection
                        title="AI Mock Interviews"
                        description="Practice with our AI interviewer and get real-time feedback to improve your performance."
                        icon={FaUserTie}
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-purple-50 p-6 rounded-lg">
                                <h3 className="font-semibold mb-3 flex items-center">
                                    <FaRobot className="mr-2" /> Interview Features
                                </h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• Resume-based questions</li>
                                    <li>• Real-time feedback</li>
                                    <li>• Multiple difficulty levels</li>
                                    <li>• Performance analytics</li>
                                </ul>
                            </div>
                            <div className="bg-yellow-50 p-6 rounded-lg">
                                <h3 className="font-semibold mb-3">Technical Setup</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li>• Video and audio controls</li>
                                    <li>• Screen sharing options</li>
                                    <li>• Code editor for technical interviews</li>
                                    <li>• Interview recording</li>
                                </ul>
                            </div>
                        </div>
                    </FeatureSection>

                    {/* Keyboard Shortcuts */}
                    <FeatureSection
                        title="Keyboard Shortcuts"
                        description="Speed up your workflow with these helpful keyboard shortcuts."
                        icon={FaRegKeyboard}
                    >
                        <div className="grid gap-4">
                            <Shortcut keys={["Ctrl", "P"]} description="Preview Resume" />
                            <Shortcut keys={["Ctrl", "S"]} description="Save Changes" />
                            <Shortcut keys={["Ctrl", "E"]} description="Export as PDF" />
                            <Shortcut keys={["Esc"]} description="Exit Preview/Modal" />
                        </div>
                    </FeatureSection>

                    {/* Getting Started */}
                    <FeatureSection
                        title="Getting Started"
                        description="Follow these steps to begin your journey with RRR."
                        icon={FaGraduationCap}
                    >
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-4">1</span>
                                <div>
                                    <h3 className="font-semibold mb-2">Create an Account</h3>
                                    <p className="text-gray-600">Sign up with your email or social media accounts to get started.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-4">2</span>
                                <div>
                                    <h3 className="font-semibold mb-2">Build Your Resume</h3>
                                    <p className="text-gray-600">Use our AI-powered resume builder to create a professional resume.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-4">3</span>
                                <div>
                                    <h3 className="font-semibold mb-2">Practice Interviews</h3>
                                    <p className="text-gray-600">Prepare for your interviews with our AI interviewer.</p>
                                </div>
                            </div>
                        </div>
                    </FeatureSection>

                    {/* Call to Action */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mt-16"
                    >
                        <Link
                            to="/mock-interviews"
                            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Start Your Journey
                        </Link>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default LearnMore; 