# Use Node.js 18 base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose backend port
EXPOSE 8000

# Start backend
CMD ["node", "dist/main.js"]
