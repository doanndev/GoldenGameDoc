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

### 1. Rút tiền
**POST** `/wallet-histories/withdraw`

Rút SOL hoặc USDT từ ví người dùng.

**Headers:**
- `Authorization: Bearer <access_token>` hoặc access_token cookie
- `Content-Type: application/json`

**Request Body:**
```json
{
  "wallet_address_to": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "currency_symbol": "SOL",
  "amount": 0.001
}
```

**Request Body Fields:**
- `wallet_address_to` (string, required) - Địa chỉ ví đích nhận tiền
- `currency_symbol` (string, required) - Ký hiệu coin: "SOL" hoặc "USDT"
- `amount` (number, required) - Số lượng cần rút (phải > 0)

**Response Success (200):**
```json
{
  "status": "success",
  "message": "Withdrawal completed successfully"
}
```

**Response Error (400):**
```json
{
  "statusCode": 400,
  "message": "Insufficient balance",
  "error": "Bad Request"
}
```

**Các loại lỗi có thể xảy ra:**

**400 Bad Request:**
- `"Coin {currency_symbol} not found or inactive"` - Coin không tồn tại hoặc không active
- `"Insufficient balance"` - Số dư không đủ (từ wallet-history.service.ts)
- `"Insufficient SOL balance. Required: {required} SOL, Available: {available} SOL"` - Số dư SOL không đủ (bao gồm phí giao dịch)
- `"Token account not found"` - Không tìm thấy token account
- `"Token mint not found"` - Không tìm thấy token mint
- `"Insufficient token balance. Required: {required}, Available: {available}"` - Số dư token không đủ
- `"Insufficient SOL balance for transaction fee"` - Không đủ SOL để trả phí giao dịch
- `"Source token account not found"` - Không tìm thấy source token account
- `"Failed to get token balance: {error}"` - Lỗi khi lấy số dư token
- `"Failed to get mint info: {error}"` - Lỗi khi lấy thông tin mint
- `"Insufficient SOL for ATA creation. Need at least {fee} SOL, but only have {balance} SOL."` - Không đủ SOL để tạo ATA

**500 Internal Server Error:**
- `"Internal server error occurred during withdrawal error: {error.message}"` - Lỗi server không xác định
- `"SOLANA_RPC_URL is not configured in environment variables"` - Chưa cấu hình RPC URL

**Status Codes:**
- `200` - Rút tiền thành công
- `400` - Bad Request (các lỗi validation và business logic)
- `401` - Unauthorized (invalid or missing token)
- `500` - Internal server error

---

### 2. Lịch sử rút tiền
**GET** `/wallet-histories/withdraw-history`

Lấy lịch sử các giao dịch rút tiền với pagination và filtering.

**Headers:**
- `Authorization: Bearer <access_token>` hoặc access_token cookie

**Query Parameters:**
- `search` (string, optional) - Tìm kiếm theo địa chỉ, tên coin, symbol, tx_hash
- `status` (string, optional) - Lọc theo trạng thái: 'pending', 'success', 'failed', 'cancel', 'checked' (default: 'success')
- `currency_symbol` (string, optional) - Lọc theo loại tiền (SOL, USDT, ...)
- `page` (number, optional) - Trang hiện tại (default: 1)
- `limit` (number, optional) - Số lượng per page (default: 10, max: 100)
- `sortBy` (string, optional) - Sắp xếp theo: 'created_at', 'amount', 'status' (default: 'created_at')
- `sortOrder` (string, optional) - Thứ tự: 'ASC', 'DESC' (default: 'DESC')

**Ví dụ Request:**
```
GET /wallet-histories/withdraw-history?search=SOL&status=success&page=1&limit=10&sortBy=created_at&sortOrder=DESC
```

