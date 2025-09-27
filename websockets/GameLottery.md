# Game Join Room API Documentation

## Overview
Module quản lý việc tham gia phòng game, bao gồm join room, kiểm tra thời hạn session, và xử lý các trường hợp session bị cancel.

## Base URL
```
{{BASE_URL}}/game-join-rooms
```

## Authentication
Tất cả các API đều yêu cầu JWT token trong header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. Join Game Room
**POST** `/game-join-rooms`

Tham gia vào một phòng game với session cụ thể.

#### Request Body
```json
{
    "session_id": 20,
    "room_id": 34,
    "amount": 25.5,
    "wallet_address": "EttPfSsK9GoszoUcfsLnnbnQHMy14H2PrsX1JctXPHxT",
    "tx_hash": "1234"
}
```

#### Request Body Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | number | Yes | ID của session game |
| `room_id` | number | Yes | ID của phòng game |
| `wallet_address` | string | Yes | Địa chỉ ví của user |
| `hash` | string | Yes | Hash giao dịch |
| `amount` | number | Yes | Số tiền tham gia |

#### Success Response (201)
```json
{
  "message": "Join room successfully"
}
```

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Invalid parameters | Thiếu tham số bắt buộc |
| 400 | Game room not found | Không tìm thấy phòng game |
| 400 | Game session not found | Không tìm thấy session |
| 400 | Wallet not connected | Ví chưa được kết nối |
| 400 | Insufficient balance | Số dư không đủ |
| 400 | You have already joined this room | Đã tham gia phòng này rồi |
| 400 | Session has already started for more than 3 minutes. You cannot join now. | Session đã hết hạn |
| 400 | Session has not started yet. Please wait for the session to begin. | Session chưa bắt đầu |
| 400 | Session has reached the maximum number of participants. | Đã đủ số người tham gia |
| 401 | Unauthorized | Token không hợp lệ |

---

### 2. Get Game Join Rooms
**GET** `/game-join-rooms`

Lấy danh sách các lần tham gia phòng game.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `session_id` | number | No | - | Lọc theo session ID |
| `room_id` | number | No | - | Lọc theo room ID |
| `page` | number | No | 1 | Số trang |
| `limit` | number | No | 10 | Số lượng items per page |

#### Example Request
```
GET /game-join-rooms?session_id=1&room_id=13&page=1&limit=10
```

#### Success Response (200)
```json
{
  "message": "Game join room fetched successfully",
  "data": [
    {
      "id": 1,
      "wallet_address": "0x1234567890abcdef...",
      "amount": 100,
      "time_join": "2024-01-01T00:00:00.000Z",
      "status": "view",
      "session": {
        "id": 1,
        "session": "1234567890",
        "time_start": "2024-01-01T00:03:00.000Z",
        "status": "wait"
      },
      "room": {
        "id": 13,
        "name": "Phòng game 003",
        "participation_amount": 10,
        "prizes_num": 3
      },
      "user": {
        "id": 1,
        "username": "user123"
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

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 401 | Unauthorized | Token không hợp lệ |
| 500 | Error fetching game join rooms | Lỗi server |

---

### 3. Check Session Expiry
**GET** `/game-join-rooms/check-session-expiry/:session_id/:room_id`

Kiểm tra thời hạn session và trạng thái có thể tham gia.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_id` | number | Yes | ID của session |
| `room_id` | number | Yes | ID của phòng game |

#### Example Request
```
GET /game-join-rooms/check-session-expiry/1/13
```

