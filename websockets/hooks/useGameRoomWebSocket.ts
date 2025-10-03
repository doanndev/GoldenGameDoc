import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  WebSocketEvents, 
  EarlyJoiner, 
  GameRoomCounts, 
  CurrentSession, 
  WebSocketConnectionState 
} from '../types/websocket-events.types';

const SOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:8080';
const NAMESPACE = '/game-rooms';

export const useGameRoomWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    clientId: null,
    userId: null,
  });

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setConnectionState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      socketRef.current = io(`${SOCKET_URL}${NAMESPACE}`, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        autoConnect: true,
      });

      // Connection event handlers
      socketRef.current.on('connect', () => {
        setConnectionState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          clientId: socketRef.current?.id || null,
        }));
        console.log('🔌 Connected to game-rooms WebSocket');
      });

      socketRef.current.on('disconnect', (reason) => {
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: `Disconnected: ${reason}`,
        }));
        console.log('🔌 Disconnected from game-rooms WebSocket:', reason);
      });

      socketRef.current.on('connect_error', (error) => {
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: `Connection error: ${error.message}`,
        }));
        console.error('❌ WebSocket connection error:', error);
      });

      // Authentication response
      socketRef.current.on('connected', (data: WebSocketEvents['connected']) => {
        setConnectionState(prev => ({
          ...prev,
          userId: data.userId,
        }));
        console.log('✅ WebSocket authenticated:', data);
      });

    } catch (error) {
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: `Failed to connect: ${error}`,
      }));
    }
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnectionState({
        isConnected: false,
        isConnecting: false,
        error: null,
        clientId: null,
        userId: null,
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    connectionState,
    connect,
    disconnect,
  };
};

// Hook for room counts by game type
export const useRoomCounts = (gameTypeId?: number) => {
  const { socket, connectionState } = useGameRoomWebSocket();
  const [roomCounts, setRoomCounts] = useState<GameRoomCounts | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const subscribeToRoomCounts = useCallback(() => {
    if (!socket || !gameTypeId) return;

    setIsLoading(true);
    socket.emit('subscribeRoomCountByGameType', gameTypeId);
  }, [socket, gameTypeId]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomCounts = (data: GameRoomCounts) => {
      setRoomCounts(data);
      setIsLoading(false);
    };

    socket.on('gameRoomCounts', handleRoomCounts);

    return () => {
      socket.off('gameRoomCounts', handleRoomCounts);
    };
  }, [socket]);

  useEffect(() => {
    if (connectionState.isConnected && gameTypeId) {
      subscribeToRoomCounts();
    }
  }, [connectionState.isConnected, gameTypeId, subscribeToRoomCounts]);

  return {
    roomCounts,
    isLoading,
    subscribeToRoomCounts,
  };
};

// Hook for current session
export const useCurrentSession = (roomId?: number) => {
  const { socket, connectionState } = useGameRoomWebSocket();
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const subscribeToCurrentSession = useCallback(() => {
    if (!socket || !roomId) return;

    setIsLoading(true);
    socket.emit('subscribeCurrentSession', roomId);
  }, [socket, roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleCurrentSession = (data: CurrentSession) => {
      setCurrentSession(data);
      setIsLoading(false);
    };

    const handleCurrentSessionUpdated = (data: CurrentSession) => {
      setCurrentSession(data);
    };

    socket.on('currentSession', handleCurrentSession);
    socket.on('currentSessionUpdated', handleCurrentSessionUpdated);

    return () => {
      socket.off('currentSession', handleCurrentSession);
      socket.off('currentSessionUpdated', handleCurrentSessionUpdated);
    };
  }, [socket]);

  useEffect(() => {
    if (connectionState.isConnected && roomId) {
      subscribeToCurrentSession();
    }
  }, [connectionState.isConnected, roomId, subscribeToCurrentSession]);

  return {
    currentSession,
    isLoading,
    subscribeToCurrentSession,
  };
};

