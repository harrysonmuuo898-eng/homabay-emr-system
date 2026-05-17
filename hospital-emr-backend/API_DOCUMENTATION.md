# Hospital EMR Backend - Authentication API Documentation

## Overview

This document describes all authentication endpoints available in the Hospital EMR Backend. The backend uses token-based authentication with JWT-like tokens.

## Base URL
```
http://localhost:5000/api/auth
```

## Authentication

Most endpoints (except `/login` and `/register`) require an `Authorization` header with a Bearer token:
```
Authorization: Bearer <token>
```

The token is obtained from either `/login` or `/register` endpoints.

---

## Endpoints

### 1. Check Registration Status
**GET** `/status`

Check if the system is ready for initial registration (only true if no staff exists).

**Response:**
```json
{
  "registrationOpen": true
}
```

**Use Case:** Check if the system needs initial setup before showing registration form.

---

### 2. Initial Registration (First Admin)
**POST** `/register`

Create the first admin user. Only works if no staff members exist in the system.

**Request Body:**
```json
{
  "staffID": "ADM-001",
  "username": "admin",
  "password": "SecurePassword123",
  "name": "Administrator Name",
  "role": "admin",
  "department": "Administration"
}
```

**Required Fields:**
- `staffID` - Unique staff identifier
- `username` - Login username (will be lowercased)
- `password` - Minimum 6 characters
- `name` - Full name of staff member
- `role` (optional) - One of: `admin`, `doctor`, `nurse`, `technician`, `staff` (defaults to `admin`)
- `department` (optional) - Department name (defaults to `Administration`)

**Response (201 Created):**
```json
{
  "token": "eyJhbGc...",
  "staff": {
    "staffID": "ADM-001",
    "username": "admin",
    "name": "Administrator Name",
    "role": "admin",
    "department": "Administration",
    "active": true
  },
  "message": "Initial admin account created successfully"
}
```

**Error (403 Forbidden):**
```json
{
  "error": "Registration is closed. Contact an administrator to create a new account.",
  "registrationOpen": false
}
```

**Error (409 Conflict):**
```json
{
  "error": "staffID already exists"
}
```

---

### 3. Login
**POST** `/login`

Authenticate a staff member and obtain an access token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "SecurePassword123"
}
```

**Required Fields:**
- `username` - Staff username
- `password` - Staff password

**Response (200 OK):**
```json
{
  "token": "eyJhbGc...",
  "staff": {
    "staffID": "ADM-001",
    "username": "admin",
    "name": "Administrator Name",
    "role": "admin",
    "department": "Administration",
    "active": true
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Invalid username or password"
}
```

---

### 4. Get Current User
**GET** `/me`

Get information about the currently authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "staff": {
    "staffID": "ADM-001",
    "username": "admin",
    "name": "Administrator Name",
    "role": "admin",
    "department": "Administration",
    "active": true
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Sign in required"
}
```

---

### 5. Get Staff List
**GET** `/staff-list`

Get list of all active staff members. **Admin only.**

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200 OK):**
```json
[
  {
    "staffID": "ADM-001",
    "username": "admin",
    "name": "Administrator Name",
    "role": "admin",
    "department": "Administration",
    "active": true,
    "_id": "...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "staffID": "DOC-001",
    "username": "doctor",
    "name": "Dr. Smith",
    "role": "doctor",
    "department": "Consultation",
    "active": true,
    "_id": "...",
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
]
```

---

### 6. Create New Staff Member
**POST** `/staff`

