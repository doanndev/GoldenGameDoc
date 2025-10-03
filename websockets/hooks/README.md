# Game Room WebSocket Hooks

Bộ hooks React để sử dụng WebSocket cho Game Room với các tính năng real-time.

## 🚀 Cài đặt

```bash
npm install socket.io-client
```

## 📁 Cấu trúc Files

```
src/modules/websockets/
├── types/
│   └── websocket-events.types.ts    # TypeScript interfaces
├── hooks/
│   ├── useGameRoomWebSocket.ts      # Core WebSocket hooks
│   └── useGameRoom.ts               # Main composite hooks
├── examples/
│   └── GameRoomExample.tsx          # Usage examples
└── README.md                        # Documentation
```

## 🔧 Cấu hình

Thêm vào file `.env`:

```env
REACT_APP_WEBSOCKET_URL=http://localhost:8080
```

## 📖 Cách sử dụng

### 1. Hook cơ bản - `useGameRoom`

```tsx
import { useGameRoom } from './hooks/useGameRoom';

const MyComponent = () => {
  const {
    isConnected,
    isConnecting,
    connectionError,
    userId,
    connect,
    disconnect,
  } = useGameRoom({ autoConnect: true });

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>User ID: {userId}</p>
      {connectionError && <p>Error: {connectionError}</p>}
    </div>
  );
};
```

### 2. Room Counts - Đếm số phòng theo game type

```tsx
import { useGameRoom } from './hooks/useGameRoom';

const RoomCountsComponent = ({ gameTypeId }: { gameTypeId: number }) => {
  const {
    roomCounts,
    isRoomCountsLoading,
    refreshRoomCounts,
  } = useGameRoom({ gameTypeId });

  return (
    <div>
      {isRoomCountsLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p>Pending: {roomCounts?.pending}</p>
          <p>Running: {roomCounts?.running}</p>
          <p>Total: {roomCounts?.total}</p>
        </div>
      )}
      <button onClick={refreshRoomCounts}>Refresh</button>
    </div>
  );
};
```

### 3. Current Session - Session hiện tại của phòng

```tsx
import { useGameRoom } from './hooks/useGameRoom';

const CurrentSessionComponent = ({ roomId }: { roomId: number }) => {
  const {
    currentSession,
    isCurrentSessionLoading,
    refreshCurrentSession,
  } = useGameRoom({ roomId });

  return (
    <div>
      {isCurrentSessionLoading ? (
        <p>Loading session...</p>
      ) : currentSession?.current_session ? (
        <div>
          <p>Session ID: {currentSession.current_session.id}</p>
          <p>Status: {currentSession.current_session.status}</p>
          <p>Participants: {currentSession.current_session.participants_count}</p>
          <p>Can Join: {currentSession.current_session.can_join ? 'Yes' : 'No'}</p>
        </div>
      ) : (
        <p>No active session</p>
      )}
      <button onClick={refreshCurrentSession}>Refresh</button>
    </div>
  );
};
```

### 4. Early Joiners - Danh sách người tham gia sớm nhất

```tsx
import { useGameRoom } from './hooks/useGameRoom';

const EarlyJoinersComponent = ({ roomId, sessionId }: { roomId: number; sessionId?: number }) => {
  const {
    earlyJoiners,
    earlyJoinersTotalCount,
    isEarlyJoinersLoading,
    earlyJoinersError,
    refreshEarlyJoiners,
  } = useGameRoom({ roomId, sessionId });

  return (
    <div>
      <h3>Early Joiners ({earlyJoinersTotalCount})</h3>
      
      {earlyJoinersError && <p className="error">Error: {earlyJoinersError}</p>}
      
      {isEarlyJoinersLoading ? (
        <p>Loading joiners...</p>
      ) : (
        <div>
          {earlyJoiners.map((joiner, index) => (
            <div key={joiner.user_id} className="joiner-item">
              <span className="rank">{index + 1}</span>
              <span className="username">{joiner.username}</span>
              <span className="joined-at">
                {new Date(joiner.joined_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <button onClick={refreshEarlyJoiners}>Refresh</button>
    </div>
  );
};
```

