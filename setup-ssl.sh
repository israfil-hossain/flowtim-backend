#!/bin/bash

# SSL Setup Script for Flowtim
# This script sets up SSL certificates using Let's Encrypt

set -e

echo "🔒 Setting up SSL certificates with Let's Encrypt..."

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

# Check if .env.production exists and load variables
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    exit 1
fi

export $(cat .env.production | grep -v '^#' | xargs)

# Check if domain and email are set
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    print_error "DOMAIN and EMAIL must be set in .env.production"
    exit 1
fi

print_status "Domain: $DOMAIN"
print_status "Email: $EMAIL"

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    print_status "Installing certbot..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y certbot
    elif command -v yum &> /dev/null; then
        sudo yum install -y certbot
    else
        print_error "Please install certbot manually"
        exit 1
    fi
fi

# Create SSL directory
mkdir -p nginx/ssl

# Stop nginx if running
print_status "Stopping nginx temporarily..."
docker-compose stop nginx || true

# Obtain SSL certificate
print_status "Obtaining SSL certificate for $DOMAIN..."
sudo certbot certonly --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Copy certificates to nginx directory
print_status "Copying certificates..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/

# Set proper permissions
sudo chown -R $USER:$USER nginx/ssl/
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem

# Update nginx configuration with actual domain
sed -i "s/yourdomain.com/$DOMAIN/g" nginx/nginx.conf

print_status "✅ SSL certificates installed successfully!"
print_status "Starting nginx with SSL..."

# Start nginx with SSL
docker-compose up -d nginx

print_status "🎉 SSL setup complete!"
print_warning "Remember to set up automatic certificate renewal:"
print_warning "Add this to your crontab: 0 12 * * * /usr/bin/certbot renew --quiet"
