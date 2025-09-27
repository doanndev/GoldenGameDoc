# Game Lottery Module - Game Xổ Số

Module thực hiện chức năng game xổ số với API chọn số và WebSocket real-time updates.

## 🎯 Tổng quan

Game xổ số hoạt động theo flow:
1. **Tạo session** → Tạo vé số dựa trên số người tham gia
2. **Chọn số** → API call để chọn số (REST API)
3. **Real-time updates** → WebSocket broadcast cho tất cả clients
4. **Generate kết quả** → Random và lưu kết quả
5. **Hiển thị kết quả** → WebSocket push kết quả

## 🔧 API Endpoints

### 1. Chọn Số (Main API)

```http
POST /api/v1/lotteries/select-number
Content-Type: application/json
Authorization: Bearer <token>

{
  "joinId": 123,
  "ticketNumber": 42
}
```

**Response:**
```json
{
  "success": true,
  "message": "Number selected successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Ticket not available or already selected"
}
```

## 🔌 WebSocket Events

### Kết nối WebSocket

```typescript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:8000/lottery', {
  transports: ['websocket', 'polling']
});
```

### Client → Server Events

| Event | Payload | Mô tả |
|-------|---------|-------|
| `startSession` | `{ sessionId: number }` | Bắt đầu session - tạo vé số |
| `getSelectedNumbers` | `{ sessionId: number }` | Lấy số đã chọn |
| `generateResults` | `{ sessionId: number, roomId: number }` | Generate kết quả |

### Server → Client Events

| Event | Payload | Mô tả |
|-------|---------|-------|
| `sessionStarted` | `{ sessionId, totalTickets, tickets, message, timestamp }` | Session đã bắt đầu |
| `selectNumberUpdated` | `{ joinId, selectedNumbers, totalSelected, selectedNumbersWithClient, timestamp }` | Cập nhật số đã chọn |
| `gameResults` | `{ sessionId, roomId, winningNumbers, results, timestamp }` | Kết quả game |
| `error` | `{ message }` | Lỗi |

## ⚛️ React Hook Integration

### useLotteryGame Hook

```typescript
import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface LotteryGameState {
  isConnected: boolean;
  selectedNumbers: number[];
  totalSelected: number;
  selectedNumbersWithClient: any[];
  winningNumbers: number[];
  gameResults: any[];
  error: string | null;
}

interface UseLotteryGameReturn {
  state: LotteryGameState;
  selectNumber: (joinId: number, ticketNumber: number) => Promise<void>;
  startSession: (sessionId: number) => void;
  getSelectedNumbers: (sessionId: number) => void;
  generateResults: (sessionId: number, roomId: number) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useLotteryGame = (serverUrl: string = 'ws://localhost:8000'): UseLotteryGameReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<LotteryGameState>({
    isConnected: false,
    selectedNumbers: [],
    totalSelected: 0,
    selectedNumbersWithClient: [],
    winningNumbers: [],
    gameResults: [],
    error: null
  });

  // Kết nối WebSocket
  const connect = useCallback(() => {
    const newSocket = io(`${serverUrl}/lottery`, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setState(prev => ({ ...prev, isConnected: true, error: null }));
    });

    newSocket.on('disconnect', () => {
      setState(prev => ({ ...prev, isConnected: false }));
    });

    newSocket.on('sessionStarted', (data) => {
      console.log('Session started:', data);
    });

    newSocket.on('selectNumberUpdated', (data) => {
      setState(prev => ({
        ...prev,
        selectedNumbers: data.selectedNumbers,
        totalSelected: data.totalSelected,
        selectedNumbersWithClient: data.selectedNumbersWithClient
      }));
    });

    newSocket.on('gameResults', (data) => {
      setState(prev => ({
        ...prev,
        winningNumbers: data.winningNumbers,
        gameResults: data.results
      }));
    });

    newSocket.on('error', (data) => {
      setState(prev => ({ ...prev, error: data.message }));
    });

    setSocket(newSocket);
  }, [serverUrl]);

  // Ngắt kết nối
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);

  // Chọn số qua API
  const selectNumber = useCallback(async (joinId: number, ticketNumber: number) => {
    try {
      const response = await fetch(`${serverUrl.replace('ws://', 'http://')}/api/v1/lotteries/select-number`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ joinId, ticketNumber })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to select number');
      }

      // WebSocket sẽ tự động nhận event selectNumberUpdated
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [serverUrl]);

  // Bắt đầu session
  const startSession = useCallback((sessionId: number) => {
    if (socket) {
      socket.emit('startSession', { sessionId });
    }
  }, [socket]);

  // Lấy số đã chọn
  const getSelectedNumbers = useCallback((sessionId: number) => {
    if (socket) {
      socket.emit('getSelectedNumbers', { sessionId });
    }
  }, [socket]);

  // Generate kết quả
  const generateResults = useCallback((sessionId: number, roomId: number) => {
    if (socket) {
      socket.emit('generateResults', { sessionId, roomId });
    }
  }, [socket]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return {
    state,
    selectNumber,
    startSession,
    getSelectedNumbers,
    generateResults,
    connect,
    disconnect
  };
};
```

