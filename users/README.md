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

**Response Error (400):**
```json
{
  "statusCode": 400,
  "message": "Username is already taken by another user",
  "error": "Conflict"
}
```

**Response Error (403):**
```json
{
  "statusCode": 403,
  "message": "You can only change username once every 30 days. Please wait 15 more days.",
  "error": "Forbidden"
}
```

**Response Error (404):**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

**Response Error (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
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
  "can_change": false,
  "days_left": 15
}
```

**Response khi có thể đổi tên:**
```json
{
  "username_expiry": "2024-01-10T10:30:00.000Z",
  "can_change": true
}
```

**Response Error (404):**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

**Response Error (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```


**Status Codes:**
- `200` - Lấy thông tin thành công
- `401` - Chưa xác thực
- `404` - Không tìm thấy người dùng

