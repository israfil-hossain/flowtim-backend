# Stage 1: Build
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

RUN npm install --production

EXPOSE 8000
CMD ["node", "dist/main.js"]
