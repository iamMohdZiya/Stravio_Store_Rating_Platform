// /frontend/src/components/layout/AppLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const AppLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
            <Header />
            <main className="flex-1">
                <Outlet /> 
            </main>
        </div>
    );
};

export default AppLayout;