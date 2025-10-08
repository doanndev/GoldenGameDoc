# Game Join Room API Documentation

## Base URL
```
{{BASE_URL}}/game-join-rooms
```

## Authentication
Tất cả API đều yêu cầu JWT token trong header:
```
Authorization: Bearer <your-jwt-token>
```

---

## API Endpoints

### 1. Join Game Room
**POST** `/game-join-rooms`

Tham gia phòng game với session và số tiền cụ thể.

#### Request Body
```json
{
  "session_id": 123,
  "room_id": 456,
  "amount": 100.50
}
```

#### Request Body Fields
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `session_id` | number | Yes | Positive number | ID của session game |
| `room_id` | number | Yes | Positive number | ID của phòng game |
| `amount` | number | Yes | Number | Số tiền tham gia |

#### Success Response (201)
```json
{
  "message": "Successfully joined game room"
}
```

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Bad Request | Dữ liệu đầu vào không hợp lệ |
| 401 | Unauthorized | Token không hợp lệ hoặc hết hạn |
| 404 | Session not found | Không tìm thấy session |
| 404 | Room not found | Không tìm thấy phòng game |
| 409 | Already joined | Đã tham gia session này rồi |
| 500 | Internal Server Error | Lỗi server |

---

### 2. Get Joiners by Room
**GET** `/game-join-rooms/joiners`

Lấy danh sách người tham gia theo phòng game.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `room_id` | number | No | - | ID của phòng game |
| `session_id` | number | No | - | ID của session |
| `page` | number | No | 1 | Số trang |
| `limit` | number | No | 10 | Số lượng items per page |

#### Example Request
```
GET /game-join-rooms/joiners?room_id=123&page=1&limit=10
```

