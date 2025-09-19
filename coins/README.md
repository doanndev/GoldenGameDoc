# Coin Module

Module quản lý danh sách coin/token trong hệ thống Golden Game.

## 📁 Cấu trúc

```
coins/
├── coin.entity.ts          # Entity cho bảng coins
├── coin.dto.ts             # DTOs cho API
├── coin.service.ts         # Business logic
├── coin.controller.ts      # API endpoints
├── coin.module.ts          # Module configuration
└── README.md               # Documentation
```

### 📄 Mô tả file

- **`coin.entity.ts`**: Định nghĩa entity `Coin` với các trường id, name, symbol, logo, website, mint, status
- **`coin.dto.ts`**: Chứa `GetCoinsDto` cho query parameters và `CoinResponseDto` cho response
- **`coin.service.ts`**: Logic xử lý business, auto-initialization SOL/USDT, và method `getCoins()`
- **`coin.controller.ts`**: API endpoint `GET /coins` để lấy danh sách coins
- **`coin.module.ts`**: Cấu hình module với TypeORM repository và exports

## 🚀 Tính năng

- **Auto-initialization**: Tự động khởi tạo SOL và USDT khi module start
- **Danh sách coins**: Lấy danh sách coins hỗ trợ
- **Tìm kiếm**: Tìm kiếm coin theo tên, symbol
- **Filter**: Lọc theo trạng thái active/inactive/all
- **Sort**: Sắp xếp theo symbol A-Z

## 📊 Database Schema

### Bảng `coins`

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | `integer` | Primary key |
| `name` | `varchar` | Tên coin (unique) |
| `symbol` | `varchar` | Ký hiệu coin (unique) |
| `logo` | `varchar` | URL logo coin |
| `website` | `varchar` | Website chính thức |
| `mint` | `varchar` | Mint address trên Solana |
| `status` | `enum` | 'active' hoặc 'inactive' |

## 🔗 API Endpoints

### Lấy danh sách coins

- `GET /coins` - Lấy danh sách coins hỗ trợ

### Query Parameters

- `search` - Tìm kiếm theo tên hoặc symbol (optional)
- `status` - Lọc theo trạng thái: `active`, `inactive`, `all` (default: `active`)

## 📝 Ví dụ sử dụng

### Lấy tất cả coins active

```bash
GET /coins
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Solana",
    "symbol": "SOL",
    "mint": "So11111111111111111111111111111111111111112",
    "logo": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    "website": "https://solana.com",
    "status": "active"
  },
  {
    "id": 2,
    "name": "Tether USD",
    "symbol": "USDT",
    "mint": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    "logo": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
    "website": "https://tether.to",
    "status": "active"
  }
]
```

### Tìm kiếm coin

```bash
GET /coins?search=SOL
GET /coins?search=Solana
```

### Lọc theo trạng thái

```bash
GET /coins?status=all
GET /coins?status=inactive
```

## 🔧 Dependencies

- TypeORM
- Class Validator
- Class Transformer
- NestJS OnModuleInit

## ⚠️ Lưu ý

- **Auto-initialization**: Module tự động tạo SOL và USDT khi khởi động
- **Mint address unique**: Mỗi coin có mint address duy nhất trên Solana
- **Status filtering**: Mặc định chỉ trả về coins có status `active`
- **Search**: Tìm kiếm case-insensitive theo tên và symbol
- **Sort**: Kết quả được sắp xếp theo symbol A-Z

## 🚀 Khởi tạo mặc định

Khi module khởi động, hệ thống sẽ tự động tạo 2 coins:

1. **SOL (Solana)**
   - Mint: `So11111111111111111111111111111111111111112`
   - Logo: Solana official logo
   - Website: https://solana.com

2. **USDT (Tether USD)**
   - Mint: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`
   - Logo: Tether official logo
   - Website: https://tether.to

## 🔗 Tích hợp với modules khác

### Wallet Histories Module
- Sử dụng `Coin` entity để lưu thông tin coin trong withdrawal history
- Liên kết qua `currency_symbol` field

### Blockchain Service
- Sử dụng `mint` address để xác định coin trên Solana blockchain
- Hỗ trợ cả SOL native và SPL tokens

## 📋 Checklist triển khai

- [x] Entity `Coin` với đầy đủ fields
- [x] DTOs cho API request/response
- [x] Service với auto-initialization
- [x] Controller với GET endpoint
- [x] Module configuration
- [x] Documentation đầy đủ
- [x] Tích hợp vào `app.module.ts`
