# Docker Configuration Examples

## Docker Compose (docker-compose.yml)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: resourcedb
      POSTGRES_USER: dbuser
      POSTGRES_PASSWORD: dbpassword
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./server/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dbuser -d resourcedb"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Backend API Server
  server:
    build: 
      context: ./server
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: dbuser
      DB_PASSWORD: dbpassword
      DB_NAME: resourcedb
      JWT_SECRET: your-secure-jwt-secret
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./server/uploads:/app/uploads
      - ./server/logs:/app/logs

  # Frontend React App
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: http://localhost:3000
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  postgres_data:
```

## Backend Dockerfile (server/Dockerfile)

```dockerfile
# Build stage
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

# Install required system packages
RUN apk add --no-cache tini

# Set working directory
WORKDIR /app

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chmod 755 /app/uploads

# Create logs directory
RUN mkdir -p /app/logs

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src

# Create non-root user
RUN addgroup -S appuser && adduser -S appuser -G appuser

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Use tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Start the app
CMD ["node", "src/index.js"]

# Document that the container listens on port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
```

## Frontend Dockerfile (client/Dockerfile)

```dockerfile
# Build stage
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

## Nginx Configuration (client/nginx.conf)

```nginx
server {
    listen 80;
    server_name localhost;

    # Root directory for static files
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/x-javascript application/xml;
    gzip_disable "MSIE [1-6]\.";

    # Cache control for static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Route all other requests to index.html for SPA
    location / {
        try_files $uri $uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # API proxy configuration
    location /api/ {
        proxy_pass http://server:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

## Development Docker Compose (docker-compose.dev.yml)

```yaml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: resourcedb
      POSTGRES_USER: dbuser
      POSTGRES_PASSWORD: dbpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./server/init.sql:/docker-entrypoint-initdb.d/init.sql

  server:
    build: 
      context: ./server
      dockerfile: Dockerfile.dev
    environment:
      NODE_ENV: development
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: dbuser
      DB_PASSWORD: dbpassword
      DB_NAME: resourcedb
      JWT_SECRET: dev-secret
      PORT: 3000
    ports:
      - "3000:3000"
    volumes:
      - ./server:/app
      - /app/node_modules
    command: npm run dev
    depends_on:
      - db

  client:
    build:
      context: ./client
      dockerfile: Dockerfile.dev
    environment:
      - REACT_APP_API_URL=http://localhost:3000
    ports:
      - "3001:3000"
    volumes:
      - ./client:/app
      - /app/node_modules
    command: npm start
    depends_on:
      - server

volumes:
  postgres_dev_data:
```

## Development Backend Dockerfile (server/Dockerfile.dev)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install development dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Install nodemon for development
RUN npm install -g nodemon

# Create upload and logs directories
RUN mkdir -p uploads logs

# Expose development port
EXPOSE 3000

# Start development server with nodemon
CMD ["npm", "run", "dev"]
```

## Development Frontend Dockerfile (client/Dockerfile.dev)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose development port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]
```

## Docker Scripts (package.json)

```json
{
  "scripts": {
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:dev:build": "docker-compose -f docker-compose.dev.yml build",
    "docker:dev:up": "docker-compose -f docker-compose.dev.yml up -d",
    "docker:dev:down": "docker-compose -f docker-compose.dev.yml down",
    "docker:dev:logs": "docker-compose -f docker-compose.dev.yml logs -f",
    "docker:clean": "docker-compose down -v --remove-orphans",
    "docker:restart": "docker-compose restart",
    "docker:ps": "docker-compose ps",
    "docker:exec:server": "docker-compose exec server sh",
    "docker:exec:client": "docker-compose exec client sh",
    "docker:exec:db": "docker-compose exec db psql -U dbuser -d resourcedb"
  }
}
```