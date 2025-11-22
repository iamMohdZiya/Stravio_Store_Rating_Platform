const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Rating = sequelize.define('Rating', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        validate: {
            notEmpty: {
                msg: 'User ID is required'
            }
        }
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id'
        },
        validate: {
            notEmpty: {
                msg: 'Store ID is required'
            }
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Rating must be between 1 and 5'
            },
            max: {
                args: [5],
                msg: 'Rating must be between 1 and 5'
            },
            notEmpty: {
                msg: 'Rating value is required'
            }
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'ratings',
    timestamps: true,
    underscored: false,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'storeId'],
            name: 'unique_user_store_rating'
        }
    ]
});

module.exports = Rating;
