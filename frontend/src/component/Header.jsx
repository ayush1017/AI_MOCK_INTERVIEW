import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { useState, useRef, useEffect } from 'react';
import { Link } from "react-router-dom";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const hideFeatures = ["/about", "/login", "/contact", "/registration"].includes(location.pathname);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const profileMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setShowMobileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg py-3 relative">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
                {/* Logo and Navigation */}
                <Link to="/">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center space-x-2 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaRobot className="text-3xl text-blue-400" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                            RRR
                        </h1>
                    </motion.div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <NavLink to="/" className={({ isActive }) => `font-medium py-2 px-4 rounded-lg transition-all duration-300 ${isActive ? "text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}>
                        Home
                    </NavLink>
                    <NavLink
                        to="/about"
                        className={({ isActive }) =>
                            `font-medium py-2 px-4 rounded-lg ${isActive
                                ? "text-white bg-indigo-600 shadow-md"
                                : "text-gray-400 hover:text-white hover:bg-indigo-500 transition"}`
                        }
                    >
                        About
                    </NavLink>
                    {!hideFeatures && (
                        <a href="#features" className="text-gray-400 font-medium py-2 px-4 rounded-lg hover:text-white hover:bg-indigo-500 transition">
                            Features
                        </a>
                    )}
                    <NavLink
                        to="/contact"
                        className={({ isActive }) =>
                            `font-medium py-2 px-4 rounded-lg ${isActive
                                ? "text-white bg-indigo-600 shadow-md"
                                : "text-gray-400 hover:text-white hover:bg-indigo-500 transition"}`
                        }
                    >
                        Contact
                    </NavLink>
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="text-gray-300 hover:text-white focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        {showMobileMenu ? (
                            <FaTimes className="text-2xl" />
                        ) : (
                            <FaBars className="text-2xl" />
                        )}
                    </motion.button>
                </div>

                {/* User Info and Actions */}
                <div className="flex space-x-4 items-center">
                    {user ? (
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center space-x-2 text-gray-300 hover:text-white"
                            >
                                <FaUserCircle className="text-2xl" />
                                <span>{user.fullName}</span>
                            </button>

                            {showProfileMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                                >
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/resume-builder"
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    >
                                        Resume Builder
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        <>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <NavLink
                                    to="/login"
                                    className={({ isActive }) => `py-2 px-4 rounded-md ${isActive ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" : "bg-blue-500 text-white hover:bg-blue-600 transition"}`}
                                >
                                    Login
                                </NavLink>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <NavLink
                                    to="/registration"
                                    className={({ isActive }) => `py-2 px-4 rounded-md ${isActive ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg" : "bg-green-500 text-white hover:bg-green-600 transition"}`}
                                >
                                    Register
                                </NavLink>
                            </motion.div>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {showMobileMenu && (
                    <motion.div
                        ref={mobileMenuRef}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden bg-gray-800 w-full absolute top-full left-0 z-50 shadow-lg"
                    >
                        <div className="flex flex-col p-4 space-y-3">
                            <NavLink
                                to="/"
                                className={({ isActive }) => `font-medium py-3 px-4 rounded-lg text-center ${isActive ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/about"
                                className={({ isActive }) => `font-medium py-3 px-4 rounded-lg text-center ${isActive ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                                onClick={() => setShowMobileMenu(false)}
                            >
                                About
                            </NavLink>
                            {!hideFeatures && (
                                <a
                                    href="#features"
                                    className="font-medium py-3 px-4 rounded-lg text-gray-300 hover:bg-gray-700 text-center"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    Features
                                </a>
                            )}
                            <NavLink
                                to="/contact"
                                className={({ isActive }) => `font-medium py-3 px-4 rounded-lg text-center ${isActive ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Contact
                            </NavLink>

                            {/* Mobile-specific login/register buttons */}
                            {!user && (
                                <>
                                    <NavLink
                                        to="/login"
                                        className={({ isActive }) => `py-3 px-4 rounded-md text-center ${isActive ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        Login
                                    </NavLink>
                                    <NavLink
                                        to="/registration"
                                        className={({ isActive }) => `py-3 px-4 rounded-md text-center ${isActive ? "bg-gradient-to-r from-green-500 to-blue-500 text-white" : "bg-green-500 text-white hover:bg-green-600"}`}
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        Register
                                    </NavLink>
                                </>
                            )}

                            {/* Mobile user menu items */}
                            {user && (
                                <>
                                    <NavLink
                                        to="/profile"
                                        className={({ isActive }) => `py-3 px-4 rounded-md text-center ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        Profile
                                    </NavLink>
                                    <NavLink
                                        to="/resume-builder"
                                        className={({ isActive }) => `py-3 px-4 rounded-md text-center ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        Resume Builder
                                    </NavLink>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setShowMobileMenu(false);
                                        }}
                                        className="py-3 px-4 rounded-md text-red-500 hover:bg-gray-700 w-full text-center"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
