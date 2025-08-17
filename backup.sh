#!/bin/bash

# Backup Script for Flowtim
# This script creates backups of the MongoDB database

set -e

echo "💾 Creating backup of Flowtim database..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Load environment variables
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    exit 1
fi

export $(cat .env.production | grep -v '^#' | xargs)

# Create backup directory
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

print_status "Creating backup in $BACKUP_DIR..."

# Create MongoDB backup
docker exec flowtim-mongodb mongodump \
    --username $MONGO_USERNAME \
    --password $MONGO_PASSWORD \
    --db $MONGO_DB_NAME \
    --out /tmp/backup

# Copy backup from container
docker cp flowtim-mongodb:/tmp/backup $BACKUP_DIR/

# Compress backup
tar -czf $BACKUP_DIR.tar.gz -C backups $(basename $BACKUP_DIR)
rm -rf $BACKUP_DIR

print_status "✅ Backup created: $BACKUP_DIR.tar.gz"

# Clean up old backups (keep last 7 days)
find backups/ -name "*.tar.gz" -mtime +7 -delete

print_status "🎉 Backup completed successfully!"
