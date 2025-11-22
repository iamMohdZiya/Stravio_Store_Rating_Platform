# MongoDB to MySQL Migration - Complete

## Summary
The backend has been successfully migrated from MongoDB/Mongoose to MySQL/Sequelize.

## Changes Made

### 1. Dependencies
- ✅ Removed: `mongoose`
- ✅ Added: `mysql2`, `sequelize`

### 2. Database Configuration
- ✅ Updated `backend/config/db.js` to use Sequelize instead of Mongoose
- ✅ Added connection pooling and configuration

### 3. Models Converted
- ✅ `User.js` - Converted to Sequelize model with proper validations
- ✅ `Store.js` - Converted to Sequelize model with foreign key to User
- ✅ `Rating.js` - Converted to Sequelize model with composite unique index
- ✅ Created `models/index.js` to handle associations and avoid circular dependencies

### 4. Controllers Updated
- ✅ `authController.js` - Updated all Mongoose queries to Sequelize
- ✅ `userController.js` - Updated queries, filters, and aggregations
- ✅ `storeController.js` - Converted MongoDB aggregation pipelines to Sequelize queries
- ✅ `ratingController.js` - Updated CRUD operations
- ✅ `ownerController.js` - Converted complex aggregations to Sequelize with includes

### 5. Key Changes

#### ID Handling
- Changed from MongoDB `ObjectId` to MySQL `INTEGER` auto-increment
- Updated all `findById()` to `findByPk()`
- Changed `user._id` to `user.id` throughout

#### Query Syntax
- `findOne({ email })` → `findOne({ where: { email } })`
- `findById(id)` → `findByPk(id)`
- `find(filter)` → `findAll({ where: filter })`
- `create()` - Same syntax, but different return structure
- `countDocuments()` → `count()`

#### Aggregations
- MongoDB aggregation pipelines converted to:
  - Sequelize `include` for joins
  - JavaScript array methods for calculations (reduce, filter, map)
  - Raw SQL subqueries where needed

#### Filtering
- MongoDB `$regex` → Sequelize `Op.like` with `%pattern%`
- MongoDB `$in` → Sequelize `Op.in`

### 6. Environment Variables Required

Add to your `.env` file:
```env
DB_NAME=stravio_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

### 7. Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE stravio_db;
```

2. The application will automatically create tables on first run (in development mode).

### 8. Testing Checklist

- [ ] User signup
- [ ] User login
- [ ] Password update
- [ ] Admin: Create user
- [ ] Admin: List users with filters/sorting
- [ ] Admin: Get user details
- [ ] Admin: Get system metrics
- [ ] Admin: Create store
- [ ] Admin: List stores with filters/sorting
- [ ] User: Submit rating
- [ ] User: Modify rating
- [ ] Owner: View dashboard with ratings

## Notes

- All ObjectId references changed to INTEGER IDs
- Timestamps are automatically handled by Sequelize
- Unique constraints are enforced at the database level
- Composite unique index on (userId, storeId) for ratings
- Email addresses are stored in lowercase for consistency

## Next Steps

1. Create MySQL database
2. Update `.env` file with database credentials
3. Run the application - tables will be created automatically
4. Test all endpoints
5. Consider using Sequelize migrations for production deployments

