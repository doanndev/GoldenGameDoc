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

# Update User Master Status API Documentation

## API Endpoint: PATCH /admin/users/:id/is-master

API này cho phép Admin cập nhật trạng thái master của user (thăng chức hoặc hạ chức user).

### Authentication
- **Required**: Admin JWT Token (Bearer Token)
- **Guard**: AdminJwtAuthGuard + PermissionGuard
- **Permission**: Chỉ Super Admin và Admin mới có quyền sử dụng API này

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của user cần cập nhật |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `is_master` | boolean | Yes | Trạng thái master mới: `true` (promote) hoặc `false` (remove) |
| `reason` | string | No | Lý do cập nhật (optional) |

### Request Examples

#### Promote User to Master

```bash
# Sử dụng cURL
curl -X PATCH "http://localhost:3000/admin/users/123/is-master" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "is_master": true,
    "reason": "Promoted for excellent performance in loyalty program"
  }'
```

#### Remove Master Status

```bash
curl -X PATCH "http://localhost:3000/admin/users/123/is-master" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "is_master": false,
    "reason": "Removed due to inactivity"
  }'
```

#### Without Reason

```bash
curl -X PATCH "http://localhost:3000/admin/users/123/is-master" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "is_master": true
  }'
```

#### Using Fetch API

```javascript
// Promote user to master
fetch('http://localhost:3000/admin/users/123/is-master', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_JWT_TOKEN'
  },
  body: JSON.stringify({
    is_master: true,
    reason: 'Promoted for loyalty'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Response Format

#### Success Response (200 OK)

```json
{
  "message": "User promoted to master status successfully",
  "user_id": 123,
  "action": "update_is_master_promote",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

Hoặc khi remove master status:

```json
{
  "message": "User removed from master status successfully",
  "user_id": 123,
  "action": "update_is_master_remove",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Thông báo kết quả thực hiện |
| `user_id` | number | ID của user được cập nhật |
| `action` | string | Hành động thực hiện: `update_is_master_promote` hoặc `update_is_master_remove` |
| `timestamp` | string (ISO 8601) | Thời gian thực hiện |

### Error Responses

#### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causes:**
- Không có JWT token
- JWT token không hợp lệ
- JWT token đã hết hạn
- User không có quyền admin

#### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions. Only Super Admin and Admin can update is_master"
}
```

**Causes:**
- Admin không đủ quyền (chỉ Super Admin và Admin mới có quyền)

#### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

**Causes:**
- User ID không tồn tại trong hệ thống

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "User's master status is already true"
}
```

Hoặc:

```json
{
  "statusCode": 400,
  "message": [
    "is_master must be a boolean value",
    "reason must be a string"
  ]
}
```

**Causes:**
- Trạng thái is_master hiện tại giống với giá trị muốn cập nhật
- Request body không hợp lệ
- Validation errors

### Business Logic

1. **Permission Check**: 
   - Chỉ Super Admin và Admin mới có quyền cập nhật `is_master`
   - Các role khác sẽ nhận lỗi 403 Forbidden

2. **User Validation**: 
   - Kiểm tra user có tồn tại trong hệ thống
   - Nếu không tồn tại, trả về 404

3. **Status Validation**: 
   - Kiểm tra `is_master` hiện tại của user
   - Nếu giá trị mới giống giá trị cũ, trả về 400 Bad Request

4. **Database Update**: 
   - Cập nhật field `is_master` trong bảng `users`
   - Cập nhật giá trị: `true` (promote) hoặc `false` (remove)

5. **Admin Logging**: 
   - Ghi log toàn bộ hoạt động vào bảng `admin_logs`
   - Lưu thông tin: admin_id, action, module, description, ip_address, user_agent
   - Lưu old_data và new_data để audit trail
   - Target được set là user và user_id

6. **Audit Trail**: 
   - Log chứa thông tin chi tiết về thay đổi
   - Bao gồm IP address của admin
   - Bao gồm user agent
   - Bao gồm lý do (nếu có)

### Usage Scenarios

#### Scenario 1: Promote Regular User to Master

```bash
# Request
PATCH /admin/users/456/is-master
{
  "is_master": true,
  "reason": "User has referred 100+ active users"
}

