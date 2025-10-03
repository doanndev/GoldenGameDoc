# 🧪 Hướng dẫn Test WebSocket Game Room Gateway bằng Postman

## 📋 Tổng quan

WebSocket Gateway chạy trên namespace `/game-rooms` với các events sau:

- **URL**: `ws://localhost:8080/socket.io/?EIO=4&transport=websocket`
- **Namespace**: `/game-rooms`
- **Authentication**: JWT token qua cookies

## 🔧 Cấu hình Postman

### 1. Tạo WebSocket Request

1. Mở Postman
2. Click **New** → **WebSocket Request**
3. Nhập URL: `ws://localhost:8080/socket.io/?EIO=4&transport=websocket`
4. Click **Connect**

### 2. Cấu hình Headers (nếu cần)

```
Cookie: refresh_token=YOUR_JWT_TOKEN_HERE
```

## 📡 WebSocket Events Testing

### 1. **Connection Test**

**Event**: `connect`
**Description**: Kiểm tra kết nối WebSocket

**Expected Response**:
```json
{
  "message": "Connected to game-rooms namespace",
  "clientId": "socket_id_here",
  "namespace": "/game-rooms",
  "userId": 123
}
```

---

### 2. **Subscribe Room Counts by Game Type**

**Event**: `subscribeRoomCountByGameType`
**Payload**: `1` (gameTypeId)

**Test Steps**:
1. Send message: `1`
2. Listen for: `gameRoomCounts`

**Expected Response**:
```json
{
  "pending": 5,
  "running": 3,
  "out": 2,
  "end": 1,
  "total": 11,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

---

### 3. **Subscribe Current Session**

**Event**: `subscribeCurrentSession`
**Payload**: `123` (roomId)

**Test Steps**:
1. Send message: `123`
2. Listen for: `currentSession`

**Expected Response**:
```json
{
  "roomId": 123,
  "current_session": {
    "id": 456,
    "status": "pending",
    "time_start": "2024-01-15T10:30:00.000Z",
    "session": "game_room_123_abc123",
    "participants_count": 3,
    "max_participants": 10,
    "can_join": true
  }
}
```

---

### 4. **Get Early Joiners List**

**Event**: `getEarlyJoinersList`
**Payload**: 
```json
{
  "roomId": 123,
  "sessionId": 456
}
```

**Test Steps**:
1. Send message: `{"roomId": 123, "sessionId": 456}`
2. Listen for: `earlyJoinersListResult`

**Expected Response**:
```json
{
  "success": true,
  "roomId": 123,
  "sessionId": 456,
  "earlyJoiners": [
    {
      "user_id": 1,
      "username": "player1",
      "fullname": "Player One",
      "avatar": "avatar1.jpg",
      "joined_at": "2024-01-15T10:25:00.000Z",
      "amount": 100,
      "status": "executed"
    },
    {
      "user_id": 2,
      "username": "player2",
      "fullname": "Player Two",
      "avatar": "avatar2.jpg",
      "joined_at": "2024-01-15T10:26:00.000Z",
      "amount": 150,
      "status": "executed"
    }
  ],
  "totalCount": 2,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 5. **Join Room (Legacy)**

**Event**: `gameJoinRoom`
**Payload**: 
```json
{
  "roomId": 123
}
```

**Test Steps**:
1. Send message: `{"roomId": 123}`
2. Listen for: `gameJoinRoomResult`

**Expected Response**:
```json
{
  "success": true,
  "roomId": 123,
  "sessionId": 456,
  "joinList": [
    {
      "user_id": 1,
      "username": "player1",
      "fullname": "Player One",
      "avatar": "avatar1.jpg",
      "joined_at": "2024-01-15T10:25:00.000Z",
      "amount": 100,
      "status": "executed"
    }
  ]
}
```

---

### 6. **Join Room with Early Joiners**

**Event**: `joinRoomWithEarlyJoiners`
**Payload**: 
```json
{
  "roomId": 123
}
```

**Test Steps**:
1. Send message: `{"roomId": 123}`
2. Listen for: `joinRoomWithEarlyJoinersResult`

**Expected Response**:
```json
{
  "success": true,
  "roomId": 123,
  "sessionId": 456,
  "earlyJoiners": [
    {
      "user_id": 1,
      "username": "player1",
      "fullname": "Player One",
      "avatar": "avatar1.jpg",
      "joined_at": "2024-01-15T10:25:00.000Z",
      "amount": 100,
      "status": "executed"
    }
  ],
  "totalCount": 1,
  "userJoined": {
    "user_id": 3,
    "username": "current_user",
    "fullname": "Current User",
    "joined_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔄 Broadcast Events (Server → Client)

### 1. **Room Updates**

**Event**: `gameJoinRoomUpdated`
**Trigger**: Khi có người join room

**Expected Response**:
```json
{
  "roomId": 123,
  "sessionId": 456,
  "joinList": [
    {
      "user_id": 1,
      "username": "player1",
      "fullname": "Player One",
      "avatar": "avatar1.jpg",
      "joined_at": "2024-01-15T10:25:00.000Z",
      "amount": 100,
      "status": "executed"
    }
  ]
}
```

### 2. **Early Joiners Updates**

**Event**: `roomEarlyJoinersUpdated`
**Trigger**: Khi có người mới join room

**Expected Response**:
```json
{
  "roomId": 123,
  "sessionId": 456,
  "earlyJoiners": [
    {
      "user_id": 1,
      "username": "player1",
      "fullname": "Player One",
      "avatar": "avatar1.jpg",
      "joined_at": "2024-01-15T10:25:00.000Z",
      "amount": 100,
      "status": "executed"
    }
  ],
  "totalCount": 1,
  "newJoiner": {
    "user_id": 3,
    "username": "new_player",
    "fullname": "New Player",
    "joined_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. **Current Session Updates**

**Event**: `currentSessionUpdated`
**Trigger**: Khi session status thay đổi

**Expected Response**:
```json
{
  "roomId": 123,
  "current_session": {
    "id": 456,
    "status": "running",
    "time_start": "2024-01-15T10:30:00.000Z",
    "session": "game_room_123_abc123",
    "participants_count": 5,
    "max_participants": 10,
    "can_join": false
  }
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Basic Connection Flow

1. **Connect** to WebSocket
2. **Verify** `connected` event received
3. **Subscribe** to room counts: `1`
4. **Verify** `gameRoomCounts` received
5. **Subscribe** to current session: `123`
6. **Verify** `currentSession` received

### Scenario 2: Join Room Flow

1. **Connect** to WebSocket
2. **Get** early joiners: `{"roomId": 123}`
3. **Verify** `earlyJoinersListResult` received
4. **Join** room: `{"roomId": 123}`
5. **Verify** `joinRoomWithEarlyJoinersResult` received
6. **Listen** for broadcast updates

### Scenario 3: Error Handling

1. **Connect** to WebSocket
2. **Try** invalid room: `{"roomId": 999}`
3. **Verify** error response received
4. **Try** join without auth
5. **Verify** unauthorized error

---

## 🐛 Common Error Responses

### Authentication Error
```json
{
  "error": "Unauthorized"
}
```

### Invalid Room ID
```json
{
  "error": "Invalid roomId"
}
```

### Room Not Found
```json
{
  "error": "Room not found or inactive"
}
```

### Already Joined
```json
{
  "error": "Already joined"
}
```

### Room Full
```json
{
  "error": "Room full"
}
```

### No Joinable Session
```json
{
  "error": "No joinable session"
}
```

---

## 📝 Postman Collection JSON

```json
{
  "info": {
    "name": "Game Room WebSocket Tests",
    "description": "WebSocket tests for Game Room Gateway"
  },
  "item": [
    {
      "name": "WebSocket Connection",
      "request": {
        "url": "ws://localhost:8080/socket.io/?EIO=4&transport=websocket",
        "method": "GET"
      }
    }
  ],
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "exec": [
          "// Add any pre-request setup here"
        ]
      }
    }
  ]
}
```

---

## 🔧 Advanced Testing

### 1. **Multiple Client Simulation**

1. Mở 2 tab Postman WebSocket
2. Connect cả 2 clients
3. Join room từ client 1
4. Verify client 2 nhận được broadcast

### 2. **Load Testing**

1. Mở nhiều WebSocket connections
2. Send multiple join requests
3. Monitor server performance
4. Check for memory leaks

### 3. **Error Recovery Testing**

1. Disconnect network
2. Reconnect
3. Verify reconnection works
4. Check data consistency

---

## 📊 Monitoring & Debugging

### Server Logs
```bash
# Watch server logs
npm run start:dev