#### Success Response (200)
```json
{
    "data": [
        {
            "id": 649,
            "wallet_address": "EttPfSsK9GoszoUcfsLnnbnQHMy14H2PrsX1JctXPHxT",
            "amount": "30.5",
            "time_join": "2025-10-04T15:35:03.853Z",
            "tx_hash": "1234567890",
            "status": "executed",
            "user": {
                "id": 142859,
                "username": "tranthe",
                "fullname": "Trần Tiến Thế",
                "avatar": "https://www.shutterstock.com/image-photo/indoor-photo-hyperdetailed-realistic-baby-260nw-2474189777.jpg"
            }
        },
        {
            "id": 650,
            "wallet_address": "HqMj8L8Y5BVj3SnjHCaUoXBG5Cix7BmyGubZbyhg866C",
            "amount": "30.5",
            "time_join": "2025-10-04T15:35:29.214Z",
            "tx_hash": "1234567890",
            "status": "executed",
            "user": {
                "id": 142862,
                "username": "Dautay",
                "fullname": "Dautay",
                "avatar": "https://api.telegram.org/file/bot8216959304:AAG4GJ6Wu_zwDh_ejYJK6OV_1TGCswTnZyM/photos/file_0.jpg?inline=1"
            }
        }
    ],
    "totalAmount": 61,
    "currentSession": {
        "id": 341300,
        "session": "1759592019466",
        "time_start": "2025-10-04T15:36:39.466Z"
    },
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 2,
        "totalPages": 1,
        "hasNext": false,
        "hasPrev": false
    }
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Danh sách người tham gia |
| `pagination` | object | Thông tin phân trang |

#### Data Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của join record |
| `wallet_address` | string | Địa chỉ ví của user |
| `amount` | number | Số tiền tham gia |
| `time_join` | string | Thời gian join |
| `status` | string | Trạng thái join (executed/view/cancelled) |
| `user` | object | Thông tin user |
| `tx_hash` | object | Thông tin hash |

#### User Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của user |
| `username` | string | Tên đăng nhập |

#### Session Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của session |
| `status` | string | Trạng thái session |
| `time_start` | string | Thời gian bắt đầu session |

#### Room Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của phòng |
| `name` | string | Tên phòng |
| `symbol` | string | Ký hiệu phòng |

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Bad Request | Dữ liệu đầu vào không hợp lệ |
| 401 | Unauthorized | Token không hợp lệ |
| 500 | Internal Server Error | Lỗi server |

---

### 3. Get Joiner by Join ID
**GET** `/game-join-rooms/joiner`

Lấy thông tin người tham gia theo ID join.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `join_id` | number | Yes | ID của join record |

#### Example Request
```
GET /game-join-rooms/joiner?join_id=789
```

#### Success Response (200)
```json
{
    "id": 649,
    "wallet_address": "EttPfSsK9GoszoUcfsLnnbnQHMy14H2PrsX1JctXPHxT",
    "amount": "30.5",
    "total_amount": "0",
    "hash": "1234567890",
    "time_join": "2025-10-04T15:35:03.853Z",
    "status": "executed"
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `data` | object | Thông tin chi tiết người tham gia |

#### Data Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của join record |
| `wallet_address` | string | Địa chỉ ví của user |
| `amount` | number | Số tiền tham gia |
| `time_join` | string | Thời gian join |
| `status` | string | Trạng thái join (executed/view/cancelled) |
| `user` | object | Thông tin chi tiết user |
| `tx_hash` | object | Thông tin hash |

#### User Fields (Detailed)
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của user |
| `username` | string | Tên đăng nhập |
| `email` | string | Email của user |

#### Session Fields (Detailed)
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của session |
| `status` | string | Trạng thái session |
| `time_start` | string | Thời gian bắt đầu session |
| `session` | string | Mã session |

#### Room Fields (Detailed)
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của phòng |
| `name` | string | Tên phòng |
| `symbol` | string | Ký hiệu phòng |
| `game_type_id` | object | Thông tin loại game |
| `owner_id` | object | Thông tin chủ phòng |

#### Game Type Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của loại game |
| `name` | string | Tên loại game |
| `symbol` | string | Ký hiệu loại game |

#### Owner Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của chủ phòng |
| `username` | string | Tên đăng nhập chủ phòng |

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Bad Request | Dữ liệu đầu vào không hợp lệ |
| 401 | Unauthorized | Token không hợp lệ |
| 404 | Joiner not found | Không tìm thấy join record |
| 500 | Internal Server Error | Lỗi server |

---

## Data Transfer Objects (DTOs)

### GameJoinRoomDto
Sử dụng cho API Join Game Room

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `session_id` | number | Required, Positive | ID của session game |
| `room_id` | number | Required, Positive | ID của phòng game |
| `amount` | number | Required | Số tiền tham gia |

### GameJoinRoomQueryDto
Sử dụng cho các API GET với query parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | number | No | ID của session |
| `room_id` | number | No | ID của phòng game |
| `page` | number | No | Số trang (default: 1) |
| `limit` | number | No | Số lượng items per page (default: 10) |

---

## Business Logic

### Join Room Process
1. **Validation**: Kiểm tra session và room tồn tại
2. **Authentication**: Xác thực user từ JWT token
3. **Duplicate Check**: Kiểm tra user đã join session chưa
4. **Amount Validation**: Kiểm tra số tiền hợp lệ
5. **Create Record**: Tạo record join room mới
6. **Response**: Trả về kết quả thành công

### Session Management
- Session có thời hạn 3 phút để join
- User chỉ có thể join một lần cho mỗi session (unique constraint)
- Khi session bị cancel, hệ thống tự động tạo session mới sau 10 giây

---

## Usage Examples

### 1. Join Game Room
```bash
curl -X POST "{{BASE_URL}}/game-join-rooms" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "session_id": 123,
    "room_id": 456,
    "amount": 100.50
  }'
```

### 2. Get Joiners by Room
```bash
curl -X GET "{{BASE_URL}}/game-join-rooms/joiners?room_id=123&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "wallet_address": "0x1234567890abcdef...",
      "amount": 100.50,
      "time_join": "2024-01-01T00:00:00.000Z",
      "status": "executed",
      "user": { "id": 1, "username": "user123" },
      "session": { "id": 123, "status": "running" },
      "room": { "id": 456, "name": "Game Room 456" }
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

### 3. Get Joiner by Join ID
```bash
curl -X GET "{{BASE_URL}}/game-join-rooms/joiner?join_id=789" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "data": {
    "id": 789,
    "wallet_address": "0x1234567890abcdef...",
    "amount": 200.00,
    "time_join": "2024-01-01T00:00:00.000Z",
    "status": "executed",
    "user": { "id": 1, "username": "user123", "email": "user123@example.com" },
    "session": { "id": 123, "status": "running", "session": "1704067200000" },
    "room": { 
      "id": 456, 
      "name": "Game Room 456", 
      "symbol": "GOLD",
      "game_type_id": { "id": 1, "name": "Lottery" },
      "owner_id": { "id": 1, "username": "owner123" }
    }
  }
}
```

---


### 4. Get Expired Sessions with Participants
**GET** `/game-join-rooms/expired-sessions`

Lấy danh sách các session đã hết hạn (không đủ người tham gia sau 3 phút) cùng với danh sách người tham gia.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Số trang |
| `limit` | number | No | 10 | Số lượng items per page |

#### Example Request
```
GET /game-join-rooms/expired-sessions?page=1&limit=10
```

#### Success Response (200)
```json
{
    "data": [
        {
            "session": {
                "id": 123,
                "session": "1759731014627",
                "time_start": "2025-10-06T13:13:14.627Z",
                "status": "out",
                "room_id": 140
            },
            "participants": [
                {
                    "id": 649,
                    "wallet_address": "EttPfSsK9GoszoUcfsLnnbnQHMy14H2PrsX1JctXPHxT",
                    "amount": "30.5",
                    "time_join": "2025-10-04T15:35:03.853Z",
                    "status": "executed",
                    "user": {
                        "id": 142859,
                        "username": "tranthe"
                    }
                }
            ],
            "required_prizes": 2,
            "participants_count": 1,
            "is_insufficient": true
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

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Danh sách expired sessions |
| `pagination` | object | Thông tin phân trang |

#### Session Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của session |
| `session` | string | Mã session |
| `time_start` | string | Thời gian bắt đầu session |
| `status` | string | Trạng thái session (out) |
| `room_id` | number | ID của phòng game |

#### Participant Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của join record |
| `wallet_address` | string | Địa chỉ ví của user |
| `amount` | string | Số tiền tham gia |
| `time_join` | string | Thời gian join |
| `status` | string | Trạng thái join (executed) |
| `user` | object | Thông tin user |

#### User Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của user |
| `username` | string | Tên đăng nhập |

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Bad Request | Dữ liệu đầu vào không hợp lệ |
| 401 | Unauthorized | Token không hợp lệ |
| 500 | Internal Server Error | Lỗi server |

---

### 5. Process Expired Session Refund
**POST** `/game-join-rooms/process-refund`

Xử lý hoàn tiền cho session đã hết hạn (không đủ người tham gia sau 3 phút).

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_id` | number | Yes | ID của session cần xử lý hoàn tiền |

#### Example Request
```
POST /game-join-rooms/process-refund?session_id=123
```

#### Success Response (200)
```json
{
    "message": "Expired session refund processed successfully",
    "data": {
        "session": {
            "id": 123,
            "session": "1759731014627",
            "time_start": "2025-10-06T13:13:14.627Z",
            "status": "out"
        },
        "processed_participants": [
            {
                "id": 649,
                "wallet_address": "EttPfSsK9GoszoUcfsLnnbnQHMy14H2PrsX1JctXPHxT",
                "original_amount": 30.5,
                "refund_amount": 30.5,
                "user": {
                    "id": 142859,
                    "username": "tranthe"
                }
            }
        ],
        "financial_summary": {
            "total_original_amount": 30.5,
            "total_refund_amount": 30.5
        }
    }
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Thông báo kết quả |
| `data` | object | Dữ liệu chi tiết |

#### Session Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của session |
| `session` | string | Mã session |
| `time_start` | string | Thời gian bắt đầu session |
| `status` | string | Trạng thái session (out) |

#### Processed Participant Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của join record |
| `wallet_address` | string | Địa chỉ ví của user |
| `original_amount` | number | Số tiền gốc |
| `refund_amount` | number | Số tiền hoàn lại |
| `user` | object | Thông tin user |

#### Financial Summary Fields
| Field | Type | Description |
|-------|------|-------------|
| `total_original_amount` | number | Tổng số tiền gốc |
| `total_refund_amount` | number | Tổng số tiền hoàn lại |

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Bad Request | Dữ liệu đầu vào không hợp lệ |
| 401 | Unauthorized | Token không hợp lệ |
| 404 | Session not found | Không tìm thấy session |
| 500 | Internal Server Error | Lỗi server |

---

### 6. Get Joiners Refund
**GET** `/game-join-rooms/joiners-refund`

Lấy danh sách người tham gia đã được hoàn tiền cho một session cụ thể.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `session_id` | number | Yes | - | ID của session |
| `page` | number | No | 1 | Số trang |
| `limit` | number | No | 10 | Số lượng items per page |

#### Example Request
```
GET /game-join-rooms/joiners-refund?session_id=123&page=1&limit=10
```

#### Success Response (200)
```json
{
    "message": "Joiners refund data retrieved successfully",
    "data": [
        {
            "id": 649,
            "wallet_address": "EttPfSsK9GoszoUcfsLnnbnQHMy14H2PrsX1JctXPHxT",
            "amount": "30.5",
            "time_join": "2025-10-04T15:35:03.853Z",
            "status": "refunded",
            "user": {
                "id": 142859,
                "username": "tranthe"
            }
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

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Thông báo kết quả |
| `data` | array | Danh sách người tham gia đã hoàn tiền |
| `pagination` | object | Thông tin phân trang |

#### Joiner Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của join record |
| `wallet_address` | string | Địa chỉ ví của user |
| `amount` | string | Số tiền tham gia |
| `time_join` | string | Thời gian join |
| `status` | string | Trạng thái join (refunded) |
| `user` | object | Thông tin user |

#### User Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của user |
| `username` | string | Tên đăng nhập |

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Bad Request | Dữ liệu đầu vào không hợp lệ |
| 401 | Unauthorized | Token không hợp lệ |
| 404 | Session not found | Không tìm thấy session |
| 500 | Internal Server Error | Lỗi server |

---

## Data Transfer Objects (DTOs)

### GameJoinRoomDto
Sử dụng cho API Join Game Room

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `session_id` | number | Required, Positive | ID của session game |
| `room_id` | number | Required, Positive | ID của phòng game |
| `amount` | number | Required | Số tiền tham gia |

### GameJoinRoomQueryDto
Sử dụng cho các API GET với query parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | number | No | ID của session |
| `room_id` | number | No | ID của phòng game |
| `page` | number | No | Số trang (default: 1) |
| `limit` | number | No | Số lượng items per page (default: 10) |

---

## Business Logic

### Join Room Process
1. **Validation**: Kiểm tra session và room tồn tại
2. **Authentication**: Xác thực user từ JWT token
3. **Duplicate Check**: Kiểm tra user đã join session chưa
4. **Amount Validation**: Kiểm tra số tiền hợp lệ
5. **Create Record**: Tạo record join room mới
6. **Response**: Trả về kết quả thành công

### Session Management
- Session có thời hạn 3 phút để join
- User chỉ có thể join một lần cho mỗi session (unique constraint)
- Khi session bị cancel, hệ thống tự động tạo session mới sau 10 giây

### Refund Process
- Session được coi là expired khi không đủ người tham gia sau 3 phút
- Hệ thống tự động hoàn tiền 100% cho tất cả người tham gia (không thu phí penalty)
- Status của người tham gia được chuyển thành "refunded"

---

### 7. Get Game Rooms by User (Latest Sessions)
**GET** `/game-join-rooms/joiner-by-room`

Lấy danh sách các game room mà user đã tham gia, chỉ hiển thị session mới nhất với trạng thái pending/running/end.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `session_id` | number | No | - | ID của session (optional filter) |
| `room_id` | number | No | - | ID của phòng game (optional filter) |
| `page` | number | No | 1 | Số trang |
| `limit` | number | No | 10 | Số lượng items per page |

#### Example Request
```
GET /game-join-rooms/joiner-by-room?page=1&limit=10
```

#### Success Response (200)
```json
{
    "message": "Game join room fetched successfully",
    "data": [
        {
            "id": 649,
            "wallet_address": "EttPfSsK9GoszoUcfsLnnbnQHMy14H2PrsX1JctXPHxT",
            "amount": 30.5,
            "time_join": "2025-10-04T15:35:03.853Z",
            "status": "executed",
            "tx_hash": "1234567890",
            "session": {
                "id": 341300,
                "session": "1759592019466",
                "time_start": "2025-10-04T15:36:39.466Z",
                "status": "running"
            },
            "room": {
                "id": 140,
                "name": "Golden Room",
                "participation_amount": 30.5,
                "prizes_num": 2
            },
            "user": {
                "id": 142859,
                "username": "tranthe"
            }
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

## Usage Examples

### 1. Join Game Room
```bash
curl -X POST "{{BASE_URL}}/game-join-rooms" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "session_id": 123,
    "room_id": 456,
    "amount": 100.50
  }'
```

### 2. Get Joiners by Room
```bash
curl -X GET "{{BASE_URL}}/game-join-rooms/joiners?room_id=123&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### 3. Get Joiner by Join ID
```bash
curl -X GET "{{BASE_URL}}/game-join-rooms/joiner?join_id=789" \
  -H "Authorization: Bearer <token>"
```

### 4. Get Expired Sessions
```bash
curl -X GET "{{BASE_URL}}/game-join-rooms/expired-sessions?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### 5. Process Refund
```bash
curl -X POST "{{BASE_URL}}/game-join-rooms/process-refund?session_id=123" \
  -H "Authorization: Bearer <token>"
```

### 6. Get Joiners Refund
```bash
curl -X GET "{{BASE_URL}}/game-join-rooms/joiners-refund?session_id=123&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

---

## Notes
- Tất cả API đều yêu cầu authentication
- Session có thời hạn 3 phút để join
- User chỉ có thể join một lần cho mỗi session (unique constraint)
- Khi session bị cancel, hệ thống tự động tạo session mới sau 10 giây
- WebSocket events được trigger khi có thay đổi session status