# Response
{
  "message": "User promoted to master status successfully",
  "user_id": 456,
  "action": "update_is_master_promote",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

#### Scenario 2: Remove Master Status

```bash
# Request
PATCH /admin/users/789/is-master
{
  "is_master": false,
  "reason": "Violation of terms of service"
}

# Response
{
  "message": "User removed from master status successfully",
  "user_id": 789,
  "action": "update_is_master_remove",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

#### Scenario 3: Attempting to Update Already True Status

```bash
# Request (user is already master)
PATCH /admin/users/123/is-master
{
  "is_master": true
}

# Response (400 Bad Request)
{
  "statusCode": 400,
  "message": "User's master status is already true"
}
```

#### Scenario 4: Insufficient Permissions

```bash
# Request from Moderator account
PATCH /admin/users/123/is-master
{
  "is_master": true
}

# Response (403 Forbidden)
{
  "statusCode": 403,
  "message": "Insufficient permissions. Only Super Admin and Admin can update is_master"
}
```

### Admin Log Example

Sau khi API được gọi thành công, một record sẽ được tạo trong `admin_logs`:

```json
{
  "id": 12345,
  "admin_id": 1,
  "action": "UPDATE",
  "module": "USERS",
  "description": "User promoted to master status - Reason: Promoted for excellence",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "target_id": 123,
  "target_type": "user",
  "old_data": {
    "is_master": false
  },
  "new_data": {
    "is_master": true,
    "reason": "Promoted for excellence"
  },
  "created_at": "2025-01-15T10:30:00.000Z"
}
```

### Notes

1. **Security**: 
   - Chỉ Super Admin và Admin mới có quyền sử dụng API này
   - Tất cả actions đều được log để audit

2. **Validation**: 
   - Field `is_master` là bắt buộc và phải là boolean
   - Field `reason` là optional nhưng khuyến khích điền vào để tracking

3. **Idempotency**: 
   - API sẽ trả về lỗi nếu cố gắng cập nhật cùng một giá trị

4. **Logging**: 
   - Tất cả actions đều được log đầy đủ
   - Bao gồm IP address và user agent của admin
   - Bao gồm old_data và new_data

5. **Performance**: 
   - API sử dụng transaction để đảm bảo data consistency
   - Logging được thực hiện bất đồng bộ để không ảnh hưởng performance

6. **Database Schema**: 
   - Field `is_master` là boolean trong bảng `users`
   - Mặc định là `false`

### Related Endpoints

- `GET /admin/users` - Lấy danh sách users (có thể filter theo `is_master`)
- `GET /admin/users/:id` - Lấy chi tiết user (bao gồm `is_master`)
- `PATCH /admin/users/:id/block` - Block user
- `PATCH /admin/users/:id/unblock` - Unblock user
- `GET /admin/users/:id/pnl` - Lấy thống kê PnL của user

### Testing

#### Unit Tests
- Test với admin có quyền hợp lệ
- Test với admin không có quyền
- Test với user không tồn tại
- Test với trạng thái đã giống nhau
- Test với request body không hợp lệ

#### Integration Tests
- Test complete flow: update -> verify database -> verify logs
- Test multiple consecutive updates
- Test concurrent updates (nếu cần)




# All Users PnL API Documentation

## API Endpoint: GET /admin/users/pnl/all

API này lấy danh sách thống kê PnL (Profit and Loss) của tất cả users với khả năng search, sắp xếp và phân trang.

### Authentication
- **Required**: Admin JWT Token (Bearer Token)
- **Guard**: AdminJwtAuthGuard + PermissionGuard

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | - | Tìm kiếm theo username, email, telegram_id (partial match, case-insensitive) |
| `sort_by` | string | No | 'pnl' | Trường để sắp xếp: `pnl`, `win_rate`, `total_sessions` |
| `order` | string | No | 'desc' | Thứ tự sắp xếp: `asc` (tăng dần) hoặc `desc` (giảm dần) |
| `page` | number | No | 1 | Số trang (tối thiểu: 1) |
| `limit` | number | No | 10 | Số items per page (tối thiểu: 1, tối đa: 100) |

### Request Examples

#### Lấy danh sách tất cả users PnL (sắp xếp theo PnL giảm dần)

```bash
curl -X GET "http://localhost:3000/admin/users/pnl/all" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Lấy trang 2 với 20 items

```bash
curl -X GET "http://localhost:3000/admin/users/pnl/all?page=2&limit=20" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Search theo username

```bash
curl -X GET "http://localhost:3000/admin/users/pnl/all?search=john" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Sắp xếp theo win rate tăng dần

```bash
curl -X GET "http://localhost:3000/admin/users/pnl/all?sort_by=win_rate&order=asc" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Sắp xếp theo tổng số phiên giảm dần

```bash
curl -X GET "http://localhost:3000/admin/users/pnl/all?sort_by=total_sessions&order=desc" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Kết hợp search, sắp xếp và pagination

```bash
curl -X GET "http://localhost:3000/admin/users/pnl/all?search=alice&sort_by=win_rate&order=desc&page=1&limit=25" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Response Format

#### Success Response (200 OK)

```json
{
  "users": [
    {
      "user_id": 123,
      "username": "john_doe",
      "email": "john@example.com",
      "telegram_id": "@johndoe",
      "total_bets": 1500.5,
      "total_winnings": 2000.0,
      "total_loss": 800.0,
      "net_pnl": 700.5,
      "win_rate": 65.5,
      "total_sessions": 100,
      "winning_sessions": 65,
      "losing_sessions": 35,
      "avg_bet_amount": 15.005,
      "avg_win_amount": 30.77,
      "avg_loss_amount": 22.86
    },
    {
      "user_id": 456,
      "username": "alice_smith",
      "email": "alice@example.com",
      "telegram_id": "@alice",
      "total_bets": 2000.0,
      "total_winnings": 1800.0,
      "total_loss": 1200.0,
      "net_pnl": 600.0,
      "win_rate": 60.0,
      "total_sessions": 80,
      "winning_sessions": 48,
      "losing_sessions": 32,
      "avg_bet_amount": 25.0,
      "avg_win_amount": 37.5,
      "avg_loss_amount": 37.5
    }
  ],
  "page": 1,
  "limit": 10,
  "total_pages": 50,
  "total": 500
}
```

#### Response Fields

##### UserPnLItemDto
| Field | Type | Description |
|-------|------|-------------|
| `user_id` | number | ID của user |
| `username` | string \| null | Username của user |
| `email` | string \| null | Email của user |
| `telegram_id` | string \| null | Telegram ID của user |
| `total_bets` | number | Tổng số tiền đã cược (8 decimal places) |
| `total_winnings` | number | Tổng số tiền thắng (8 decimal places) |
| `total_loss` | number | Tổng số tiền thua (8 decimal places) |
| `net_pnl` | number | Lợi nhuận ròng (total_winnings - total_loss) (8 decimal places) |
| `win_rate` | number | Tỷ lệ thắng (phần trăm) (2 decimal places) |
| `total_sessions` | number | Tổng số phiên chơi |
| `winning_sessions` | number | Số phiên thắng |
| `losing_sessions` | number | Số phiên thua |
| `avg_bet_amount` | number | Số tiền cược trung bình (8 decimal places) |
| `avg_win_amount` | number | Số tiền thắng trung bình (8 decimal places) |
| `avg_loss_amount` | number | Số tiền thua trung bình (8 decimal places) |

##### Pagination Fields
| Field | Type | Description |
|-------|------|-------------|
| `page` | number | Trang hiện tại |
| `limit` | number | Số items per page |
| `total_pages` | number | Tổng số trang |
| `total` | number | Tổng số users |

#### Empty Result Response

```json
{
  "users": [],
  "page": 1,
  "limit": 10,
  "total_pages": 0,
  "total": 0
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causes:**
- Không có JWT token
- JWT token không hợp lệ
- JWT token đã hết hạn

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "page must be a positive number",
    "limit must not be greater than 100",
    "sort_by must be one of the following values: pnl, win_rate, total_sessions",
    "order must be one of the following values: asc, desc"
  ]
}
```

### Business Logic

1. **Search Functionality**:
   - Tìm kiếm theo username, email, hoặc telegram_id
   - Sử dụng partial match (LIKE) với case-insensitive
   - Nếu không có search, trả về tất cả users đã có game history

2. **PnL Calculation**:
   - Tính toán PnL cho mỗi user dựa trên game joins và results
   - `net_pnl` = `total_winnings` - `total_loss`
   - `win_rate` = (winning_sessions / total_sessions) * 100

3. **Sorting**:
   - Mặc định sắp xếp theo `net_pnl` giảm dần (users có PnL cao nhất ở đầu)
   - Có thể sắp xếp theo: `net_pnl`, `win_rate`, hoặc `total_sessions`
   - Có thể sắp xếp tăng dần hoặc giảm dần

4. **Pagination**:
   - Hỗ trợ phân trang với giới hạn tối đa 100 items per page
   - Tính toán số trang dựa trên tổng số users

5. **Zero PnL Handling**:
   - Users chưa có game history sẽ có tất cả giá trị = 0
   - Vẫn được include trong kết quả

6. **Admin Logging**:
   - Tất cả requests đều được log vào admin_logs
   - Bao gồm: admin_id, action (VIEW), module (USERS), description, IP address, user agent
   - Bao gồm search, sort, và pagination parameters

### Sort Options

| Value | Description |
|-------|-------------|
| `pnl` | Sắp xếp theo net PnL (lợi nhuận ròng) |
| `win_rate` | Sắp xếp theo tỷ lệ thắng (%) |
| `total_sessions` | Sắp xếp theo tổng số phiên chơi |

### Order Options

| Value | Description |
|-------|-------------|
| `desc` | Giảm dần (mặc định) - Cao nhất ở đầu |
| `asc` | Tăng dần - Thấp nhất ở đầu |

### Usage Examples

#### JavaScript/Fetch

```javascript
// Lấy danh sách users PnL, sắp xếp theo PnL giảm dần
fetch('http://localhost:3000/admin/users/pnl/all', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_JWT_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// Search và sắp xếp theo win rate
fetch('http://localhost:3000/admin/users/pnl/all?search=alice&sort_by=win_rate&order=desc', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_JWT_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

#### Python/Requests

```python
import requests

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_JWT_TOKEN'
}

# Get all users PnL
response = requests.get(
    'http://localhost:3000/admin/users/pnl/all',
    headers=headers
)
data = response.json()
print(data)

# Search with pagination
response = requests.get(
    'http://localhost:3000/admin/users/pnl/all',
    params={
        'search': 'john',
        'page': 1,
        'limit': 20,
        'sort_by': 'win_rate',
        'order': 'desc'
    },
    headers=headers
)
data = response.json()
print(data)
```

### Notes

1. **Performance**:
   - API tính toán PnL cho tất cả users được tìm thấy, sau đó mới sắp xếp và phân trang
   - Với số lượng users lớn, nên sử dụng search để giảm số lượng users cần tính toán

2. **Data Accuracy**:
   - PnL được tính dựa trên game joins và session results
   - Mỗi user có thể có nhiều joins trong 1 session
   - Sessions được tính là winning nếu user có ít nhất 1 join thắng trong session đó

3. **Default Sorting**:
   - Mặc định sắp xếp theo `net_pnl` giảm dần
   - Users có PnL cao nhất sẽ ở đầu danh sách

4. **Precision**:
   - Tất cả số tiền được làm tròn đến 8 chữ số thập phân
   - Win rate được làm tròn đến 2 chữ số thập phân

5. **Search**:
   - Search hoạt động như "contain" (partial match)
   - Case-insensitive
   - Tìm kiếm trên username, email, và telegram_id

6. **Related Endpoints**:
   - `GET /admin/users` - Lấy danh sách users (không có PnL)
   - `GET /admin/users/:id/pnl` - Lấy PnL chi tiết của 1 user cụ thể

### Database Schema Reference

API này query từ các bảng sau:
- `users` - Thông tin users
- `game_join_rooms` - Thông tin user joins vào các game rooms
- `game_session_results` - Kết quả của các game sessions
- `admin_logs` - Logs các admin actions



