# Swaps Module - API Documentation

## Tổng quan
Module Swaps cho phép người dùng thực hiện giao dịch hoán đổi token giữa SOL/USDT và MPB trên blockchain Solana. Module này cung cấp các API để tạo swap orders, kiểm tra trạng thái và lấy lịch sử giao dịch.

## UC-07: Swap MPB từ SOL/USDT

### Thông tin cơ bản
- **Actor**: User
- **Priority**: High
- **Description**: User swap SOL/USDT sang MPB

### Pre-condition
- User đã kết nối ví
- Có SOL/USDT trong ví
- User đã xác thực JWT token

### Trigger
User chọn "Swap" và gửi request tạo swap order

### Main Flow
1. User nhập số lượng token muốn swap
2. System kiểm tra số dư ví
3. System tính tỷ giá và tạo swap order với trạng thái PENDING
4. Swap order được lưu vào database
5. User nhận được thông tin swap order

### Alternative Flow
**[AF-01]** Nếu số dư không đủ → báo lỗi "Insufficient balance"
**[AF-02]** Nếu input amount <= 0 → báo lỗi "Input amount must be greater than 0"
**[AF-03]** Nếu token không được hỗ trợ → báo lỗi "Unsupported token type"

### Post-condition
Swap order được tạo thành công với trạng thái PENDING

## Mô tả tổng quan

```
User Swap SOL hoặc USDT sang MPB qua Smart Contract Pool.
System kiểm tra số dư và tính toán tỷ giá.
Swap order được tạo và lưu vào database với trạng thái PENDING.
User có thể xem chi tiết các giao dịch Swap MPB ↔ SOL/USDT.
Nếu số dư không đủ → báo lỗi.
-> Swap order được tạo thành công.
```

---

## API Endpoints

### Base URL
```
/swaps
```

### Authentication
Tất cả endpoints đều yêu cầu JWT authentication. Thêm header:
```
Authorization: Bearer <jwt_token>
```

---

## Kiểm tra số dư của ví

## 1. Tạo Swap Order

### `POST /swaps`

Tạo swap order từ SOL/USDT sang MPB. Endpoint này tạo một swap order với trạng thái PENDING.

#### Request Body
```json
{
  "input_token": "SOL" | "USDT",
  "output_token": "MPB",
  "input_amount": 1.5
}
```

#### Request Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input_token` | enum | Yes | Token đầu vào: SOL, USDT |
| `output_token` | enum | Yes | Token đầu ra: MPB |
| `input_amount` | number | Yes | Số lượng token đầu vào (phải > 0) |

#### Response Success (200)
```json
{
  "message": "Swap order created successfully",
  "data": {
    "id": 123,
    "amount_send": 1.5,
    "amount_received": 225.375,
    "coin_send": { "symbol": "SOL", "mint": "So11111111111111111111111111111111111111112" },
    "coin_received": { "symbol": "MPB", "mint": "MPB_TOKEN_MINT_ADDRESS" },
    "rate": 150.25,
    "rate_usd_send": 100.16667,
    "rate_usd_received": 150.25,
    "status": "pending",
    "message": "Swap order created successfully",
    "user": { "id": 1, "email": "user@example.com" }
  }
}
```

#### Response Error (400)
```json
{
  "statusCode": 400,
  "message": "Insufficient balance",
  "error": "Bad Request"
}
```

#### Possible Error Messages
- `"Input amount must be greater than 0"`
- `"Wallet address is required"`
- `"Unsupported token type: <token>"`
- `"Insufficient balance"`
- `"Failed to fetch SOL price"`
- `"MPB_USD_PRICE is not configured or invalid"`

---

## 2. Lấy danh sách Swap theo trạng thái và coin

### `GET /swaps`

Lấy danh sách các giao dịch swap theo trạng thái và loại coin.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | enum | No | Trạng thái: pending, executed, failed |
| `page` | number | No | Số trang (mặc định: 1) |
| `limit` | number | No | Số lượng item per page (mặc định: 10) |

