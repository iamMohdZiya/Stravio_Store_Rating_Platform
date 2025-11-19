// /frontend/src/components/admin/AdminUserForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import Joi from 'joi';
import { signupSchema } from '../../utils/validationSchemas'; // Reuse signup schema

const AdminUserForm = ({ onUserAdded }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', address: '', password: 'Password!1', role: 'USER'
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const validateForm = () => {
        // Use signupSchema but make role required (since admin MUST select a role)
        const schema = signupSchema.keys({
            role: Joi.string().valid('ADMIN', 'USER', 'OWNER').required()
        });
        
        const { error } = schema.validate(formData, { abortEarly: false });
        if (!error) return true;

        const newErrors = {};
        error.details.forEach(detail => {
            newErrors[detail.context.key] = detail.message;
        });
        setErrors(newErrors);
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        if (!validateForm()) return;

        setLoading(true);

        try {
            const { data } = await axios.post('/users', formData);
            alert(data.message);
            onUserAdded();
            setFormData({ name: '', email: '', address: '', password: 'Password!1', role: 'USER' });
            setErrors({});
        } catch (error) {
            setApiError(error.response?.data?.message || 'Failed to create user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 shadow-lg">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Add New User</h3>
            {apiError && <div className="error-message">{apiError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select name="role" id="role" value={formData.role} onChange={handleChange} className={errors.role ? 'input-error' : ''}>
                        <option value="USER">Normal User</option>
                        <option value="OWNER">Store Owner</option>
                        <option value="ADMIN">System Administrator</option>
                    </select>
                    {errors.role && <span className="error-text">{errors.role}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="name">Full Name (20-60 chars)</label>
                    <input 
                        type="text" 
                        name="name" 
                        id="name"
                        value={formData.name} 
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className={errors.name ? 'input-error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input 
                        type="email" 
                        name="email" 
                        id="email"
                        value={formData.email} 
                        onChange={handleChange}
                        placeholder="Enter email"
                        className={errors.email ? 'input-error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="address">Address (Max 400 chars)</label>
                    <input 
                        type="text" 
                        name="address" 
                        id="address"
                        value={formData.address} 
                        onChange={handleChange}
                        placeholder="Enter address"
                        className={errors.address ? 'input-error' : ''}
                    />
                    {errors.address && <span className="error-text">{errors.address}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        id="password"
                        value={formData.password} 
                        onChange={handleChange}
                        className={errors.password ? 'input-error' : ''}
                    />
                    {errors.password && <span className="error-text">{errors.password}</span>}
                </div>
                
                <p className="text-slate-400 text-xs mb-4">
                    Note: The password is set to a temporary value that meets requirements and will be hashed by the backend.
                </p>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'Saving...' : 'Create User'}
                </button>
            </form>
        </div>
    );
};

export default AdminUserForm;