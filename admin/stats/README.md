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

---

## 🎮 Game Revenue and Rewards API

### GET `/api/v1/admin/transaction/revenue-rewards`

Lấy dữ liệu thống kê doanh thu (revenue) và phần thưởng phát hành (rewards) từ các trò chơi với khả năng lọc theo khoảng thời gian.

#### 🔐 Authentication
- **Required**: Admin JWT Token
- **Guard**: `AdminJwtAuthGuard` + `PermissionGuard`
- **Permission**: Cần quyền truy cập module TRANSACTION

#### 📝 Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `time_filter` | string | No | - | Bộ lọc thời gian: `today`, `week`, `month`, `custom` |
| `start_date` | string | No | - | Ngày bắt đầu (chỉ dùng với `time_filter=custom`, format: YYYY-MM-DD) |
| `end_date` | string | No | - | Ngày kết thúc (chỉ dùng với `time_filter=custom`, format: YYYY-MM-DD) |

#### 📊 Response Format

```json
{
  "status": "success",
  "message": "Volume data fetched successfully",
  "data": [
    { "date": "2025-01-01", "revenue": 12000000, "rewards": 1000 },
    { "date": "2025-01-02", "revenue": 15000000, "rewards": 1000 },
    { "date": "2025-01-03", "revenue": 10000000, "rewards": 1000 }
  ]
}
```

#### 📋 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Trạng thái response: "success" |
| `message` | string | Thông báo từ server |
| `data` | array | Danh sách dữ liệu revenue và rewards theo ngày/tháng |
| `data[].date` | string | Ngày/tháng (format: YYYY-MM-DD hoặc YYYY-MM) |
| `data[].revenue` | number | Tổng doanh thu trong ngày/tháng |
| `data[].rewards` | number | Tổng phần thưởng phát hành trong ngày/tháng |

#### 🔍 Business Logic

##### Time Filter Options
- **today**: Lấy dữ liệu revenue và rewards trong ngày hiện tại (00:00:00 - 23:59:59)
- **week**: Lấy dữ liệu revenue và rewards trong 7 ngày gần nhất
- **month**: Lấy dữ liệu revenue và rewards trong 1 tháng gần nhất
- **custom**: Lấy dữ liệu revenue và rewards trong khoảng thời gian tùy chỉnh
- **default**: Nếu không có time_filter, mặc định lấy 30 ngày gần nhất

##### Revenue Calculation Logic
- Chỉ tính các giao dịch `game_join_rooms` có `status = 'executed'`
- **Loại trừ các session có status 'out'** vì không tạo ra doanh thu
- Sử dụng `amount` làm doanh thu
- Dựa trên `time_join` để group theo thời gian
- JOIN với bảng `game_sessions` để kiểm tra status session

##### Rewards Calculation Logic
- Chỉ tính các kết quả `game_session_results` có `status = 'executed'`
- Sử dụng `prize_amount` làm tổng phần thưởng
- Dựa trên `created_at` để group theo thời gian

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
- **Parallel Queries**: Thực hiện 2 queries song song cho revenue và rewards
- **Raw SQL**: Sử dụng raw SQL với GROUP BY để tối ưu performance
- **Index Optimization**: Tận dụng index trên `time_join`, `created_at`, `status`
- **Date Range Filtering**: Filter ở database level để giảm data transfer

#### 📝 Example Usage

```bash
# Lấy revenue và rewards hôm nay
GET /api/v1/admin/transaction/revenue-rewards?time_filter=today

# Lấy revenue và rewards tuần qua
GET /api/v1/admin/transaction/revenue-rewards?time_filter=week

# Lấy revenue và rewards tháng qua
GET /api/v1/admin/transaction/revenue-rewards?time_filter=month

# Lấy revenue và rewards trong khoảng thời gian tùy chỉnh
GET /api/v1/admin/transaction/revenue-rewards?time_filter=custom&start_date=2025-01-01&end_date=2025-01-31

# Mặc định (30 ngày qua)
GET /api/v1/admin/transaction/revenue-rewards
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
- `game_join_rooms` - Thông tin người chơi join game (revenue)
- `game_session_results` - Thông tin kết quả và phần thưởng (rewards)

##### Key Fields
- `time_join` - Thời gian join game (dùng để group theo thời gian cho revenue)
- `created_at` - Thời gian tạo kết quả (dùng để group theo thời gian cho rewards)
- `status` - Trạng thái giao dịch (filter: 'executed')
- `amount` - Số tiền đặt cược (revenue calculation)
- `prize_amount` - Số tiền phần thưởng (rewards calculation)

#### 📈 Use Cases

##### Frontend Dashboard
- **Revenue vs Rewards Chart**: Hiển thị so sánh doanh thu và phần thưởng
- **Profit Analysis**: Tính toán lợi nhuận ròng (revenue - rewards)
- **Trend Analysis**: Phân tích xu hướng doanh thu và phần thưởng theo thời gian
- **Performance Metrics**: Đo lường hiệu suất kinh doanh

##### Analytics & Reporting
- **Revenue Trends**: Phân tích xu hướng doanh thu theo thời gian
- **Reward Distribution**: Theo dõi việc phát hành phần thưởng
- **Game Performance**: Đánh giá hiệu suất của các trò chơi
- **Business Intelligence**: Cung cấp dữ liệu cho các báo cáo kinh doanh

### Technical Implementation Details

#### Query Optimization
```sql
-- Example query for revenue data (excludes 'out' sessions)
SELECT 
  CASE 
    WHEN $3 = 'month' OR $3 = 'custom' THEN TO_CHAR(gjr.time_join, 'YYYY-MM')
    ELSE TO_CHAR(gjr.time_join, 'YYYY-MM-DD')
  END as date,
  SUM(CAST(gjr.amount AS DECIMAL)) as revenue
