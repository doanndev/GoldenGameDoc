# Game Room WebSocket React Hook

## Overview
This document provides a comprehensive React hook for integrating with the Game Room WebSocket gateway in Next.js applications. The hook handles all WebSocket events, connection management, and provides a clean API for game room functionality.

## Installation

First, install the required dependencies:

```bash
npm install socket.io-client
# or
yarn add socket.io-client
```

## Hook Implementation

```typescript
// hooks/useGameRoomWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Types
export interface GameRoomCounts {
  pending: number;
  running: number;
  out: number;
  end: number;
  total: number;
  lastUpdated: string;
  error?: string;
}

export interface CurrentSession {
  id: number;
  status: string;
  time_start: string;
  session: number;
  participants_count: number;
  max_participants: number;
  can_join: boolean;
}

export interface CurrentSessionSnapshot {
  roomId: number;
  current_session: CurrentSession | null;
}

export interface EarlyJoiner {
  user_id: number;
  username: string;
  fullname: string;
  avatar: string;
  joined_at: string;
  amount: number;
  status: string;
}

export interface EarlyJoinersList {
  roomId: number;
  sessionId: number;
  earlyJoiners: EarlyJoiner[];
  totalCount: number;
  timestamp?: string;
}

export interface JoinRoomResult {
  success: boolean;
  roomId: number;
  sessionId: number;
  joinList?: EarlyJoiner[];
  earlyJoiners?: EarlyJoiner[];
  totalCount?: number;
  userJoined?: {
    user_id: number;
    username: string;
    fullname: string;
    joined_at: string;
  };
  timestamp?: string;
  error?: string;
}

export interface ConnectionInfo {
  message: string;
  clientId: string;
  namespace: string;
  userId: number | null;
}

// Hook options
export interface UseGameRoomWebSocketOptions {
  serverUrl?: string;
  autoConnect?: boolean;
  onConnect?: (info: ConnectionInfo) => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

// Hook return type
export interface UseGameRoomWebSocketReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionInfo: ConnectionInfo | null;
  
  // Room counts
  roomCounts: GameRoomCounts | null;
  subscribeRoomCountByGameType: (gtId: number) => void;
  
  // Current session
  currentSession: CurrentSessionSnapshot | null;
  subscribeCurrentSession: (roomId: number) => void;
  
  // Early joiners
  earlyJoiners: EarlyJoinersList | null;
  getEarlyJoinersList: (payload: { roomId: number; sessionId?: number }) => void;
  
  // Room joining
  joinRoom: (payload: { roomId: number }) => Promise<JoinRoomResult | null>;
  joinRoomWithEarlyJoiners: (payload: { roomId: number }) => Promise<JoinRoomResult | null>;
  
  // Connection management
  connect: () => void;
  disconnect: () => void;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useGameRoomWebSocket = (
  options: UseGameRoomWebSocketOptions = {}
): UseGameRoomWebSocketReturn => {
  const {
    serverUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:8008',
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [roomCounts, setRoomCounts] = useState<GameRoomCounts | null>(null);
  const [currentSession, setCurrentSession] = useState<CurrentSessionSnapshot | null>(null);
  const [earlyJoiners, setEarlyJoiners] = useState<EarlyJoinersList | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const joinRoomPromiseRef = useRef<{
    resolve: (value: JoinRoomResult | null) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const socket = io(`${serverUrl}/game-rooms`, {
        transports: ['websocket', 'polling'],
        path: '/socket.io',
        autoConnect: false,
      });

      // Connection event handlers
      socket.on('connect', () => {
        console.log('🔌 Connected to game-rooms namespace:', socket.id);
        setIsConnected(true);
        setIsConnecting(false);
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from game-rooms:', reason);
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();
      });

      socket.on('connected', (info: ConnectionInfo) => {
        console.log('✅ Game room connection established:', info);
        setConnectionInfo(info);
        onConnect?.(info);
      });

      // Room counts events
      socket.on('gameRoomCounts', (counts: GameRoomCounts) => {
        console.log('📊 Room counts updated:', counts);
        setRoomCounts(counts);
      });

      // Current session events
      socket.on('currentSession', (snapshot: CurrentSessionSnapshot) => {
        console.log('🎮 Current session snapshot:', snapshot);
        setCurrentSession(snapshot);
      });

      socket.on('currentSessionUpdated', (snapshot: CurrentSessionSnapshot) => {
        console.log('🔄 Current session updated:', snapshot);
        setCurrentSession(snapshot);
      });

      // Early joiners events
      socket.on('earlyJoinersList', (data: EarlyJoinersList) => {
        console.log('👥 Early joiners list:', data);
        setEarlyJoiners(data);
      });

      socket.on('earlyJoinersListResult', (data: EarlyJoinersList) => {
        console.log('👥 Early joiners list result:', data);
        setEarlyJoiners(data);
      });

      socket.on('roomEarlyJoinersUpdated', (data: EarlyJoinersList) => {
        console.log('🔄 Room early joiners updated:', data);
        setEarlyJoiners(data);
      });

      // Join room events
      socket.on('gameJoinRoomResult', (result: JoinRoomResult) => {
        console.log('🚪 Join room result:', result);
        if (joinRoomPromiseRef.current) {
          joinRoomPromiseRef.current.resolve(result);
          joinRoomPromiseRef.current = null;
        }
      });

      socket.on('joinRoomWithEarlyJoinersResult', (result: JoinRoomResult) => {
        console.log('🚪 Join room with early joiners result:', result);
        if (joinRoomPromiseRef.current) {
          joinRoomPromiseRef.current.resolve(result);
          joinRoomPromiseRef.current = null;
        }
      });

      socket.on('gameJoinRoomUpdated', (data: { roomId: number; sessionId: number; joinList: EarlyJoiner[] }) => {
        console.log('🔄 Game join room updated:', data);
        // Update early joiners when someone joins
        setEarlyJoiners(prev => prev ? {
          ...prev,
          earlyJoiners: data.joinList,
          totalCount: data.joinList.length,
        } : null);
      });

      // Error handling
      socket.on('error', (errorData: { message: string }) => {
        console.error('❌ WebSocket error:', errorData);
        const errorMessage = errorData.message || 'WebSocket connection error';
        setError(errorMessage);
        onError?.(errorMessage);
      });

      socket.on('connect_error', (err) => {
        console.error('❌ Connection error:', err);
        const errorMessage = err.message || 'Failed to connect to WebSocket';
        setError(errorMessage);
        onError?.(errorMessage);
        setIsConnecting(false);
      });

      socketRef.current = socket;
      socket.connect();
    } catch (err) {
      console.error('❌ Failed to create WebSocket connection:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create WebSocket connection';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsConnecting(false);
    }
  }, [serverUrl, onConnect, onDisconnect, onError]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionInfo(null);
  }, []);

  // Subscribe to room counts by game type
  const subscribeRoomCountByGameType = useCallback((gtId: number) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot subscribe to room counts');
      return;
    }

    console.log('📊 Subscribing to room counts for game type:', gtId);
    socketRef.current.emit('subscribeRoomCountByGameType', gtId);
  }, []);

  // Subscribe to current session
  const subscribeCurrentSession = useCallback((roomId: number) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot subscribe to current session');
      return;
    }

    console.log('🎮 Subscribing to current session for room:', roomId);
    socketRef.current.emit('subscribeCurrentSession', roomId);
  }, []);

  // Get early joiners list
  const getEarlyJoinersList = useCallback((payload: { roomId: number; sessionId?: number }) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot get early joiners list');
      return;
    }

    console.log('👥 Getting early joiners list:', payload);
    socketRef.current.emit('getEarlyJoinersList', payload);
  }, []);

  // Join room
  const joinRoom = useCallback(async (payload: { roomId: number }): Promise<JoinRoomResult | null> => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot join room');
      return null;
    }

    return new Promise((resolve, reject) => {
      joinRoomPromiseRef.current = { resolve, reject };
      
      console.log('🚪 Joining room:', payload);
      socketRef.current!.emit('gameJoinRoom', payload);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (joinRoomPromiseRef.current) {
          joinRoomPromiseRef.current.resolve(null);
          joinRoomPromiseRef.current = null;
        }
      }, 10000);
    });
  }, []);

  // Join room with early joiners
  const joinRoomWithEarlyJoiners = useCallback(async (payload: { roomId: number }): Promise<JoinRoomResult | null> => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot join room');
      return null;
    }

    return new Promise((resolve, reject) => {
      joinRoomPromiseRef.current = { resolve, reject };
      
      console.log('🚪 Joining room with early joiners:', payload);
      socketRef.current!.emit('joinRoomWithEarlyJoiners', payload);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (joinRoomPromiseRef.current) {
          joinRoomPromiseRef.current.resolve(null);
          joinRoomPromiseRef.current = null;
        }
      }, 10000);
    });
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionInfo,
    
    // Room counts
    roomCounts,
    subscribeRoomCountByGameType,
    
    // Current session
    currentSession,
    subscribeCurrentSession,
    
    // Early joiners
    earlyJoiners,
    getEarlyJoinersList,
    
    // Room joining
    joinRoom,
    joinRoomWithEarlyJoiners,
    
    // Connection management
    connect,
    disconnect,
    
    // Error handling
    error,
    clearError,
  };
};

export default useGameRoomWebSocket;
```

