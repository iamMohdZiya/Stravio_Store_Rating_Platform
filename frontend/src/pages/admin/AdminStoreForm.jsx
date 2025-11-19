// /frontend/src/components/admin/AdminStoreForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// We would ideally import the storeSchema from utils for validation here

const AdminStoreForm = ({ onStoreAdded }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', address: '', ownerId: ''
    });
    const [owners, setOwners] = useState([]); // List of available Store Owners
    const [loading, setLoading] = useState(false);
    const [ownerLoading, setOwnerLoading] = useState(true);
    const [apiError, setApiError] = useState('');

    // 1. Fetch available Store Owners on mount
    useEffect(() => {
        const fetchOwners = async () => {
            try {
                // Fetch only users with role 'OWNER'
                const res = await axios.get('/users', { params: { role: 'OWNER' } });
                setOwners(res.data.users);
                // Pre-select the first owner if available
                if (res.data.users.length > 0) {
                    setFormData(prev => ({ ...prev, ownerId: res.data.users[0]._id }));
                }
            } catch (error) {
                console.error("Failed to fetch owners:", error);
                setApiError('Could not load Store Owners list.');
            } finally {
                setOwnerLoading(false);
            }
        };
        fetchOwners();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        // NOTE: Client-side validation for store fields (name, email, address, ownerId) should be implemented here.
        if (loading || ownerLoading) return;

        setLoading(true);

        try {
            const { data } = await axios.post('/stores', formData);

            alert(data.message);
            onStoreAdded(); // Refresh store list
            setFormData({ name: '', email: '', address: '', ownerId: owners.length > 0 ? owners[0]._id : '' }); // Reset form

        } catch (error) {
            setApiError(error.response?.data?.message || 'Failed to create store.');
        } finally {
            setLoading(false);
        }
    };

    if (ownerLoading) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 shadow-lg">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mx-auto mb-2"></div>
                    <p className="text-slate-400">Loading eligible Store Owners...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 shadow-lg">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Add New Store</h3>
            {apiError && <div className="error-message">{apiError}</div>}
            
            {owners.length === 0 && (
                <div className="warning-message mb-4">
                    ⚠️ No eligible Store Owner accounts found. Please create a user with the <strong>OWNER</strong> role first.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                    <label htmlFor="storeName">Store Name</label>
                    <input 
                        type="text" 
                        name="name" 
                        id="storeName"
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="Enter store name"
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="storeEmail">Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        id="storeEmail"
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="Enter store email"
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="storeAddress">Address</label>
                    <input 
                        type="text" 
                        name="address" 
                        id="storeAddress"
                        value={formData.address} 
                        onChange={handleChange} 
                        placeholder="Enter store address"
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="ownerId">Assigned Owner</label>
                    <select 
                        name="ownerId" 
                        id="ownerId"
                        value={formData.ownerId} 
                        onChange={handleChange} 
                        required 
                        disabled={owners.length === 0}
                        className={owners.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        {owners.map(owner => (
                            <option key={owner._id} value={owner._id}>
                                {owner.name} ({owner.email})
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" disabled={loading || owners.length === 0} className="btn-primary w-full">
                    {loading ? 'Saving...' : 'Create Store'}
                </button>
            </form>
        </div>
    );
};

export default AdminStoreForm;