// /frontend/src/pages/admin/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        totalStores: 0,
        totalRatings: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch data from the new metrics endpoint
                const res = await axios.get('/users/metrics');
                setMetrics(res.data);
            } catch (err) {
                console.error("Failed to fetch admin metrics:", err);
                setError(err.response?.data?.message || 'Failed to load metrics.');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <div className="page-container flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-500 mx-auto mb-4"></div>
                    <p className="text-slate-300 font-medium">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="error-message">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-100 mb-2">System Administrator Dashboard</h2>
                <p className="text-slate-400">Welcome to the administrative overview. Here you can manage all users, stores, and view system health metrics.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Metric 1: Total Users */}
                <div className="metric-card">
                    <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Users</h3>
                    <p className="text-5xl font-bold text-sky-400">{metrics.totalUsers}</p>
                </div>

                {/* Metric 2: Total Stores */}
                <div className="metric-card">
                    <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Stores</h3>
                    <p className="text-5xl font-bold text-emerald-400">{metrics.totalStores}</p>
                </div>

                {/* Metric 3: Total Submitted Ratings */}
                <div className="metric-card">
                    <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Ratings</h3>
                    <p className="text-5xl font-bold text-amber-400">{metrics.totalRatings}</p>
                </div>
            </div>
            
            <div className="border-t border-slate-700 pt-6">
                <p className="text-slate-300">Use the navigation links above to manage <strong className="text-sky-400">Users</strong> and <strong className="text-sky-400">Stores</strong>.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;