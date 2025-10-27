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
  "blocked_users_count": 20,
  "master_users_count": 10,
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
- 

# Tài liệu API Module Users

## Tổng quan
Module Users xử lý quản lý thông tin người dùng, đặc biệt là chức năng đổi tên người dùng với giới hạn thời gian. Module này cung cấp các API để người dùng có thể thay đổi username và kiểm tra thời hạn đổi tên.


## Base URL
```
/users
```

## Các API Endpoints

### 1. Đổi tên người dùng
**POST** `/users/rename`

Cho phép người dùng đổi tên với giới hạn thời gian 30 ngày. Mỗi lần đổi tên thành công sẽ reset lại thời hạn 30 ngày.

**Request Body:**
```json
{
  "username": "new_username"
}
```

**Validation Rules:**
- `username` (string, required): Tên người dùng mới
  - Tối thiểu 3 ký tự
  - Tối đa 20 ký tự

**Response Success (200):**
```json
{
  "message": "Username updated successfully"
}
```

**Status Codes:**
- `200` - Đổi tên thành công
- `400` - Username đã được sử dụng
- `401` - Chưa xác thực
- `403` - Chưa hết thời hạn 30 ngày
- `404` - Không tìm thấy người dùng

---

### 2. Kiểm tra thời hạn đổi tên
**GET** `/users/username-expiry`

Kiểm tra thời hạn đổi tên hiện tại của người dùng và số ngày còn lại.

**Request Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response Success (200):**
```json
{
  "username_expiry": "2024-02-15T10:30:00.000Z",
}
```


**Status Codes:**
- `200` - Lấy thông tin thành công
- `401` - Chưa xác thực
- `404` - Không tìm thấy người dùng

# User PnL Statistics API Documentation

## Overview
This API provides comprehensive profit and loss (PnL) statistics for individual users based on their game participation. The API calculates statistics by analyzing the user's betting activity in `game_join_rooms` and their winnings from `game_session_results`.

## Endpoint
```
GET /admin/users/:id/pnl
```

## Authentication
- Required: Admin JWT Auth Guard
- Permission Guard: Yes

## Request Parameters

### Path Parameters
- `id` (number, required): User ID to get PnL statistics for

### Request Headers
```
Authorization: Bearer <admin_jwt_token>
```

## Response

### Success Response (200 OK)
```json
{
  "user_id": 123,
  "total_bets": 10.5,
  "total_winnings": 15.0,
  "total_loss": 8.5,
  "net_pnl": 4.5,
  "win_rate": 45.5,
  "total_sessions": 20,
  "winning_sessions": 9,
  "losing_sessions": 11,
  "avg_bet_amount": 0.525,
  "avg_win_amount": 1.667,
  "avg_loss_amount": 0.773
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | number | The user ID |
| `total_bets` | number | Total amount of money bet across all sessions |
| `total_winnings` | number | Total amount of money won from prize_amount |
| `total_loss` | number | Total amount of money lost on losing sessions |
| `net_pnl` | number | Net profit/loss (total_winnings - total_loss) |
| `win_rate` | number | Percentage of sessions won (0-100) |
| `total_sessions` | number | Total number of game sessions participated in |
| `winning_sessions` | number | Number of sessions where user won |
| `losing_sessions` | number | Number of sessions where user lost |
| `avg_bet_amount` | number | Average bet amount per session |
| `avg_win_amount` | number | Average win amount per winning session |
| `avg_loss_amount` | number | Average loss amount per losing session |

### Error Responses

#### 404 Not Found - User Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## PnL Calculation Logic

### How It Works
1. **Fetch All User Game Participations**: Retrieves all records from `game_join_rooms` for the specified user
2. **Group by Session**: Groups all joins by `session_id` to track performance per session
3. **Check for Results**: For each join, checks if there's a corresponding `game_session_results` entry
4. **Calculate Profit/Loss**:
   - **Winning Session**: If `prize_amount > 0` exists → Profit = prize_amount - bet_amount
   - **Losing Session**: If no prize_amount or prize_amount = 0 → Loss = bet_amount (negative PnL)

### Example Scenario

**Session 1 (Win)**:
- User bets: 1.0 SOL
- User wins: 2.5 SOL (prize_amount)
- Session PnL: +1.5 SOL

**Session 2 (Loss)**:
- User bets: 1.0 SOL
- No prize_amount (no result entry)
- Session PnL: -1.0 SOL

**Totals**:
- Total Bets: 2.0 SOL
- Total Winnings: 2.5 SOL
- Total Loss: 1.0 SOL
- Net PnL: +0.5 SOL
- Win Rate: 50%

## Usage Examples

### cURL Request
```bash
curl -X GET 'https://api.example.com/admin/users/123/pnl' \
  -H 'Authorization: Bearer <admin_jwt_token>'
```

### JavaScript/TypeScript (Fetch)
```javascript
const response = await fetch('https://api.example.com/admin/users/123/pnl', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <admin_jwt_token>',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

### Axios
```javascript
const axios = require('axios');

async function getUserPnL(userId) {
  try {
    const response = await axios.get(`https://api.example.com/admin/users/${userId}/pnl`, {
      headers: {
        'Authorization': 'Bearer <admin_jwt_token>'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

## Important Notes

1. **Precision**: All amounts are returned with 8 decimal places precision (toFixed(8))
2. **Win Rate**: Calculated as (winning_sessions / total_sessions) * 100, rounded to 2 decimal places
3. **Empty User**: If a user has no game participation, returns all zeros
4. **Multiple Joins per Session**: If a user has multiple joins in a session, all bets are summed for that session
5. **Missing Results**: Sessions without `game_session_results` are considered losses
6. **Logging**: All API calls are logged in the admin logs with action type VIEW and module USERS

## Related Entities

### game_join_rooms
- `id`: Primary key
- `user_id`: Reference to User
- `session_id`: Reference to GameSessions
- `amount`: Bet amount
- `status`: View/Cancelled/Executed/Refunded

### game_session_results
- `id`: Primary key
- `join_id`: Reference to GameJoinRoom
- `prize_amount`: Amount won
- `status`: Pending/Executed/Failed

## Dependencies

- `GameJoinRoom` entity
- `GameSessionResults` entity
- Admin authentication
- Permission guards




