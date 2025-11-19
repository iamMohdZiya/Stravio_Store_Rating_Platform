// /frontend/src/components/common/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * A wrapper component that redirects unauthenticated users to the login page.
 * @param {Array} allowedRoles - An array of roles required to access the component (e.g., ['ADMIN', 'USER']).
 */
const ProtectedRoute = ({ allowedRoles }) => {
    const { authState } = useAuth();
    
    // Show a loading screen if authState is still being initialized
    if (authState.isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-500 mx-auto mb-4"></div>
                    <p className="text-slate-300 font-medium">Loading user session...</p>
                </div>
            </div>
        );
    }

    // 1. Check Authentication Status
    if (!authState.isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    // 2. Check Role Authorization (RoleGuard functionality)
    if (allowedRoles && !allowedRoles.includes(authState.userRole)) {
        // Redirect to a dashboard or unauthorized page if role is incorrect
        // We'll redirect to the user's primary dashboard
        const redirectPath = authState.userRole === 'ADMIN' ? '/admin' : 
                             authState.userRole === 'OWNER' ? '/owner' : 
                             '/user/stores';

        // Display a brief error before redirecting
        console.error(`Access Denied: Role ${authState.userRole} cannot access this page.`);
        
        // This is a simplified approach; a real app might redirect to a 403 page.
        return <Navigate to={redirectPath} replace />; 
    }

    // 3. User is authenticated and authorized, render child routes/component
    return <Outlet />;
};

export default ProtectedRoute;