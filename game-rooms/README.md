# Game Rooms API Module

## Overview
The Game Rooms API module provides functionality for managing game rooms and game lists in a gaming platform. It allows users to create, update, delete, and retrieve game rooms with associated prize structures.

## Features
- **Game Lists Management**: Create and manage different types of games
- **Game Rooms Management**: Create, update, delete, and retrieve game rooms
- **Prize Structure Management**: Set up prize distributions with validation
- **User Authentication**: JWT-based authentication for protected endpoints
- **Master User Validation**: Only master users can manage game rooms

- URL
  ```http
  https://8w7n4n91-8008.asse.devtunnels.ms/api/v1
  ```

## API Endpoints

### Game Lists(/game-lists)

Endpoint: /game-lists

### Bảng `game_lists`

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | `integer` | Primary key |
| `name` | `varchar` | Tên coin (unique) |
| `symbol` | `varchar` | Ký hiệu coin (unique) |
| `status` | `enum` | 'active' hoặc 'inactive' |

#### 2. Get All Game Lists
```http
GET /
```

**Description**: Retrieve all available game lists

**Response**:
```json
{
  "message": "Game lists retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Slot Machine",
      "symbol": "SLOT"
    }
  ]
}
```

#### 3. Get Game List by ID
```http
GET /find-by-id?id=<:id>
```

**Description**: Retrieve a specific game list by ID

**Parameters**:
- `id` (number): Game list ID

**Response**:
```json
{
  "message": "Game list retrieved successfully",
  "data": {
    "id": 1,
    "name": "Slot Machine",
    "symbol": "SLOT"
  }
}
```

### Game Rooms(/game-rooms)

Endpoint: /game-rooms

### Bảng `game_rooms`

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `id` | `integer` | Primary key, tự động tăng |
| `game_type_id` | `GameLists` | ID loại game (Foreign key) |
| `current_session` | `GameSessions` | ID loại game (Foreign key). Trạng thái session (pending/running/out/end) |
| `owner_id` | `User` | ID chủ sở hữu phòng (Foreign key) |
| `name` | `varchar` | Tên phòng game |
| `symbol` | `varchar` | Ký hiệu phòng game (có thể null) |
| `participation_amount` | `decimal` | Số tiền tham gia |
| `total_amount` | `decimal` | Tổng số tiền tham gia của người chơi |
| `prizes_num` | `integer` | Số lượng giải thưởng |
| `game_set_prizes` | `integer` | Get giải thưởng |
| `join_room_num` | `integer` | Số người tham gia |
| `joiners` | `Người tham giá` | Số người tham gia |

#### Enum GameRoomStatus
- `RUNNING` = 'run' - Phòng đang chạy  
- `DELETE` = 'delete' - Phòng đã bị xóa

#### Mối quan hệ
- **game_type_id**: Liên kết với bảng `GameLists` (Many-to-One)
- **owner_id**: Liên kết với bảng `User` (Many-to-One)


#### 1. Create Game Room
```http
POST /
```

**Description**: Create a new game room with prize structure

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "game_room": {
    "name": "Phòng game 004",
    "participation_amount": 10.50,
    "prizes_num": 3
  },
  "game_set_prizes": [
    {
      "rank": 1,
      "percent": 50.00
    },
    {
      "rank": 2,
      "percent": 30.00
    },
    {
      "rank": 3,
      "percent": 20.00
    }
  ],
  "game_type_id": 1
}
```

**Validation Rules**:
- `participation_amount`: Number, 0-100, max 2 decimal places
- `prizes_num`: Number, 1-20
- `rank`: Number, 1-20, must be sequential (1, 2, 3, ...)
- `percent`: Number, 0-100, max 2 decimal places, must decrease with rank
- `game_type_id`: Ref with GameLists entity
- Total percent must equal 100%
- Maximum 20 prizes allowed

**Response**:
```json 
status 200
{
    "message": "Game room created successfully"
}

status 400

{
    "statusCode": 400,
    "message": "Game room participation amount must be greater than 0"
}

