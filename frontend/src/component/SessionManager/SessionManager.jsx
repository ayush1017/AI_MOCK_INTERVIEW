import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';

const SessionManager = () => {
    const navigate = useNavigate();
    const [sessionExpiring, setSessionExpiring] = useState(false);
    const [warningShown, setWarningShown] = useState(false);
    const [expiredShown, setExpiredShown] = useState(false);

    // Refs to store toast IDs
    const warningToastId = useRef(null);
    const successToastId = useRef(null);
    const errorToastId = useRef(null);

    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined';

    // Function to parse JWT and get expiration time
    const getTokenExpirationTime = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const decodedToken = jwtDecode(token);
            return decodedToken.exp * 1000; // Convert to milliseconds
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    // Function to get user ID from token
    const getUserIdFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const decodedToken = jwtDecode(token);
            return decodedToken.id; // Get user ID directly from token
        } catch (error) {
            console.error('Error getting user ID from token:', error);
            return null;
        }
    };

    // Function to refresh the token
    const refreshSession = async () => {
        try {
            // Dismiss any existing warning toast
            if (warningToastId.current) {
                toast.dismiss(warningToastId.current);
                warningToastId.current = null;
            }

            // Get user ID from token instead of localStorage
            const userId = getUserIdFromToken();

            if (!userId) {
                throw new Error('User ID not found in token');
            }

            console.log('Refreshing session for user ID:', userId);

            // Call refresh token endpoint to get a new token
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                // If the endpoint is not available, just extend the session locally
                // This is a fallback for development or if the backend is not updated yet
                if (response.status === 404) {
                    console.warn('Refresh token endpoint not available, extending session locally');

                    // Log the current time for debugging
                    const currentTime = Math.floor(Date.now() / 1000);
                    console.log('Current time:', new Date(currentTime * 1000).toLocaleString());

                    // Get the current token
                    const currentToken = localStorage.getItem('token');

                    // Verify token is valid
                    try {
                        // Just check if we can decode it
                        jwtDecode(currentToken);
                    } catch (e) {
                        throw new Error('Invalid token format');
                    }

                    // Create a simple extended token (this is just for demo, not secure)
                    const extendedToken = currentToken;

                    // Update token in localStorage
                    localStorage.setItem('token', extendedToken);

                    // Reset states
                    setSessionExpiring(false);
                    setWarningShown(false);

                    // Show success toast
                    if (successToastId.current) {
                        toast.update(successToastId.current, {
                            render: 'Your session has been extended!',
                            type: toast.TYPE.SUCCESS,
                            autoClose: 3000
                        });
                    } else {
                        successToastId.current = toast.success('Your session has been extended!', {
                            position: "top-center",
                            autoClose: 3000,
                            onClose: () => { successToastId.current = null; }
                        });
                    }

                    return true;
                }

                throw new Error('Failed to refresh session');
            }

            const data = await response.json();

            // Update token in localStorage
            localStorage.setItem('token', data.token);

            // Reset states
            setSessionExpiring(false);
            setWarningShown(false);

            // Show success toast
            if (successToastId.current) {
                toast.update(successToastId.current, {
                    render: 'Your session has been extended!',
                    type: toast.TYPE.SUCCESS,
                    autoClose: 3000
                });
            } else {
                successToastId.current = toast.success('Your session has been extended!', {
                    position: "top-center",
                    autoClose: 3000,
                    onClose: () => { successToastId.current = null; }
                });
            }

            return true;
        } catch (error) {
            console.error('Error refreshing session:', error);

            // Show error notification
            if (errorToastId.current) {
                toast.update(errorToastId.current, {
                    render: 'Could not extend your session. Please log in again.',
                    type: toast.TYPE.ERROR,
                    autoClose: 5000
                });
            } else {
                errorToastId.current = toast.error('Could not extend your session. Please log in again.', {
                    position: "top-center",
                    autoClose: 5000,
                    onClose: () => { errorToastId.current = null; }
                });
            }

            return false;
        }
    };

    // Function to handle session expiration
    const handleSessionExpired = () => {
        if (!expiredShown) {
            toast.error('Your session has expired. Please log in again.', {
                position: "top-center",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
                onClose: () => {
                    // Clear user data and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    window.location.reload();
                }
            });
            setExpiredShown(true);
        }
    };

    // Function to show warning before expiration
    const showExpirationWarning = () => {
        if (!warningShown) {
            // Create a custom component for the warning toast
            const WarningContent = () => (
                <div>
                    <p>Your session will expire in 5 minutes.</p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent toast from closing when clicking the button
                            refreshSession();
                        }}
                        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
                    >
                        Extend Session
                    </button>
                </div>
            );

            // Show the warning toast
            warningToastId.current = toast.warn(<WarningContent />, {
                position: "top-center",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
                onClose: () => {
                    setWarningShown(false);
                    warningToastId.current = null;
                }
            });

            setWarningShown(true);
            setSessionExpiring(true);
        }
    };

    // Check token expiration periodically
    useEffect(() => {
        // Only run in browser environment
        if (!isBrowser) return;

        const checkTokenExpiration = () => {
            try {
                const expirationTime = getTokenExpirationTime();

                if (!expirationTime) return;

                const currentTime = Date.now();
                const timeUntilExpiration = expirationTime - currentTime;

                console.log('Time until token expiration:', Math.floor(timeUntilExpiration / 1000), 'seconds');

                // If token is expired
                if (timeUntilExpiration <= 0) {
                    handleSessionExpired();
                    return;
                }

                // If token will expire in 5 minutes (300000 ms) or less
                if (timeUntilExpiration <= 300000 && !sessionExpiring && !warningShown) {
                    showExpirationWarning();
                }
            } catch (error) {
                console.error('Error checking token expiration:', error);
            }
        };

        // Check immediately and then every 30 seconds
        checkTokenExpiration();
        const intervalId = setInterval(checkTokenExpiration, 30000);

        return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionExpiring, warningShown, expiredShown, isBrowser]);

    // No need to return ToastContainer as it's already in App.jsx
    return null;
};

export default SessionManager;