FROM game_join_rooms gjr
LEFT JOIN game_sessions gs ON gjr.session_id = gs.id
WHERE gjr.time_join >= $1 
  AND gjr.time_join <= $2 
  AND gjr.status = 'executed'
  AND (gs.status IS NULL OR gs.status != 'out')
GROUP BY 
  CASE 
    WHEN $3 = 'month' OR $3 = 'custom' THEN TO_CHAR(gjr.time_join, 'YYYY-MM')
    ELSE TO_CHAR(gjr.time_join, 'YYYY-MM-DD')
  END
ORDER BY date
```

```sql
-- Example query for rewards data
SELECT 
  CASE 
    WHEN $3 = 'month' OR $3 = 'custom' THEN TO_CHAR(created_at, 'YYYY-MM')
    ELSE TO_CHAR(created_at, 'YYYY-MM-DD')
  END as date,
  SUM(CAST(prize_amount AS DECIMAL)) as rewards
FROM game_session_results 
WHERE created_at >= $1 
  AND created_at <= $2 
  AND status = 'executed'
GROUP BY 
  CASE 
    WHEN $3 = 'month' OR $3 = 'custom' THEN TO_CHAR(created_at, 'YYYY-MM')
    ELSE TO_CHAR(created_at, 'YYYY-MM-DD')
  END
ORDER BY date
```

### Updated Database Entities
- `GameJoinRoom` - Game join transactions (for revenue)
- `GameSessionResults` - Game session results (for rewards)

## 🏆 Top Rooms Revenue API

### GET `/api/v1/admin/stats/top-rooms-revenue`

Lấy danh sách top 5 room có revenue cao nhất với khả năng lọc theo khoảng thời gian.

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
  "message": "Top rooms revenue data fetched successfully",
  "data": [
    {
      "room_id": 1,
      "room_name": "VIP Room 1",
      "owner_id": 123,
      "owner_name": "admin_user",
      "total_revenue": 5000000,
      "total_players": 150,
      "total_sessions": 25,
      "participation_amount": 100000
    },
    {
      "room_id": 2,
      "room_name": "Premium Room",
      "owner_id": 456,
      "owner_name": "room_owner_2",
      "total_revenue": 4500000,
      "total_players": 120,
      "total_sessions": 20,
      "participation_amount": 150000
    }
  ]
}
```

#### 📋 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `room_id` | number | ID của room |
| `room_name` | string | Tên của room |
| `owner_id` | number | ID của chủ room |
| `owner_name` | string | Tên của chủ room |
| `total_revenue` | number | Tổng revenue của room (tổng số tiền bet) |
| `total_players` | number | Tổng số người chơi unique |
| `total_sessions` | number | Tổng số sessions đã kết thúc |
| `participation_amount` | number | Số tiền tham gia của room |

#### 🔍 Business Logic

- **Revenue Calculation**: Chỉ tính các sessions có status = 'end'
- **Player Count**: Đếm số người chơi unique đã tham gia
- **Session Count**: Đếm số sessions đã kết thúc trong khoảng thời gian (dựa trên `updated_at`)
- **Time Filtering**: Lọc theo thời điểm session kết thúc (`updated_at`) thay vì thời điểm bắt đầu
- **Filtering**: Chỉ hiển thị rooms có revenue > 0
- **Sorting**: Sắp xếp theo revenue giảm dần
- **Limit**: Chỉ trả về top 5 rooms

#### 📝 Example Usage

```bash
# Lấy top rooms hôm nay
GET /api/v1/admin/stats/top-rooms-revenue?time_filter=today

# Lấy top rooms tuần này
GET /api/v1/admin/stats/top-rooms-revenue?time_filter=week

# Lấy top rooms tháng này
GET /api/v1/admin/stats/top-rooms-revenue?time_filter=month

# Lấy top rooms trong khoảng thời gian tùy chỉnh
GET /api/v1/admin/stats/top-rooms-revenue?time_filter=custom&start_date=2024-01-01&end_date=2024-01-31
```

