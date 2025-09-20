# Tài liệu API Module Users

## Tổng quan
Module Users xử lý quản lý thông tin người dùng, đặc biệt là chức năng đổi tên người dùng với giới hạn thời gian. Module này cung cấp các API để người dùng có thể thay đổi username và kiểm tra thời hạn đổi tên.

**Lưu ý quan trọng:** Người dùng phải set username lần đầu trước khi có thể sử dụng các API khác. Nếu chưa set username, API `/auth/me` sẽ trả về lỗi "Username not set".

## Base URL
```
/users
```

## Xác thực
Tất cả các API trong module này đều yêu cầu xác thực JWT. Sử dụng Bearer token trong header Authorization.

```http
Authorization: Bearer <JWT_TOKEN>
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
  - Chỉ được chứa chữ cái, số và dấu gạch dưới

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

**Response Fields:**
- `username_expiry` (Date | null): Thời điểm hết hạn đổi tên
- `can_change` (boolean): Có thể đổi tên ngay bây giờ không
- `days_left` (number, optional): Số ngày còn lại (chỉ có khi can_change = false)

**Status Codes:**
- `200` - Lấy thông tin thành công
- `401` - Chưa xác thực
- `404` - Không tìm thấy người dùng

---

## Quy trình sử dụng

### 0. Kiểm tra trạng thái username (Bước đầu tiên)
```javascript
// Kiểm tra xem user đã set username chưa
try {
  const response = await fetch('/auth/me', {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  
  if (response.ok) {
    const userInfo = await response.json();
    console.log('User đã set username:', userInfo.username);
    // Tiếp tục với các bước khác
  }
} catch (error) {
  if (error.status === 400 && error.message === 'Username not set') {
    // User chưa set username, cần set username lần đầu
    console.log('User cần set username lần đầu');
    // Redirect đến trang set username
  }
}
```

### 1. Kiểm tra thời hạn trước khi đổi tên
```javascript
// 1. Kiểm tra xem có thể đổi tên không
const response = await fetch('/users/username-expiry', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const data = await response.json();

if (data.can_change) {
  // Có thể đổi tên ngay
  console.log('Có thể đổi tên ngay bây giờ');
} else {
  // Chưa hết thời hạn
  console.log(`Cần chờ thêm ${data.days_left} ngày`);
}
```

### 2. Đổi tên người dùng
```javascript
// 2. Thực hiện đổi tên
const response = await fetch('/users/rename', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    username: 'new_username'
  })
});

const result = await response.json();

if (response.ok) {
  console.log('Đổi tên thành công:', result.message);
} else {
  console.error('Lỗi:', result.message);
}
```

## Quy tắc thời hạn đổi tên

### Khi nào được đổi tên?
- **Lần đầu tạo tài khoản**: Có thể đổi tên ngay lập tức
- **Sau khi đổi tên**: Phải chờ 30 ngày mới được đổi lại
- **Reset thời hạn**: Mỗi lần đổi tên thành công sẽ reset lại 30 ngày

### Cách tính thời hạn
- Thời gian được tính theo UTC
- Thời hạn 30 ngày được tính từ thời điểm đổi tên thành công
- Số ngày còn lại được làm tròn lên (ceil)

### Ví dụ thực tế
```
Ngày tạo tài khoản: 2024-01-01
Username ban đầu: User_123456
Thời hạn đổi tên: 2024-01-31 (30 ngày sau)

Ngày 2024-01-15: Đổi tên thành "john_doe"
Thời hạn mới: 2024-02-14 (30 ngày sau)

