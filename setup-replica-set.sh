#!/bin/bash

# MongoDB Replica Set Setup Script
# This script sets up a MongoDB replica set for local development

echo "Setting up MongoDB replica set..."

# Stop MongoDB if running
brew services stop mongodb-community 2>/dev/null || true

# Create data directories
mkdir -p /tmp/mongodb/rs1 /tmp/mongodb/rs2 /tmp/mongodb/rs3

# Start MongoDB instances as replica set members
mongod --replSet rs0 --port 27017 --dbpath /tmp/mongodb/rs1 --bind_ip localhost --fork --logpath /tmp/mongodb/rs1.log
mongod --replSet rs0 --port 27018 --dbpath /tmp/mongodb/rs2 --bind_ip localhost --fork --logpath /tmp/mongodb/rs2.log
mongod --replSet rs0 --port 27019 --dbpath /tmp/mongodb/rs3 --bind_ip localhost --fork --logpath /tmp/mongodb/rs3.log

# Wait for instances to start
sleep 5

# Initialize the replica set
mongosh --port 27017 --eval "rs.initiate({
  _id: 'rs0',
  members: [
    {_id: 0, host: 'localhost:27017'},
    {_id: 1, host: 'localhost:27018'},
    {_id: 2, host: 'localhost:27019'}
  ]
})"

echo "Replica set initialized. Waiting for primary election..."
sleep 10

echo "MongoDB replica set setup complete!"
echo "Primary node: localhost:27017"
