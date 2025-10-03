// WebSocket Event Types for Game Room Gateway

export interface WebSocketEvents {
  // Client to Server Events
  'subscribeRoomCountByGameType': number;
  'subscribeCurrentSession': number;
  'gameJoinRoom': { roomId: number };
  'getEarlyJoinersList': { roomId: number; sessionId?: number };
  'joinRoomWithEarlyJoiners': { roomId: number };

  // Server to Client Events
  'connected': {
    message: string;
    clientId: string;
    namespace: string;
    userId: number | null;
  };

  'gameRoomCounts': {
    pending: number;
    running: number;
    out: number;
    end: number;
    total: number;
    lastUpdated: string;
    error?: string;
  };

  'currentSession': {
    roomId: number;
    current_session: {
      id: number;
      status: string;
      time_start: string;
      session: string;
      participants_count: number;
      max_participants: number;
      can_join: boolean;
    } | null;
    error?: string;
  };

  'currentSessionUpdated': {
    roomId: number;
    current_session: {
      id: number;
      status: string;
      time_start: string;
      session: string;
      participants_count: number;
      max_participants: number;
      can_join: boolean;
    } | null;
  };

  'gameJoinRoomResult': {
    success?: boolean;
    roomId?: number;
    sessionId?: number;
    joinList?: EarlyJoiner[];
    error?: string;
  };

  'earlyJoinersList': {
    roomId: number;
    sessionId: number;
    earlyJoiners: EarlyJoiner[];
    totalCount: number;
  };

  'earlyJoinersListResult': {
    success?: boolean;
    roomId?: number;
    sessionId?: number;
    earlyJoiners?: EarlyJoiner[];
    totalCount?: number;
    timestamp?: string;
    error?: string;
  };

  'joinRoomWithEarlyJoinersResult': {
    success?: boolean;
    roomId?: number;
    sessionId?: number;
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
  };

  'gameJoinRoomUpdated': {
    roomId: number;
    sessionId: number;
    joinList: EarlyJoiner[];
  };

  'roomEarlyJoinersUpdated': {
    roomId: number;
    sessionId: number;
    earlyJoiners: EarlyJoiner[];
    totalCount: number;
    newJoiner: {
      user_id: number;
      username: string;
      fullname: string;
      joined_at: string;
    };
    timestamp: string;
  };
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

export interface GameRoomCounts {
  pending: number;
  running: number;
  out: number;
  end: number;
  total: number;
  lastUpdated: string;
  error?: string;
}

export interface CurrentSession {
  roomId: number;
  current_session: {
    id: number;
    status: string;
    time_start: string;
    session: string;
    participants_count: number;
    max_participants: number;
    can_join: boolean;
  } | null;
  error?: string;
}

export interface WebSocketConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  clientId: string | null;
  userId: number | null;
}
