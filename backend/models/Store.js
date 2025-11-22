const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: 'Store name is required'
            }
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: 'Please enter a valid store email address'
            },
            notEmpty: {
                msg: 'Store email is required'
            }
        }
    },
    address: {
        type: DataTypes.STRING(400),
        allowNull: false,
        validate: {
            len: {
                args: [1, 400],
                msg: 'Address cannot exceed 400 characters'
            },
            notEmpty: {
                msg: 'Store address is required'
            }
        }
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        },
        validate: {
            notEmpty: {
                msg: 'Store owner is required'
            }
        }
    },
    averageRating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 0
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
    tableName: 'stores',
    timestamps: true,
    underscored: false
});

module.exports = Store;
