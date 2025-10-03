import { useCallback, useEffect, useState } from 'react';
import { 
  useGameRoomWebSocket, 
  useRoomCounts, 
  useCurrentSession, 
  useEarlyJoiners, 
  useJoinRoom, 
  useRoomUpdates 
} from './useGameRoomWebSocket';
import { EarlyJoiner, GameRoomCounts, CurrentSession } from '../types/websocket-events.types';

interface UseGameRoomOptions {
  roomId?: number;
  sessionId?: number;
  gameTypeId?: number;
  autoConnect?: boolean;
}

export const useGameRoom = (options: UseGameRoomOptions = {}) => {
  const { roomId, sessionId, gameTypeId, autoConnect = true } = options;
  
  // WebSocket connection
  const { socket, connectionState, connect, disconnect } = useGameRoomWebSocket();
  
  // Individual hooks
  const roomCounts = useRoomCounts(gameTypeId);
  const currentSession = useCurrentSession(roomId);
  const earlyJoiners = useEarlyJoiners(roomId, sessionId);
  const joinRoom = useJoinRoom();
  const roomUpdates = useRoomUpdates(roomId);

  // Auto-connect when component mounts
  useEffect(() => {
    if (autoConnect && !connectionState.isConnected && !connectionState.isConnecting) {
      connect();
    }
  }, [autoConnect, connectionState.isConnected, connectionState.isConnecting, connect]);

  // Join room function with early joiners
  const joinRoomWithEarlyJoiners = useCallback((targetRoomId?: number) => {
    const id = targetRoomId || roomId;
    if (id) {
      joinRoom.joinRoom(id);
    }
  }, [joinRoom, roomId]);

  // Join room function (legacy)
  const joinRoomLegacy = useCallback((targetRoomId?: number) => {
    const id = targetRoomId || roomId;
    if (id) {
      joinRoom.joinRoomLegacy(id);
    }
  }, [joinRoom, roomId]);

  // Refresh early joiners
  const refreshEarlyJoiners = useCallback(() => {
    earlyJoiners.getEarlyJoinersList();
  }, [earlyJoiners]);

  // Refresh current session
  const refreshCurrentSession = useCallback(() => {
    if (roomId) {
      currentSession.subscribeToCurrentSession();
    }
  }, [currentSession, roomId]);

  // Refresh room counts
  const refreshRoomCounts = useCallback(() => {
    if (gameTypeId) {
      roomCounts.subscribeToRoomCounts();
    }
  }, [roomCounts, gameTypeId]);

  return {
    // Connection state
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    connectionError: connectionState.error,
    userId: connectionState.userId,
    clientId: connectionState.clientId,

    // Socket instance
    socket,

    // Connection methods
    connect,
    disconnect,

    // Room counts
    roomCounts: roomCounts.roomCounts,
    isRoomCountsLoading: roomCounts.isLoading,
    refreshRoomCounts,

    // Current session
    currentSession: currentSession.currentSession,
    isCurrentSessionLoading: currentSession.isLoading,
    refreshCurrentSession,

    // Early joiners
    earlyJoiners: earlyJoiners.earlyJoiners,
    earlyJoinersTotalCount: earlyJoiners.totalCount,
    isEarlyJoinersLoading: earlyJoiners.isLoading,
    earlyJoinersError: earlyJoiners.error,
    refreshEarlyJoiners,

    // Join room
    joinRoom: joinRoomWithEarlyJoiners,
    joinRoomLegacy,
    isJoining: joinRoom.isJoining,
    joinResult: joinRoom.joinResult,
    joinError: joinRoom.error,

    // Room updates
    roomUpdates: roomUpdates.roomUpdates,
    clearRoomUpdates: roomUpdates.clearUpdates,

    // Utility methods
    refreshAll: useCallback(() => {
      refreshRoomCounts();
      refreshCurrentSession();
      refreshEarlyJoiners();
    }, [refreshRoomCounts, refreshCurrentSession, refreshEarlyJoiners]),
  };
};

// Hook for specific room operations
export const useRoomOperations = (roomId: number) => {
  const gameRoom = useGameRoom({ roomId, autoConnect: true });

  return {
    ...gameRoom,
    // Room-specific operations
    joinThisRoom: () => gameRoom.joinRoom(roomId),
    joinThisRoomLegacy: () => gameRoom.joinRoomLegacy(roomId),
    refreshThisRoom: () => {
      gameRoom.refreshCurrentSession();
      gameRoom.refreshEarlyJoiners();
    },
  };
};

// Hook for game type operations
export const useGameTypeOperations = (gameTypeId: number) => {
  const gameRoom = useGameRoom({ gameTypeId, autoConnect: true });

  return {
    ...gameRoom,
    // Game type-specific operations
    refreshThisGameType: () => gameRoom.refreshRoomCounts(),
  };
};

// Hook for monitoring multiple rooms
export const useMultiRoomMonitor = (roomIds: number[]) => {
  const [roomsData, setRoomsData] = useState<Record<number, any>>({});

  // This would need to be implemented based on your specific needs
  // For now, return a basic structure
  return {
    roomsData,
    refreshAllRooms: () => {
      // Implementation for refreshing multiple rooms
    },
  };
};