# Look for these log messages:
# - "🔌 New client connecting to /game-rooms namespace"
# - "✅ User authenticated: {userId} ({username})"
# - "🔄 Updated room {roomId} status"
```

### Database Queries
```sql
-- Check active sessions
SELECT * FROM game_sessions WHERE status = 'pending';

-- Check room participants
SELECT * FROM game_join_rooms WHERE session_id = 123;

-- Check room status
SELECT * FROM game_rooms WHERE id = 123;
```

---

## 🚀 Production Testing

### 1. **Environment Setup**
```bash
# Set production URL
ws://your-domain.com/socket.io/?EIO=4&transport=websocket

# Set production JWT token
Cookie: refresh_token=PRODUCTION_JWT_TOKEN
```

### 2. **SSL Testing**
```bash
# Use WSS for HTTPS
wss://your-domain.com/socket.io/?EIO=4&transport=websocket
```

### 3. **Performance Testing**
- Test với 100+ concurrent connections
- Monitor memory usage
- Check response times
- Verify error handling

---

## 📚 Additional Resources

- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [Postman WebSocket Testing](https://learning.postman.com/docs/sending-requests/websocket/)
- [NestJS WebSocket Gateway](https://docs.nestjs.com/websockets/gateways)

---

## ⚠️ Important Notes

1. **Authentication**: Cần JWT token hợp lệ trong cookies
2. **Room Status**: Room phải có status `RUNNING`
3. **Session Status**: Session phải có status `PENDING` để join
4. **User Permissions**: User phải được authenticate
5. **Rate Limiting**: Có thể có rate limiting trên server
6. **CORS**: Server đã cấu hình CORS cho tất cả origins

---

## 🎯 Quick Test Checklist

- [ ] WebSocket connection established
- [ ] Authentication successful
- [ ] Room counts subscription works
- [ ] Current session subscription works
- [ ] Early joiners list retrieval works
- [ ] Join room functionality works
- [ ] Broadcast events received
- [ ] Error handling works
- [ ] Multiple clients can connect
- [ ] Real-time updates work
