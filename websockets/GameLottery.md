# Game Lottery Module - Game Xổ Số

Module thực hiện chức năng game xổ số với WebSocket real-time updates và JWT authentication.

## 🎯 Tổng quan

Game xổ số hoạt động theo flow:
1. **Activate session** → API test để activate session đã có sẵn join records
2. **Join session room** → WebSocket join session room (GameRoomGateway)
3. **Start lottery** → WebSocket start lottery session (GameLotteryGateway)
4. **Chọn số real-time** → WebSocket selectNumber với JWT validation
5. **Real-time updates** → WebSocket broadcast countdown và số đã chọn
6. **Auto random** → Tự động random số cho người chưa chọn sau 30s
7. **Generate kết quả** → WebSocket generate results
8. **Hiển thị kết quả** → WebSocket push kết quả

## 🔧 API Endpoints

### 1. Test API - Activate Session

```http
POST /lotteries/test/activate-session
Content-Type: application/json

{
  "sessionId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session 123 activated with 5 participants ready for testing",
  "sessionId": 123,
  "joinIds": [1, 2, 3, 4, 5]
}
```

### 2. Chọn Số (WebSocket Event)

```javascript
// WebSocket event thay vì REST API
lotterySocket.emit('selectNumber', { 
  sessionId: 123, 
  ticketNumber: 42 
});
```

**Response Events:**
- `numberSelected` - Thành công chọn số
- `error` - Lỗi khi chọn số

## 🔌 WebSocket Events

### Kết nối WebSocket

```typescript
import { io } from 'socket.io-client';

// Game Room WebSocket (cho join session)
const gameRoomSocket = io('http://localhost:3000/game-rooms', {
  withCredentials: true,
  transports: ['websocket']
});

// Lottery WebSocket (cho game logic)
const lotterySocket = io('http://localhost:3000/lottery', {
  withCredentials: true,
  transports: ['websocket']
});
```

### Game Room WebSocket Events

#### Client → Server Events

| Event | Payload | Mô tả |
|-------|---------|-------|
| `joinSession` | `{ sessionId: number }` | Join session room (cần JWT validation) |

#### Server → Client Events

| Event | Payload | Mô tả |
|-------|---------|-------|
| `sessionUserCount` | `{ sessionId, userCount, timestamp }` | Số lượng user trong session |
| `error` | `{ message, timestamp }` | Lỗi |

### Lottery WebSocket Events

#### Client → Server Events

| Event | Payload | Mô tả |
|-------|---------|-------|
| `startSession` | `{ sessionId: number }` | Bắt đầu lottery session |
| `selectNumber` | `{ sessionId: number, ticketNumber: number }` | Chọn số (cần JWT validation) |
| `getSelectedNumbers` | `{ sessionId: number }` | Lấy số đã chọn |
| `generateResults` | `{ sessionId: number }` | Generate kết quả |

#### Server → Client Events

| Event | Payload | Mô tả |
|-------|---------|-------|
| `sessionStarted` | `{ sessionId, totalTickets, tickets, message, timestamp }` | Session đã bắt đầu |
| `countdownUpdate` | `{ sessionId, timeLeft, isActive, timestamp }` | Cập nhật countdown timer |
| `selectNumberUpdated` | `{ sessionId, joinId, ticketNumber, message, timestamp }` | Cập nhật số đã chọn |
| `numberSelected` | `{ sessionId, ticketNumber, message, timestamp }` | Thành công chọn số |
| `autoSelectionCompleted` | `{ sessionId, autoSelectedCount, timestamp }` | Hoàn thành auto random số |
| `resultsGenerated` | `{ sessionId, winningNumber, winners, timestamp }` | Kết quả game |
| `error` | `{ message, timestamp }` | Lỗi |

## ⚛️ React Hook Integration

### useLotteryGame Hook

```typescript
import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface LotteryGameState {
  isConnected: boolean;
  selectedNumbers: Array<{
    joinId: number;
    ticketNumber: number;
    message: string;
    timestamp: string;
  }>;
  countdown: {
    timeLeft: number;
    isActive: boolean;
  };
  results: {
    winningNumber: number;
    winners: any[];
    timestamp: string;
  } | null;
  error: string | null;
}

interface UseLotteryGameReturn {
  state: LotteryGameState;
  selectNumber: (sessionId: number, ticketNumber: number) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useLotteryGame = (serverUrl: string = 'http://localhost:3000'): UseLotteryGameReturn => {
  const [lotterySocket, setLotterySocket] = useState<Socket | null>(null);
  
  const [state, setState] = useState<LotteryGameState>({
    isConnected: false,
    selectedNumbers: [],
    countdown: {
      timeLeft: 0,
      isActive: false
    },
    results: null,
    error: null
  });

  // Kết nối WebSocket
  const connect = useCallback(() => {
    const lottery = io(`${serverUrl}/lottery`, {
      withCredentials: true,
      transports: ['websocket']
    });

    lottery.on('connect', () => {
      setState(prev => ({ ...prev, isConnected: true, error: null }));
    });

    lottery.on('disconnect', () => {
      setState(prev => ({ ...prev, isConnected: false }));
    });

    lottery.on('selectNumberUpdated', (data) => {
      setState(prev => ({
        ...prev,
        selectedNumbers: [...prev.selectedNumbers, data]
      }));
    });

    lottery.on('countdownUpdate', (data) => {
      setState(prev => ({
        ...prev,
        countdown: {
          timeLeft: data.timeLeft,
          isActive: data.isActive
        }
      }));
    });

    lottery.on('resultsGenerated', (data) => {
      setState(prev => ({
        ...prev,
        results: data
      }));
    });

    lottery.on('error', (error) => {
      setState(prev => ({ ...prev, error: error.message }));
    });

    setLotterySocket(lottery);
  }, [serverUrl]);

  // Ngắt kết nối
  const disconnect = useCallback(() => {
    if (lotterySocket) {
      lotterySocket.disconnect();
      setLotterySocket(null);
    }
  }, [lotterySocket]);

  // Chọn số
  const selectNumber = useCallback((sessionId: number, ticketNumber: number) => {
    if (lotterySocket) {
      lotterySocket.emit('selectNumber', { sessionId, ticketNumber });
    }
  }, [lotterySocket]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (lotterySocket) {
        lotterySocket.disconnect();
      }
    };
  }, [lotterySocket]);

  return {
    state,
    selectNumber,
    connect,
    disconnect
  };
};
```
```

```

