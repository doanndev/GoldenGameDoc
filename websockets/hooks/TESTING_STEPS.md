# 🧪 Chi tiết Test WebSocket Game Room Gateway

## 📋 Danh sách Events trong Gateway

Dựa trên code analysis, đây là tất cả events có sẵn:

### **Client → Server Events:**
1. `subscribeRoomCountByGameType` - Đăng ký nhận room counts theo game type
2. `subscribeCurrentSession` - Đăng ký nhận current session của room
3. `gameJoinRoom` - Join room (legacy method)
4. `getEarlyJoinersList` - Lấy danh sách người tham gia sớm nhất
5. `joinRoomWithEarlyJoiners` - Join room với early joiners

### **Server → Client Events:**
1. `connected` - Kết nối thành công
2. `gameRoomCounts` - Room counts data
3. `currentSession` - Current session data
4. `currentSessionUpdated` - Session update broadcast
5. `gameJoinRoomResult` - Kết quả join room (legacy)
6. `earlyJoinersListResult` - Kết quả lấy early joiners
7. `joinRoomWithEarlyJoinersResult` - Kết quả join room với early joiners
8. `gameJoinRoomUpdated` - Room update broadcast
9. `roomEarlyJoinersUpdated` - Early joiners update broadcast
10. `earlyJoinersList` - Early joiners list (từ legacy join)

---

## 🔧 Bước 1: Chuẩn bị Test Environment

### 1.1. Khởi động Server
```bash
cd D:\work\private\backend\Golden-Game-BE
npm run start:dev
```

### 1.2. Kiểm tra Server đang chạy
```bash
# Server should be running on port 8080
curl http://localhost:8080
```

### 1.3. Chuẩn bị JWT Token
```bash
# Login để lấy JWT token
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password"}'
```

---

## 🔧 Bước 2: Cấu hình Postman WebSocket

### 2.1. Tạo WebSocket Request
1. Mở Postman
2. Click **New** → **WebSocket Request**
3. URL: `ws://localhost:8080/socket.io/?EIO=4&transport=websocket`
4. Headers:
   ```
   Cookie: refresh_token=YOUR_JWT_TOKEN_HERE
   ```

### 2.2. Connect và Verify
1. Click **Connect**
2. Kiểm tra console logs trên server
3. Verify nhận được `connected` event

---

## 🧪 Bước 3: Test từng Event

### Test 3.1: Subscribe Room Counts

**Send Message:**
```
1
```

**Expected Response:**
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

**Verify:**
- [ ] Nhận được `gameRoomCounts` event
- [ ] Data có đúng format
- [ ] Numbers hợp lệ

---

### Test 3.2: Subscribe Current Session

**Send Message:**
```
123
```

**Expected Response:**
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

**Verify:**
- [ ] Nhận được `currentSession` event
- [ ] Room ID đúng
- [ ] Session data hợp lệ

---

### Test 3.3: Get Early Joiners List

**Send Message:**
```json
{
  "roomId": 123,
  "sessionId": 456
}
```

**Expected Response:**
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
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Verify:**
- [ ] Nhận được `earlyJoinersListResult` event
- [ ] Success = true
- [ ] Early joiners array hợp lệ
- [ ] Sorted by joined_at ASC

---

### Test 3.4: Join Room (Legacy)

**Send Message:**
```json
{
  "roomId": 123
}
```

**Expected Response:**
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

**Additional Events:**
- `earlyJoinersList` - Danh sách early joiners
- `gameJoinRoomUpdated` - Broadcast cho clients khác

**Verify:**
- [ ] Nhận được `gameJoinRoomResult` event
- [ ] Success = true
- [ ] Join list được trả về
- [ ] Broadcast events được gửi

---

### Test 3.5: Join Room with Early Joiners

**Send Message:**
```json
{
  "roomId": 123
}
```

**Expected Response:**
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

**Additional Events:**
- `roomEarlyJoinersUpdated` - Broadcast cho clients khác

**Verify:**
- [ ] Nhận được `joinRoomWithEarlyJoinersResult` event
- [ ] Success = true
- [ ] Early joiners được trả về
- [ ] User joined info được trả về
- [ ] Broadcast events được gửi

---

## 🔄 Bước 4: Test Broadcast Events

### Test 4.1: Multiple Client Test

1. **Mở 2 tab Postman WebSocket**
2. **Connect cả 2 clients**
3. **Từ client 1: Join room**
   ```json
   {"roomId": 123}
   ```
4. **Từ client 2: Subscribe to room**
   ```
   123
   ```
5. **Verify client 2 nhận được broadcast:**
   - `gameJoinRoomUpdated`
   - `roomEarlyJoinersUpdated`

### Test 4.2: Session Status Change Test

1. **Connect WebSocket**
2. **Subscribe to current session:**
   ```
   123
   ```
3. **Trigger session status change** (từ admin panel hoặc API)
4. **Verify nhận được:**
   - `currentSessionUpdated` event
   - Session data được update

---

## 🐛 Bước 5: Test Error Scenarios

### Test 5.1: Authentication Error

**Send Message:**
```json
{"roomId": 123}
```

**Without JWT Token in cookies**

**Expected Response:**
```json
{
  "error": "Unauthorized"
}
```

