# Game Room WebSocket React Hook - Complete Integration Guide

## Overview
This document provides a comprehensive React hook for integrating with the Game Room WebSocket gateway in Next.js applications. The hook handles all WebSocket events, connection management, and provides a clean API for game room functionality with **real-time participants updates**, **session management**, and **high performance**. 

**Note**: This hook only handles sessions with status `pending`, `running`, `end`, and `out`. All session statuses are included for comprehensive monitoring.

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
  OUT: 'out',
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
  out: {
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
  totalAmount?: number;
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

export interface UserCurrentRoomStatusResult {
  success: boolean;
  isAlreadyInRoom: boolean;
  currentRoom: {
    roomId: number;
    roomName: string;
    sessionId: number;
    sessionStatus: string;
    timeStart: string;
    isExpired: boolean;
  } | null;
  message?: string;
  error?: string;
}

export interface CheckJoinerInRoomResult {
  success: boolean;
  roomId: number;
  sessionId: number;
  isAlreadyInRoom: boolean;
  currentRoom: {
    roomId: number;
    roomName: string;
    sessionId: number;
    sessionStatus: string;
    timeStart: string;
  } | null;
  message?: string;
  error?: string;
}

export interface SessionStatusUpdated {
  success: boolean;
  roomId: number;
  sessionId: number;
  oldStatus: string;
  newStatus: string;
  sessionInfo: {
    id: number;
    status: string;
    timeStart: string;
    isExpired: boolean;
    totalAmount: number;
    totalParticipants: number;
    participationAmount: number;
  };
  message: string;
}

// Hook options
export interface UseGameRoomWebSocketOptions {
  serverUrl?: string;
  autoConnect?: boolean;
  onConnect?: (info: ConnectionInfo) => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  onSessionStatusUpdated?: (data: SessionStatusUpdated) => void;
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
  joinRoom: (payload: { roomId: number, sessionId: number }) => Promise<JoinRoomResult | null>;
  leaveRoom: (payload: { roomId: number }) => void;
  getCurrentRoomParticipants: (payload: { roomId: number }) => Promise<RoomParticipants | null>;
  
  // User status
  userCurrentRoomStatus: UserCurrentRoomStatusResult | null;
  checkJoinerInRoom: (payload: { roomId: number, sessionId: number }) => Promise<CheckJoinerInRoomResult | null>;
  getUserCurrentRoomStatus: () => Promise<UserCurrentRoomStatusResult | null>;
  
  // Session status updates
  sessionStatusUpdated: SessionStatusUpdated | null;
  
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
    onSessionStatusUpdated,
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [roomCounts, setRoomCounts] = useState<GameRoomCounts | null>(null);
  const [currentSession, setCurrentSession] = useState<CurrentSessionSnapshot | null>(null);
  const [roomParticipants, setRoomParticipants] = useState<RoomParticipants | null>(null);
  const [userCurrentRoomStatus, setUserCurrentRoomStatus] = useState<UserCurrentRoomStatusResult | null>(null);
  const [sessionStatusUpdated, setSessionStatusUpdated] = useState<SessionStatusUpdated | null>(null);
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
    resolve: (value: CheckJoinerInRoomResult | null) => void;
    reject: (reason?: any) => void;
  } | null>(null);
  const getUserStatusPromiseRef = useRef<{
    resolve: (value: UserCurrentRoomStatusResult | null) => void;
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

      // User status events
      socket.on('userCurrentRoomStatusResult', (data: UserCurrentRoomStatusResult) => {
        console.log('👤 User current room status result:', data);
        setUserCurrentRoomStatus(data);
        
        // Resolve promise if waiting for response
        if (getUserStatusPromiseRef.current) {
          getUserStatusPromiseRef.current.resolve(data);
          getUserStatusPromiseRef.current = null;
        }
      });

      socket.on('checkJoinerInRoomResult', (data: CheckJoinerInRoomResult) => {
        console.log('🔍 Check joiner in room result:', data);
        
        // Resolve promise if waiting for response
        if (checkJoinerPromiseRef.current) {
          checkJoinerPromiseRef.current.resolve(data);
          checkJoinerPromiseRef.current = null;
        }
      });

      // Session status updated events
      socket.on('sessionStatusUpdated', (data: SessionStatusUpdated) => {
        console.log('🔄 Session status updated:', data);
        setSessionStatusUpdated(data);
        onSessionStatusUpdated?.(data);
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
  }, [serverUrl, onConnect, onDisconnect, onError, onSessionStatusUpdated]);

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
  const joinRoom = useCallback(async (payload: { roomId: number, sessionId: number }): Promise<JoinRoomResult | null> => {
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

  // Check if user is currently in any active room
  const checkJoinerInRoom = useCallback(async (payload: { roomId: number, sessionId: number }): Promise<CheckJoinerInRoomResult | null> => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot check joiner in room');
      return null;
    }

    return new Promise((resolve) => {
      const handleResponse = (data: CheckJoinerInRoomResult) => {
        console.log('🔍 Check joiner in room result received:', data);
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

  // Get user current room status
  const getUserCurrentRoomStatus = useCallback(async (): Promise<UserCurrentRoomStatusResult | null> => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot get user current room status');
      return null;
    }

    return new Promise((resolve) => {
      const handleResponse = (data: UserCurrentRoomStatusResult) => {
        console.log('👤 User current room status result received:', data);
        setUserCurrentRoomStatus(data);
        socketRef.current?.off('userCurrentRoomStatusResult', handleResponse);
        resolve(data);
      };

      getUserStatusPromiseRef.current = { resolve, reject: () => {} };
      socketRef.current?.on('userCurrentRoomStatusResult', handleResponse);
      console.log('👤 Getting user current room status');
      socketRef.current?.emit('getUserCurrentRoomStatus');

      // Timeout after 5 seconds
      setTimeout(() => {
        socketRef.current?.off('userCurrentRoomStatusResult', handleResponse);
        if (getUserStatusPromiseRef.current) {
          getUserStatusPromiseRef.current.resolve(null);
          getUserStatusPromiseRef.current = null;
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
    
    // User status
    userCurrentRoomStatus,
    checkJoinerInRoom,
    getUserCurrentRoomStatus,
    
    // Session status updates
    sessionStatusUpdated,
    
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
    userCurrentRoomStatus,
    sessionStatusUpdated,
    subscribeRoomCountByGameType,
    subscribeCurrentSession,
    joinRoom,
    leaveRoom,
    getCurrentRoomParticipants,
    checkJoinerInRoom,
    getUserCurrentRoomStatus,
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
    onSessionStatusUpdated: (data) => {
      console.log('Session status changed:', data);
      console.log('Old status:', data.oldStatus);
      console.log('New status:', data.newStatus);
      console.log('Session info:', data.sessionInfo);
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

  // Handle session status updates
  useEffect(() => {
    if (sessionStatusUpdated) {
      console.log('Session status updated:', sessionStatusUpdated);
      
      // Show notification based on status change
      if (sessionStatusUpdated.newStatus === 'running') {
        alert(`Session ${sessionStatusUpdated.sessionId} is now running!`);
      } else if (sessionStatusUpdated.newStatus === 'end') {
        alert(`Session ${sessionStatusUpdated.sessionId} has ended!`);
      } else if (sessionStatusUpdated.newStatus === 'out') {
        alert(`Session ${sessionStatusUpdated.sessionId} has expired!`);
      }
    }
  }, [sessionStatusUpdated]);

  const handleJoinRoom = async () => {
    try {
      // First check if user can join
      const checkResult = await checkJoinerInRoom({ roomId: 123, sessionId: 456 });
      if (checkResult?.isAlreadyInRoom) {
        alert(`You are already in room "${checkResult.currentRoom?.roomName}" (ID: ${checkResult.currentRoom?.roomId}). Please wait for the current session to end.`);
        return;
      }

      if (!checkResult?.success) {
        alert(`Cannot join room: ${checkResult?.message || 'Unknown error'}`);
        return;
      }

      const result = await joinRoom({ roomId: 123, sessionId: 456 });
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

  const handleCheckUserStatus = async () => {
    try {
      const status = await getUserCurrentRoomStatus();
      if (status) {
        if (status.isAlreadyInRoom) {
          console.log('User is currently in room:', status.currentRoom);
          console.log('Room name:', status.currentRoom?.roomName);
          console.log('Session status:', status.currentRoom?.sessionStatus);
          console.log('Is expired:', status.currentRoom?.isExpired);
        } else {
          console.log('User is not in any active room');
        }
      } else {
        console.log('Failed to get user status');
      }
    } catch (error) {
      console.error('Error checking user status:', error);
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
            <p>Out: {roomCounts.total.out.count}</p>
            <p>Total: {roomCounts.total.total.count}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>Lottery</h4>
            <p>Pending: {roomCounts.lottery.pending.count}</p>
            <p>Running: {roomCounts.lottery.running.count}</p>
            <p>End: {roomCounts.lottery.end.count}</p>
            <p>Out: {roomCounts.lottery.out.count}</p>
            <p>Total: {roomCounts.lottery.total.count}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>RPS</h4>
            <p>Pending: {roomCounts.rps.pending.count}</p>
            <p>Running: {roomCounts.rps.running.count}</p>
            <p>End: {roomCounts.rps.end.count}</p>
            <p>Out: {roomCounts.rps.out.count}</p>
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

      {userCurrentRoomStatus && (
        <div>
          <h3>User Current Room Status</h3>
          <p>Is Already In Room: {userCurrentRoomStatus.isAlreadyInRoom ? 'Yes' : 'No'}</p>
          {userCurrentRoomStatus.currentRoom ? (
            <div>
              <p>Current Room: {userCurrentRoomStatus.currentRoom.roomName} (ID: {userCurrentRoomStatus.currentRoom.roomId})</p>
              <p>Session ID: {userCurrentRoomStatus.currentRoom.sessionId}</p>
              <p>Session Status: {userCurrentRoomStatus.currentRoom.sessionStatus}</p>
              <p>Session Started: {new Date(userCurrentRoomStatus.currentRoom.timeStart).toLocaleString()}</p>
              <p>Is Expired: {userCurrentRoomStatus.currentRoom.isExpired ? 'Yes' : 'No'}</p>
            </div>
          ) : (
            <p>Not currently in any room</p>
          )}
          <p>Message: {userCurrentRoomStatus.message}</p>
        </div>
      )}

      {sessionStatusUpdated && (
        <div style={{ backgroundColor: '#f0f8ff', padding: '10px', margin: '10px 0', border: '1px solid #007bff', borderRadius: '4px' }}>
          <h3>🔄 Session Status Updated</h3>
          <p><strong>Room ID:</strong> {sessionStatusUpdated.roomId}</p>
          <p><strong>Session ID:</strong> {sessionStatusUpdated.sessionId}</p>
          <p><strong>Status Change:</strong> {sessionStatusUpdated.oldStatus} → {sessionStatusUpdated.newStatus}</p>
          <p><strong>Message:</strong> {sessionStatusUpdated.message}</p>
          
          <div style={{ marginTop: '10px' }}>
            <h4>Session Info:</h4>
            <p><strong>ID:</strong> {sessionStatusUpdated.sessionInfo.id}</p>
            <p><strong>Status:</strong> {sessionStatusUpdated.sessionInfo.status}</p>
            <p><strong>Time Start:</strong> {new Date(sessionStatusUpdated.sessionInfo.timeStart).toLocaleString()}</p>
            <p><strong>Is Expired:</strong> {sessionStatusUpdated.sessionInfo.isExpired ? 'Yes' : 'No'}</p>
            <p><strong>Total Amount:</strong> {sessionStatusUpdated.sessionInfo.totalAmount}</p>
            <p><strong>Total Participants:</strong> {sessionStatusUpdated.sessionInfo.totalParticipants}</p>
            <p><strong>Participation Amount:</strong> {sessionStatusUpdated.sessionInfo.participationAmount}</p>
          </div>
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
        <button onClick={handleCheckUserStatus}>Check User Status</button>
        <button onClick={handleGetRoomCounts}>Get Room Counts</button>
      </div>
    </div>
  );
};

export default GameRoomComponent;
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
| `joinRoom` | `{ roomId: number, sessionId: number }` | Join a room and get participants list |
| `leaveRoom` | `{ roomId: number }` | Leave a room |
| `getCurrentRoomParticipants` | `{ roomId: number }` | Get current participants for a room |
| `checkJoinerInRoom` | `{ roomId: number, sessionId: number }` | Check if user can join a room |
| `getUserCurrentRoomStatus` | - | Get user's current room status |

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
| `userCurrentRoomStatusResult` | `UserCurrentRoomStatusResult` | User's current room status |
| `checkJoinerInRoomResult` | `CheckJoinerInRoomResult` | Check joiner result |
| `sessionStatusUpdated` | `SessionStatusUpdated` | Session status changed with detailed info |
| `error` | `{ message: string }` | Error occurred |

## Features

### ✅ Implemented Features

1. **Connection Management**
   - Auto-connect on mount
   - Manual connect/disconnect
   - Connection state tracking
   - Error handling

2. **Room Counts**
   - Subscribe to room counts for all game types (pending, running, end, out)
   - Real-time updates when session status changes
   - Automatic broadcast on `GameRoom.sessionStatusChanged` event
   - Includes all session statuses for comprehensive monitoring
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
   - Check if user can join a room
   - Get user's current room status
   - Cross-room validation with detailed room info
   - Promise-based API for async operations
   - Timeout handling
   - **🆕 Automatic status broadcasting when sessions change**

5. **Session Status Updates**
   - Real-time session status change notifications
   - Detailed session information on status change
   - Automatic broadcasting to all connected clients
   - Session expiration tracking
   - Total amount and participants count updates
   - Custom callback support for status changes

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
- **onSessionStatusUpdated**: Callback for session status updates

## Performance Considerations

- **Optimized Queries**: Server uses TypeORM QueryBuilder for better performance
- **Caching**: Server implements 2-second cache for room counts (`CACHE_TTL = 2000ms`)
- **Debouncing**: Server uses 100ms debouncing for broadcasts (`BROADCAST_DEBOUNCE = 100ms`) and 500ms for subscriptions (`SUBSCRIPTION_DEBOUNCE = 500ms`)
- **Real-time Updates**: Automatic updates without polling
- **Memory Management**: Automatic cleanup on unmount
- **Promise-based**: Efficient async operations with timeout handling
- **Filtered Data**: Processes all session statuses including `out` for comprehensive monitoring
- **Session Validation**: Built-in session expiration checking (3-minute timeout)
- **User Validation**: Prevents duplicate room participation
- **Cross-Room Validation**: Server-side validation to prevent multiple room participation
- **Real-time Error Handling**: Immediate feedback for join failures
- **🆕 Automatic Status Broadcasting**: Real-time notifications when sessions change, eliminating manual status checks
- **Connection Optimization**: Supports both WebSocket and polling transports for better compatibility

## Error Handling

The hook provides comprehensive error handling for:
- Connection errors
- WebSocket errors
- Join room failures
- Session expiration errors
- User validation errors
- Cross-room validation errors
- Join room validation errors
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
   - Check if user is in ANY other room with active session
   - Verify session expiration (3-minute timeout)
   - Check latest session only (not all historical sessions)

6. **Cross-Room Validation Error**
   - Use `checkJoinerInRoom` to verify user status
   - Check if user has already joined another room
   - Verify session status (PENDING/RUNNING)
   - Handle "You are already in room X" message

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
     const result = await joinRoom({ roomId: 123, sessionId: 456 });
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
     console.log('User can join room:', checkResult.message);
   } else {
     console.log('User already in another room:', checkResult.message);
   }
   ```

5. **Handle Session Status Updates**
   ```typescript
   const { sessionStatusUpdated } = useGameRoomWebSocket();
   
   useEffect(() => {
     if (sessionStatusUpdated) {
       console.log('Session status changed:', sessionStatusUpdated);
       // Handle different status changes
       switch (sessionStatusUpdated.newStatus) {
         case 'running':
           console.log('Session is now running!');
           break;
         case 'end':
           console.log('Session has ended!');
           break;
         case 'out':
           console.log('Session has expired!');
           break;
       }
     }
   }, [sessionStatusUpdated]);
   ```

## Session Status Updates

### 🔄 **Real-time Session Status Notifications**
The WebSocket gateway now provides real-time notifications when session status changes, allowing clients to react immediately to status updates.

#### **Event: `sessionStatusUpdated`**
This event is automatically emitted when any session status changes (PENDING → RUNNING → END/OUT).

#### **Event Data Structure:**
```typescript
{
  success: boolean;
  roomId: number;
  sessionId: number;
  oldStatus: string;        // Previous status
  newStatus: string;        // New status
  sessionInfo: {
    id: number;
    status: string;
    timeStart: string;
    isExpired: boolean;
    totalAmount: number;
    totalParticipants: number;
    participationAmount: number;
  };
  message: string;          // Human-readable message
}
```

#### **Usage Example:**
```typescript
const { sessionStatusUpdated } = useGameRoomWebSocket({
  onSessionStatusUpdated: (data) => {
    console.log('Session status changed:', data);
    
    // Handle different status changes
    switch (data.newStatus) {
      case 'running':
        console.log('Session is now running!');
        // Update UI to show game is active
        break;
      case 'end':
        console.log('Session has ended!');
        // Show results or redirect
        break;
      case 'out':
        console.log('Session has expired!');
        // Allow user to join other rooms
        break;
    }
  }
});

// Or use the state directly
useEffect(() => {
  if (sessionStatusUpdated) {
    console.log('Status updated:', sessionStatusUpdated);
    // Your custom logic here
  }
}, [sessionStatusUpdated]);
```

#### **Benefits:**
- ✅ **Real-time Updates**: Immediate notifications when sessions change
- ✅ **Detailed Information**: Complete session data with each update
- ✅ **Automatic Broadcasting**: No need to manually check status
- ✅ **Custom Callbacks**: Support for custom event handlers
- ✅ **State Management**: Built-in state for easy UI updates

## Updated Features

### 🆕 **Optimized Performance**
- **TypeORM QueryBuilder**: All queries use QueryBuilder instead of raw SQL
- **Better Type Safety**: Improved TypeScript support
- **Efficient Data Mapping**: Proper entity relationships
- **Reduced Database Load**: Optimized queries with proper joins
- **All Session Statuses**: Processes `pending`, `running`, `end`, `out` sessions for comprehensive monitoring
- **Advanced Caching**: 2-second cache TTL for room counts with automatic invalidation
- **Smart Debouncing**: 100ms broadcast debouncing and 500ms subscription debouncing
- **Connection Flexibility**: Supports both WebSocket and polling transports

### 🆕 **Enhanced Real-time Updates**
- **Automatic Broadcasting**: Room counts and participants update automatically
- **Event-driven**: Uses internal events for real-time updates
- **No Polling**: Eliminates need for manual refresh
- **Debounced Updates**: Prevents excessive broadcasts (100ms debouncing)
- **Session Expiration**: Built-in 3-minute session timeout checking
- **User Validation**: Prevents duplicate room participation
- **Cross-Room Validation**: Server-side validation with real-time feedback
- **Comprehensive Join Validation**: Detailed validation with clear messages
- **🆕 Automatic Status Broadcasting**: Real-time user status updates when sessions change
- **Smart Cache Management**: 2-second cache with automatic invalidation on changes
- **Connection State Management**: Tracks connected clients and user mappings

### 🆕 **Improved Error Handling**
- **Comprehensive Validation**: Server-side validation for all operations
- **Clear Error Messages**: Descriptive error responses
- **Timeout Handling**: Prevents hanging operations
- **Connection Recovery**: Automatic reconnection support
- **Session Validation**: Built-in session expiration checking
- **User Status Validation**: Prevents invalid room participation
- **Cross-Room Validation Detection**: Real-time validation with immediate feedback
- **Comprehensive Join Validation**: Detailed validation with clear messages
- **🆕 Automatic Status Broadcasting**: Real-time notifications when sessions change, eliminating manual status checks
