# Auth Module API Documentation

## Overview
The Auth module handles user authentication, registration, and session management for the Game-BE application. It supports multiple authentication methods including email/password, Telegram, and Google OAuth.

## Base URL
```
https://dp7vlq3z-8000.asse.devtunnels.ms/api/v1
```

## Authentication Methods

### 1. Email/Password Authentication
- Registration with email verification
- Login with email and password
- Password reset functionality

### 2. Telegram Authentication
- Login via Telegram bot integration

### 3. Google OAuth Authentication
- Login via Google OAuth 2.0

## API Endpoints

### 1. Send Verification Code
**POST** `/auth/send-code`

Sends a verification code to the user's email for account registration.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Verification code has been sent to your email"
}
```

**Status Codes:**
- `200` - Code sent successfully
- `409` - Email already exists in the system

---

### 2. Register Account
**POST** `/auth/register`

Registers a new user account after email verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "username": "johndoe",
  "fullname": "John Doe",
  "password": "SecurePass123!"
}
```

**Password Requirements:**
- Minimum 8 characters, maximum 128 characters
- Must contain at least one lowercase letter
- Must contain at least one uppercase letter
- Must contain at least one number
- Must contain at least one special character (@$!%*?&._)

**Response:**
```json
{
  "message": "Email verification successful! Your account has been activated."
}
```

**Status Codes:**
- `200` - Registration successful
- `400` - Invalid verification code or account already verified
- `401` - Invalid or expired verification code
- `409` - Username already exists

---

### 3. Login with Username
**POST** `/auth/login`

Authenticates user with email and password.

**Request Body:**
```json
{
  "username": "userexample",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "Login successful"
}
```

**Cookies Set:**
- `access_token` - JWT access token (15 minutes)
- `refresh_token` - JWT refresh token (7 days)

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials or email not verified

---

### 4. Forgot Password
**POST** `/auth/forgot-password`

Sends a password reset code to the user's email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset code has been sent to your email"
}
```

**Status Codes:**
- `200` - Reset code sent successfully
- `400` - Account not active or code already sent
- `404` - Email not found in system

---

### 5. Reset Password
**POST** `/auth/reset-password`

Resets user password using verification code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

**Status Codes:**
- `200` - Password reset successful
- `400` - Account not active
- `401` - Invalid or expired reset code
- `404` - Email not found

---

### 6. Login with Telegram
**POST** `/auth/login/telegram`

Authenticates user via Telegram bot.

**Request Body:**
```json
{
  "telegram_id": "123456789",
  "code": "abc123def456ghi789jkl012mno345pqr678"
}
```

**Response:**
```json
{
  "message": "Login successful"
}
```

**Cookies Set:**
- `access_token` - JWT access token (15 minutes)
- `refresh_token` - JWT refresh token (7 days)

**Status Codes:**
- `200` - Login successful
- `401` - Invalid or expired verification code
- `404` - User not found

---

### 7. Login with Google
**POST** `/auth/login/google`

Authenticates user via Google OAuth.

**Request Body:**
```json
{
  "code": "4/0AX4XfWh...",
}
```

**Response:**
```json
{
  "message": "Login successful"
}
```

**Cookies Set:**
- `access_token` - JWT access token (15 minutes)
- `refresh_token` - JWT refresh token (7 days)

**Status Codes:**
- `200` - Login successful
- `401` - Invalid Google authorization code

---

### 8. Refresh Token
**POST** `/auth/refresh`

Refreshes the access token using the refresh token.

**Request:**
- Requires `refresh_token` cookie

**Response:**
```json
{
  "message": "Token refreshed successfully"
}
```

**Status Codes:**
- `200` - Token refreshed successfully
- `401` - Invalid refresh token

---

### 9. Logout
**POST** `/auth/logout`

Logs out the user by clearing authentication cookies.

**Response:**
```json
{
  "message": "Logout successful"
}
```

**Status Codes:**
- `200` - Logout successful

---

### 10. Get Current User
**GET** `/auth/me`

Retrieves current user information.

**Headers:**
- `Authorization: Bearer <access_token>` or access_token cookie

**Response:**
```json
{
  "username": "johndoe",
  "email": "user@example.com",
  "telegram_id": "123456789",
  "referral_code": "ABC12345",
  "fullname": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "birthday": "1990-01-01T00:00:00.000Z",
  "sex": "male",
  "is_master": false
}
```

**Status Codes:**
- `200` - User information retrieved successfully
- `401` - Unauthorized (invalid or missing token)
- `404` - User not found


```

## Security Features

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Complex password requirements enforced
- Password verification using secure comparison

### JWT Tokens
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens are stored in HTTP-only cookies
- Secure cookie settings in production

### Email Verification
- 6-digit verification codes
- 15-minute expiration for registration codes
- 5-minute expiration for password reset codes
- Codes are single-use and marked as used

### Rate Limiting
- Built-in rate limiting middleware
- Prevents abuse of authentication endpoints

## Error Handling

The module provides comprehensive error handling with appropriate HTTP status codes:

- `400 Bad Request` - Invalid input data or business logic errors
- `401 Unauthorized` - Authentication failures
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server errors

