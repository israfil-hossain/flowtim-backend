#!/bin/bash

# Flowtim Monitoring Script
# This script monitors the health of your application

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

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to check service status
check_service() {
    local service=$1
    if docker-compose ps $service | grep -q "Up"; then
        echo -e "${GREEN}✅ $service: Running${NC}"
        return 0
    else
        echo -e "${RED}❌ $service: Not running${NC}"
        return 1
    fi
}

# Function to check URL
check_url() {
    local url=$1
    local name=$2
    if curl -f -s "$url" > /dev/null; then
        echo -e "${GREEN}✅ $name: Accessible${NC}"
        return 0
    else
        echo -e "${RED}❌ $name: Not accessible${NC}"
        return 1
    fi
}

# Function to get container stats
get_container_stats() {
    local container=$1
    echo "Container: $container"
    docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" $container
    echo ""
}

clear
echo "🔍 Flowtim Application Health Monitor"
echo "======================================"
echo ""

# Check Docker services
print_header "Docker Services Status"
check_service "mongodb"
check_service "backend"
check_service "frontend"
if docker-compose ps nginx &>/dev/null; then
    check_service "nginx"
fi
echo ""

# Check URLs
print_header "URL Health Checks"
check_url "http://localhost:5000/api" "Backend API"
check_url "http://localhost" "Frontend"
if [ ! -z "$DOMAIN" ]; then
    check_url "https://$DOMAIN" "Production Domain"
    check_url "https://$DOMAIN/api" "Production API"
fi
echo ""

# Container resource usage
print_header "Resource Usage"
if command -v docker &> /dev/null; then
    get_container_stats "flowtim-mongodb"
    get_container_stats "flowtim-backend"
    get_container_stats "flowtim-frontend"
fi

# Disk usage
print_header "Disk Usage"
df -h | grep -E "(Filesystem|/dev/)"
echo ""

# Memory usage
print_header "Memory Usage"
free -h
echo ""

# Recent logs
print_header "Recent Error Logs (Last 10 lines)"
docker-compose logs --tail=10 | grep -i error || echo "No recent errors found"
echo ""

# Database connection test
print_header "Database Connection Test"
if docker exec flowtim-mongodb mongo --eval "db.adminCommand('ping')" &>/dev/null; then
    echo -e "${GREEN}✅ MongoDB: Connection successful${NC}"
else
    echo -e "${RED}❌ MongoDB: Connection failed${NC}"
fi
echo ""

# SSL certificate check (if domain is set)
if [ ! -z "$DOMAIN" ] && [ -f "nginx/ssl/fullchain.pem" ]; then
    print_header "SSL Certificate Status"
    expiry_date=$(openssl x509 -in nginx/ssl/fullchain.pem -noout -enddate | cut -d= -f2)
    echo "Certificate expires: $expiry_date"
    
    # Check if certificate expires in next 30 days
    if openssl x509 -in nginx/ssl/fullchain.pem -checkend 2592000 -noout; then
        echo -e "${GREEN}✅ SSL Certificate: Valid for more than 30 days${NC}"
    else
        echo -e "${YELLOW}⚠️  SSL Certificate: Expires within 30 days${NC}"
    fi
fi

echo ""
print_status "Monitoring complete. Run this script regularly to monitor your application."
print_status "For continuous monitoring, consider setting up a cron job:"
print_status "*/5 * * * * /path/to/monitor.sh >> /var/log/flowtim-monitor.log 2>&1"