#### Example Request
```
GET /swaps?status=pending&page=1&limit=10
```

#### Response Success (200)
```json
{
  "data": [
    {
      "id": 123,
      "amount_send": 1.5,
      "amount_received": 225.375,
      "coin_send": { "symbol": "SOL", "mint": "So11111111111111111111111111111111111111112" },
      "coin_received": { "symbol": "MPB", "mint": "MPB_TOKEN_MINT_ADDRESS" },
      "rate": 150.25,
      "rate_usd_send": 100.16667,
      "rate_usd_received": 150.25,
      "status": "pending",
      "message": "Swap order created successfully",
      "user": { "id": 1, "email": "user@example.com" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## Data Models

### TokenType Enum
```typescript
enum TokenType {
  SOL = 'SOL',
  USDT = 'USDT'
}
```

### OutputTokenType Enum
```typescript
enum OutputTokenType {
  MPB = 'MPB'
}
```

### SwapStatus Enum
```typescript
enum SwapStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  FAILED = 'failed'
}
```

### CreateSwapDto
```typescript
class CreateSwapDto {
  @IsEnum(TokenType)
  input_token: TokenType;        // Token đầu vào: SOL, USDT

  @IsEnum(OutputTokenType)
  output_token: OutputTokenType; // Token đầu ra: MPB

  @IsNumber()
  @Min(0)
  input_amount: number;          // Số lượng token đầu vào
}
```

### Swap Entity
```typescript
interface Swap {
  id: number;                    // ID duy nhất của swap
  user: User;                    // User thực hiện swap
  coin_send: Coin;               // Coin gửi đi
  coin_received: Coin;           // Coin nhận về
  rate: number;                  // Tỷ giá swap
  rate_usd_send: number;         // Giá USD của token gửi
  rate_usd_received: number;     // Giá USD của token nhận
  amount_send: number;           // Số lượng token gửi
  amount_received: number;       // Số lượng token nhận
  status: SwapStatus;            // Trạng thái giao dịch
  message?: string;              // Thông báo/ghi chú
}
```

### Coin Entity
```typescript
interface Coin {
  id: number;                    // ID của coin
  symbol: string;                // Ký hiệu coin (SOL, USDT, MPB)
  name: string;                  // Tên đầy đủ của coin
  mint: string;                  // Mint address trên Solana
  status: 'active' | 'inactive'; // Trạng thái coin
}
```

### Pagination Response
```typescript
interface PaginatedResponse<T> {
  data: T[];                 // Mảng dữ liệu
  pagination: {
    page: number;            // Trang hiện tại
    limit: number;           // Số lượng item per page
    total: number;           // Tổng số records
    totalPages: number;      // Tổng số trang
    hasNext: boolean;        // Có trang tiếp theo
    hasPrev: boolean;        // Có trang trước
  };
}
```

---

## Error Handling

### HTTP Status Codes
- `200 OK`: Request thành công
- `400 Bad Request`: Dữ liệu đầu vào không hợp lệ
- `401 Unauthorized`: Token không hợp lệ hoặc hết hạn
- `500 Internal Server Error`: Lỗi server

### Common Error Responses
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## Business Logic

### Swap Process Flow
1. **Input Validation**: Kiểm tra input token, output token, và amount
2. **Coin Lookup**: Tìm coin entities từ database theo symbol
3. **Balance Check**: Kiểm tra số dư của user trên blockchain
4. **Price Calculation**: Tính giá USD và số lượng token nhận được
5. **Swap Order Creation**: Tạo swap order với trạng thái PENDING
6. **Database Save**: Lưu swap order vào database

### Supported Swap Pairs
- SOL → MPB
- USDT → MPB

### Price Sources
- **SOL**: CoinGecko API (cached 15 giây)
- **USDT**: 1:1 với USD
- **MPB**: Từ environment variable `MPB_USD_PRICE`

### Price Calculation Logic
```typescript
// SOL to MPB
if (inputToken === 'SOL') {
  const solPrice = await getSolPriceUSD(); // From CoinGecko
  rate = solPrice * 1;
  rate_usd_send = inputAmount;
  rate_usd_received = inputAmount * rate;
}

