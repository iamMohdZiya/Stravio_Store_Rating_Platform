// /utils/validation.js

const Joi = require('joi');

// --- Password Regex based on requirements ---
// 8-16 characters: {8,16}
// must include at least one uppercase letter: (?=.*[A-Z])
// must include at least one special character: (?=.*[^a-zA-Z0-9])
const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,16}$/;

// --- Reusable Schemas for User Properties ---

const nameSchema = Joi.string()
    .min(20)
    .max(60)
    .required()
    .messages({
        'string.min': 'Name must be at least 20 characters long.',
        'string.max': 'Name cannot exceed 60 characters.',
        'any.required': 'Name is required.'
    });

const emailSchema = Joi.string()
    .email()
    .required()
    .messages({
        'string.email': 'Email must be a valid email address.',
        'any.required': 'Email is required.'
    });

const addressSchema = Joi.string()
    .max(400)
    .required()
    .messages({
        'string.max': 'Address cannot exceed 400 characters.',
        'any.required': 'Address is required.'
    });

const passwordSchema = Joi.string()
    .regex(passwordRegex)
    .required()
    .messages({
        'string.pattern.base': 'Password must be 8-16 characters long, include at least one uppercase letter, and one special character.',
        'any.required': 'Password is required.'
    });

// --- Final Validation Schemas ---

/**
 * Schema for Normal User Signup and Admin User Creation
 */
const userSchema = Joi.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    address: addressSchema,
    // Role is optional here, as the Admin endpoint might specify it,
    // and Normal Signup will default to 'USER' in the controller.
    role: Joi.string().valid('ADMIN', 'USER', 'OWNER').optional() 
});

/**
 * Schema for User Login
 */
const loginSchema = Joi.object({
    email: emailSchema,
    password: Joi.string().required() // No need for complexity check on login
});

/**
 * Schema for Store Creation (Admin only)
 */
const storeSchema = Joi.object({
    name: Joi.string().required(),
    email: emailSchema, // Reusing email validation
    address: addressSchema, // Reusing address validation
    ownerId: Joi.string().required() // Expecting a MongoDB ObjectId string
});

/**
 * Schema for Rating Submission/Update (Normal User only)
 */
const ratingSchema = Joi.object({
    storeId: Joi.string().required(), // Expecting a MongoDB ObjectId string
    rating: Joi.number().integer().min(1).max(5).required()
});


module.exports = {
    userSchema,
    loginSchema,
    storeSchema,
    ratingSchema
};