Ngày 2024-02-10: Kiểm tra thời hạn
- can_change: false
- days_left: 4
```

## Xử lý lỗi thường gặp

### 1. Lỗi username đã tồn tại
```json
{
  "statusCode": 400,
  "message": "Username is already taken by another user",
  "error": "Conflict"
}
```
**Giải pháp**: Chọn username khác

### 2. Lỗi chưa hết thời hạn
```json
{
  "statusCode": 403,
  "message": "You can only change username once every 30 days. Please wait 15 more days.",
  "error": "Forbidden"
}
```
**Giải pháp**: Chờ đến khi hết thời hạn hoặc sử dụng API kiểm tra thời hạn

### 3. Lỗi validation username
```json
{
  "statusCode": 400,
  "message": [
    "Username must be at least 3 characters long",
    "Username cannot exceed 20 characters"
  ],
  "error": "Bad Request"
}
```
**Giải pháp**: Kiểm tra lại format username

### 4. Lỗi user chưa set username
```json
{
  "statusCode": 400,
  "message": "Username not set",
  "error": "Bad Request"
}
```
**Giải pháp**: User cần set username lần đầu bằng API `/users/rename`

### 5. Lỗi xác thực
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```
**Giải pháp**: Kiểm tra JWT token và đăng nhập lại

## Tích hợp với Frontend

