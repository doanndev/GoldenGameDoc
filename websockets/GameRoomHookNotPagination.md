# Game Room WebSocket React Hook - Optimized for Real-time Participants

## Overview
This document provides a comprehensive React hook for integrating with the optimized Game Room WebSocket gateway in Next.js applications. The hook handles all WebSocket events, connection management, and provides a clean API for game room functionality with **real-time participants updates** and **high performance**.

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
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Types
export interface GameRoomInfo {
  id: number;
  name: string;
  symbol: string;
  game_type_id: number | null;
  owner_id: {
    id: number;
    username: string;
  } | null;
  current_session: {
    id: number;
    status: string;
    time_start: string;
    session: number;
  } | null;
}

export interface GameTypeCounts {
  pending: {
    count: number;
  };
  running: {
    count: number;
  };
  out: {
    count: number;
  };
  end: {
    count: number;
  };
  total: {
    count: number;
  };
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

export interface Participant {
  id: number;
  user_id: number;
  username: string;
  fullname: string;
  avatar: string;
  wallet_address: string;
  amount: number;
  time_join: string;
  status: string;
}

export interface RoomParticipants {
  roomId: number;
  sessionId: number;
  participants: Participant[];
  totalCount: number;
  timestamp: string;
}

export interface JoinRoomResult {
  success: boolean;
  roomId: number;
  message?: string;
  participants: Participant[];
  totalCount: number;
  sessionId: number;
  sessionStatus: string;
  timestamp: string;
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
  
  // Room participants (NEW)
  roomParticipants: RoomParticipants | null;
  joinRoom: (payload: { roomId: number }) => Promise<JoinRoomResult | null>;
  leaveRoom: (payload: { roomId: number }) => void;
  getCurrentRoomParticipants: (payload: { roomId: number }) => Promise<RoomParticipants | null>;
  
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
  const [roomParticipants, setRoomParticipants] = useState<RoomParticipants | null>(null);
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

      // Room participants events (NEW)
      socket.on('joinRoomResult', (result: JoinRoomResult) => {
        console.log('🚪 Join room result:', result);
        if (joinRoomPromiseRef.current) {
          joinRoomPromiseRef.current.resolve(result);
          joinRoomPromiseRef.current = null;
        }
      });

      socket.on('roomParticipantsUpdated', (data: RoomParticipants) => {
        console.log('👥 Room participants updated:', data);
        setRoomParticipants(data);
      });

      socket.on('currentRoomParticipantsResult', (data: RoomParticipants) => {
        console.log('👥 Current room participants result:', data);
        setRoomParticipants(data);
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

  // Subscribe to room counts
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
      console.log('📊 Subscribing to room counts');
      socketRef.current?.emit('subscribeRoomCountByGameType');

      socketRef.current?.off('gameRoomCounts', handleResponse);
      resolve(null);
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

  // Join room and get participants
  const joinRoom = useCallback(async (payload: { roomId: number }): Promise<JoinRoomResult | null> => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot join room');
      return null;
    }

    return new Promise((resolve, reject) => {
      joinRoomPromiseRef.current = { resolve, reject };
      
      console.log('🚪 Joining room:', payload);
      socketRef.current!.emit('joinRoom', payload);

      if (joinRoomPromiseRef.current) {
        joinRoomPromiseRef.current.resolve(null);
        joinRoomPromiseRef.current = null;
      }
    });
  }, []);

  // Leave room
  const leaveRoom = useCallback((payload: { roomId: number }) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot leave room');
      return;
    }

