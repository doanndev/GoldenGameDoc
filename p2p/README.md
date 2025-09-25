# P2P Order Books API Documentation

Module quản lý hệ thống giao dịch peer-to-peer (P2P) cho ứng dụng Golden Game.

## 📁 Cấu trúc

```
p2p/
├── order-book.entity.ts          # Entity cho bảng order_books
├── order-book.dto.ts             # DTOs cho API validation và response
├── order-book.service.ts         # Business logic chính
├── order-book.controller.ts      # API endpoints
├── order-book.module.ts          # Module configuration
├── transaction.entity.ts         # Entity cho bảng transactions
├── transaction.dto.ts            # DTOs cho transaction API
├── transaction.service.ts        # Business logic giao dịch
├── transaction.controller.ts     # Transaction API endpoints
├── blockchain.service.ts         # Tích hợp Solana blockchain
└── README.md                     # Tài liệu API
```

## 🚀 API Endpoints

### 1. Tạo Order Book (Quảng cáo mua/bán)

**POST** `/p2p/order-books`

Tạo quảng cáo mua/bán MPB với coin khác.

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Request Body
```json
{
  "option": "buy",
  "coin_symbol": "USDT",                    
  "amount": 200.0,
  "price": 0.4,
  "price_min": 0.0031,
  "price_max": 0.06
}
```

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `option` | string | Yes | Loại giao dịch: `"buy"` hoặc `"sell"` |
| `coin_symbol` | string | Yes | Symbol coin đối tác (chỉ hỗ trợ: "USDT", "SOL") |
| `amount` | number | Yes | Số lượng MPB muốn mua/bán |
| `price` | number | Yes | Giá mỗi đơn vị |
| `price_min` | number | Yes | Giá tối thiểu chấp nhận |
| `price_max` | number | Yes | Giá tối đa chấp nhận |

#### Response Success (201)
```json
{
    "user_id": 142859,
    "coin_id": 3,
    "adv_code": "K0QHEMMF",
    "option": "buy",
    "coin_buy": null,
    "coin_sell": 2,
    "amount": 200,
    "amount_remaining": 200,
    "price": 0.4,
    "price_min": 0.0031,
    "price_max": 0.06,
    "main_wallet_id": 285716,
    "import_wallet_id": null,
    "status": "pending",
    "tx_hash": "5dXJpHzCr1BxuvKc8M16TncnxXoEYtZfWmmar2gErbohGo9p58dSpPABxJHDG9NaG7cb4RXiQ6ZgK1NL1arf9P7L",
    "id": 98,
    "created_at": "2025-09-22T10:33:44.490Z"
}
```

#### Response Errors

**400 Bad Request**
- `price_min cannot be greater than price_max`
- `MPB coin not found or inactive`
- `Coin with symbol 'SYMBOL' not found or inactive`
- `Wallet address not found or not owned by user`

**401 Unauthorized**
- `Unauthorized`

**422 Validation Error**
- `option must be one of the following values: buy, sell`
- `coin_symbol only supports USDT or SOL`
- `amount must be a positive number`

**500 Internal Server Error**
- `Unable to generate unique advertisement code after multiple attempts`

#### Ví dụ sử dụng

**Bán MPB lấy USDT:**
```bash
curl -X POST http://localhost:3000/p2p/order-books \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "option": "sell",
    "coin_symbol": "USDT",
    "amount": 1000,
    "price": 0.1,
    "price_min": 0.09,
    "price_max": 0.11
  }'
```

**Mua MPB bằng SOL:**
```bash
curl -X POST http://localhost:3000/p2p/order-books \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "option": "buy",
    "coin_symbol": "SOL",
    "amount": 100,
    "price": 0.05,
    "price_min": 0.04,
    "price_max": 0.06
  }'
```

---

### 2. Lấy danh sách Order Books

**GET** `/p2p/order-books`

Lấy danh sách order books với khả năng filter, search và pagination.

