import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import { FaRobot, FaFileAlt, FaUserTie } from "react-icons/fa";
import backgroundImage from "../assets/rrrbackground.gif";

const FeatureCard = ({ icon: Icon, title, description, path, onNavigate }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
        onClick={() => path && onNavigate(path)}
    >
        <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <Icon className="text-3xl text-white" />
            </div>
            <h4 className="text-xl font-semibold text-white mb-3">{title}</h4>
            <p className="text-gray-400">{description}</p>
        </div>
    </motion.div>
);

const WelcomePage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: FaFileAlt,
            title: "Resume Builder",
            description: "Create professional resumes tailored to your industry with our intuitive builder.",
            path: "/resume-builder"
        },
        {
            icon: FaUserTie,
            title: "Mock Interviews",
            description: "Practice with our AI interviewer and get real-time feedback to improve your performance.",
            path: "/mock-interviews"
        },
        {
            icon: FaFileAlt,
            title: "Smart Recognition",
            description: "Our system analyzes your skills and experience to match you with the perfect opportunities.",
            path: "/smart-recognition"
        }
    ];

    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Hero Section with AI Eye Background */}
            <section
                className="relative h-screen w-full flex items-center"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundAttachment: "fixed"
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-60"></div>
                <div className="relative w-full max-w-7xl mx-auto px-4 z-10">
                    <div className="flex flex-col md:flex-row items-start gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="flex-1 max-w-2xl"
                        >
                            <h2 className="text-5xl font-bold text-white mb-6">
                                {user ? `Welcome back, ${user.fullName}` : 'Welcome to RRR'}
                            </h2>
                            <p className="text-2xl text-gray-300 mb-12 text-left leading-relaxed">
                                Professional tools to create standout resumes and ace interviews.
                                Your path to success starts here.
                            </p>
                            <div className="flex flex-row gap-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/mock-interviews')}
                                    className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Get Started
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/learn-more')}
                                    className="px-10 py-4 bg-white text-gray-800 rounded-lg text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Learn More
                                </motion.button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="flex-1 hidden md:flex justify-end"
                        >

                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <div className="w-8 h-12 border-2 border-white rounded-full flex justify-center p-2">
                        <motion.div
                            className="w-2 h-2 bg-white rounded-full"
                            animate={{ y: [0, 16, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* Enhanced Features Section */}
            <section id="features" className="py-20 bg-gray-900 min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto px-4 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h3 className="text-4xl font-bold text-white mb-6">
                            Why Choose <span className="text-blue-400">RRR?</span>
                        </h3>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                            Experience the future of career development with our cutting-edge features
                            designed to give you the competitive edge.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                {...feature}
                                onNavigate={navigate}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default WelcomePage;
