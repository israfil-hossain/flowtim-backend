#!/bin/bash

# Flowtim Deployment Script
# This script deploys the application to production

set -e  # Exit on any error

echo "🚀 Starting Flowtim deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_warning "Please copy .env.production template and configure your environment variables"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

print_status "Environment variables loaded"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Docker and Docker Compose are available"

# Build and start services
print_status "Building Docker images..."
docker-compose -f docker-compose.yml build --no-cache

print_status "Starting services..."
docker-compose -f docker-compose.yml up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Deployment successful!"
    print_status "Your application should be available at:"
    print_status "Frontend: http://localhost (or your domain)"
    print_status "Backend API: http://localhost:5000/api"
    print_status "MongoDB: localhost:27017"
else
    print_error "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi

print_status "🎉 Flowtim is now running!"
print_warning "Don't forget to:"
print_warning "1. Set up SSL certificates if using HTTPS"
print_warning "2. Configure your domain DNS"
print_warning "3. Set up backup for MongoDB data"
