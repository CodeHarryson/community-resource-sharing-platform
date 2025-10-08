# Create Your Own Resource Sharing Platform
## A Complete Template Guide

This comprehensive template guide will help you create your own version of the resource sharing platform from scratch. Each step includes detailed code snippets and explanations for both development and production environments.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Docker (optional, for containerization)
- Basic knowledge of:
  - JavaScript/React
  - SQL databases
  - RESTful APIs
- Code editor (VS Code recommended)

## Project Timeline

Total estimated time: 12-16 hours

1. Initial Setup: 1-2 hours
2. Backend Development: 4-5 hours
3. Frontend Development: 4-5 hours
4. Testing & Debugging: 2-3 hours
5. Docker & Deployment: 1-2 hours

## Step 1: Project Initialization (15-20 minutes)

1. Create the project structure:
```bash
# Create project directory
mkdir my-resource-platform
cd my-resource-platform

# Create main subdirectories
mkdir server client
mkdir server/uploads server/logs

# Initialize git
git init
```

2. Create base `.gitignore`:
```
# Dependencies
node_modules/
.pnp/
.pnp.js

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build
build/
dist/
coverage/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/
*.log

# Runtime
uploads/

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

## Step 2: Backend Setup (1-2 hours)

1. Initialize backend:
```bash
cd server
npm init -y

# Update package.json
npm pkg set type="module"

# Install dependencies
npm install express cors dotenv pg bcrypt jsonwebtoken multer helmet
npm install --save-dev nodemon
```

2. Create essential backend files:

`server/.env`:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=resource_platform

# Security
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

`server/db.js`:
```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production'
});

// Test database connection
pool.query('SELECT NOW()', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected successfully');
    }
});

export default pool;
```

`server/index.js`:
```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Route imports
import authRoutes from './routes/auth.js';
import resourceRoutes from './routes/resources.js';
import uploadRoutes from './routes/uploads.js';

// Initialize
dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/uploads', uploadRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

## Step 3: Database Setup (30-45 minutes)

Create `server/init.sql`:
```sql
-- Users table with authentication and credits
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    credits INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources table with image support
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    image_filename VARCHAR(200),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requests table for resource sharing
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications for user interactions
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_resources_user_id ON resources(user_id);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_requests_resource_id ON requests(resource_id);
CREATE INDEX idx_requests_requester_id ON requests(requester_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

## Step 4: Frontend Setup (1-2 hours)

1. Create React app and install dependencies:
```bash
cd ../client
npx create-react-app .

# Install dependencies
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material react-router-dom axios
```

2. Create essential frontend files:

`client/src/api.js`:
```javascript
import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api'
});

// Add auth token to requests
API.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
API.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const auth = {
    login: (email, password) => API.post('/auth/login', { email, password }),
    register: (name, email, password) => 
        API.post('/auth/register', { name, email, password })
};

export const resources = {
    list: (params) => API.get('/resources', { params }),
    create: (data) => API.post('/resources', data),
    get: (id) => API.get(`/resources/${id}`),
    update: (id, data) => API.put(`/resources/${id}`, data),
    delete: (id) => API.delete(`/resources/${id}`)
};

export const requests = {
    create: (resourceId) => API.post('/requests', { resourceId }),
    list: () => API.get('/requests'),
    update: (id, status) => API.put(`/requests/${id}`, { status })
};
```

## Step 5: Docker Setup (30-45 minutes)

1. Create Docker configurations:

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./server/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5

  server:
    build: 
      context: ./server
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - ./server/uploads:/app/uploads
    ports:
      - "5000:5000"
    depends_on:
      db:
        condition: service_healthy

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: ${REACT_APP_API_URL}
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  postgres_data:
```

`server/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chmod 755 uploads

# Security: Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000
CMD ["node", "index.js"]
```

`client/Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Step 6: Testing Setup (1-2 hours)

1. Backend tests setup:

`server/tests/auth.test.js`:
```javascript
import request from 'supertest';
import app from '../index.js';
import pool from '../db.js';

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        // Setup test database
    });

    afterAll(async () => {
        await pool.end();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
    });

    it('should login existing user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });
});
```

2. Frontend tests setup:

`client/src/components/__tests__/Login.test.js`:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../Login';

describe('Login Component', () => {
    it('should render login form', () => {
        render(<Login />);
        
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should handle form submission', async () => {
        const mockLogin = jest.fn();
        render(<Login onLogin={mockLogin} />);
        
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@example.com' }
        });
        
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' }
        });
        
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
        
        expect(mockLogin).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123'
        });
    });
});
```

## Development Workflow

1. Start development environment:
```bash
# Start database
docker-compose up db

# Start backend
cd server
npm run dev

# Start frontend
cd ../client
npm start
```

2. Run tests:
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## Production Deployment

1. Build and deploy:
```bash
# Build and start all services
docker-compose up --build -d

# Check logs
docker-compose logs -f
```

2. Monitor:
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f service_name
```

## Common Issues and Solutions

1. Database Connection Issues:
- Check database credentials in .env
- Verify PostgreSQL is running
- Check network connectivity
- Ensure database exists

2. File Upload Issues:
- Check upload directory permissions
- Verify file size limits
- Ensure correct Content-Type header
- Check disk space

3. Authentication Issues:
- Verify JWT_SECRET is set
- Check token expiration
- Clear browser storage
- Check CORS settings

## Security Considerations

1. Implementation:
- Use HTTPS in production
- Implement rate limiting
- Sanitize user input
- Use secure password hashing
- Implement CSRF protection

2. Configuration:
- Use environment variables
- Secure cookie settings
- Enable security headers
- Configure CORS properly

## Performance Optimization

1. Backend:
- Use database indexes
- Implement caching
- Optimize queries
- Use connection pooling

2. Frontend:
- Implement lazy loading
- Optimize bundle size
- Use service worker
- Enable compression

## Monitoring and Maintenance

1. Setup monitoring:
- Error tracking
- Performance metrics
- User analytics
- Server monitoring

2. Regular maintenance:
- Database backups
- Security updates
- Dependency updates
- Log rotation

Remember to:
- Commit changes regularly
- Write clear documentation
- Follow coding standards
- Keep dependencies updated
- Monitor security advisories
- Backup data regularly
- Test thoroughly before deploying

This template provides a solid foundation for building your resource sharing platform. Customize and extend it based on your specific needs and requirements.