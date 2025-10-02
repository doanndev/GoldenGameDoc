# useGameRoomsSocket Hook

## 📖 **Tổng quan**

`useGameRoomsSocket` là một React hook được thiết kế để quản lý kết nối WebSocket với backend game rooms và cung cấp real-time updates cho sessions, participants, và room data.

## 🚀 **Tính năng chính**

- ✅ **WebSocket Connection Management** - Quản lý kết nối WebSocket tự động
- ✅ **Real-time Session Updates** - Cập nhật session data theo thời gian thực
- ✅ **Participant Management** - Quản lý participants trong room/session
- ✅ **Room Counts** - Theo dõi số lượng rooms theo trạng thái
- ✅ **Error Handling** - Xử lý lỗi kết nối và API
- ✅ **TypeScript Support** - Types đầy đủ cho tất cả data structures
- ✅ **Auto-reconnection** - Tự động kết nối lại khi mất kết nối

## 📦 **Cài đặt**

```typescript
import { useGameRoomsSocket } from '@/hooks';
```

## 🔧 **Cách sử dụng cơ bản**

```typescript
import React, { useEffect } from 'react';
import { useGameRoomsSocket } from '@/hooks';

const MyComponent = () => {
  const {
    isConnected,
    roomCounts,
    latestSession,
    currentActiveSession,
    roomParticipantData,
    subscribeRoomCounts,
    getLatestSessionByRoom,
    subscribeRoomParticipants
  } = useGameRoomsSocket({
    autoConnect: true,
    enableLogs: true
  });

  useEffect(() => {
    if (isConnected) {
      // Subscribe to room counts
      subscribeRoomCounts();
      
      // Get latest session
      getLatestSessionByRoom(172);
      
      // Subscribe to room participants
      subscribeRoomParticipants(172);
    }
  }, [isConnected]);

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {latestSession && (
        <div>
          <h3>Latest Session: {latestSession.id}</h3>
          <p>Status: {latestSession.status}</p>
        </div>
      )}
    </div>
  );
};
```

## ⚙️ **Configuration Options**

```typescript
interface UseGameRoomsSocketOptions {
  autoConnect?: boolean;    // Tự động kết nối khi mount (default: true)
  enableLogs?: boolean;     // Bật debug logs (default: false)
}
```

## 📊 **Return Values**

### **Connection State**
```typescript
{
  isConnected: boolean;           // Trạng thái kết nối WebSocket
  error: string | null;           // Lỗi kết nối (nếu có)
  connect: () => void;            // Kết nối thủ công
  disconnect: () => void;         // Ngắt kết nối
}
```

### **Room Data**
```typescript
{
  roomCounts: RoomCounts | null;  // Số lượng rooms theo trạng thái
  sessionUserCount: {             // Số lượng users trong session
    sessionId: number;
    userCount: number;
    timestamp: string;
  } | null;
}
```

### **Session Data**
```typescript
{
  latestSession: GameSession | null;           // Session mới nhất
  sessionWithDetails: SessionWithDetails | null; // Session với chi tiết
  allSessions: GameSession[];                  // Tất cả sessions
  currentActiveSession: GameSession | null;    // Session đang active
}
```

### **Participant Data**
```typescript
{
  roomParticipantData: RoomParticipantData | null;  // Participants của room
  participantCountData: ParticipantCountData | null; // Cập nhật count
  sessionStatusData: SessionStatusData | null;       // Thay đổi status
}
```

## 🎯 **Methods**

### **Room Counts Management**
```typescript
{
  subscribeRoomCounts: () => void;        // Subscribe room counts
  retrySubscribeRoomCounts: () => void;   // Retry subscription
  unsubscribeRoomCounts: () => void;      // Unsubscribe
}
```

