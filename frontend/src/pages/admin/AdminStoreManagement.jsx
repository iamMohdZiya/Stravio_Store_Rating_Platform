// /frontend/src/pages/admin/AdminStoreManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminStoreForm from '../../pages/admin/AdminStoreForm'; // Form to be created next

const AdminStoreManagement = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // State for filtering and sorting (similar to user list)
    const [params, setParams] = useState({ 
        name: '', address: '', sortBy: 'createdAt', sortOrder: 'desc' 
    });

    // Fetch function
    const fetchStores = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // We use the same /api/stores endpoint, which supports filtering and sorting.
            // Since this is an admin view, the backend will return all details if needed, 
            // but the GET /stores endpoint already returns name, address, and overallRating.
            const res = await axios.get('/stores', { params });
            setStores(res.data.stores);
        } catch (err) {
            console.error("Failed to fetch stores:", err);
            setError(err.response?.data?.message || 'Failed to load store list.');
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchStores();
        }, 300);
        return () => clearTimeout(handler);
    }, [params, fetchStores]);

    // Handlers for filter/sort changes (same logic as AdminUserManagement)
    const handleFilterChange = (e) => {
        setParams({ ...params, [e.target.name]: e.target.value });
    };

    const handleSort = (newSortBy) => {
        setParams(prevParams => {
            const newSortOrder = 
                prevParams.sortBy === newSortBy && prevParams.sortOrder === 'asc' 
                    ? 'desc' 
                    : 'asc';
            return {
                ...prevParams,
                sortBy: newSortBy,
                sortOrder: newSortOrder
            };
        });
    };
    
    const renderSortArrow = (column) => {
        if (params.sortBy === column) {
            return params.sortOrder === 'asc' ? ' ▲' : ' ▼';
        }
        return '';
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-100">Store Management</h2>
                <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
                    {showAddForm ? 'Hide Form' : 'Add New Store'}
                </button>
            </div>
            
            {showAddForm && <AdminStoreForm onStoreAdded={fetchStores} />}
            
            {/* Filter Controls */}
            <div className="filter-controls">
                <input 
                    type="text" 
                    name="name" 
                    placeholder="Filter by Store Name" 
                    value={params.name} 
                    onChange={handleFilterChange} 
                />
                <input 
                    type="text" 
                    name="address" 
                    placeholder="Filter by Address" 
                    value={params.address} 
                    onChange={handleFilterChange} 
                />
            </div>
            
            {/* Store List Table */}
            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mx-auto mb-2"></div>
                    <p className="text-slate-400">Loading stores...</p>
                </div>
            )}
            {error && <div className="error-message">{error}</div>}
            
            {!loading && stores.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    <p>No stores found matching your criteria.</p>
                </div>
            )}
            
            {!loading && stores.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('name')}>Name {renderSortArrow('name')}</th>
                                <th onClick={() => handleSort('address')}>Address {renderSortArrow('address')}</th>
                                <th onClick={() => handleSort('overallRating')}>Rating {renderSortArrow('overallRating')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map(store => (
                                <tr key={store._id}>
                                    <td className="font-medium">{store.name}</td>
                                    <td className="max-w-xs truncate">{store.address}</td>
                                    <td>
                                        {store.overallRating !== null ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-900/50 text-amber-300">
                                                {store.overallRating.toFixed(1)} / 5
                                            </span>
                                        ) : (
                                            <span className="text-slate-500">Unrated</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminStoreManagement;