// /frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// 1. Create the Context object
const AuthContext = createContext();

// Define the base URL for the API (adjust if your backend runs on a different port)
const API_BASE_URL = 'http://localhost:5000/api'; 
axios.defaults.baseURL = API_BASE_URL;

// 2. Auth Provider Component
export const AuthProvider = ({ children }) => {
    // Initial state pulls data from localStorage for persistence
    const [authState, setAuthState] = useState({
        token: localStorage.getItem('token'),
        userRole: localStorage.getItem('userRole'),
        userId: localStorage.getItem('userId'),
        isAuthenticated: !!localStorage.getItem('token'),
        isLoading: true,
    });

    // 3. Update Axios headers on token change
    useEffect(() => {
        if (authState.token) {
            axios.defaults.headers.common['x-auth-token'] = authState.token;
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
        }
        setAuthState(prev => ({ ...prev, isLoading: false }));
    }, [authState.token]);

    // 4. Login Function
    const login = (token, role, userId) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userId', userId);

        setAuthState({
            token,
            userRole: role,
            userId,
            isAuthenticated: true,
            isLoading: false,
        });
    };

    // 5. Logout Function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');

        setAuthState({
            token: null,
            userRole: null,
            userId: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            {!authState.isLoading && children}
        </AuthContext.Provider>
    );
};

// 6. Custom Hook for easy consumption
export const useAuth = () => useContext(AuthContext);