### **Session Management**
```typescript
{
  getLatestSessionByRoom: (roomId: number) => void;           // Lấy session mới nhất
  getLatestSessionWithDetails: (roomId: number) => void;      // Lấy session với details
  getAllSessionsByRoom: (roomId: number, limit?: number) => void; // Lấy tất cả sessions
  getCurrentActiveSession: (roomId: number) => void;          // Lấy session active
  subscribeCurrentActiveSession: (roomId: number) => void;    // Subscribe session active
  unsubscribeCurrentActiveSession: (roomId: number) => void;  // Unsubscribe
}
```

### **Participant Management**
```typescript
{
  subscribeRoomParticipants: (roomId: number) => void;        // Subscribe room participants
  unsubscribeRoomParticipants: (roomId: number) => void;      // Unsubscribe
  getRoomParticipants: (roomId: number) => void;              // Lấy room participants
  subscribeSessionParticipants: (sessionId: number, roomId: number) => void; // Subscribe session participants
  unsubscribeSessionParticipants: (sessionId: number) => void; // Unsubscribe
  getSessionParticipants: (sessionId: number, roomId: number) => void; // Lấy session participants
}
```

### **Session Actions**
```typescript
{
  joinSession: (sessionId: number) => void;   // Tham gia session
  leaveSession: (sessionId: number) => void;  // Rời session
}
```

## 📡 **WebSocket Events**

### **Client → Server Events**
| Event | Description | Parameters |
|-------|-------------|------------|
| `subscribeRoomCounts` | Subscribe room counts | - |
| `unsubscribeRoomCounts` | Unsubscribe room counts | - |
| `getLatestSession` | Lấy session mới nhất | `{ roomId: number }` |
| `getAllSessions` | Lấy tất cả sessions | `{ roomId: number, limit: number }` |
| `getCurrentActiveSession` | Lấy session active | `{ roomId: number }` |
| `subscribeCurrentActiveSession` | Subscribe session active | `{ roomId: number }` |
| `subscribeRoomParticipants` | Subscribe room participants | `{ roomId: number }` |
| `getRoomParticipants` | Lấy room participants | `{ roomId: number }` |
| `joinSession` | Tham gia session | `{ sessionId: number }` |
| `leaveSession` | Rời session | `{ sessionId: number }` |

### **Server → Client Events**
| Event | Description | Data Structure |
|-------|-------------|----------------|
| `roomCountsUpdate` | Cập nhật room counts | `RoomCounts` |
| `latestSessionData` | Dữ liệu session mới nhất | `{ roomId, sessionDetails, timestamp }` |
| `allSessionsData` | Dữ liệu tất cả sessions | `{ roomId, sessions, total, timestamp }` |
| `currentActiveSessionData` | Dữ liệu session active | `{ roomId, activeSession, hasActiveSession, timestamp }` |
| `roomParticipantListUpdate` | Cập nhật participants | `{ message, data: RoomParticipantData }` |
| `participantCountUpdate` | Cập nhật count | `{ message, data: ParticipantCountData }` |
| `sessionStatusChange` | Thay đổi status | `{ message, data: SessionStatusData }` |

## 📋 **Data Types**

### **GameSession**
```typescript
interface GameSession {
  id: number;
  status: string;
  time_start: string;
  session: string;
  room_id: {
    id: number;
    name: string;
    owner_id: any;
    game_type_id: any;
  };
}
```

### **RoomCounts**
```typescript
interface RoomCounts {
  pending: number;    // Số phòng có session PENDING
  running: number;    // Số phòng có session RUNNING
  out: number;        // Số phòng có session OUT
  end: number;        // Số phòng có session END
  total: number;      // Tổng số phòng
  lastUpdated: string;
  error?: string;
}
```

### **RoomParticipantData**
```typescript
interface RoomParticipantData {
  roomId: number;
  sessionId: number;
  sessionStatus: string;
  participants: {
    pending: Participant[];    // Participants chưa execute
    executed: Participant[];   // Participants đã execute
  };
  totalPending: number;
  totalExecuted: number;
  totalParticipants: number;
  timestamp: string;
}
```

