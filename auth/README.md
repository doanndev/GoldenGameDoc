# Tài liệu API Module Auth

## Tổng quan
Module Auth xử lý xác thực người dùng, đăng ký và quản lý phiên đăng nhập cho ứng dụng Game-BE. Hỗ trợ nhiều phương thức xác thực bao gồm email/mật khẩu, Telegram và Google OAuth.

## Base URL
```
/auth
```

## Các phương thức xác thực

### 1. Xác thực Email/Mật khẩu
- Đăng ký với xác thực email
- Đăng nhập với username và mật khẩu
- Chức năng đặt lại mật khẩu

### 2. Xác thực Telegram
- Đăng nhập qua tích hợp Telegram bot

### 3. Xác thực Google OAuth
- Đăng nhập qua Google OAuth 2.0

## Các API Endpoints

### 1. Gửi mã xác thực
**POST** `/auth/send-code`

Gửi mã xác thực đến email của người dùng để đăng ký tài khoản.

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
- `409` - "Email already exists in the system"

---

### 2. Đăng ký tài khoản
**POST** `/auth/register`

Đăng ký tài khoản người dùng mới sau khi xác thực email.

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

**Yêu cầu mật khẩu:**
- Tối thiểu 8 ký tự, tối đa 128 ký tự
- Phải chứa ít nhất một chữ thường
- Phải chứa ít nhất một chữ hoa
- Phải chứa ít nhất một số
- Phải chứa ít nhất một ký tự đặc biệt (@$!%*?&._)

**Response:**
```json
{
  "message": "Email verification successful! Your account has been activated."
}
```

**Status Codes:**
- `200` - Registration successful
- `400` - "Account has already been verified"
- `401` - "Invalid or expired verification code" / "Verification code has expired. Please request a new code" / "Email does not match verification code"
- `409` - "Username already exists in the system"

---

### 3. Đăng nhập với Username
**POST** `/auth/login`

Xác thực người dùng với username và mật khẩu.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "Login successful"
}
```

**Cookies được thiết lập:**
- `access_token` - JWT access token (15 phút)
- `refresh_token` - JWT refresh token (7 ngày)

**Status Codes:**
- `200` - Login successful
- `401` - "Invalid username or password" / "Username not verified. Please verify your username first." / "Account is not active. Please contact support." / "Password not set. Please reset your password." / "Invalid username or password"

---

### 4. Quên mật khẩu
**POST** `/auth/forgot-password`

Gửi mã đặt lại mật khẩu đến email của người dùng.

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
- `400` - "Account is not active. Please contact support." / "Please wait X minute(s) before requesting a new reset code. A code has already been sent to your email."
- `404` - "Email not found in our system"

---

### 5. Đặt lại mật khẩu
**POST** `/auth/reset-password`

Đặt lại mật khẩu người dùng bằng mã xác thực.

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
- `400` - "Account is not active. Please contact support."
- `401` - "Invalid or expired reset code" / "Reset code has expired. Please request a new code"
- `404` - "Email not found in our system"

---

### 6. Đăng nhập với Telegram
**POST** `/auth/login/telegram`

Xác thực người dùng qua Telegram bot.

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

**Cookies được thiết lập:**
- `access_token` - JWT access token (15 phút)
- `refresh_token` - JWT refresh token (7 ngày)

**Status Codes:**
- `200` - Login successful
- `401` - "Invalid or expired verification code" / "Verification code has expired"
- `404` - "User not found"

---

### 7. Đăng nhập với Google
**POST** `/auth/login/google`

Xác thực người dùng qua Google OAuth.

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

**Cookies được thiết lập:**
- `access_token` - JWT access token (15 phút)
- `refresh_token` - JWT refresh token (7 ngày)

**Status Codes:**
- `200` - Login successful
- `401` - "Failed to exchange code for token" / "Invalid token issuer" / "Invalid token audience" / "Email not verified" / "Invalid Google token" / "Failed to get user info"

---

### 8. Làm mới Token
**POST** `/auth/refresh`

Làm mới access token bằng refresh token.

**Request:**
- Yêu cầu cookie `refresh_token`

**Response:**
```json
{
  "message": "Token refreshed successfully"
}
```

**Status Codes:**
- `200` - Token refreshed successfully
- `401` - "Invalid refresh token" / "Invalid token type"
- `404` - "User not found"

---

### 9. Đăng xuất
**POST** `/auth/logout`

Đăng xuất người dùng bằng cách xóa cookies xác thực.

**Response:**
```json
{
  "message": "Logout successful"
}
```

**Status Codes:**
- `200` - Logout successful

---

### 10. Lấy thông tin người dùng hiện tại
**GET** `/auth/me`

Lấy thông tin người dùng hiện tại.

**Headers:**
- `Authorization: Bearer <access_token>` hoặc access_token cookie

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
  "is_master": false,
  "wallet_id": 123,
  "wallet_address": "0x1234567890abcdef..."
}
```

**Status Codes:**
- `200` - User information retrieved successfully
- `401` - "Invalid token type" / "User not found"
- `404` - "User not found"

---

### 11. Chọn ví để đăng nhập
**POST** `/auth/select-wallet/:walletAddress`

Chọn một ví cụ thể cho phiên đăng nhập hiện tại.

**Headers:**
- `Authorization: Bearer <access_token>` hoặc access_token cookie

**Parameters:**
- `walletAddress` (string) - Địa chỉ ví cần chọn

