import React, { useEffect, useState } from 'react';
import { useGameRoom, useRoomOperations, useGameTypeOperations } from '../hooks/useGameRoom';
import { EarlyJoiner } from '../types/websocket-events.types';

// Example 1: Basic Game Room Usage
export const BasicGameRoomExample: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    connectionError,
    userId,
    connect,
    disconnect,
  } = useGameRoom({ autoConnect: true });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">WebSocket Connection Status</h2>
      
      <div className="space-y-2">
        <p>Status: {isConnected ? '🟢 Connected' : isConnecting ? '🟡 Connecting' : '🔴 Disconnected'}</p>
        <p>User ID: {userId || 'Not authenticated'}</p>
        {connectionError && <p className="text-red-500">Error: {connectionError}</p>}
      </div>

      <div className="mt-4 space-x-2">
        <button 
          onClick={connect} 
          disabled={isConnected || isConnecting}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Connect
        </button>
        <button 
          onClick={disconnect} 
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};

// Example 2: Room Counts by Game Type
export const RoomCountsExample: React.FC<{ gameTypeId: number }> = ({ gameTypeId }) => {
  const {
    roomCounts,
    isRoomCountsLoading,
    refreshRoomCounts,
  } = useGameRoom({ gameTypeId });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Room Counts (Game Type: {gameTypeId})</h2>
      
      {isRoomCountsLoading ? (
        <p>Loading room counts...</p>
      ) : roomCounts ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-100 p-3 rounded">
            <p className="font-semibold">Pending: {roomCounts.pending}</p>
          </div>
          <div className="bg-green-100 p-3 rounded">
            <p className="font-semibold">Running: {roomCounts.running}</p>
          </div>
          <div className="bg-orange-100 p-3 rounded">
            <p className="font-semibold">Out: {roomCounts.out}</p>
          </div>
          <div className="bg-red-100 p-3 rounded">
            <p className="font-semibold">End: {roomCounts.end}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded col-span-2">
            <p className="font-semibold">Total: {roomCounts.total}</p>
          </div>
        </div>
      ) : (
        <p>No room counts available</p>
      )}

      <button 
        onClick={refreshRoomCounts}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh Counts
      </button>
    </div>
  );
};

// Example 3: Current Session for a Room
export const CurrentSessionExample: React.FC<{ roomId: number }> = ({ roomId }) => {
  const {
    currentSession,
    isCurrentSessionLoading,
    refreshCurrentSession,
  } = useGameRoom({ roomId });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Current Session (Room: {roomId})</h2>
      
      {isCurrentSessionLoading ? (
        <p>Loading current session...</p>
      ) : currentSession?.current_session ? (
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Session ID:</strong> {currentSession.current_session.id}</p>
          <p><strong>Status:</strong> {currentSession.current_session.status}</p>
          <p><strong>Time Start:</strong> {new Date(currentSession.current_session.time_start).toLocaleString()}</p>
          <p><strong>Participants:</strong> {currentSession.current_session.participants_count}/{currentSession.current_session.max_participants}</p>
          <p><strong>Can Join:</strong> {currentSession.current_session.can_join ? 'Yes' : 'No'}</p>
        </div>
      ) : (
        <p>No active session</p>
      )}

      <button 
        onClick={refreshCurrentSession}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh Session
      </button>
    </div>
  );
};

// Example 4: Early Joiners List
export const EarlyJoinersExample: React.FC<{ roomId: number; sessionId?: number }> = ({ roomId, sessionId }) => {
  const {
    earlyJoiners,
    earlyJoinersTotalCount,
    isEarlyJoinersLoading,
    earlyJoinersError,
    refreshEarlyJoiners,
  } = useGameRoom({ roomId, sessionId });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Early Joiners (Room: {roomId})</h2>
      
      {earlyJoinersError && (
        <p className="text-red-500 mb-4">Error: {earlyJoinersError}</p>
      )}

      {isEarlyJoinersLoading ? (
        <p>Loading early joiners...</p>
      ) : (
        <div>
          <p className="mb-4">Total: {earlyJoinersTotalCount} participants</p>
          
          <div className="space-y-2">
            {earlyJoiners.map((joiner: EarlyJoiner, index: number) => (
              <div key={joiner.user_id} className="bg-gray-100 p-3 rounded flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{joiner.username}</p>
                  <p className="text-sm text-gray-600">{joiner.fullname}</p>
                  <p className="text-xs text-gray-500">
                    Joined: {new Date(joiner.joined_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${joiner.amount}</p>
                  <p className="text-xs text-gray-500">{joiner.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={refreshEarlyJoiners}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh Joiners
      </button>
    </div>
  );
};

// Example 5: Join Room with Early Joiners
export const JoinRoomExample: React.FC<{ roomId: number }> = ({ roomId }) => {
  const {
    joinRoom,
    joinRoomLegacy,
    isJoining,
    joinResult,
    joinError,
  } = useGameRoom({ roomId });

  const handleJoinRoom = () => {
    joinRoom(roomId);
  };

  const handleJoinRoomLegacy = () => {
    joinRoomLegacy(roomId);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Join Room (Room: {roomId})</h2>
      
      {joinError && (
        <p className="text-red-500 mb-4">Error: {joinError}</p>
      )}

      {joinResult && (
        <div className="bg-green-100 p-4 rounded mb-4">
          <p className="font-semibold">Successfully joined room!</p>
          <p>Session ID: {joinResult.sessionId}</p>
          {joinResult.earlyJoiners && (
            <p>Early joiners: {joinResult.earlyJoiners.length}</p>
          )}
        </div>
      )}

      <div className="space-x-2">
        <button 
          onClick={handleJoinRoom}
          disabled={isJoining}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          {isJoining ? 'Joining...' : 'Join Room (with Early Joiners)'}
        </button>
        
        <button 
          onClick={handleJoinRoomLegacy}
          disabled={isJoining}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {isJoining ? 'Joining...' : 'Join Room (Legacy)'}
        </button>
      </div>
    </div>
  );
};

// Example 6: Room Updates Monitor
export const RoomUpdatesExample: React.FC<{ roomId: number }> = ({ roomId }) => {
  const {
    roomUpdates,
    clearRoomUpdates,
  } = useGameRoom({ roomId });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Room Updates (Room: {roomId})</h2>
      
      <div className="mb-4">
        <button 
          onClick={clearRoomUpdates}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear Updates
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {roomUpdates.length === 0 ? (
          <p className="text-gray-500">No updates yet</p>
        ) : (
          roomUpdates.map((update, index) => (
            <div key={index} className="bg-gray-100 p-3 rounded">
              <p className="font-semibold">{update.type}</p>
              <p className="text-sm text-gray-600">
                {new Date(update.timestamp).toLocaleString()}
              </p>
              <pre className="text-xs mt-2 overflow-x-auto">
                {JSON.stringify(update.data, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Example 7: Complete Room Operations
export const CompleteRoomExample: React.FC<{ roomId: number; gameTypeId: number }> = ({ roomId, gameTypeId }) => {
  const roomOps = useRoomOperations(roomId);
  const gameTypeOps = useGameTypeOperations(gameTypeId);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Complete Room Operations</h1>
      
      {/* Connection Status */}
      <BasicGameRoomExample />
      
      {/* Room Counts */}
      <RoomCountsExample gameTypeId={gameTypeId} />
      
      {/* Current Session */}
      <CurrentSessionExample roomId={roomId} />
      
      {/* Early Joiners */}
      <EarlyJoinersExample roomId={roomId} />
      
      {/* Join Room */}
      <JoinRoomExample roomId={roomId} />
      
      {/* Room Updates */}
      <RoomUpdatesExample roomId={roomId} />
    </div>
  );
};