#### Headers
```
Content-Type: application/json
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `coin_id` | number | No | - | Filter theo ID coin chính |
| `option` | string | No | - | Filter theo loại: `"buy"` hoặc `"sell"` |
| `coin_buy` | string | No | - | Filter theo symbol coin mua (VD: "USDT") |
| `coin_sell` | string | No | - | Filter theo symbol coin bán (VD: "SOL") |
| `payment_coin` | string | No | - | Filter theo coin thanh toán: "USDT" hoặc "SOL" |
| `price_min` | number | No | - | Giá tối thiểu |
| `price_max` | number | No | - | Giá tối đa |
| `status` | string | No | `"pending"` | Trạng thái: `"pending"`, `"executed"`, `"failed"` |
| `search` | string | No | - | Tìm kiếm theo adv_code, username, fullname |
| `reverse_view` | boolean | No | `true` | Hiển thị option từ góc độ người xem |
| `page` | number | No | `1` | Trang hiện tại |
| `limit` | number | No | `10` | Số item/trang (max: 100) |

#### Response Success (200)
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "coin_id": 3,
      "adv_code": "ABC12345",
      "option": "sell",
      "coin_buy": 2,
      "coin_sell": null,
      "amount": 1000,
      "amount_remaining": 0,
      "price": 0.1,
      "price_min": 0.09,
      "price_max": 0.11,
      "main_wallet_id": 1,
      "import_wallet_id": null,
      "status": "executed",
      "tx_hash": "5J7K8L9M...",
      "created_at": "2024-01-15T10:30:00Z",
      "user": {
        "id": 123,
        "username": "user123",
        "fullname": "John Doe"
      },
      "coin": {
        "id": 3,
        "name": "MPB Token",
        "symbol": "MPB",
        "logo": "https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=MPB"
      },
      "payment_coin": {
        "id": 2,
        "name": "Tether USD",
        "symbol": "USDT",
        "logo": "https://..."
      },
      "main_wallet": {
        "id": 1,
        "address": "ABC123...",
        "name": "Main Wallet"
      },
      "import_wallet": null
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

#### Ví dụ sử dụng

**Lấy tất cả order books đã thực hiện:**
```bash
curl -X GET "http://localhost:3000/p2p/order-books"
```

**Filter theo option và coin:**
```bash
curl -X GET "http://localhost:3000/p2p/order-books?option=sell&coin_buy=USDT&status=executed"
```

**Tìm kiếm theo keyword:**
```bash
curl -X GET "http://localhost:3000/p2p/order-books?search=ABC12345"
```

**Filter theo khoảng giá:**
```bash
curl -X GET "http://localhost:3000/p2p/order-books?price_min=0.1&price_max=0.2"
```

**Pagination:**
```bash
curl -X GET "http://localhost:3000/p2p/order-books?page=2&limit=20"
```

**Filter theo coin thanh toán:**
```bash
curl -X GET "http://localhost:3000/p2p/order-books?payment_coin=USDT"
```

**Hiển thị từ góc độ người tạo quảng cáo:**
```bash
curl -X GET "http://localhost:3000/p2p/order-books?reverse_view=false"
```

**Kết hợp nhiều filter:**
```bash
curl -X GET "http://localhost:3000/p2p/order-books?option=sell&coin_buy=USDT&price_min=0.1&price_max=0.2&status=executed&reverse_view=true&page=1&limit=10"
```

---

### 3. Tạo Giao dịch P2P

**POST** `/p2p/transactions`

Tạo giao dịch P2P từ một order book có sẵn.

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Request Body
```json
{
  "amount": 100.0,
  "order_book_id": 98,
  "message": "Giao dịch nhanh"
}
```

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Số lượng MPB muốn giao dịch (phải > 0) |
| `order_book_id` | number | Yes | ID của order book muốn giao dịch |
| `message` | string | No | Tin nhắn tùy chọn cho giao dịch |

#### Response Success (201)
```json
{
    "reference_code": "M54ZCIFV",
    "user_buy_id": 142857,
    "user_sell_id": 142859,
    "coin_buy_id": 3,
    "coin_sell_id": 2,
    "order_book_id": 359,
    "option": "buy",
    "amount": 12,
    "price_sol": "10",
    "price_usd": "10",
    "total_sol": 120,
    "total_usd": 120,
    "tx_hash": null,
    "status": "pending",
    "message": null,
    "wallet_address": "7iVkjCipYtpLdEToJVVWwzTRz5aox12V3veEfKRXYACK",
    "id": 63,
    "created_at": "2025-09-25T06:42:44.796Z"
}
```

#### Response Errors

**400 Bad Request**
- `Order book not found`
- `Cannot create transaction with your own order book`
- `Total price X is out of range. Must be between Y and Z`
- `No amount available for transaction. Order book is empty or amount remaining is 0`
- `Order book coin_sell is null - cannot determine payment coin`
- `Order book coin_buy is null - cannot determine payment coin`
- `User buy not found`
- `User sell not found`
- `Coin buy not found or inactive`
- `Coin sell not found or inactive`

**401 Unauthorized**
- `Unauthorized`

**422 Validation Error**
- `amount must be a positive number`
- `order_book_id must be a positive number`

**500 Internal Server Error**
- `Unable to generate unique reference code after multiple attempts`

#### Ví dụ sử dụng

**Mua MPB từ order book:**
```bash
curl -X POST http://localhost:3000/p2p/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "order_book_id": 98,
    "message": "Mua MPB với giá tốt"
  }'
