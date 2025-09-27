import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../Header';
import Footer from '../Footer';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const handleSendOTP = async () => {
        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);
        try {
            // First check if user exists
            const checkUserResponse = await fetch(`${import.meta.env.VITE_API_URL}/check-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const checkUserData = await checkUserResponse.json();

            if (!checkUserResponse.ok) {
                if (checkUserData.message === 'User not found') {
                    toast.error('No account found with this email. Please register first.');
                    setTimeout(() => {
                        navigate('/registration');
                    }, 2000);
                    return;
                }
                throw new Error(checkUserData.message);
            }

            // If user exists, proceed with sending OTP
            const response = await fetch(`${import.meta.env.VITE_API_URL}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email,
                    type: 'reset-password'
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('OTP sent successfully!');
                setStep(2);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to send OTP');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            toast.error('Please enter OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('OTP verified successfully!');
                setStep(3);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Password reset successfully!');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e, type) => {
        const value = e.target.value;
        if (type === 'new') {
            setNewPassword(value);
            if (confirmPassword && value !== confirmPassword) {
                setPasswordError('Passwords do not match');
            } else {
                setPasswordError('');
            }
        } else {
            setConfirmPassword(value);
            if (newPassword && value !== newPassword) {
                setPasswordError('Passwords do not match');
            } else {
                setPasswordError('');
            }
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full"
                >
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Reset Password
                    </h2>

                    {step === 1 && (
                        <div className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleVerifyOTP}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => handlePasswordChange(e, 'new')}
                                    placeholder="New Password"
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        passwordError ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            <div className="space-y-1">
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => handlePasswordChange(e, 'confirm')}
                                    placeholder="Confirm New Password"
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        passwordError ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {passwordError && (
                                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                                )}
                            </div>
                            <button
                                onClick={handleResetPassword}
                                disabled={loading || passwordError || !newPassword || !confirmPassword}
                                className={`w-full ${
                                    loading || passwordError
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                } text-white py-2 rounded-md disabled:opacity-50 transition-colors`}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
            <Footer />
            <ToastContainer />
        </>
    );
};

export default ForgotPassword; 