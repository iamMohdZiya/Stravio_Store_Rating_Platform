// /frontend/src/pages/user/PasswordUpdateForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const PasswordUpdateForm = () => {
    const { authState, logout } = useAuth();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [apiMessage, setApiMessage] = useState('');
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,16}$/;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate password
        if (!formData.password) {
            newErrors.password = 'Password is required.';
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password = 'Password must be 8-16 characters, include at least one uppercase letter and one special character.';
        }

        // Validate confirm password
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password.';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setApiMessage('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const { data } = await axios.put('/auth/password', {
                password: formData.password
            });

            setApiMessage(data.message || 'Password updated successfully. Please log in again.');
            setFormData({ password: '', confirmPassword: '' });

            // Log out and redirect to login after a brief delay
            setTimeout(() => {
                logout();
                window.location.href = '/login';
            }, 2000);

        } catch (error) {
            console.error('Password update error:', error.response);
            setApiError(error.response?.data?.message || 'Failed to update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="max-w-md mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-100 mb-2">Update Password</h2>
                    <p className="text-slate-400">Change your account password</p>
                </div>
                
                {apiMessage && <div className="success-message">{apiMessage}</div>}
                {apiError && <div className="error-message">{apiError}</div>}

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password Field */}
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                id="password"
                                value={formData.password} 
                                onChange={handleChange}
                                placeholder="8-16 chars, uppercase + special char"
                                className={errors.password ? 'input-error' : ''}
                            />
                            {errors.password && <span className="error-text">{errors.password}</span>}
                            <small className="text-slate-400 text-xs mt-1 block">Password must be 8-16 characters, include at least one uppercase letter and one special character.</small>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                id="confirmPassword"
                                value={formData.confirmPassword} 
                                onChange={handleChange}
                                placeholder="Re-enter your password"
                                className={errors.confirmPassword ? 'input-error' : ''}
                            />
                            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                        </div>

                        {/* Submit Button */}
                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </span>
                            ) : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PasswordUpdateForm;
