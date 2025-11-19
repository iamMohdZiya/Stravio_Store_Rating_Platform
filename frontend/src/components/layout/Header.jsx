// /frontend/src/components/layout/Header.jsx (Tailwind Implementation)

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { authState, logout } = useAuth();
    const navigate = useNavigate();

    // Determine navigation links based on role
    const getNavLinks = (role) => {
        if (role === 'ADMIN') {
            return [
                { path: '/admin', name: 'Dashboard' },
                { path: '/admin/users', name: 'Users' },
                { path: '/admin/stores', name: 'Stores' },
            ];
        } else if (role === 'OWNER') {
            return [
                { path: '/owner', name: 'Dashboard' },
            ];
        } else if (role === 'USER') {
            return [
                { path: '/user/stores', name: 'Stores' },
            ];
        }
        return [];
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    if (!authState.isAuthenticated) {
        return null;
    }

    const navLinks = getNavLinks(authState.userRole);

    return (
        <header className="sticky top-0 z-10 bg-slate-800/90 backdrop-blur-sm shadow-xl border-b border-slate-700 py-3">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 gap-4">
                
                {/* Logo and Branding */}
                <div className="logo">
                    <Link to="/" className="text-xl md:text-2xl font-black text-sky-400 tracking-wider hover:text-sky-300 transition duration-150">
                        ⭐ STRAVIO
                    </Link>
                </div>
                
                {/* Navigation Links */}
                <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
                    {navLinks.map(link => (
                        <Link 
                            key={link.path} 
                            to={link.path}
                            className="text-slate-300 font-medium hover:text-sky-400 transition duration-150 tracking-wide text-sm md:text-base"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* User Controls */}
                <div className="flex items-center flex-wrap justify-center gap-2 md:gap-4">
                    <span className="text-xs font-bold text-sky-400 bg-slate-700 py-1 px-2 md:px-3 rounded-full border border-sky-600 uppercase">
                        {authState.userRole}
                    </span>
                    
                    <Link to="/profile/password" className="text-slate-300 hover:text-sky-400 text-xs md:text-sm transition duration-150">
                        <span className="hidden sm:inline">🔑 Update Password</span>
                        <span className="sm:hidden">🔑</span>
                    </Link>
                    
                    <button 
                        onClick={handleLogout} 
                        className="bg-red-600 text-white font-semibold py-1 px-3 rounded-lg hover:bg-red-700 transition duration-150 text-xs md:text-sm shadow-md"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;