# Tài liệu API Module Wallets

## Tổng quan
Module Wallets cung cấp chức năng tạo ví HD (Hierarchical Deterministic) và quản lý ví cho tích hợp blockchain Solana. Nó tạo ra địa chỉ ví và keypair duy nhất cho người dùng sử dụng cụm từ ghi nhớ BIP39 và đường dẫn dẫn xuất tùy chỉnh.

## Tính năng
- Tạo ví HD sử dụng BIP39 mnemonic
- Đường dẫn dẫn xuất tùy chỉnh dựa trên user ID
- Tạo Solana keypair
- Dẫn xuất seed an toàn
- Tạo địa chỉ ví duy nhất
- Import ví từ private key
- Quản lý đa ví (main + import)
- Xóa ví đã import

## Base URL
```
/wallets
```

## API Endpoints

### 1. Lấy tất cả ví
**GET** `/wallets`

Lấy danh sách tất cả ví của người dùng (cả ví chính và ví đã import).

**Headers:**
- `Authorization: Bearer <access_token>` hoặc access_token cookie

**Response:**
```json
[
  {
    "id": 123,
    "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "name": "Main Wallet",
    "type": "main",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 456,
    "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "name": "My Imported Wallet",
    "type": "import",
    "created_at": "2024-01-14T15:20:00.000Z"
  }
]
```

**Status Codes:**
- `200` - Danh sách ví được lấy thành công
- `401` - Unauthorized (invalid or missing token)

---

### 2. Import ví
**POST** `/wallets/import`

Import ví từ private key.

**Headers:**
- `Authorization: Bearer <access_token>` hoặc access_token cookie

**Request Body:**
```json
{
  "sol_private_key": "5Kb8kLf9CwWJ8Y...",
  "name": "My Imported Wallet"
}
```

**Response:**
```json
{
  "id": 456,
  "sol_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "name": "My Imported Wallet",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

**Status Codes:**
- `201` - Ví được import thành công
- `400` - "Invalid private key format" / "Wallet already imported by this user"
- `401` - Unauthorized (invalid or missing token)

---

### 3. Xóa ví đã import
**DELETE** `/wallets/import/:walletAddress`

Xóa ví đã import của người dùng.

**Headers:**
- `Authorization: Bearer <access_token>` hoặc access_token cookie

**Parameters:**
- `walletAddress` (string) - Địa chỉ ví cần xóa

**Response:**
```json
{
  "message": "Wallet deleted successfully"
}
```

**Status Codes:**
- `200` - Ví được xóa thành công
- `400` - "Wallet not found" / "Wallet not owned by user"
- `401` - Unauthorized (invalid or missing token)

## Các đối tượng chuyển dữ liệu (DTOs)

### ImportWalletDto
```typescript
{
  sol_private_key: string; // Bắt buộc, đã trim
  name: string; // Bắt buộc, 1-50 ký tự
}
```

### ImportWalletResponseDto
```typescript
{
  id: number;
  sol_address: string;
  name: string;
  created_at: Date;
}
```

## Service Methods

### createHDWallet
**Method:** `createHDWallet(userId: number)`

Tạo ví HD mới cho người dùng với đường dẫn dẫn xuất duy nhất.

**Parameters:**
- `userId` (number) - ID duy nhất của người dùng

**Returns:**
```typescript
Promise<{
  keypair: Keypair;
  address: string;
  path: string;
  hdWalletPath: string;
  d: number;
}>
```

**Response Object:**
- `keypair` - Đối tượng Solana Keypair để ký giao dịch
- `address` - Địa chỉ public key (mã hóa base58)
- `path` - Đường dẫn dẫn xuất BIP44 đầy đủ
- `hdWalletPath` - Định dạng đường dẫn có thể đọc được (a-b-c-d)
- `d` - Thành phần ngẫu nhiên để đảm bảo tính duy nhất

### importWallet
**Method:** `importWallet(userId: number, importWalletDto: ImportWalletDto)`

Import ví từ private key.

**Parameters:**
- `userId` (number) - ID của người dùng
- `importWalletDto` (ImportWalletDto) - DTO chứa private key và tên ví

**Returns:**
```typescript
Promise<ImportWalletResponseDto>
```

### deleteImportWallet
**Method:** `deleteImportWallet(userId: number, walletAddress: string)`

Xóa ví đã import của người dùng.

**Parameters:**
- `userId` (number) - ID của người dùng
- `walletAddress` (string) - Địa chỉ ví

**Returns:**
```typescript
Promise<{ message: string }>
```

### getAllWallets
**Method:** `getAllWallets(userId: number)`

Lấy tất cả ví của người dùng (cả ví chính và ví đã import).

**Parameters:**
- `userId` (number) - ID của người dùng

**Returns:**
```typescript
Promise<any[]>
```

## Thuật toán đường dẫn dẫn xuất

### Cấu trúc đường dẫn
Ví sử dụng đường dẫn dẫn xuất tùy chỉnh dựa trên user ID:

```
m/44'/501'/0'/a'/b'/c'/d'
```

Trong đó:
- `44'` - Tiêu chuẩn BIP44 cho ví HD
- `501'` - Loại coin của Solana
- `0'` - Chỉ số tài khoản (luôn là 0 cho tài khoản chính)
- `a'` - 2 chữ số đầu của userId (floor(userId / 100000) % 100)
- `b'` - 2 chữ số giữa của userId (floor(userId / 1000) % 100)
- `c'` - 3 chữ số cuối của userId (userId % 1000)
- `d'` - Số ngẫu nhiên (0-99999) để đảm bảo tính duy nhất

