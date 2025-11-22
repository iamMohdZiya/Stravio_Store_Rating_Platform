const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME || 'stravio_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Note: Models and associations are initialized in app.js to avoid circular imports.

// Test connection
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Database Connected Successfully');
        
        // Sync models (create tables if they don't exist)
        // In production, use migrations instead
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: false });
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };