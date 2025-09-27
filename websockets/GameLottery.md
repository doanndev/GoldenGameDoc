# Game Lottery Module - Game Xổ Số

Module thực hiện chức năng game xổ số với API chọn số và WebSocket real-time updates.

## 🎯 Tổng quan

Game xổ số hoạt động theo flow:
1. **Tạo session** → Tạo vé số dựa trên số người tham gia
2. **Bắt đầu countdown** → 30s để người chơi chọn số
3. **Chọn số** → API call để chọn số (REST API) trong thời gian countdown
4. **Real-time updates** → WebSocket broadcast countdown và số đã chọn
5. **Auto random** → Tự động random số cho người chưa chọn sau 30s
6. **Generate kết quả** → Tự động random và lưu kết quả
7. **Hiển thị kết quả** → WebSocket push kết quả

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

const socket = io('ws:{BASE_URL}/lottery', {
  transports: ['websocket', 'polling']
});
```

### Client → Server Events

| Event | Payload | Mô tả |
|-------|---------|-------|
| `startSession` | `{ sessionId: number }` | Bắt đầu session - tạo vé số và countdown 30s |
| `getSelectedNumbers` | `{ sessionId: number }` | Lấy số đã chọn (không cần thiết - server tự động broadcast) |
| `generateResults` | `{ sessionId: number, roomId: number }` | Generate kết quả (không cần thiết - server tự động generate) |

### Server → Client Events

| Event | Payload | Mô tả |
|-------|---------|-------|
| `sessionStarted` | `{ sessionId, totalTickets, tickets, message, timestamp }` | Session đã bắt đầu |
| `countdownUpdate` | `{ sessionId, roomId, timeLeft, isActive, timestamp }` | Cập nhật countdown timer (mỗi giây) |
| `selectNumberUpdated` | `{ joinId, selectedNumbers, totalSelected, selectedNumbersWithClient, timestamp }` | Cập nhật số đã chọn |
| `autoSelectionCompleted` | `{ sessionId, roomId, autoSelectedCount, timestamp }` | Hoàn thành auto random số |
| `gameResults` | `{ sessionId, roomId, winningNumbers, results, timestamp }` | Kết quả game |
| `error` | `{ message, timestamp }` | Lỗi |

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
  countdown: {
    timeLeft: number;
    isActive: boolean;
  };
  autoSelectedCount: number;
  error: string | null;
}

interface UseLotteryGameReturn {
  state: LotteryGameState;
  selectNumber: (joinId: number, ticketNumber: number) => Promise<void>;
  startSession: (sessionId: number) => void;
  // getSelectedNumbers: (sessionId: number) => void; // Không cần thiết - server tự động broadcast
  // generateResults: (sessionId: number, roomId: number) => void; // Không cần thiết - server tự động generate
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
    countdown: {
      timeLeft: 0,
      isActive: false
    },
    autoSelectedCount: 0,
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

    newSocket.on('countdownUpdate', (data) => {
      setState(prev => ({
        ...prev,
        countdown: {
          timeLeft: data.timeLeft,
          isActive: data.isActive
        }
      }));
    });

    newSocket.on('selectNumberUpdated', (data) => {
      setState(prev => ({
        ...prev,
        selectedNumbers: data.selectedNumbers,
        totalSelected: data.totalSelected,
        selectedNumbersWithClient: data.selectedNumbersWithClient
      }));
    });

    newSocket.on('autoSelectionCompleted', (data) => {
      setState(prev => ({
        ...prev,
        autoSelectedCount: data.autoSelectedCount
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

  // Lấy số đã chọn (không cần thiết - server tự động broadcast khi có người chọn số)
  // const getSelectedNumbers = useCallback((sessionId: number) => {
  //   if (socket) {
  //     socket.emit('getSelectedNumbers', { sessionId });
  //   }
  // }, [socket]);

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
    // getSelectedNumbers, // Không cần thiết - server tự động broadcast
    // generateResults, // Không cần thiết - server tự động generate
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
    // getSelectedNumbers, // Không cần thiết - server tự động broadcast
    // generateResults, // Không cần thiết - server tự động generate
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

      <div>
        <h3>Số đã chọn: {state.totalSelected}</h3>
        {state.autoSelectedCount > 0 && (
          <p>Đã tự động chọn số cho {state.autoSelectedCount} người chơi</p>
        )}
        <ul>
          {state.selectedNumbersWithClient.map((item, index) => (
            <li key={index}>
              Số {item.ticketNumber} - {item.clientInfo.username}
            </li>
          ))}
        </ul>
      </div>

      {/* Game Results */}
      {state.gameResults.length > 0 && (
        <div style={{ 
          background: '#f8f9fa', 
          border: '2px solid #e9ecef', 
          borderRadius: '8px', 
          padding: '20px', 
          margin: '20px 0'
        }}>
          <h3>🏆 Kết Quả Game</h3>
          <div>
            <h4>Số trúng thưởng:</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {state.winningNumbers.map((number, index) => (
                <div key={index} style={{
                  background: 'linear-gradient(45deg, #f39c12, #e67e22)',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '50%',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  minWidth: '50px',
                  textAlign: 'center'
                }}>
                  {number}
                </div>
              ))}
            </div>
          </div>
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

1. **Client kết nối WebSocket** → Nhận real-time updates
2. **Client gọi startSession** → Server tạo vé số và bắt đầu countdown 30s
3. **Server emit countdownUpdate** → Broadcast countdown timer mỗi giây
4. **Client gọi API chọn số** → Server lưu vào database (trong thời gian countdown)
5. **Server emit selectNumberUpdated** → Tất cả clients nhận update số đã chọn
6. **Hết 30s** → Server tự động random số cho người chưa chọn
7. **Server emit autoSelectionCompleted** → Thông báo hoàn thành auto random
8. **Server tự động generateResults** → Random và lưu kết quả
9. **Server emit gameResults** → Broadcast kết quả cho tất cả clients
