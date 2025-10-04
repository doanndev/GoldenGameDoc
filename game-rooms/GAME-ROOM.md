# Game Rooms Module

## Overview
Module quản lý phòng game, bao gồm tạo phòng, cập nhật, xóa, và lấy danh sách phòng game với các tính năng phân trang và tìm kiếm.

## Features
- ✅ **Create Game Room** - Tạo phòng game với validation đầy đủ
- ✅ **Get All Game Rooms** - Lấy danh sách phòng game với phân trang
- ✅ **Get Game Room by ID** - Lấy thông tin chi tiết phòng game
- ✅ **Update Game Room** - Cập nhật thông tin phòng game
- ✅ **Delete Game Room** - Xóa phòng game
- ✅ **Pagination Support** - Hỗ trợ phân trang cho danh sách
- ✅ **Advanced Validation** - Validation phức tạp cho prizes và percentages

## API Endpoints

### 1. Create Game Room
**POST** `/game-rooms`

Tạo phòng game mới với thông tin phòng và cấu hình giải thưởng.

#### Request Body
```json
{
  "game_room": {
    "name": "Game Room 123",
    "symbol": "GOLD",
    "participation_amount": 100.50,
    "prizes_num": 3
  },
  "game_set_prizes": [
    {
      "rank": 1,
      "percent": 60.00
    },
    {
      "rank": 2,
      "percent": 30.00
    },
    {
      "rank": 3,
      "percent": 10.00
    }
  ],
  "game_type_id": 1
}
```

#### Request Body Fields
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `game_room` | object | Yes | - | Thông tin phòng game |
| `game_room.name` | string | No | 3-20 chars | Tên phòng game |
| `game_room.symbol` | string | No | - | Ký hiệu phòng |
| `game_room.participation_amount` | number | Yes | 0.01-1000 | Số tiền tham gia |
| `game_room.prizes_num` | number | Yes | 1-20 | Số lượng giải thưởng |
| `game_set_prizes` | array | Yes | 1-20 items | Danh sách giải thưởng |
| `game_set_prizes[].rank` | number | Yes | 1-20 | Thứ hạng giải |
| `game_set_prizes[].percent` | number | Yes | 0.01-100 | Phần trăm giải |
| `game_type_id` | number | Yes | 1+ | ID loại game |

#### Validation Rules
- Tổng phần trăm tất cả giải phải bằng 100%
- Thứ hạng phải tuần tự từ 1
- Phần trăm phải giảm dần theo thứ hạng

#### Success Response (201)
```json
{
  "message": "Game room created successfully"
}
```

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Bad Request | Dữ liệu đầu vào không hợp lệ |
| 401 | Unauthorized | Token không hợp lệ |
| 500 | Internal Server Error | Lỗi server |

---

### 2. Get All Game Rooms
**GET** `/game-rooms`

Lấy danh sách tất cả phòng game với phân trang và tìm kiếm.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `session_id` | number | No | 0 | ID của session |
| `page` | number | No | 1 | Số trang |
| `limit` | number | No | 6 | Số lượng items per page |
| `room_id` | number | No | 0 | ID của phòng |
| `game_type_id` | number | No | 0 | ID loại game |
| `status` | string | No | - | Trạng thái phòng |
| `host` | string | No | - | Nick name |
| `name` | string | No | - | ên của phòng |
| `search` | string | No | - | Từ khóa tìm kiếm |

#### Example Request
```
GET /game-rooms?page=1&limit=10&game_type_id=1&status=running
```

