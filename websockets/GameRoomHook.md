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

// Constants (matching server-side enums)
export const GAME_ROOM_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  OUT: 'out',
  END: 'end',
  DELETE: 'delete',
} as const;

export const GAME_SESSION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  OUT: 'out',
  END: 'end',
} as const;

export const GAME_JOIN_ROOM_STATUS = {
  EXECUTED: 'executed',
  VIEW: 'view',
} as const;

// Types
export interface GameTypeCounts {
  pending: number;
  running: number;
  out: number;
  end: number;
  total: number;
  lastUpdated: string;
}

export interface GameRoomCounts {
  lottery: GameTypeCounts;
  rps: GameTypeCounts;
  total: GameTypeCounts;
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
  subscribeRoomCountByGameType: () => Promise<GameRoomCounts | null>;
  
  // Current session
  currentSession: CurrentSessionSnapshot | null;
  subscribeCurrentSession: (roomId: number) => void;
  
  // Early joiners
  earlyJoiners: EarlyJoinersList | null;
  getEarlyJoinersList: (payload: { roomId: number; sessionId?: number }) => void;
  
  // Room joining
  joinRoom: (payload: { roomId: number; amount: number }) => Promise<JoinRoomResult | null>;
  joinRoomWithEarlyJoiners: (payload: { roomId: number; amount: number }) => Promise<JoinRoomResult | null>;
  
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