## Usage Examples

### Basic Usage

```typescript
// components/GameRoomComponent.tsx
import React, { useEffect } from 'react';
import { useGameRoomWebSocket } from '../hooks/useGameRoomWebSocket';

const GameRoomComponent: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    connectionInfo,
    roomCounts,
    currentSession,
    earlyJoiners,
    subscribeRoomCountByGameType,
    subscribeCurrentSession,
    getEarlyJoinersList,
    joinRoom,
    joinRoomWithEarlyJoiners,
    error,
    clearError,
  } = useGameRoomWebSocket({
    serverUrl: 'http://localhost:8008',
    autoConnect: true,
    onConnect: (info) => {
      console.log('Connected as user:', info.userId);
    },
    onDisconnect: () => {
      console.log('Disconnected from game rooms');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
  });

  // Subscribe to room counts for game type 1
  useEffect(() => {
    if (isConnected) {
      subscribeRoomCountByGameType(1);
    }
  }, [isConnected, subscribeRoomCountByGameType]);

  // Subscribe to current session for room 123
  useEffect(() => {
    if (isConnected) {
      subscribeCurrentSession(123);
    }
  }, [isConnected, subscribeCurrentSession]);

  const handleJoinRoom = async () => {
    try {
      const result = await joinRoom({ roomId: 123 });
      if (result?.success) {
        console.log('Successfully joined room:', result);
      } else {
        console.error('Failed to join room:', result?.error);
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleJoinRoomWithEarlyJoiners = async () => {
    try {
      const result = await joinRoomWithEarlyJoiners({ roomId: 123 });
      if (result?.success) {
        console.log('Successfully joined room with early joiners:', result);
      } else {
        console.error('Failed to join room:', result?.error);
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleGetEarlyJoiners = () => {
    getEarlyJoinersList({ roomId: 123, sessionId: 456 });
  };

  if (isConnecting) {
    return <div>Connecting to game rooms...</div>;
  }

  if (!isConnected) {
    return <div>Not connected to game rooms</div>;
  }

  return (
    <div>
      <h2>Game Room WebSocket</h2>
      
      {connectionInfo && (
        <div>
          <p>Connected as: {connectionInfo.userId || 'Guest'}</p>
          <p>Client ID: {connectionInfo.clientId}</p>
        </div>
      )}

      {error && (
        <div style={{ color: 'red' }}>
          <p>Error: {error}</p>
          <button onClick={clearError}>Clear Error</button>
        </div>
      )}

      {roomCounts && (
        <div>
          <h3>Room Counts</h3>
          <p>Pending: {roomCounts.pending}</p>
          <p>Running: {roomCounts.running}</p>
          <p>Out: {roomCounts.out}</p>
          <p>End: {roomCounts.end}</p>
          <p>Total: {roomCounts.total}</p>
          <p>Last Updated: {roomCounts.lastUpdated}</p>
        </div>
      )}

      {currentSession && (
        <div>
          <h3>Current Session</h3>
          <p>Room ID: {currentSession.roomId}</p>
          {currentSession.current_session ? (
            <div>
              <p>Session ID: {currentSession.current_session.id}</p>
              <p>Status: {currentSession.current_session.status}</p>
              <p>Participants: {currentSession.current_session.participants_count}/{currentSession.current_session.max_participants}</p>
              <p>Can Join: {currentSession.current_session.can_join ? 'Yes' : 'No'}</p>
            </div>
          ) : (
            <p>No active session</p>
          )}
        </div>
      )}

      {earlyJoiners && (
        <div>
          <h3>Early Joiners</h3>
          <p>Total Count: {earlyJoiners.totalCount}</p>
          <ul>
            {earlyJoiners.earlyJoiners.map((joiner, index) => (
              <li key={index}>
                {joiner.username} - {joiner.fullname} (Joined: {new Date(joiner.joined_at).toLocaleString()})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <button onClick={handleJoinRoom}>Join Room</button>
        <button onClick={handleJoinRoomWithEarlyJoiners}>Join Room with Early Joiners</button>
        <button onClick={handleGetEarlyJoiners}>Get Early Joiners List</button>
      </div>
    </div>
  );
};

export default GameRoomComponent;
```

