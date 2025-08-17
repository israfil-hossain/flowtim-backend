// MongoDB initialization script
// This script creates a user for the application database

// Switch to the application database
db = db.getSiblingDB(process.env.MONGO_DB_NAME || 'flowtim');

// Create application user with read/write permissions
db.createUser({
  user: process.env.MONGO_USERNAME || 'flowtim_user',
  pwd: process.env.MONGO_PASSWORD || 'your_secure_password_here',
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_DB_NAME || 'flowtim'
    }
  ]
});

print('Database user created successfully');
