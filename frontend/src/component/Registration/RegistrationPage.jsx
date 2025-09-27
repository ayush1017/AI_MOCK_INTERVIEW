import React, { useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegistrationPage = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [otpData, setOtpData] = useState({
        otp: "",
        isOtpSent: false,
        isOtpVerified: false,
        isOtpSending: false,
        isOtpVerifying: false
    });

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        if (name === "email") {
            validateEmail(value);
        }

        // Real-time password validation
        if (name === 'password' || name === 'confirmPassword') {
            const otherPassword = name === 'password' ? formData.confirmPassword : formData.password;
            if (otherPassword && value !== otherPassword) {
                setPasswordError('Passwords do not match');
            } else {
                setPasswordError('');
            }
        }
    };

    const validateEmail = (email) => {
        // Regular expression for validating an email address
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address.");
        } else {
            setEmailError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otpData.isOtpVerified) {
            toast.error("Please verify your email first");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();


            if (response.ok) {
                toast.success("Registration successful! Please login.");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                toast.error(data.message || "Registration failed");
                //  
            }
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!formData.email || emailError) {
            toast.error("Please enter a valid email address");
            return;
        }

        setOtpData(prev => ({ ...prev, isOtpSending: true }));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    type: 'registration'
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("OTP sent successfully!");
                setOtpData(prev => ({
                    ...prev,
                    isOtpSent: true
                }));
            } else {
                toast.error(data.message || "Failed to send OTP");
                if (data.message === 'Email is already registered') {
                    setOtpData(prev => ({ ...prev, isOtpSent: false }));
                }
            }
        } catch (error) {
            toast.error("Failed to send OTP");
        } finally {
            setOtpData(prev => ({ ...prev, isOtpSending: false }));
        }
    };

    const handleVerifyOTP = async () => {
        if (!otpData.otp) {
            toast.error("Please enter OTP");
            return;
        }

        setOtpData(prev => ({ ...prev, isOtpVerifying: true }));
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    otp: otpData.otp
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("OTP verified successfully!");
                setOtpData(prev => ({ ...prev, isOtpVerified: true }));
            } else {
                toast.error(data.message || "Invalid OTP");
            }
        } catch (error) {
            toast.error("Failed to verify OTP");
        } finally {
            setOtpData(prev => ({ ...prev, isOtpVerifying: false }));
        }
    };

    return (
        <>
            <Header />
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-indigo-400">
                <div className="container max-w-lg bg-white bg-opacity-90 p-12 rounded-3xl shadow-lg my-8">
                    <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                        Join RRR
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name Input */}
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-3 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                            />

                            {/* Email with OTP Button */}
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-6 py-3 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                />
                                <motion.button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={otpData.isOtpSending || otpData.isOtpVerified}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {otpData.isOtpSending ? 'Sending...' : otpData.isOtpVerified ? 'Verified ✓' : 'Send OTP'}
                                </motion.button>
                            </div>

                            {/* OTP Verification */}
                            {otpData.isOtpSent && !otpData.isOtpVerified && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otpData.otp}
                                        onChange={(e) => setOtpData(prev => ({ ...prev, otp: e.target.value }))}
                                        className="w-full px-6 py-3 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <motion.button
                                        type="button"
                                        onClick={handleVerifyOTP}
                                        disabled={otpData.isOtpVerifying}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {otpData.isOtpVerifying ? 'Verifying...' : 'Verify OTP'}
                                    </motion.button>
                                </div>
                            )}

                            {/* Password Input */}
                            <div className="space-y-1">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-6 py-3 text-black rounded-md border ${
                                        passwordError ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50`}
                                />
                            </div>

                            {/* Confirm Password Input */}
                            <div className="space-y-1">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-6 py-3 text-black rounded-md border ${
                                        passwordError ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50`}
                                />
                                {passwordError && (
                                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isLoading || !otpData.isOtpVerified || passwordError}
                            whileHover={!isLoading && !passwordError && { scale: 1.02 }}
                            whileTap={!isLoading && !passwordError && { scale: 0.98 }}
                            className={`w-full relative ${
                                !otpData.isOtpVerified || passwordError
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : isLoading
                                        ? 'bg-purple-400 cursor-wait'
                                        : 'bg-purple-600 hover:bg-purple-700'
                            } text-white py-3 px-6 rounded-md shadow-md transition-all duration-300`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Registering...
                                </div>
                            ) : (
                                'Register'
                            )}
                        </motion.button>

                        {/* Login Link */}
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link to="/login" className="text-purple-600 hover:text-purple-500">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </form>

                    {/* Bottom Text */}
                    <div className="mt-6 text-center text-gray-600">
                        <p>
                            <span className="text-purple-600">RRR</span> - Your gateway to professional success!
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
            <ToastContainer />
        </>
    );
};

export default RegistrationPage;
