import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import { motion } from "framer-motion";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        subscribe: false,
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true); // Start loading

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.result));
                navigate('/');
                window.location.reload();
            } else {
                setError(data.message || "Login failed");
                console.error("Login error response:", data);
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false); // Stop loading regardless of outcome
        }
    };

    return (
        <>
            <Header />
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-200 via-blue-200 to-indigo-400 text-black">
                <div className="container max-w-lg bg-white bg-opacity-90 p-12 rounded-3xl shadow-lg">
                    <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                        Welcome to RRR
                    </h1>

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                            <p>{error}</p>
                        </div>
                    )}

                    <form className="form-container space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <label className="block">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    className="w-full px-6 py-3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                />
                            </label>

                            <label className="block">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    className="w-full px-6 py-3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                />
                            </label>
                        </div>

                        <label className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                name="subscribe"
                                checked={formData.subscribe}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="mr-2"
                            />
                            <span className="text-sm">Agree to terms and conditions</span>
                        </label>

                        <motion.button
                            type="submit"
                            disabled={!formData.subscribe || isLoading}
                            whileHover={!isLoading && { scale: 1.02 }}
                            whileTap={!isLoading && { scale: 0.98 }}
                            className={`w-full relative ${
                                !formData.subscribe 
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
                                    Logging in...
                                </div>
                            ) : (
                                'Log In'
                            )}
                        </motion.button>

                        {/* Forgot Password and Sign Up links */}
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-400">
                                <Link 
                                    to="/forgot-password" 
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Forgot Password?
                                </Link>
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                                Don't have an account?{" "}
                                <Link to="/registration" className="text-purple-500 hover:text-purple-400">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-gray-400">
                        <p>
                            <span className="text-purple-500">RRR</span> helps you ace
                            your coding interviews with ease!
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default LoginPage;
