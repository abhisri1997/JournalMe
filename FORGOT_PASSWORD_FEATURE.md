# Forgot Password Feature

## Overview

The JournalMe app now includes a complete forgot password flow that allows users to securely reset their passwords via email.

## Features

- **Forgot Password Request**: Users can request a password reset by providing their email
- **Secure Token Generation**: Uses cryptographically secure tokens that are hashed in the database
- **Token Expiration**: Reset tokens expire after 1 hour for security
- **Email Notifications**: Sends password reset links via email (Ethereal in dev, real SMTP in production)
- **Password Reset**: Users can set a new password using a valid reset token
- **Token Validation**: Ensures tokens are valid, not expired, and match the user

## User Flow

1. **Forgot Password Page** (`/forgot-password`)

   - User enters their email address
   - System validates the email format
   - If account exists, a reset link is sent via email
   - For security, the same message is shown whether the email exists or not

2. **Email Received**

   - User receives an email with a password reset link
   - Link includes a secure token valid for 1 hour
   - Example: `http://localhost:5173/reset-password?token=<token>`

3. **Reset Password Page** (`/reset-password`)

   - User clicks the reset link from email
   - Enters new password (min 8 characters) and confirms it
   - System validates and updates the password
   - User is redirected to login page

4. **Login with New Password**
   - User can now log in with the new password

## Backend API

### POST `/api/auth/forgot-password`

Request password reset.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "If an account exists with this email, a reset link has been sent."
}
```

**Status Codes:**

- `200`: Request processed (whether user exists or not, for security)
- `400`: Missing or invalid email format
- `500`: Server error

### POST `/api/auth/reset-password`

Reset password with a valid token.

**Request Body:**

```json
{
  "token": "reset_token_from_email",
  "newPassword": "newsecurepassword"
}
```

**Response:**

```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Status Codes:**

- `200`: Password reset successfully
- `400`: Invalid/expired token or password too short
- `500`: Server error

## Configuration

### Environment Variables

Add these to your `.env` file:

```dotenv
# Email configuration (optional - uses Ethereal for testing if not set)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
SMTP_FROM=noreply@journalme.com

# Frontend URL for password reset links
FRONTEND_URL=http://localhost:5173/reset-password
```

### Email Providers

#### Development (Default - Ethereal)

No configuration needed. Ethereal provides free test email accounts.

#### Gmail

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `SMTP_PASS`

#### Other Providers

Configure your SMTP details in `.env` according to your email provider's documentation.

## Security Considerations

1. **Token Hashing**: Reset tokens are hashed using bcrypt before storage
2. **Token Expiration**: Tokens are valid for only 1 hour
3. **One-Time Use**: Tokens are cleared after successful password reset
4. **User Privacy**: Forgot password endpoint doesn't reveal if user exists
5. **Password Requirements**: New passwords must be at least 8 characters
6. **HTTPS**: Always use HTTPS in production for email links

## Testing

Run the password reset tests:

```bash
npm test
```

Test scenarios covered:

- ✓ Forgot password sends reset link for existing user
- ✓ Forgot password returns 200 for non-existent user (security)
- ✓ Reset password with valid token
- ✓ Reset password rejects expired token
- ✓ Reset password requires minimum password length

## Database Schema

The `User` model includes two new fields:

```prisma
model User {
  // ... existing fields ...
  resetToken      String?    @unique
  resetTokenExpiry DateTime?
}
```

## Components

### Frontend Pages

- **[ForgotPassword.tsx](packages/frontend/src/pages/ForgotPassword.tsx)**: Forgot password request page
- **[ResetPassword.tsx](packages/frontend/src/pages/ResetPassword.tsx)**: Password reset page

### Backend Routes

- **[auth.ts](packages/backend/src/routes/auth.ts)**: Contains `/forgot-password` and `/reset-password` endpoints

### Utilities

- **[mailer.ts](packages/backend/src/utils/mailer.ts)**: Email sending functionality

## Troubleshooting

### Email not received?

- Check `SMTP_HOST` and `SMTP_PORT` are correct
- Ensure `SMTP_USER` and `SMTP_PASS` are valid credentials
- Check spam/junk folder
- In development, check Ethereal test email account

### Token expired?

- Tokens are valid for 1 hour
- User must request a new reset link

### Password reset fails?

- Ensure new password is at least 8 characters
- Passwords must match in confirm field
- Token may have expired
