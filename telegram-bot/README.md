# Tài liệu API Module Telegram Bot

## Tổng quan
Module Telegram Bot cung cấp tích hợp với Telegram Bot API cho xác thực người dùng và giao tiếp. Nó xử lý đăng ký người dùng, tạo mã đăng nhập và nhắn tin tự động thông qua bot Telegram.

## Tính năng
- Đăng ký người dùng tự động qua Telegram
- Tạo và xác thực mã đăng nhập
- Tạo ví HD cho người dùng mới
- Polling tin nhắn thời gian thực
- Tích hợp bàn phím inline
- Xử lý lỗi và ghi log

## Cấu hình Bot

### Biến môi trường
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
URL_WORKER=https://proxy.michosso2025.workers.dev
FRONTEND_URL_TELEGRAM_REDIRECT=https://your-frontend.com/tglogin
```

### Khởi tạo Bot
Bot tự động khởi động khi module được khởi tạo và bắt đầu polling để nhận cập nhật.

## Lệnh Bot

### Lệnh /start
**Mô tả:** Khởi tạo quy trình đăng ký hoặc đăng nhập người dùng

**Cách sử dụng:** Gửi `/start` cho bot

**Quy trình:**
1. Kiểm tra người dùng có tồn tại trong database không
2. Tạo người dùng mới nếu chưa tìm thấy
3. Tạo mã referral duy nhất
4. Tạo ví HD cho người dùng
5. Tạo mã đăng nhập 32 ký tự
6. Gửi tin nhắn chào mừng với nút đăng nhập

**Response:**
```
⭐️ *Welcome to GoldenGame* 🤘

Please click the button below to login.
This link will expire in 10 minutes.

