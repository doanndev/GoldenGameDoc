# 📬 Hướng dẫn sử dụng Postman Collection cho Game Room WebSocket

## 🚀 Cài đặt nhanh

### 1. Import Collection
1. Mở Postman
2. Click **Import**
3. Chọn file `GameRoom_WebSocket_Collection.json`
4. Click **Import**

### 2. Cấu hình Environment
1. Click **Environments** → **Create Environment**
2. Tên: `Game Room WebSocket`
3. Thêm các variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:8080` | `http://localhost:8080` |
| `ws_url` | `ws://localhost:8080/socket.io/?EIO=4&transport=websocket` | `ws://localhost:8080/socket.io/?EIO=4&transport=websocket` |
| `jwt_token` | `YOUR_JWT_TOKEN_HERE` | `YOUR_ACTUAL_JWT_TOKEN` |
| `room_id` | `123` | `123` |
| `session_id` | `456` | `456` |
| `game_type_id` | `1` | `1` |

4. Click **Save**

---

## 🔧 Cách sử dụng WebSocket trong Postman

### Bước 1: Tạo WebSocket Request

1. **New** → **WebSocket Request**
2. **URL**: `{{ws_url}}`
3. **Headers**:
   ```
   Cookie: refresh_token={{jwt_token}}
   ```
4. Click **Connect**

### Bước 2: Gửi Messages

Sau khi connect thành công, bạn có thể gửi các messages sau:

#### 2.1. Subscribe Room Counts
**Message**: `{{game_type_id}}`
**Expected Response**: `gameRoomCounts`

#### 2.2. Subscribe Current Session
**Message**: `{{room_id}}`
**Expected Response**: `currentSession`

#### 2.3. Get Early Joiners List
**Message**:
```json
{
  "roomId": {{room_id}},
  "sessionId": {{session_id}}
}
```
**Expected Response**: `earlyJoinersListResult`

#### 2.4. Join Room (Legacy)
**Message**:
```json
{
  "roomId": {{room_id}}
}
```
**Expected Response**: `gameJoinRoomResult`

#### 2.5. Join Room with Early Joiners
**Message**:
```json
{
  "roomId": {{room_id}}
}
```
**Expected Response**: `joinRoomWithEarlyJoinersResult`

---

## 📋 Test Scenarios

### Scenario 1: Basic Connection Flow

1. **Connect** WebSocket
2. **Verify** `connected` event
3. **Send** `{{game_type_id}}` (subscribe room counts)
4. **Verify** `gameRoomCounts` response
5. **Send** `{{room_id}}` (subscribe current session)
6. **Verify** `currentSession` response

### Scenario 2: Join Room Flow

1. **Connect** WebSocket
2. **Send** early joiners request:
   ```json
   {
     "roomId": {{room_id}},
     "sessionId": {{session_id}}
   }
   ```
3. **Verify** `earlyJoinersListResult`
4. **Send** join room request:
   ```json
   {
     "roomId": {{room_id}}
   }
   ```
5. **Verify** `joinRoomWithEarlyJoinersResult`

### Scenario 3: Multiple Client Test

1. **Mở 2 tab Postman WebSocket**
2. **Connect cả 2 clients**
3. **Từ client 1**: Join room
4. **Từ client 2**: Subscribe to room
5. **Verify** client 2 nhận được broadcast events

---

## 🐛 Error Testing

### Test Authentication Error
1. **Connect** without JWT token
2. **Send** join room request
3. **Verify** `Unauthorized` error

### Test Invalid Room
1. **Connect** with valid JWT
2. **Send** join room with invalid room ID:
   ```json
   {
     "roomId": 999
   }
   ```
3. **Verify** `Room not found` error

### Test Already Joined
1. **Connect** and join room
2. **Send** join room request again
3. **Verify** `Already joined` error

---

## 📊 Monitoring & Debugging

### Server Logs
```bash
# Watch server logs
npm run start:dev

# Look for these patterns:
# 🔌 New client connecting
# ✅ User authenticated
# 🔄 Updated room status
# ❌ Error messages
```

### Database Verification
```sql
-- Check room status
SELECT id, name, status FROM game_rooms WHERE id = 123;

-- Check session status
SELECT id, room_id, status, time_start FROM game_sessions WHERE room_id = 123;

-- Check join records
SELECT id, session_id, user_id, status, time_join FROM game_join_rooms WHERE session_id = 456;
```

---

## 🔧 Advanced Testing

### Load Testing
1. **Mở 10+ WebSocket connections**
2. **Join cùng 1 room**
3. **Monitor server performance**
4. **Check memory usage**

### Error Recovery
1. **Disconnect network**
2. **Reconnect**
3. **Verify reconnection works**
4. **Check data consistency**

### Real-time Updates
1. **Connect 2 clients**
2. **Join room từ client 1**
3. **Verify client 2 nhận được updates**
4. **Test session status changes**

---

## 📝 Test Checklist

### Connection Tests
- [ ] WebSocket connects successfully
- [ ] Authentication works
- [ ] Disconnection handled
- [ ] Reconnection works

### Room Counts Tests
- [ ] Subscribe works
- [ ] Data format correct
- [ ] Numbers valid
- [ ] Real-time updates

### Session Tests
- [ ] Subscribe works
- [ ] Data accurate
- [ ] Status updates work
- [ ] Participants count correct

### Join Room Tests
- [ ] Legacy join works
- [ ] Join with early joiners works
- [ ] Error handling works
- [ ] Broadcast events work

### Early Joiners Tests
- [ ] Get list works
- [ ] Data sorted by time
- [ ] Real-time updates work
- [ ] Error handling works

---

## 🚀 Production Testing

### Environment Setup
```bash
# Production URLs
base_url: https://your-domain.com
ws_url: wss://your-domain.com/socket.io/?EIO=4&transport=websocket

# Production JWT token
jwt_token: PRODUCTION_JWT_TOKEN
```

### SSL Testing
- Use `wss://` for HTTPS
- Verify SSL certificate
- Test with different browsers

### Performance Testing
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

---

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:

1. **Server logs** để xem error messages
2. **Database** để verify data consistency
3. **Network** để đảm bảo connection stable
4. **JWT token** để verify authentication
5. **Room/Session status** để đảm bảo valid state

---

## 🔄 Updates

Collection này sẽ được cập nhật khi có thêm features mới:

- New WebSocket events
- Updated error handling
- Performance improvements
- Security enhancements

Hãy check thường xuyên để có version mới nhất!