### 5. Join Room - Tham gia phòng

```tsx
import { useGameRoom } from './hooks/useGameRoom';

const JoinRoomComponent = ({ roomId }: { roomId: number }) => {
  const {
    joinRoom,
    joinRoomLegacy,
    isJoining,
    joinResult,
    joinError,
  } = useGameRoom({ roomId });

  const handleJoin = () => {
    joinRoom(roomId); // Với early joiners
  };

  const handleJoinLegacy = () => {
    joinRoomLegacy(roomId); // Legacy method
  };

  return (
    <div>
      {joinError && <p className="error">Error: {joinError}</p>}
      
      {joinResult && (
        <div className="success">
          <p>Successfully joined!</p>
          <p>Session: {joinResult.sessionId}</p>
        </div>
      )}
      
      <button onClick={handleJoin} disabled={isJoining}>
        {isJoining ? 'Joining...' : 'Join Room (with Early Joiners)'}
      </button>
      
      <button onClick={handleJoinLegacy} disabled={isJoining}>
        {isJoining ? 'Joining...' : 'Join Room (Legacy)'}
      </button>
    </div>
  );
};
```

### 6. Room Updates - Lắng nghe cập nhật phòng

```tsx
import { useGameRoom } from './hooks/useGameRoom';

const RoomUpdatesComponent = ({ roomId }: { roomId: number }) => {
  const {
    roomUpdates,
    clearRoomUpdates,
  } = useGameRoom({ roomId });

  return (
    <div>
      <h3>Room Updates</h3>
      <button onClick={clearRoomUpdates}>Clear Updates</button>
      
      <div className="updates-list">
        {roomUpdates.map((update, index) => (
          <div key={index} className="update-item">
            <p>Type: {update.type}</p>
            <p>Time: {new Date(update.timestamp).toLocaleString()}</p>
            <pre>{JSON.stringify(update.data, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 7. Hook chuyên dụng - `useRoomOperations`

```tsx
import { useRoomOperations } from './hooks/useGameRoom';

const RoomOperationsComponent = ({ roomId }: { roomId: number }) => {
  const {
    isConnected,
    currentSession,
    earlyJoiners,
    joinThisRoom,
    refreshThisRoom,
  } = useRoomOperations(roomId);

  return (
    <div>
      <h2>Room Operations for Room {roomId}</h2>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      
      <button onClick={joinThisRoom}>Join This Room</button>
      <button onClick={refreshThisRoom}>Refresh This Room</button>
      
      {/* Sử dụng currentSession, earlyJoiners, etc. */}
    </div>
  );
};
```

### 8. Hook cho Game Type - `useGameTypeOperations`

```tsx
import { useGameTypeOperations } from './hooks/useGameRoom';

const GameTypeOperationsComponent = ({ gameTypeId }: { gameTypeId: number }) => {
  const {
    roomCounts,
    refreshThisGameType,
  } = useGameTypeOperations(gameTypeId);

  return (
    <div>
      <h2>Game Type Operations for Type {gameTypeId}</h2>
      <p>Total Rooms: {roomCounts?.total}</p>
      <button onClick={refreshThisGameType}>Refresh Game Type</button>
    </div>
  );
};
```

## 🎯 WebSocket Events

### Client to Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribeRoomCountByGameType` | `number` | Subscribe to room counts by game type |
| `subscribeCurrentSession` | `number` | Subscribe to current session updates |
| `gameJoinRoom` | `{ roomId: number }` | Join room (legacy) |
| `getEarlyJoinersList` | `{ roomId: number; sessionId?: number }` | Get early joiners list |
| `joinRoomWithEarlyJoiners` | `{ roomId: number }` | Join room with early joiners |