### Sử dụng Hook Production

```typescript
import React from 'react';
import { useLotteryGame } from './hooks/useLotteryGame';

const LotteryGameComponent: React.FC = () => {
  const {
    state,
    selectNumber,
    connect,
    disconnect
  } = useLotteryGame('http://localhost:3000');

  const handleSelectNumber = (ticketNumber: number) => {
    selectNumber(123, ticketNumber); // sessionId từ props hoặc context
  };

  return (
    <div>
      <h2>Game Xổ Số</h2>
      
      <div>
        <button onClick={connect} disabled={state.isConnected}>
          Kết nối
        </button>
        <button onClick={disconnect} disabled={!state.isConnected}>
          Ngắt kết nối
        </button>
      </div>

      {/* Countdown Timer */}
      {state.countdown.isActive && (
        <div style={{ 
          background: '#fff3cd', 
          border: '2px solid #ffeaa7', 
          borderRadius: '8px', 
          padding: '15px', 
          margin: '15px 0',
          textAlign: 'center'
        }}>
          <h3>⏰ Countdown Timer</h3>
          <div style={{ 
            fontSize: '2em', 
            fontWeight: 'bold', 
            color: state.countdown.timeLeft <= 5 ? '#e74c3c' : state.countdown.timeLeft <= 10 ? '#f39c12' : '#2c3e50',
            margin: '10px 0'
          }}>
            {state.countdown.timeLeft}s
          </div>
          <p>Trạng thái: {state.countdown.isActive ? 'Đang chọn số...' : 'Hết thời gian'}</p>
        </div>
      )}

      {/* Number Selection */}
      <div>
        <h3>Chọn số của bạn:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <button
              key={num}
              onClick={() => handleSelectNumber(num)}
              disabled={!state.isConnected || !state.countdown.isActive}
              style={{
                width: '50px',
                height: '50px',
                border: '2px solid #007bff',
                borderRadius: '50%',
                background: 'white',
                color: '#007bff',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Numbers */}
      <div>
        <h3>Số đã chọn:</h3>
        <ul>
          {state.selectedNumbers.map((item, index) => (
            <li key={index}>
              Số {item.ticketNumber} - {item.message}
            </li>
          ))}
        </ul>
      </div>

      {/* Results */}
      {state.results && (
        <div style={{ 
          background: '#f8f9fa', 
          border: '2px solid #e9ecef', 
          borderRadius: '8px', 
          padding: '20px', 
          margin: '20px 0'
        }}>
          <h3>🏆 Kết Quả Game</h3>
          <p><strong>Số trúng thưởng:</strong> {state.results.winningNumber}</p>
          <p><strong>Số người thắng:</strong> {state.results.winners.length}</p>
        </div>
      )}

      {state.error && (
        <div style={{ color: 'red' }}>
          Lỗi: {state.error}
        </div>
      )}
    </div>
    );
  };

export default LotteryGameComponent;
```


## 🔄 Flow hoạt động chi tiết

### 1. **Setup Phase**
- **Tester gọi API activate session** → `POST /lotteries/test/activate-session`
- **Server activate session** → Set status = RUNNING, join records = EXECUTED
- **Client kết nối WebSocket** → Game Room + Lottery WebSocket

### 2. **Join Phase**
- **Client join session room** → `gameRoomSocket.emit('joinSession', { sessionId })`
- **Server validate JWT** → Kiểm tra userId có trong joinId của session
- **Server emit sessionUserCount** → Broadcast số lượng user trong session

### 3. **Start Game Phase**
- **Client start lottery** → `lotterySocket.emit('startSession', { sessionId })`
- **Server tạo vé số** → Dựa trên số join records
- **Server emit sessionStarted** → Thông báo session đã bắt đầu
- **Server bắt đầu countdown** → 30s timer

### 4. **Game Phase**
- **Server emit countdownUpdate** → Broadcast countdown timer mỗi giây
- **Client chọn số** → `lotterySocket.emit('selectNumber', { sessionId, ticketNumber })`
- **Server validate JWT** → Kiểm tra userId có trong joinId
- **Server lưu số đã chọn** → Database + emit selectNumberUpdated
- **Server emit numberSelected** → Confirm cho client đã chọn

### 5. **Auto Selection Phase**
- **Hết 30s countdown** → Server tự động random số cho người chưa chọn
- **Server emit autoSelectionCompleted** → Thông báo hoàn thành auto random

### 6. **Results Phase**
- **Server tự động generate results** → Random số trúng thưởng
- **Server emit resultsGenerated** → Broadcast kết quả cho tất cả clients
- **Client hiển thị kết quả** → Winning number + winners
