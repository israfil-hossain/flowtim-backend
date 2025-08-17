#!/bin/bash

# Flowtim Update Script
# This script updates the application with zero-downtime deployment

set -e

echo "🔄 Starting Flowtim update process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Function to check if service is healthy
check_service_health() {
    local service=$1
    local max_attempts=30
    local attempt=1

    print_status "Checking $service health..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service | grep -q "Up"; then
            print_status "$service is healthy"
            return 0
        fi
        
        print_warning "Attempt $attempt/$max_attempts: $service not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service failed to start properly"
    return 1
}

# Create backup before update
print_step "1. Creating backup before update..."
./backup.sh

# Pull latest changes
print_step "2. Pulling latest changes..."
git fetch origin
git pull origin main

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Build new images
print_step "3. Building new Docker images..."
docker-compose build --no-cache

# Update database schema if needed (run migrations)
print_step "4. Running database migrations..."
# Add your migration commands here if you have any
# docker-compose run --rm backend npm run migrate

# Rolling update strategy
print_step "5. Performing rolling update..."

# Update backend first
print_status "Updating backend service..."
docker-compose up -d --no-deps backend
check_service_health backend

# Wait a bit for backend to stabilize
sleep 10

# Update frontend
print_status "Updating frontend service..."
docker-compose up -d --no-deps frontend
check_service_health frontend

# Update nginx (if using)
if docker-compose ps nginx &>/dev/null; then
    print_status "Updating nginx service..."
    docker-compose up -d --no-deps nginx
    check_service_health nginx
fi

# Clean up old images
print_step "6. Cleaning up old Docker images..."
docker image prune -f

# Verify deployment
print_step "7. Verifying deployment..."

# Check if all services are running
if docker-compose ps | grep -q "Up"; then
    print_status "✅ All services are running"
else
    print_error "❌ Some services are not running"
    docker-compose ps
    exit 1
fi

# Test API endpoint
if command -v curl &> /dev/null; then
    print_status "Testing API endpoint..."
    if curl -f -s http://localhost:5000/api/health > /dev/null; then
        print_status "✅ API is responding"
    else
        print_warning "⚠️  API health check failed"
    fi
fi

# Show final status
print_step "8. Deployment Summary"
print_status "🎉 Update completed successfully!"
print_status "Services status:"
docker-compose ps

print_status "Recent logs:"
docker-compose logs --tail=10

print_warning "Monitor the application for a few minutes to ensure stability"
print_status "You can check logs with: docker-compose logs -f"
