// /frontend/src/pages/admin/AdminUserManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminUserForm from '../../pages/admin/AdminUserForm'; // Form to be created next
// import AdminUserDetails from '../../pages/admin/'; // Details modal/component

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null); // For viewing details
    
    // State for filtering and sorting
    const [params, setParams] = useState({ 
        name: '', email: '', address: '', role: '', sortBy: 'createdAt', sortOrder: 'desc' 
    });

    // Fetch function
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('/users', { params });
            setUsers(res.data.users);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError(err.response?.data?.message || 'Failed to load user list.');
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(handler);
    }, [params, fetchUsers]);

    // Handler for filter changes
    const handleFilterChange = (e) => {
        setParams({ ...params, [e.target.name]: e.target.value });
    };

    // Handler for sorting when a column header is clicked
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
    
    // Helper to render the sorting indicator arrow
    const renderSortArrow = (column) => {
        if (params.sortBy === column) {
            return params.sortOrder === 'asc' ? ' ▲' : ' ▼';
        }
        return '';
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-100">User Management</h2>
                <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
                    {showAddForm ? 'Hide Form' : 'Add New User'}
                </button>
            </div>
            
            {showAddForm && <AdminUserForm onUserAdded={fetchUsers} />}
            
            {/* Filter Controls */}
            <div className="filter-controls">
                <input 
                    type="text" 
                    name="name" 
                    placeholder="Filter by Name" 
                    value={params.name} 
                    onChange={handleFilterChange} 
                />
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Filter by Email" 
                    value={params.email} 
                    onChange={handleFilterChange} 
                />
                <select name="role" value={params.role} onChange={handleFilterChange}>
                    <option value="">Filter by Role (All)</option>
                    <option value="ADMIN">System Administrator</option>
                    <option value="OWNER">Store Owner</option>
                    <option value="USER">Normal User</option>
                </select>
            </div>
            
            {/* User List Table */}
            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mx-auto mb-2"></div>
                    <p className="text-slate-400">Loading users...</p>
                </div>
            )}
            {error && <div className="error-message">{error}</div>}
            
            {!loading && users.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    <p>No users found matching your criteria.</p>
                </div>
            )}
            
            {!loading && users.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('name')}>Name {renderSortArrow('name')}</th>
                                <th onClick={() => handleSort('email')}>Email {renderSortArrow('email')}</th>
                                <th onClick={() => handleSort('address')}>Address {renderSortArrow('address')}</th>
                                <th onClick={() => handleSort('role')}>Role {renderSortArrow('role')}</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td className="font-medium">{user.name}</td>
                                    <td>{user.email}</td>
                                    <td className="max-w-xs truncate">{user.address}</td>
                                    <td>
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-700 text-sky-300">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => setSelectedUserId(user._id)} 
                                            className="btn-secondary text-sm"
                                        >
                                            View Details
                                        </button>
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

export default AdminUserManagement;