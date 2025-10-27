# Admin Transaction Volume API

## 📋 Tổng quan

API quản lý dữ liệu volume giao dịch dành cho admin, cung cấp thông tin về volume của các loại giao dịch: swap, p2p, deposit, withdraw để hiển thị biểu đồ.

## 🚀 Endpoints

### GET `/api/v1/admin/transaction/volume`

Lấy dữ liệu volume giao dịch của 4 loại: swap, p2p, deposit, withdraw với khả năng lọc theo khoảng thời gian.

#### 🔐 Authentication
- **Required**: Admin JWT Token
- **Guard**: `AdminJwtAuthGuard` + `PermissionGuard`
- **Permission**: Cần quyền truy cập module TRANSACTION

#### 📝 Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `time_filter` | string | No | today | Bộ lọc thời gian: `today`, `week`, `month`, `custom` |
| `start_date` | string | No | - | Ngày bắt đầu (chỉ dùng với `time_filter=custom`, format: YYYY-MM-DD) |
| `end_date` | string | No | - | Ngày kết thúc (chỉ dùng với `time_filter=custom`, format: YYYY-MM-DD) |

#### 📊 Response Format

```json
{
  "status": "success",
  "message": "Volume data fetched successfully",
  "data": {
    "swap": [
      { "date": "2025-01", "volume": 12000000 },
      { "date": "2025-02", "volume": 15000000 },
      { "date": "2025-03", "volume": 10000000 }
    ],
    "p2p": [
      { "date": "2025-01", "volume": 8000000 },
      { "date": "2025-02", "volume": 9500000 },
      { "date": "2025-03", "volume": 7500000 }
    ],
    "deposit": [
      { "date": "2025-01", "volume": 20000000 },
      { "date": "2025-02", "volume": 25000000 },
      { "date": "2025-03", "volume": 18000000 }
    ],
    "withdraw": [
      { "date": "2025-01", "volume": 15000000 },
      { "date": "2025-02", "volume": 18000000 },
      { "date": "2025-03", "volume": 12000000 }
    ]
  }
}
```

#### 📋 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Trạng thái response: "success" |
| `message` | string | Thông báo từ server |
| `data` | object | Dữ liệu volume của các loại giao dịch |
| `data.swap` | array | Danh sách volume giao dịch swap |
| `data.p2p` | array | Danh sách volume giao dịch P2P |
| `data.deposit` | array | Danh sách volume giao dịch deposit |
| `data.withdraw` | array | Danh sách volume giao dịch withdraw |
| `data.*[].date` | string | Ngày/tháng (format: YYYY-MM-DD hoặc YYYY-MM) |
| `data.*[].volume` | number | Tổng volume trong ngày/tháng |

#### 🔍 Business Logic

##### Time Filter Options
- **today**: Lấy dữ liệu volume trong ngày hiện tại (00:00:00 - 23:59:59)
- **week**: Lấy dữ liệu volume trong 7 ngày gần nhất
- **month**: Lấy dữ liệu volume trong 1 tháng gần nhất
- **custom**: Lấy dữ liệu volume trong khoảng thời gian tùy chỉnh

##### Volume Calculation Logic

###### Swap Volume
- Chỉ tính các giao dịch swap có `status = 'executed'`
- Sử dụng `amount_received` làm volume
- Lọc các giao dịch có `hash IS NOT NULL` và `wallet_address IS NOT NULL`

###### P2P Volume
- Chỉ tính các giao dịch P2P có `status = 'executed'`
- Sử dụng `total_usd` làm volume
- Lấy từ bảng `transactions`

###### Deposit Volume
- Chỉ tính các giao dịch deposit có `status = 'success'`
- Sử dụng `amount` làm volume
- Lọc theo `option = 'deposit'` trong bảng `wallet_histories`

###### Withdraw Volume
- Chỉ tính các giao dịch withdraw có `status = 'success'`
- Sử dụng `amount` làm volume
- Lọc theo `option = 'withdraw'` trong bảng `wallet_histories`

##### Date Grouping Logic
- **Today/Week**: Group theo ngày (YYYY-MM-DD)
- **Month**: Group theo tháng (YYYY-MM)
- **Custom**: 
  - Nếu khoảng thời gian ≤ 30 ngày: Group theo ngày (YYYY-MM-DD)
  - Nếu khoảng thời gian > 30 ngày: Group theo tháng (YYYY-MM)

##### Custom Date Range Validation
- Khi sử dụng `time_filter=custom`, bắt buộc phải có `start_date` và `end_date`
- Format ngày: `YYYY-MM-DD`
- Tự động set giờ: `start_date` = 00:00:00, `end_date` = 23:59:59