**Response:**
```json
{
  "message": "Wallet selected successfully"
}
```

**Status Codes:**
- `200` - Wallet selected successfully
- `400` - "Wallet not found or not owned by user"
- `401` - Unauthorized (invalid or missing token)
- `404` - "User not found"

## Các đối tượng chuyển dữ liệu (DTOs)

### SendCodeDto
```typescript
{
  email: string; // Bắt buộc, đã trim
}
```

### VerifyEmailCodeDto
```typescript
{
  email: string; // Bắt buộc, đã trim
  code: string; // Bắt buộc, đã trim
  username: string; // Bắt buộc, đã trim
  fullname: string; // Bắt buộc, đã trim
  password: string; // Bắt buộc, 8-128 ký tự, mẫu phức tạp
}
```

### UserLoginDto
```typescript
{
  username: string; // Bắt buộc, đã trim
  password: string; // Bắt buộc, 8-128 ký tự, mẫu phức tạp
}
```

### ForgotPasswordDto
```typescript
{
  email: string; // Bắt buộc, đã trim
}
```

### ResetPasswordDto
```typescript
{
  email: string; // Bắt buộc, đã trim
  code: string; // Bắt buộc, đã trim
  newPassword: string; // Bắt buộc, 8-128 ký tự, mẫu phức tạp
}
```

### TelegramLoginDto
```typescript
{
  telegram_id: string; // Bắt buộc, đã trim
  code: string; // Bắt buộc, đã trim
}
```

### GoogleLoginDto
```typescript
{
  code: string; // Bắt buộc, đã trim
  path?: string; // Tùy chọn, đã trim
}
```

### UserInfoDto
```typescript
{
  username: string;
  email: string;
  telegram_id: string;
  referral_code: string;
  fullname: string;
  avatar: string;
  birthday: Date;
  sex: 'male' | 'female' | 'other';
  is_master: boolean;
  wallet_id?: number;
  wallet_address?: string;
}
```

## Các tính năng bảo mật

### Bảo mật mật khẩu
- Mật khẩu được mã hóa bằng bcrypt với 12 salt rounds
- Yêu cầu mật khẩu phức tạp được thực thi
- Xác minh mật khẩu bằng so sánh an toàn

### JWT Tokens
- Access tokens hết hạn sau 15 phút
- Refresh tokens hết hạn sau 7 ngày
- Tokens được lưu trong HTTP-only cookies
- Cài đặt cookie an toàn trong production
- Tokens bao gồm thông tin ví (wallet_id, wallet_address)
- Hỗ trợ chọn và chuyển đổi ví

### Xác thực email
- Mã xác thực 6 chữ số
- Hết hạn sau 10 phút cho mã đăng ký
- Hết hạn sau 5 phút cho mã đặt lại mật khẩu
- Mã chỉ sử dụng một lần và được đánh dấu đã sử dụng
- Tái sử dụng mã hợp lệ hiện có để tránh spam

### Giới hạn tần suất
- Middleware giới hạn tần suất tích hợp sẵn
- Ngăn chặn lạm dụng các endpoint xác thực

### Tích hợp ví
- Tự động tạo ví HD cho người dùng mới
- Hỗ trợ ví chính và ví đã import
- Chọn ví cho người dùng đa ví
- Thông tin ví được nhúng trong JWT tokens

## Xử lý lỗi

Module cung cấp xử lý lỗi toàn diện với các mã trạng thái HTTP phù hợp:

### 400 Bad Request
- "Account has already been verified"
- "Account is not active. Please contact support."
- "Please wait X minute(s) before requesting a new reset code. A code has already been sent to your email."
- "Wallet not found or not owned by user"

### 401 Unauthorized
- "Invalid or expired verification code"
- "Verification code has expired. Please request a new code"
- "Email does not match verification code"
- "Invalid username or password"
- "Username not verified. Please verify your username first."
- "Account is not active. Please contact support."
- "Password not set. Please reset your password."
- "Invalid email or password"
- "Invalid or expired verification code"
- "Verification code has expired"
- "Failed to exchange code for token"
- "Invalid token issuer"
- "Invalid token audience"
- "Email not verified"
- "Invalid Google token"
- "Failed to get user info"
- "Invalid refresh token"
- "Invalid token type"

### 404 Not Found
- "User not found"
- "Email not found in our system"

### 409 Conflict
- "Email already exists in the system"
- "Username already exists in the system"

### 500 Internal Server Error
- Lỗi máy chủ

## Các tính năng bổ sung

### Quy trình đăng ký người dùng
1. **Tạo người dùng tạm thời** - Người dùng được tạo với `status: 'block'` ban đầu
2. **Xác thực email** - Mã 6 chữ số được gửi qua email với thời hạn 10 phút
3. **Kích hoạt tài khoản** - Trạng thái người dùng được thay đổi thành `'active'` sau xác thực
4. **Tạo ví** - Ví HD được tự động tạo cho người dùng mới

### Hỗ trợ đa ví
- Người dùng có thể có nhiều ví (chính + đã import)
- Endpoint chọn ví để chuyển đổi giữa các ví
- JWT tokens bao gồm thông tin ví hiện tại
- Hỗ trợ cả ví chính và ví đã import

### Tích hợp Google OAuth
- Tự động tạo người dùng cho người dùng Google mới
- Tạo username từ địa chỉ email
- Trạng thái xác thực email từ Google
- Tích hợp liền mạch với hệ thống ví hiện có