{
    "statusCode": 400,
    "message": "Game room participation amount and prizes number are required"
}

{
    "statusCode": 400,
    "message": "Game room prizes number must be equal to the number of prizes"
}

```

#### 2. Get Game Rooms
```http
GET /
```

**Description**: Retrieve game rooms with pagination and filtering, Để biết phòng nào có đang chờ, hay đang chơi thì dựa vào status của game_session(current_session)

**Authentication**: Required (JWT)

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `room_id` (number, optional): Filter by game room id
- `host_id` (number, optional): Filter by game room owner id
- `game_type_id` (number, optional): Filter by game room game type id
- `host`  (string, optional): Filter by gmae room host

**Response**:
```json
{
    "message": "Game rooms fetched successfully",
    "data": [
        {
            "id": 73,
            "name": "Phòng xổ số số 1112223334445556667",
            "symbol": "https://m.media-amazon.com/images/I/71GNE098B4L.jpg",
            "participation_amount": 115,
            "prizes_num": 5,
            "total_amount": 687,
            "game_type_id": {
                "id": 1,
                "name": "Xổ số BLOCKCHAIN",
                "symbol": "symbol",
                "status": "active"
            },
            "owner_id": {
                "id": 142859,
                "username": "tranthe"
            },
            "current_session": {
                "id": 2108,
                "status": "pending",
                "time_start": "2025-09-29T09:43:55.290Z",
                "session": "Phòng xổ số số 1112223334445556667_nmgs69ytx8ou4gp60utymo1fyfh3kjkk",
                "participants_count": 3,
                "max_participants": 3,
                "can_join": false
            }
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 1,
        "total": 91,
        "totalPages": 91,
        "hasNext": true,
        "hasPrev": false
    }
}
```

#### 3. Get Game Room by ID
```http
GET /find-by-id?room_id=<:id>
```

**Description**: Retrieve a specific game room by ID

**Authentication**: Required (JWT)

**Parameters**:
- `id` (number): Game room ID

**Response**:
```json
{
    "message": "Game room details fetched successfully",
    "data": {
        "id": 73,
        "name": "Phòng xổ số số 1112223334445556667",
        "symbol": "https://m.media-amazon.com/images/I/71GNE098B4L.jpg",
        "participation_amount": 115,
        "prizes_num": 5,
        "total_amount": 0,
        "game_type_id": {
            "id": 1,
            "name": "Xổ số BLOCKCHAIN",
            "symbol": "symbol",
            "status": "active"
        },
        "status": "run",
        "owner_id": {
            "id": 142859,
            "username": "tranthe"
        },
        "current_session": {
            "id": 171,
            "status": "pending",
            "time_start": "2025-09-28T09:52:13.304Z",
            "session": "1759052953304",
            "participants_count": 1,
            "max_participants": 3,
            "can_join": true
        },
        "game_set_prizes": [
            {
                "rank": 1,
                "percent": 60
            },
            {
                "rank": 2,
                "percent": 30
            },
            {
                "rank": 3,
                "percent": 10
            }
        ],
        "join_room_num": 1,
        "joiners": [
            {
                "username": "tranthe",
                "amount": 25.5,
                "status": "executed",
                "time_join": "2025-09-28T09:50:48.683Z",
                "tx_hash": "1234567890"
            }
        ]
    }
}
```

**Error Response**:
```json
{
  "statusCode": 404,
  "message": "Game room not found",
  "error": "Not Found"
}
```

#### 4. Update Game Room
```http
PATCH /?id=<:id>
```

**Description**: Update an existing game room, thay đổi tên phòng, số tiền đặt cượt của phòng bằng giá mới, sau khi trạng thái session game end thì trong khoản thời gian 10s sẽ được cập nhật lại thông tin phòng

**Authentication**: Required (JWT)

**Parameters**:
- `id` (number): Game room ID

**Request Body**:
```json
{
    "name_new": "Phòng game 59",
    "symbol": "SYMBOL 1111",
    "participation_amount_new": 30
}
```

#### 5. Delete Game Room
```http
DELETE /?id=<:id>
```

**Description**: Soft delete a game room (sets status to DELETE), xóa phòng ở bảng game_room còn trạng thái của game_session mà liên kết với bảng game_room thì được hiển thị realtime nếu phòng đó đang chơi game, và sau khi kết thúc game thì phòng bị xóa

**Authentication**: Required (JWT)

**Parameters**:
- `id` (number): Game room ID

**Response**:
```json
{
  "message": "Game room deleted successfully"
}
```

```http
  https://8w7n4n91-8008.asse.devtunnels.ms/api/v1
```

## API Endpoints

### 1. Join Game Room
**POST** `/game-join-rooms`

Tham gia vào một phòng game với session cụ thể.

#### Request Body
```json
{
    "session_id": 53,
    "room_id": 59,
    "amount": 25.5
}
```

#### Request Body Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | number | Yes | ID của session game |
| `room_id` | number | Yes | ID của phòng game |
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


**Validation Rules**:
- Same validation as create game room
- **Prize Replacement**: If `game_set_prizes` is provided, ALL existing prizes will be deleted and replaced with new ones
- **Transaction Safety**: Prize deletion and creation happens in a single transaction
- Number of prizes must match `gr_prizes_num`
- Total percentage must equal 100%

**Response**:
```json
{
  "message": "Game room updated successfully"
}
```

**Error Responses**:
```json
{
  "statusCode": 400,
  "message": "Game room prizes number must be equal to the number of prizes"
}
```

---

### 7. Check New Session Availability
**GET** `/game-join-rooms/check-new-session`

Kiểm tra session mới đã được tạo và sẵn sàng join chưa.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room_id` | number | Yes | ID của phòng game |

#### Example Request
```
GET /game-join-rooms/check-new-session?room_id=1
```

#### Success Response (200)
```json
{
  "message": "New session is available",
  "data": {
    "room_id": 1,
    "latest_session_id": 2,
    "session_status": "pending",
    "session_available": true,
    "can_join": true,
    "session_start_time": "2024-01-01T12:05:00.000Z",
    "message": "You can join the new session now"
  }
}
```

```
GET /game-join-rooms/by-room?room_id=<:id>&session_id=<:id>
```

```json
{
    "message": "Game join room fetched successfully",
    "data": [
        {
            "id": 54,
            "wallet_address": "HqMj8L8Y5BVj3SnjHCaUoXBG5Cix7BmyGubZbyhg866C",
            "amount": 25.5,
            "time_join": "2025-09-28T08:18:37.594Z",
            "status": "executed",
            "tx_hash": "1234567890",
            "session": {
                "id": 128,
                "session": "1759047365705",
                "time_start": "2025-09-28T08:19:05.705Z",
                "status": "out"
            },
            "room": {
                "id": 73,
                "name": "Phòng xổ số số 1112223334445556667",
                "participation_amount": 115,
                "prizes_num": 5
            },
            "user": {
                "id": 142862,
                "username": "Dautay"
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
| `room_id` | number | ID của phòng game |
| `latest_session_id` | number | ID của session mới nhất |
| `session_status` | string | Trạng thái session (pending/running/out/end) |
| `session_available` | boolean | Session mới có sẵn sàng không |
| `can_join` | boolean | Có thể join session mới không |
| `session_start_time` | string | Thời gian bắt đầu session |
| `message` | string | Thông báo trạng thái |

#### Possible Messages
- `"New session is available"` - Session mới đã sẵn sàng
- `"No new session available yet"` - Session mới chưa sẵn sàng
- `"No session found for this room"` - Không tìm thấy session nào

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Game room not found | Không tìm thấy phòng game |
| 500 | Error checking new session | Lỗi server |

---

## Updated Business Logic

### Session Time Management with Auto-Creation
- Khi tạo session mới, `time_start` được set = thời gian hiện tại + 3 phút
- User chỉ có thể join trong vòng 3 phút sau khi session bắt đầu
- **Mới**: Sau 3 phút, nếu số người tham gia < số giải thưởng → Session bị cancel và tự động tạo session mới sau 10 giây
- Sau 3 phút, nếu số người tham gia >= số giải thưởng → Session tiếp tục

### Auto Session Creation Flow
1. **Session hết hạn** → Đánh dấu session cũ là `OUT`
2. **Delay 10 giây** → Chờ 10 giây trước khi tạo session mới
3. **Tạo session mới** → Session mới với status `PENDING`
4. **User có thể join** → User có thể join session mới

### Room Status Flow
1. **WAIT** → User có thể join
2. **RUN** → Session đang chạy, không cho join mới
3. **INACTIVE** → Phòng không hoạt động
4. **DELETE** → Phòng đã bị xóa

### Session Status Flow
1. **PENDING** → Đang chờ người tham gia
2. **RUNNING** → Session đang chạy
3. **OUT** → Session hết hạn hoặc bị cancel
4. **END** → Session đã kết thúc

---

## Data Models

### GameRoomStatus Enum
```typescript
enum GameRoomStatus {
  WAIT = 'wait',
  RUN = 'run',
  INACTIVE = 'inactive',
  DELETE = 'delete'
}
```

### GameListStatus Enum
```typescript
enum GameListStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
```

## Business Rules

### Prize Structure Validation
1. **Rank Sequence**: Ranks must be sequential starting from 1 (1, 2, 3, ...)
2. **Percent Order**: Percent must decrease with rank (rank 1 has highest percent)
3. **Total Percent**: Sum of all percentages must equal exactly 100%
4. **Maximum Prizes**: Maximum 20 prizes allowed per game room
5. **Percent Range**: Each prize percent must be between 0-100%
6. **Prize Count Match**: Number of prizes must match `gr_prizes_num` field

### User Permissions
- Only users with `is_master: true` can create, update, or delete game rooms
- All game room operations require JWT authentication
- Game list operations are public (no authentication required)

### Update Logic
- **Complete Prize Replacement**: When updating a game room with `game_set_prizes`, the system performs a complete replacement:
  1. Deletes ALL existing prizes for the game room
  2. Creates new prizes from the provided data
  3. Uses database transactions to ensure data consistency
- **Optional Prize Update**: If `game_set_prizes` is not provided in the update request, only the basic game room information is updated
- **Transaction Safety**: All prize operations are wrapped in database transactions to prevent partial updates

### Game Room Naming
- Game room names are auto-generated using format: `{DEFAULT_SYMBOL}_{GAME_TYPE_SYMBOL}_{SEQUENCE}`
- Example: `GOLD_SLOT_001`, `GOLD_POKER_002`

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Rank must be sequential starting from 1, but got rank 3 at position 2",
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "User is not master",
  "error": "Forbidden"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Game room not found",
  "error": "Not Found"
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Default symbol not found",
  "error": "Internal Server Error"
}
```

## Configuration

### Environment Variables
- `DEFAULT_SYMBOL_GAME_ROOM`: Default symbol for game room naming (required)

## Usage Examples

### Creating a Game Room with Prizes
```javascript
const response = await fetch('/game-rooms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    game_room: {
      participation_amount: 25.00,
      prizes_num: 3
    },
    game_set_prizes: [
      { rank: 1, percent: 60.00 },
      { rank: 2, percent: 25.00 },
      { rank: 3, percent: 15.00 }
    ],
    game_type_id: 1,
  })
});
```

### Updating Game Room Prizes
```javascript
const response = await fetch('/game-rooms?id=1', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    game_room: {
      name: "Updated Room",
      symbol: "UPD",
      participation_amount: 30.00,
      prizes_num: 3
    },
    game_set_prizes: [
      { rank: 1, percent: 50.00 },
      { rank: 2, percent: 30.00 },
      { rank: 3, percent: 20.00 }
    ]
  })
});
```

## Notes
- Game room deletion is soft delete (status set to DELETE)
- **Prize updates are complete replacement**: When updating prizes, all existing prizes are deleted and replaced with new ones
- All monetary values support up to 2 decimal places
- Game room names are automatically generated and unique
- The system validates prize structure integrity on every operation
- Prize operations use database transactions to ensure data consistency
