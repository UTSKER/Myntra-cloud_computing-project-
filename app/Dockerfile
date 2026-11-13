# ==============================================================================
# MyntraFlash - High-Performance Alpine Dockerfile
# Optimized for GCP Compute Engine Managed Instance Groups (MIG)
# Target Image Size: < 120 MB
# ==============================================================================

FROM node:20-alpine AS base

# Install wget for healthcheck probe
RUN apk add --no-cache wget

# Create application directory
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy application source code and public assets
COPY server.js ./
COPY public/ ./public/

# Use unprivileged standard node user for security
USER node

# Expose internal container port
EXPOSE 3000

# Container-level health check matching GCP Load Balancer configuration
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=2 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Launch microservice
CMD ["node", "server.js"]

