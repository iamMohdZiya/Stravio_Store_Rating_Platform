// Initialize all models and their associations
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// Define associations
Store.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
Store.hasMany(Rating, { foreignKey: 'storeId', as: 'ratings' });

Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Rating.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

User.hasMany(Store, { foreignKey: 'ownerId', as: 'stores' });
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings' });

module.exports = {
    User,
    Store,
    Rating
};

