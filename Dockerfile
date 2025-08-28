FROM docker.io/library/node:18

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install ALL dependencies (including dev dependencies for building)
RUN yarn install

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Now remove dev dependencies to keep image smaller (optional)
RUN yarn install --production --ignore-scripts --prefer-offline

# Expose backend port
EXPOSE 8000

# Start the application
CMD ["node", "dist/index.js"]