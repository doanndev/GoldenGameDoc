
# 🔐 Google Login Referral Integration

## 📋 Tổng quan

Đã tích hợp thành công hệ thống Smart Referral vào Google Login với các tính năng:

- ✅ Hỗ trợ tham số `ref` trong Google Login
- ✅ Tự động tạo referral tree khi user mới đăng ký qua Google
- ✅ Validation referral code (8 ký tự alphanumeric)
- ✅ Logging chi tiết cho debugging
- ✅ Không làm gián đoạn quá trình login

## 🚀 Cách sử dụng

### 1. **API Endpoint**

```http
POST /auth/google-login
Content-Type: application/json

{
  "code": "google_authorization_code",
  "path": "login-email",
  "ref": "ABC12345"
}
```

### 2. **Các tham số**

- `code` (required): Google authorization code
- `path` (optional): OAuth path, default: "login-email"
- `ref` (optional): Referral code (8 ký tự alphanumeric)

### 3. **Validation Rules**

- ✅ **Referral code format:** 8 ký tự alphanumeric (A-Z, 0-9)
- ✅ Không phân biệt hoa thường
- ❌ Không được sử dụng mã của chính mình
- ❌ Mã phải tồn tại trong database
- ❌ Chỉ áp dụng cho user mới (chưa tồn tại)


# 🤖 Telegram Bot Referral Integration

## 📋 Tổng quan

Đã tích hợp thành công hệ thống Smart Referral vào Telegram Bot với các tính năng:

- ✅ Parse referral code từ `/start` command
- ✅ Tự động tạo referral tree khi user mới đăng ký
- ✅ Validation referral code (8 ký tự alphanumeric)
- ✅ Hiển thị thông báo thành công/thất bại
- ✅ Logging chi tiết cho debugging

## 🚀 Cách sử dụng

### 1. **URL Telegram Bot với Referral Code**

```
https://t.me/your_bot_name?start=ABC12345
```

### 2. **Format được hỗ trợ**

- `/start=ABC12345` - **Chỉ hỗ trợ format này duy nhất**

### 3. **Validation Rules**

- ✅ **Chỉ hỗ trợ format:** `/start=ABCD1234`
- ✅ Referral code phải đúng 8 ký tự
- ✅ Chỉ chấp nhận chữ cái và số (A-Z, 0-9)
- ✅ Không phân biệt hoa thường
- ❌ Không được sử dụng mã của chính mình
- ❌ Mã phải tồn tại trong database
- ❌ **Không hỗ trợ các format khác** như `/start ABC12345`, `/start ref=ABC12345`

## 🔄 Luồng xử lý

### **Khi user mới truy cập với referral code:**

1. **Parse referral code** từ `/start` command
2. **Validate format** (8 ký tự alphanumeric)
3. **Tìm referrer** trong database
4. **Kiểm tra không tự refer** chính mình
5. **Lấy cấu hình** từ `setting_rewards` table
6. **Xây dựng referral tree** theo max level
7. **Lưu vào database** các relationship
8. **Truyền referral code** qua URL frontend
9. **Hiển thị thông báo** thành công/thất bại

### **Ví dụ minh họa:**

```
User A (referral_code: ABC12345) 
    ↓ giới thiệu
User B truy cập: /start=ABC12345
    ↓ hệ thống tạo
SmartRefTree: invitee=UserB, referral=UserA, level=1

Nếu User A có referrer:
User C (referral_code: DEF67890)
    ↓ giới thiệu  
User A (referral_code: ABC12345)
    ↓ giới thiệu
User B truy cập: /start=ABC12345
    ↓ hệ thống tạo
SmartRefTree: 
- invitee=UserB, referral=UserA, level=1
- invitee=UserB, referral=UserC, level=2
