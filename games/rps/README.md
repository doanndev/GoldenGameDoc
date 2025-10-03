# RPS Game API Documentation

## 📋 API Endpoints

### Get Game Turns and Rankings

**Endpoint:** `GET /rps/session/:sessionId/turns`

**Description:** Lấy thông tin chi tiết về các lượt đấu và bảng xếp hạng của một game session.

**Authentication:** Required (JWT Token)


## 📝 Request Parameters

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sessionId` | number | ✅ | ID của game session |

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sort` | string | ❌ | `desc` | Thứ tự sắp xếp turns: `asc` (cũ → mới) hoặc `desc` (mới → cũ) |

---

## 🚀 Usage Examples

### 1. Lấy turns mới nhất trước (mặc định)
```bash
GET /rps/session/123/turns
```

### 2. Lấy turns từ cũ đến mới
```bash
GET /rps/session/123/turns?sort=asc
```

### 3. Lấy turns từ mới đến cũ (explicit)
```bash
GET /rps/session/123/turns?sort=desc
```

---

## 📊 Response Format

### Success Response (200 OK)

```json
{
  "session_id": 123,
  "total_turns": 3,
  "turns": [
    {
      "turn_number": 3,
      "bot_choice": "scissors",
      "players": [
        {
          "player_id": 68,
          "user_id": 142857,
          "username": "player1",
          "wallet_address": "EttPfSsK9GoszoUcfsLnnbnQHMy14H2PrsX1JctXPHxT",
          "choice": "rock",
          "result": "lose"
        },
        {
          "player_id": 69,
          "user_id": 142862,
          "username": "player2",
          "wallet_address": "HqMj8L8Y5BVj3SnjHCaUoXBG5Cix7BmyGubZbyhg866C",
          "choice": "paper",
          "result": "win"
        }
      ]
    },
    {
      "turn_number": 2,
      "bot_choice": "paper",
      "players": [
        {
          "player_id": 68,
          "user_id": 142857,
          "username": "player1",
          "wallet_address": "EttPfSsK9GoszoUcfsLnnbnQHMy14H2PrsX1JctXPHxT",
          "choice": "scissors",
          "result": "win"
        },
        {
          "player_id": 69,
          "user_id": 142862,
          "username": "player2",
          "wallet_address": "HqMj8L8Y5BVj3SnjHCaUoXBG5Cix7BmyGubZbyhg866C",
          "choice": "rock",
          "result": "lose"
        }
      ]
    },
    {
      "turn_number": 1,
      "bot_choice": "rock",
      "players": [
        {
          "player_id": 68,
          "user_id": 142857,
          "username": "player1",
          "wallet_address": "EttPfSsK9GoszoUcfsLnnbnQHMy14H2PrsX1JctXPHxT",
          "choice": "paper",
          "result": "win"
        },
        {
          "player_id": 69,
          "user_id": 142862,
          "username": "player2",
          "wallet_address": "HqMj8L8Y5BVj3SnjHCaUoXBG5Cix7BmyGubZbyhg866C",
          "choice": "scissors",
          "result": "lose"
        }
      ]
    }
  ],
  "final_rankings": [
    {
      "rank": 1,
      "player_id": 68,
      "user_id": 142857,
      "username": "player1",
      "wallet_address": "EttPfSsK9GoszoUcfsLnnbnQHMy14H2PrsX1JctXPHxT",
      "wins": 2,
      "losses": 1,
      "draws": 0
    },
    {
      "rank": 2,
      "player_id": 69,
      "user_id": 142862,
      "username": "player2",
      "wallet_address": "HqMj8L8Y5BVj3SnjHCaUoXBG5Cix7BmyGubZbyhg866C",
      "wins": 1,
      "losses": 2,
      "draws": 0
    }
  ]
}
```

---

## 📋 Response Fields

### Root Level
| Field | Type | Description |
|-------|------|-------------|
| `session_id` | number | ID của game session |
| `total_turns` | number | Tổng số lượt đấu trong session |
| `turns` | array | Danh sách các lượt đấu (sắp xếp theo tham số `sort`) |
| `final_rankings` | array | Bảng xếp hạng cuối cùng của tất cả người chơi |

### Turn Object
| Field | Type | Description |
|-------|------|-------------|
| `turn_number` | number | Số thứ tự lượt đấu |
| `bot_choice` | string | Lựa chọn của bot: `"rock"`, `"paper"`, hoặc `"scissors"` |
| `players` | array | Danh sách người chơi tham gia lượt này |

### Player in Turn
| Field | Type | Description |
|-------|------|-------------|
| `player_id` | number | ID người chơi trong game |
| `user_id` | number | ID user trong hệ thống |
| `username` | string | Tên người dùng |
| `wallet_address` | string | Địa chỉ ví của người chơi |
| `choice` | string | Lựa chọn của người chơi: `"rock"`, `"paper"`, `"scissors"`, hoặc `"wait"` |
| `result` | string | Kết quả: `"win"`, `"lose"`, hoặc `"draw"` |

### Final Ranking
| Field | Type | Description |
|-------|------|-------------|
| `rank` | number | Thứ hạng (1 = cao nhất) |
| `player_id` | number | ID người chơi trong game |
| `user_id` | number | ID user trong hệ thống |
| `username` | string | Tên người dùng |
| `wallet_address` | string | Địa chỉ ví của người chơi |
| `wins` | number | Tổng số lần thắng |
| `losses` | number | Tổng số lần thua |
| `draws` | number | Tổng số lần hòa |

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Session 123 not found",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## 🎯 Use Cases

1. **Hiển thị lịch sử game:** Xem chi tiết từng lượt đấu
2. **Bảng xếp hạng:** Hiển thị thứ hạng cuối cùng của người chơi
3. **Thống kê:** Phân tích kết quả và thành tích
4. **Replay game:** Xem lại diễn biến game từng lượt
5. **Tính toán giải thưởng:** Dựa trên bảng xếp hạng cuối cùng

---

## 🔧 Technical Notes

- **Sorting Logic:** Turns được sắp xếp theo `turn_number` với thứ tự có thể tùy chỉnh
- **Ranking Logic:** Final rankings được sắp xếp theo: wins (giảm dần) → draws (giảm dần) → player_id (tăng dần)
- **Performance:** API query tất cả turns và results trong một lần gọi database
- **Data Integrity:** Tất cả dữ liệu được lấy trực tiếp từ database, đảm bảo tính chính xác

---

## 📝 Notes

- Mặc định `sort=desc` để hiển thị turns mới nhất trước
- Tất cả thời gian được trả về theo format ISO 8601
- API chỉ trả về dữ liệu của session đã kết thúc hoặc đang diễn ra
- Cần có quyền truy cập vào session (thông qua JWT token)
