# Admin Game Rooms API

## 📋 Tổng quan

API quản lý danh sách phòng game dành cho admin, cung cấp thông tin chi tiết về các phòng game, sessions, và thống kê.

## 🚀 Endpoints

### GET `/api/v1/admin/games/rooms`

Lấy danh sách phòng game với phân trang và bộ lọc.

#### 🔐 Authentication
- **Required**: Admin JWT Token
- **Guard**: `AdminJwtAuthGuard` + `PermissionGuard`
- **Permission**: Cần quyền truy cập module GAMES

#### 📝 Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Trang hiện tại |
| `limit` | number | No | 10 | Số lượng items per page |
| `search` | string | No | - | Tìm kiếm theo tên phòng, username master, hoặc ID phòng |
| `game_type_id` | number | No | - | Lọc theo loại game |
| `status` | string | No | - | Lọc theo trạng thái session hiện tại |

#### 📊 Response Format

```json
{
    "data": [
        {
            "id": 92,
            "name": "890",
            "game_type": {
                "id": 1,
                "name": "Xổ số BLOCKCHAIN",
                "symbol": "symbol"
            },
            "master": {
                "id": 142862,
                "username": "Dautay",
                "fullname": "Dautay"
            },
            "current_session_status": "pending",
            "total_sessions": 34,
            "total_amount": 425,
            "total_pnl": 0.3599999999999978,
            "current_players_count": 0
        }
    ],
    "pagination": {
        "page": 1,
        "limit": "1",
        "total": 92,
        "total_pages": 92,
        "has_next": true,
        "has_prev": false
    }
}```

#### 📋 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của phòng game |
| `name` | string | Tên phòng game |
| `game_type` | object | Thông tin loại game |
| `game_type.id` | number | ID loại game |
| `game_type.name` | string | Tên loại game |
| `game_type.symbol` | string | Symbol loại game |
| `master` | object | Thông tin chủ phòng |
| `master.id` | number | ID người dùng |
| `master.username` | string | Username |
| `master.fullname` | string | Tên đầy đủ |
| `current_session_status` | string\|null | Trạng thái session hiện tại |
| `total_sessions` | number | Tổng số sessions |
| `total_amount` | number | Tổng số tiền thu được |
| `total_pnl` | number | Tổng số lợi nhuận của phòng |
| `current_players_count` | number | Số người chơi hiện tại |

---

### GET `/api/v1/admin/games/rooms/:id`

Lấy thông tin chi tiết của một phòng game cụ thể.

#### 🔐 Authentication
- **Required**: Admin JWT Token
- **Guard**: `AdminJwtAuthGuard` + `PermissionGuard`
- **Permission**: Cần quyền truy cập module GAMES

#### 📝 Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | ✅ | ID của phòng game |

#### 📊 Response Format

```json
{
    "data": {
        "id": 87,
        "name": "the yeu doi 4",
        "symbol": "GOLD",
        "participation_amount": 100,
        "total_amount": 3100,
        "total_prizes": 2160,
        "total_pnl": 456,
        "prizes_num": 1,
        "status": "run",
        "game_type": {
            "id": 1,
            "name": "Xổ số BLOCKCHAIN",
            "symbol": "symbol"
        },
        "master": {
            "id": 142859,
            "username": "tranthe",
            "fullname": "HIEUTHUHAI",
            "email": "tranthe2k2ak@gmail.com"
        },
        "current_session": {
            "id": 587432,
            "status": "pending",
            "time_start": "2025-10-27T09:08:52.308Z",
            "session": "1761555942308",
            "players_count": 0,
            "pnl_amount": 0
        },
        "game_set_prizes": [
            {
                "rank": 1,
                "percent": 100
            }
        ],
        "total_sessions": 9,
        "created_at": "2025-10-27T09:08:18.851Z",
        "updated_at": "2025-10-27T09:08:18.851Z"
    }
}
```