  // Subscribe to room counts (all game types)
  const subscribeRoomCountByGameType = useCallback((): Promise<GameRoomCounts | null> => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot subscribe to room counts');
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      // Set up one-time listener for the response
      const handleResponse = (counts: GameRoomCounts) => {
        console.log('📊 Room counts received:', counts);
        setRoomCounts(counts);
        socketRef.current?.off('gameRoomCounts', handleResponse);
        resolve(counts);
      };

      socketRef.current?.on('gameRoomCounts', handleResponse);
      console.log('📊 Subscribing to room counts for all game types');
      socketRef.current?.emit('subscribeRoomCountByGameType', 0); // 0 means all game types

      // Timeout after 5 seconds
      setTimeout(() => {
        socketRef.current?.off('gameRoomCounts', handleResponse);
        resolve(null);
      }, 5000);
    });
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
  const joinRoom = useCallback(async (payload: { roomId: number; amount: number }): Promise<JoinRoomResult | null> => {
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
  const joinRoomWithEarlyJoiners = useCallback(async (payload: { roomId: number; amount: number }): Promise<JoinRoomResult | null> => {
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

  // Subscribe to room counts for all game types
  useEffect(() => {
    if (isConnected) {
      subscribeRoomCountByGameType().then((counts) => {
        if (counts) {
          console.log('Room counts received:', counts);
        } else {
          console.log('Failed to get room counts');
        }
      });
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
      const result = await joinRoom({ roomId: 123, amount: 100 });
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
      const result = await joinRoomWithEarlyJoiners({ roomId: 123, amount: 100 });
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

  const handleGetRoomCounts = async () => {
    try {
      const counts = await subscribeRoomCountByGameType();
      if (counts) {
        console.log('Room counts:', counts);
        alert(`Total rooms: ${counts.total.total}, Lottery: ${counts.lottery.total}, RPS: ${counts.rps.total}`);
      } else {
        alert('Failed to get room counts');
      }
    } catch (error) {
      console.error('Error getting room counts:', error);
    }
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
          
          <div style={{ marginBottom: '20px' }}>
            <h4>Total</h4>
            <p>Pending: {roomCounts.total.pending}</p>
            <p>Running: {roomCounts.total.running}</p>
            <p>Out: {roomCounts.total.out}</p>
            <p>End: {roomCounts.total.end}</p>
            <p>Total: {roomCounts.total.total}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>Lottery</h4>
            <p>Pending: {roomCounts.lottery.pending}</p>
            <p>Running: {roomCounts.lottery.running}</p>
            <p>Out: {roomCounts.lottery.out}</p>
            <p>End: {roomCounts.lottery.end}</p>
            <p>Total: {roomCounts.lottery.total}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>RPS</h4>
            <p>Pending: {roomCounts.rps.pending}</p>
            <p>Running: {roomCounts.rps.running}</p>
            <p>Out: {roomCounts.rps.out}</p>
            <p>End: {roomCounts.rps.end}</p>
            <p>Total: {roomCounts.rps.total}</p>
          </div>

          <p>Last Updated: {roomCounts.total.lastUpdated}</p>
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
        <button onClick={handleGetRoomCounts}>Get Room Counts</button>
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

  // Subscribe to room counts when connected
  useEffect(() => {
    if (isConnected) {
      subscribeRoomCountByGameType();
    }
  }, [isConnected, subscribeRoomCountByGameType]);

  // Subscribe to current session when room changes
  useEffect(() => {
    if (isConnected && selectedRoomId) {
      subscribeCurrentSession(selectedRoomId);
    }
  }, [isConnected, selectedRoomId, subscribeCurrentSession]);

  const handleJoinRoom = async (roomId: number) => {
    try {
      const result = await joinRoom({ roomId, amount: 100 });
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
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Total</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>Pending: {roomCounts.total.pending}</div>
              <div>Running: {roomCounts.total.running}</div>
              <div>Out: {roomCounts.total.out}</div>
              <div>End: {roomCounts.total.end}</div>
              <div>Total: {roomCounts.total.total}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Lottery</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>Pending: {roomCounts.lottery.pending}</div>
              <div>Running: {roomCounts.lottery.running}</div>
              <div>Out: {roomCounts.lottery.out}</div>
              <div>End: {roomCounts.lottery.end}</div>
              <div>Total: {roomCounts.lottery.total}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>RPS</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>Pending: {roomCounts.rps.pending}</div>
              <div>Running: {roomCounts.rps.running}</div>
              <div>Out: {roomCounts.rps.out}</div>
              <div>End: {roomCounts.rps.end}</div>
              <div>Total: {roomCounts.rps.total}</div>
            </div>
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

## Validation & Error Handling

### Server-side Validations

The WebSocket gateway performs comprehensive validations:

1. **Authentication**
   - JWT token validation from cookies
   - User existence check
   - Wallet connection verification

2. **Input Validation**
   - `roomId` must be a valid number
   - `amount` must be a valid number
   - `gt_id` must be a valid game type ID

3. **Business Logic Validation**
   - Room exists and is RUNNING
   - Session exists and is PENDING
   - User hasn't already joined
   - Room has available capacity
   - Wallet has sufficient MPB balance
   - Wallet has MPB (not just USDT)

4. **Time-based Logic**
   - Within 3 minutes: Status = EXECUTED (actual participation)
   - After 3 minutes: Status = VIEW (spectator only)

### Error Messages

Common error responses from server:

- `"Unauthorized"` - User not authenticated
- `"User not found"` - User doesn't exist in database
- `"Invalid roomId"` - Invalid room ID provided
- `"Invalid amount"` - Invalid amount provided
- `"Wallet not connected"` - Wallet address not valid
- `"Room not found or inactive"` - Room doesn't exist or not RUNNING
- `"No joinable session"` - No PENDING session available
- `"Already joined"` - User already joined this session
- `"Room full"` - Room has reached maximum capacity
- `"Wallet balance not enough"` - Insufficient MPB balance
- `"Wallet balance has only USDT. You need to deposit MPB to join the room"` - No MPB balance

## Features

### ✅ Implemented Features

1. **Connection Management**
   - Auto-connect on mount
   - Manual connect/disconnect
   - Connection state tracking
   - Error handling

2. **Room Counts**
   - Subscribe to room counts for all game types
   - Real-time updates when session status changes
   - Automatic broadcast on `GameRoom.sessionStatusChanged` event
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
   - Join room functionality with amount
   - Join room with early joiners and amount
   - Promise-based API for async operations
   - Timeout handling
   - Comprehensive validation

6. **Error Handling**
   - Comprehensive error states
   - Error clearing functionality
   - Connection error handling
   - Server validation error handling

### 🔧 Configuration Options

- **serverUrl**: WebSocket server URL
- **autoConnect**: Whether to connect automatically on mount
- **onConnect**: Callback when connected
- **onDisconnect**: Callback when disconnected
- **onError**: Callback for errors

### 📡 WebSocket Events Handled

**Client → Server:**
- `subscribeRoomCountByGameType(gt_id: number)` - Subscribe to room counts (0 = all game types)
- `subscribeCurrentSession(roomId: number)` - Subscribe to current session for a room
- `getEarlyJoinersList({ roomId: number, sessionId?: number })` - Get early joiners list
- `gameJoinRoom({ roomId: number, amount: number })` - Join room with amount
- `joinRoomWithEarlyJoiners({ roomId: number, amount: number })` - Join room with early joiners and amount

**Server → Client:**
- `connected` - Connection established with user info
- `gameRoomCounts` - Room counts data (all game types)
- `currentSession` - Current session snapshot
- `currentSessionUpdated` - Session status changed
- `earlyJoinersList` - Early joiners list (from join room)
- `earlyJoinersListResult` - Early joiners list (from get request)
- `roomEarlyJoinersUpdated` - Early joiners updated (broadcast)
- `gameJoinRoomResult` - Join room result
- `joinRoomWithEarlyJoinersResult` - Join room with early joiners result
- `gameJoinRoomUpdated` - Join room updated (broadcast)
- `error` - Error occurred

**Internal Events:**
- `GameRoom.sessionStatusChanged` - Internal event triggered when session status changes (automatically broadcasts `gameRoomCounts`)

## Constants Usage

Use the provided constants to match server-side behavior:

```typescript
import { 
  GAME_ROOM_STATUS, 
  GAME_SESSION_STATUS, 
  GAME_JOIN_ROOM_STATUS 
} from '../hooks/useGameRoomWebSocket';

// Check room status
if (room.status === GAME_ROOM_STATUS.RUNNING) {
  // Room is active
}

// Check session status
if (session.status === GAME_SESSION_STATUS.PENDING) {
  // Session is waiting for participants
}

// Check join status
if (joinStatus === GAME_JOIN_ROOM_STATUS.EXECUTED) {
  // User is actually participating
} else if (joinStatus === GAME_JOIN_ROOM_STATUS.VIEW) {
  // User is only spectating
}
```

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

## Troubleshooting

### Common Issues

1. **"Unauthorized" Error**
   - Ensure JWT token is present in cookies
   - Check if token is valid and not expired
   - Verify user exists in database

2. **"Wallet not connected" Error**
   - Ensure wallet address is valid Solana public key
   - Check if wallet is properly connected

3. **"Room not found or inactive" Error**
   - Verify room ID exists
   - Check if room status is RUNNING

4. **"No joinable session" Error**
   - Check if there's a PENDING session for the room
   - Verify session hasn't expired

5. **"Already joined" Error**
   - User has already joined this session
   - Check existing joins in database

6. **"Room full" Error**
   - Room has reached maximum participants
   - Check room capacity vs current joins

7. **"Wallet balance not enough" Error**
   - User doesn't have sufficient MPB balance
   - Check wallet balance before joining

8. **"Wallet balance has only USDT" Error**
   - User needs to deposit MPB tokens
   - USDT alone is not sufficient for participation

### Debug Tips

1. **Enable Console Logging**
   ```typescript
   const { joinRoom } = useGameRoomWebSocket({
     onError: (error) => console.error('WebSocket Error:', error),
   });
   ```

2. **Check Connection State**
   ```typescript
   const { isConnected, connectionInfo } = useGameRoomWebSocket();
   console.log('Connected:', isConnected, 'Info:', connectionInfo);
   ```

3. **Validate Input Data**
   ```typescript
   // Before joining room
   if (!roomId || !amount || amount <= 0) {
     console.error('Invalid input data');
     return;
   }
   ```

4. **Handle Promise Rejections**
   ```typescript
   try {
     const result = await joinRoom({ roomId: 123, amount: 100 });
     if (result?.error) {
       console.error('Join failed:', result.error);
     }
   } catch (error) {
     console.error('Join error:', error);
   }
   ```

## Updated Usage Examples

### 🚀 **Cách sử dụng mới với room counts:**

```typescript
// Basic usage
const { 
  joinRoom, 
  joinRoomWithEarlyJoiners, 
  subscribeRoomCountByGameType,
  roomCounts 
} = useGameRoomWebSocket();

// Join room with amount
const result = await joinRoom({ roomId: 123, amount: 100 });

// Join with early joiners and amount
const result = await joinRoomWithEarlyJoiners({ roomId: 123, amount: 100 });

// Get room counts (all game types)
const counts = await subscribeRoomCountByGameType();

// Access counts by game type
console.log('Lottery pending:', roomCounts?.lottery.pending);
console.log('RPS running:', roomCounts?.rps.running);
console.log('Total rooms:', roomCounts?.total.total);

// Real-time updates
useEffect(() => {
  if (isConnected) {
    subscribeRoomCountByGameType();
  }
}, [isConnected, subscribeRoomCountByGameType]);
```

### 📊 **Room Counts Format:**

```typescript
// Response format
{
  lottery: {
    pending: 5,
    running: 3,
    out: 2,
    end: 10,
    total: 20,
    lastUpdated: "2025-01-10T10:30:00.000Z"
  },
  rps: {
    pending: 2,
    running: 1,
    out: 1,
    end: 6,
    total: 10,
    lastUpdated: "2025-01-10T10:30:00.000Z"
  },
  total: {
    pending: 7,
    running: 4,
    out: 3,
    end: 16,
    total: 30,
    lastUpdated: "2025-01-10T10:30:00.000Z"
  }
}
```

### 🔄 **Real-time Updates:**

- **Automatic**: Room counts are automatically updated when session status changes
- **Event-driven**: Uses `GameRoom.sessionStatusChanged` internal event
- **Broadcast**: All connected clients receive updates via `gameRoomCounts` event
- **No polling**: No need to manually refresh data
