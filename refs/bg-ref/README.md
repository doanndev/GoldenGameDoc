# BG Ref Module

## Tổng quan
Module BG Ref cung cấp hệ thống affiliate ưu tiên với khả năng cấu hình commission đa cấp. Đây là hệ thống referral cao cấp cho phép quản lý cây affiliate phức tạp với các quy tắc commission linh hoạt.

## Tính năng chính
- **Đăng nhập BG Affiliate**: Hỗ trợ đăng nhập qua Telegram và Google OAuth
- **Quản lý Commission**: Cập nhật commission percent cho direct downline
- **Thông tin BG**: Lấy thông tin chi tiết về ví và affiliate status
- **JWT Authentication**: Sử dụng JWT với secret riêng cho BG Ref
- **Wallet Integration**: Tích hợp với hệ thống ví main và import

## Base URL
```
/bg-ref
```

## API Endpoints

### 1. Đăng nhập Telegram
**POST** `/bg-ref/auth/telegram-login`

Đăng nhập vào hệ thống BG Ref bằng Telegram ID.

**Request Body:**
```json
{
  "telegram_id": "123456789",
  "code": "verification_code"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 142857,
    "username": "thanhnhan",
    "email": "httnhan0411@gmail.com",
    "fullname": "Thanh Nhan",
    "referral_code": "REF142857"
  }
}
```

### 2. Đăng nhập Google
**POST** `/bg-ref/auth/google-login`

Đăng nhập vào hệ thống BG Ref bằng Google OAuth.

**Request Body:**
```json
{
  "code": "google_auth_code",
  "path": "optional_path"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 142857,
    "username": "thanhnhan",
    "email": "httnhan0411@gmail.com",
    "fullname": "Thanh Nhan",
    "referral_code": "REF142857"
  }
}
```

### 3. Refresh Token
**POST** `/bg-ref/auth/refresh-token`

Làm mới access token từ refresh token.

**Response:**
```json
{
  "message": "Token refreshed successfully"
}
```

### 4. Đăng xuất
**POST** `/bg-ref/auth/logout`

Đăng xuất khỏi hệ thống BG Ref.

**Response:**
```json
{
  "message": "Logout successful"
}
```

### 5. Lấy thông tin BG
**GET** `/bg-ref/me`

Lấy thông tin chi tiết về ví BG đang đăng nhập.

**Headers:**
- `Authorization: Bearer <access_token>` hoặc access_token cookie

**Response:**
```json
{
  "success": true,
  "message": "Get BG info successfully",
  "user": {
    "id": 142857,
    "username": "thanhnhan",
    "email": "httnhan0411@gmail.com",
    "fullname": "Thanh Nhan",
    "referral_code": "REF142857",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "bg_affiliate_info": {
    "tree_id": 1,
    "parent_user_id": 123456,
    "commission_percent": 15.5,
    "level": 2,
    "is_bg_affiliate": true
  },
  "wallet_info": {
    "address": "7iVkjCipYtpLdEToJVVWwzTRz5aox12V3veEfKRXYACK",
    "type": "main",
    "name": "Main Wallet",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. Cập nhật Commission
**PUT** `/bg-ref/nodes/commission`

Cập nhật commission percent của direct downline (chỉ người giới thiệu trực tiếp mới có quyền).

**Headers:**
- `Authorization: Bearer <access_token>` hoặc access_token cookie

**Request Body:**
```json
{
  "to_wallet_address": "ABC123...",
  "new_percent": 15.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Updated commission percent successfully",
  "from_user": {
    "id": 1,
    "username": "user1",
    "email": "user1@example.com",
    "fullname": "User One",
    "referral_code": "REF001"
  },
  "to_user": {
    "id": 2,
    "username": "user2",
    "email": "user2@example.com",
    "fullname": "User Two",
    "referral_code": "REF002",
    "wallet_address": "ABC123..."
  },
  "old_percent": 10.0,
  "new_percent": 15.5
}
```

## Authentication

### JWT Configuration
- **Secret**: `JWT_SECRET_BG_REF` (JWT_SECRET + "_BG_REF")
- **Refresh Secret**: `JWT_REFRESH_SECRET_BG_REF` (JWT_REFRESH_SECRET + "_BG_REF")
- **Access Token Expiry**: 15 minutes
- **Refresh Token Expiry**: 7 days

### Cookie Settings
- **SameSite**: `none`
- **HttpOnly**: `true`
- **Secure**: `true` (production only)

## Business Rules

### Commission Management
1. **Direct Referrer Only**: Chỉ người giới thiệu trực tiếp mới có quyền thay đổi commission
2. **Commission Limit**: Commission không được vượt quá commission của parent
3. **Active Status**: Chỉ user có status 'active' mới được phép thay đổi commission
4. **BG Affiliate Check**: User phải thuộc BG affiliate system

### Wallet Integration
1. **Main Wallets**: Ví chính được tạo từ HD wallet
2. **Import Wallets**: Ví import từ private key
3. **Wallet Lookup**: Tìm user theo cả main wallet và import wallet
4. **Address Validation**: Kiểm tra wallet address hợp lệ

## Error Handling

### Common Errors
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User or wallet not found

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Database Entities

### BgAffiliateTree
- `id`: Primary key
- `root_user_id`: ID của root user
- `total_commission_percent`: Tổng commission percent
- `alias`: Tên alias cho tree
- `created_at`: Thời gian tạo

### BgAffiliateNode
- `id`: Primary key
- `tree_id`: ID của tree
- `user_id`: ID của user
- `parent_user_id`: ID của parent user
- `commission_percent`: Commission percent
- `alias`: Tên alias cho node
- `effective_from`: Thời gian có hiệu lực

### BgAffiliateCommissionReward
- `id`: Primary key
- `tree_id`: ID của tree
- `order_id`: ID của order
- `parent_id`: ID của parent user
- `commission_amount`: Số tiền commission
- `level`: Cấp độ trong tree
- `created_at`: Thời gian tạo

## Environment Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL_GOOGLE_REDIRECT_BG=your_redirect_uri

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## Usage Examples

### Đăng nhập và lấy thông tin
```bash
# 1. Đăng nhập Telegram
curl -X POST /bg-ref/auth/telegram-login \
  -H "Content-Type: application/json" \
  -d '{"telegram_id": "123456789", "code": "verification_code"}'

# 2. Lấy thông tin BG
curl -X GET /bg-ref/me \
  -H "Authorization: Bearer <access_token>"

# 3. Cập nhật commission
curl -X PUT /bg-ref/nodes/commission \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"to_wallet_address": "ABC123...", "new_percent": 15.5}'
```

## Security Features

1. **JWT Authentication**: Bảo vệ tất cả endpoints
2. **Permission Control**: Chỉ direct referrer mới có quyền thay đổi commission
3. **Input Validation**: Validate tất cả input data
4. **Error Handling**: Proper error handling với specific messages
5. **Wallet Ownership**: Kiểm tra wallet thuộc về user

## Integration Points

### Auth Module
- Sử dụng JWT strategy từ auth module
- Tích hợp với user authentication system

### Wallet Module
- Sử dụng UserMainWallet và UserImportWallet entities
- Tích hợp với wallet management system

### User Module
- Sử dụng User entity
- Tích hợp với user management system