#### Success Response (200)
```json
{
    "data": [
        {
            "id": 273,
            "name": "12345",
            "symbol": "GOLD",
            "participation_amount": 5,
            "prizes_num": 2,
            "total_amount": 10,
            "status": "running",
            "game_type_id": {
                "id": 1,
                "name": "Xổ số BLOCKCHAIN",
                "symbol": "symbol",
                "status": "active"
            },
            "owner_id": {
                "id": 142862,
                "username": "Dautay"
            },
            "current_session": {
                "id": 339640,
                "status": "running",
                "time_start": "2025-10-04T10:02:49.009Z",
                "session": "game_room_273_ggame_room_273_3game_room_273_tgame_room_273_ngame_room_273_3game_room_273_0game_room_273_vgame_room_273_7"
            }
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 1,
        "total": 201,
        "totalPages": 201,
        "hasNext": true,
        "hasPrev": false
    }
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Danh sách phòng game |
| `pagination` | object | Thông tin phân trang |

#### Data Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của phòng |
| `name` | string | Tên phòng |
| `symbol` | string | Ký hiệu phòng |
| `participation_amount` | number | Số tiền tham gia |
| `prizes_num` | number | Số lượng giải thưởng |
| `total_amount` | number | Tổng số tiền tham gia |
| `status` | string | Trạng thái phòng |
| `game_type_id` | object | Thông tin loại game |
| `owner_id` | object | Thông tin chủ phòng |
| `current_session` | object | Session hiện tại |

---

### 3. Get Game Room by ID
**GET** `/game-rooms/find-by-id`

Lấy thông tin chi tiết phòng game theo ID.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room_id` | number | Yes | ID của phòng game |

#### Example Request
```
GET /game-rooms/find-by-id?room_id=123
```