### Server to Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `connected` | `{ message, clientId, namespace, userId }` | Connection established |
| `gameRoomCounts` | `GameRoomCounts` | Room counts update |
| `currentSession` | `CurrentSession` | Current session data |
| `currentSessionUpdated` | `CurrentSession` | Session update |
| `gameJoinRoomResult` | `JoinResult` | Join room result (legacy) |
| `earlyJoinersListResult` | `EarlyJoinersResult` | Early joiners list result |
| `joinRoomWithEarlyJoinersResult` | `JoinWithEarlyJoinersResult` | Join with early joiners result |
| `gameJoinRoomUpdated` | `RoomUpdate` | Room update broadcast |
| `roomEarlyJoinersUpdated` | `EarlyJoinersUpdate` | Early joiners update broadcast |

## 🔧 TypeScript Interfaces

```typescript
interface EarlyJoiner {
  user_id: number;
  username: string;
  fullname: string;
  avatar: string;
  joined_at: string;
  amount: number;
  status: string;
}

interface GameRoomCounts {
  pending: number;
  running: number;
  out: number;
  end: number;
  total: number;
  lastUpdated: string;
  error?: string;
}

interface CurrentSession {
  roomId: number;
  current_session: {
    id: number;
    status: string;
    time_start: string;
    session: string;
    participants_count: number;
    max_participants: number;
    can_join: boolean;
  } | null;
  error?: string;
}
```

## 🎨 Styling Example

```css
.joiner-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #ddd;
  margin: 4px 0;
  border-radius: 4px;
}

.rank {
  background: #007bff;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-weight: bold;
}

.username {
  font-weight: bold;
  margin-right: 12px;
}

.joined-at {
  color: #666;
  font-size: 0.9em;
}

.error {
  color: #dc3545;
  background: #f8d7da;
  padding: 8px;
  border-radius: 4px;
  margin: 8px 0;
}

.success {
  color: #155724;
  background: #d4edda;
  padding: 8px;
  border-radius: 4px;
  margin: 8px 0;
}
```

## 🚀 Advanced Usage

### Custom Hook với Error Handling

```tsx
const useGameRoomWithErrorHandling = (roomId: number) => {
  const gameRoom = useGameRoom({ roomId });
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    if (gameRoom.connectionError && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        gameRoom.connect();
      }, 2000 * (retryCount + 1)); // Exponential backoff

      return () => clearTimeout(timer);
    }
  }, [gameRoom.connectionError, retryCount, gameRoom.connect]);

  return {
    ...gameRoom,
    retryCount,
    canRetry: retryCount < maxRetries,
  };
};
```

### Hook với Local Storage

```tsx
const useGameRoomWithPersistence = (roomId: number) => {
  const gameRoom = useGameRoom({ roomId });
  const [persistedData, setPersistedData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`gameRoom_${roomId}`);
    if (saved) {
      setPersistedData(JSON.parse(saved));
    }
  }, [roomId]);

  useEffect(() => {
    if (gameRoom.currentSession) {
      localStorage.setItem(`gameRoom_${roomId}`, JSON.stringify(gameRoom.currentSession));
    }
  }, [gameRoom.currentSession, roomId]);

  return {
    ...gameRoom,
    persistedData,
  };
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**: Kiểm tra `REACT_APP_WEBSOCKET_URL` trong `.env`
2. **Authentication Error**: Đảm bảo cookies được gửi với request
3. **Room Not Found**: Kiểm tra `roomId` có tồn tại và đúng format
4. **Session Not Found**: Kiểm tra session có status `PENDING`

### Debug Mode

```tsx
const useGameRoomDebug = (options: UseGameRoomOptions) => {
  const gameRoom = useGameRoom(options);

  useEffect(() => {
    console.log('GameRoom Debug:', {
      isConnected: gameRoom.isConnected,
      roomId: options.roomId,
      currentSession: gameRoom.currentSession,
      earlyJoiners: gameRoom.earlyJoiners,
    });
  }, [gameRoom.isConnected, gameRoom.currentSession, gameRoom.earlyJoiners]);

  return gameRoom;
};
```

## 📝 Notes

- Tất cả hooks đều tự động cleanup khi component unmount
- WebSocket connection được share giữa các hooks
- Authentication được handle tự động qua cookies
- Real-time updates được broadcast đến tất cả clients trong cùng room
- Error handling được tích hợp sẵn trong tất cả hooks