#### ⚡ Performance Optimization
- **Parallel Queries**: Thực hiện 4 queries song song cho từng loại giao dịch
- **Raw SQL**: Sử dụng raw SQL với GROUP BY để tối ưu performance
- **Index Optimization**: Tận dụng index trên `created_at`, `status`, `option`
- **Date Range Filtering**: Filter ở database level để giảm data transfer

#### 📝 Example Usage

```bash
# Lấy volume hôm nay
GET /api/v1/admin/transaction/volume?time_filter=today

# Lấy volume tuần qua
GET /api/v1/admin/transaction/volume?time_filter=week

# Lấy volume tháng qua
GET /api/v1/admin/transaction/volume?time_filter=month

# Lấy volume trong khoảng thời gian tùy chỉnh
GET /api/v1/admin/transaction/volume?time_filter=custom&start_date=2025-01-01&end_date=2025-01-31

# Mặc định (hôm nay)
GET /api/v1/admin/transaction/volume
```

#### ❌ Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid date format hoặc thiếu start_date/end_date cho custom filter |
| 401 | Unauthorized |
| 403 | Forbidden |
| 500 | Internal Server Error |

#### 🔧 Database Schema

##### Tables Used
- `swaps` - Thông tin giao dịch swap
- `transactions` - Thông tin giao dịch P2P
- `wallet_histories` - Thông tin giao dịch deposit/withdraw

##### Key Fields
- `created_at` - Thời gian tạo giao dịch (dùng để group theo thời gian)
- `status` - Trạng thái giao dịch (filter: 'executed', 'success')
- `amount_received` - Số tiền nhận được (swap volume)
- `total_usd` - Tổng giá trị USD (P2P volume)
- `amount` - Số tiền (deposit/withdraw volume)
- `option` - Loại giao dịch ('deposit', 'withdraw')

#### 📈 Use Cases

##### Frontend Chart Integration
- **Line Charts**: Hiển thị xu hướng volume theo thời gian
- **Bar Charts**: So sánh volume giữa các loại giao dịch
- **Area Charts**: Hiển thị tổng volume tích lũy
- **Dashboard Widgets**: Hiển thị volume tổng quan

##### Analytics & Reporting
- **Volume Trends**: Phân tích xu hướng volume theo thời gian
- **Transaction Type Comparison**: So sánh volume giữa các loại giao dịch
- **Performance Metrics**: Đo lường hiệu suất giao dịch
- **Business Intelligence**: Cung cấp dữ liệu cho các báo cáo kinh doanh

#### 🛠️ Development Notes

### Dependencies
- `@nestjs/common`
- `@nestjs/typeorm`
- `typeorm`
- `AdminJwtAuthGuard`
- `PermissionGuard`

### Files Structure
```
src/modules/admin/transaction/
├── transaction.controller.ts    # API endpoints
├── transaction.service.ts       # Business logic
├── transaction.module.ts        # Module configuration
├── transaction.dto.ts           # Data transfer objects
└── README.md                   # Documentation
```

### Database Entities
- `Swap` - Swap transactions
- `WalletHistory` - Deposit/Withdraw transactions
- `Transaction` - P2P transactions

### Testing
- Unit tests cho service methods
- Integration tests cho API endpoints
- Performance tests cho large datasets
- Mock data cho chart visualization

---

## 🔍 Technical Implementation Details

### Query Optimization
```sql
-- Example query for swap volumes
SELECT 
  CASE 
    WHEN $3 = 'month' OR $3 = 'custom' THEN TO_CHAR(created_at, 'YYYY-MM')
    ELSE TO_CHAR(created_at, 'YYYY-MM-DD')
  END as date,
  SUM(amount_received) as volume
FROM swaps 
WHERE created_at >= $1 
  AND created_at <= $2 
  AND status = 'executed'
  AND hash IS NOT NULL
  AND wallet_address IS NOT NULL
GROUP BY 
  CASE 
    WHEN $3 = 'month' OR $3 = 'custom' THEN TO_CHAR(created_at, 'YYYY-MM')
    ELSE TO_CHAR(created_at, 'YYYY-MM-DD')
  END
ORDER BY date
```

### Error Handling
- **Input Validation**: Kiểm tra format ngày và tham số đầu vào
- **Database Errors**: Xử lý lỗi database và connection issues
- **Business Logic Errors**: Xử lý các lỗi logic nghiệp vụ
- **Logging**: Ghi log chi tiết cho debugging và monitoring

### Security Considerations
- **Authentication**: Yêu cầu admin JWT token
- **Authorization**: Kiểm tra quyền truy cập module TRANSACTION
- **Input Sanitization**: Validate và sanitize input parameters
- **SQL Injection Prevention**: Sử dụng parameterized queries

### Monitoring & Logging
- **Success Logs**: Ghi log số lượng records được xử lý
- **Error Logs**: Ghi log chi tiết khi có lỗi
- **Performance**: Monitor query execution time
- **Usage**: Track API call frequency và patterns