### Ví dụ
Với `userId = 123456`:
- `a = floor(123456 / 100000) % 100 = 1`
- `b = floor(123456 / 1000) % 100 = 23`
- `c = 123456 % 1000 = 456`
- `d = random(0, 99999) = 78901`
- **Path:** `m/44'/501'/0'/1'/23'/456'/78901'`
- **HD Path:** `1-23-456-78901`

## Cấu hình

### Biến môi trường
```env
MNEMONIC=your_24_word_mnemonic_phrase_here
```

**Bắt buộc:**
- `MNEMONIC` - Cụm từ ghi nhớ BIP39 24 từ để tạo ví

**Xác thực:**
- Phải là cụm từ ghi nhớ BIP39 hợp lệ
- Phải có 24 từ
- Phải vượt qua xác thực BIP39

## Dependencies

### Dependencies chính
- `@nestjs/common` - Chức năng cốt lõi NestJS
- `@nestjs/config` - Quản lý cấu hình
- `@solana/web3.js` - Tích hợp blockchain Solana
- `bip39` - Xử lý cụm từ ghi nhớ BIP39
- `ed25519-hd-key` - Dẫn xuất key HD
- `bs58` - Mã hóa/giải mã Base58

### Thư viện bên ngoài
- **@solana/web3.js** - SDK blockchain Solana
- **bip39** - Tạo và xác thực cụm từ ghi nhớ
- **ed25519-hd-key** - Dẫn xuất key phân cấp xác định
- **bs58** - Mã hóa Base58 cho Solana

## Các tính năng bảo mật

### Bảo mật Mnemonic
- Sử dụng tiêu chuẩn BIP39 cho cụm từ ghi nhớ
- Xác thực mnemonic trước khi sử dụng
- Tạo seed an toàn từ mnemonic

### Dẫn xuất Key
- Sử dụng tiêu chuẩn BIP44 cho ví HD
- Đường dẫn dẫn xuất tùy chỉnh để đảm bảo tính duy nhất
- Tạo thành phần ngẫu nhiên an toàn
- Đường cong Ed25519 để tạo key

### Đảm bảo tính duy nhất
- Thành phần đường dẫn dựa trên User ID
- Thành phần ngẫu nhiên để tăng tính duy nhất
- Dẫn xuất chống va chạm

### Bảo mật Private Key
- Hỗ trợ nhiều định dạng private key (Base58, Base64)
- Xác thực định dạng private key trước khi import
- Lưu trữ private key an toàn trong database
- Kiểm tra trùng lặp ví trước khi import