#### Success Response (200)
```json
{
  "isExpired": true,
  "shouldCancel": true,
  "message": "Session has been cancelled due to insufficient participants. Do you want to stay or leave?",
  "canContinue": false
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `isExpired` | boolean | Session đã hết hạn chưa |
| `shouldCancel` | boolean | Session có nên bị cancel không |
| `message` | string | Thông báo trạng thái |
| `canContinue` | boolean | Có thể tiếp tục tham gia không |

#### Possible Messages
- `"Session is still active"` - Session vẫn đang hoạt động
- `"Session has been cancelled due to insufficient participants. Do you want to stay or leave?"` - Session bị cancel do thiếu người tham gia
- `"Session has enough participants and will continue"` - Session có đủ người và sẽ tiếp tục

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Game session not found | Không tìm thấy session |
| 400 | Game room not found | Không tìm thấy phòng game |
| 401 | Unauthorized | Token không hợp lệ |
| 500 | Error checking session expiry | Lỗi server |

---

### 4. Handle Session Cancellation Choice
**POST** `/game-join-rooms/handle-cancellation-choice`

Xử lý lựa chọn của user khi session bị cancel (ở lại hoặc thoát).

#### Request Body
```json
{
  "session_id": 1,
  "room_id": 13,
  "choice": "stay"
}
```

#### Request Body Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | number | Yes | ID của session |
| `room_id` | number | Yes | ID của phòng game |
| `choice` | string | Yes | Lựa chọn: "stay" hoặc "leave" |

#### Success Response - Leave (200)
```json
{
  "message": "You have left the room successfully",
  "data": {
    "action": "left",
    "session_id": 1,
    "room_id": 13
  }
}
```

#### Success Response - Stay (200)
```json
{
  "message": "You have chosen to stay. A new session will start in 3 minutes",
  "data": {
    "action": "stayed",
    "new_session_id": 2,
    "new_session_start_time": "2024-01-01T00:03:00.000Z",
    "room_id": 13
  }
}
```

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Game session not found | Không tìm thấy session |
| 400 | Game room not found | Không tìm thấy phòng game |
| 400 | User not found | Không tìm thấy user |
| 401 | Unauthorized | Token không hợp lệ |
| 500 | Error handling session cancellation choice | Lỗi server |

---

## Business Logic

### Session Time Management
- Khi tạo session mới, `time_start` được set = thời gian hiện tại + 3 phút
- User chỉ có thể join trong vòng 3 phút sau khi session bắt đầu
- Sau 3 phút, nếu số người tham gia < số giải thưởng → Session bị cancel
- Sau 3 phút, nếu số người tham gia >= số giải thưởng → Session tiếp tục

### Room Status Flow
1. **WAIT** → User có thể join
2. **RUN** → Session đang chạy, không cho join mới
3. **INACTIVE** → Phòng không hoạt động
4. **DELETE** → Phòng đã bị xóa

### Session Status Flow
1. **WAIT** → Đang chờ người tham gia
2. **EXECUTED** → Session đã hoàn thành
3. **CANCELLED** → Session bị hủy

---

## Error Handling

### Common Error Codes
- `400 Bad Request` - Dữ liệu đầu vào không hợp lệ
- `401 Unauthorized` - Token không hợp lệ hoặc hết hạn
- `403 Forbidden` - Không có quyền truy cập
- `404 Not Found` - Không tìm thấy resource
- `500 Internal Server Error` - Lỗi server

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Error message description",
  "error": "Bad Request"
}
```

---

## Usage Examples

### 1. Join a Game Room
```bash
curl -X POST "{{BASE_URL}}/game-join-rooms" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 1,
    "room_id": 13,
    "wallet_address": "0x1234567890abcdef...",
    "hash": "0xabcdef1234567890...",
    "amount": 100
  }'
```

### 2. Get Join Rooms with Filters
```bash
curl -X GET "{{BASE_URL}}/game-join-rooms?session_id=1&room_id=13&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### 3. Check Session Expiry
```bash
curl -X GET "{{BASE_URL}}/game-join-rooms/check-session-expiry/1/13" \
  -H "Authorization: Bearer <token>"
```

### 4. Handle Cancellation Choice
```bash
curl -X POST "{{BASE_URL}}/game-join-rooms/handle-cancellation-choice" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 1,
    "room_id": 13,
    "choice": "stay"
  }'
```

---

## Notes
- Tất cả API đều yêu cầu authentication
- Session có thời hạn 3 phút để join
- User chỉ có thể join một lần cho mỗi session
- Khi session bị cancel, user có thể chọn ở lại (tạo session mới) hoặc thoát
