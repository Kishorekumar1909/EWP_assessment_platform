import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import DomainPage from './pages/Domain';
import TestTaking from './pages/Test';
import Result from './pages/Result';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    console.log(user)
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/domain/:id" element={<ProtectedRoute><DomainPage /></ProtectedRoute>} />
                <Route path="/test/:id" element={<ProtectedRoute><TestTaking /></ProtectedRoute>} />
                <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}