## Ví dụ sử dụng

### Tạo ví cơ bản
```typescript
// Trong service inject WalletService
const walletData = await this.walletService.createHDWallet(123456);

console.log(walletData.address); // "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
console.log(walletData.path); // "m/44'/501'/0'/1'/23'/456'/78901'"
console.log(walletData.hdWalletPath); // "1-23-456-78901"
```

### Tích hợp với đăng ký người dùng
```typescript
// Khi tạo người dùng mới
const user = await this.userRepository.save(newUser);
const walletInfo = await this.walletService.createHDWallet(user.id);

// Lưu thông tin ví
const userMainWallet = this.userMainWalletRepository.create({
  user_id: user.id,
  address: walletInfo.address,
  path_hd_wallet: walletInfo.d,
});
await this.userMainWalletRepository.save(userMainWallet);
```

### Import ví từ private key
```typescript
// Import ví từ private key
const importDto = {
  sol_private_key: "5Kb8kLf9CwWJ8Y...",
  name: "My Imported Wallet"
};

const importedWallet = await this.walletService.importWallet(userId, importDto);
console.log(importedWallet.sol_address); // "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
```

### Lấy danh sách ví
```typescript
// Lấy tất cả ví của người dùng
const allWallets = await this.walletService.getAllWallets(userId);
console.log(allWallets); // Array of main and imported wallets
```

## Xử lý lỗi

### Lỗi thường gặp

1. **Thiếu Mnemonic**
   ```typescript
   Error: 'MNEMONIC is not configured in environment variables'
   ```
   **Giải pháp:** Thiết lập biến môi trường MNEMONIC

2. **Mnemonic không hợp lệ**
   ```typescript
   Error: 'Invalid mnemonic phrase'
   ```
   **Giải pháp:** Sử dụng cụm từ ghi nhớ BIP39 24 từ hợp lệ

3. **Private key không hợp lệ**
   ```typescript
   Error: 'Invalid private key format'
   ```
   **Giải pháp:** Sử dụng private key Base58 hoặc Base64 hợp lệ

4. **Ví đã được import**
   ```typescript
   Error: 'Wallet already imported by this user'
   ```
   **Giải pháp:** Kiểm tra ví đã được import chưa trước khi import

5. **Ví không tìm thấy**
   ```typescript
   Error: 'Wallet not found'
   ```
   **Giải pháp:** Kiểm tra địa chỉ ví có tồn tại không

6. **Ví không thuộc về người dùng**
   ```typescript
   Error: 'Wallet not owned by user'
   ```
   **Giải pháp:** Chỉ xóa ví thuộc về người dùng hiện tại

### Mã lỗi HTTP và Message

#### 400 Bad Request
- "Invalid private key format"
- "Wallet already imported by this user"
- "Wallet not found"
- "Wallet not owned by user"

#### 401 Unauthorized
- Unauthorized (invalid or missing token)

#### 500 Internal Server Error
- "MNEMONIC is not configured in environment variables"
- "Invalid mnemonic phrase"

## Tích hợp Database

### UserMainWallet Entity
Service ví tích hợp với entity `UserMainWallet`:

```typescript
{
  id: number;
  user_id: number;
  address: string; // Địa chỉ public key
  path_hd_wallet: number; // Thành phần ngẫu nhiên (d)
}
```

### UserImportWallet Entity
Entity lưu trữ ví đã import:

```typescript
{
  id: number;
  sol_private_key: string; // Private key (mã hóa)
  sol_address: string; // Địa chỉ public key
  created_at: Date;
}
```

### UserImportConnect Entity
Entity kết nối người dùng với ví đã import:

```typescript
{
  id: number;
  user_id: number;
  wallet_id: number;
  name: string; // Tên tùy chỉnh cho ví
  created_at: Date;
}
```

