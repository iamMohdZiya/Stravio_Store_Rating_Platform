// /frontend/src/utils/validationSchemas.js

import Joi from 'joi';

// --- Password Regex based on requirements ---
// 8-16 characters, >= 1 uppercase, >= 1 special character
const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,16}$/;

/**
 * Schema for Normal User Signup
 */
export const signupSchema = Joi.object({
    name: Joi.string()
        .min(20)
        .max(60)
        .required()
        .messages({
            'string.min': 'Name must be at least 20 characters long.',
            'string.max': 'Name cannot exceed 60 characters.',
            'any.required': 'Name is required.'
        }),
    email: Joi.string()
        .email({ tlds: { allow: false } }) // Simple email check
        .required()
        .messages({
            'string.email': 'Email must be a valid email address.',
            'any.required': 'Email is required.'
        }),
    address: Joi.string()
        .max(400)
        .required()
        .messages({
            'string.max': 'Address cannot exceed 400 characters.',
            'any.required': 'Address is required.'
        }),
    password: Joi.string()
        .regex(passwordRegex)
        .required()
        .messages({
            'string.pattern.base': 'Password must be 8-16 characters long, include at least one uppercase letter, and one special character.',
            'any.required': 'Password is required.'
        }),
});

/**
 * Schema for User Login
 */
export const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
    password: Joi.string().required()
});