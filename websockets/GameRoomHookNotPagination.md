# Game Room WebSocket React Hook - Complete Integration Guide

## Overview
This document provides a comprehensive React hook for integrating with the Game Room WebSocket gateway in Next.js applications. The hook handles all WebSocket events, connection management, and provides a clean API for game room functionality with **real-time participants updates**, **session management**, and **high performance**. 

**Note**: This hook only handles sessions with status `pending`, `running`, and `end`. Sessions with `out` status are excluded from all operations.

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
  user_id: number | null;
  username: string | null;
  fullname: string | null;
  avatar: string | null;
  wallet_address: string;
  amount: number;
  time_join: string;
  status: string;
}

export interface RoomParticipants {
  success?: boolean;
  roomId: number;
  sessionId: number | null;
  sessionStatus?: string | null;
  participants: Participant[];
  totalCount: number;
  timestamp: string;
  error?: string;
}

export interface JoinRoomResult {
  success: boolean;
  roomId: number;
  message?: string;
  participants: Participant[];
  totalCount: number;
  sessionId: number | null;
  sessionStatus: string | null;
  timestamp: string;
  error?: string;
}

export interface ConnectionInfo {
  message: string;
  clientId: string;
  namespace: string;
  userId: number | null;
}

export interface CheckJoinerResult {
  success: boolean;
  roomId: number;
  sessionId: number;
  error?: string;
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
  
