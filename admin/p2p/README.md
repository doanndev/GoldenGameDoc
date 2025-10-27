# Admin P2P Management API

Module quản lý hệ thống P2P (Order Books & Transactions) cho Admin.

## 📁 Cấu trúc

```
admin/p2p/
├── p2p.controller.ts      # API endpoints
├── p2p.service.ts         # Business logic
├── p2p.dto.ts            # DTOs definitions
├── p2p.module.ts         # Module configuration
└── README.md             # Documentation
```

## 🚀 API Endpoints

### 1. Lấy danh sách Order Books

**GET** `/admin/p2p/order-books`

Lấy danh sách các quảng cáo mua/bán P2P với khả năng filter, search và pagination.

#### Headers
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `coin_id` | number | No | - | Filter theo ID coin chính (MPB) |
| `option` | enum | No | - | Loại: `"buy"` hoặc `"sell"` |
| `coin_buy` | string | No | - | Filter theo symbol coin mua (VD: "USDT") |
| `coin_sell` | string | No | - | Filter theo symbol coin bán (VD: "SOL") |
| `price_min` | number | No | - | Giá tối thiểu |
| `price_max` | number | No | - | Giá tối đa |
| `status` | enum | No | `"pending"` | Trạng thái: `"draft"`, `"pending"`, `"executed"`, `"failed"` |
| `search` | string | No | - | Tìm kiếm theo adv_code, username, fullname |
| `payment_coin` | string | No | - | Filter theo coin thanh toán: "USDT" hoặc "SOL" |
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
      "amount_remaining": 500,
      "price": 0.1,
      "price_min": 0.09,
      "price_max": 0.11,
      "main_wallet_id": 1,
      "import_wallet_id": null,
      "status": "pending",
      "tx_hash": "5J7K8L9M...",
      "created_at": "2024-01-15T10:30:00Z",
      "user": {
        "id": 123,
        "username": "user123",
        "fullname": "John Doe"
      },
      "coin": {
        "id": 3,
        "name": "MPB",
        "symbol": "MPB",
        "logo": "https://..."
      },
      "payment_coin": {
        "id": 2,
        "name": "Tether",
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
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 2. Lấy lịch sử giao dịch P2P

**GET** `/admin/p2p/transactions`

Lấy danh sách các giao dịch P2P với khả năng filter, search và pagination.

#### Headers
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `user_buy_id` | number | No | - | Filter theo ID người mua |
| `user_sell_id` | number | No | - | Filter theo ID người bán |
| `coin_buy_id` | number | No | - | Filter theo ID coin mua |
| `coin_sell_id` | number | No | - | Filter theo ID coin bán |
| `order_book_id` | number | No | - | Filter theo ID order book |
| `option` | enum | No | - | Loại: `"buy"` hoặc `"sell"` |
| `status` | enum | No | - | Trạng thái: `"pending"`, `"executed"`, `"failed"`, `"cancelled"` |
| `search` | string | No | - | Tìm kiếm theo reference_code, username, fullname |
| `date_from` | string | No | - | Ngày bắt đầu (YYYY-MM-DD) |
| `date_to` | string | No | - | Ngày kết thúc (YYYY-MM-DD) |
| `page` | number | No | `1` | Trang hiện tại |
| `limit` | number | No | `10` | Số item/trang (max: 100) |

#### Response Success (200)

```json
{
  "data": [
    {
      "id": 1,
      "reference_code": "ABC12345",
      "user_buy_id": 100,
      "user_sell_id": 200,
      "coin_buy_id": 2,
      "coin_sell_id": 3,
      "order_book_id": 50,
      "option": "buy",
      "amount": 100,
      "price": 0.1,
      "total_sol": 0.5,
      "total_usd": 50,
      "tx_hash": "DEF45678...",
      "status": "executed",
      "message": "Transaction completed successfully",
      "wallet_address": "XYZ789...",
      "created_at": "2024-01-15T10:30:00Z",
      "user_buy": {
        "id": 100,
        "username": "buyer",
        "fullname": "Buyer Name"
      },
      "user_sell": {
        "id": 200,
        "username": "seller",
        "fullname": "Seller Name"
      },
      "coin_buy": {
        "id": 3,
        "name": "MPB",
        "symbol": "MPB",
        "logo": "https://..."
      },
      "coin_sell": {
        "id": 2,
        "name": "Tether",
        "symbol": "USDT",
        "logo": "https://..."
      },
      "coin_trading": {
        "id": 3,
        "name": "MPB",
        "symbol": "MPB",
        "logo": "https://..."
      },
      "coin_payment": {
        "id": 2,
        "name": "Tether",
        "symbol": "USDT",
        "logo": "https://..."
      },
      "order_book": {
        "id": 50,
        "adv_code": "XYZ789",
        "option": "buy",
        "amount": 200,
        "price": 0.1
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 200,
    "totalPages": 20,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 3. Lấy thống kê P2P

**GET** `/admin/p2p/stats`

Lấy thống kê tổng quan về hệ thống P2P.

#### Headers
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

#### Query Parameters
Không có query parameters.

#### Response Success (200)

```json
{
  "data": {
    "total_order_books": 100,
    "total_transactions": 500,
    "total_transaction_amount": 125000.50,
    "pending_order_books": 30,
    "executed_order_books": 60,
    "executed_transactions": 450,
    "failed_transactions": 10,
    "total_users_with_orders": 50,
    "total_users_with_transactions": 200
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `total_order_books` | number | Tổng số order books |
| `total_transactions` | number | Tổng số transactions |
| `total_transaction_amount` | number | Tổng số tiền giao dịch (USD) - chỉ tính executed |
| `pending_order_books` | number | Số order books đang pending |
| `executed_order_books` | number | Số order books đã executed |
| `executed_transactions` | number | Số transactions thành công |
| `failed_transactions` | number | Số transactions thất bại |
| `total_users_with_orders` | number | Số users đã tạo order book |
| `total_users_with_transactions` | number | Số users tham gia giao dịch |

---

## 📋 Business Logic

### Order Books Management
- ✅ Xem tất cả quảng cáo mua/bán
- ✅ Filter theo user, coin, option, status
- ✅ Search theo adv_code, username, email
- ✅ Filter theo payment coin (USDT/SOL)
- ✅ Filter theo khoảng thời gian
- ✅ Pagination với stats tổng quan
- ✅ Reverse view cho góc nhìn người xem

### Transactions Management
- ✅ Xem tất cả giao dịch P2P
- ✅ Filter theo user mua/bán
- ✅ Filter theo coin, option, status
- ✅ Search theo reference_code, username
- ✅ Filter theo khoảng thời gian
- ✅ Pagination với stats tổng quan
- ✅ Hiển thị coin trading và coin payment

### Statistics
- ✅ Thống kê tổng quan hệ thống
- ✅ Thống kê theo trạng thái
- ✅ Thống kê số tiền giao dịch
- ✅ Thống kê users tham gia

---

## 🔐 Security

- **Admin Authentication**: Yêu cầu Admin JWT token
- **Permission Guard**: Chỉ Super Admin và Admin có quyền truy cập
- **Logging**: Tất cả actions đều được log vào `admin_logs` table

---

## 📊 Example Usage

### Lấy order books đang pending
```bash
curl -X GET 'http://localhost:3000/admin/p2p/order-books?status=pending&page=1&limit=20' \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Tìm kiếm order book theo adv_code
```bash
curl -X GET 'http://localhost:3000/admin/p2p/order-books?search=ABC123' \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Lấy transactions executed trong tháng 1/2024
```bash
curl -X GET 'http://localhost:3000/admin/p2p/transactions?status=executed&date_from=2024-01-01&date_to=2024-01-31' \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Lấy transactions của user cụ thể
```bash
curl -X GET 'http://localhost:3000/admin/p2p/transactions?user_buy_id=100' \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Lấy thống kê P2P
```bash
curl -X GET 'http://localhost:3000/admin/p2p/stats' \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

## 🔍 Advanced Features

### Search Functionality
- Tìm kiếm theo adv_code, reference_code (chính xác hoặc một phần)
- Tìm kiếm theo username, fullname, email (không phân biệt hoa/thường)
- Escape ký tự đặc biệt để tránh SQL injection

### Filter Options
- **Status**: `draft`, `pending`, `executed`, `failed`, `cancelled`
- **Option**: `buy` (mua), `sell` (bán)
- **Payment Coin**: `USDT`, `SOL`
- **Price Range**: `price_min` - `price_max`

### Pagination
- Default: page 1, limit 10
- Max limit: 100 items/page
- Thông tin pagination bao gồm:
  - `page`: Trang hiện tại
  - `limit`: Số items/trang
  - `total`: Tổng số items
  - `totalPages`: Tổng số trang
  - `hasNext`: Có trang tiếp theo?
  - `hasPrev`: Có trang trước?

### Reverse View
- Khi `reverse_view=true`, API tự động đảo ngược option
- Ví dụ: Nếu user tạo order book "buy", hiển thị là "sell" từ góc độ người xem
- Mặc định: `reverse_view=true`

---

## 📝 Notes

- Tất cả endpoints yêu cầu Admin authentication
- Search hỗ trợ tìm kiếm theo số (ID) hoặc text (username, email)
- Date range filter hỗ trợ định dạng YYYY-MM-DD
- Stats được tính real-time từ database
- Admin actions được log tự động vào admin_logs table
- Mặc định chỉ lấy order books có amount_remaining > 0

---

## 🚨 Error Handling

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "price_min cannot be greater than price_max",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied",
  "error": "Forbidden"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error occurred...",
  "error": "Internal Server Error"
}
```

