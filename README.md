# Coogs R Us - Community Resource Sharing Platform

A full-stack web application designed for university communities to share and exchange resources such as textbooks, furniture, games, and more. Built with React, Node.js, Express, and PostgreSQL.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Coogs R Us is a marketplace platform specifically designed for the University of Houston community (expandable to other universities) where students can list, discover, and request items they need. The platform uses a credit-based system to facilitate fair exchanges and encourage community participation.

### Key Concepts

- **Resources**: Items that users can list for sharing (textbooks, furniture, electronics, etc.)
- **Requests**: Users can request items they're interested in borrowing or receiving
- **Credits**: A simple economy where users earn credits by sharing and spend credits when requesting items
- **Notifications**: Real-time updates on request status and platform activities

## ✨ Features

### User Management
- User registration and authentication with JWT
- Secure password hashing with bcrypt
- Profile management with credit tracking

### Resource Sharing
- Create listings with title, description, category, and images
- Browse all available resources with filtering
- Category-based organization (Textbooks, Furniture, Games, etc.)
- Owner information display on each listing

### Request System
- Send requests for items you need
- Approve or deny incoming requests as a resource owner
- Credit-based transaction system
- Request status tracking (pending, approved, denied)

### Notifications
- Real-time notification bell with unread count
- Mark notifications as read
- Delete notifications
- Automatic notifications for:
  - New requests on your items
  - Approval/denial of your requests

### UI/UX
- Modern Material-UI design system
- University of Houston branding (customizable)
- Responsive design for mobile and desktop
- Intuitive navigation and user flows

## 🛠 Tech Stack

### Frontend
- **React** 18 - UI framework
- **React Router** - Client-side routing
- **Material-UI (MUI)** - Component library
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Frontend web server
- **Nodemon** - Development auto-reload

## 🏗 Architecture

```
┌─────────────────┐
│   React Client  │ (Port 3000)
│   (Nginx)       │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  Express API    │ (Port 5000)
│  Server         │
└────────┬────────┘
         │
         │ SQL
         │
┌────────▼────────┐
│  PostgreSQL     │ (Port 5432)
│  Database       │
└─────────────────┘
```

## 📦 Prerequisites

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Node.js** 18+ (for local development without Docker)
- **npm** or **yarn**
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/community-resource-sharing-platform.git
cd community-resource-sharing-platform
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=DBSECRETPASSWORD
DB_DATABASE=resources_db
DB_HOST=db
DB_PORT=5432

# JWT Secret (Change this to a secure random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Port
PORT=5000
```

### 3. Install Dependencies (Optional for local development)

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

## ⚙️ Configuration

### Database Initialization

The database is automatically initialized with the schema and seed data when you first run Docker Compose. The initialization script is located at `server/init.sql`.

### Customization

#### Branding
- Replace `client/public/uh-logo.png` with your institution's logo
- Update the color scheme in `client/src/theme.js`:
  ```javascript
  primary: {
    main: '#C8102E' // Change to your brand color
  }
  ```

#### Application Name
- Update title in `client/public/index.html`
- Change app name in `client/src/App.js`

## 🎮 Running the Application

### Using Docker (Recommended)

1. **Start all services:**
```bash
docker-compose up -d
```

2. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

3. **View logs:**
```bash
docker-compose logs -f
```

4. **Stop services:**
```bash
docker-compose down
```

5. **Stop and remove volumes (complete reset):**
```bash
docker-compose down -v
```

### Local Development (Without Docker)

#### 1. Start PostgreSQL
```bash
# Install PostgreSQL locally or use Docker for just the database
docker run -d -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=DBSECRETPASSWORD \
  -e POSTGRES_DB=resources_db \
  postgres:14-alpine
```

#### 2. Run the Backend
```bash
cd server
npm run dev
```

#### 3. Run the Frontend
```bash
cd client
npm start
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "credits": 10
  },
  "token": "jwt_token_here"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Resource Endpoints

#### Get All Resources
```http
GET /api/resources
```

#### Create Resource
```http
POST /api/resources
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Calculus Textbook",
  "description": "Stewart Calculus 8th Edition",
  "category": "Textbook"
}
```

### Request Endpoints

#### Create Request
```http
POST /api/requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "resource_id": 1
}
```

#### Get Owner's Requests
```http
GET /api/requests/owner
Authorization: Bearer {token}
```

#### Approve/Deny Request
```http
PATCH /api/requests/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "approve" // or "deny"
}
```

### Notification Endpoints

#### Get Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```

#### Mark as Read
```http
PATCH /api/notifications/{id}
Authorization: Bearer {token}
```

#### Delete Notification
```http
DELETE /api/notifications/{id}
Authorization: Bearer {token}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    credits INT DEFAULT 10
);
```

### Resources Table
```sql
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    image_filename VARCHAR(255),
    user_id INT REFERENCES users(id) ON DELETE CASCADE
);
```

### Requests Table
```sql
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
    requester_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending'
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📁 Project Structure

```
community-resource-sharing-platform/
├── client/                      # React frontend
│   ├── public/                  # Static files
│   │   ├── index.html
│   │   ├── uh-logo.svg
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── ItemCard.js
│   │   │   └── NotificationBell.js
│   │   ├── context/             # React Context
│   │   │   └── AuthContext.js
│   │   ├── pages/               # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   └── CreateResource.js
│   │   ├── App.js               # Main app component
│   │   ├── api.js               # Axios configuration
│   │   ├── theme.js             # MUI theme
│   │   └── index.js             # Entry point
│   ├── Dockerfile
│   └── package.json
├── server/                      # Express backend
│   ├── routes/                  # API routes
│   │   ├── auth.js
│   │   ├── resources.js
│   │   ├── requests.js
│   │   └── notifications.js
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification
│   ├── scripts/
│   │   └── apply_seeds.js       # Database seeding
│   ├── db.js                    # Database connection
│   ├── index.js                 # Server entry point
│   ├── init.sql                 # Database schema
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml           # Multi-container setup
├── .env                         # Environment variables
└── README.md                    # This file
```

## 👨‍💻 Development

### Running Tests
```bash
# Backend tests (when implemented)
cd server
npm test

# Frontend tests
cd client
npm test
```

### Code Style
The project follows standard JavaScript/React conventions. Consider using:
- **ESLint** for linting
- **Prettier** for code formatting

### Adding New Features

1. **Backend Endpoint:**
   - Create route in `server/routes/`
   - Add middleware if needed
   - Update database schema in `init.sql` if required

2. **Frontend Component:**
   - Create component in `client/src/components/` or `client/src/pages/`
   - Add routing in `App.js` if needed
   - Update API calls in component

### Database Migrations

For production, consider implementing a migration system:
```bash
cd server
npm run migrate
```

## 🚢 Deployment

### Production Considerations

1. **Environment Variables:**
   - Use strong, unique JWT secrets
   - Secure database passwords
   - Configure CORS appropriately

2. **Database:**
   - Use managed PostgreSQL service (AWS RDS, Google Cloud SQL)
   - Set up automated backups
   - Enable SSL connections

3. **Frontend:**
   - Build optimized production bundle
   - Serve through CDN
   - Enable gzip compression

4. **Backend:**
   - Use process manager (PM2)
   - Implement rate limiting
   - Add logging and monitoring

### Example Production Deployment (Docker)

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Run in production mode
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- University of Houston for branding inspiration
- Material-UI for the component library
- The open-source community

---

**Built with ❤️ for university communities**

