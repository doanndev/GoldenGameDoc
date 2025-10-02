# Admin User Management Module

This module provides comprehensive user management functionality for administrators, implementing UC-03: Quản lý người dùng.

## Features

- **User List Viewing**: View paginated list of users with search and filtering capabilities
- **User Detail Viewing**: View detailed user information including personal data, wallets, and transaction history
- **User Blocking/Unblocking**: Block or unblock users with reason tracking
- **Comprehensive Logging**: All admin actions are logged for audit purposes

## API Endpoints

### 1. Get Users List
**GET** `/admin/users`

Retrieves a paginated list of users with optional search and filtering.

#### Query Parameters
- `search` (optional): Search by username, email, phone, telegram_id, or user ID
- `status` (optional): Filter by user status (`active` or `block`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

#### Example Request
```
GET /admin/users?search=john&status=active&page=1&limit=10
```

#### Response
```json
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "telegram_id": "123456789",
      "fullname": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "birthday": "1990-01-01",
      "sex": "male",
      "active_email": true,
      "active_google_auth": false,
      "is_master": false,
      "status": "active",
      "referral_code": "REF123",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "total_pages": 10
}
```

### 2. Get User Details
**GET** `/admin/users/:id`

Retrieves detailed information about a specific user including wallets and transaction history.

#### Path Parameters
- `id`: User ID (integer)

#### Example Request
```
GET /admin/users/123
```

#### Response
```json
{
  "user": {
    "id": 123,
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "telegram_id": "123456789",
    "fullname": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "birthday": "1990-01-01",
    "sex": "male",
    "active_email": true,
    "active_google_auth": false,
    "is_master": false,
    "status": "active",
    "referral_code": "REF123",
    "created_at": "2024-01-01T00:00:00.000Z",
    "main_wallets": [
      {
        "id": 1,
        "address": "0x1234567890abcdef",
        "name": "Main Wallet",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "transaction_histories": [
      {
        "id": 1,
        "option": "deposit",
        "address": "0x1234567890abcdef",
        "coin_name": "Bitcoin",
        "currency_symbol": "BTC",
        "amount": 0.5,
        "tx_hash": "abc123def456",
        "status": "success",
        "note": "Deposit from exchange",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 3. Block User
**PATCH** `/admin/users/:id/block`

Blocks a user account.

#### Path Parameters
- `id`: User ID (integer)

#### Request Body
```json
{
  "reason": "Violation of terms of service" // optional
}
```

#### Response
```json
{
  "message": "User blocked successfully",
  "user_id": 123,
  "action": "block",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4. Unblock User
**PATCH** `/admin/users/:id/unblock`

Unblocks a user account.

#### Path Parameters
- `id`: User ID (integer)

#### Request Body
```json
{
  "reason": "Issue resolved" // optional
}
```

#### Response
```json
{
  "message": "User unblocked successfully",
  "user_id": 123,
  "action": "unblock",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication & Authorization

All endpoints require admin authentication using the `AdminJwtAuthGuard`. The admin must be logged in and have appropriate permissions.

## Error Handling

The module handles various error scenarios:

- **404 Not Found**: User not found
- **400 Bad Request**: Invalid request data or user already in the requested state
- **401 Unauthorized**: Invalid or missing authentication
- **403 Forbidden**: Insufficient permissions

## Logging

All admin actions are automatically logged to the `admin_logs` table with the following information:
- Admin ID who performed the action
- Action type (VIEW, UPDATE, etc.)
- Module (USERS)
- Description of the action
- IP address and user agent
- Target user ID and type
- Old and new data (for updates)

## Use Case Implementation

This module fully implements UC-03: Quản lý người dùng:

✅ **Main Flow**:
- Admin can view user list with ID, username, email, status, and balance information
- Admin can search users by username/ID/email and filter by status
- Admin can view detailed user information including personal data, main wallets, and transaction history
- Admin can block/unblock users with reason tracking
- All actions are logged for audit purposes

✅ **Alternative Flows**:
- AF-01: Proper error handling when user is not found
- AF-02: Authentication and authorization checks prevent unauthorized access

✅ **Post-conditions**:
- User status is updated correctly
- All changes are logged with admin information and timestamps

## Dependencies

- `@nestjs/common`: Core NestJS functionality
- `@nestjs/typeorm`: Database ORM integration
- `typeorm`: Database query builder
- `class-validator`: Request validation
- `class-transformer`: Data transformation

## Database Entities

- `User`: Main user entity
- `UserMainWallet`: User wallet information
- `WalletHistory`: Transaction history
- `AdminLog`: Admin action logging