### Mẫu lưu trữ
- `address` - Lưu địa chỉ public key
- `path_hd_wallet` - Lưu thành phần ngẫu nhiên (d) để tái tạo đường dẫn
- Đường dẫn đầy đủ có thể được tái tạo bằng user ID và thành phần đã lưu
- Private key được lưu an toàn trong `user_import_wallets`
- Mối quan hệ user-ví được quản lý qua `user_import_connects`

## Điểm tích hợp

### Auth Module
- Tạo ví trong quá trình đăng ký người dùng
- Sử dụng trong luồng email, Telegram và Google OAuth
- Lưu thông tin ví trong bản ghi người dùng
- Hỗ trợ chọn ví cho phiên đăng nhập

### Telegram Bot Module
- Tạo ví cho người dùng Telegram mới
- Tích hợp với quy trình tạo người dùng
- Xử lý lỗi tạo ví một cách graceful

### User Module
- Quản lý mối quan hệ user-ví
- Lưu metadata ví
- Xử lý truy vấn ví

## Các tính năng bổ sung

### Tính năng đã triển khai
- ✅ REST API endpoints cho các thao tác ví
- ✅ Hỗ trợ đa ví cho mỗi người dùng
- ✅ Chức năng import ví từ private key
- ✅ Xóa ví đã import
- ✅ Lấy danh sách tất cả ví

### Tính năng dự kiến
- 🔄 Kiểm tra số dư ví
- 🔄 Lịch sử giao dịch
- 🔄 Chức năng chuyển tiền
- 🔄 Export ví
- 🔄 Quản lý ví nâng cao

### API Endpoints tiềm năng
```typescript
// Các endpoints tương lai
GET /wallets/balance/:walletAddress
GET /wallets/transactions/:walletAddress
POST /wallets/transfer
GET /wallets/export/:walletAddress
```

## Testing

### Unit Tests
- Xác thực mnemonic
- Thuật toán tạo đường dẫn
- Tạo keypair
- Các kịch bản xử lý lỗi
- Import/export ví
- Xác thực private key

### Integration Tests
- Tích hợp database
- Injection service
- Xác thực cấu hình
- API endpoints
- Authentication flow

## Cân nhắc hiệu suất

### Tối ưu hóa
- Xác thực mnemonic được cache
- Dẫn xuất key được tối ưu cho Ed25519
- Footprint bộ nhớ tối thiểu cho tạo keypair
- Lazy loading cho danh sách ví

### Khả năng mở rộng
- Thiết kế service stateless
- Không phụ thuộc database cho tạo ví
- Thuật toán dẫn xuất key hiệu quả
- Hỗ trợ đa ví không giới hạn

## Thực hành bảo mật tốt nhất

### Quản lý Mnemonic
- Lưu mnemonic an toàn trong biến môi trường
- Sử dụng hardware security modules trong production
- Backup và xoay vòng mnemonic thường xuyên

### Quản lý Key
- Không bao giờ log private keys hoặc seeds
- Sử dụng tạo số ngẫu nhiên an toàn
- Triển khai kiểm soát truy cập phù hợp
- Mã hóa private key trong database

### Bảo mật đường dẫn
- Đường dẫn dẫn xuất tùy chỉnh ngăn va chạm địa chỉ
- Thành phần ngẫu nhiên thêm entropy
- Đường dẫn dựa trên User ID đảm bảo tính duy nhất

## Khắc phục sự cố

### Vấn đề thường gặp

1. **Tạo ví thất bại**
   - Kiểm tra cấu hình mnemonic
   - Xác minh user ID hợp lệ
   - Kiểm tra kết nối database

2. **Va chạm địa chỉ**
   - Đảm bảo tính duy nhất của user ID
   - Kiểm tra tạo thành phần ngẫu nhiên
   - Xác minh thuật toán dẫn xuất đường dẫn

3. **Lỗi tích hợp**
   - Kiểm tra injection service
   - Xác minh mối quan hệ entity database
   - Kiểm tra xử lý lỗi trong service gọi

4. **Import ví thất bại**
   - Kiểm tra định dạng private key
   - Xác minh ví chưa được import
   - Kiểm tra quyền truy cập database