// USDT to MPB
if (inputToken === 'USDT') {
  rate_usd_send = inputAmount;
  rate_usd_received = inputAmount;
}
```

### Balance Check Process
1. Lấy mint address của input token từ database
2. Gọi `blockchainService.checkWalletBalance()` để kiểm tra số dư
3. Nếu số dư <= 0, throw error "Insufficient balance"
4. Nếu số dư < 0.001 SOL, thêm transaction fee vào amount

### Transaction Fees
- **Transaction Fee**: 0.000005 SOL (cố định)
- **ATA Creation Fee**: 0.0025 SOL (nếu cần tạo ATA)
- **Rent Exemption**: ~0.00089 SOL (để duy trì account)

---

## Security Considerations

1. **JWT Authentication**: Tất cả endpoints yêu cầu valid JWT token
2. **Input Validation**: Strict validation cho tất cả input parameters
3. **Balance Verification**: Kiểm tra số dư trước khi thực hiện swap
4. **Transaction Verification**: Xác minh transaction trên blockchain
5. **Error Handling**: Không expose sensitive information trong error messages

---

## Rate Limiting
- Không có rate limiting cụ thể
- Khuyến nghị: Max 10 requests/minute per user

---

## Examples

### Example 1: Tạo Swap Order - 1.5 SOL to MPB
```bash
curl -X POST "https://api.example.com/swaps/make-order-swap" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "input_token": "SOL",
    "output_token": "MPB",
    "input_amount": 1.5
  }'
```

**Response:**
```json
{
  "id": 123,
  "user": { "id": 1 },
  "coin_send": {
    "id": 1,
    "symbol": "SOL",
    "name": "Solana",
    "mint": "So11111111111111111111111111111111111111112"
  },
  "coin_received": {
    "id": 2,
    "symbol": "MPB",
    "name": "MPB Token",
    "mint": "MPB_TOKEN_MINT_ADDRESS"
  },
  "rate": 150.25,
  "rate_usd_send": 150.25,
  "rate_usd_received": 1.0,
  "amount_send": 1.5,
  "amount_received": 225.375,
  "status": "pending",
  "message": null
}
```

### Example 2: Lấy danh sách swap orders
```bash
curl -X GET "https://api.example.com/swaps/get-swaps-by-status-and-coin?status=pending&coin_send=1&coin_received=2&page=1&limit=5" \
  -H "Authorization: Bearer <jwt_token>"
```

**Response:**
```json
{
  "data": [
    {
      "id": 123,
      "amount_send": 1.5,
      "amount_received": 225.375,
      "coin_send": {
        "id": 1,
        "symbol": "SOL",
        "name": "Solana",
        "mint": "So11111111111111111111111111111111111111112"
      },
      "coin_received": {
        "id": 2,
        "symbol": "MPB",
        "name": "MPB Token",
        "mint": "MPB_TOKEN_MINT_ADDRESS"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Example 3: Lấy thông tin swap order theo ID
```bash
curl -X GET "https://api.example.com/swaps/get-swap-by-id?id=123" \
  -H "Authorization: Bearer <jwt_token>"
```

**Response:**
```json
{
  "message": "Swap found",
  "data": {
    "id": 123,
    "user": { "id": 1 },
    "coin_send": {
      "id": 1,
      "symbol": "SOL",
      "name": "Solana",
      "mint": "So11111111111111111111111111111111111111112"
    },
    "coin_received": {
      "id": 2,
      "symbol": "MPB",
      "name": "MPB Token",
      "mint": "MPB_TOKEN_MINT_ADDRESS"
    },
    "rate": 150.25,
    "rate_usd_send": 150.25,
    "rate_usd_received": 1.0,
    "amount_send": 1.5,
    "amount_received": 225.375,
    "status": "pending",
    "message": null
  }
}
```