### Sử dụng Hook trong Component

```typescript
import React from 'react';
import { useLotteryGame } from './hooks/useLotteryGame';

const LotteryGameComponent: React.FC = () => {
  const {
    state,
    selectNumber,
    startSession,
    getSelectedNumbers,
    generateResults,
    connect,
    disconnect
  } = useLotteryGame('ws://localhost:8000');

  const handleSelectNumber = async () => {
    await selectNumber(123, 42);
  };

  const handleStartSession = () => {
    startSession(1);
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

      <div>
        <button onClick={handleStartSession}>
          Bắt đầu Session
        </button>
        <button onClick={handleSelectNumber}>
          Chọn số 42
        </button>
      </div>

      <div>
        <h3>Số đã chọn: {state.totalSelected}</h3>
        <ul>
          {state.selectedNumbersWithClient.map((item, index) => (
            <li key={index}>
              Số {item.ticketNumber} - {item.clientInfo.username}
            </li>
          ))}
        </ul>
      </div>

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

## 🧪 Testing Guide

### 1. Test API Endpoints

```bash
# Test chọn số
curl -X POST http://localhost:8000/api/v1/lotteries/select-number \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"joinId": 123, "ticketNumber": 42}'

# Test lấy số đã chọn
curl -X GET http://localhost:8000/api/v1/lotteries/selected-numbers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test bắt đầu session
curl -X POST http://localhost:8000/api/v1/lotteries/start-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"sessionId": 1}'
```

### 2. Test WebSocket Events

```javascript
// Test WebSocket connection
const socket = io('ws://localhost:8000/lottery');

socket.on('connect', () => {
  console.log('Connected to WebSocket');
  
  // Test start session
  socket.emit('startSession', { sessionId: 1 });
});

socket.on('sessionStarted', (data) => {
  console.log('Session started:', data);
});

socket.on('selectNumberUpdated', (data) => {
  console.log('Numbers updated:', data);
});

socket.on('gameResults', (data) => {
  console.log('Game results:', data);
});
```

### 3. Test HTML Interface

Mở file `test-lottery.html` trong browser:
1. Nhập JWT token
2. Click "Kết nối WebSocket"
3. Nhập Session ID và Join ID
4. Click "Bắt đầu Session"
5. Click vào số trong lưới để chọn số
6. Quan sát real-time updates

## 🗄️ Database Schema

### game_lottery_selects
```sql
CREATE TABLE game_lottery_selects (
  id SERIAL PRIMARY KEY,
  join_id INTEGER REFERENCES game_join_rooms(id),
  lottery_id INTEGER REFERENCES game_lottery_tickets(id)
);
```

### game_lottery_results
```sql
CREATE TABLE game_lottery_results (
  id SERIAL PRIMARY KEY,
  prize_id INTEGER REFERENCES game_set_prizes(id),
  lottery_id INTEGER REFERENCES game_lottery_tickets(id)
);
```

### game_lottery_tickets
```sql
CREATE TABLE game_lottery_tickets (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES game_sessions(id),
  ticket INTEGER NOT NULL,
  select_status BOOLEAN DEFAULT FALSE
);
```

## ⚙️ Cấu hình

### Environment Variables
```env
# Server
APP_PORT=8000
JWT_SECRET=your-secret-key

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=golden_game
```

### Dependencies
```json
{
  "@nestjs/websockets": "^10.0.0",
  "@nestjs/platform-socket.io": "^10.0.0",
  "@nestjs/event-emitter": "^2.0.0",
  "socket.io": "^4.7.0"
}
```

## 🚨 Lưu ý quan trọng

1. **Authentication**: Tất cả API endpoints yêu cầu JWT token
2. **CORS**: Đã cấu hình cho phép tất cả origins (`*`)
3. **Real-time**: Sử dụng WebSocket cho updates, API cho actions
4. **Error Handling**: Luôn check response status và error messages
5. **Token Storage**: Lưu JWT token trong localStorage hoặc secure storage
6. **WebSocket Namespace**: `/lottery`
7. **API Prefix**: `/api/v1`

## 🔄 Flow hoạt động chi tiết

1. **Client kết nối WebSocket** → Nhận real-time updates
2. **Client gọi API chọn số** → Server lưu vào database
3. **Server emit event** → Tất cả clients nhận update
4. **Client hiển thị** → Cập nhật UI với thông tin mới
5. **Generate kết quả** → Random và broadcast kết quả

## 📝 Changelog

- **v1.0.0**: Initial release với API chọn số và WebSocket updates
- **v1.1.0**: Thêm thông tin client trong selectedNumbersWithClient
- **v1.2.0**: Cập nhật CORS configuration và API prefix
