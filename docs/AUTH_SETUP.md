# Authentication System Documentation

## Overview

The metacognition learning engine now includes a complete authentication system using Passport.js with email/password login.

## Architecture

### Backend Components

#### 1. User Model ([models/User.js](../models/User.js))
- Manages user data in MongoDB
- Provides methods for user creation, retrieval, and password validation
- Passwords are hashed using bcryptjs with a salt rounds of 10
- Email addresses are stored in lowercase for case-insensitive matching

#### 2. Passport Configuration ([config/passport.js](../config/passport.js))
- Implements Local Strategy for email/password authentication
- Handles user serialization/deserialization for sessions
- Validates credentials and updates last login timestamp

#### 3. Authentication Routes ([routes/authRoute.js](../routes/authRoute.js))
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate and create session
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/me` - Get current authenticated user
- Includes `requireAuth` middleware for protecting routes

#### 4. Session Management ([app.js](../app.js))
- Uses express-session with MongoDB store (connect-mongo)
- Sessions persist for 7 days
- Session data stored in `sessions` collection in MongoDB

### Frontend Components

#### 1. Login Page ([frontend/src/pages/Login.jsx](../frontend/src/pages/Login.jsx))
- Email and password input with validation
- Error handling and loading states
- Link to signup page

#### 2. Signup Page ([frontend/src/pages/Signup.jsx](../frontend/src/pages/Signup.jsx))
- Name, email, password, and confirm password fields
- Client-side validation (password length, matching passwords)
- Error handling and loading states
- Link to login page

#### 3. Authentication State ([frontend/src/App.jsx](../frontend/src/App.jsx))
- Checks authentication status on mount
- Manages user state throughout the application
- Redirects to login if not authenticated
- Handles login/logout flows

#### 4. Landing Page Updates ([frontend/src/pages/Landing.jsx](../frontend/src/pages/Landing.jsx))
- Displays welcome message with user's name
- Logout button
- Calls logout API and clears user state

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  password: String (bcrypt hashed),
  name: String,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### Sessions Collection

Managed automatically by express-session and connect-mongo:

```javascript
{
  _id: String (session ID),
  expires: Date,
  session: {
    cookie: {...},
    passport: {
      user: String (user ID)
    }
  }
}
```

## Environment Variables

Add the following to your `.env` file:

```bash
# Session secret for signing cookies
# IMPORTANT: Change this in production!
SESSION_SECRET=your-secret-key-here

# MongoDB connection URL
MONGO_URL=mongodb://localhost:27017/

# Node environment
NODE_ENV=development
```

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed, but if needed:

```bash
npm install passport passport-local express-session bcryptjs connect-mongo
```

### 2. Initialize Database Indexes

Run the initialization script to create the unique email index:

```bash
node scripts/initDb.js
```

This creates a unique index on the email field in the users collection.

### 3. Start the Application

```bash
# Development
npm run dev

# Production
npm start
```

### 4. First User

Navigate to the application and click "Sign up" to create your first user account.

## Security Features

1. **Password Hashing**: All passwords are hashed using bcryptjs with salt rounds
2. **Unique Email Constraint**: MongoDB unique index prevents duplicate accounts
3. **Session Security**:
   - HttpOnly cookies (prevents XSS attacks)
   - Secure flag in production (HTTPS only)
   - SameSite: lax (CSRF protection)
   - 7-day expiration
4. **Input Validation**: Server-side validation for all authentication inputs
5. **Error Handling**: Generic error messages to prevent user enumeration

## API Examples

### Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }' \
  -c cookies.txt
```

### Get Current User

```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

## Protecting Routes

To require authentication for a route, use the `requireAuth` middleware:

```javascript
import { requireAuth } from "./routes/authRoute.js";

app.get("/api/protected-route", requireAuth, (req, res) => {
  // req.user is available here
  res.json({ message: "This is protected", user: req.user });
});
```

## Future Enhancements

Potential improvements for the authentication system:

1. **Password Reset**: Email-based password reset flow
2. **Email Verification**: Verify email addresses after signup
3. **OAuth Integration**: Add Google, GitHub, or other OAuth providers
4. **Two-Factor Authentication**: Add 2FA for enhanced security
5. **Account Management**: Allow users to update profile, change password
6. **Remember Me**: Optional extended session duration
7. **Rate Limiting**: Prevent brute force attacks on login endpoint
8. **Session Management**: Allow users to view and revoke active sessions

## Troubleshooting

### Sessions not persisting
- Check that MongoDB is running and accessible
- Verify MONGO_URL environment variable is correct
- Ensure SESSION_SECRET is set

### Duplicate email error
- The unique index requires all existing emails to be unique
- Run `node scripts/initDb.js` to create the index
- Check for duplicate emails in the database

### CORS issues in development
- Frontend should use Vite proxy to forward /api requests
- In production, backend serves the frontend from /frontend/dist

### Cookie not being sent
- Check that cookie domain and path are correct
- Verify httpOnly and secure flags based on environment
- Ensure frontend and backend are on the same domain in production