  // Room participants
  roomParticipants: RoomParticipants | null;
  joinRoom: (payload: { roomId: number }) => Promise<JoinRoomResult | null>;
  leaveRoom: (payload: { roomId: number }) => void;
  getCurrentRoomParticipants: (payload: { roomId: number }) => Promise<RoomParticipants | null>;
  checkJoinerInRoom: (payload: { roomId: number, sessionId: number }) => Promise<CheckJoinerResult | null>;
  
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
  const getParticipantsPromiseRef = useRef<{
    resolve: (value: RoomParticipants | null) => void;
    reject: (reason?: any) => void;
  } | null>(null);
  const checkJoinerPromiseRef = useRef<{
    resolve: (value: CheckJoinerResult | null) => void;
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

      // Room participants events
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
        
        // Resolve promise if waiting for response
        if (getParticipantsPromiseRef.current) {
          getParticipantsPromiseRef.current.resolve(data);
          getParticipantsPromiseRef.current = null;
        }
      });

      socket.on('checkJoinerInRoomResult', (data: CheckJoinerResult) => {
        console.log('🔍 Check joiner in room result:', data);
        
        // Resolve promise if waiting for response
        if (checkJoinerPromiseRef.current) {
          checkJoinerPromiseRef.current.resolve(data);
          checkJoinerPromiseRef.current = null;
        }
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

  // Subscribe to room counts with debouncing
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

      // Timeout after 5 seconds
      setTimeout(() => {
        socketRef.current?.off('gameRoomCounts', handleResponse);
        resolve(null);
      }, 5000);
    });
  }, []);

  // Debounced subscription to avoid multiple calls
  const debouncedSubscribeRoomCounts = useCallback(() => {
    const timeoutId = setTimeout(() => {
      subscribeRoomCountByGameType();
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [subscribeRoomCountByGameType]);

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

      // Timeout after 10 seconds
      setTimeout(() => {
        if (joinRoomPromiseRef.current) {
          joinRoomPromiseRef.current.resolve(null);
          joinRoomPromiseRef.current = null;
        }
      }, 10000);
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

      getParticipantsPromiseRef.current = { resolve, reject: () => {} };
      socketRef.current?.on('currentRoomParticipantsResult', handleResponse);
      console.log('👥 Getting current room participants:', payload);
      socketRef.current?.emit('getCurrentRoomParticipants', payload);

      // Timeout after 5 seconds
      setTimeout(() => {
        socketRef.current?.off('currentRoomParticipantsResult', handleResponse);
        if (getParticipantsPromiseRef.current) {
          getParticipantsPromiseRef.current.resolve(null);
          getParticipantsPromiseRef.current = null;
        }
      }, 5000);
    });
  }, []);

  // Check if user is already in a room
  const checkJoinerInRoom = useCallback(async (payload: { roomId: number, sessionId: number }): Promise<CheckJoinerResult | null> => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot check joiner');
      return null;
    }

    return new Promise((resolve) => {
      const handleResponse = (data: CheckJoinerResult) => {
        console.log('🔍 Check joiner result received:', data);
        socketRef.current?.off('checkJoinerInRoomResult', handleResponse);
        resolve(data);
      };

      checkJoinerPromiseRef.current = { resolve, reject: () => {} };
      socketRef.current?.on('checkJoinerInRoomResult', handleResponse);
      console.log('🔍 Checking joiner in room:', payload);
      socketRef.current?.emit('checkJoinerInRoom', payload);

      // Timeout after 5 seconds
      setTimeout(() => {
        socketRef.current?.off('checkJoinerInRoomResult', handleResponse);
        if (checkJoinerPromiseRef.current) {
          checkJoinerPromiseRef.current.resolve(null);
          checkJoinerPromiseRef.current = null;
        }
      }, 5000);
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

  // Auto-subscribe to room counts when connected (with debouncing)
  useEffect(() => {
    if (isConnected) {
      const cleanup = debouncedSubscribeRoomCounts();
      return cleanup;
    }
  }, [isConnected, debouncedSubscribeRoomCounts]);

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
    
    // Room participants
    roomParticipants,
    joinRoom,
    leaveRoom,
    getCurrentRoomParticipants,
    checkJoinerInRoom,
    
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
    checkJoinerInRoom,
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

  // Room counts are automatically subscribed when connected
  // No need to manually call subscribeRoomCountByGameType() in useEffect

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

  const handleCheckJoiner = async () => {
    try {
      const result = await checkJoinerInRoom({ roomId: 123, sessionId: 456 });
      if (result) {
        if (result.success) {
          console.log('User is already in room:', result);
        } else {
          console.log('User is not in room or session expired:', result);
        }
      } else {
        console.log('Failed to check joiner status');
      }
    } catch (error) {
      console.error('Error checking joiner:', error);
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
            <p>End: {roomCounts.total.end.count}</p>
            <p>Total: {roomCounts.total.total.count}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>Lottery</h4>
            <p>Pending: {roomCounts.lottery.pending.count}</p>
            <p>Running: {roomCounts.lottery.running.count}</p>
            <p>End: {roomCounts.lottery.end.count}</p>
            <p>Total: {roomCounts.lottery.total.count}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>RPS</h4>
            <p>Pending: {roomCounts.rps.pending.count}</p>
            <p>Running: {roomCounts.rps.running.count}</p>
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
                <strong>{participant.username || 'Unknown'}</strong> ({participant.fullname || 'N/A'})
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
        <button onClick={handleCheckJoiner}>Check Joiner</button>
        <button onClick={handleGetRoomCounts}>Get Room Counts</button>
      </div>
    </div>
  );
};

export default GameRoomComponent;
```

### Advanced Usage with Real-time Updates

```typescript
// pages/game-rooms.tsx
import React, { useState, useEffect } from 'react';
import { useGameRoomWebSocket } from '../hooks/useGameRoomWebSocket';

const GameRoomsPage: React.FC = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const {
    isConnected,
    roomCounts,
    currentSession,
    roomParticipants,
    subscribeRoomCountByGameType,
    subscribeCurrentSession,
    joinRoom,
    leaveRoom,
    getCurrentRoomParticipants,
    checkJoinerInRoom,
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

  // Room counts are automatically subscribed when connected
  // No need to manually subscribe

  // Subscribe to current session when room changes
  useEffect(() => {
    if (isConnected && selectedRoomId) {
      subscribeCurrentSession(selectedRoomId);
    }
  }, [isConnected, selectedRoomId, subscribeCurrentSession]);

  // Listen for real-time participant updates
  useEffect(() => {
    if (roomParticipants && roomParticipants.roomId === selectedRoomId) {
      console.log('Participants updated for room:', roomParticipants.roomId);
    }
  }, [roomParticipants, selectedRoomId]);

  const handleJoinRoom = async (roomId: number) => {
    try {
      // First check if user is already in a room
      const checkResult = await checkJoinerInRoom({ roomId, sessionId: 0 }); // sessionId 0 for general check
      if (checkResult?.success) {
        alert('You are already in a room. Please leave the current room first.');
        return;
      }

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

  const handleLeaveRoom = (roomId: number) => {
    leaveRoom({ roomId });
    if (selectedRoomId === roomId) {
      setSelectedRoomId(null);
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

      {roomCounts && (
        <div style={{ margin: '20px 0' }}>
          <h2>Room Statistics</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Total</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>Pending: {roomCounts.total.pending.count}</div>
              <div>Running: {roomCounts.total.running.count}</div>
              <div>End: {roomCounts.total.end.count}</div>
              <div>Total: {roomCounts.total.total.count}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Lottery</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>Pending: {roomCounts.lottery.pending.count}</div>
              <div>Running: {roomCounts.lottery.running.count}</div>
              <div>End: {roomCounts.lottery.end.count}</div>
              <div>Total: {roomCounts.lottery.total.count}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>RPS</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>Pending: {roomCounts.rps.pending.count}</div>
              <div>Running: {roomCounts.rps.running.count}</div>
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

      {roomParticipants && roomParticipants.roomId === selectedRoomId && (
        <div style={{ margin: '20px 0' }}>
          <h2>Room Participants ({roomParticipants.totalCount})</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {roomParticipants.participants.map((participant, index) => (
              <div key={index} style={{ padding: '5px', border: '1px solid #ccc', margin: '2px 0' }}>
                <strong>{participant.username || 'Unknown'}</strong> ({participant.fullname || 'N/A'})
                <br />
                Wallet: {participant.wallet_address}
                <br />
                Amount: {participant.amount}
                <br />
                Joined: {new Date(participant.time_join).toLocaleString()}
                <br />
                Status: {participant.status}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ margin: '20px 0' }}>
        <h2>Available Rooms</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5].map((roomId) => (
            <div key={roomId} style={{ display: 'flex', gap: '5px' }}>
              <button
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
                Join Room {roomId}
              </button>
              {selectedRoomId === roomId && (
                <button
                  onClick={() => handleLeaveRoom(roomId)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: '1px solid #dc3545',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Leave
                </button>
              )}
            </div>
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

## WebSocket Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribeRoomCountByGameType` | - | Subscribe to room counts for all game types |
| `subscribeCurrentSession` | `roomId: number` | Subscribe to current session for a specific room |
| `joinRoom` | `{ roomId: number }` | Join a room and get participants list |
| `leaveRoom` | `{ roomId: number }` | Leave a room |
| `getCurrentRoomParticipants` | `{ roomId: number }` | Get current participants for a room |
| `checkJoinerInRoom` | `{ roomId: number, sessionId: number }` | Check if user is already in a room |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `connected` | `ConnectionInfo` | Connection established with user info |
| `gameRoomCounts` | `GameRoomCounts` | Room counts data (all game types) |
| `currentSession` | `CurrentSessionSnapshot` | Current session snapshot |
| `currentSessionUpdated` | `CurrentSessionSnapshot` | Session status changed |
| `joinRoomResult` | `JoinRoomResult` | Join room result with participants |
| `roomParticipantsUpdated` | `RoomParticipants` | Real-time participants update (broadcast) |
| `currentRoomParticipantsResult` | `RoomParticipants` | Current room participants result |
| `checkJoinerInRoomResult` | `{ success: boolean, roomId: number, sessionId: number, error?: string }` | Result of joiner check |
| `error` | `{ message: string }` | Error occurred |

## Features

### ✅ Implemented Features

1. **Connection Management**
   - Auto-connect on mount
   - Manual connect/disconnect
   - Connection state tracking
   - Error handling

2. **Room Counts**
   - Subscribe to room counts for all game types (pending, running, end only)
   - Real-time updates when session status changes
   - Automatic broadcast on `GameRoom.sessionStatusChanged` event
   - Excludes sessions with `out` status
   - Error handling

3. **Current Session**
   - Subscribe to current session for a room
   - Real-time session updates
   - Session status tracking

4. **Room Participants**
   - Join room functionality
   - Get current participants list
   - Real-time participant updates
   - Leave room functionality
   - Check if user is already in a room
   - Promise-based API for async operations
   - Timeout handling

5. **Error Handling**
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

## Performance Considerations

- **Optimized Queries**: Server uses TypeORM QueryBuilder for better performance
- **Caching**: Server implements 2-second cache for room counts
- **Debouncing**: Server uses 100ms debouncing for broadcasts and 500ms for subscriptions
- **Real-time Updates**: Automatic updates without polling
- **Memory Management**: Automatic cleanup on unmount
- **Promise-based**: Efficient async operations with timeout handling
- **Filtered Data**: Only processes sessions with `pending`, `running`, `end` status (excludes `out`)
- **Session Validation**: Built-in session expiration checking (3-minute timeout)
- **User Validation**: Prevents duplicate room participation

## Error Handling

The hook provides comprehensive error handling for:
- Connection errors
- WebSocket errors
- Join room failures
- Session expiration errors
- User validation errors
- Timeout scenarios
- Invalid responses
- Server validation errors

## TypeScript Support

The hook is fully typed with TypeScript interfaces for all data structures and return types, providing excellent IDE support and type safety.

## Troubleshooting

### Common Issues

1. **"Unauthorized" Error**
   - Ensure JWT token is present in cookies
   - Check if token is valid and not expired
   - Verify user exists in database

2. **Connection Issues**
   - Check server URL configuration
   - Verify WebSocket server is running
   - Check network connectivity

3. **Room Not Found**
   - Verify room ID exists
   - Check if room is active

4. **No Active Session**
   - Check if there's a PENDING session for the room
   - Verify session hasn't expired

5. **User Already in Room**
   - Use `checkJoinerInRoom` to verify user status
   - Check if user is in another room with active session
   - Verify session expiration (3-minute timeout)

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

3. **Handle Promise Rejections**
   ```typescript
   try {
     const result = await joinRoom({ roomId: 123 });
     if (result?.error) {
       console.error('Join failed:', result.error);
     }
   } catch (error) {
     console.error('Join error:', error);
   }
   ```

4. **Check User Status Before Joining**
   ```typescript
   const checkResult = await checkJoinerInRoom({ roomId: 123, sessionId: 456 });
   if (checkResult?.success) {
     console.log('User is already in room');
   } else {
     console.log('User can join room');
   }
   ```

## Session Status Filtering

### 🚫 **Excluded Status: OUT**
This hook and the underlying WebSocket gateway **exclude sessions with `out` status** from all operations:

- **Room Counts**: Only counts sessions with `pending`, `running`, `end` status
- **Current Session**: Only returns sessions with valid statuses
- **Participants**: Only shows participants from active sessions
- **Real-time Updates**: Only broadcasts updates for valid sessions

### ✅ **Supported Statuses**
- **PENDING**: Sessions waiting to start
- **RUNNING**: Active game sessions
- **END**: Completed game sessions

### 🔧 **Why Exclude OUT?**
- **Data Integrity**: OUT sessions represent cancelled/failed sessions
- **Performance**: Reduces unnecessary data processing
- **User Experience**: Only shows meaningful session data
- **Business Logic**: OUT sessions don't contribute to room statistics

## Updated Features

### 🆕 **Optimized Performance**
- **TypeORM QueryBuilder**: All queries use QueryBuilder instead of raw SQL
- **Better Type Safety**: Improved TypeScript support
- **Efficient Data Mapping**: Proper entity relationships
- **Reduced Database Load**: Optimized queries with proper joins
- **Filtered Sessions**: Only processes `pending`, `running`, `end` sessions (excludes `out`)

### 🆕 **Enhanced Real-time Updates**
- **Automatic Broadcasting**: Room counts and participants update automatically
- **Event-driven**: Uses internal events for real-time updates
- **No Polling**: Eliminates need for manual refresh
- **Debounced Updates**: Prevents excessive broadcasts
- **Session Expiration**: Built-in 3-minute session timeout checking
- **User Validation**: Prevents duplicate room participation

### 🆕 **Improved Error Handling**
- **Comprehensive Validation**: Server-side validation for all operations
- **Clear Error Messages**: Descriptive error responses
- **Timeout Handling**: Prevents hanging operations
- **Connection Recovery**: Automatic reconnection support
- **Session Validation**: Built-in session expiration checking
- **User Status Validation**: Prevents invalid room participation
