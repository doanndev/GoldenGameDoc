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
- **Danh sách coins**: Lấy danh sách coins hỗ trợ từ database
- **Tokens withdraw**: Lấy thông tin token SOL/USDT cho withdrawal (không cần database)
- **Main coins**: Lấy 3 đồng coin chính SOL, USDT và MPB
- **Tìm kiếm**: Tìm kiếm coin theo tên, symbol
- **Filter**: Lọc theo trạng thái active/inactive/all
- **Sort**: Sắp xếp theo symbol A-Z
- **Reusable constants**: Dữ liệu token có thể tái sử dụng trong các module khác

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
| `isWithdraw` | `boolean` | Có thể rút được hay không (default: false) |

## 🔗 API Endpoints

### 1. Lấy danh sách coins từ database

**GET** `/coins` - Lấy danh sách coins hỗ trợ từ database

**Query Parameters:**
- `search` - Tìm kiếm theo tên hoặc symbol (optional)
- `status` - Lọc theo trạng thái: `active`, `inactive`, `all` (default: `active`)

### 2. Lấy thông tin token cho withdrawal

**GET** `/coins/tokens-withdraw` - Lấy thông tin token có thể rút được từ database

**Headers:** Không cần authentication

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Solana",
    "symbol": "SOL",
    "mint": "So11111111111111111111111111111111111111112",
    "logo": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    "website": "https://solana.com",
    "status": "active",
    "isWithdraw": true
  },
  {
    "id": 2,
    "name": "Tether USD",
    "symbol": "USDT",
    "mint": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    "logo": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
    "website": "https://tether.to",
    "status": "active",
    "isWithdraw": true
  }
]
```

### 3. Lấy 3 đồng coin chính (SOL, USDT, MPB)

**GET** `/coins/main-coins` - Lấy thông tin 3 đồng coin chính: SOL, USDT và MPB

**Headers:** Không cần authentication

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Solana",
    "symbol": "SOL",
    "mint": "So11111111111111111111111111111111111111112",
    "logo": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    "website": "https://solana.com",
    "status": "active",
    "isWithdraw": true
  },
  {
    "id": 2,
    "name": "Tether USD",
    "symbol": "USDT",
    "mint": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    "logo": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
    "website": "https://tether.to",
    "status": "active",
    "isWithdraw": true
  },
  {
    "id": 3,
    "name": "MPB Token",
    "symbol": "MPB",
    "mint": "MPBToken1111111111111111111111111111111111111111",
    "logo": "https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=MPB",
    "website": "https://mpb.com",
    "status": "active",
    "isWithdraw": true
  }
]
```

## 📝 Ví dụ sử dụng

### 1. Lấy tất cả coins active từ database

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
    "status": "active",
    "isWithdraw": true
  },
  {
    "id": 2,
    "name": "Tether USD",
    "symbol": "USDT",
    "mint": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    "logo": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
    "website": "https://tether.to",
    "status": "active",
    "isWithdraw": true
  }
]
```

### 2. Lấy thông tin token cho withdrawal (nhanh)

```bash
GET /coins/tokens-withdraw
```

**Response:** Tương tự như trên nhưng luôn trả về 2 tokens SOL và USDT

### 3. Lấy 3 đồng coin chính (SOL, USDT, MPB)

```bash
GET /coins/main-coins
```

**Response:** Trả về 3 đồng coin chính: SOL, USDT và MPB (sắp xếp theo symbol)

### 4. Tìm kiếm coin trong database

```bash
GET /coins?search=SOL
GET /coins?search=Solana
```

### 5. Lọc theo trạng thái

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
- **API `/coins/tokens-withdraw`**: Không cần authentication, chỉ trả về token có `isWithdraw = true` và `status = 'active'`
- **`TOKEN_DATA_WITHDRAW`**: Constant readonly, sử dụng spread operator `[...TOKEN_DATA_WITHDRAW]` để tạo copy
- **Performance**: API tokens-withdraw truy vấn database để lấy token có thể rút được

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
- **Trước:** Sử dụng `TOKEN_DATA_WITHDRAW` constant để lấy thông tin coin
- **Sau:** Sử dụng `Coin` entity để lấy thông tin coin từ database với điều kiện `isWithdraw = true`
- **Lợi ích:** Linh hoạt hơn, có thể kiểm soát token nào được phép rút

### Blockchain Service
- Sử dụng `mint` address để xác định coin trên Solana blockchain
- Hỗ trợ cả SOL native và SPL tokens
- Có thể import `TOKEN_DATA_WITHDRAW` để sử dụng mint addresses

### Reusable Constants
- **`TOKEN_DATA_WITHDRAW`**: Constant chứa thông tin SOL và USDT
- **Export từ:** `src/modules/coins/coin.service.ts`
- **Sử dụng:** Import vào bất kỳ module nào cần thông tin token
- **Ví dụ:**
  ```typescript
  import { TOKEN_DATA_WITHDRAW } from '../coins/coin.service';
  
  const solToken = TOKEN_DATA_WITHDRAW.find(token => token.symbol === 'SOL');
  const solMint = TOKEN_DATA_WITHDRAW[0].mint;
  ```

## 📋 Checklist triển khai

- [x] Entity `Coin` với đầy đủ fields
- [x] DTOs cho API request/response
- [x] Service với auto-initialization
- [x] Controller với GET endpoint
- [x] **API `/coins/tokens-withdraw`** - Lấy token cho withdrawal
- [x] **API `/coins/main-coins`** - Lấy 3 đồng coin chính SOL, USDT, MPB
- [x] **`TOKEN_DATA_WITHDRAW` constant** - Dữ liệu tái sử dụng
- [x] Module configuration
- [x] Documentation đầy đủ
- [x] Tích hợp vào `app.module.ts`
- [x] **Tích hợp với Wallet Histories Module** - Sử dụng constant thay vì database
