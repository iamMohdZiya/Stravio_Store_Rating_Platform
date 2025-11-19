// /frontend/src/pages/user/NormalUserStoresList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StoreRatingAction from '../../pages/user/StoreRatingAction'; // Component to be created next

const NormalUserStoresList = () => {
    const { authState } = useAuth();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // State for filtering (Search by Name and Address)
    const [filter, setFilter] = useState({ name: '', address: '' });
    
    // State for sorting
    const [sort, setSort] = useState({ 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
    });

    // Debounced Fetch function
    const fetchStores = useCallback(async () => {
        setLoading(true);
        setError('');
        
        // Construct the query string from filter and sort states
        const params = {
            ...filter,
            sortBy: sort.sortBy,
            sortOrder: sort.sortOrder
        };
        
        try {
            const res = await axios.get('/stores', { params });
            setStores(res.data.stores);
        } catch (err) {
            console.error("Failed to fetch stores:", err);
            setError('Failed to load stores. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [filter, sort]);

    // Effect to trigger fetch when filter or sort state changes
    useEffect(() => {
        // Implement a basic debounce pattern for search inputs
        const handler = setTimeout(() => {
            fetchStores();
        }, 300); 

        return () => {
            clearTimeout(handler);
        };
    }, [filter, sort, fetchStores]);
    
    // Handler for filter inputs
    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    // Handler for sorting when a column header is clicked
    const handleSort = (newSortBy) => {
        setSort(prevSort => {
            const newSortOrder = 
                prevSort.sortBy === newSortBy && prevSort.sortOrder === 'asc' 
                    ? 'desc' 
                    : 'asc';
            return {
                sortBy: newSortBy,
                sortOrder: newSortOrder
            };
        });
    };

    // Helper to render the sorting indicator arrow
    const renderSortArrow = (column) => {
        if (sort.sortBy === column) {
            return sort.sortOrder === 'asc' ? ' ▲' : ' ▼';
        }
        return '';
    };

    // Callback to refresh data after a user submits/modifies a rating
    const handleRatingUpdate = () => {
        fetchStores();
    };

    return (
        <div className="page-container">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-100 mb-2">Store Listings</h2>
                <p className="text-slate-400">Browse and rate stores in the system</p>
            </div>

            <div className="filter-controls">
                <input
                    type="text"
                    name="name"
                    placeholder="Search by Store Name"
                    value={filter.name}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="address"
                    placeholder="Search by Address"
                    value={filter.address}
                    onChange={handleFilterChange}
                />
            </div>

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
                                <th onClick={() => handleSort('name')}>
                                    Store Name {renderSortArrow('name')}
                                </th>
                                <th onClick={() => handleSort('address')}>
                                    Address {renderSortArrow('address')}
                                </th>
                                <th onClick={() => handleSort('overallRating')}>
                                    Overall Rating {renderSortArrow('overallRating')}
                                </th>
                                <th>Your Rating</th>
                                <th>Actions</th>
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
                                    <td>
                                        {store.userSubmittedRating !== undefined && store.userSubmittedRating !== null ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-sky-900/50 text-sky-300">
                                                {store.userSubmittedRating} / 5
                                            </span>
                                        ) : (
                                            <span className="text-slate-500">Not Rated</span>
                                        )}
                                    </td>
                                    <td>
                                        {authState.userRole === 'USER' && (
                                            <StoreRatingAction
                                                storeId={store._id}
                                                currentRating={store.userSubmittedRating}
                                                onRatingSubmitted={handleRatingUpdate}
                                            />
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

export default NormalUserStoresList;