**Response Success (200):**
```json
{
  "data": [
    {
      "id": 1,
      "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      "coin_name": "Solana",
      "currency_symbol": "SOL",
      "amount": 0.001,
      "tx_hash": "5Kb8kLf9CwWJ8Y...",
      "status": "success",
      "note": "Withdraw 0.001 SOL to 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Response Fields:**
- `data[]` - Mảng các giao dịch rút tiền
  - `id` (number) - ID giao dịch
  - `address` (string) - Địa chỉ ví đích
  - `coin_name` (string) - Tên coin
  - `currency_symbol` (string) - Ký hiệu coin
  - `amount` (number) - Số lượng rút
  - `tx_hash` (string|null) - Hash giao dịch blockchain
  - `status` (string) - Trạng thái giao dịch
  - `note` (string) - Ghi chú giao dịch
  - `created_at` (string) - Thời gian tạo
- `pagination` - Thông tin phân trang
  - `page` (number) - Trang hiện tại
  - `limit` (number) - Số item mỗi trang
  - `total` (number) - Tổng số giao dịch
  - `totalPages` (number) - Tổng số trang
  - `hasNext` (boolean) - Có trang tiếp theo
  - `hasPrev` (boolean) - Có trang trước

**Status Codes:**
- `200` - Lấy lịch sử thành công
- `401` - Unauthorized (invalid or missing token)

## 📋 DTOs (Data Transfer Objects)

### WithdrawDto
```typescript
{
  wallet_address_to: string;  // Địa chỉ ví đích (required)
  currency_symbol: string;    // Ký hiệu coin: "SOL" hoặc "USDT" (required)
  amount: number;             // Số lượng rút (required, > 0)
}
```

### WithdrawResponseDto
```typescript
{
  status: string;    // "success"
  message: string;   // "Withdrawal completed successfully"
}
```

### GetWithdrawHistoryDto
```typescript
{
  search?: string;           // Tìm kiếm (optional)
  status?: string;           // Lọc theo trạng thái (optional, default: 'success')
  currency_symbol?: string;  // Lọc theo coin (optional)
  page?: number;             // Trang hiện tại (optional, default: 1)
  limit?: number;            // Số lượng per page (optional, default: 10)
  sortBy?: string;           // Sắp xếp theo (optional, default: 'created_at')
  sortOrder?: string;        // Thứ tự (optional, default: 'DESC')
}
```

### WithdrawHistoryResponseDto
```typescript
{
  id: number;
  address: string;
  coin_name: string;
  currency_symbol: string;
  amount: number;
  tx_hash: string | null;
  status: string;
  note: string;
  created_at: Date;
}
```

### PaginatedWithdrawHistoryResponseDto
```typescript
{
  data: WithdrawHistoryResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

## 📝 Ví dụ sử dụng

### Rút SOL
```bash
curl -X POST "http://localhost:3000/wallet-histories/withdraw" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address_to": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "currency_symbol": "SOL",
    "amount": 0.001
  }'
```

### Rút USDT
```bash
curl -X POST "http://localhost:3000/wallet-histories/withdraw" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address_to": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "currency_symbol": "USDT",
    "amount": 10.5
  }'
```

### Lấy lịch sử rút tiền
```bash
curl -X GET "http://localhost:3000/wallet-histories/withdraw-history?status=success&page=1&limit=10" \
  -H "Authorization: Bearer your_jwt_token"
```

### Tìm kiếm lịch sử
```bash
curl -X GET "http://localhost:3000/wallet-histories/withdraw-history?search=SOL&currency_symbol=SOL&sortBy=created_at&sortOrder=DESC" \
  -H "Authorization: Bearer your_jwt_token"
```

## ⚠️ Lưu ý quan trọng

### Validation Rules
- **wallet_address_to**: Phải là địa chỉ Solana hợp lệ
- **currency_symbol**: Chỉ chấp nhận "SOL" hoặc "USDT"
- **amount**: Phải là số dương và có độ chính xác phù hợp

### Error Handling

#### 400 Bad Request - Validation & Business Logic Errors
- **Coin validation**: `"Coin {currency_symbol} not found or inactive"`
- **Balance checks**: 
  - `"Insufficient balance"` (generic)
  - `"Insufficient SOL balance. Required: {required} SOL, Available: {available} SOL"`
  - `"Insufficient token balance. Required: {required}, Available: {available}"`
  - `"Insufficient SOL balance for transaction fee"`
- **Token account errors**:
  - `"Token account not found"`
  - `"Source token account not found"`
  - `"Token mint not found"`
- **ATA creation errors**:
  - `"Insufficient SOL for ATA creation. Need at least {fee} SOL, but only have {balance} SOL."`
- **Blockchain errors**:
  - `"Failed to get token balance: {error}"`
  - `"Failed to get mint info: {error}"`

#### 401 Unauthorized
- Token không hợp lệ hoặc hết hạn
- Thiếu Authorization header

#### 500 Internal Server Error
- `"Internal server error occurred during withdrawal error: {error.message}"` - Lỗi không xác định
- `"SOLANA_RPC_URL is not configured in environment variables"` - Cấu hình thiếu

### Blockchain Integration
- Tự động kiểm tra số dư trước khi rút
- Hỗ trợ cả SOL native và SPL tokens (USDT)
- Xử lý transaction fees tự động
- Cập nhật trạng thái giao dịch real-time
- Hỗ trợ cả SPL Token và Token-2022 standards

### Các trường hợp lỗi thường gặp

#### 1. Lỗi số dư không đủ
```json
{
  "statusCode": 400,
  "message": "Insufficient SOL balance. Required: 0.001005 SOL, Available: 0.001 SOL",
  "error": "Bad Request"
}
```
**Giải pháp**: Người dùng cần nạp thêm SOL để đủ cho số tiền rút + phí giao dịch

#### 2. Lỗi token account không tồn tại
```json
{
  "statusCode": 400,
  "message": "Token account not found",
  "error": "Bad Request"
}
```
**Giải pháp**: Người dùng cần có token account trước khi rút token

#### 3. Lỗi không đủ SOL để tạo ATA
```json
{
  "statusCode": 400,
  "message": "Insufficient SOL for ATA creation. Need at least 0.002 SOL, but only have 0.001 SOL.",
  "error": "Bad Request"
}
```
**Giải pháp**: Người dùng cần nạp thêm SOL để tạo Associated Token Account

#### 4. Lỗi coin không tồn tại
```json
{
  "statusCode": 400,
  "message": "Coin USDT not found or inactive",
  "error": "Bad Request"
}
```
**Giải pháp**: Kiểm tra coin có tồn tại và active trong database

## ✅ Tính năng đã triển khai

- [x] **SOL withdrawal logic** - Rút SOL từ ví người dùng
- [x] **USDT withdrawal logic** - Rút USDT (SPL Token) từ ví
- [x] **Wallet history queries** - Lấy lịch sử rút tiền với pagination
- [x] **Balance checking** - Kiểm tra số dư trước khi rút
- [x] **Transaction validation** - Xác thực giao dịch blockchain
- [x] **Error handling** - Xử lý lỗi toàn diện
- [x] **Logging** - Ghi log chi tiết cho debugging
- [x] **Blockchain integration** - Tích hợp với Solana blockchain
- [x] **JWT Authentication** - Xác thực người dùng

## 🔧 Dependencies

- **@nestjs/common** - NestJS core functionality
- **@nestjs/typeorm** - Database ORM integration
- **@solana/web3.js** - Solana blockchain SDK
- **@solana/spl-token** - SPL Token operations
- **bs58** - Base58 encoding/decoding
- **class-validator** - Request validation
- **class-transformer** - Data transformation

## 🔗 Tích hợp với modules khác

### Auth Module
- Sử dụng JWT token để xác thực người dùng
- Lấy thông tin ví từ JWT payload

### Wallets Module
- Sử dụng `WalletService` để lấy private key
- Tích hợp với ví chính và ví import

### Coins Module
- Sử dụng `Coin` entity để lấy thông tin coin
- Kiểm tra coin có active không

### Blockchain Service
- Service chuyên xử lý các thao tác Solana blockchain
- Kiểm tra số dư và thực hiện giao dịch
