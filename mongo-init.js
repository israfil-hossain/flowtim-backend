// MongoDB initialization script
// This script creates a user for the application database

// Switch to the application database
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'flowtim_db');

// Create application user with read/write permissions
db.createUser({
  user: process.env.MONGO_INITDB_ROOT_USERNAME || 'flowtim',
  pwd: process.env.MONGO_INITDB_ROOT_PASSWORD || 'flowtim',
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_INITDB_DATABASE || 'flowtim_db'
    }
  ]
});

print('Database user created successfully');