// Hook for early joiners list
export const useEarlyJoiners = (roomId?: number, sessionId?: number) => {
  const { socket, connectionState } = useGameRoomWebSocket();
  const [earlyJoiners, setEarlyJoiners] = useState<EarlyJoiner[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEarlyJoinersList = useCallback(() => {
    if (!socket || !roomId) return;

    setIsLoading(true);
    setError(null);
    socket.emit('getEarlyJoinersList', { roomId, sessionId });
  }, [socket, roomId, sessionId]);

  useEffect(() => {
    if (!socket) return;

    const handleEarlyJoinersListResult = (data: WebSocketEvents['earlyJoinersListResult']) => {
      if (data.success && data.earlyJoiners) {
        setEarlyJoiners(data.earlyJoiners);
        setTotalCount(data.totalCount || 0);
        setError(null);
      } else {
        setError(data.error || 'Failed to get early joiners list');
      }
      setIsLoading(false);
    };

    const handleRoomEarlyJoinersUpdated = (data: WebSocketEvents['roomEarlyJoinersUpdated']) => {
      setEarlyJoiners(data.earlyJoiners);
      setTotalCount(data.totalCount);
    };

    socket.on('earlyJoinersListResult', handleEarlyJoinersListResult);
    socket.on('roomEarlyJoinersUpdated', handleRoomEarlyJoinersUpdated);

    return () => {
      socket.off('earlyJoinersListResult', handleEarlyJoinersListResult);
      socket.off('roomEarlyJoinersUpdated', handleRoomEarlyJoinersUpdated);
    };
  }, [socket]);

  useEffect(() => {
    if (connectionState.isConnected && roomId) {
      getEarlyJoinersList();
    }
  }, [connectionState.isConnected, roomId, getEarlyJoinersList]);

  return {
    earlyJoiners,
    totalCount,
    isLoading,
    error,
    getEarlyJoinersList,
  };
};

// Hook for joining room with early joiners
export const useJoinRoom = () => {
  const { socket, connectionState } = useGameRoomWebSocket();
  const [isJoining, setIsJoining] = useState(false);
  const [joinResult, setJoinResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const joinRoom = useCallback((roomId: number) => {
    if (!socket) return;

    setIsJoining(true);
    setError(null);
    socket.emit('joinRoomWithEarlyJoiners', { roomId });
  }, [socket]);

  const joinRoomLegacy = useCallback((roomId: number) => {
    if (!socket) return;

    setIsJoining(true);
    setError(null);
    socket.emit('gameJoinRoom', { roomId });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleJoinRoomResult = (data: WebSocketEvents['joinRoomWithEarlyJoinersResult']) => {
      if (data.success) {
        setJoinResult(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to join room');
      }
      setIsJoining(false);
    };

    const handleGameJoinRoomResult = (data: WebSocketEvents['gameJoinRoomResult']) => {
      if (data.success) {
        setJoinResult(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to join room');
      }
      setIsJoining(false);
    };

    socket.on('joinRoomWithEarlyJoinersResult', handleJoinRoomResult);
    socket.on('gameJoinRoomResult', handleGameJoinRoomResult);

    return () => {
      socket.off('joinRoomWithEarlyJoinersResult', handleJoinRoomResult);
      socket.off('gameJoinRoomResult', handleGameJoinRoomResult);
    };
  }, [socket]);

  return {
    joinRoom,
    joinRoomLegacy,
    isJoining,
    joinResult,
    error,
  };
};

// Hook for listening to room updates
export const useRoomUpdates = (roomId?: number) => {
  const { socket, connectionState } = useGameRoomWebSocket();
  const [roomUpdates, setRoomUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleGameJoinRoomUpdated = (data: WebSocketEvents['gameJoinRoomUpdated']) => {
      setRoomUpdates(prev => [...prev, { type: 'joinRoomUpdated', data, timestamp: new Date() }]);
    };

    const handleRoomEarlyJoinersUpdated = (data: WebSocketEvents['roomEarlyJoinersUpdated']) => {
      setRoomUpdates(prev => [...prev, { type: 'earlyJoinersUpdated', data, timestamp: new Date() }]);
    };

    socket.on('gameJoinRoomUpdated', handleGameJoinRoomUpdated);
    socket.on('roomEarlyJoinersUpdated', handleRoomEarlyJoinersUpdated);

    return () => {
      socket.off('gameJoinRoomUpdated', handleGameJoinRoomUpdated);
      socket.off('roomEarlyJoinersUpdated', handleRoomEarlyJoinersUpdated);
    };
  }, [socket, roomId]);

  const clearUpdates = useCallback(() => {
    setRoomUpdates([]);
  }, []);

  return {
    roomUpdates,
    clearUpdates,
  };
};