[🌐 Login Website] (Inline button)
```

**Tạo người dùng:**
- Username: `TelegramUser_{telegram_id}`
- Status: `block` (cần xác thực)
- Referral code: Mã 8 ký tự tự động tạo
- Wallet: Ví HD tự động tạo

## Tích hợp Database

### Cập nhật User Entity
Khi tạo người dùng mới qua Telegram:
```typescript
{
  username: `TelegramUser_${telegramId}`,
  telegram_id: telegramId,
  fullname: fullName,
  referral_code: uniqueReferralCode,
  status: 'block',
  created_at: new Date()
}
```

### Tạo ví
- Tạo ví HD sử dụng `WalletService.createHDWallet()`
- Lưu thông tin ví trong entity `UserMainWallet`
- Địa chỉ ví và đường dẫn được lưu để sử dụng sau

### Tạo mã
- Tạo mã ngẫu nhiên 32 ký tự
- Loại mã: `tele-login`
- Hết hạn: 10 phút
- Mã xác thực sử dụng một lần

## Tích hợp API

### Xác thực mã đăng nhập
Mã được tạo được sử dụng trong endpoint `/auth/login/telegram` của module auth:

**Request:**
```json
{
  "telegram_id": "123456789",
  "code": "abc123def456ghi789jkl012mno345pqr678"
}
```

## Xử lý tin nhắn

### Loại tin nhắn
- **Tin nhắn văn bản:** Được xử lý cho lệnh
- **Tin nhắn lệnh:** Được xử lý bởi bộ xử lý lệnh
- **Callback Queries:** Chưa được triển khai

### Xử lý lỗi
- Telegram ID không hợp lệ: Gửi tin nhắn lỗi
- Lỗi database: Ghi log lỗi và gửi tin nhắn thân thiện với người dùng
- Lỗi mạng: Thử lại với exponential backoff

## Hệ thống Polling

### Xử lý cập nhật
- Polling Telegram API mỗi 1 giây
- Xử lý cập nhật tuần tự
- Theo dõi ID cập nhật cuối cùng đã xử lý
- Xử lý timeout mạng một cách graceful

### Loại cập nhật được hỗ trợ
- `message` - Tin nhắn văn bản và lệnh
- Tương lai: `callback_query`, `inline_query`

## Tính năng bảo mật

### Bảo mật mã
- Mã ngẫu nhiên 32 ký tự
- Hết hạn sau 10 phút
- Xác thực sử dụng một lần
- Tạo ngẫu nhiên an toàn

### Bảo vệ dữ liệu người dùng
- Thu thập dữ liệu tối thiểu
- Tạo mã referral an toàn
- Tạo ví được bảo vệ

## Ghi log

### Mức log
- **Info:** Khởi động bot, tạo người dùng, thao tác thành công
- **Error:** Lỗi database, lỗi mạng, lỗi không mong muốn
- **Debug:** Theo dõi thao tác chi tiết

### Tin nhắn log
```
🚀 Telegram bot starting...
✅ Created wallet for Telegram user {userId}: {address}
❌ Error creating wallet for Telegram user: {error}
```

## Kịch bản lỗi

### Lỗi thường gặp
1. **Thiếu Bot Token**
   - Lỗi: `TELEGRAM_BOT_TOKEN is missing in .env file`
   - Giải pháp: Cấu hình bot token trong môi trường

2. **Thiếu Frontend URL**
   - Lỗi: `FRONTEND_URL_TELEGRAM_REDIRECT is missing in .env file`
   - Giải pháp: Cấu hình frontend redirect URL

3. **Lỗi Database**
   - Thử tạo người dùng trùng lặp
   - Lỗi tạo ví
   - Lỗi tạo mã

4. **Lỗi mạng**
   - Timeout Telegram API
   - Worker URL không khả dụng
   - Lỗi gửi tin nhắn

### Message lỗi thực tế
- **"❌ Error: Unable to identify Telegram ID."** - Không thể xác định Telegram ID
- **"❌ An error occurred. Please try again later."** - Xảy ra lỗi, vui lòng thử lại sau

## Dependencies

### Dependencies chính
- `@nestjs/common` - Chức năng cốt lõi NestJS
- `@nestjs/config` - Quản lý cấu hình
- `@nestjs/typeorm` - Tích hợp ORM database
- `axios` - HTTP client cho Telegram API

### Dịch vụ bên ngoài
- **Telegram Bot API** - Xử lý tin nhắn và tương tác người dùng
- **Worker URL** - Proxy cho yêu cầu Telegram API
- **Frontend Application** - Giao diện người dùng cho đăng nhập

## Database Entities

### User Entity
```typescript
{
  id: number;
  username: string;
  telegram_id: string;
  fullname: string;
  referral_code: string;
  status: 'block' | 'active';
  created_at: Date;
}
```

### UserCode Entity
```typescript
{
  id: number;
  user_id: number;
  value: string; // 32-character code
  type: 'tele-login';
  is_live: boolean;
  code_time: Date; // 15 minutes from creation
}
```

### UserMainWallet Entity
```typescript
{
  id: number;
  user_id: number;
  address: string;
  path_hd_wallet: number;
}
```

## Service Methods

### Methods công khai
- `onModuleInit()` - Khởi tạo bot và bắt đầu polling
- `sendEmailVerificationCode(telegramId, code)` - Gửi mã xác thực

### Methods riêng tư
- `generateCode(telegramId, userId)` - Tạo mã đăng nhập
- `sendMessage(chatId, text, options)` - Gửi tin nhắn cho người dùng
- `getUpdates()` - Polling cho cập nhật mới
- `handleUpdate(update)` - Xử lý cập nhật đến
- `generateUniqueReferralCode()` - Tạo mã referral duy nhất

## Điểm tích hợp

### Auth Module
- Cung cấp mã đăng nhập cho xác thực
- Xử lý luồng xác thực người dùng
- Quản lý tạo phiên người dùng

### Wallet Module
- Tạo ví HD cho người dùng mới
- Quản lý địa chỉ ví và đường dẫn
- Tích hợp với blockchain Solana

### User Module
- Quản lý lưu trữ dữ liệu người dùng
- Xử lý lưu trữ mã người dùng
- Quản lý tạo mã referral

## Giám sát và bảo trì

### Kiểm tra sức khỏe
- Xác thực bot token
- Khả dụng Worker URL
- Kết nối database
- Thành công gửi tin nhắn

### Chỉ số hiệu suất
- Thời gian xử lý tin nhắn
- Tỷ lệ thành công tạo người dùng
- Hiệu suất tạo mã
- Hiệu quả polling

## Cải tiến tương lai

### Tính năng dự kiến
- Xử lý callback query
- Hỗ trợ inline query
- Template tin nhắn
- Hỗ trợ đa ngôn ngữ
- Khôi phục lỗi nâng cao

### Cân nhắc khả năng mở rộng
- Hỗ trợ webhook cho bot khối lượng lớn
- Pool kết nối database
- Tích hợp message queue
- Hỗ trợ cân bằng tải
