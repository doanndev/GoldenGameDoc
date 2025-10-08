# WebSocket Module - Real-time Wallet Balance Tracking

Module WebSocket để theo dõi số dư ví Solana theo thời gian thực với cập nhật giá token tự động.

## 🚀 Tính năng

- **Real-time Balance Tracking**: Theo dõi số dư SOL và SPL tokens theo thời gian thực
- **Multi-source Price Updates**: Lấy giá từ Raydium, CoinGecko, và DexScreener
- **Automatic Price Caching**: Cache giá 3 giây để tối ưu performance
- **WebSocket Connection Management**: Quản lý kết nối client tự động
- **Error Handling & Retry**: Xử lý lỗi và retry mechanism cho RPC calls

## 📁 Cấu trúc

```
websockets/
├── wallet-balance.gateway.ts    # WebSocket Gateway chính
├── websocket.module.ts          # Module configuration
└── README.md                    # Documentation
```

## 🔧 Cài đặt

### Dependencies

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io
npm install @solana/web3.js @solana/spl-token
npm install axios
```

### Environment Variables

```env
SOLANA_RPC_URL=https://your-rpc-url.com
SOLANA_WSS_URL=wss://your-wss-url.com
```

## 🎯 Sử dụng

### 1. React Hook (Recommended)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface TokenBalance {
  amount: number;
  priceUSD: number;
  valueUSD: number;
}

interface BalanceData {
  walletAddress: string;
  sol: TokenBalance;
  [key: string]: TokenBalance | string | number;
  totalValueUSD: number;
}

interface UseWebSocketBalanceOptions {
  walletAddress?: string;
  tokenMints?: string;
  autoConnect?: boolean;
  enableLogs?: boolean;
}

export const useWebSocketBalance = (options: UseWebSocketBalanceOptions = {}) => {
  const {
    walletAddress = '',
    tokenMints = '',
    autoConnect = true,
    enableLogs = false
  } = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLog = useCallback((message: string, isError = false) => {
    if (!enableLogs) return;
    
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    
    if (isError) {
      setError(message);
    }
  }, [enableLogs]);

  const connect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io('http://localhost:8000/balance', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      addLog('✅ Connected to WebSocket server');
      
      // Auto subscribe if wallet address and token mints are provided
      if (walletAddress && tokenMints) {
        const mints = tokenMints.split(',').map(mint => mint.trim()).filter(Boolean);
        
        // Subscribe to balance updates
        newSocket.emit('subscribeBalance', {
          walletAddress: walletAddress.trim(),
          tokenMints: mints
        });
        
        // Subscribe to price updates
        newSocket.emit('subscribePrice', {
          tokenMints: mints
        });
        
        addLog(`🔔 Auto-subscribed to balance for wallet: ${walletAddress}`);
        addLog(`📈 Auto-subscribed to price updates`);
        addLog(`🪙 Token mints: ${mints.join(', ')}`);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      addLog('❌ Disconnected from WebSocket server');
    });

    newSocket.on('balanceUpdate', (data: BalanceData) => {
      setBalanceData(data);
      addLog(`💰 Balance updated for ${data.walletAddress}`);
    });

    newSocket.on('priceUpdate', (data: any) => {
      setPriceData(data);
      addLog(`📈 Price updated`);
    });

    newSocket.on('error', (error: { message: string }) => {
      addLog(`❌ Error: ${error.message}`, true);
    });

    setSocket(newSocket);
  }, [walletAddress, tokenMints, addLog]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const subscribeBalance = useCallback((walletAddr: string, mints: string[] = []) => {
    if (!socket || !isConnected) {
      addLog('❌ Not connected to server', true);
      return;
    }

    socket.emit('subscribeBalance', {
      walletAddress: walletAddr.trim(),
      tokenMints: mints
    });

    socket.emit('subscribePrice', {
      tokenMints: mints
    });

    addLog(`🔔 Subscribed to balance for wallet: ${walletAddr}`);
    addLog(`📈 Subscribed to price updates`);
    addLog(`🪙 Token mints: ${mints.join(', ')}`);
  }, [socket, isConnected, addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Auto connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [autoConnect, connect]);

  // Reconnect when walletAddress or tokenMints change
  useEffect(() => {
    if (autoConnect && (walletAddress || tokenMints)) {
      connect();
    }
  }, [walletAddress, tokenMints, autoConnect, connect]);

  return {
    // State
    socket,
    isConnected,
    balanceData,
    priceData,
    logs,
    error,
    
    // Actions
    connect,
    disconnect,
    subscribeBalance,
    clearLogs,
    
    // Utilities
    addLog,
  };
};

```

