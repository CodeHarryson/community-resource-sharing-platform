# API Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": "integer",
  "name": "string",
  "email": "string"
}
```

**Status Codes:**
- 201: User created successfully
- 400: Invalid input or email already registered
- 500: Server error

### POST /api/auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "integer",
    "name": "string",
    "email": "string",
    "credits": "integer"
  }
}
```

**Status Codes:**
- 200: Login successful
- 401: Authentication failed
- 429: Too many attempts (rate limited)
- 500: Server error

## Resource Endpoints

### GET /api/resources
List available resources with pagination and filtering.

**Query Parameters:**
- page (optional): Page number (default: 1)
- limit (optional): Items per page (default: 10)
- category (optional): Filter by category

**Response:**
```json
{
  "resources": [
    {
      "id": "integer",
      "title": "string",
      "description": "string",
      "category": "string",
      "image_url": "string",
      "owner_name": "string",
      "created_at": "timestamp"
    }
  ],
  "pagination": {
    "page": "integer",
    "limit": "integer",
    "total": "integer",
    "pages": "integer"
  }
}
```

**Status Codes:**
- 200: Success
- 500: Server error

### POST /api/resources
Create a new resource.

**Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "image_filename": "string (optional)"
}
```

**Response:**
```json
{
  "id": "integer",
  "title": "string",
  "description": "string",
  "category": "string",
  "image_url": "string",
  "user_id": "integer",
  "created_at": "timestamp"
}
```

**Status Codes:**
- 201: Resource created
- 400: Invalid input
- 401: Unauthorized
- 500: Server error

### GET /api/resources/search
Search resources by title or description.

**Query Parameters:**
- q: Search query string

**Response:**
```json
[
  {
    "id": "integer",
    "title": "string",
    "description": "string",
    "category": "string",
    "image_url": "string",
    "owner_name": "string",
    "created_at": "timestamp"
  }
]
```

**Status Codes:**
- 200: Success
- 400: Missing query parameter
- 500: Server error

## Request Endpoints

### POST /api/requests
Create a new resource request.

**Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "resourceId": "integer"
}
```

**Response:**
```json
{
  "id": "integer",
  "resource_id": "integer",
  "requester_id": "integer",
  "status": "string",
  "created_at": "timestamp"
}
```

**Status Codes:**
- 201: Request created
- 400: Invalid input
- 401: Unauthorized
- 500: Server error

### GET /api/requests
List user's resource requests.

**Headers:**
- Authorization: Bearer {token}

**Query Parameters:**
- status (optional): Filter by status (pending/approved/rejected)

**Response:**
```json
[
  {
    "id": "integer",
    "resource": {
      "id": "integer",
      "title": "string",
      "description": "string"
    },
    "requester": {
      "id": "integer",
      "name": "string"
    },
    "status": "string",
    "created_at": "timestamp"
  }
]
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

### PUT /api/requests/{id}
Update request status (owner only).

**Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "status": "string (approved/rejected)"
}
```

**Response:**
```json
{
  "id": "integer",
  "status": "string",
  "updated_at": "timestamp"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid status
- 401: Unauthorized
- 403: Not resource owner
- 404: Request not found
- 500: Server error

## Upload Endpoints

### POST /api/uploads
Upload an image file.

**Headers:**
- Authorization: Bearer {token}
- Content-Type: multipart/form-data

**Request Body:**
- file: Image file (jpg, jpeg, png, gif)

**Response:**
```json
{
  "filename": "string",
  "url": "string"
}
```

**Status Codes:**
- 201: File uploaded
- 400: Invalid file type or size
- 401: Unauthorized
- 413: File too large (>5MB)
- 500: Server error

## User Endpoints

### PUT /api/users/profile
Update user profile information.

**Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "name": "string",
  "email": "string"
}
```

**Response:**
```json
{
  "id": "integer",
  "name": "string",
  "email": "string",
  "updated_at": "timestamp"
}
```

**Status Codes:**
- 200: Profile updated
- 400: Invalid input
- 401: Unauthorized
- 500: Server error

### GET /api/users/notifications
Get user notifications.

**Headers:**
- Authorization: Bearer {token}

**Response:**
```json
[
  {
    "id": "integer",
    "message": "string",
    "read": "boolean",
    "created_at": "timestamp"
  }
]
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

### PUT /api/users/notifications/{id}
Mark notification as read.

**Headers:**
- Authorization: Bearer {token}

**Response:**
```json
{
  "id": "integer",
  "read": true,
  "updated_at": "timestamp"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 404: Notification not found
- 500: Server error

## Error Responses

All error responses follow this format:
```json
{
  "message": "string",
  "details": "string (optional)"
}
```

## Common Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Token is obtained through the login endpoint and should be included in all subsequent requests.

## Rate Limiting

- Login attempts are limited to 5 per email address
- API requests are limited to 100 per IP address per minute
- File uploads are limited to 10 per user per hour

## File Upload Constraints

- Maximum file size: 5MB
- Supported formats: jpg, jpeg, png, gif
- Files are stored in /uploads directory
- File URLs are relative to API base URL