#### 📋 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của phòng game |
| `name` | string | Tên phòng game |
| `symbol` | string | Ký hiệu phòng |
| `participation_amount` | number | Số tiền tham gia |
| `total_amount` | number | Tổng số tiền thu được |
| `total_pnl` | number | Tổng số lợi nhuận của phòng |
| `prizes_num` | number | Số lượng giải thưởng |
| `status` | string | Trạng thái phòng |
| `game_type` | object | Thông tin loại game |
| `master` | object | Thông tin chủ phòng |
| `current_session` | object\|null | Session hiện tại |
| `game_set_prizes` | array | Danh sách giải thưởng |
| `total_sessions` | number | Tổng số sessions |
| `created_at` | string | Thời gian tạo |
| `updated_at` | string | Thời gian cập nhật |

#### ❌ Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid room ID |
| 404 | Game room not found |
| 401 | Unauthorized |
| 403 | Forbidden |

#### 📝 Example Usage

```bash
# Lấy thông tin chi tiết phòng game ID 292
GET /api/v1/admin/games/rooms/292
```

---

### GET `/api/v1/admin/games/rooms/:id/sessions`

Lấy danh sách phiên game của một phòng cụ thể với phân trang.

#### 🔐 Authentication
- **Required**: Admin JWT Token
- **Guard**: `AdminJwtAuthGuard` + `PermissionGuard`
- **Permission**: Cần quyền truy cập module GAMES

#### 📝 Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | ✅ | ID của phòng game |

#### 📝 Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Trang hiện tại |
| `limit` | number | No | 10 | Số lượng items per page |
| `status` | string | No | - | Lọc theo trạng thái session |
| `has_players` | boolean | No | true | Chỉ lấy session có người chơi |

#### 📊 Response Format

```json
{
  "data": [
    {
      "id": 339640,
      "status": "running",
      "time_start": "2025-10-04T10:02:49.009Z",
      "session": "game_room_273_session_001",
      "players_count": 8,
      "total_amount": 40.0,
      "created_at": "2025-10-04T10:02:49.009Z"
    },
    {
      "id": 339639,
      "status": "end",
      "time_start": "2025-10-04T09:30:15.000Z",
      "session": "game_room_273_session_000",
      "players_count": 5,
      "total_amount": 25.0,
      "created_at": "2025-10-04T09:30:15.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "total_pages": 2,
    "has_next": true,
    "has_prev": false
  }
}
```

#### 📋 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của session |
| `status` | string | Trạng thái session |
| `time_start` | string | Thời gian bắt đầu session |
| `session` | string | Tên session |
| `players_count` | number | Số người chơi trong session |
| `total_amount` | number | Tổng số tiền trong session |
| `pnl_amount` | number | Tổng số lợi nhuận mỗi phiên |
| `created_at` | string | Thời gian tạo session |

#### 🔍 Business Logic

##### Sessions with Players Only (Default)
- Mặc định chỉ trả về các session có ít nhất 1 người chơi (status = 'executed')
- Sử dụng `HAVING COUNT(gjr.id) > 0` để filter
- Có thể tắt bằng cách set `has_players=false`

##### Filter Logic
- **Status**: `gs.status = :status`
- **Has Players**: Mặc định `true`, chỉ lấy session có người chơi
- **Room Validation**: Kiểm tra phòng tồn tại và không bị DELETE

#### ⚡ Performance Optimization
- **Group By**: Group by session để đếm players
- **Raw SQL**: Sử dụng raw SQL cho thống kê phức tạp
- **Batch Queries**: Tách riêng query chính và query thống kê
- **Room Validation**: Kiểm tra phòng trước khi query sessions

#### 📝 Example Usage

```bash
# Lấy danh sách session của phòng ID 273
GET /api/v1/admin/games/rooms/273/sessions

# Lọc theo trạng thái đang chạy
GET /api/v1/admin/games/rooms/273/sessions?status=running

# Lấy tất cả session (kể cả không có người chơi)
GET /api/v1/admin/games/rooms/273/sessions?has_players=false

# Phân trang
GET /api/v1/admin/games/rooms/273/sessions?page=2&limit=20

# Kết hợp filter
GET /api/v1/admin/games/rooms/273/sessions?status=end&page=1&limit=5
```

---

### GET `/api/v1/admin/games/stats`

Lấy thống kê tổng quan về các phòng game.

#### 🔐 Authentication
- **Required**: Admin JWT Token
- **Guard**: `AdminJwtAuthGuard` + `PermissionGuard`
- **Permission**: Cần quyền truy cập module GAMES

#### 📝 Query Parameters
Không có query parameters.

#### 📊 Response Format