### Test 5.2: Invalid Room ID

**Send Message:**
```json
{
  "roomId": 999
}
```

**Expected Response:**
```json
{
  "error": "Room not found or inactive"
}
```

### Test 5.3: Already Joined

**Send Message:**
```json
{"roomId": 123}
```

**After already joining the same room**

**Expected Response:**
```json
{
  "error": "Already joined"
}
```

### Test 5.4: Room Full

**Send Message:**
```json
{"roomId": 123}
```

**When room is at max capacity**

**Expected Response:**
```json
{
  "error": "Room full"
}
```

### Test 5.5: No Joinable Session

**Send Message:**
```json
{"roomId": 123}
```

**When no PENDING session exists**

**Expected Response:**
```json
{
  "error": "No joinable session"
}
```

---

## 📊 Bước 6: Performance Testing

### Test 6.1: Multiple Connections

1. **Mở 10+ WebSocket connections**
2. **Join cùng 1 room**
3. **Monitor server performance**
4. **Check memory usage**

### Test 6.2: Rapid Join/Leave

1. **Connect WebSocket**
2. **Rapidly join/leave room**
3. **Verify no memory leaks**
4. **Check database consistency**

---

## 🔍 Bước 7: Database Verification

### Check Game Rooms
```sql
SELECT id, name, status, total_amount 
FROM game_rooms 
WHERE id = 123;
```

### Check Game Sessions
```sql
SELECT id, room_id, status, time_start, session 
FROM game_sessions 
WHERE room_id = 123 
ORDER BY time_start DESC;
```

### Check Game Join Rooms
```sql
SELECT id, session_id, user_id, status, time_join, amount 
FROM game_join_rooms 
WHERE session_id = 456 
ORDER BY time_join ASC;
```

---

## 📝 Bước 8: Log Analysis

### Server Logs to Watch
```bash
# Connection logs
🔌 New client connecting to /game-rooms namespace: socket_id
✅ User authenticated: 123 (username) with wallet address via socket socket_id

# Join room logs
🔄 Updated room 123 (room_name) status from wait to run based on session 456

# Error logs
❌ WebSocket connection error: error_message
❌ Failed to schedule session check for session 456: error_message
```

### Database Logs
```sql
-- Check for new records
SELECT * FROM game_join_rooms WHERE time_join > NOW() - INTERVAL '1 minute';

-- Check session updates
SELECT * FROM game_sessions WHERE id = 456;
```

---

## ✅ Test Checklist

### Connection Tests
- [ ] WebSocket connects successfully
- [ ] Authentication works with JWT token
- [ ] Disconnection handled properly
- [ ] Reconnection works

### Room Counts Tests
- [ ] Subscribe to room counts works
- [ ] Data format is correct
- [ ] Numbers are valid
- [ ] Updates in real-time

### Session Tests
- [ ] Subscribe to current session works
- [ ] Session data is accurate
- [ ] Status updates work
- [ ] Participants count is correct

### Join Room Tests
- [ ] Legacy join room works
- [ ] Join with early joiners works
- [ ] Error handling works
- [ ] Broadcast events work

### Early Joiners Tests
- [ ] Get early joiners list works
- [ ] Data is sorted by time
- [ ] Real-time updates work
- [ ] Error handling works

### Error Handling Tests
- [ ] Unauthorized errors
- [ ] Invalid room ID errors
- [ ] Already joined errors
- [ ] Room full errors
- [ ] No session errors

### Performance Tests
- [ ] Multiple connections work
- [ ] No memory leaks
- [ ] Database consistency
- [ ] Real-time updates scale

---

## 🚀 Production Testing

### Environment Setup
```bash
# Production WebSocket URL
wss://your-domain.com/socket.io/?EIO=4&transport=websocket

# Production JWT token
Cookie: refresh_token=PRODUCTION_JWT_TOKEN
```

### SSL Testing
- Use `wss://` instead of `ws://`
- Verify SSL certificate
- Test with different browsers

### Load Testing
- Test with 100+ concurrent users
- Monitor server resources
- Check database performance
- Verify error handling under load

---

## 📚 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check server is running
   - Verify port 8080 is open
   - Check firewall settings

2. **Authentication Failed**
   - Verify JWT token is valid
   - Check token expiration
   - Ensure cookies are sent

3. **Room Not Found**
   - Verify room ID exists
   - Check room status is RUNNING
   - Ensure user has permission

4. **No Session Found**
   - Check if session exists
   - Verify session status is PENDING
   - Check time_start is in future

5. **Broadcast Not Working**
   - Verify client is in correct room
   - Check namespace is correct
   - Ensure multiple clients connected

### Debug Commands

```bash
# Check server status
curl http://localhost:8080/health

# Check WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" http://localhost:8080/socket.io/?EIO=4&transport=websocket

# Check database
psql -d golden_game -c "SELECT * FROM game_rooms WHERE id = 123;"
```

---

## 🎯 Success Criteria

- [ ] All WebSocket events work correctly
- [ ] Real-time updates function properly
- [ ] Error handling is comprehensive
- [ ] Performance is acceptable
- [ ] Database consistency maintained
- [ ] Multiple clients can connect
- [ ] Authentication works securely
- [ ] Broadcasting works across clients
