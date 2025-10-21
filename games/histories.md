# Game History API Documentation

## Get User Game History

Lấy lịch sử chơi game của user dựa trên access token.

### Endpoint
```
GET /game-session-results/history
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token (via Cookie)
- **Cookie Name**: `access_token`

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Số trang (minimum: 1) |
| `limit` | integer | No | 10 | Số lượng items per page (minimum: 1, maximum: 100) |
| `bet` | number | No | - | Lọc theo số tiền bet chính xác (minimum: 0) |
| `type_id` | integer | No | - | Lọc theo loại game (minimum: 1) |
| `search` | string | No | - | Tìm kiếm theo tx_hash hoặc room_id |

### Request Example

```bash
# Lấy trang đầu tiên với 10 items
GET /game-session-results/history?page=1&limit=10

# Lọc theo bet = 100.5
GET /game-session-results/history?bet=100.5

# Lọc theo loại game
GET /game-session-results/history?type_id=1

# Kết hợp pagination và filter
GET /game-session-results/history?page=2&limit=20&bet=50.0&type_id=2
```

### Response Format

#### Success Response (200 OK)

```json
{
  "data": [
    {
      "time": "2024-01-15T10:30:00.000Z",
      "hash": "0x123abc456def789...",
      "room_id": 123,
      "result": "win",
      "bet": 100.5,
      "reward": 200.0
    },
    {
      "time": "2024-01-14T15:45:30.000Z",
      "hash": "0x987fed654cba321...",
      "room_id": 124,
      "result": "win",
      "bet": 50.0,
      "reward": 100.0
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "total_pages": 3
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Danh sách lịch sử chơi game |
| `data[].time` | string (ISO 8601) | Thời gian tạo kết quả game |
| `data[].hash` | string | Hash giao dịch blockchain (có thể null) |
| `data[].room_id` | integer | ID của phòng game |
| `data[].result` | string | Kết quả game (hiện tại luôn là "win") |
| `data[].bet` | number | Số tiền bet trong phòng game |
| `data[].reward` | number | Số tiền thưởng nhận được |
| `total` | integer | Tổng số records |
| `page` | integer | Trang hiện tại |
| `limit` | integer | Số lượng items per page |
| `total_pages` | integer | Tổng số trang |

### Error Responses

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Causes:**
- Không có access token
- Access token không hợp lệ
- Access token đã hết hạn
- User bị block

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "page must be a positive number",
    "limit must not be greater than 100"
  ],
  "error": "Bad Request"
}
```

**Causes:**
- Query parameters không hợp lệ
- Giá trị nằm ngoài phạm vi cho phép

### Business Logic

1. **Authentication**: API sử dụng JWT token từ cookie để xác thực user
2. **Data Source**: Query từ bảng `game_session_results` với join các bảng:
   - `game_sessions` (để lấy room_id và bet amount)
   - `game_rooms` (để lấy participation_amount)
   - `game_join_rooms` (để filter theo user_id)
3. **Filtering**: 
   - Chỉ trả về kết quả của user hiện tại
   - Có thể filter theo bet amount chính xác
4. **Result Logic**: Hiện tại tất cả records đều trả về "win" vì chỉ user thắng mới được lưu vào bảng results

### Usage Examples

#### JavaScript/Fetch
```javascript
// Lấy lịch sử game với pagination
const response = await fetch('/game-session-results/history?page=1&limit=10', {
  method: 'GET',
  credentials: 'include', // Để gửi cookie
  headers: {
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

#### cURL
```bash
# Lấy lịch sử game
curl -X GET "http://localhost:3000/game-session-results/history?page=1&limit=10" \
  -H "Content-Type: application/json" \
  --cookie "access_token=your_jwt_token_here"

# Lọc theo bet
curl -X GET "http://localhost:3000/game-session-results/history?bet=100.5" \
  -H "Content-Type: application/json" \
  --cookie "access_token=your_jwt_token_here"

# Lọc theo loại game
curl -X GET "http://localhost:3000/game-session-results/history?type_id=1" \
  -H "Content-Type: application/json" \
  --cookie "access_token=your_jwt_token_here"
```

### Notes

- API trả về dữ liệu được sắp xếp theo thời gian tạo giảm dần (mới nhất trước)
- Field `result` hiện tại luôn là "win" vì logic business chỉ lưu kết quả của người thắng
- Field `hash` có thể null nếu giao dịch blockchain chưa được thực hiện
- Pagination bắt đầu từ trang 1, không phải 0