```json
{
    "data": {
        "total_rooms": 92,
        "total_amount": 69200,
        "total_prizes": 26286.14,
        "total_pnl": 7710.21,
        "rooms_running": 1,
        "rooms_pending": 91
    }
}
```

#### 📋 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `total_rooms` | number | Tổng số phòng game |
| `total_amount` | number | Tổng số tiền thu được từ tất cả phòng |
| `total_pnl` | number | Tổng số loi nhuan cua tat ca cac phong |
| `rooms_running` | number | Số phòng đang chạy (session mới nhất có status = 'running') |
| `rooms_pending` | number | Số phòng đang chờ (session mới nhất có status = 'pending') |

#### 🔍 Business Logic

##### Total Rooms
- Đếm tổng số phòng game trong hệ thống
- Bao gồm tất cả trạng thái

##### Total Amount All Rooms
- Tổng số tiền thu được từ tất cả phòng game
- Lấy trực tiếp từ bảng `game_rooms.total_amount`
- Không cần tính toán phức tạp

##### Rooms Running
- Số phòng có session mới nhất đang chạy
- Dựa trên trạng thái session mới nhất của mỗi phòng

##### Rooms Pending
- Số phòng có session mới nhất đang chờ
- Dựa trên trạng thái session mới nhất của mỗi phòng

#### ⚡ Performance Optimization

- **Single Query**: Sử dụng một query duy nhất để lấy tất cả thống kê
- **Subquery Optimization**: Sử dụng `DISTINCT ON` để lấy session mới nhất hiệu quả
- **Aggregation**: Tính toán thống kê ở database level

#### 📝 Example Usage

```bash
# Lấy thống kê tổng quan
GET /api/v1/admin/games/stats
```

---

## 🔍 Business Logic (Chung)

##### Current Session Status
- Lấy trạng thái của session **mới nhất** trong phòng
- Có thể là: `pending`, `running`, `out`, `end`
- Trả về `null` nếu không có session nào

##### Total Sessions
- Đếm tổng số sessions đã tạo trong phòng
- Bao gồm tất cả trạng thái: `pending`, `running`, `out`, `end`

##### Total Amount All Sessions
- Tổng số tiền thu được từ phòng game
- Lấy trực tiếp từ bảng `game_rooms.total_amount`
- Không cần tính toán phức tạp

##### Current Players Count
- Số người chơi trong session **mới nhất** có trạng thái `running` hoặc `pending`
- Sử dụng `DISTINCT` để tránh đếm trùng lặp
- Chỉ tính session mới nhất, không tính các sessions cũ

#### 🔎 Search Logic

Tìm kiếm theo:
- **Tên phòng**: `gr.name ILIKE '%search%'`
- **Username master**: `owner.username ILIKE '%search%'`
- **ID phòng**: `CAST(gr.id AS TEXT) ILIKE '%search%'`

#### 🎯 Filter Logic

##### Game Type Filter
```sql
WHERE gt.id = :game_type_id
```

##### Status Filter
```sql
WHERE current_session_status = :status
```

#### ⚡ Performance Optimization

- **Pagination**: Sử dụng `skip` và `take` để phân trang hiệu quả
- **Batch Queries**: Tách riêng query chính và query thống kê
- **Raw SQL**: Sử dụng raw SQL cho các tính toán phức tạp
- **Indexing**: Đảm bảo có index trên các cột thường query

#### 🚨 Error Handling

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 401 | Unauthorized (chưa đăng nhập) |
| 403 | Forbidden (không có quyền) |
| 500 | Internal Server Error |

#### 📝 Example Usage

```bash
# Lấy trang đầu tiên
GET /api/v1/admin/games/rooms

# Tìm kiếm phòng có tên chứa "test"
GET /api/v1/admin/games/rooms?search=test

# Lọc theo loại game Lottery
GET /api/v1/admin/games/rooms?game_type_id=1

# Lọc theo trạng thái đang chạy
GET /api/v1/admin/games/rooms?status=running

# Kết hợp nhiều filter
GET /api/v1/admin/games/rooms?search=test&game_type_id=1&status=running&page=2&limit=20
```

#### 🔧 Database Schema

##### Tables Used
- `game_rooms` - Thông tin phòng game
- `game_sessions` - Thông tin sessions
- `game_join_rooms` - Thông tin người chơi tham gia
- `game_lists` - Danh sách loại game
- `users` - Thông tin người dùng

##### Key Relationships
- `game_rooms.game_type_id` → `game_lists.id`
- `game_rooms.owner_id` → `users.id`
- `game_sessions.room_id` → `game_rooms.id`
- `game_join_rooms.session_id` → `game_sessions.id`

#### 📈 Monitoring & Logging

- **Success Logs**: Ghi log số lượng rooms tìm thấy
- **Error Logs**: Ghi log chi tiết khi có lỗi
- **Performance**: Monitor query execution time
- **Usage**: Track API call frequency

---

### GET `/api/v1/admin/games/sessions/count`

Lấy tổng số session có trạng thái "end" với khả năng lọc theo khoảng thời gian.

#### 🔐 Authentication
- **Required**: Admin JWT Token
- **Guard**: `AdminJwtAuthGuard` + `PermissionGuard`
- **Permission**: Cần quyền truy cập module GAMES

#### 📝 Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `time_filter` | string | No | today | Bộ lọc thời gian: `today`, `week`, `month`, `custom` |
| `start_date` | string | No | - | Ngày bắt đầu (chỉ dùng với `time_filter=custom`, format: YYYY-MM-DD) |
| `end_date` | string | No | - | Ngày kết thúc (chỉ dùng với `time_filter=custom`, format: YYYY-MM-DD) |

#### 📊 Response Format

```json
{
  "data": {
    "total_ended_sessions": 150,
    "time_filter": "today",
    "start_date": "2025-01-15",
    "end_date": "2025-01-15"
  }
}
```

#### 📋 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `total_ended_sessions` | number | Tổng số session có trạng thái "end" |
| `time_filter` | string | Bộ lọc thời gian được áp dụng |
| `start_date` | string | Ngày bắt đầu của khoảng thời gian |
| `end_date` | string | Ngày kết thúc của khoảng thời gian |

#### 🔍 Business Logic

##### Time Filter Options
- **today**: Đếm session kết thúc trong ngày hiện tại (00:00:00 - 23:59:59)
- **week**: Đếm session kết thúc trong 7 ngày gần nhất
- **month**: Đếm session kết thúc trong 1 tháng gần nhất
- **custom**: Đếm session kết thúc trong khoảng thời gian tùy chỉnh

##### Session Status Filter
- Chỉ đếm các session có `status = 'end'`
- Sử dụng `created_at` để lọc theo thời gian

##### Custom Date Range Validation
- Khi sử dụng `time_filter=custom`, bắt buộc phải có `start_date` và `end_date`
- Format ngày: `YYYY-MM-DD`
- Tự động set giờ: `start_date` = 00:00:00, `end_date` = 23:59:59

#### ⚡ Performance Optimization
- **Single Query**: Sử dụng một query duy nhất để đếm session
- **Index Optimization**: Tận dụng index trên `status` và `created_at`
- **Date Range Filtering**: Filter ở database level để tối ưu performance

#### 📝 Example Usage

```bash
# Đếm session kết thúc hôm nay
GET /api/v1/admin/games/sessions/count?time_filter=today

# Đếm session kết thúc trong tuần qua
GET /api/v1/admin/games/sessions/count?time_filter=week

# Đếm session kết thúc trong tháng qua
GET /api/v1/admin/games/sessions/count?time_filter=month

# Đếm session kết thúc trong khoảng thời gian tùy chỉnh
GET /api/v1/admin/games/sessions/count?time_filter=custom&start_date=2025-01-01&end_date=2025-01-31

# Mặc định (hôm nay)
GET /api/v1/admin/games/sessions/count
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
- `game_sessions` - Thông tin sessions

##### Key Fields
- `status` - Trạng thái session (filter: 'end')
- `created_at` - Thời gian tạo session (dùng để lọc theo thời gian)

---

### GET `/api/v1/admin/games/rooms/top`

Lấy top 5 phòng game có tổng số tiền (total_amount) cao nhất.

#### 🔐 Authentication
- **Required**: Admin JWT Token
- **Guard**: `AdminJwtAuthGuard` + `PermissionGuard`
- **Permission**: Cần quyền truy cập module GAMES

#### 📝 Query Parameters
Không có query parameters. API luôn trả về top 5 phòng có total_amount cao nhất.

#### 📊 Response Format

```json
{
  "data": [
    {
      "id": 292,
      "name": "Premium Room",
      "total_amount": 50000,
      "game_type": {
        "id": 1,
        "name": "Xổ số BLOCKCHAIN",
        "symbol": "symbol"
      },
      "master": {
        "id": 142859,
        "username": "tranthe",
        "fullname": "Trần Tiến Thế"
      },
      "current_session_status": "running",
      "total_sessions": 15,
      "current_players_count": 8
    },
    {
      "id": 291,
      "name": "VIP Room",
      "total_amount": 45000,
      "game_type": {
        "id": 2,
        "name": "Lottery Game",
        "symbol": "LOT"
      },
      "master": {
        "id": 142860,
        "username": "admin",
        "fullname": "Admin User"
      },
      "current_session_status": "pending",
      "total_sessions": 12,
      "current_players_count": 5
    }
  ]
}
```

#### 📋 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của phòng game |
| `name` | string | Tên phòng game |
| `total_amount` | number | Tổng số tiền thu được từ phòng |
| `game_type` | object | Thông tin loại game |
| `game_type.id` | number | ID loại game |
| `game_type.name` | string | Tên loại game |
| `game_type.symbol` | string | Symbol loại game |
| `master` | object | Thông tin chủ phòng |
| `master.id` | number | ID người dùng |
| `master.username` | string | Username |
| `master.fullname` | string | Tên đầy đủ |
| `current_session_status` | string\|null | Trạng thái session hiện tại |
| `total_sessions` | number | Tổng số sessions |
| `current_players_count` | number | Số người chơi hiện tại |

#### 🔍 Business Logic

##### Top 5 Ranking
- Luôn trả về đúng 5 phòng game
- Sắp xếp theo `total_amount` giảm dần (DESC)
- Chỉ lấy phòng không bị xóa (`status != 'delete'`)

##### Current Session Status
- Lấy trạng thái của session **mới nhất** trong phòng
- Có thể là: `pending`, `running`, `out`, `end`
- Trả về `null` nếu không có session nào

##### Total Sessions
- Đếm tổng số sessions đã tạo trong phòng
- Bao gồm tất cả trạng thái: `pending`, `running`, `out`, `end`

##### Current Players Count
- Số người chơi trong session **mới nhất** có trạng thái `running` hoặc `pending`
- Sử dụng `DISTINCT` để tránh đếm trùng lặp
- Chỉ tính session mới nhất, không tính các sessions cũ

#### ⚡ Performance Optimization
- **Single Query**: Sử dụng một query chính để lấy top 5 rooms
- **Batch Stats Query**: Tách riêng query thống kê để tối ưu performance
- **Raw SQL**: Sử dụng raw SQL cho các tính toán phức tạp
- **Index Optimization**: Tận dụng index trên `total_amount` và `status`

#### 📝 Example Usage

```bash
# Lấy top 5 phòng có total_amount cao nhất
GET /api/v1/admin/games/rooms/top
```

#### ❌ Error Responses

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 401 | Unauthorized |
| 403 | Forbidden |
| 500 | Internal Server Error |

#### 🔧 Database Schema

##### Tables Used
- `game_rooms` - Thông tin phòng game
- `game_sessions` - Thông tin sessions
- `game_join_rooms` - Thông tin người chơi tham gia
- `game_lists` - Danh sách loại game
- `users` - Thông tin người dùng

##### Key Fields
- `total_amount` - Tổng số tiền thu được (dùng để sắp xếp)
- `status` - Trạng thái phòng (filter: != 'delete')
- `created_at` - Thời gian tạo session (dùng để lấy session mới nhất)

---

## 🛠️ Development Notes

### Dependencies
- `@nestjs/common`
- `@nestjs/typeorm`
- `typeorm`
- `AdminJwtAuthGuard`
- `PermissionGuard`

### Files Structure
```
src/modules/admin/games/
├── game.controller.ts    # API endpoints
├── game.service.ts       # Business logic
├── game.module.ts        # Module configuration
├── game.dto.ts           # Data transfer objects
└── README.md            # Documentation
```

### Testing
- Unit tests cho service methods
- Integration tests cho API endpoints
- Performance tests cho large datasets
