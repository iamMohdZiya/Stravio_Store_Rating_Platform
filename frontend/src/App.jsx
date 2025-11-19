// /frontend/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Import Layout Components (We will create these in the next step)
import AppLayout from './components/layout/AppLayout';

// Import Pages
import LoginScreen from './pages/auth/LogicScreen';
import SignupScreen from './pages/auth/SignupScreen';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminStoreManagement from './pages/admin/AdminStoreManagement';

// Normal User Pages
import NormalUserStoresList from './pages/user/NormalUserStoresList';
import PasswordUpdateForm from './pages/user/PasswordUpdateForm';

// Store Owner Pages
import StoreOwnerDashboard from './pages/owner/StoreOwnerDashboard';


const App = () => {
    const { authState } = useAuth();

    if (authState.isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500 mx-auto mb-4"></div>
                    <p className="text-slate-300 text-lg font-medium">Loading Application...</p>
                </div>
            </div>
        );
    }

    // Helper to determine initial redirect upon login
    const getDashboardPath = () => {
        switch (authState.userRole) {
            case 'ADMIN': return '/admin';
            case 'OWNER': return '/owner';
            case 'USER':
            default: return '/user/stores';
        }
    };

    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Public Routes */}
                <Route path="/login" element={authState.isAuthenticated ? <Navigate to={getDashboardPath()} /> : <LoginScreen />} />
                <Route path="/signup" element={authState.isAuthenticated ? <Navigate to={getDashboardPath()} /> : <SignupScreen />} />

                {/* 2. Main Layout (Wraps all authenticated paths) */}
                <Route element={<AppLayout />}>
                    
                    {/* Default redirect to the appropriate dashboard after login */}
                    <Route path="/" element={authState.isAuthenticated ? <Navigate to={getDashboardPath()} /> : <Navigate to="/login" />} />
                    
                    {/* --- 3. Normal User & All Authenticated Routes --- */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'USER', 'OWNER']} />}>
                        <Route path="/profile/password" element={<PasswordUpdateForm />} />
                    </Route>
                    
                    {/* Normal User Routes (USER is the default access) */}
                    <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'OWNER']} />}>
                        {/* Access by USER, but visible to ADMIN/OWNER as they might navigate through it */}
                        <Route path="/user/stores" element={<NormalUserStoresList />} />
                    </Route>

                    {/* --- 4. Store Owner Routes --- */}
                    <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
                        <Route path="/owner" element={<StoreOwnerDashboard />} />
                    </Route>

                    {/* --- 5. System Administrator Routes --- */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/users" element={<AdminUserManagement />} />
                        <Route path="/admin/stores" element={<AdminStoreManagement />} />
                    </Route>
                    
                    {/* Fallback route */}
                    <Route path="*" element={
                        <div className="page-container flex items-center justify-center">
                            <div className="text-center">
                                <h1 className="text-6xl font-bold text-slate-100 mb-4">404</h1>
                                <p className="text-xl text-slate-400 mb-6">Page Not Found</p>
                                <Link to="/" className="btn-primary">Go Home</Link>
                            </div>
                        </div>
                    } />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;