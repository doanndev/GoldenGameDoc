# BG Ref Module

## Tổng quan
Module BG Ref cung cấp hệ thống affiliate ưu tiên với khả năng cấu hình commission đa cấp. Đây là hệ thống referral cao cấp cho phép quản lý cây affiliate phức tạp với các quy tắc commission linh hoạt.

## Tính năng chính
- **Đăng nhập BG Affiliate**: Hỗ trợ đăng nhập qua Telegram, Google OAuth và Username/Password
- **Code Verification**: Xác thực mã đăng nhập 32 ký tự với thời hạn 10 phút
- **Password Authentication**: Xác thực username/email và password với bcrypt
- **Quản lý Commission**: Cập nhật commission percent cho direct downline
- **Thông tin BG**: Lấy thông tin chi tiết về ví và affiliate status
- **JWT Authentication**: Sử dụng JWT với secret riêng cho BG Ref
- **Wallet Integration**: Tích hợp với hệ thống ví main và import
- **User Status Management**: Tự động update user status từ 'block' thành 'active'

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
  "code": "abc123def456ghi789jkl012mno345pqr678"
}
```

**Response:**
```json
{
  "message": "BG Telegram login successful",
  "user": {
    "id": 142857,
    "telegram_id": "123456789",
    "fullname": "Thanh Nhan",
    "avatar": "https://api.telegram.org/file/bot...",
    "referral_code": "REF142857",
    "bg_affiliate": {
      "tree_id": 1,
      "commission_percent": 15.5,
      "alias": "bg_node_alias"
    }
  }
}
```

**Validation Rules:**
- Code phải là 32 ký tự alphanumeric
- Code có hiệu lực trong 10 phút
- Code chỉ sử dụng được 1 lần
- User phải thuộc BG affiliate system
- User status sẽ tự động update từ 'block' thành 'active'

### 2. Đăng nhập Google
**POST** `/bg-ref/auth/google-login`

Đăng nhập vào hệ thống BG Ref bằng Google OAuth.

**Request Body:**
```json
{
  "code": "google_auth_code",
}
```

**Response:**
```json
{
  "message": "BG Google login successful",
  "user": {
    "id": 142857,
    "username": "thanhnhan",
    "email": "httnhan0411@gmail.com",
    "fullname": "Thanh Nhan",
    "referral_code": "REF142857",
    "bg_affiliate": {
      "tree_id": 1,
      "commission_percent": 15.5,
      "alias": "bg_node_alias"
    }
  }
}
```

### 3. Đăng nhập Username/Password
**POST** `/bg-ref/auth/login`

Đăng nhập vào hệ thống BG Ref bằng username/email và password.

**Request Body:**
```json
{
  "username": "thanhnhan",
  "password": "password123"
}
```

**Hoặc sử dụng email:**
```json
{
  "username": "httnhan0411@gmail.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "BG Username/Password login successful",
  "user": {
    "id": 142857,
    "username": "thanhnhan",
    "email": "httnhan0411@gmail.com",
    "fullname": "Thanh Nhan",
    "avatar": "https://example.com/avatar.jpg",
    "referral_code": "REF142857",
    "bg_affiliate": {
      "tree_id": 1,
      "commission_percent": 15.5,
      "alias": "bg_node_alias"
    }
  }
}
```

**Validation Rules:**
- Username có thể là username hoặc email
- Password phải khớp với password đã hash trong database
- User phải thuộc BG affiliate system
- User phải có status 'active'

### 4. Refresh Token
**POST** `/bg-ref/auth/refresh-token`

Làm mới access token từ refresh token.

**Response:**
```json
{
  "message": "Token refreshed successfully"
}
```

### 5. Đăng xuất
**POST** `/bg-ref/auth/logout`

Đăng xuất khỏi hệ thống BG Ref.

**Response:**
```json
{
  "message": "Logout successful"
}
```

### 6. Lấy thông tin BG
**GET** `/bg-ref/me`

Lấy thông tin chi tiết về ví BG đang đăng nhập.

**Headers:**
- `Authorization: Bearer <access_token>` hoặc `bg_access_token` cookie

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

### 7. Cập nhật Commission
**PUT** `/bg-ref/nodes/commission`

Cập nhật commission percent của direct downline (chỉ người giới thiệu trực tiếp mới có quyền).

**Headers:**
- `Authorization: Bearer <access_token>` hoặc `bg_access_token` cookie

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

### 8. Lịch sử hoa hồng BG
**GET** `/bg-ref/commission-history`

Lấy lịch sử hoa hồng BG của user đang đăng nhập.

**Headers:**
- `Authorization: Bearer <access_token>` hoặc `bg_access_token` cookie

**Query Parameters:**
- `include_withdrawn` (optional): `true` (mặc định) hoặc `false` - có bao gồm hoa hồng đã rút không

**Response:**
```json
{
  "success": true,
  "message": "Get commission history successfully",
  "data": [
    {
      "id": 1,
      "tree_id": 1,
      "order_id": 123,
      "parent_id": 456,
      "commission_amount": 15.5,
      "level": 2,
      "created_at": "2024-01-01T00:00:00.000Z",
      "withdraw_status": false,
      "withdraw_id": null,
      "wallet_address": "ABC123...",
      "alias": "My Alias",
      "order_user": {
        "id": 123,
        "username": "user123",
        "email": "user@example.com",
        "fullname": "User Name"
      },
      "parent_user": {
        "id": 456,
        "username": "parent456",
        "email": "parent@example.com",
        "fullname": "Parent Name"
      }
    }
  ]
}
```

### 9. Thống kê BG Affiliate
**GET** `/bg-ref/bg-affiliate-stats`

Lấy thống kê tổng quan về BG affiliate của user đang đăng nhập.

**Headers:**
- `Authorization: Bearer <access_token>` hoặc `bg_access_token` cookie

**Response:**
```json
{
  "success": true,
  "message": "Get BG affiliate stats successfully",
  "data": {
    "is_bg_affiliate": true,
    "current_wallet": {
      "wallet_id": 123,
      "address": "ABC123...",
      "name": "Main Wallet",
      "created_at": "2024-01-01T00:00:00.000Z",
      "bg_alias": "My Alias",
      "user": {
        "id": 456,
        "username": "user123",
        "email": "user@example.com",
        "fullname": "User Name",
        "referral_code": "REF456",
        "status": "active"
      }
    },
    "tree_info": {
      "tree_id": 1,
      "total_commission_percent": 15.5
    },
    "node_info": {
      "alias": "My Alias",
      "commission_percent": 10.0
    },
    "total_earnings": 150.75,
    "available_earnings": 75.25
  }
}
```

**Case: User không thuộc BG Affiliate System**
```json
{
  "success": true,
  "message": "Get BG affiliate stats successfully",
  "data": {
    "is_bg_affiliate": false
  }
}
```

### 10. Cấu trúc cây Affiliate
**GET** `/bg-ref/trees`

Lấy cấu trúc cây affiliate của user đang đăng nhập với thống kê chi tiết.

**Headers:**
- `Authorization: Bearer <access_token>` hoặc `bg_access_token` cookie

**Response:**
```json
{
  "success": true,
  "message": "Get affiliate tree successfully",
  "data": {
    "is_bg_affiliate": true,
    "tree_info": {
      "tree_id": 1,
      "root_user_id": 123,
      "total_commission_percent": 15.5,
      "alias": "Main Tree",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "downline_structure": [
      {
        "user_id": 456,
        "parent_user_id": 123,
        "commission_percent": 10.0,
        "alias": "Level 1 User",
        "effective_from": "2024-01-01T00:00:00.000Z",
        "level": 0,
        "user": {
          "id": 456,
          "username": "user456",
          "email": "user456@example.com",
          "fullname": "User 456",
          "referral_code": "REF456"
        },
        "stats": {
          "total_reward": 75.25,
          "total_transactions": 25
        },
        "children": [
          {
            "user_id": 789,
            "parent_user_id": 456,
            "commission_percent": 5.0,
            "alias": "Level 2 User",
            "effective_from": "2024-01-02T00:00:00.000Z",
            "level": 1,
            "user": {
              "id": 789,
              "username": "user789",
              "email": "user789@example.com",
              "fullname": "User 789",
              "referral_code": "REF789"
            },
            "stats": {
              "total_reward": 40.25,
              "total_transactions": 12
            },
            "children": []
          }
        ]
      }
    ]
  }
}
```

**Case: User không thuộc BG Affiliate System**
```json
{
  "success": true,
  "message": "Get affiliate tree successfully",
  "data": {
    "is_bg_affiliate": false
  }
}
```

### 11. Thống kê Downline
**GET** `/bg-ref/downline-stats`

Lấy thống kê chi tiết về downline của user đang đăng nhập.

**Headers:**
- `Authorization: Bearer <access_token>` hoặc `bg_access_token` cookie

**Query Parameters:**
- `level` (optional): Lọc theo level cụ thể (1, 2, 3, ...)
- `min_commission` (optional): Lọc theo commission tối thiểu
- `max_commission` (optional): Lọc theo commission tối đa
- `min_transactions` (optional): Lọc theo số giao dịch tối thiểu
- `max_transactions` (optional): Lọc theo số giao dịch tối đa
- `sort_by` (optional): Sắp xếp theo `commission`, `transactions`, `level`, `created_at` (mặc định: `commission`)
- `sort_order` (optional): Thứ tự sắp xếp `asc` hoặc `desc` (mặc định: `desc`)

**Response:**
```json
{
  "success": true,
  "message": "Get downline stats successfully",
  "data": {
    "is_bg_affiliate": true,
    "total_members": 15,
    "members_by_level": {
      "1": 5,
      "2": 7,
      "3": 3
    },
    "total_commission_earned": 1250.75,
    "total_transactions": 89,
    "stats": {
      "1": {
        "count": 5,
        "total_commission": 750.50,
        "total_transactions": 45
      },
      "2": {
        "count": 7,
        "total_commission": 400.25,
        "total_transactions": 32
      },
      "3": {
        "count": 3,
        "total_commission": 100.00,
        "total_transactions": 12
      }
    },
    "detailed_members": [
      {
        "user_id": 456,
        "level": 1,
        "commission_percent": 10.0,
        "total_commission": 150.75,
        "total_transactions": 8,
        "last_transaction_date": "2024-01-15T10:30:00.000Z",
        "bg_alias": "Level 1 User",
        "user_info": {
          "username": "user456",
          "email": "user456@example.com",
          "fullname": "User 456",
          "referral_code": "REF456",
          "status": "active"
        },
        "wallet_info": {
          "address": "ABC123...",
          "type": "main"
        }
      }
    ]
  }
}
```

**Case: User không thuộc BG Affiliate System**
```json
{
  "success": true,
  "message": "Get downline stats successfully",
  "data": {
    "is_bg_affiliate": false,
    "total_members": 0,
    "members_by_level": {},
    "total_commission_earned": 0,
    "total_transactions": 0,
    "stats": {},
    "detailed_members": []
  }
}
```

## Authentication

### JWT Configuration
- **Secret**: `JWT_SECRET_BG_REF` (JWT_SECRET + "_BG_REF")
- **Refresh Secret**: `JWT_REFRESH_SECRET_BG_REF` (JWT_REFRESH_SECRET + "_BG_REF")
- **Access Token Expiry**: 15 minutes
- **Refresh Token Expiry**: 7 days

### Cookie Settings
- **Access Token Cookie**: `bg_access_token`
- **Refresh Token Cookie**: `bg_refresh_token`
- **SameSite**: `none`
- **HttpOnly**: `true`
- **Secure**: `true` (production only)

## Business Rules

### Code Verification
1. **Code Format**: Mã đăng nhập phải là 32 ký tự alphanumeric
2. **Expiration**: Code có hiệu lực trong 10 phút từ khi tạo
3. **One-time Use**: Code chỉ sử dụng được 1 lần, sau đó bị đánh dấu `is_live: false`
4. **Type Validation**: Code phải có type 'tele-login'
5. **User Association**: Code phải thuộc về user đúng

### Commission Management
1. **Direct Referrer Only**: Chỉ người giới thiệu trực tiếp mới có quyền thay đổi commission
2. **Commission Limit**: Commission không được vượt quá commission của parent
3. **Active Status**: Chỉ user có status 'active' mới được phép thay đổi commission
4. **BG Affiliate Check**: User phải thuộc BG affiliate system

### User Status Management
1. **Auto Activation**: User status tự động update từ 'block' thành 'active' sau khi verify code thành công
2. **Status Validation**: Chỉ user có status 'active' mới được phép thực hiện các thao tác quan trọng
3. **BG Requirement**: User phải thuộc BG affiliate system để có thể đăng nhập

### Wallet Integration
1. **Main Wallets**: Ví chính được tạo từ HD wallet
2. **Import Wallets**: Ví import từ private key
3. **Wallet Lookup**: Tìm user theo cả main wallet và import wallet
4. **Address Validation**: Kiểm tra wallet address hợp lệ

## Error Handling

### Common Errors
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid or expired token, invalid verification code, user not part of BG affiliate program
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User or wallet not found

### BG Login Specific Errors
- `User not found. Please register first.`: User chưa được tạo trong hệ thống
- `User is not part of BG affiliate program.`: User không thuộc BG affiliate system
- `Invalid or expired verification code`: Code không hợp lệ hoặc đã hết hạn
- `Verification code has expired`: Code đã quá thời hạn 10 phút
- `Account is not active. Please contact support.`: Account bị khóa (sẽ tự động activate sau khi verify code)

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Database Entities

### UserCode
- `id`: Primary key
- `user_id`: ID của user
- `value`: Mã verification code (32 ký tự)
- `type`: Loại code ('tele-login')
- `is_live`: Trạng thái code (true/false)
- `code_time`: Thời gian hết hạn
- `created_at`: Thời gian tạo

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
- `withdraw_status`: Trạng thái rút tiền (boolean)
- `withdraw_id`: ID của withdraw request
- `created_at`: Thời gian tạo

### Transaction (P2P Trading)
- `id`: Primary key
- `reference_code`: Mã tham chiếu duy nhất
- `user_buy_id`: ID user mua
- `user_sell_id`: ID user bán
- `coin_buy_id`: ID coin mua
- `coin_sell_id`: ID coin bán
- `order_book_id`: ID order book liên quan
- `option`: 'buy' hoặc 'sell'
- `amount`: Số lượng giao dịch
- `price`: Giá mỗi đơn vị
- `total_sol`: Tổng giá trị SOL
- `total_usd`: Tổng giá trị USD
- `tx_hash`: Hash giao dịch blockchain
- `status`: 'pending', 'executed', 'failed', 'cancelled'
- `wallet_address`: Địa chỉ ví user tạo transaction
- `created_at`: Thời gian tạo

### OrderBook (P2P Orders)
- `id`: Primary key
- `user_id`: ID người tạo order
- `coin_id`: ID coin chính
- `adv_code`: Mã quảng cáo duy nhất
- `option`: 'buy' hoặc 'sell'
- `coin_buy`: ID coin nhận
- `coin_sell`: ID coin dùng để mua
- `amount`: Số lượng
- `amount_remaining`: Số lượng còn lại
- `price`: Giá
- `price_min`: Giá tối thiểu
- `price_max`: Giá tối đa
- `main_wallet_id`: ID ví chính
- `import_wallet_id`: ID ví import
- `status`: 'draft', 'pending', 'executed', 'failed'
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

# 2. Đăng nhập Google
curl -X POST /bg-ref/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"code": "google_auth_code"}'

# 3. Đăng nhập Username/Password
curl -X POST /bg-ref/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "thanhnhan", "password": "password123"}'

# Hoặc đăng nhập bằng email
curl -X POST /bg-ref/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "httnhan0411@gmail.com", "password": "password123"}'

# 4. Lấy thông tin BG
curl -X GET /bg-ref/me \
  -H "Authorization: Bearer <access_token>"

# 5. Cập nhật commission
curl -X PUT /bg-ref/nodes/commission \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"to_wallet_address": "ABC123...", "new_percent": 15.5}'

# 6. Lấy lịch sử hoa hồng
curl -X GET /bg-ref/commission-history \
  -H "Authorization: Bearer <access_token>"

# 7. Lấy thống kê BG affiliate
curl -X GET /bg-ref/bg-affiliate-stats \
  -H "Authorization: Bearer <access_token>"

# 8. Lấy cấu trúc cây affiliate
curl -X GET /bg-ref/trees \
  -H "Authorization: Bearer <access_token>"

# 9. Lấy thống kê downline
curl -X GET /bg-ref/downline-stats \
  -H "Authorization: Bearer <access_token>"

# Với filters
curl -X GET "/bg-ref/downline-stats?level=1&min_commission=100&sort_by=commission&sort_order=desc" \
  -H "Authorization: Bearer <access_token>"
```

## Security Features

1. **JWT Authentication**: Bảo vệ tất cả endpoints
2. **Code Verification**: Xác thực mã đăng nhập với thời hạn và one-time use
3. **BG Affiliate Validation**: Chỉ user thuộc BG affiliate system mới được đăng nhập
4. **Permission Control**: Chỉ direct referrer mới có quyền thay đổi commission
5. **Input Validation**: Validate tất cả input data
6. **Error Handling**: Proper error handling với specific messages
7. **Wallet Ownership**: Kiểm tra wallet thuộc về user
8. **User Status Management**: Tự động activate user sau khi verify code thành công

## Integration Points

### Auth Module
- Sử dụng JWT strategy từ auth module
- Tích hợp với user authentication system
- Code verification logic tương tự auth service

### Telegram Bot Module
- Tạo mã đăng nhập 32 ký tự cho BG users
- Hỗ trợ redirect URL riêng cho BG affiliate
- Tích hợp với BG affiliate detection

### Wallet Module
- Sử dụng UserMainWallet và UserImportWallet entities
- Tích hợp với wallet management system

### User Module
- Sử dụng User và UserCode entities
- Tích hợp với user management system
- User status management và auto-activation
