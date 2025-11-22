// app.js
const express = require('express');
const { connectDB } = require('./config/db');
// Initialize models and associations BEFORE connecting/syncing
require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const ratingRoutes = require('./routes/ratings');
const ownerRoutes = require('./routes/owner');

require('dotenv').config();

// Connect to database (after models are loaded)
connectDB();

const app = express();

// --- Middleware Setup ---
// Enable CORS for frontend requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Vite default port
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth-token');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Body parser for JSON requests (essential for handling POST data)
app.use(express.json()); 

// --- Root Route ---
app.get('/', (req, res) => {
    res.send('Store Rating API is Running...');
});

// --- Routes Definition (will be implemented in the next step) ---
// Example route definition:
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/owner', ownerRoutes);

// --- Start Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));