import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Here we could add an endpoint to fetch current user data if logged in
        // For simplicity, we just rely on localStorage for metadata while the JWT sits in HTTP-Only cooking.
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login/', { email, password });
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout/');
        } catch (e) {}
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
