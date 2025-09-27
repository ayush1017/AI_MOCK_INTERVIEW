import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import WelcomePage from "./component/WelcomePage";
import AboutPage from "./component/AboutPage";
import Contact from "./component/Contact";
import Login from "./component/Login/Login";
import RegistrationPage from "./component/Registration/RegistrationPage";
import ResumeBuilder from './component/ResumeBuilder/ResumeBuilder';
import ResumeSelector from './component/ResumeBuilder/ResumeSelector';
import MockInterview from './component/MockInterview/MockInterview';
import LearnMore from "./component/LearnMore/LearnMore";
import UserProfile from './component/UserProfile/UserProfile';
import ForgotPassword from './component/Login/ForgotPassword';
import SmartRecognition from './component/SmartRecognition/SmartRecognition';
import SessionManager from './component/SessionManager/SessionManager';

const AuthCheck = ({ children }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        console.log('AuthCheck: Checking token');
        if (!token) {
            console.log('AuthCheck: No token found, redirecting to login');
            navigate('/login');
        }
        setIsChecking(false);
    }, [token, navigate]);

    if (isChecking) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>;
    }

    return token ? children : null;
};

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        console.log('PublicRoute: Checking token');
        if (token) {
            console.log('PublicRoute: Token found, redirecting to profile');
            navigate('/profile');
        }
        setIsChecking(false);
    }, [token, navigate]);

    if (isChecking) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>;
    }

    return !token ? children : null;
};

// Session Manager wrapper component that will be used inside Router context
const SessionManagerWrapper = () => {
  const token = localStorage.getItem('token');
  console.log('SessionManagerWrapper: Token exists:', !!token);

  // Check if token is valid
  if (token) {
    try {
      // Try to decode the token to verify it's valid
      const decoded = jwtDecode(token);

      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        console.warn('Token is expired, not rendering SessionManager');
        return null;
      }

      console.log('Token is valid, rendering SessionManager');
      return <SessionManager />;
    } catch (error) {
      console.warn('Invalid token found, not rendering SessionManager:', error);
      // If token is invalid, remove it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  }

  return null;
};

function App() {
  console.log('App component rendered');
  return (
    <Router>
      {/* Add SessionManager to track token expiration */}
      <SessionManagerWrapper />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        limit={3}
        newestOnTop={true}
        pauseOnFocusLoss={false}
        closeOnClick
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/registration" element={
          <PublicRoute>
            <RegistrationPage />
          </PublicRoute>
        } />
        <Route path="/resume-selector" element={
          <AuthCheck>
            <ResumeSelector />
          </AuthCheck>
        } />
        <Route path="/resume-builder" element={
          <AuthCheck>
            <Navigate to="/resume-selector" replace />
          </AuthCheck>
        } />
        <Route path="/resume-builder/new" element={
          <AuthCheck>
            <ResumeBuilder />
          </AuthCheck>
        } />
        <Route path="/resume-builder/:id" element={
          <AuthCheck>
            <ResumeBuilder />
          </AuthCheck>
        } />
        <Route path="/mock-interviews" element={
          <AuthCheck>
            <MockInterview />
          </AuthCheck>
        } />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/profile" element={
          <AuthCheck>
            <UserProfile />
          </AuthCheck>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        <Route path="/smart-recognition" element={
          <AuthCheck>
            <SmartRecognition />
          </AuthCheck>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
