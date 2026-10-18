# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency definitions and install
COPY package.json package-lock.json* ./
RUN npm install

# Copy application source code and assets
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Production web server
FROM nginx:alpine

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check to ensure the container is serving requests
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
