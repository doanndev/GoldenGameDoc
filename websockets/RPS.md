# 🎮 RPS Game Frontend - Hook & Test Page

## 📋 Tổng quan

Dự án này cung cấp một React hook (`useRpsGame`) và trang test để tương tác với game RPS (Rock-Paper-Scissors) thông qua WebSocket. Hook được thiết kế để dễ dàng tích hợp vào các ứng dụng React và cung cấp giao diện đơn giản để quản lý trạng thái game.


## 📋 Code Examples

### 🎯 useRpsGame Hook

#### Hook Code
```typescript
// src/hooks/useRpsGame.ts
// [Hook code sẽ được thêm vào đây]
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Types cho game RPS
export interface Player {
  join_id: number;
  wallet_address: string;
  username: string;
  socket_id: string;
  status: 'active' | 'eliminated' | 'left';
  wins: number;
  losses: number;
  draws: number;
  points: number;
  is_locked: boolean; // Lock người thắng - không chơi lượt tiếp theo
}

export interface GameState {
  status: 'waiting' | 'preparing' | 'running' | 'ended';
  current_turn: number;
  players: Player[];
  turn_start_time: Date;
  bot_choice: 'wait' | 'rock' | 'paper' | 'scissors';
  player_choices: Map<number, 'rock' | 'paper' | 'scissors'>;
}

export interface JoinGameRoomDto {
  room_id: number;
}

export interface PlayerChoiceDto {
  session_id: number;
  choice: 'rock' | 'paper' | 'scissors';
}

export interface GameEvents {
  'joined-game-room': {
    room_id: number;
    session_id: number;
    players: Player[];
    game_status: 'waiting' | 'preparing' | 'running' | 'ended';
    current_turn: number;
    can_play: boolean;
  };
  'player-joined': {
    room_id: number;
    session_id: number;
    player: { join_id: number; wallet_address: string; username: string; socket_id: string };
    total_players: number;
  };
  'game-starting': {
    players: Player[];
  };
  'turn-start': {
    session_id: number;
    turn_number: number;
    time_limit: number;
    players: Player[];
    bot_choice?: 'rock' | 'paper' | 'scissors';
    time_remaining?: number;
    is_reconnect?: boolean;
  };
  'bot-choice': {
    session_id: number;
    turn_number: number;
    bot_choice: 'rock' | 'paper' | 'scissors';
  };
  'player-choice-update': {
    session_id: number;
    player_id: number;
    choice: 'rock' | 'paper' | 'scissors';
    time_remaining: number;
    can_change: boolean;
    message: string;
  };
  'turn-result': {
    session_id: number;
    turn_number: number;
    bot_choice: 'rock' | 'paper' | 'scissors';
    results: Array<{
      player_id: number;
      choice: 'rock' | 'paper' | 'scissors' | 'wait';
      result: 'win' | 'lose' | 'draw';
      status: 'active' | 'eliminated' | 'left';
      can_continue: boolean;
    }>;
    player_result: {
      player_id: number;
      choice: 'rock' | 'paper' | 'scissors' | 'wait';
      result: 'win' | 'lose' | 'draw';
      status: 'active' | 'eliminated' | 'left';
      can_continue: boolean;
    };
    is_locked: boolean; // Trạng thái bị lock
    next_turn_in: number;
  };
  'game-ended': {
    session_id: number;
    winner: Player | null;
    final_rankings: Array<{
      rank: number;
      player_id: number;
      username: string;
      wallet_address: string;
      total_score: number;
      wins: number;
      losses: number;
      draws: number;
      points: number;
      status: 'active' | 'eliminated' | 'left';
      join_time: Date;
      final_choice?: 'rock' | 'paper' | 'scissors' | 'wait';
      final_result?: 'win' | 'lose' | 'draw' | 'waiting';
      final_bot_choice?: 'rock' | 'paper' | 'scissors' | 'wait';
      is_eliminated_from_previous_turn?: boolean;
      is_locked?: boolean; // Lock người thắng
    }>;
    prizes: Array<{
      rank: number;
      percent: number;
    }>;
    total_rounds: number;
  };
  'player-left': {
    player_id: number;
    players_remaining: Player[];
  };
  'error': {
    message: string;
  };
  'game-error': {
    error_type: string;
    message: string;
  };
  'new-session-created': {
    old_session_id: number;
    new_session_id: number;
    room_id: number;
    message: string;
    delay_seconds: number;
  };
  'player-turn-permission': {
    session_id: number;
    current_turn: number;
    can_play: boolean;
    message: string;
    reason: string;
    turn_update?: boolean;
    is_reconnect?: boolean;
  };
  'turn-rankings': {
    session_id: number;
    turn_number: number;
    rankings: Array<{
      rank: number;
      player_id: number;
      username: string;
      wallet_address: string;
      total_score: number;
      wins: number;
      draws: number;
      losses: number;
      points: number;
      status: 'active' | 'eliminated' | 'left';
      join_time: Date;
      current_choice?: 'rock' | 'paper' | 'scissors' | 'wait';
      current_result?: 'win' | 'lose' | 'draw' | 'waiting';
      current_bot_choice?: 'rock' | 'paper' | 'scissors' | 'wait';
      is_eliminated_from_previous_turn?: boolean;
      can_play_current_turn?: boolean;
      is_locked?: boolean; // Lock người thắng
    }>;
    turn_results: Array<{
      player_id: number;
      choice: 'rock' | 'paper' | 'scissors' | 'wait';
      result: 'win' | 'lose' | 'draw';
      status: 'active' | 'eliminated' | 'left';
      can_continue: boolean;
    }>;
    message: string;
  };
}

export interface UseRpsGameReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  
  // Game state
  gameState: GameState | null;
  currentPlayers: Player[];
  currentTurn: number;
  timeRemaining: number;
  rankings: GameEvents['turn-rankings']['rankings'];
  canPlay: boolean;
  currentTurnResults: GameEvents['turn-rankings']['turn_results'];
  playerChoices: Map<number, 'rock' | 'paper' | 'scissors'>;
  
  // Actions
  joinGameRoom: (data: JoinGameRoomDto) => void;
  makeChoice: (data: PlayerChoiceDto) => void;
  disconnect: () => void;
  
  // Event handlers
  onJoinedGameRoom: (callback: (data: GameEvents['joined-game-room']) => void) => void;
  onPlayerJoined: (callback: (data: GameEvents['player-joined']) => void) => void;
  onGameStarting: (callback: (data: GameEvents['game-starting']) => void) => void;
  onTurnStart: (callback: (data: GameEvents['turn-start']) => void) => void;
  onBotChoice: (callback: (data: GameEvents['bot-choice']) => void) => void;
  onPlayerChoiceUpdate: (callback: (data: GameEvents['player-choice-update']) => void) => void;
  onTurnResult: (callback: (data: GameEvents['turn-result']) => void) => void;
  onGameEnded: (callback: (data: GameEvents['game-ended']) => void) => void;
  onPlayerLeft: (callback: (data: GameEvents['player-left']) => void) => void;
  onError: (callback: (data: GameEvents['error']) => void) => void;
  onGameError: (callback: (data: GameEvents['game-error']) => void) => void;
  onNewSessionCreated: (callback: (data: GameEvents['new-session-created']) => void) => void;
  onPlayerTurnPermission: (callback: (data: GameEvents['player-turn-permission']) => void) => void;
  onTurnRankings: (callback: (data: GameEvents['turn-rankings']) => void) => void;
}

export const useRpsGame = (serverUrl?: string): UseRpsGameReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayers, setCurrentPlayers] = useState<Player[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [rankings, setRankings] = useState<GameEvents['turn-rankings']['rankings']>([]);
  const [canPlay, setCanPlay] = useState(false);
  const [currentTurnResults, setCurrentTurnResults] = useState<GameEvents['turn-rankings']['turn_results']>([]);
  const [playerChoices, setPlayerChoices] = useState<Map<number, 'rock' | 'paper' | 'scissors'>>(new Map());

  // Event handlers refs
  const eventHandlersRef = useRef<{
    [K in keyof GameEvents]?: (data: GameEvents[K]) => void;
  }>({});

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setIsConnecting(true);
    setError(null);

    const url = serverUrl || process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const socket = io(`${url}/rps`, {
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      withCredentials: true, // Để gửi cookies
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('🔌 Connected to RPS game server (Database mode)');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from RPS game server:', reason);
      setIsConnected(false);
      setIsConnecting(false);
    });

    socket.on('connect_error', (err) => {
      console.error('🚨 Connection error:', err);
      setError(err.message);
      setIsConnecting(false);
    });

    // Game events
    socket.on('joined-game-room', (data: GameEvents['joined-game-room']) => {
      console.log('🏠 Joined game room:', data);
      console.log(`📊 Room: ${data.room_id}, Session: ${data.session_id}, Players: ${data.players.length}, Can Play: ${data.can_play}`);
      setCurrentPlayers(data.players);
      setCurrentTurn(data.current_turn);
      setCanPlay(data.can_play);
      eventHandlersRef.current['joined-game-room']?.(data);
    });

    socket.on('player-joined', (data: GameEvents['player-joined']) => {
      console.log('👤 Player joined:', data);
      console.log(`📊 Room: ${data.room_id}, Session: ${data.session_id}, Total: ${data.total_players}`);
      setCurrentPlayers(prev => {
        const existingPlayer = prev.find(p => p.join_id === data.player.join_id);
        if (existingPlayer) {
          return prev.map(p => 
            p.join_id === data.player.join_id 
              ? { ...p, socket_id: data.player.socket_id, wallet_address: data.player.wallet_address, username: data.player.username }
              : p
          );
        } else {
          return [...prev, {
            join_id: data.player.join_id,
            wallet_address: data.player.wallet_address,
            username: data.player.username,
            socket_id: data.player.socket_id,
            status: 'active' as const,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            is_locked: false,
          }];
        }
      });
      eventHandlersRef.current['player-joined']?.(data);
    });

    socket.on('game-starting', (data: GameEvents['game-starting']) => {
      console.log('🎮 Game starting:', data);
      setCurrentPlayers(data.players);
      eventHandlersRef.current['game-starting']?.(data);
    });

    socket.on('turn-start', (data: GameEvents['turn-start']) => {
      console.log('🎯 Turn start:', data);
      setCurrentTurn(data.turn_number);
      setCurrentPlayers(data.players);
      setTimeRemaining(data.time_remaining || data.time_limit);
      // Xóa player choices và turn results cũ khi bắt đầu lượt mới
      setPlayerChoices(new Map());
      setCurrentTurnResults([]);
      eventHandlersRef.current['turn-start']?.(data);
    });

    socket.on('bot-choice', (data: GameEvents['bot-choice']) => {
      console.log('🤖 Bot choice:', data);
      eventHandlersRef.current['bot-choice']?.(data);
    });

    socket.on('player-choice-update', (data: GameEvents['player-choice-update']) => {
      console.log('✋ Player choice update:', data);
      console.log(`📊 Player ${data.player_id} chose ${data.choice}, Can change: ${data.can_change}, Message: ${data.message}`);
      setTimeRemaining(data.time_remaining);
      
      // Cập nhật player choices real-time
      setPlayerChoices(prev => {
        const newChoices = new Map(prev);
        newChoices.set(data.player_id, data.choice);
        return newChoices;
      });
      
      eventHandlersRef.current['player-choice-update']?.(data);
    });

    socket.on('turn-result', (data: GameEvents['turn-result']) => {
      console.log('🏁 Turn result:', data);
      console.log(`📊 Player result: ${data.player_result.choice} vs ${data.bot_choice} = ${data.player_result.result}, Can continue: ${data.player_result.can_continue}`);
      setCurrentPlayers(prev => 
        prev.map(player => {
          const result = data.results.find(r => r.player_id === player.join_id);
          if (result) {
            return {
              ...player,
              status: result.status,
              wins: result.result === 'win' ? player.wins + 1 : player.wins,
              losses: result.result === 'lose' ? player.losses + 1 : player.losses,
              draws: result.result === 'draw' ? player.draws + 1 : player.draws,
            };
          }
          return player;
        })
      );
      eventHandlersRef.current['turn-result']?.(data);
    });

    socket.on('game-ended', (data: GameEvents['game-ended']) => {
      console.log('🎉 Game ended:', data);
      setCurrentPlayers(prev => 
        data.final_rankings.map(ranking => 
          prev.find(p => p.join_id === ranking.player_id) || 
          { join_id: ranking.player_id, wallet_address: ranking.wallet_address, username: ranking.username, socket_id: '', status: ranking.status, wins: ranking.wins, losses: ranking.losses, draws: ranking.draws, points: ranking.points, is_locked: ranking.is_locked || false }
        )
      );
      // Đảm bảo không ai có thể chơi sau khi game kết thúc
      setCanPlay(false);
      eventHandlersRef.current['game-ended']?.(data);
    });

    socket.on('player-left', (data: GameEvents['player-left']) => {
      console.log('👋 Player left:', data);
      setCurrentPlayers(prev => 
        prev.filter(player => player.join_id !== data.player_id)
      );
      eventHandlersRef.current['player-left']?.(data);
    });

    socket.on('error', (data: GameEvents['error']) => {
      console.error('🚨 Game error:', data);
      setError(data.message);
      eventHandlersRef.current['error']?.(data);
    });

    socket.on('game-error', (data: GameEvents['game-error']) => {
      console.error('🚨 Game error:', data);
      setError(data.message);
      eventHandlersRef.current['game-error']?.(data);
    });

    socket.on('new-session-created', (data: GameEvents['new-session-created']) => {
      console.log('🆕 New session created:', data);
      console.log(`🔄 Old session: ${data.old_session_id} → New session: ${data.new_session_id} (Room: ${data.room_id}, Delay: ${data.delay_seconds}s)`);
      eventHandlersRef.current['new-session-created']?.(data);
    });

    socket.on('player-turn-permission', (data: GameEvents['player-turn-permission']) => {
      console.log('🎯 Player turn permission:', data);
      setCanPlay(data.can_play);
      eventHandlersRef.current['player-turn-permission']?.(data);
    });

    socket.on('turn-rankings', (data: GameEvents['turn-rankings']) => {
      console.log('🏆 Turn rankings:', data);
      setRankings(data.rankings);
      setCurrentTurnResults(data.turn_results);
      eventHandlersRef.current['turn-rankings']?.(data);
    });

  }, [serverUrl]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    setGameState(null);
    setCurrentPlayers([]);
    setCurrentTurn(0);
    setTimeRemaining(0);
    setRankings([]);
    setCanPlay(false);
    setCurrentTurnResults([]);
    setPlayerChoices(new Map());
  }, []);

  // Join game room
  const joinGameRoom = useCallback((data: JoinGameRoomDto) => {
    if (!socketRef.current?.connected) {
      setError('Not connected to server');
      return;
    }
    socketRef.current.emit('join-game-room', data);
  }, []);

  // Make player choice
  const makeChoice = useCallback((data: PlayerChoiceDto) => {
    if (!socketRef.current?.connected) {
      setError('Not connected to server');
      return;
    }
    socketRef.current.emit('player-choice', data);
  }, []);

  // Event handler setters
  const onJoinedGameRoom = useCallback((callback: (data: GameEvents['joined-game-room']) => void) => {
    eventHandlersRef.current['joined-game-room'] = callback;
  }, []);

  const onPlayerJoined = useCallback((callback: (data: GameEvents['player-joined']) => void) => {
    eventHandlersRef.current['player-joined'] = callback;
  }, []);

  const onGameStarting = useCallback((callback: (data: GameEvents['game-starting']) => void) => {
    eventHandlersRef.current['game-starting'] = callback;
  }, []);

  const onTurnStart = useCallback((callback: (data: GameEvents['turn-start']) => void) => {
    eventHandlersRef.current['turn-start'] = callback;
  }, []);

  const onBotChoice = useCallback((callback: (data: GameEvents['bot-choice']) => void) => {
    eventHandlersRef.current['bot-choice'] = callback;
  }, []);

  const onPlayerChoiceUpdate = useCallback((callback: (data: GameEvents['player-choice-update']) => void) => {
    eventHandlersRef.current['player-choice-update'] = callback;
  }, []);

  const onTurnResult = useCallback((callback: (data: GameEvents['turn-result']) => void) => {
    eventHandlersRef.current['turn-result'] = callback;
  }, []);

  const onGameEnded = useCallback((callback: (data: GameEvents['game-ended']) => void) => {
    eventHandlersRef.current['game-ended'] = callback;
  }, []);

  const onPlayerLeft = useCallback((callback: (data: GameEvents['player-left']) => void) => {
    eventHandlersRef.current['player-left'] = callback;
  }, []);

  const onError = useCallback((callback: (data: GameEvents['error']) => void) => {
    eventHandlersRef.current['error'] = callback;
  }, []);

  const onGameError = useCallback((callback: (data: GameEvents['game-error']) => void) => {
    eventHandlersRef.current['game-error'] = callback;
  }, []);

  const onNewSessionCreated = useCallback((callback: (data: GameEvents['new-session-created']) => void) => {
    eventHandlersRef.current['new-session-created'] = callback;
  }, []);

  const onPlayerTurnPermission = useCallback((callback: (data: GameEvents['player-turn-permission']) => void) => {
    eventHandlersRef.current['player-turn-permission'] = callback;
  }, []);

  const onTurnRankings = useCallback((callback: (data: GameEvents['turn-rankings']) => void) => {
    eventHandlersRef.current['turn-rankings'] = callback;
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    error,
    
    // Game state
    gameState,
    currentPlayers,
    currentTurn,
    timeRemaining,
    rankings,
    canPlay,
    currentTurnResults,
    playerChoices,
    
    // Actions
    joinGameRoom,
    makeChoice,
    disconnect,
    
    // Event handlers
    onJoinedGameRoom,
    onPlayerJoined,
    onGameStarting,
    onTurnStart,
    onBotChoice,
    onPlayerChoiceUpdate,
    onTurnResult,
    onGameEnded,
    onPlayerLeft,
    onError,
    onGameError,
    onNewSessionCreated,
    onPlayerTurnPermission,
    onTurnRankings,
  };
};

```