Create a new staff member. **Admin only.**

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "staffID": "DOC-001",
  "username": "doctor_smith",
  "password": "SecurePassword123",
  "name": "Dr. Smith",
  "role": "doctor",
  "department": "Consultation"
}
```

**Required Fields:**
- `staffID` - Unique staff identifier
- `username` - Login username (will be lowercased)
- `name` - Full name of staff member
- `role` - One of: `admin`, `doctor`, `nurse`, `technician`, `staff`

**Optional Fields:**
- `password` - If not provided, defaults to `ChangeMe123`
- `department` - Department name (defaults to `General`)

**Response (201 Created):**
```json
{
  "staffID": "DOC-001",
  "username": "doctor_smith",
  "name": "Dr. Smith",
  "role": "doctor",
  "department": "Consultation",
  "active": true,
  "message": "Staff account created successfully"
}
```

**Error (409 Conflict):**
```json
{
  "error": "Staff with this username already exists"
}
```

---

### 7. Update Staff Member
**PUT** `/staff/:staffID`

Update staff member information. **Admin only.**

**Headers:**
```
Authorization: Bearer <admin-token>
```

**URL Parameters:**
- `staffID` - The staffID of the staff member to update

**Request Body (all optional):**
```json
{
  "name": "Dr. Smith Jr.",
  "role": "doctor",
  "department": "Surgery",
  "active": true
}
```

**Response (200 OK):**
```json
{
  "staffID": "DOC-001",
  "username": "doctor_smith",
  "name": "Dr. Smith Jr.",
  "role": "doctor",
  "department": "Surgery",
  "active": true,
  "message": "Staff member updated successfully"
}
```

**Error (404 Not Found):**
```json
{
  "error": "Staff member not found"
}
```

---

### 8. Change Password
**POST** `/change-password`

Change the password of the currently authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Required Fields:**
- `currentPassword` - Current password (must be correct)
- `newPassword` - New password (minimum 6 characters)

**Response (200 OK):**
```json
{
  "message": "Password changed successfully",
  "staff": {
    "staffID": "DOC-001",
    "username": "doctor_smith",
    "name": "Dr. Smith",
    "role": "doctor",
    "department": "Consultation",
    "active": true
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Current password is incorrect"
}
```

---

# Billing API

## Base URL
```
http://localhost:5000/api/billing
```

## Endpoints

### 1. Add Service to Bill
**POST** `/add`

Record a department service and attach it to the patient's pending bill.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patientID": "PAT-001",
  "department": "Laboratory",
  "description": "Blood test",
  "cost": 1500,
  "details": {
    "specimen": "Blood",
    "notes": "Urgent"
  }
}
```

**Response (201 Created):**
```json
{
  "_id": "...",
  "patientID": "PAT-001",
  "services": [
    {
      "department": "Laboratory",
      "description": "Blood test",
      "cost": 1500,
      "details": {
        "specimen": "Blood",
        "notes": "Urgent"
      },
      "recordedBy": {
        "staffID": "...",
        "name": "...",
        "role": "...",
        "department": "..."
      },
      "createdAt": "2026-05-13T..."
    }
  ],
  "totalAmount": 1500,
  "status": "Pending"
}
```

### 2. Recent Department Activity
**GET** `/recent/:department`

Get the last 10 service records for a department.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "patientID": "PAT-001",
    "department": "Laboratory",
    "description": "Blood test",
    "cost": 1500,
    "details": {
      "specimen": "Blood",
      "notes": "Urgent"
    },
    "recordedBy": {
      "staffID": "...",
      "name": "...",
      "role": "...",
      "department": "..."
    },
    "createdAt": "2026-05-13T..."
  }
]
```

---

## Setup Instructions

### 1. Initial Setup (First Time)

1. Check if registration is open:
   ```bash
   GET http://localhost:5000/api/auth/status
   ```

2. If `registrationOpen` is true, create the first admin account:
   ```bash
   POST http://localhost:5000/api/auth/register
   Body: {
     "staffID": "ADM-001",
     "username": "admin",
     "password": "AdminPass123",
     "name": "System Administrator"
   }
   ```

3. Store the returned `token` for future authenticated requests.

### 2. Create Additional Staff Members

1. Login as admin:
   ```bash
   POST http://localhost:5000/api/auth/login
   Body: {
     "username": "admin",
     "password": "AdminPass123"
   }
   ```

2. Use the returned token to create new staff:
   ```bash
   POST http://localhost:5000/api/auth/staff
   Headers: Authorization: Bearer <admin-token>
   Body: {
     "staffID": "DOC-001",
     "username": "doctor",
     "password": "DoctorPass123",
     "name": "Dr. John Doe",
     "role": "doctor",
     "department": "Consultation"
   }
   ```

### 3. Regular Login

Staff members can login with:
```bash
POST http://localhost:5000/api/auth/login
Body: {
  "username": "doctor",
  "password": "DoctorPass123"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid or missing parameters |
| 401 | Unauthorized - Authentication failed or required |
| 403 | Forbidden - Authenticated but not authorized |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists (duplicate) |
| 500 | Internal Server Error - Server error |

---

## Testing with cURL

### Check registration status:
```bash
curl http://localhost:5000/api/auth/status
```

### Create initial admin:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "staffID": "ADM-001",
    "username": "admin",
    "password": "AdminPass123",
    "name": "System Administrator"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AdminPass123"
  }'
```

### Get current user (replace TOKEN with actual token):
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## Security Notes

1. **Always use HTTPS in production** - Never send tokens over unencrypted connections
2. **Store tokens securely** - Store tokens in memory or secure storage, not in localStorage for sensitive operations
3. **Change default passwords** - After initial setup, change all default passwords
4. **Use strong passwords** - Minimum 6 characters, but recommend 12+ with mixed case and numbers
5. **Set AUTH_SECRET** - Use a strong random string for the AUTH_SECRET environment variable
6. **Token expiry** - Tokens expire after 8 hours. Users must login again after expiry
7. **CORS configuration** - Set CORS_ORIGIN to your frontend domain in production

---

## Troubleshooting

### "Registration is closed" error
- Registration only works when no staff exists
- Use `/staff` endpoint (requires admin auth) to create new staff members

### "Invalid username or password"
- Check that username and password are correct
- Passwords are case-sensitive
- Username is automatically lowercased

### "Sign in required"
- The Authorization header is missing or invalid
- Include: `Authorization: Bearer <token>`

### "You are not authorized"
- The current user doesn't have the required role
- Only admins can create/update staff

### MongoDB connection error
- Ensure MongoDB is running
- Check MONGO_URI environment variable
- Verify database name in connection string

