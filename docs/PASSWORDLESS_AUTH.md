# Passwordless Authentication Guide

## Overview

The Metacognition Learning Engine uses a modern, passwordless authentication system combining email-based verification codes and Google OAuth. No passwords to remember, no password reset flows needed!

## Features

### Email Passcode Authentication
- Users receive a 6-digit code via email
- Codes expire after 10 minutes
- One-time use (consumed after verification)
- Automatic cleanup via MongoDB TTL indexes

### Google OAuth
- One-click sign-in with Google account
- Automatic account creation/linking
- Securely managed by Google

### Security
- No password storage
- HttpOnly session cookies
- 7-day session duration
- CSRF protection with SameSite cookies

## User Flows

### Sign Up with Email

1. User enters name and email
2. System sends 6-digit code to email
3. User enters code
4. Account created and logged in automatically

**Backend Flow:**
```
POST /api/auth/signup/request { email, name }
→ Creates passcode in DB
→ Sends email with code
→ Returns success

POST /api/auth/signup/verify { email, code }
→ Verifies passcode
→ Creates user account
→ Logs user in
→ Returns user data
```

### Log In with Email

1. User enters email
2. System sends 6-digit code to email
3. User enters code
4. Logged in automatically

**Backend Flow:**
```
POST /api/auth/login/request { email }
→ Checks if user exists
→ Creates passcode in DB
→ Sends email with code
→ Returns success

POST /api/auth/login/verify { email, code }
→ Verifies passcode
→ Finds user account
→ Logs user in
→ Returns user data
```

### Sign In with Google

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. Grants permissions
4. Redirected back, logged in automatically

**Backend Flow:**
```
GET /api/auth/google
→ Redirects to Google OAuth

GET /api/auth/google/callback
→ Google returns user data
→ Creates/updates user account
→ Logs user in
→ Redirects to app
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
MONGO_URL=mongodb://localhost:27017/
SESSION_SECRET=your-secure-random-string

# Optional - for Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Optional - for production email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure consent screen
6. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

### 3. Email Configuration

**Development Mode:**
- Automatically uses Ethereal (fake SMTP)
- Email preview URLs logged to console
- No configuration needed

**Production Mode:**
- Set `NODE_ENV=production`
- Configure SMTP settings in `.env`
- Recommended services:
  - SendGrid
  - AWS SES
  - Mailgun
  - Postmark

### 4. Initialize Database

```bash
node scripts/initDb.js
```

This creates required MongoDB indexes:
- Users: email (unique), googleId (sparse)
- Passcodes: email, expiresAt (TTL)

## Email Templates

Passcode emails are beautifully designed with:
- Gradient header with app branding
- Large, easy-to-read code display
- Clear expiration notice
- Security reminder

Customize in [services/emailService.js](../services/emailService.js).

## API Reference

### Authentication Endpoints

#### Request Signup Code
```http
POST /api/auth/signup/request
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### Verify Signup Code
```http
POST /api/auth/signup/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

#### Request Login Code
```http
POST /api/auth/login/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify Login Code
```http
POST /api/auth/login/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

#### Google OAuth
```http
GET /api/auth/google
→ Redirects to Google

GET /api/auth/google/callback?code=...
→ Handled by passport, redirects to app
```

#### Get Current User
```http
GET /api/auth/me
Cookie: connect.sid=...

Response:
{
  "success": true,
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://..."  // if from Google
  }
}
```

#### Logout
```http
POST /api/auth/logout
Cookie: connect.sid=...
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  name: String,
  authMethod: "email" | "google" | "both",
  googleId: String (optional),
  picture: String (optional, from Google),
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### Passcodes Collection
```javascript
{
  _id: ObjectId,
  email: String (lowercase),
  code: String (6 digits),
  type: "signup" | "login",
  name: String (for signup only),
  createdAt: Date,
  expiresAt: Date (TTL index),
  verified: Boolean,
  verifiedAt: Date (optional)
}
```

### Sessions Collection
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

## Frontend Integration

### Components

- **Login.jsx**: Email + Google login
- **Signup.jsx**: Email + Google signup
- **App.jsx**: Auth state management
- **Landing.jsx**: User greeting + logout

### API Functions

```javascript
import {
  requestSignupPasscode,
  verifySignupPasscode,
  requestLoginPasscode,
  verifyLoginPasscode,
  logout,
  getCurrentUser,
  getGoogleAuthUrl
} from './services/api';

// Signup flow
await requestSignupPasscode(email, name);
await verifySignupPasscode(email, code);

// Login flow
await requestLoginPasscode(email);
await verifyLoginPasscode(email, code);

// Google OAuth
window.location.href = getGoogleAuthUrl();

// Check auth status
const response = await getCurrentUser();
if (response.success) {
  console.log(response.user);
}
```

## Security Considerations

### Passcode Security
- Codes are 6 digits (1 million combinations)
- 10-minute expiration limits brute force window
- One-time use prevents replay attacks
- Automatic cleanup prevents database bloat

### Session Security
- HttpOnly cookies prevent XSS access
- Secure flag in production (HTTPS only)
- SameSite=lax prevents CSRF
- 7-day expiration with auto-renewal

### Email Delivery
- Use reputable SMTP service
- Configure SPF, DKIM, DMARC
- Monitor delivery rates
- Handle bounces appropriately

### Rate Limiting (TODO)
Consider adding rate limiting to:
- `/api/auth/signup/request` - prevent email spam
- `/api/auth/login/request` - prevent email spam
- `/api/auth/signup/verify` - prevent brute force
- `/api/auth/login/verify` - prevent brute force

Example with `express-rate-limit`:
```javascript
import rateLimit from 'express-rate-limit';

const passcodeRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  message: 'Too many requests, please try again later.'
});

router.post('/signup/request', passcodeRequestLimiter, ...);
```

## Troubleshooting

### Emails Not Sending

**Development:**
- Check console for Ethereal preview URL
- Email service auto-creates test account

**Production:**
- Verify SMTP credentials
- Check firewall allows outbound port 587
- Review SMTP service logs
- Test with `nodemailer.createTestAccount()`

### Google OAuth Not Working

1. Check credentials in Google Cloud Console
2. Verify redirect URI matches exactly
3. Enable Google+ API
4. Check browser doesn't block popups
5. Review passport Google strategy configuration

### Passcodes Expiring Too Fast

Adjust in [models/Passcode.js](../models/Passcode.js):
```javascript
expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
// Change to:
expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
```

### Sessions Not Persisting

- Verify MongoDB connection
- Check `connect-mongo` configuration
- Ensure `SESSION_SECRET` is set
- Check cookie settings match environment

## Future Enhancements

1. **SMS Passcodes**: Alternative to email via Twilio
2. **Remember Device**: Extend session for trusted devices
3. **Magic Links**: One-click login links via email
4. **Biometric Auth**: WebAuthn for fingerprint/face
5. **MFA**: Optional second factor for high security
6. **Social Logins**: GitHub, Microsoft, Apple, etc.
7. **Rate Limiting**: Prevent abuse and brute force
8. **Email Templates**: Customizable HTML templates
9. **Audit Logs**: Track all auth events
10. **Account Recovery**: Alternative verification methods

## Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Passport.js Documentation](https://www.passportjs.org/)
- [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- [Express Session Docs](https://github.com/expressjs/session)
- [MongoDB TTL Indexes](https://docs.mongodb.com/manual/core/index-ttl/)