#### Test Page Code
```typescript
// src/app/test/page.tsx
// [Test page code sẽ được thêm vào đây]
'use client';

import React, { useState, useEffect } from 'react';
import { useRpsGame } from '@/hooks';

export default function TestRpsPage() {
  const {
    isConnected,
    isConnecting,
    error,
    currentPlayers,
    currentTurn,
    timeRemaining,
    rankings,
    canPlay,
    currentTurnResults,
    playerChoices,
    joinGameRoom,
    makeChoice,
    disconnect,
    onJoinedGameRoom,
    onGameStarting,
    onTurnStart,
    onBotChoice,
    onTurnResult,
    onGameEnded,
    onError,
    onNewSessionCreated,
    onPlayerTurnPermission,
    onTurnRankings,
  } = useRpsGame();

  const [roomId, setRoomId] = useState<number>(1);
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  const [selectedChoice, setSelectedChoice] = useState<'rock' | 'paper' | 'scissors' | null>(null);
  const [gameStatus, setGameStatus] = useState<string>('waiting');
  const [autoJoined, setAutoJoined] = useState<boolean>(false);
  const [botChoice, setBotChoice] = useState<'rock' | 'paper' | 'scissors' | null>(null);

  // Function to format join time
  const formatJoinTime = (joinTime: Date | string) => {
    const joinDate = new Date(joinTime);
    return joinDate.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedRoomId = localStorage.getItem('rps_room_id');
    
    if (savedRoomId) {
      setRoomId(Number(savedRoomId));
    }
  }, []);

  // Auto-load from URL parameters (override localStorage)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoomId = urlParams.get('room_id');
    
    if (urlRoomId) {
      setRoomId(Number(urlRoomId));
    }
  }, []);

  // Auto-join game when connected and not already joined
  useEffect(() => {
    if (isConnected && !autoJoined && roomId) {
      console.log('Auto-joining game...', { roomId });
      joinGameRoom({ room_id: roomId });
      setAutoJoined(true);
    }
  }, [isConnected, roomId, autoJoined, joinGameRoom]);

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem('rps_room_id', roomId.toString());
  }, [roomId]);

  // Event handlers
  useEffect(() => {
    onJoinedGameRoom((data) => {
      console.log('Joined game room:', data);
      setGameStatus(data.game_status);
      setSessionId(data.session_id);
    });

    onGameStarting((data) => {
      console.log('Game starting:', data);
      setGameStatus('preparing');
    });

    onTurnStart((data) => {
      console.log('Turn start:', data);
      setGameStatus('playing');
      setSelectedChoice(null);
      setBotChoice(data.bot_choice || null);
      console.log('Bot choice set to:', data.bot_choice);
    });

    onBotChoice((data) => {
      console.log('Bot choice event:', data);
      setBotChoice(data.bot_choice);
      console.log('Bot choice updated to:', data.bot_choice);
    });

    onTurnResult((data) => {
      console.log('Turn result:', data);
      setGameStatus('waiting');
      // Don't reset botChoice here, keep it for display
    });

    onGameEnded((data) => {
      console.log('Game ended:', data);
      setGameStatus('ended');
    });

    onError((data) => {
      console.error('Game error:', data);
    });

    onNewSessionCreated((data) => {
      console.log('New session created:', data);
      // Log thông tin session mới mà không hiển thị alert
    });

    onPlayerTurnPermission((data) => {
      console.log('Player turn permission:', data);
    });

    onTurnRankings((data) => {
      console.log('Turn rankings:', data);
    });
  }, [onJoinedGameRoom, onGameStarting, onTurnStart, onBotChoice, onTurnResult, onGameEnded, onError, onNewSessionCreated, onPlayerTurnPermission, onTurnRankings]);

  // Handle game status changes
  useEffect(() => {
    console.log('🎮 Game status changed to:', gameStatus);
    if (gameStatus === 'ended') {
      console.log('🏁 Game ended - bot choice should be visible');
    }
  }, [gameStatus]);

  // Debug bot choice changes
  useEffect(() => {
    console.log('🤖 Bot choice changed to:', botChoice);
  }, [botChoice]);

  const handleJoinGame = () => {
    if (roomId) {
      joinGameRoom({ room_id: roomId });
    }
  };

  const handleMakeChoice = (choice: 'rock' | 'paper' | 'scissors') => {
    if (sessionId) {
      makeChoice({ session_id: sessionId, choice });
      setSelectedChoice(choice);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white ">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">🎮 Rock Paper Scissors Game</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-lg">
                {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {error && <span className="text-red-400 text-lg">Error: {error}</span>}
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <div className="max-w-6xl w-full mx-auto p-8">

        {/* Game Status */}
        <div className="mb-12">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
            <h2 className="text-3xl font-bold mb-6 text-white text-center">Game Status</h2>
            
            {/* Connection & Room Info */}
            <div className="mb-8 text-center">
              {isConnected ? (
                autoJoined ? (
                  <div className="bg-green-900/20 border border-green-600 rounded-xl p-4 inline-block">
                    <p className="text-green-400 font-semibold text-lg">✅ Connected & Auto-joined!</p>
                    <p className="text-sm text-gray-400">Room {roomId} {sessionId ? `(Session ${sessionId})` : ''}</p>
                  </div>
                ) : (
                  <div className="bg-yellow-900/20 border border-yellow-600 rounded-xl p-4 inline-block">
                    <p className="text-yellow-400 font-semibold text-lg">⏳ Auto-joining...</p>
                    <p className="text-sm text-gray-400">Room {roomId}</p>
                  </div>
                )
              ) : (
                <div className="bg-red-900/20 border border-red-600 rounded-xl p-4 inline-block">
                  <p className="text-red-400 font-semibold text-lg">❌ Not connected</p>
                  <p className="text-sm text-gray-400">Waiting for connection...</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center bg-gray-700 rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">{currentTurn}</div>
                <div className="text-lg text-gray-400">Current Turn</div>
              </div>
              <div className="text-center bg-gray-700 rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">{timeRemaining}</div>
                <div className="text-lg text-gray-400">Time Remaining (s)</div>
              </div>
              <div className="text-center bg-gray-700 rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">{currentPlayers.length}</div>
                <div className="text-lg text-gray-400">Players Online</div>
              </div>
              <div className="text-center bg-gray-700 rounded-xl p-6">
                <div className={`text-4xl font-bold capitalize mb-2 ${
                  gameStatus === 'playing' ? 'text-green-400' :
                  gameStatus === 'preparing' ? 'text-yellow-400' :
                  gameStatus === 'ended' ? 'text-red-400' :
                  gameStatus === 'waiting' ? 'text-blue-400' :
                  'text-gray-400'
                }`}>
                  {gameStatus}
                </div>
                <div className="text-lg text-gray-400">Game Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Game Play Area */}
          <div className="space-y-8">
            {/* Bot Choice Display */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 text-center">
              <h3 className="text-2xl font-bold mb-6 text-white">Bot Choice</h3>
              <div className="text-8xl mb-4">
                {botChoice ? (
                  botChoice === 'rock' ? '🪨' : 
                  botChoice === 'paper' ? '📄' : '✂️'
                ) : gameStatus === 'playing' ? '❓' : 
                   gameStatus === 'ended' ? '🏁' : '⏳'}
              </div>
              <p className="text-xl text-gray-400">
                {botChoice ? `Bot chose: ${botChoice}` : 
                 gameStatus === 'ended' ? 'Game ended' : 
                 gameStatus === 'playing' ? 'Waiting for reveal...' : 
                 'Waiting for game to start...'}
              </p>
              
              {/* Time info */}
              {gameStatus === 'playing' && (
                <div className="mt-4 text-lg text-blue-400">
                  ⏱️ Turn time: 15 seconds
                </div>
              )}
              
              {/* Debug info */}
              <div className="mt-2 text-sm text-gray-500">
                Debug: botChoice = {botChoice || 'null'}, gameStatus = {gameStatus}
              </div>
            </div>

            {/* Player Choice Area */}
            {gameStatus === 'playing' && (
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
                <h3 className="text-2xl font-bold mb-8 text-white text-center">Make Your Choice</h3>
                
                {!canPlay ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">⏸️</div>
                    <p className="text-xl text-yellow-400 font-bold">You cannot play this turn</p>
                    <p className="text-sm text-gray-400 mt-2">You may have been eliminated or the game is not running</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center gap-8">
                      {(['rock', 'paper', 'scissors'] as const).map((choice) => (
                        <button
                          key={choice}
                          onClick={() => handleMakeChoice(choice)}
                          disabled={selectedChoice !== null}
                          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-6xl transition-all duration-300 ${
                            selectedChoice === choice
                              ? 'bg-green-600 text-white scale-110 shadow-2xl shadow-green-600/50'
                              : 'bg-gray-700 text-white hover:bg-gray-600 hover:scale-105 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50'
                          }`}
                        >
                          {choice === 'rock' ? '🪨' : choice === 'paper' ? '📄' : '✂️'}
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 text-center">
                      <p className="text-lg text-gray-400 mb-2">Choose: Rock, Paper, or Scissors</p>
                      {selectedChoice && (
                        <div className="bg-green-900/30 border border-green-600 rounded-xl p-4">
                          <p className="text-green-400 font-bold text-xl">You chose: {selectedChoice}</p>
                          <p className="text-sm text-gray-400 mt-1">Waiting for other players...</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Game Starting Countdown */}
            {gameStatus === 'preparing' && (
              <div className="bg-yellow-900/20 border-2 border-yellow-600 rounded-2xl p-8 text-center">
                <div className="text-6xl font-bold text-yellow-400 mb-4">3</div>
                <p className="text-2xl text-yellow-300">Game starting in...</p>
              </div>
            )}

            {/* Game Ended */}
            {gameStatus === 'ended' && (
              <div className="bg-red-900/20 border-2 border-red-600 rounded-2xl p-8 text-center">
                <div className="text-6xl font-bold text-red-400 mb-4">🏁</div>
                <p className="text-2xl text-red-300">Game Ended</p>
              </div>
            )}
          </div>

          {/* Players List */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
            <h3 className="text-2xl font-bold mb-6 text-white">Players ({currentPlayers.length})</h3>
            <div className="space-y-4">
              {currentPlayers.map((player, index) => (
                <div key={player.join_id} className={`flex items-center justify-between p-6 rounded-xl border-2 ${
                  player.status === 'active' ? 'bg-green-900/20 border-green-600' :
                  player.status === 'eliminated' ? 'bg-red-900/20 border-red-600' :
                  'bg-gray-700 border-gray-600'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                      player.status === 'active' ? 'bg-green-600 text-white' :
                      player.status === 'eliminated' ? 'bg-red-600 text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">Player {player.username}</div>
                      <div className="text-lg text-gray-400">{player.wallet_address.slice(0, 12)}...</div>
                    </div>
                  </div>
                  <div className="flex gap-6 text-lg">
                    <div className="text-center">
                      <div className="text-green-400 font-bold text-2xl">{player.wins}</div>
                      <div className="text-sm text-gray-400">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 font-bold text-2xl">{player.losses}</div>
                      <div className="text-sm text-gray-400">Losses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold text-2xl">{player.draws}</div>
                      <div className="text-sm text-gray-400">Draws</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Rankings Panel */}
        <div className="mt-12">
          <div className="bg-gray-900 rounded-2xl border border-gray-600 p-8">
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
              🏆 Live Rankings
              <span className="text-sm bg-gray-700 px-3 py-1 rounded-full text-gray-300">
                Turn {currentTurn}
              </span>
            </h3>
            
            {rankings.length > 0 ? (
              <div className="space-y-4">
                {rankings.map((player: any, index: number) => (
                  <div key={player.player_id} className={`bg-gray-800 rounded-xl p-6 border-2 ${
                    index === 0 ? 'border-yellow-500 bg-yellow-900/10' :
                    index === 1 ? 'border-gray-400 bg-gray-800/50' :
                    index === 2 ? 'border-orange-600 bg-orange-900/10' :
                    'border-gray-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white">{player.username}</div>
                          <div className="text-sm text-gray-400">ID: {player.player_id}</div>
                          <div className="text-xs text-gray-500">
                            Joined: {formatJoinTime(player.join_time)}
                          </div>
                        </div>
                      </div>
                      
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{player.total_score}</div>
                            <div className="text-xs text-gray-400">Total Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-400">{player.wins}</div>
                            <div className="text-xs text-gray-400">Wins (+2)</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-400">{player.draws}</div>
                            <div className="text-xs text-gray-400">Draws (+1)</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-400">{player.losses}</div>
                            <div className="text-xs text-gray-400">Losses</div>
                          </div>
                          
                          {/* Current choice indicator - show wait if no choice yet */}
                          <div className="text-center">
                            <div className="text-2xl">
                              {player.current_choice === 'rock' ? '🪨' : 
                               player.current_choice === 'paper' ? '📄' : 
                               player.current_choice === 'scissors' ? '✂️' : '⏳'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {player.current_choice === 'wait' || !player.current_choice ? 'Waiting' : 'Current Choice'}
                            </div>
                          </div>
                          
                          {/* Current result indicator - show waiting if no result yet */}
                          <div className="text-center">
                            <div className={`text-lg font-bold ${
                              player.current_result === 'win' ? 'text-green-400' :
                              player.current_result === 'lose' ? 'text-red-400' :
                              player.current_result === 'draw' ? 'text-yellow-400' :
                              'text-gray-400'
                            }`}>
                              {player.current_result === 'waiting' || !player.current_result ? 'WAITING' : player.current_result.toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-400">Current Result</div>
                          </div>

                          {/* Bot choice indicator - show wait if no choice yet */}
                          <div className="text-center">
                            <div className="text-2xl">
                              {player.current_bot_choice === 'rock' ? '🪨' : 
                               player.current_bot_choice === 'paper' ? '📄' : 
                               player.current_bot_choice === 'scissors' ? '✂️' : '⏳'}
                            </div>
                            <div className="text-xs text-purple-400">
                              {player.current_bot_choice === 'wait' || !player.current_bot_choice ? 'Bot Waiting' : 'Bot Choice'}
                            </div>
                          </div>

                          {/* Live choice from playerChoices state */}
                          {gameStatus === 'playing' && (
                            <div className="text-center">
                              <div className="text-2xl">
                                {playerChoices.has(player.player_id) ? (
                                  playerChoices.get(player.player_id) === 'rock' ? '🪨' : 
                                  playerChoices.get(player.player_id) === 'paper' ? '📄' : '✂️'
                                ) : '⏳'}
                              </div>
                              <div className="text-xs text-blue-400">
                                {playerChoices.has(player.player_id) ? 'Live Choice' : 'Live Waiting'}
                              </div>
                            </div>
                          )}

                          {/* Turn result from currentTurnResults */}
                          {gameStatus === 'playing' && currentTurnResults.length > 0 && (
                            (() => {
                              const turnResult = currentTurnResults.find(r => r.player_id === player.player_id);
                              if (turnResult) {
                                return (
                                  <div className="text-center">
                                    <div className={`text-lg font-bold ${
                                      turnResult.result === 'win' ? 'text-green-400' :
                                      turnResult.result === 'lose' ? 'text-red-400' :
                                      'text-yellow-400'
                                    }`}>
                                      {turnResult.result.toUpperCase()}
                                    </div>
                                    <div className="text-xs text-gray-400">Turn Result</div>
                                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                                      turnResult.can_continue ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                    }`}>
                                      {turnResult.can_continue ? 'CONTINUE' : 'ELIMINATED'}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()
                          )}
                          
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            player.status === 'active' ? 'bg-green-600 text-white' :
                            player.status === 'eliminated' ? 'bg-red-600 text-white' :
                            'bg-gray-600 text-gray-300'
                          }`}>
                            {player.status}
                          </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-xl text-gray-400">No rankings available yet</p>
                <p className="text-sm text-gray-500 mt-2">Rankings will appear after the first turn</p>
              </div>
            )}
          </div>
        </div>

        {/* Disconnect Button */}
        <div className="mt-12 text-center">
          <button 
            onClick={disconnect}
            className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-xl font-bold"
          >
            Disconnect
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

```

---

## 🎯 useRpsGame Hook

### Import và sử dụng cơ bản

```typescript
import { useRpsGame } from '@/hooks/useRpsGame';

function MyGameComponent() {
  const {
    // Connection state
    isConnected,
    isConnecting,
    error,
    
    // Game state
    currentPlayers,
    currentTurn,
    timeRemaining,
    rankings,
    canPlay,
    currentTurnResults,
    playerChoices,
    
    // Actions
    joinGameRoom,
    makeChoice,
    disconnect,
    
    // Event handlers
    onJoinedGameRoom,
    onPlayerJoined,
    onGameStarting,
    onTurnStart,
    onBotChoice,
    onPlayerChoiceUpdate,
    onTurnResult,
    onGameEnded,
    onPlayerLeft,
    onError,
    onGameError,
    onNewSessionCreated,
    onPlayerTurnPermission,
    onTurnRankings,
  } = useRpsGame();
}
```

### 🔌 Connection State

| Property | Type | Mô tả |
|----------|------|-------|
| `isConnected` | `boolean` | Trạng thái kết nối WebSocket |
| `isConnecting` | `boolean` | Đang trong quá trình kết nối |
| `error` | `string \| null` | Lỗi kết nối (nếu có) |

### 🎮 Game State

| Property | Type | Mô tả |
|----------|------|-------|
| `currentPlayers` | `Player[]` | Danh sách người chơi hiện tại |
| `currentTurn` | `number` | Số lượt chơi hiện tại |
| `timeRemaining` | `number` | Thời gian còn lại (giây) |
| `rankings` | `Ranking[]` | Bảng xếp hạng real-time |
| `canPlay` | `boolean` | Có thể chơi lượt hiện tại |
| `currentTurnResults` | `TurnResult[]` | Kết quả lượt chơi hiện tại |
| `playerChoices` | `Map<number, Choice>` | Lựa chọn real-time của players |

### 🎯 Actions

#### `joinGameRoom(data: JoinGameRoomDto)`
Tham gia vào phòng game.

```typescript
// Tham gia phòng với room_id
joinGameRoom({ room_id: 15 });
```

#### `makeChoice(data: PlayerChoiceDto)`
Thực hiện lựa chọn trong game.

```typescript
// Chọn kéo
makeChoice({ 
  session_id: 1773, 
  choice: 'scissors' 
});
```

#### `disconnect()`
Ngắt kết nối WebSocket.

```typescript
disconnect();
```

### 📡 Event Handlers

Hook cung cấp các callback setters để xử lý events:

```typescript
// Xử lý khi tham gia phòng thành công
onJoinedGameRoom((data) => {
  console.log('Joined room:', data);
  console.log('Can play:', data.can_play);
});

// Xử lý khi người chơi khác tham gia
onPlayerJoined((data) => {
  console.log('Player joined:', data.player.username);
});

// Xử lý khi game bắt đầu
onGameStarting((data) => {
  console.log('Game starting with players:', data.players);
});

// Xử lý khi lượt chơi bắt đầu
onTurnStart((data) => {
  console.log('Turn started:', data.turn_number);
  console.log('Time limit:', data.time_limit);
});

// Xử lý khi bot chọn
onBotChoice((data) => {
  console.log('Bot chose:', data.bot_choice);
});

// Xử lý cập nhật lựa chọn người chơi
onPlayerChoiceUpdate((data) => {
  console.log('Player choice update:', data);
});

// Xử lý kết quả lượt chơi
onTurnResult((data) => {
  console.log('Turn result:', data.player_result);
});

// Xử lý khi game kết thúc
onGameEnded((data) => {
  console.log('Game ended!');
  console.log('Winner:', data.winner);
  console.log('Final rankings:', data.final_rankings);
});

// Xử lý khi người chơi rời phòng
onPlayerLeft((data) => {
  console.log('Player left:', data.player_id);
});

// Xử lý lỗi
onError((data) => {
  console.error('Game error:', data.message);
});

// Xử lý session mới được tạo
onNewSessionCreated((data) => {
  console.log('New session created:', data.new_session_id);
});

// Xử lý quyền chơi
onPlayerTurnPermission((data) => {
  console.log('Can play:', data.can_play);
  console.log('Reason:', data.reason);
});

// Xử lý bảng xếp hạng
onTurnRankings((data) => {
  console.log('Rankings updated:', data.rankings);
});
```

## 🎨 Test Page (`/test`)

### Tính năng chính

1. **Kết nối WebSocket tự động**
2. **Giao diện tham gia phòng**
3. **Hiển thị trạng thái game real-time**
4. **Bảng xếp hạng live**
5. **Khu vực chọn lựa chọn**
6. **Thông tin debug chi tiết**

### Cách sử dụng

1. Truy cập `/test` trong trình duyệt
2. Nhập `Room ID` (ví dụ: 15)
3. Click "Join Game Room"
4. Chờ game bắt đầu và chọn lựa chọn của bạn

### Giao diện

#### 🏠 Game Status Panel
- Hiển thị trạng thái kết nối
- Thông tin phòng và session
- Trạng thái game hiện tại
- Thời gian còn lại

#### 👥 Players List
- Danh sách người chơi với username
- Trạng thái của từng người chơi
- Thống kê wins/losses/draws

#### 🏆 Live Rankings
- Bảng xếp hạng real-time
- Hiển thị lựa chọn hiện tại
- Kết quả lượt chơi
- Thời gian tham gia

#### 🎯 Player Choice Area
- Buttons chọn Rock/Paper/Scissors
- Chỉ hiển thị khi `canPlay = true`
- Hiển thị lựa chọn đã chọn

## 🔧 Cấu hình

### Environment Variables

```env
NEXT_PUBLIC_WS_URL=http://localhost:8000
```

### WebSocket Connection

Hook tự động kết nối đến WebSocket server với cấu hình:

### Game Events

Hook hỗ trợ tất cả events từ backend:

- `joined-game-room`
- `player-joined`
- `game-starting`
- `turn-start`
- `bot-choice`
- `player-choice-update`
- `turn-result`
- `game-ended`
- `player-left`
- `error`
- `game-error`
- `new-session-created`
- `player-turn-permission`
- `turn-rankings`

## 🎮 Game Logic

### Quy tắc chơi

1. **Rock** thắng **Scissors**
2. **Paper** thắng **Rock**
3. **Scissors** thắng **Paper**
4. Cùng lựa chọn = **Draw**

### Hệ thống điểm

- **Thắng**: +2 điểm, +1 win
- **Hòa**: +1 điểm, +1 draw
- **Thua**: +0 điểm, +1 loss

### Lock System

- Khi có đúng 1 người thắng và có ít nhất 1 người hòa
- Người thắng bị lock và tự động nhận điểm mỗi lượt
- Người bị lock không thể chọn lựa chọn nữa

### Tình huống đặc biệt

- **Tất cả thua**: Tất cả được phép chơi tiếp
- **Tất cả không chọn**: Game kết thúc
- **Chỉ còn 1 người**: Game kết thúc

## 🚨 Error Handling

Hook tự động xử lý các lỗi phổ biến:

- Kết nối WebSocket thất bại
- Authentication lỗi
- Game đã kết thúc
- Không có quyền tham gia
- Player đã bị loại