```

**Bán MPB cho order book:**
```bash
curl -X POST http://localhost:3000/p2p/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "order_book_id": 99
  }'
```

---

## 🔧 Tính năng chính

### Order Book Management
- **Tạo quảng cáo**: User có thể tạo quảng cáo mua/bán MPB
- **Tự động nhận diện**: Service tự động xác định coin dựa trên option
- **Mã quảng cáo duy nhất**: Tự động tạo mã 8 ký tự không trùng lặp
- **Blockchain integration**: Tự động tạo smart contract trên Solana
- **Góc độ hiển thị**: Mặc định hiển thị từ góc độ người xem (reverse_view=true)

### Transaction Management
- **Tạo giao dịch**: User có thể tạo giao dịch từ order book có sẵn
- **Tự động xác định vai trò**: Service tự động xác định user là buyer hay seller
- **Validation nghiêm ngặt**: Kiểm tra price range, amount available, user permissions
- **Mã tham chiếu duy nhất**: Tự động tạo mã 8 ký tự không trùng lặp
- **Tính toán giá tự động**: Tự động tính price_sol, price_usd, total_sol, total_usd
- **Bảo vệ khỏi self-trading**: Không cho phép user giao dịch với chính order book của mình

### Advanced Filtering
- **Multi-field search**: Tìm kiếm trong adv_code, username, fullname
- **Price range**: Filter theo khoảng giá
- **Status filtering**: Lọc theo trạng thái giao dịch
- **Coin filtering**: Filter theo coin chính và coin đối tác
- **Payment coin filtering**: Filter theo coin thanh toán (USDT/SOL)
- **View perspective**: Hiển thị option từ góc độ người xem hoặc người tạo

### Pagination
- **Flexible pagination**: Hỗ trợ page/limit
- **Metadata**: Thông tin chi tiết về pagination
- **Performance**: Query tối ưu với skip/take

## 📊 Database Schema

### Bảng `order_books`

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | `integer` | Primary key |
| `user_id` | `integer` | ID người tạo order |
| `coin_id` | `integer` | ID coin chính (luôn là MPB) |
| `adv_code` | `varchar(8)` | Mã quảng cáo duy nhất |
| `option` | `enum` | 'buy' hoặc 'sell' |
| `coin_buy` | `integer` | ID coin nhận (nếu option = 'sell') |
| `coin_sell` | `integer` | ID coin dùng để mua (nếu option = 'buy') |
| `amount` | `decimal` | Số lượng |
| `amount_remaining` | `decimal` | Số lượng còn lại |
| `price` | `decimal` | Giá |
| `price_min` | `decimal` | Giá tối thiểu |
| `price_max` | `decimal` | Giá tối đa |
| `main_wallet_id` | `integer` | ID ví chính |
| `import_wallet_id` | `integer` | ID ví import |
| `status` | `enum` | 'draft', 'pending', 'executed', 'failed' |
| `tx_hash` | `varchar` | Hash giao dịch blockchain |
| `created_at` | `timestamptz` | Thời gian tạo |

## 🔒 Authentication

- **POST /p2p/order-books**: Yêu cầu JWT token
- **GET /p2p/order-books**: Không yêu cầu authentication
- **POST /p2p/transactions**: Yêu cầu JWT token

## ⚡ Performance

- **Database indexing**: Các trường thường query được index
- **Query optimization**: Sử dụng QueryBuilder tối ưu
- **Pagination**: Giới hạn số lượng record trả về
- **Caching**: Có thể cache kết quả query phổ biến

## 🛡️ Security

- **Input validation**: Validate tất cả input với class-validator
- **Coin symbol validation**: Chỉ cho phép USDT và SOL
- **SQL injection protection**: Sử dụng parameterized queries
- **Rate limiting**: Có thể áp dụng rate limiting
- **JWT authentication**: Bảo mật API endpoints

## 📝 Error Handling

- **Validation errors**: 400 Bad Request với message chi tiết
- **Not found errors**: 404 Not Found
- **Server errors**: 500 Internal Server Error
- **Consistent format**: Tất cả error đều có format nhất quán

## 🎯 Use Cases

1. **Người bán MPB**: Tạo order book với option "sell"
2. **Người mua MPB**: Tìm order book với option "buy" 
3. **Thực hiện giao dịch**: Tạo transaction từ order book có sẵn
4. **Bảo mật giao dịch**: Hệ thống tự động validate và bảo vệ khỏi lỗi

Module này tạo ra một hệ thống P2P trading hoàn chỉnh với tích hợp blockchain, cho phép người dùng giao dịch MPB một cách an toàn và minh bạch!
