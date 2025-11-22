const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
            len: {
                args: [20, 60],
                msg: 'Name must be between 20 and 60 characters'
            },
            notEmpty: {
                msg: 'Name is required'
            }
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: 'Please enter a valid email address'
            },
            notEmpty: {
                msg: 'Email is required'
            }
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Password is required'
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
                msg: 'Address is required'
            }
        }
    },
    role: {
        type: DataTypes.ENUM('ADMIN', 'USER', 'OWNER'),
        allowNull: false,
        defaultValue: 'USER',
        validate: {
            isIn: {
                args: [['ADMIN', 'USER', 'OWNER']],
                msg: 'Role must be ADMIN, USER, or OWNER'
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
    tableName: 'users',
    timestamps: true,
    underscored: false
});

module.exports = User;