### React/Next.js Example
```jsx
import { useState, useEffect } from 'react';

function UsernameManager() {
  const [username, setUsername] = useState('');
  const [expiryInfo, setExpiryInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Kiểm tra thời hạn khi component mount
  useEffect(() => {
    checkUsernameExpiry();
  }, []);

  const checkUsernameExpiry = async () => {
    try {
      const response = await fetch('/users/username-expiry', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setExpiryInfo(data);
    } catch (error) {
      console.error('Error checking expiry:', error);
    }
  };

  const changeUsername = async () => {
    setLoading(true);
    try {
      const response = await fetch('/users/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ username })
      });

      if (response.ok) {
        alert('Đổi tên thành công!');
        checkUsernameExpiry(); // Refresh expiry info
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.message}`);
      }
    } catch (error) {
      console.error('Error changing username:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Quản lý tên người dùng</h2>
      
      {expiryInfo && (
        <div>
          {expiryInfo.can_change ? (
            <p style={{color: 'green'}}>✅ Có thể đổi tên ngay bây giờ</p>
          ) : (
            <p style={{color: 'orange'}}>
              ⏰ Cần chờ thêm {expiryInfo.days_left} ngày để đổi tên
            </p>
          )}
        </div>
      )}

      <div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nhập tên mới"
          disabled={!expiryInfo?.can_change}
        />
        <button 
          onClick={changeUsername} 
          disabled={!expiryInfo?.can_change || loading}
        >
          {loading ? 'Đang xử lý...' : 'Đổi tên'}
        </button>
      </div>
    </div>
  );
}
```

### Vue.js Example
```vue
<template>
  <div>
    <h2>Quản lý tên người dùng</h2>
    
    <div v-if="expiryInfo">
      <p v-if="expiryInfo.can_change" style="color: green">
        ✅ Có thể đổi tên ngay bây giờ
      </p>
      <p v-else style="color: orange">
        ⏰ Cần chờ thêm {{ expiryInfo.days_left }} ngày để đổi tên
      </p>
    </div>

    <div>
      <input
        v-model="username"
        type="text"
        placeholder="Nhập tên mới"
        :disabled="!expiryInfo?.can_change"
      />
      <button 
        @click="changeUsername"
        :disabled="!expiryInfo?.can_change || loading"
      >
        {{ loading ? 'Đang xử lý...' : 'Đổi tên' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      expiryInfo: null,
      loading: false
    }
  },
  async mounted() {
    await this.checkUsernameExpiry();
  },
  methods: {
    async checkUsernameExpiry() {
      try {
        const response = await fetch('/users/username-expiry', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.expiryInfo = await response.json();
      } catch (error) {
        console.error('Error checking expiry:', error);
      }
    },
    async changeUsername() {
      this.loading = true;
      try {
        const response = await fetch('/users/rename', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ username: this.username })
        });

        if (response.ok) {
          alert('Đổi tên thành công!');
          await this.checkUsernameExpiry();
        } else {
          const error = await response.json();
          alert(`Lỗi: ${error.message}`);
        }
      } catch (error) {
        console.error('Error changing username:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
```

## Testing

### Test Cases cho Tester

#### 1. Test user chưa set username
```bash
# 1. Đăng nhập user mới (chưa set username)
POST /auth/login/google
{
  "code": "google_auth_code"
}

# 2. Gọi API /auth/me
GET /auth/me
Authorization: Bearer <token>

# Expected: 400 Bad Request với message "Username not set"
```

#### 2. Test đổi tên thành công
```bash
# 1. Đăng nhập để lấy token
POST /auth/login
{
  "username": "test_user",
  "password": "password123"
}

# 2. Kiểm tra thời hạn (nên có thể đổi tên)
GET /users/username-expiry
Authorization: Bearer <token>

# 3. Đổi tên
POST /users/rename
Authorization: Bearer <token>
{
  "username": "new_test_user"
}

# Expected: 200 OK với message "Username updated successfully"
```

#### 2. Test username đã tồn tại
```bash
# 1. Đổi tên với username đã có
POST /users/rename
Authorization: Bearer <token>
{
  "username": "existing_username"
}

# Expected: 400 Conflict với message "Username is already taken by another user"
```

#### 3. Test chưa hết thời hạn
```bash
# 1. Đổi tên lần đầu
POST /users/rename
Authorization: Bearer <token>
{
  "username": "first_change"
}

# 2. Ngay lập tức đổi tên lần 2
POST /users/rename
Authorization: Bearer <token>
{
  "username": "second_change"
}

# Expected: 403 Forbidden với message về thời hạn 30 ngày
```

#### 4. Test validation username
```bash
# Test username quá ngắn
POST /users/rename
Authorization: Bearer <token>
{
  "username": "ab"
}

# Expected: 400 Bad Request với validation errors

# Test username quá dài
POST /users/rename
Authorization: Bearer <token>
{
  "username": "this_username_is_too_long_for_validation"
}

# Expected: 400 Bad Request với validation errors
```

#### 5. Test không có token
```bash
# Gọi API không có Authorization header
POST /users/rename
{
  "username": "test"
}

# Expected: 401 Unauthorized
```

## Dependencies

### Internal Dependencies
- `@nestjs/common` - Chức năng cốt lõi NestJS
- `@nestjs/typeorm` - ORM cho database
- `class-validator` - Validation cho DTOs
- `../auth/jwt-auth.guard` - JWT authentication guard

### Database Entities
- `User` - Entity chính chứa thông tin người dùng
- `UserMainWallet` - Entity ví chính của người dùng

## Security Considerations

### 1. JWT Authentication
- Tất cả endpoints đều yêu cầu JWT token hợp lệ
- Token được validate qua JWT strategy
- User ID được lấy từ JWT payload

### 2. Input Validation
- Username được validate nghiêm ngặt
- Chỉ cho phép chữ cái, số và dấu gạch dưới
- Giới hạn độ dài 3-20 ký tự

### 3. Rate Limiting
- Có thể áp dụng rate limiting cho API đổi tên
- Ngăn chặn spam đổi tên

### 4. Database Security
- Sử dụng parameterized queries
- Kiểm tra quyền sở hữu trước khi thao tác

## Monitoring & Logging

### Logs quan trọng
- Thành công đổi tên: `Username updated successfully for user ${userId}`
- Lỗi username trùng: `Username ${username} already exists`
- Lỗi chưa hết thời hạn: `User ${userId} tried to change username before expiry`

### Metrics cần theo dõi
- Số lần đổi tên thành công/thất bại
- Thời gian trung bình giữa các lần đổi tên
- Số lượng lỗi validation

## Troubleshooting

### 1. Lỗi "User not found"
- Kiểm tra JWT token có hợp lệ không
- Kiểm tra user có tồn tại trong database không

### 2. Lỗi "Username is already taken"
- Kiểm tra username có thực sự trùng không
- Kiểm tra có user khác đang sử dụng username này không

### 3. Lỗi thời hạn không chính xác
- Kiểm tra timezone của server
- Kiểm tra logic tính toán thời gian

### 4. Lỗi validation
- Kiểm tra format username
- Kiểm tra độ dài username
- Kiểm tra ký tự đặc biệt
