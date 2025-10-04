# Game Lists Module

## Overview
Module quản lý danh sách loại game, bao gồm tạo, lấy danh sách, lấy theo ID, cập nhật và xóa các loại game.

## Features
- ✅ **Get All Game Lists** - Lấy danh sách tất cả loại game đang hoạt động
- ✅ **Create Game List** - Tạo loại game mới
- ✅ **Get Game List by ID** - Lấy thông tin chi tiết loại game theo ID
- ✅ **Update Game List** - Cập nhật thông tin loại game
- ✅ **Delete Game List** - Xóa loại game (soft delete)
- ✅ **Status Management** - Quản lý trạng thái ACTIVE/INACTIVE
- ✅ **Duplicate Prevention** - Kiểm tra tên loại game trùng lặp

## API Endpoints

### 1. Get All Game Lists
**GET** `/game-lists`

Lấy danh sách tất cả loại game đang hoạt động.

#### Success Response (200)
```json
{
  "message": "Game types fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Lottery",
      "symbol": "LOT"
    },
    {
      "id": 2,
      "name": "Rock Paper Scissors",
      "symbol": "RPS"
    },
    {
      "id": 3,
      "name": "Dice Game",
      "symbol": "DICE"
    }
  ]
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Thông báo kết quả |
| `data` | array | Danh sách loại game |

#### Data Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của loại game |
| `name` | string | Tên loại game |
| `symbol` | string | Ký hiệu loại game |

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 200 | No game types found | Không có loại game nào (data: []) |
| 500 | Internal Server Error | Lỗi server |

---

### 2. Create Game List
**POST** `/game-lists`

Tạo loại game mới.

#### Request Body
```json
{
  "name": "New Game Type",
  "symbol": "NGT"
}
```

#### Request Body Fields
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | 3-20 chars, unique | Tên loại game |
| `symbol` | string | Yes | - | Ký hiệu loại game |

#### Success Response (201)
```json
{
  "message": "Game type created successfully"
}
```

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Game type already exists | Tên loại game đã tồn tại |
| 500 | Internal Server Error | Lỗi server |

---

### 3. Get Game List by ID
**GET** `/game-lists/find-by-id`

Lấy thông tin chi tiết loại game theo ID.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của loại game |

#### Example Request
```
GET /game-lists/find-by-id?id=1
```

#### Success Response (200)
```json
{
  "message": "Game type fetched successfully",
  "data": {
    "id": 1,
    "name": "Lottery",
    "symbol": "LOT"
  }
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Thông báo kết quả |
| `data` | object | Thông tin loại game |

#### Data Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của loại game |
| `name` | string | Tên loại game |
| `symbol` | string | Ký hiệu loại game |

#### Error Responses
| Status Code | Message | Description |
|-------------|---------|-------------|
| 404 | Game type not found | Không tìm thấy loại game |
| 500 | Internal Server Error | Lỗi server |

---

## Data Transfer Objects (DTOs)

### GameListsDto
Sử dụng cho API tạo và cập nhật loại game

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | 3-20 chars, unique | Tên loại game |
| `symbol` | string | Yes | - | Ký hiệu loại game |

### GameListsResponseDto
Response format cho loại game

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | ID của loại game |
| `name` | string | Tên loại game |
| `symbol` | string | Ký hiệu loại game |

---

## Business Logic

### Game List Creation Process
1. **Duplicate Check**: Kiểm tra tên loại game đã tồn tại chưa
2. **Validation**: Kiểm tra dữ liệu đầu vào
3. **Create**: Tạo loại game mới với status ACTIVE
4. **Response**: Trả về kết quả thành công

### Status Management
- **ACTIVE** → Loại game đang hoạt động, hiển thị trong danh sách
- **INACTIVE** → Loại game đã bị xóa (soft delete), không hiển thị

### Soft Delete
- Không xóa thực sự khỏi database
- Chỉ thay đổi status từ ACTIVE → INACTIVE
- Dữ liệu vẫn được bảo toàn

---

## Usage Examples

### 1. Get All Game Lists
```bash
curl -X GET "{{BASE_URL}}/game-lists"
```

**Response:**
```json
{
  "message": "Game types fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Lottery",
      "symbol": "LOT"
    },
    {
      "id": 2,
      "name": "Rock Paper Scissors",
      "symbol": "RPS"
    }
  ]
}
```

### 2. Create Game List
```bash
curl -X POST "{{BASE_URL}}/game-lists" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Game Type",
    "symbol": "NGT"
  }'
```

**Response:**
```json
{
  "message": "Game type created successfully"
}
```

### 3. Get Game List by ID
```bash
curl -X GET "{{BASE_URL}}/game-lists/find-by-id?id=1"
```

**Response:**
```json
{
  "message": "Game type fetched successfully",
  "data": {
    "id": 1,
    "name": "Lottery",
    "symbol": "LOT"
  }
}
```

---

## Database Schema

### GameLists Entity
```typescript
@Entity('game_lists')
export class GameLists {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  name: string;

  @Column({ type: 'varchar' })
  symbol: string;

  @Column({
    type: 'enum',
    enum: GameListStatus,
    default: GameListStatus.ACTIVE
  })
  status: GameListStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
```

### GameListStatus Enum
```typescript
export enum GameListStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
```

---

## Error Handling

### Common Error Codes
- `400 Bad Request` - Tên loại game đã tồn tại
- `404 Not Found` - Không tìm thấy loại game
- `500 Internal Server Error` - Lỗi server

### Specific Errors
- `Game type already exists` - Tên loại game đã được sử dụng
- `Game type not found` - Không tìm thấy loại game với ID đã cho

---

## Notes
- Tất cả API đều không yêu cầu authentication
- Chỉ hiển thị loại game có status ACTIVE
- Tên loại game phải unique
- Sử dụng soft delete để bảo toàn dữ liệu
- Validation tên loại game từ 3-20 ký tự
