# Use Node.js 18 with Alpine for smaller image size
FROM node:18-alpine AS base

# Install system dependencies and Yarn
RUN apk add --no-cache \
    wget \
    curl \
    && corepack enable \
    && corepack prepare yarn@stable --activate

# Build stage
FROM base AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install all dependencies (including dev dependencies)
RUN yarn install --frozen-lockfile

# Copy source code and TypeScript config
COPY . .

# Build TypeScript
RUN yarn build

# Production stage
FROM base AS production

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install only production dependencies
RUN yarn install --production --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy environment files if they exist (optional)
COPY .env* ./ 2>/dev/null || true

# Create uploads directory for file uploads (if needed)
RUN mkdir -p /app/uploads

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose backend port
EXPOSE 8000

# Health check using wget (more reliable in Alpine)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider https://api.flowtim.com/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]