    console.log('🚪 Leaving room:', payload);
    socketRef.current.emit('leaveRoom', payload);
  }, []);

  // Get current room participants
  const getCurrentRoomParticipants = useCallback(async (payload: { roomId: number }): Promise<RoomParticipants | null> => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot get participants');
      return null;
    }

    return new Promise((resolve) => {
      const handleResponse = (data: RoomParticipants) => {
        console.log('👥 Current room participants received:', data);
        setRoomParticipants(data);
        socketRef.current?.off('currentRoomParticipantsResult', handleResponse);
        resolve(data);
      };

      socketRef.current?.on('currentRoomParticipantsResult', handleResponse);
      console.log('👥 Getting current room participants:', payload);
      socketRef.current?.emit('getCurrentRoomParticipants', payload);

      socketRef.current?.off('currentRoomParticipantsResult', handleResponse);
      resolve(null);
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
    
    // Room counts with pagination
    roomCounts,
    subscribeRoomCountByGameType,
    
    // Current session
    currentSession,
    subscribeCurrentSession,
    
    // Room participants (NEW)
    roomParticipants,
    joinRoom,
    leaveRoom,
    getCurrentRoomParticipants,
    
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
    roomParticipants,
    subscribeRoomCountByGameType,
    subscribeCurrentSession,
    joinRoom,
    leaveRoom,
    getCurrentRoomParticipants,
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

  // Subscribe to room counts
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
      const result = await joinRoom({ roomId: 123 });
      if (result?.success) {
        console.log('Successfully joined room:', result);
        console.log('Participants:', result.participants);
      } else {
        console.error('Failed to join room:', result?.error);
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom({ roomId: 123 });
  };

  const handleGetParticipants = async () => {
    try {
      const participants = await getCurrentRoomParticipants({ roomId: 123 });
      if (participants) {
        console.log('Current participants:', participants);
      } else {
        console.log('Failed to get participants');
      }
    } catch (error) {
      console.error('Error getting participants:', error);
    }
  };

  const handleGetRoomCounts = async () => {
    try {
      const counts = await subscribeRoomCountByGameType();
      if (counts) {
        console.log('Room counts:', counts);
        alert(`Total rooms: ${counts.total.total.count}, Lottery: ${counts.lottery.total.count}, RPS: ${counts.rps.total.count}`);
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
            <p>Pending: {roomCounts.total.pending.count}</p>
            <p>Running: {roomCounts.total.running.count}</p>
            <p>Out: {roomCounts.total.out.count}</p>
            <p>End: {roomCounts.total.end.count}</p>
            <p>Total: {roomCounts.total.total.count}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>Lottery</h4>
            <p>Pending: {roomCounts.lottery.pending.count}</p>
            <p>Running: {roomCounts.lottery.running.count}</p>
            <p>Out: {roomCounts.lottery.out.count}</p>
            <p>End: {roomCounts.lottery.end.count}</p>
            <p>Total: {roomCounts.lottery.total.count}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>RPS</h4>
            <p>Pending: {roomCounts.rps.pending.count}</p>
            <p>Running: {roomCounts.rps.running.count}</p>
            <p>Out: {roomCounts.rps.out.count}</p>
            <p>End: {roomCounts.rps.end.count}</p>
            <p>Total: {roomCounts.rps.total.count}</p>
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

      {roomParticipants && (
        <div>
          <h3>Room Participants ({roomParticipants.totalCount})</h3>
          <p>Room ID: {roomParticipants.roomId}</p>
          <p>Session ID: {roomParticipants.sessionId}</p>
          <ul>
            {roomParticipants.participants.map((participant, index) => (
              <li key={index}>
                <strong>{participant.username}</strong> ({participant.fullname})
                <br />
                Wallet: {participant.wallet_address}
                <br />
                Amount: {participant.amount}
                <br />
                Joined: {new Date(participant.time_join).toLocaleString()}
                <br />
                Status: {participant.status}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <button onClick={handleJoinRoom}>Join Room</button>
        <button onClick={handleLeaveRoom}>Leave Room</button>
        <button onClick={handleGetParticipants}>Get Participants</button>
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
              <div>Pending: {roomCounts.total.pending.count}</div>
              <div>Running: {roomCounts.total.running.count}</div>
              <div>Out: {roomCounts.total.out.count}</div>
              <div>End: {roomCounts.total.end.count}</div>
              <div>Total: {roomCounts.total.total.count}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Lottery</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>Pending: {roomCounts.lottery.pending.count}</div>
              <div>Running: {roomCounts.lottery.running.count}</div>
              <div>Out: {roomCounts.lottery.out.count}</div>
              <div>End: {roomCounts.lottery.end.count}</div>
              <div>Total: {roomCounts.lottery.total.count}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>RPS</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>Pending: {roomCounts.rps.pending.count}</div>
              <div>Running: {roomCounts.rps.running.count}</div>
              <div>Out: {roomCounts.rps.out.count}</div>
              <div>End: {roomCounts.rps.end.count}</div>
              <div>Total: {roomCounts.rps.total.count}</div>
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
- `subscribeRoomCountByGameType()` - Subscribe to room counts (all rooms)
- `subscribeCurrentSession(roomId: number)` - Subscribe to current session for a room
- `joinRoom({ roomId: number })` - Join room and get participants
- `leaveRoom({ roomId: number })` - Leave room
- `getCurrentRoomParticipants({ roomId: number })` - Get current room participants

**Server → Client:**
- `connected` - Connection established with user info
- `gameRoomCounts` - Room counts data (all game types, all rooms)
- `currentSession` - Current session snapshot
- `currentSessionUpdated` - Session status changed
- `joinRoomResult` - Join room result with participants
- `roomParticipantsUpdated` - Real-time participants update (broadcast)
- `currentRoomParticipantsResult` - Current room participants result
- `error` - Error occurred

**Internal Events:**
- `GameRoom.sessionStatusChanged` - Internal event triggered when session status changes (automatically broadcasts `gameRoomCounts`)
- `GameRoom.joinRoom` - Internal event triggered when user joins room (broadcasts `roomParticipantsUpdated`)

## New Features Added

### 🆕 **Real-time Participants Management**
- **Join Room**: Join a room and immediately receive current participants list
- **Leave Room**: Leave a room to stop receiving updates
- **Get Participants**: Request current participants for any room
- **Real-time Updates**: Automatic updates when participants join/leave
- **High Performance**: Raw SQL queries for fastest possible response

### 🆕 **Simplified Room Counts**
- **All Rooms**: Returns counts for all rooms in the system
- **No Pagination**: Simplified response without pagination complexity
- **High Performance**: Optimized queries for fast response times

### 🆕 **Simplified Room Counts Structure**

The room counts now only include count information for better performance:

```typescript
interface GameTypeCounts {
  pending: {
    count: number;           // Number of rooms
  };
  running: {
    count: number;
  };
  out: {
    count: number;
  };
  end: {
    count: number;
  };
  total: {
    count: number;
  };
  lastUpdated: string;
}
```

### 🆕 **New Join Room Status**

Added support for new join room statuses:

```typescript
export const GAME_JOIN_ROOM_STATUS = {
  EXECUTED: 'executed',    // User is actually participating
  VIEW: 'view',            // User is only spectating
  CANCELLED: 'cancelled',  // User cancelled their join
  REFUNDED: 'refunded',    // User received refund for expired session
} as const;
```

### 🆕 **Real-time Join Room Updates**

When users join rooms, all connected clients receive real-time updates:

```typescript
// Listen for join room updates
socket.on('gameJoinRoomUpdated', (data) => {
  console.log('Someone joined room:', data.roomId);
  console.log('Updated joiners list:', data.joinList);
});
```

### 🆕 **Enhanced Early Joiners**

The early joiners list now includes more detailed information and supports pagination:

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
```

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

### 🚀 **Cách sử dụng mới với real-time participants:**

```typescript
// Basic usage
const { 
  joinRoom, 
  leaveRoom, 
  getCurrentRoomParticipants,
  subscribeRoomCountByGameType,
  roomCounts,
  roomParticipants 
} = useGameRoomWebSocket();

// Join room and get participants immediately
const result = await joinRoom({ roomId: 123 });
if (result?.success) {
  console.log('Joined room with participants:', result.participants);
}

// Leave room
leaveRoom({ roomId: 123 });

// Get current participants for a room
const participants = await getCurrentRoomParticipants({ roomId: 123 });
if (participants) {
  console.log('Current participants:', participants.participants);
}

// Get room counts (all rooms)
const counts = await subscribeRoomCountByGameType();

// Access counts by game type
console.log('Lottery pending:', roomCounts?.lottery.pending.count);
console.log('RPS running:', roomCounts?.rps.running.count);
console.log('Total rooms:', roomCounts?.total.total.count);

// Real-time updates
useEffect(() => {
  if (isConnected) {
    subscribeRoomCountByGameType();
  }
}, [isConnected, subscribeRoomCountByGameType]);

// Listen for real-time participant updates
useEffect(() => {
  if (roomParticipants) {
    console.log('Participants updated:', roomParticipants);
  }
}, [roomParticipants]);
```

### 📊 **Room Counts Format:**

```typescript
// Response format
{
  lottery: {
    pending: {
      count: 2
    },
    running: {
      count: 1
    },
    out: {
      count: 0
    },
    end: {
      count: 1
    },
    total: {
      count: 4
    },
    lastUpdated: "2025-01-10T10:30:00.000Z"
  },
  rps: {
    pending: {
      count: 1
    },
    running: {
      count: 0
    },
    out: {
      count: 0
    },
    end: {
      count: 0
    },
    total: {
      count: 1
    },
    lastUpdated: "2025-01-10T10:30:00.000Z"
  },
  total: {
    pending: {
      count: 3
    },
    running: {
      count: 1
    },
    out: {
      count: 0
    },
    end: {
      count: 1
    },
    total: {
      count: 5
    },
    lastUpdated: "2025-01-10T10:30:00.000Z"
  }
}
```

### 🔄 **Real-time Updates:**

- **Automatic**: Room counts are automatically updated when session status changes
- **Event-driven**: Uses `GameRoom.sessionStatusChanged` internal event
- **Broadcast**: All connected clients receive updates via `gameRoomCounts` event
- **No polling**: No need to manually refresh data