### **Participant**
```typescript
interface Participant {
  id: number;
  userId: number;
  username: string;
  wallet_address: string;
  amount: number;
  time_join: string;
  status: string;
}
```

## 🎮 **Ví dụ sử dụng nâng cao**

### **Quản lý Room với Participants**
```typescript
const GameRoom = ({ roomId }: { roomId: number }) => {
  const {
    isConnected,
    latestSession,
    roomParticipantData,
    participantCountData,
    subscribeRoomParticipants,
    unsubscribeRoomParticipants,
    getLatestSessionByRoom
  } = useGameRoomsSocket({
    autoConnect: true,
    enableLogs: true
  });

  // Subscribe khi component mount
  useEffect(() => {
    if (isConnected) {
      subscribeRoomParticipants(roomId);
      getLatestSessionByRoom(roomId);
    }
    
    return () => {
      if (isConnected) {
        unsubscribeRoomParticipants(roomId);
      }
    };
  }, [isConnected, roomId]);

  // Debug logs
  useEffect(() => {
    console.log('Room data:', {
      latestSession,
      roomParticipantData,
      participantCountData
    });
  }, [latestSession, roomParticipantData, participantCountData]);

  if (!isConnected) {
    return <div>Connecting to game room...</div>;
  }

  return (
    <div>
      <h2>Room {roomId}</h2>
      
      {/* Session Info */}
      {latestSession && (
        <div className="session-info">
          <h3>Session {latestSession.id}</h3>
          <p>Status: {latestSession.status}</p>
          <p>Room: {latestSession.room_id?.name}</p>
        </div>
      )}
      
      {/* Participants */}
      {roomParticipantData && (
        <div className="participants">
          <h3>Participants ({roomParticipantData.totalParticipants})</h3>
          <p>Pending: {roomParticipantData.totalPending}</p>
          <p>Executed: {roomParticipantData.totalExecuted}</p>
          
          {roomParticipantData.participants.executed.map(p => (
            <div key={p.id} className="participant">
              {p.username} - {p.amount} SOL
            </div>
          ))}
        </div>
      )}
      
      {/* Count Update */}
      {participantCountData && (
        <div className="count-update">
          <p>Count: {participantCountData.participantCount}/{participantCountData.maxParticipants}</p>
          <p>Can Join: {participantCountData.canJoin ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};
```

### **Quản lý Multiple Rooms**
```typescript
const MultiRoomManager = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number>(172);
  
  const {
    isConnected,
    roomCounts,
    subscribeRoomCounts,
    getLatestSessionByRoom
  } = useGameRoomsSocket({
    autoConnect: true,
    enableLogs: true
  });

  useEffect(() => {
    if (isConnected) {
      subscribeRoomCounts();
    }
  }, [isConnected]);

  return (
    <div>
      <h1>Game Rooms Manager</h1>
      
      {/* Room Counts */}
      {roomCounts && (
        <div className="room-counts">
          <h2>Room Statistics</h2>
          <p>Total: {roomCounts.total}</p>
          <p>Pending: {roomCounts.pending}</p>
          <p>Running: {roomCounts.running}</p>
          <p>Out: {roomCounts.out}</p>
          <p>End: {roomCounts.end}</p>
        </div>
      )}
      
      {/* Room Selector */}
      <div className="room-selector">
        <label>Select Room:</label>
        <select 
          value={selectedRoomId} 
          onChange={(e) => setSelectedRoomId(Number(e.target.value))}
        >
          <option value={172}>Room 172</option>
          <option value={173}>Room 173</option>
          <option value={174}>Room 174</option>
        </select>
      </div>
      
      {/* Selected Room */}
      <GameRoom roomId={selectedRoomId} />
    </div>
  );
};
```

## 🔍 **Debug & Troubleshooting**

### **Enable Debug Logs**
```typescript
const { ... } = useGameRoomsSocket({
  autoConnect: true,
  enableLogs: true  // Bật debug logs
});
```

### **Common Issues**