### Advanced Usage with Custom Configuration

```typescript
// pages/game-rooms.tsx
import React, { useState, useEffect } from 'react';
import { useGameRoomWebSocket } from '../hooks/useGameRoomWebSocket';

const GameRoomsPage: React.FC = () => {
  const [selectedGameType, setSelectedGameType] = useState<number>(1);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const {
    isConnected,
    roomCounts,
    currentSession,
    earlyJoiners,
    subscribeRoomCountByGameType,
    subscribeCurrentSession,
    joinRoom,
    error,
  } = useGameRoomWebSocket({
    serverUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
    autoConnect: true,
    onConnect: (info) => {
      console.log('Connected to game rooms:', info);
    },
    onError: (error) => {
      console.error('Game room WebSocket error:', error);
    },
  });

  // Subscribe to room counts when game type changes
  useEffect(() => {
    if (isConnected && selectedGameType) {
      subscribeRoomCountByGameType(selectedGameType);
    }
  }, [isConnected, selectedGameType, subscribeRoomCountByGameType]);

  // Subscribe to current session when room changes
  useEffect(() => {
    if (isConnected && selectedRoomId) {
      subscribeCurrentSession(selectedRoomId);
    }
  }, [isConnected, selectedRoomId, subscribeCurrentSession]);

  const handleJoinRoom = async (roomId: number) => {
    try {
      const result = await joinRoom({ roomId });
      if (result?.success) {
        alert(`Successfully joined room ${roomId}`);
        setSelectedRoomId(roomId);
      } else {
        alert(`Failed to join room: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Error joining room');
    }
  };

  if (!isConnected) {
    return <div>Connecting to game rooms...</div>;
  }

  return (
    <div>
      <h1>Game Rooms</h1>
      
      {error && (
        <div style={{ color: 'red', padding: '10px', margin: '10px 0', border: '1px solid red' }}>
          Error: {error}
        </div>
      )}

      <div>
        <label>
          Game Type:
          <select 
            value={selectedGameType} 
            onChange={(e) => setSelectedGameType(Number(e.target.value))}
          >
            <option value={1}>Type 1</option>
            <option value={2}>Type 2</option>
            <option value={3}>Type 3</option>
          </select>
        </label>
      </div>

      {roomCounts && (
        <div style={{ margin: '20px 0' }}>
          <h2>Room Statistics</h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>Pending: {roomCounts.pending}</div>
            <div>Running: {roomCounts.running}</div>
            <div>Out: {roomCounts.out}</div>
            <div>End: {roomCounts.end}</div>
            <div>Total: {roomCounts.total}</div>
          </div>
        </div>
      )}

      {currentSession && (
        <div style={{ margin: '20px 0' }}>
          <h2>Current Session (Room {currentSession.roomId})</h2>
          {currentSession.current_session ? (
            <div>
              <p>Session ID: {currentSession.current_session.id}</p>
              <p>Status: {currentSession.current_session.status}</p>
              <p>Participants: {currentSession.current_session.participants_count}/{currentSession.current_session.max_participants}</p>
              <p>Can Join: {currentSession.current_session.can_join ? 'Yes' : 'No'}</p>
            </div>
          ) : (
            <p>No active session</p>
          )}
        </div>
      )}

      {earlyJoiners && (
        <div style={{ margin: '20px 0' }}>
          <h2>Early Joiners ({earlyJoiners.totalCount})</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {earlyJoiners.earlyJoiners.map((joiner, index) => (
              <div key={index} style={{ padding: '5px', border: '1px solid #ccc', margin: '2px 0' }}>
                <strong>{joiner.username}</strong> ({joiner.fullname})
                <br />
                Joined: {new Date(joiner.joined_at).toLocaleString()}
                <br />
                Amount: {joiner.amount}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ margin: '20px 0' }}>
        <h2>Available Rooms</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5].map((roomId) => (
            <button
              key={roomId}
              onClick={() => handleJoinRoom(roomId)}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedRoomId === roomId ? '#007bff' : '#f8f9fa',
                color: selectedRoomId === roomId ? 'white' : 'black',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Room {roomId}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameRoomsPage;
```

## Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:8008
```

## Features

### ✅ Implemented Features

1. **Connection Management**
   - Auto-connect on mount
   - Manual connect/disconnect
   - Connection state tracking
   - Error handling

2. **Room Counts**
   - Subscribe to room counts by game type
   - Real-time updates
   - Error handling

3. **Current Session**
   - Subscribe to current session for a room
   - Real-time session updates
   - Session status tracking

4. **Early Joiners**
   - Get early joiners list
   - Real-time updates when users join
   - Participant information

5. **Room Joining**
   - Join room functionality
   - Join room with early joiners
   - Promise-based API for async operations
   - Timeout handling

6. **Error Handling**
   - Comprehensive error states
   - Error clearing functionality
   - Connection error handling

### 🔧 Configuration Options

- **serverUrl**: WebSocket server URL
- **autoConnect**: Whether to connect automatically on mount
- **onConnect**: Callback when connected
- **onDisconnect**: Callback when disconnected
- **onError**: Callback for errors

### 📡 WebSocket Events Handled

**Client → Server:**
- `subscribeRoomCountByGameType`
- `subscribeCurrentSession`
- `getEarlyJoinersList`
- `gameJoinRoom`
- `joinRoomWithEarlyJoiners`

**Server → Client:**
- `connected`
- `gameRoomCounts`
- `currentSession`
- `currentSessionUpdated`
- `earlyJoinersList`
- `earlyJoinersListResult`
- `roomEarlyJoinersUpdated`
- `gameJoinRoomResult`
- `joinRoomWithEarlyJoinersResult`
- `gameJoinRoomUpdated`
- `error`

## TypeScript Support

The hook is fully typed with TypeScript interfaces for all data structures and return types, providing excellent IDE support and type safety.

## Error Handling

The hook provides comprehensive error handling for:
- Connection errors
- WebSocket errors
- Join room failures
- Timeout scenarios
- Invalid responses

## Performance Considerations

- Automatic cleanup on unmount
- Efficient state updates
- Promise-based async operations
- Timeout handling for operations
- Memory leak prevention