### 2. Sử dụng Hook trong Component

```typescript
"use client";

import { useState } from 'react';
import Head from 'next/head';
import { useWebSocketBalance } from '@/hooks/useWebSocketBalance';

interface TokenBalance {
  amount: number;
  priceUSD: number;
  valueUSD: number;
}

interface BalanceData {
  walletAddress: string;
  sol: TokenBalance;
  [key: string]: TokenBalance | string | number;
  totalValueUSD: number;
}

export default function WebSocketTest() {
  const [walletAddress, setWalletAddress] = useState('EbMmX3wPCGQvpaLfFLHAKtPn9T9JjrHc1CdaxyJ5Ef6z');
  const [tokenMints, setTokenMints] = useState('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN,5c74v6Px9RKwdGWCfqLGfEk7UZfE3Y4qJbuYrLbVG63V,GJZJsDnJaqGuGxgARRYNhzBWEzfST4sngHKLP2nppump');

  // Use the custom hook
  const { isConnected, balanceData, priceData, logs, error, subscribeBalance, disconnect, clearLogs } = useWebSocketBalance({
    walletAddress,
    tokenMints,
    autoConnect: true,
    enableLogs: true,
  });

  const handleSubscribe = () => {
    const mints = tokenMints.split(',').map(mint => mint.trim()).filter(Boolean);
    subscribeBalance(walletAddress, mints);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 12
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 12
    }).format(value);
  };

  return (
    <>
      <Head>
        <title>WebSocket Balance Test</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              🚀 WebSocket Balance Test
            </h1>

            {/* Connection Status */}
            <div className={`p-4 rounded-lg mb-6 ${
              isConnected 
                ? 'bg-green-100 border border-green-300 text-green-800' 
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-semibold">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            {/* Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Solana wallet address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Server Status
                </label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                  <span className="text-sm text-gray-600">
                    Connected to: http://localhost:8000/balance
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Mints (comma separated)
              </label>
              <input
                type="text"
                value={tokenMints}
                onChange={(e) => setTokenMints(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN,5c74v6Px9RKwdGWCfqLGfEk7UZfE3Y4qJbuYrLbVG63V,GJZJsDnJaqGuGxgARRYNhzBWEzfST4sngHKLP2nppump"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleSubscribe}
                disabled={!isConnected}
                className={`px-6 py-3 rounded-lg font-medium ${
                  isConnected
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                �� Subscribe to Balance
              </button>
              
              <button
                onClick={disconnect}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Disconnect
              </button>

              <button
                onClick={clearLogs}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                Clear Logs
              </button>
            </div>

            {/* Balance Display */}
            {balanceData && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  💰 Wallet Balance
                </h2>
                
                <div className="space-y-4">
                  {/* SOL Balance */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-gray-800">SOL</span>
                        <p className="text-sm text-gray-600">
                          {formatNumber(balanceData.sol.amount)} SOL
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(balanceData.sol.valueUSD)}
                        </p>
                        <p className="text-sm text-gray-500">
                          @ {formatCurrency(balanceData.sol.priceUSD)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Other Tokens */}
                  {Object.entries(balanceData).map(([key, value]) => {
                    if (key === 'walletAddress' || key === 'sol' || key === 'totalValueUSD') return null;
                    
                    const token = value as TokenBalance;
                    return (
                      <div key={key} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-gray-800">
                              {key.substring(0, 8)}...
                            </span>
                            <p className="text-sm text-gray-600">
                              {formatNumber(token.amount)} tokens
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(token.valueUSD)}
                            </p>
                            <p className="text-sm text-gray-500">
                              @ {formatCurrency(token.priceUSD)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Total Value */}
                  <div className="bg-blue-600 text-white rounded-lg p-4 text-center">
                    <p className="text-sm opacity-90">Total Portfolio Value</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(balanceData.totalValueUSD)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Price Display */}
            {priceData && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  📈 Price Updates
                </h2>
                <pre className="bg-white rounded-lg p-4 border border-gray-200 overflow-auto max-h-64 text-sm">
                  {JSON.stringify(priceData, null, 2)}
                </pre>
              </div>
            )}

            {/* Logs */}
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 max-h-64 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-3 text-white">📝 Logs</h3>
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

### 3. Vanilla JavaScript

```javascript
const socket = io('ws://localhost:8000/balance', {
  transports: ['websocket', 'polling']
});

// Subscribe Balance
socket.emit('subscribeBalance', {
  walletAddress: 'EbMmX3wPCGQvpaLfFLHAKtPn9T9JjrHc1CdaxyJ5Ef6z',
  tokenMints: [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'  // BONK
  ]
});

// Listen to Events
socket.on('balanceUpdate', (data) => {
  console.log('Balance updated:', data);
  // {
  //   walletAddress: 'EbMmX3wPCGQvpaLfFLHAKtPn9T9JjrHc1CdaxyJ5Ef6z',
  //   sol: { amount: 0.5, priceUSD: 247.50, valueUSD: 123.75 },
  //   'EPjFWdd5...': { amount: 100, priceUSD: 1.0, valueUSD: 100 },
  //   totalValueUSD: 223.75
  // }
});

socket.on('priceUpdate', (data) => {
  console.log('Price updated:', data);
  // {
  //   walletAddress: 'EbMmX3wPCGQvpaLfFLHAKtPn9T9JjrHc1CdaxyJ5Ef6z',
  //   prices: {
  //     'So11111111111111111111111111111111111111112': 247.50, // SOL
  //     'EPjFWdd5...': 1.0, // USDC
  //     'DezXAZ8z...': 0.00043 // BONK
  //   },
  //   timestamp: 1758248280660
  // }
});
```

## 📊 API Events

### Client → Server

| Event | Payload | Mô tả |
|-------|---------|-------|
| `subscribeBalance` | `{ walletAddress: string, tokenMints?: string[] }` | Đăng ký theo dõi số dư ví |

### Server → Client

| Event | Payload | Mô tả |
|-------|---------|-------|
| `balanceUpdate` | `{ walletAddress: string, sol: {...}, [tokenMint]: {...}, totalValueUSD: number }` | Cập nhật số dư ví |
| `priceUpdate` | `{ walletAddress: string, prices: {...}, timestamp: number }` | Cập nhật giá token |

## ⚙️ Cấu hình

### WebSocket Gateway

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io',
  namespace: '/balance'
})
```

### Price Update Interval

- **Interval**: 3 giây
- **Cache Duration**: 3 giây
- **Sources**: Raydium → CoinGecko → DexScreener

### Supported Tokens

#### Hardcoded Mappings (CoinGecko)
- **SOL**: `So11111111111111111111111111111111111111112`
- **USDC**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **USDT**: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`
- **BONK**: `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`
- **mSOL**: `mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So`
- **ETH (Wormhole)**: `7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs`

#### Dynamic Tokens
- Tất cả token mints mà client đăng ký
- Được fetch từ Raydium/DexScreener APIs

## 🔄 Luồng hoạt động

1. **Client kết nối** → WebSocket connection established
2. **Subscribe balance** → Client gửi `subscribeBalance` event
3. **Initial balance** → Server fetch và gửi số dư ban đầu
4. **Real-time tracking** → Subscribe Solana logs và token account changes
5. **Price updates** → Cập nhật giá mỗi 3 giây
6. **Balance updates** → Gửi cập nhật khi có thay đổi số dư
7. **Cleanup** → Tự động cleanup khi client disconnect

## 🛠️ Error Handling

- **RPC Retry**: 3 lần retry với exponential backoff
- **API Fallback**: Raydium → CoinGecko → DexScreener
- **Connection Cleanup**: Tự động cleanup disconnected clients
- **Rate Limiting**: Xử lý RPC rate limits

## 📈 Performance

- **Price Caching**: 3 giây cache để giảm API calls
- **Connection Pooling**: Quản lý WebSocket connections hiệu quả
- **Memory Management**: Tự động cleanup unused subscriptions
- **Error Recovery**: Graceful error handling và recovery

## 🔍 Debugging

### Logs
- Client connect/disconnect
- Balance updates
- Price updates
- Error messages

### Monitoring
- Active connections count
- Subscribed wallets count
- Price update frequency
- Error rates

## 🚨 Lưu ý

1. **RPC Limits**: Có thể gặp rate limit với RPC provider
2. **Memory Usage**: Monitor memory usage với nhiều connections
3. **API Limits**: Respect API rate limits của price sources
4. **Network**: Đảm bảo stable network connection

## 📝 Changelog

### v1.0.0
- Initial release
- Real-time balance tracking
- Multi-source price updates
- WebSocket connection management
- Error handling & retry mechanism
