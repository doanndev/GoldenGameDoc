# Golden Game Backend

Backend API cho ứng dụng game Golden Game được xây dựng với NestJS và TypeScript.

## Mô tả

Hệ thống backend cung cấp các API cho:
- Xác thực người dùng (Email, Telegram, Google OAuth)
- Quản lý ví HD và ví import
- Tích hợp Telegram Bot
- Hệ thống mã xác thực và bảo mật

## Backend Test URLs

- **Nhật:** https://dp7vlq3z-8000.asse.devtunnels.ms/api/v1
- **Quý:** https://k6z4r6s6-8080.asse.devtunnels.ms/api/v1

## Cài đặt dự án

```bash
$ yarn install
```

## Chạy dự án

```bash
# development
$ yarn run start:dev

# production
$ yarn run start:prod
```

## Cấu trúc dự án

```
src/
├── modules/
│   ├── auth/           # Xác thực người dùng
│   ├── users/          # Quản lý người dùng
│   ├── wallets/        # Quản lý ví
│   └── telegram-bot/   # Bot Telegram
├── shared/             # Shared modules
└── config/             # Cấu hình
```

## Công nghệ sử dụng

- **NestJS** - Framework Node.js
- **TypeScript** - Ngôn ngữ lập trình
- **TypeORM** - ORM cho database
- **PostgreSQL** - Database
- **JWT** - Xác thực
- **Telegram Bot API** - Tích hợp bot
- **Solana** - Blockchain integration

## Frontend Integration - Lottery Game

### React Hook Component cho Game Lottery

Dưới đây là React Hook component để tích hợp với WebSocket Gateway cho game xổ số:

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Types
interface LotteryGameState {
  sessionId: number | null;
  isConnected: boolean;
  isJoined: boolean;
  totalTickets: number;
  availableTickets: number[];
  selectedNumbers: number[];
  selectedNumbersWithClient: Array<{
    ticketNumber: number;
    joinId: number;
    clientInfo: {
      username: string;
      email: string;
      wallet_address: string;
    };
  }>;
  countdown: {
    timeLeft: number;
    isActive: boolean;
  };
  gameResults: {
    winningNumbers: number[];
    results: Array<{
      winningNumber: number;
      rank: number;
      percent: number;
      winner: any;
    }>;
  } | null;
  error: string | null;
  isLoading: boolean;
}

interface UseLotteryGameReturn extends LotteryGameState {
  // Actions
  connect: () => void;
  disconnect: () => void;
  joinSession: (sessionId: number) => Promise<void>;
  startSession: (sessionId: number) => Promise<void>;
  selectNumber: (ticketNumber: number) => Promise<void>;
  generateResults: () => Promise<void>;
  getSelectedNumbers: () => Promise<void>;
  
  // Status
  isAuthenticated: boolean;
  canSelectNumber: boolean;
  hasSelectedNumber: boolean;
}