#### Top Rooms Revenue Query
```sql
SELECT 
  gr.id as room_id,
  gr.name as room_name,
  gr.owner_id as owner_id,
  u.username as owner_name,
  gr.participation_amount,
  SUM(CAST(gjr.amount AS DECIMAL)) as total_revenue,
  COUNT(DISTINCT gjr.user_id) as total_players,
  COUNT(DISTINCT gs.id) as total_sessions
FROM game_rooms gr
LEFT JOIN users u ON gr.owner_id = u.id
LEFT JOIN game_sessions gs ON gr.id = gs.room_id 
  AND gs.status = 'end'
  AND gs.updated_at >= $1 
  AND gs.updated_at <= $2
LEFT JOIN game_join_rooms gjr ON gs.id = gjr.session_id 
  AND gjr.status = 'executed'
WHERE gr.status != 'delete'
GROUP BY gr.id, gr.name, gr.owner_id, u.username, gr.participation_amount
HAVING SUM(CAST(gjr.amount AS DECIMAL)) > 0
ORDER BY total_revenue DESC
LIMIT 5
```

## 📊 Dashboard Statistics API

### GET `/api/v1/admin/stats/dashboard-stats`

Lấy các thống kê tổng quan cho dashboard admin với khả năng lọc theo khoảng thời gian.

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
  "message": "Dashboard stats fetched successfully",
  "data": {
    "total_user": 1250,
    "active_user": 450,
    "total_master": 85,
    "active_room": 12,
    "complete_room": 8,
    "total_sessions": 156
  }
}
```

#### 📋 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `total_user` | number | Tổng số user đã đăng ký (tính đến thời điểm kết thúc) |
| `active_user` | number | Số user hoạt động (đã join sessions có status pending/running trong khoảng thời gian) |
| `total_master` | number | Tổng số master (user có is_master = true) |
| `active_room` | number | Số room đang hoạt động (có session mới nhất status = 'pending') |
| `complete_room` | number | Số room đã hoàn thành (có session mới nhất status = 'end') |
| `total_sessions` | number | Tổng số sessions đã kết thúc trong khoảng thời gian |

#### 🔍 Business Logic

- **Total User**: Đếm tất cả user đã tạo trước thời điểm kết thúc
- **Active User**: Đếm user unique đã join sessions có status 'pending' hoặc 'running' trong khoảng thời gian (dựa trên created_at của sessions)
- **Total Master**: Đếm user có trường is_master = true
- **Active Room**: Đếm room có session mới nhất có status = 'pending'
- **Complete Room**: Đếm room có session mới nhất có status = 'end'
- **Total Sessions**: Đếm sessions có status = 'end' và updated_at trong khoảng thời gian

#### 📝 Example Usage

```bash
# Lấy dashboard stats hôm nay
GET /api/v1/admin/stats/dashboard-stats?time_filter=today

# Lấy dashboard stats tuần này
GET /api/v1/admin/stats/dashboard-stats?time_filter=week

# Lấy dashboard stats tháng này
GET /api/v1/admin/stats/dashboard-stats?time_filter=month

# Lấy dashboard stats trong khoảng thời gian tùy chỉnh
GET /api/v1/admin/stats/dashboard-stats?time_filter=custom&start_date=2024-01-01&end_date=2024-01-31
```

#### Dashboard Stats Queries

```sql
-- Total Users
SELECT COUNT(*) as total_user
FROM users 
WHERE created_at <= $1

-- Active Users
SELECT COUNT(DISTINCT gjr.user_id) as active_user
FROM game_join_rooms gjr
INNER JOIN game_sessions gs ON gjr.session_id = gs.id
WHERE gs.created_at >= $1 
  AND gs.created_at <= $2
  AND gs.status IN ('pending', 'running')
  AND gjr.status = 'executed'

-- Total Masters
SELECT COUNT(*) as total_master
FROM users 
WHERE is_master = true

-- Active Rooms (latest session status = 'pending')
SELECT COUNT(DISTINCT gr.id) as active_room
FROM game_rooms gr
INNER JOIN (
  SELECT room_id, MAX(created_at) as latest_session_time
  FROM game_sessions
  GROUP BY room_id
) latest_sessions ON gr.id = latest_sessions.room_id
INNER JOIN game_sessions gs ON gr.id = gs.room_id 
  AND gs.created_at = latest_sessions.latest_session_time
  AND gs.status = 'pending'
WHERE gr.status != 'delete'

-- Complete Rooms (latest session status = 'end')
SELECT COUNT(DISTINCT gr.id) as complete_room
FROM game_rooms gr
INNER JOIN (
  SELECT room_id, MAX(created_at) as latest_session_time
  FROM game_sessions
  GROUP BY room_id
) latest_sessions ON gr.id = latest_sessions.room_id
INNER JOIN game_sessions gs ON gr.id = gs.room_id 
  AND gs.created_at = latest_sessions.latest_session_time
  AND gs.status = 'end'
WHERE gr.status != 'delete'

-- Total Sessions
SELECT COUNT(*) as total_sessions
FROM game_sessions 
WHERE status = 'end'
  AND updated_at >= $1 
  AND updated_at <= $2
```
