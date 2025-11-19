// /frontend/src/pages/auth/SignupScreen.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { signupSchema } from '../../utils/validationSchemas';

const SignupScreen = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear specific error when user starts typing
        if (errors[e.target.name]) {
             setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validateForm = () => {
        const { error } = signupSchema.validate(formData, { abortEarly: false });
        
        if (!error) return true;

        const newErrors = {};
        error.details.forEach(detail => {
            // Joi uses context.key for the field name
            newErrors[detail.context.key] = detail.message;
        });
        setErrors(newErrors);
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        
        if (!validateForm()) {
            return; // Stop if client-side validation fails
        }

        setLoading(true);

        try {
            // Note: Normal User role is implicitly set by the backend on this route.
            const { data } = await axios.post('/auth/signup', formData);

            // Redirect to login after successful registration
            alert(data.message + " Please log in.");
            navigate('/login');

        } catch (error) {
            console.error('Signup error:', error.response);
            setApiError(error.response?.data?.message || 'Registration failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="form-container max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-sky-400 tracking-wider mb-2">⭐ STRAVIO</h1>
                    <h2 className="text-2xl font-bold text-slate-100">Register as a Normal User</h2>
                    <p className="text-slate-400 mt-2">Create your account to get started.</p>
                </div>
                
                {apiError && <div className="error-message">{apiError}</div>}
            
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <div className="form-group">
                        <label htmlFor="name">Full Name (20-60 chars)</label>
                        <input 
                            type="text" 
                            name="name" 
                            id="name"
                            value={formData.name} 
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className={errors.name ? 'input-error' : ''}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>

                    {/* Email Field */}
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            id="email"
                            value={formData.email} 
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className={errors.email ? 'input-error' : ''}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    {/* Address Field */}
                    <div className="form-group">
                        <label htmlFor="address">Address (Max 400 chars)</label>
                        <input 
                            type="text" 
                            name="address" 
                            id="address"
                            value={formData.address} 
                            onChange={handleChange}
                            placeholder="Enter your address"
                            className={errors.address ? 'input-error' : ''}
                        />
                        {errors.address && <span className="error-text">{errors.address}</span>}
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            id="password"
                            value={formData.password} 
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className={errors.password ? 'input-error' : ''}
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                        <small className="text-slate-400 text-xs mt-1 block">8-16 chars, incl. 1 uppercase & 1 special char.</small>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                            </span>
                        ) : 'Sign Up'}
                    </button>
                </form>
            
                <div className="mt-6 text-center text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium transition duration-150">
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignupScreen;