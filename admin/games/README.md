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
      "id": 292,
      "name": "nhan ok",
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
      "total_amount": 50000,
      "current_players_count": 8
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 290,
    "total_pages": 29,
    "has_next": true,
    "has_prev": false
  }
}
```

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
| `total_prizes` | number | Tổng số tiền trả thưởng |
| `pnl_rate` | number | Lợi nhuận |
| `current_players_count` | number | Số người chơi hiện tại |

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
    "total_rooms": 290,
    "total_amount": 1500000,
    "rooms_running": 25,
    "rooms_pending": 15
  }
}
```

#### 📋 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `total_rooms` | number | Tổng số phòng game |
| `total_amount` | number | Tổng số tiền thu được từ tất cả phòng |
| `total_prizes` | number | Tổng số tiền trả thưởng của tất cả phòng |
| `pnl_rate` | number | Lợi nhuận của tất cả các phòng |
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