export const useLotteryGame = (serverUrl: string = 'ws://localhost:3000'): UseLotteryGameReturn => {
  const [state, setState] = useState<LotteryGameState>({
    sessionId: null,
    isConnected: false,
    isJoined: false,
    totalTickets: 0,
    availableTickets: [],
    selectedNumbers: [],
    selectedNumbersWithClient: [],
    countdown: {
      timeLeft: 0,
      isActive: false
    },
    gameResults: null,
    error: null,
    isLoading: false
  });

  const socketRef = useRef<Socket | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(`${serverUrl}/lottery`, {
      transports: ['websocket', 'polling'],
      withCredentials: true, // Để gửi cookies
      autoConnect: true
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to lottery gateway');
      setState(prev => ({ ...prev, isConnected: true, error: null }));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from lottery gateway');
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isJoined: false,
        sessionId: null 
      }));
    });

    // Authentication events
    socket.on('sessionJoined', (data) => {
      console.log('Successfully joined session:', data);
      setState(prev => ({ 
        ...prev, 
        isJoined: true, 
        sessionId: data.sessionId,
        error: null 
      }));
      setIsAuthenticated(true);
    });

    // Game events
    socket.on('sessionStarted', (data) => {
      console.log('Session started:', data);
      setState(prev => ({ 
        ...prev, 
        totalTickets: data.totalTickets,
        availableTickets: data.tickets,
        error: null 
      }));
    });

    socket.on('selectNumberUpdated', (data) => {
      console.log('Selected numbers updated:', data);
      setState(prev => ({ 
        ...prev, 
        selectedNumbers: data.selectedNumbers,
        selectedNumbersWithClient: data.selectedNumbersWithClient,
        error: null 
      }));
    });

    socket.on('countdownUpdate', (data) => {
      console.log('Countdown update:', data);
      setState(prev => ({ 
        ...prev, 
        countdown: {
          timeLeft: data.timeLeft,
          isActive: data.isActive
        }
      }));
    });

    socket.on('autoSelectionCompleted', (data) => {
      console.log('Auto selection completed:', data);
      setState(prev => ({ 
        ...prev, 
        error: null 
      }));
    });

    socket.on('gameResults', (data) => {
      console.log('Game results:', data);
      setState(prev => ({ 
        ...prev, 
        gameResults: {
          winningNumbers: data.winningNumbers,
          results: data.results
        },
        error: null 
      }));
    });

    socket.on('numberSelected', (data) => {
      console.log('Number selected successfully:', data);
      setState(prev => ({ 
        ...prev, 
        error: null 
      }));
    });

    socket.on('error', (data) => {
      console.error('Lottery error:', data);
      setState(prev => ({ 
        ...prev, 
        error: data.message,
        isLoading: false 
      }));
    });

  }, [serverUrl]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setState(prev => ({ 
      ...prev, 
      isConnected: false, 
      isJoined: false,
      sessionId: null,
      selectedNumbers: [],
      selectedNumbersWithClient: [],
      gameResults: null,
      countdown: { timeLeft: 0, isActive: false }
    }));
    setIsAuthenticated(false);
  }, []);

  // Join session
  const joinSession = useCallback(async (sessionId: number) => {
    if (!socketRef.current?.connected) {
      throw new Error('Not connected to server');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    socketRef.current.emit('joinSession', { sessionId });
  }, []);

  // Start session
  const startSession = useCallback(async (sessionId: number) => {
    if (!socketRef.current?.connected) {
      throw new Error('Not connected to server');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    socketRef.current.emit('startSession', { sessionId });
  }, []);

  // Select number
  const selectNumber = useCallback(async (ticketNumber: number) => {
    if (!socketRef.current?.connected || !state.sessionId) {
      throw new Error('Not connected or not in session');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    socketRef.current.emit('selectNumber', { 
      sessionId: state.sessionId, 
      ticketNumber 
    });
  }, [state.sessionId]);

  // Generate results
  const generateResults = useCallback(async () => {
    if (!socketRef.current?.connected || !state.sessionId) {
      throw new Error('Not connected or not in session');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    socketRef.current.emit('generateResults', { sessionId: state.sessionId });
  }, [state.sessionId]);

  // Get selected numbers
  const getSelectedNumbers = useCallback(async () => {
    if (!socketRef.current?.connected || !state.sessionId) {
      throw new Error('Not connected or not in session');
    }

    socketRef.current.emit('getSelectedNumbers', { sessionId: state.sessionId });
  }, [state.sessionId]);

  // Computed properties
  const canSelectNumber = state.isConnected && state.isJoined && state.countdown.isActive;
  const hasSelectedNumber = state.selectedNumbers.length > 0;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    joinSession,
    startSession,
    selectNumber,
    generateResults,
    getSelectedNumbers,
    isAuthenticated,
    canSelectNumber,
    hasSelectedNumber
  };
};
```

### Sử dụng Hook trong Component

```typescript
import React from 'react';
import { useLotteryGame } from './hooks/useLotteryGame';

const LotteryGameComponent: React.FC = () => {
  const {
    // State
    sessionId,
    isConnected,
    isJoined,
    totalTickets,
    availableTickets,
    selectedNumbers,
    selectedNumbersWithClient,
    countdown,
    gameResults,
    error,
    isLoading,
    
    // Actions
    connect,
    disconnect,
    joinSession,
    startSession,
    selectNumber,
    generateResults,
    getSelectedNumbers,
    
    // Status
    isAuthenticated,
    canSelectNumber,
    hasSelectedNumber
  } = useLotteryGame('ws://localhost:3000');

  const handleJoinSession = async () => {
    try {
      await joinSession(1); // sessionId = 1
    } catch (err) {
      console.error('Failed to join session:', err);
    }
  };

  const handleStartSession = async () => {
    try {
      await startSession(1); // sessionId = 1
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  const handleSelectNumber = async (ticketNumber: number) => {
    try {
      await selectNumber(ticketNumber);
    } catch (err) {
      console.error('Failed to select number:', err);
    }
  };

  const handleGenerateResults = async () => {
    try {
      await generateResults();
    } catch (err) {
      console.error('Failed to generate results:', err);
    }
  };

  return (
    <div className="lottery-game">
      <h2>Lottery Game</h2>
      
      {/* Connection Status */}
      <div className="status">
        <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>Joined Session: {isJoined ? 'Yes' : 'No'}</p>
        {sessionId && <p>Session ID: {sessionId}</p>}
      </div>

      {/* Controls */}
      <div className="controls">
        {!isConnected && (
          <button onClick={connect}>Connect</button>
        )}
        
        {isConnected && !isJoined && (
          <button onClick={handleJoinSession} disabled={isLoading}>
            Join Session
          </button>
        )}
        
        {isJoined && totalTickets === 0 && (
          <button onClick={handleStartSession} disabled={isLoading}>
            Start Session
          </button>
        )}
      </div>

      {/* Game Info */}
      {totalTickets > 0 && (
        <div className="game-info">
          <h3>Game Info</h3>
          <p>Total Tickets: {totalTickets}</p>
          <p>Available Tickets: {availableTickets.join(', ')}</p>
          <p>Selected Numbers: {selectedNumbers.join(', ')}</p>
          
          {/* Countdown */}
          {countdown.isActive && (
            <div className="countdown">
              <h4>Time Left: {countdown.timeLeft}s</h4>
            </div>
          )}
        </div>
      )}

      {/* Ticket Selection */}
      {canSelectNumber && !hasSelectedNumber && (
        <div className="ticket-selection">
          <h3>Select Your Number</h3>
          <div className="tickets-grid">
            {availableTickets.map(ticket => (
              <button
                key={ticket}
                onClick={() => handleSelectNumber(ticket)}
                disabled={isLoading || selectedNumbers.includes(ticket)}
                className={`ticket-btn ${selectedNumbers.includes(ticket) ? 'selected' : ''}`}
              >
                {ticket}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Numbers Display */}
      {selectedNumbersWithClient.length > 0 && (
        <div className="selected-numbers">
          <h3>Selected Numbers</h3>
          <div className="numbers-list">
            {selectedNumbersWithClient.map((item, index) => (
              <div key={index} className="number-item">
                <span className="ticket-number">{item.ticketNumber}</span>
                <span className="client-info">
                  {item.clientInfo.username} ({item.clientInfo.wallet_address})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Results */}
      {gameResults && (
        <div className="game-results">
          <h3>Game Results</h3>
          <p>Winning Numbers: {gameResults.winningNumbers.join(', ')}</p>
          <div className="results-list">
            {gameResults.results.map((result, index) => (
              <div key={index} className="result-item">
                <span>Number {result.winningNumber} - Rank {result.rank} - {result.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="loading">
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
};

export default LotteryGameComponent;
```

### CSS Styles (Optional)

```css
.lottery-game {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.status {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.controls {
  margin-bottom: 20px;
}

.controls button {
  margin-right: 10px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.ticket-btn {
  width: 60px;
  height: 60px;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
}

.ticket-btn:hover {
  border-color: #007bff;
}

.ticket-btn.selected {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.ticket-btn:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.countdown {
  background: #ffc107;
  color: #212529;
  padding: 15px;
  border-radius: 5px;
  text-align: center;
  margin: 20px 0;
}

.countdown h4 {
  margin: 0;
  font-size: 24px;
}

.selected-numbers, .game-results {
  background: #e9ecef;
  padding: 15px;
  border-radius: 5px;
  margin: 20px 0;
}

.number-item, .result-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #dee2e6;
}

.ticket-number {
  font-weight: bold;
  color: #007bff;
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}
```

### Cài đặt Dependencies

```bash
# Frontend dependencies
npm install socket.io-client
# hoặc
yarn add socket.io-client
```

### Lưu ý quan trọng

1. **Authentication**: Hook này sử dụng cookies để xác thực, đảm bảo frontend gửi cookies trong WebSocket connection.

2. **Error Handling**: Tất cả các lỗi từ server sẽ được hiển thị trong state `error`.

3. **Real-time Updates**: Hook tự động cập nhật state khi nhận được events từ server.

4. **Session Management**: Hook quản lý trạng thái session và tự động cleanup khi component unmount.

5. **TypeScript Support**: Hook được viết với TypeScript để có type safety tốt hơn.

## License

MIT