1. **Connection Failed**
   - Kiểm tra WebSocket URL trong backend
   - Kiểm tra CORS settings
   - Kiểm tra authentication

2. **No Data Received**
   - Kiểm tra event names có đúng không
   - Kiểm tra backend có implement handlers không
   - Kiểm tra console logs

3. **Memory Leaks**
   - Luôn unsubscribe khi component unmount
   - Sử dụng cleanup functions trong useEffect

### **Debug Console Logs**
```typescript
// Kết nối
🔌 Connected to game-rooms namespace

// Subscribe events
📡 Subscribing to room participants for room 172
📡 Requesting latest session for room 172

// Data updates
📊 Latest session data response: {...}
👥 Room participant list update: {...}
🔢 Participant count update: {...}
```

## 🎯 **Best Practices**

1. **Always Cleanup** - Unsubscribe khi component unmount
2. **Error Handling** - Xử lý lỗi kết nối và data
3. **Loading States** - Hiển thị loading khi chưa có data
4. **Type Safety** - Sử dụng TypeScript types đầy đủ
5. **Performance** - Chỉ subscribe khi cần thiết

## 📚 **Related Files**

- `src/hooks/index.ts` - Export hook
- `src/types/session.ts` - Session types
- `WEBSOCKET_EVENTS.md` - WebSocket events documentation
- `PARTICIPANT_MANAGEMENT_GUIDE.md` - Participant management guide

## 🔄 **Version History**

- **v1.0.0** - Initial release with basic WebSocket connection
- **v1.1.0** - Added session management
- **v1.2.0** - Added participant management
- **v1.3.0** - Added real-time updates and error handling

---

**Tác giả:** Development Team  
**Cập nhật lần cuối:** 2024  
**License:** MIT

```
```

## React Hook

