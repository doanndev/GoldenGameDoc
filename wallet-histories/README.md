# Wallet History Module

Module quản lý lịch sử giao dịch ví và chức năng rút tiền SOL/USDT trong hệ thống Golden Game.

## 📁 Cấu trúc

```
wallet-histories/
├── wallet-history.entity.ts      # Entity cho bảng wallet_histories
├── wallet-history.dto.ts         # DTOs cho API
├── wallet-history.service.ts     # Business logic
├── wallet-history.controller.ts  # API endpoints
├── blockchain.service.ts         # Blockchain operations service
├── wallet-history.module.ts      # Module configuration
└── README.md                     # Documentation
```

### 📄 Mô tả file

- **`wallet-history.entity.ts`**: Entity `WalletHistory` với các trường id, user_id, option, address, coin_name, currency_symbol, amount, tx_hash, status, note, created_at
- **`wallet-history.dto.ts`**: DTOs cho withdrawal request/response và withdrawal history queries
- **`wallet-history.service.ts`**: Logic xử lý withdrawal và lịch sử giao dịch
- **`blockchain.service.ts`**: Service chuyên xử lý các thao tác blockchain Solana
- **`wallet-history.controller.ts`**: API endpoints cho withdrawal và lịch sử
- **`wallet-history.module.ts`**: Cấu hình module với dependencies

## 🚀 Tính năng

- **Rút tiền**: Rút SOL và USDT từ ví người dùng
- **Lịch sử rút tiền**: Xem lịch sử các giao dịch rút tiền với pagination
- **Kiểm tra số dư**: Kiểm tra số dư khả dụng trước khi rút
- **Blockchain integration**: Tích hợp với Solana blockchain
- **Error handling**: Xử lý lỗi toàn diện cho các thao tác blockchain

## 📊 Database Schema

### Bảng `wallet_histories`

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | `integer` | Primary key |
| `user_id` | `integer` | ID người dùng |
| `option` | `enum` | 'deposit' hoặc 'withdraw' |
| `address` | `varchar` | Địa chỉ ví đích |
| `coin_name` | `varchar` | Tên coin |
| `currency_symbol` | `varchar` | Ký hiệu coin |
| `amount` | `decimal(18,8)` | Số lượng |
| `tx_hash` | `varchar` | Transaction hash |
| `status` | `enum` | 'pending', 'success', 'failed', 'cancel', 'checked' |
| `note` | `varchar` | Ghi chú |
| `created_at` | `timestamp` | Thời gian tạo |

## 🔗 API Endpoints

### Rút tiền

- `POST /wallet-histories/withdraw` - Rút SOL/USDT (Auth required)

### Lịch sử rút tiền

- `GET /wallet-histories/withdraw-history` - Lịch sử rút tiền (Auth required)

### Query Parameters cho lịch sử

- `search` - Tìm kiếm theo địa chỉ, tên coin, symbol, tx_hash
- `status` - Lọc theo trạng thái: 'pending', 'success', 'failed', 'cancel', 'checked' (default: 'success')
- `currency_symbol` - Lọc theo loại tiền (SOL, USDT, ...)
- `page` - Trang hiện tại (default: 1)
- `limit` - Số lượng per page (default: 10)
- `sortBy` - Sắp xếp theo: 'created_at', 'amount', 'status' (default: 'created_at')
- `sortOrder` - Thứ tự: 'ASC', 'DESC' (default: 'DESC')

## 📝 TODO

- [ ] Implement SOL withdrawal logic
- [ ] Implement USDT withdrawal logic
- [ ] Implement wallet history queries
- [ ] Add balance checking functionality
- [ ] Add transaction validation
- [ ] Add error handling
- [ ] Add logging
- [ ] Add tests

## 🔧 Dependencies

- TypeORM
- Solana Web3.js
- SPL Token library
- JWT Authentication
