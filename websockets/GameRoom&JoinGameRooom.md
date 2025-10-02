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
  
  // Convert HTTPS to WSS for WebSocket connection
  const wsBase = useMemo(() => {
    if (!apiBase) return ''
    // Replace https:// with wss:// for secure WebSocket connection
    return apiBase.replace(/^https?:\/\//, 'wss://')
  }, [apiBase])
  
  console.log('wsBase', wsBase)

  const log = useCallback((msg: string, isError = false) => {
    if (!enableLogs) return
    const prefix = `[GameRoomsWS ${new Date().toLocaleTimeString()}]`
    if (isError) console.error(`${prefix} ${msg}`)
    else console.log(`${prefix} ${msg}`)
  }, [enableLogs])

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return
    
    if (!wsBase) {
      log('No WebSocket base URL configured', true)
      setError('WebSocket URL not configured')
      return
    }
    
    // Sử dụng wsBase (đã convert từ https:// sang wss://)
    const url = `${wsBase}/game-rooms`
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

  }, [wsBase, log])

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

## Sử dụng React Hook trong component

```typescript
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import RoomGames from '@/components/Games/RoomGames'
import { gameService } from '@/services/api/GameService'
import { queryKeys } from '@/services/api/queryKeys'
import { useAuth, useGameRoomsSocket } from '@/hooks'
import { getProfile } from '@/services/api/AuthService'

const AllRoomsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameType = searchParams.get('game') || 'lottery' // Default to lottery
  
  const [dimensions, setDimensions] = useState({ width: '375.348px', height: '374.113px', borderRadius: '375.348px' })

  // Fetch game lists to get game type IDs
  const { data: gameLists } = useQuery({
    queryKey: queryKeys.gameLists.active,
    queryFn: () => gameService.getActiveGameLists(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Map game names to gameTypeId for RoomGames component
  const getGameTypeId = (name: string): 'lottery' | 'rock-paper-scissors' => {
    switch (name.toLowerCase()) {
      case 'xổ số blockchain':
      case 'lottery':
        return 'lottery'
      case 'kéo búa bao':
      case 'rock-paper-scissors':
      case 'rps':
        return 'rock-paper-scissors'
      default:
        return 'lottery' // Default fallback
    }
  }

  // Find game type DB ID based on game type
  const getGameTypeDbId = (gameType: string): number | undefined => {
    if (!gameLists?.data) return undefined
    
    const game = gameLists.data.find(g => {
      const mappedType = getGameTypeId(g.name)
      return mappedType === gameType
    })
    
    return game?.id
  }

  useEffect(() => {
    const updateDimensions = () => {
      if (window.innerWidth < 640) {
        setDimensions({ width: '200px', height: '200px', borderRadius: '200px' })
      } else if (window.innerWidth < 768) {
        setDimensions({ width: '300px', height: '300px', borderRadius: '300px' })
      } else {
        setDimensions({ width: '375.348px', height: '374.113px', borderRadius: '375.348px' })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const renderGameComponent = () => {
    const gameTypeDbId = getGameTypeDbId(gameType)
    
    switch (gameType) {
      case 'lottery':
        return <RoomGames gameTypeId="lottery" gameTypeDbId={gameTypeDbId} showAll={true} showHeader={false} />
      case 'rock-paper-scissors':
        return <RoomGames gameTypeId="rock-paper-scissors" gameTypeDbId={gameTypeDbId} showAll={true} showHeader={false} />
      default:
        return <RoomGames gameTypeId="lottery" gameTypeDbId={gameTypeDbId} showAll={true} showHeader={false} />
    }
  }

  const {
    isConnected, 
    roomCounts, 
    sessionUserCount, 
    error,
    subscribeRoomCounts, 
    retrySubscribeRoomCounts, 
    getLatestSessionByRoom,
    getLatestSessionWithDetails,
    getAllSessionsByRoom,
    getCurrentActiveSession,
    subscribeCurrentActiveSession,
    unsubscribeCurrentActiveSession,
    // Session data states
    latestSession,
    sessionWithDetails,
    allSessions,
    currentActiveSession,
    // Participant management
    subscribeRoomParticipants,
    unsubscribeRoomParticipants,
    getRoomParticipants,
    subscribeSessionParticipants,
    unsubscribeSessionParticipants,
    getSessionParticipants,
    // Participant data states
    roomParticipantData,
    participantCountData,
    sessionStatusData
  } = useGameRoomsSocket({autoConnect: true, enableLogs: true})
  const {isAuthenticated} = useAuth()

  // Get user profile
  const { data: profile } = useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: getProfile,
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (isConnected && isAuthenticated) {
      console.log('✅ Connected and authenticated, subscribing to room counts')
      subscribeRoomCounts()
    }
  }, [isConnected, isAuthenticated, subscribeRoomCounts])

  // Handle error and retry
  useEffect(() => {
    if (error && error.includes('Failed to subscribe to room counts')) {
      console.log('🔄 Subscription failed, retrying in 3 seconds...')
      setTimeout(() => {
        retrySubscribeRoomCounts()
      }, 3000)
    }
  }, [error, retrySubscribeRoomCounts])

  // Debug logs để kiểm tra trạng thái
  useEffect(() => {
    console.log('🔍 Debug Info:', {
      isConnected,
      isAuthenticated,
      profile: profile,
      roomCounts,
      sessionUserCount
    })
  }, [isConnected, isAuthenticated, profile, roomCounts, sessionUserCount])

  // Sử dụng dữ liệu room counts
  useEffect(() => {
    if (roomCounts) {
      console.log('✅ Room counts updated:', roomCounts)
      console.log('✅ Session user count:', sessionUserCount)
      // Cập nhật UI với dữ liệu mới
    }
  }, [roomCounts, sessionUserCount]) 

  // Subscribe to current active session for real-time updates
  useEffect(() => {
    if (isConnected) {
      console.log('🔌 Connected, subscribing to current active session for room 172');
      subscribeCurrentActiveSession(172);
      
      // Subscribe to room participants for real-time updates
      console.log('👥 Subscribing to room participants for room 172');
      subscribeRoomParticipants(172);
      
      // Also get latest session with details
      // getLatestSessionByRoom(172);
    }
    
    return () => {
      if (isConnected) {
        unsubscribeCurrentActiveSession(172);
        unsubscribeRoomParticipants(172);
      }
    };
  }, [isConnected, subscribeCurrentActiveSession, unsubscribeCurrentActiveSession, subscribeRoomParticipants, unsubscribeRoomParticipants, getLatestSessionByRoom]);

  // Debug latestSession khi có thay đổi
  useEffect(() => {
    console.log('📊 Latest session updated:', latestSession);
  }, [latestSession]);

  // Debug tất cả session states
  useEffect(() => {
    console.log('🔍 All session states:', {
      latestSession,
      sessionWithDetails,
      allSessions,
      currentActiveSession,
      isConnected
    });
  }, [latestSession, sessionWithDetails, allSessions, currentActiveSession, isConnected]);

  // Debug participant data
  useEffect(() => {
    console.log('👥 Participant data updated:', {
      roomParticipantData,
      participantCountData,
      sessionStatusData
    });
  }, [roomParticipantData, participantCountData, sessionStatusData]);

  // Test WebSocket connection
  useEffect(() => {
    if (isConnected) {
      console.log('🔌 WebSocket connected, testing events...');
      
      // Test emit một event đơn giản
      const socket = (window as any).io?.('ws://8w7n4n91-8008.asse.devtunnels.ms/game-rooms');
      if (socket) {
        socket.emit('test', { message: 'Hello from frontend' });
        console.log('📡 Emitted test event');
      }
    }
  }, [isConnected]); 

  return (
    <div className='bg-bg-game bg-cover bg-center bg-no-repeat bg-fixed w-screen bg-[#090B10]'>
      {/* <div 
        className="absolute top-52"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          transform: 'rotate(90deg)',
          flexShrink: 0,
          borderRadius: dimensions.borderRadius,
          background: 'rgba(0, 144, 255, 0.34)',
          filter: 'blur(131.85223388671875px)'
        }}
      /> */}
      <div className='container-custom p-[30px] relative z-10 max-h-[calc(100vh-73px)]'>
        {/* Session Data Display */}
        <div className="mb-4 p-4 bg-gray-800 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-4">Session Data (WebSocket)</h3>
          
          {/* Connection Status */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => getLatestSessionByRoom(177)}
              disabled={!isConnected}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Get Latest Session
            </button>
            
            <button
              onClick={() => getLatestSessionWithDetails(177)}
              disabled={!isConnected}
              className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Get Session Details
            </button>
            
            <button
              onClick={() => getAllSessionsByRoom(177, 5)}
              disabled={!isConnected}
              className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
            >
              Get All Sessions
            </button>
            
            <button
              onClick={() => getCurrentActiveSession(177)}
              disabled={!isConnected}
              className="px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:opacity-50"
            >
              Get Active Session
            </button>
            
            <button
              onClick={() => subscribeCurrentActiveSession(177)}
              disabled={!isConnected}
              className="px-3 py-2 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700 disabled:opacity-50"
            >
              Subscribe Active Session
            </button>
            
            <button
              onClick={() => unsubscribeCurrentActiveSession(177)}
              disabled={!isConnected}
              className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50"
            >
              Unsubscribe Active Session
            </button>
            
            <button
              onClick={() => subscribeRoomParticipants(172)}
              disabled={!isConnected}
              className="px-3 py-2 bg-pink-600 text-white rounded text-sm hover:bg-pink-700 disabled:opacity-50"
            >
              Subscribe Room Participants
            </button>
            
            <button
              onClick={() => getRoomParticipants(172)}
              disabled={!isConnected}
              className="px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              Get Room Participants
            </button>
          </div>

          {/* Latest Session */}
          {latestSession && (
            <div className="mb-4 p-3 bg-blue-900 rounded border-l-4 border-blue-400">
              <h4 className="text-sm font-semibold text-blue-200 mb-2">Latest Session</h4>
              <div className="text-xs text-blue-100 space-y-1">
                <p>ID: {latestSession.id}</p>
                <p>Status: {latestSession.status}</p>
                <p>Room: {latestSession.room_id?.name}</p>
                <p>Time Start: {new Date(latestSession.time_start).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Session With Details */}
          {sessionWithDetails && (
            <div className="mb-4 p-3 bg-green-900 rounded border-l-4 border-green-400">
              <h4 className="text-sm font-semibold text-green-200 mb-2">Session With Details</h4>
              <div className="text-xs text-green-100 space-y-1">
                <p>Session ID: {sessionWithDetails.session?.id}</p>
                <p>Status: {sessionWithDetails.session?.status}</p>
                <p>Participants: {sessionWithDetails.participantCount}/{sessionWithDetails.maxParticipants}</p>
                <p>Is Full: {sessionWithDetails.isFull ? 'Yes' : 'No'}</p>
                <p>Can Join: {sessionWithDetails.canJoin ? 'Yes' : 'No'}</p>
                {sessionWithDetails.participants.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Participants:</p>
                    {sessionWithDetails.participants.map((p) => (
                      <div key={p.id} className="ml-2">
                        {p.username} - {p.amount} SOL
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Sessions */}
          {allSessions.length > 0 && (
            <div className="mb-4 p-3 bg-purple-900 rounded border-l-4 border-purple-400">
              <h4 className="text-sm font-semibold text-purple-200 mb-2">All Sessions ({allSessions.length})</h4>
              <div className="text-xs text-purple-100 space-y-1 max-h-32 overflow-y-auto">
                {allSessions.map((session) => (
                  <div key={session.id} className="flex justify-between">
                    <span>ID: {session.id}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      session.status === 'PENDING' ? 'bg-yellow-600' :
                      session.status === 'RUNNING' ? 'bg-green-600' :
                      'bg-gray-600'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Active Session */}
          {currentActiveSession && (
            <div className="mb-4 p-3 bg-orange-900 rounded border-l-4 border-orange-400">
              <h4 className="text-sm font-semibold text-orange-200 mb-2">Current Active Session</h4>
              <div className="text-xs text-orange-100 space-y-1">
                <p>ID: {currentActiveSession.id}</p>
                <p>Status: {currentActiveSession.status}</p>
                <p>Room: {currentActiveSession.room_id?.name}</p>
                <p>Time Start: {new Date(currentActiveSession.time_start).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Room Participant Data */}
          {roomParticipantData && (
            <div className="mb-4 p-3 bg-pink-900 rounded border-l-4 border-pink-400">
              <h4 className="text-sm font-semibold text-pink-200 mb-2">Room Participants (Room {roomParticipantData.roomId})</h4>
              <div className="text-xs text-pink-100 space-y-1">
                <p>Session: {roomParticipantData.sessionId} ({roomParticipantData.sessionStatus})</p>
                <p>Total: {roomParticipantData.totalParticipants} (Pending: {roomParticipantData.totalPending}, Executed: {roomParticipantData.totalExecuted})</p>
                
                {roomParticipantData.participants.executed.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Executed Participants:</p>
                    {roomParticipantData.participants.executed.map((p) => (
                      <div key={p.id} className="ml-2">
                        {p.username} - {p.amount} SOL ({p.status})
                      </div>
                    ))}
                  </div>
                )}
                
                {roomParticipantData.participants.pending.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Pending Participants:</p>
                    {roomParticipantData.participants.pending.map((p) => (
                      <div key={p.id} className="ml-2">
                        {p.username} - {p.amount} SOL ({p.status})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Participant Count Data */}
          {participantCountData && (
            <div className="mb-4 p-3 bg-indigo-900 rounded border-l-4 border-indigo-400">
              <h4 className="text-sm font-semibold text-indigo-200 mb-2">Participant Count Update</h4>
              <div className="text-xs text-indigo-100 space-y-1">
                <p>Room: {participantCountData.roomId}, Session: {participantCountData.sessionId}</p>
                <p>Count: {participantCountData.participantCount}/{participantCountData.maxParticipants}</p>
                <p>Is Full: {participantCountData.isFull ? 'Yes' : 'No'}</p>
                <p>Can Join: {participantCountData.canJoin ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}

          {/* Session Status Change */}
          {sessionStatusData && (
            <div className="mb-4 p-3 bg-yellow-900 rounded border-l-4 border-yellow-400">
              <h4 className="text-sm font-semibold text-yellow-200 mb-2">Session Status Change</h4>
              <div className="text-xs text-yellow-100 space-y-1">
                <p>Room: {sessionStatusData.roomId}, Session: {sessionStatusData.sessionId}</p>
                <p>Status: {sessionStatusData.oldStatus} → {sessionStatusData.newStatus}</p>
                <p>Time: {new Date(sessionStatusData.timestamp).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {!latestSession && !sessionWithDetails && allSessions.length === 0 && !currentActiveSession && !roomParticipantData && (
            <div className="text-center text-gray-400 text-sm">
              <p>No session data available</p>
              <p>Click buttons above to request data via WebSocket</p>
            </div>
          )}
        </div>

        {/* Session Data Demo */}
        <div className="mb-4">
        </div>

        {renderGameComponent()}
      </div>
    </div>
  )
}

export default AllRoomsPage

```
