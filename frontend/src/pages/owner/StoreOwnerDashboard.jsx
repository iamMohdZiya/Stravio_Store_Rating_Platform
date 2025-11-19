// /frontend/src/pages/owner/StoreOwnerDashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StoreOwnerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch data from the owner-specific backend endpoint
                const res = await axios.get('/owner/dashboard');
                setDashboardData(res.data);
            } catch (err) {
                console.error("Failed to fetch owner dashboard:", err);
                setError(err.response?.data?.message || 'Failed to load dashboard data. Check if your store is correctly set up.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="page-container flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-500 mx-auto mb-4"></div>
                    <p className="text-slate-300 font-medium">Loading Store Owner Dashboard...</p>
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

    const { storeName, averageRating, usersWhoRated } = dashboardData;

    return (
        <div className="page-container">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-100 mb-2">Store Owner Dashboard</h2>
                <p className="text-2xl font-semibold text-sky-400">{storeName}</p>
            </div>
            
            {/* Average Rating Display */}
            <div className="metric-card mb-8">
                <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Average Store Rating</h3>
                <p className="text-5xl font-bold text-amber-400">
                    {averageRating !== 0 && averageRating !== 'N/A'
                        ? `${averageRating.toFixed(1)} / 5`
                        : 'No ratings yet'}
                </p>
            </div>

            {/* List of Users Who Submitted Ratings */}
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-100 mb-4">
                    Users Who Rated Your Store 
                    <span className="ml-2 text-sky-400">({usersWhoRated.length})</span>
                </h3>
            </div>
            
            {usersWhoRated.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
                    <p className="text-slate-400 text-lg">No ratings have been submitted for your store yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User Name</th>
                                <th>User Email</th>
                                <th>Submitted Rating</th>
                                <th>Submission Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersWhoRated.map((rating) => (
                                <tr key={rating.ratingId}>
                                    <td className="font-medium">{rating.userName}</td>
                                    <td>{rating.userEmail}</td>
                                    <td>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-900/50 text-amber-300">
                                            {rating.rating} / 5
                                        </span>
                                    </td>
                                    <td>{new Date(rating.submittedAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StoreOwnerDashboard;