#### Success Response (200)
```json
{
    "id": 280,
    "name": "Phong game ma soi 9",
    "symbol": "https://m.media-amazon.com/images/I/71GNE098B4L.jpg",
    "participation_amount": 20.5,
    "total_amount": 61,
    "game_type_id": {
        "id": 1,
        "name": "Xổ số BLOCKCHAIN",
        "symbol": "symbol"
    },
    "owner_id": {
        "id": 142859,
        "username": "tranthe"
    },
    "current_session": {
        "id": 341300,
        "status": "running",
        "time_start": "2025-10-04T15:36:39.466Z",
        "session": "1759592019466",
        "can_join": false
    },
    "game_set_prizes": [
        {
            "rank": 1,
            "percent": 60
        },
        {
            "rank": 2,
            "percent": 40
        }
    ],
    "timestamp": "2025-10-04T15:37:20.367Z"
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của phòng |
| `name` | string | Tên phòng |
| `symbol` | string | Ký hiệu phòng |
| `participation_amount` | number | Số tiền tham gia |
| `total_amount` | number | Tổng số tiền tham gia |
| `game_type_id` | object | Thông tin loại game |
| `owner_id` | object | Thông tin chủ phòng |
| `current_session` | object | Session hiện tại |
| `game_set_prizes` | array | Danh sách giải thưởng |
| `timestamp` | string | Thời gian tạo |

---

### 4. Update Game Room
**PATCH** `/game-rooms`

Cập nhật thông tin phòng game.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của phòng game cần cập nhật |

#### Request Body
```json
{
{
    "name_new": "Phòng game xổ số số 007 của triệu",
    "symbol": "SYMBOL 1111",
    "participation_amount_new": 25.5
}
```

#### Request Body Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name_new` | object | Yes | Thông tin irn phòng game cần cập nhật |
| `symbol` | string | No | Tên ký hiệu |
| `participation_amount_new` | string | No | Số tiền đặt cược |

#### Success Response (200)
```json
{
  "message": "Game room updated successfully"
}
```

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Bad Request | Dữ liệu đầu vào không hợp lệ |
| 401 | Unauthorized | Token không hợp lệ |
| 404 | Game room not found | Không tìm thấy phòng game |
| 500 | Internal Server Error | Lỗi server |

---

### 5. Delete Game Room
**DELETE** `/game-rooms`

Xóa phòng game.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của phòng game cần xóa |

#### Example Request
```
DELETE /game-rooms?id=123
```

#### Success Response (200)
```json
{
  "message": "Game room deleted successfully"
}
```

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 401 | Unauthorized | Token không hợp lệ |
| 404 | Game room not found | Không tìm thấy phòng game |
| 500 | Internal Server Error | Lỗi server |

---

## Data Transfer Objects (DTOs)

### CreateGameRoomBodyDto
Sử dụng cho API tạo phòng game

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `game_room` | GameRoomsDto | Yes | Thông tin phòng game |
| `game_set_prizes` | GameSetPrizesDto[] | Yes | Danh sách giải thưởng |
| `game_type_id` | number | Yes | ID loại game |

### GameRoomsDto
Thông tin cơ bản phòng game

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | No | 3-20 chars | Tên phòng |
| `symbol` | string | No | - | Ký hiệu phòng |
| `participation_amount` | number | Yes | 0.01-1000 | Số tiền tham gia |
| `prizes_num` | number | Yes | 1-20 | Số lượng giải |

### GameSetPrizesDto
Thông tin giải thưởng

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `rank` | number | Yes | 1-20 | Thứ hạng giải |
| `percent` | number | Yes | 0.01-100 | Phần trăm giải |

### GetGameRoomsQueryDto
Query parameters cho API lấy danh sách

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `session_id` | number | No | 0 | ID session |
| `page` | number | No | 1 | Số trang |
| `limit` | number | No | 6 | Số lượng per page |
| `room_id` | number | No | 0 | ID phòng |
| `game_type_id` | number | No | 0 | ID loại game |
| `status` | string | No | - | Trạng thái |
| `search` | string | No | - | Từ khóa tìm kiếm |

---

## Business Logic

### Room Creation Process
1. **Validation**: Kiểm tra dữ liệu đầu vào
2. **Prizes Validation**: Kiểm tra tổng phần trăm = 100%
3. **Rank Validation**: Kiểm tra thứ hạng tuần tự
4. **Percent Validation**: Kiểm tra phần trăm giảm dần
5. **Create Room**: Tạo phòng game mới
6. **Create Prizes**: Tạo cấu hình giải thưởng
7. **Response**: Trả về kết quả thành công

### Room Status Management
- **WAIT** → Phòng chờ người tham gia
- **RUNNING** → Phòng đang hoạt động
- **INACTIVE** → Phòng không hoạt động
- **DELETE** → Phòng đã bị xóa

### Total Amount Calculation
- Tính tổng số tiền tham gia từ các session RUNNING/END
- Chỉ tính participants có status EXECUTED
- Kiểm tra đủ số người tham gia theo số giải

---

## Usage Examples

### 1. Create Game Room
```bash
curl -X POST "{{BASE_URL}}/game-rooms" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "game_room": {
      "name": "Lucky Room",
      "symbol": "GOLD",
      "participation_amount": 100.50,
      "prizes_num": 3
    },
    "game_set_prizes": [
      { "rank": 1, "percent": 60.00 },
      { "rank": 2, "percent": 30.00 },
      { "rank": 3, "percent": 10.00 }
    ],
    "game_type_id": 1
  }'
```

### 2. Get All Game Rooms
```bash
curl -X GET "{{BASE_URL}}/game-rooms?page=1&limit=10&game_type_id=1" \
  -H "Authorization: Bearer <token>"
```

### 3. Get Game Room by ID
```bash
curl -X GET "{{BASE_URL}}/game-rooms/find-by-id?room_id=123" \
  -H "Authorization: Bearer <token>"
```

### 4. Update Game Room
```bash
curl -X PATCH "{{BASE_URL}}/game-rooms?id=123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
      "name": "Updated Room",
      "participation_amount": 150.0
  }'
```

### 5. Delete Game Room
```bash
curl -X DELETE "{{BASE_URL}}/game-rooms?id=123" \
  -H "Authorization: Bearer <token>"
```

---

## Notes
- Tất cả API đều yêu cầu authentication
- Validation phức tạp cho prizes (tổng 100%, thứ hạng tuần tự, phần trăm giảm dần)
- Hỗ trợ phân trang và tìm kiếm
- Tính toán total_amount dựa trên participants thực tế
- WebSocket events được trigger khi có thay đổi