```typescript
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

type RoomCounts = {
  pending: number
  running: number
  out: number
  end: number
  total: number
  lastUpdated: string
  error?: string
}

type SessionStatusChange = {
  sessionId: number
  oldStatus: string
  newStatus: string
  roomCounts?: RoomCounts
  timestamp: string
}

type Participant = {
  id: number
  userId: number
  username: string
  wallet_address: string
  amount: number
  time_join: string
  status: string
}

type ParticipantListUpdate = {
  sessionId: number
  roomId: number
  participants: Participant[]
  totalParticipants: number
  timestamp: string
}

type RoomDetailsUpdate = {
  roomId: number
  sessionId: number
  roomDetails: any
  timestamp: string
}

type CurrentSessionUpdate = {
  roomId: number
  current_session: {
    id: number
    status: string
    time_start: string
    session: string
    countdown_ms: number
  }
  timestamp: string
}

type GameSession = {
  id: number
  status: string
  time_start: string
  session: string
  room_id: {
    id: number
    name: string
    owner_id: any
    game_type_id: any
  }
}

type SessionWithDetails = {
  session: GameSession | null
  participants: Participant[]
  participantCount: number
  maxParticipants: number
  isFull: boolean
  canJoin: boolean
}

type RoomParticipantData = {
  roomId: number
  sessionId: number
  sessionStatus: string
  participants: {
    pending: Participant[]
    executed: Participant[]
  }
  totalPending: number
  totalExecuted: number
  totalParticipants: number
  timestamp: string
}

type ParticipantCountData = {
  roomId: number
  sessionId: number
  participantCount: number
  maxParticipants: number
  isFull: boolean
  canJoin: boolean
  timestamp: string
}

type SessionStatusData = {
  roomId: number
  sessionId: number
  oldStatus: string
  newStatus: string
  timestamp: string
}

type UseGameRoomsSocketOptions = {
  autoConnect?: boolean
  enableLogs?: boolean
}

const NAMESPACE_PATH = '/game-rooms'

export function useGameRoomsSocket(options: UseGameRoomsSocketOptions = {}) {
  const { autoConnect = true, enableLogs = false } = options
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [roomCounts, setRoomCounts] = useState<RoomCounts | null>(null)
  const [sessionStatusChange, setSessionStatusChange] = useState<SessionStatusChange | null>(null)
  const [participantList, setParticipantList] = useState<ParticipantListUpdate | null>(null)
  const [roomDetails, setRoomDetails] = useState<RoomDetailsUpdate | null>(null)
  const [sessionUserCount, setSessionUserCount] = useState<{ sessionId: number; userCount: number; timestamp: string } | null>(null)
  const [currentSessionUpdate, setCurrentSessionUpdate] = useState<CurrentSessionUpdate | null>(null)
  
  // Session data states
  const [latestSession, setLatestSession] = useState<GameSession | null>(null)
  const [sessionWithDetails, setSessionWithDetails] = useState<SessionWithDetails | null>(null)
  const [allSessions, setAllSessions] = useState<GameSession[]>([])
  const [currentActiveSession, setCurrentActiveSession] = useState<GameSession | null>(null)
  
  // Participant data states
  const [roomParticipantData, setRoomParticipantData] = useState<RoomParticipantData | null>(null)
  const [participantCountData, setParticipantCountData] = useState<ParticipantCountData | null>(null)
  const [sessionStatusData, setSessionStatusData] = useState<SessionStatusData | null>(null)

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '', [])
  console.log('apiBase', apiBase)

  const log = useCallback((msg: string, isError = false) => {
    if (!enableLogs) return
    const prefix = `[GameRoomsWS ${new Date().toLocaleTimeString()}]`
    if (isError) console.error(`${prefix} ${msg}`)
    else console.log(`${prefix} ${msg}`)
  }, [enableLogs])

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return
    // Sử dụng URL trực tiếp như đã test thành công
    const url = 'ws://8w7n4n91-8008.asse.devtunnels.ms/game-rooms'
    log(`Connecting to ${url}`)
    const socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      setError(null)
      log('✅ Connected')
    })

    // Lắng nghe connected event từ server (như đã test)
    socket.on('connected', (data: any) => {
      log(`🔗 Server connected event: ${JSON.stringify(data)}`)
      console.log('Connected:', data)
      console.log('User ID:', data.userId) // Tự động có userId từ server
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      log('❌ Disconnected')
    })

    socket.on('error', (e: any) => {
      const msg = typeof e === 'string' ? e : e?.message || 'Socket error'
      setError(msg)
      log(`Error: ${msg}`, true)
      console.error('🚨 WebSocket Error:', e)
    })

    // Server events
    socket.on('roomCountsUpdate', (data: RoomCounts) => {
      log(`📊 Room counts received: ${JSON.stringify(data)}`)
      console.log('🎯 RoomCountsUpdate event received:', data)
      setRoomCounts(data)
    })
    socket.on('sessionStatusChange', (data: SessionStatusChange) => {
      log(`🔄 Session status change: ${JSON.stringify(data)}`)
      setSessionStatusChange(data)
    })
    socket.on('participantListUpdate', (payload: { data: ParticipantListUpdate }) => {
      log(`👥 Participant list update: ${JSON.stringify(payload)}`)
      setParticipantList(payload?.data || null)
    })
    socket.on('roomDetailsUpdate', (payload: { data: RoomDetailsUpdate }) => {
      log(`🏠 Room details update: ${JSON.stringify(payload)}`)
      setRoomDetails(payload?.data || null)
    })
    socket.on('sessionUserCount', (data: { sessionId: number; userCount: number; timestamp: string }) => {
      log(`🔢 Session user count: ${JSON.stringify(data)}`)
      setSessionUserCount(data)
    })
    socket.on('currentSessionUpdate', (data: CurrentSessionUpdate) => {
      log(`⚡ Current session update: ${JSON.stringify(data)}`)
      setCurrentSessionUpdate(data)
    })

    // Session data response events (using correct event names from backend)
    socket.on('latestSessionData', (data: { roomId: number; sessionDetails: SessionWithDetails | null; timestamp: string }) => {
      log(`📊 Latest session data response: ${JSON.stringify(data)}`)
      if (data.sessionDetails) {
        setLatestSession(data.sessionDetails.session)
        setSessionWithDetails(data.sessionDetails)
      }
    })

    socket.on('allSessionsData', (data: { roomId: number; sessions: GameSession[]; total: number; timestamp: string }) => {
      log(`📊 All sessions data response: ${JSON.stringify(data)}`)
      setAllSessions(data.sessions)
    })

    socket.on('currentActiveSessionData', (data: { roomId: number; activeSession: GameSession | null; hasActiveSession: boolean; timestamp: string }) => {
      log(`📊 Current active session data response: ${JSON.stringify(data)}`)
      if (data.activeSession) {
        setCurrentActiveSession(data.activeSession)
      }
    })

    // Participant data events
    socket.on('roomParticipantListUpdate', (data: { message: string; data: RoomParticipantData }) => {
      log(`👥 Room participant list update: ${JSON.stringify(data)}`)
      setRoomParticipantData(data.data)
    })

    socket.on('participantCountUpdate', (data: { message: string; data: ParticipantCountData }) => {
      log(`🔢 Participant count update: ${JSON.stringify(data)}`)
      setParticipantCountData(data.data)
    })

    socket.on('sessionStatusChange', (data: { message: string; data: SessionStatusData }) => {
      log(`🔄 Session status change: ${JSON.stringify(data)}`)
      setSessionStatusData(data.data)
    })

    socket.on('roomParticipantsData', (data: { message: string; data: RoomParticipantData }) => {
      log(`👥 Room participants data: ${JSON.stringify(data)}`)
      setRoomParticipantData(data.data)
    })

    socket.on('sessionParticipantsData', (data: { message: string; data: any }) => {
      log(`👥 Session participants data: ${JSON.stringify(data)}`)
      // Handle session participants data if needed
    })
    
    // Debug: Log all events
    socket.onAny((eventName, ...args) => {
      log(`🎯 Received event '${eventName}': ${JSON.stringify(args)}`)
      console.log(`🎯 Received event '${eventName}':`, args)
    })

  }, [apiBase, log])

  const disconnect = useCallback(() => {
    if (!socketRef.current) return
    log('Disconnecting')
    socketRef.current.disconnect()
    socketRef.current = null
  }, [log])

  // Actions
  const subscribeRoomCounts = useCallback(() => {
    log(`📡 Subscribing to room counts`)
    console.log('🚀 Emitting subscribeRoomCounts event')
    socketRef.current?.emit('subscribeRoomCounts')
  }, [log])

  const retrySubscribeRoomCounts = useCallback(() => {
    log(`🔄 Retrying subscribe to room counts`)
    console.log('🔄 Retrying subscribeRoomCounts event')
    socketRef.current?.emit('subscribeRoomCounts')
  }, [])

  const unsubscribeRoomCounts = useCallback(() => {
    socketRef.current?.emit('unsubscribeRoomCounts')
  }, [])

  const joinSession = useCallback((sessionId: number) => {
    socketRef.current?.emit('joinSession', { sessionId })
  }, [])

  const leaveSession = useCallback((sessionId: number) => {
    socketRef.current?.emit('leaveSession', { sessionId })
  }, [])

  // Session data methods - WebSocket based (using correct event names from backend)
  const getLatestSessionByRoom = useCallback((roomId: number) => {
    log(`📡 Requesting latest session for room ${roomId}`)
    socketRef.current?.emit('getLatestSession', { roomId })
  }, [log])

  const getLatestSessionWithDetails = useCallback((roomId: number) => {
    log(`📡 Requesting latest session with details for room ${roomId}`)
    socketRef.current?.emit('getLatestSession', { roomId }) // Backend returns details in getLatestSession
  }, [log])

  const getAllSessionsByRoom = useCallback((roomId: number, limit: number = 10) => {
    log(`📡 Requesting all sessions for room ${roomId} (limit: ${limit})`)
    socketRef.current?.emit('getAllSessions', { roomId, limit })
  }, [log])

  const getCurrentActiveSession = useCallback((roomId: number) => {
    log(`📡 Requesting current active session for room ${roomId}`)
    socketRef.current?.emit('getCurrentActiveSession', { roomId })
  }, [log])

  const subscribeCurrentActiveSession = useCallback((roomId: number) => {
    log(`📡 Subscribing to current active session for room ${roomId}`)
    socketRef.current?.emit('subscribeCurrentActiveSession', { roomId })
  }, [log])

  const unsubscribeCurrentActiveSession = useCallback((roomId: number) => {
    log(`📡 Unsubscribing from current active session for room ${roomId}`)
    socketRef.current?.emit('unsubscribeCurrentActiveSession', { roomId })
  }, [log])

  // Participant management methods
  const subscribeRoomParticipants = useCallback((roomId: number) => {
    log(`📡 Subscribing to room participants for room ${roomId}`)
    socketRef.current?.emit('subscribeRoomParticipants', { roomId })
  }, [log])

  const unsubscribeRoomParticipants = useCallback((roomId: number) => {
    log(`📡 Unsubscribing from room participants for room ${roomId}`)
    socketRef.current?.emit('unsubscribeRoomParticipants', { roomId })
  }, [log])

  const getRoomParticipants = useCallback((roomId: number) => {
    log(`📡 Getting room participants for room ${roomId}`)
    socketRef.current?.emit('getRoomParticipants', { roomId })
  }, [log])

  const subscribeSessionParticipants = useCallback((sessionId: number, roomId: number) => {
    log(`📡 Subscribing to session participants for session ${sessionId} in room ${roomId}`)
    socketRef.current?.emit('subscribeSessionParticipants', { sessionId, roomId })
  }, [log])

  const unsubscribeSessionParticipants = useCallback((sessionId: number) => {
    log(`📡 Unsubscribing from session participants for session ${sessionId}`)
    socketRef.current?.emit('unsubscribeSessionParticipants', { sessionId })
  }, [log])

  const getSessionParticipants = useCallback((sessionId: number, roomId: number) => {
    log(`📡 Getting session participants for session ${sessionId} in room ${roomId}`)
    socketRef.current?.emit('getSessionParticipants', { sessionId, roomId })
  }, [log])

  useEffect(() => {
    if (!autoConnect) return
    connect()
    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    // connection
    socket: socketRef.current as Socket | null,
    isConnected,
    error,
    connect,
    disconnect,

    // state
    roomCounts,
    sessionStatusChange,
    participantList,
    roomDetails,
    sessionUserCount,
    currentSessionUpdate,

    // session data states
    latestSession,
    sessionWithDetails,
    allSessions,
    currentActiveSession,

    // participant data states
    roomParticipantData,
    participantCountData,
    sessionStatusData,

    // actions
    subscribeRoomCounts,
    retrySubscribeRoomCounts,
    unsubscribeRoomCounts,
    joinSession,
    leaveSession,

    // session data methods (WebSocket based)
    getLatestSessionByRoom,
    getLatestSessionWithDetails,
    getAllSessionsByRoom,
    getCurrentActiveSession,
    subscribeCurrentActiveSession,
    unsubscribeCurrentActiveSession,

    // participant management methods
    subscribeRoomParticipants,
    unsubscribeRoomParticipants,
    getRoomParticipants,
    subscribeSessionParticipants,
    unsubscribeSessionParticipants,
    getSessionParticipants,
  }
}

export type {
  RoomCounts,
  SessionStatusChange,
  Participant,
  ParticipantListUpdate,
  RoomDetailsUpdate,
  CurrentSessionUpdate,
  GameSession,
  SessionWithDetails,
  RoomParticipantData,
  ParticipantCountData,
  SessionStatusData,
}

```
