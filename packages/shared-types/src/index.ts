/* =========================================================================
 * @xiangqi/shared-types
 * Enums, WebSocket protocol, FEN utils, WXF constants and Elo helpers
 * shared by apps/web and apps/server.
 * ========================================================================= */

/* ----------------------------- Enums ----------------------------------- */

/** Three independent rating pools. Time control is "base minutes + increment seconds". */
export enum GameMode {
  BLITZ = 'BLITZ', // 3+2
  RAPID = 'RAPID', // 10+0
  CLASSIC = 'CLASSIC', // 15+10
}

export enum GameResult {
  RED_WIN = 'RED_WIN',
  BLACK_WIN = 'BLACK_WIN',
  DRAW = 'DRAW',
  ABORTED = 'ABORTED',
}

export enum GameEndReason {
  CHECKMATE = 'CHECKMATE',
  STALEMATE = 'STALEMATE',
  TIMEOUT = 'TIMEOUT',
  RESIGN = 'RESIGN',
  DRAW_AGREEMENT = 'DRAW_AGREEMENT',
  DISCONNECT = 'DISCONNECT',
  PERPETUAL_CHECK = 'PERPETUAL_CHECK',
  PERPETUAL_CHASE = 'PERPETUAL_CHASE',
  REPETITION = 'REPETITION',
  NO_PROGRESS = 'NO_PROGRESS',
  ABANDONED_EARLY = 'ABANDONED_EARLY',
}

export enum Side {
  RED = 'RED',
  BLACK = 'BLACK',
}

/** Client -> Server and Server -> Client WebSocket event names. */
export enum WSEvents {
  // Auth / connection
  AUTH_CONNECT = 'AUTH_CONNECT',
  AUTH_OK = 'AUTH_OK',
  AUTH_ERROR = 'AUTH_ERROR',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',

  // Game lifecycle
  CLIENT_READY = 'CLIENT_READY',
  GAME_START = 'GAME_START',
  GAME_END = 'GAME_END',
  MOVE = 'MOVE',
  MOVE_ACK = 'MOVE_ACK',
  INVALID_MOVE = 'INVALID_MOVE',
  SYNC_STATE = 'SYNC_STATE',
  RESIGN = 'RESIGN',

  // Draw / takeback
  DRAW_OFFER = 'DRAW_OFFER',
  DRAW_RESPONSE = 'DRAW_RESPONSE',
  TAKEBACK_REQUEST = 'TAKEBACK_REQUEST',
  TAKEBACK_RESPONSE = 'TAKEBACK_RESPONSE',
  TAKEBACK_SUCCESS = 'TAKEBACK_SUCCESS',

  // Disconnect handling
  OPPONENT_DISCONNECTED = 'OPPONENT_DISCONNECTED',
  OPPONENT_RECONNECTED = 'OPPONENT_RECONNECTED',

  // Rating
  RATING_UPDATE = 'RATING_UPDATE',

  // Matchmaking / rooms
  MATCH_QUEUE_JOIN = 'MATCH_QUEUE_JOIN',
  MATCH_QUEUE_LEAVE = 'MATCH_QUEUE_LEAVE',
  MATCH_FOUND = 'MATCH_FOUND',
  MATCH_READY_CHECK = 'MATCH_READY_CHECK',
  MATCH_READY_ACCEPT = 'MATCH_READY_ACCEPT',
  MATCH_TIMEOUT_FALLBACK_AI = 'MATCH_TIMEOUT_FALLBACK_AI',
  ROOM_CREATE = 'ROOM_CREATE',
  ROOM_JOIN = 'ROOM_JOIN',
  ROOM_JOINED = 'ROOM_JOINED',
  ROOM_ERROR = 'ROOM_ERROR',
}

export enum RatingKFactor {
  PROVISIONAL = 40,
  NORMAL = 20,
  MASTER = 10,
}

/* ------------------------ Game / Rating constants ---------------------- */

export interface TimeControl {
  /** Base time in milliseconds. */
  baseMs: number;
  /** Increment per move in milliseconds. */
  incrementMs: number;
}

export const TIME_CONTROLS: Record<GameMode, TimeControl> = {
  [GameMode.BLITZ]: { baseMs: 3 * 60_000, incrementMs: 2_000 },
  [GameMode.RAPID]: { baseMs: 10 * 60_000, incrementMs: 0 },
  [GameMode.CLASSIC]: { baseMs: 15 * 60_000, incrementMs: 10_000 },
};

export const RATING = {
  BASE: 1500,
  FLOOR: 100,
  PROVISIONAL_GAMES: 10,
  MASTER_THRESHOLD: 2400,
  /** Below this many plies per side the early-abandon asymmetric penalty applies. */
  MIN_PLIES_PER_SIDE_FOR_ELO: 5,
} as const;

export const DISCONNECT = {
  WINDOW_MS: 45_000,
  TOTAL_BUDGET_MS_PER_GAME: 90_000,
} as const;

export const MATCHMAKING = {
  INITIAL_WINDOW: 50,
  WINDOW_STEP: 50,
  WINDOW_STEP_INTERVAL_MS: 5_000,
  MAX_WINDOW: 300,
  QUEUE_TIMEOUT_MS: 60_000,
  READY_CHECK_MS: 12_000,
} as const;

export const ROOM = {
  CODE_LENGTH: 6,
  /** Base32 alphabet without 0, O, 1, I. */
  CODE_ALPHABET: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  TTL_MS: 15 * 60_000,
  MAX_FAILED_ENTRIES: 5,
  FAILED_ENTRY_WINDOW_MS: 10 * 60_000,
} as const;

export const USERNAME = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  /** ASCII letters, digits, underscore. */
  PATTERN: /^[A-Za-z0-9_]{3,20}$/,
  CHANGE_COOLDOWN_MS: 30 * 24 * 60 * 60_000,
} as const;

export const AI_LOCAL_STORAGE = {
  KEY: 'xiangqi-arena:ai-game',
  MAX_AGE_MS: 24 * 60 * 60_000,
} as const;

/** Shape of the single AI game persisted in local storage. */
export interface StoredAiGame {
  fen: string;
  moves: string[];
  playerSide: Side;
  level: number;
  savedAt: number;
}

/* ------------------------------ WXF rules ------------------------------ */

/** Constants for WXF (World Xiangqi Federation) repetition rules. */
export const WXF = {
  /** Same position occurring this many times triggers repetition adjudication. */
  REPETITION_LIMIT: 3,
  /** Consecutive plies without capture before a "no progress" draw (60 moves each side). */
  NO_PROGRESS_PLIES: 120,
} as const;

/* ------------------------------ FEN utils ------------------------------ */

export const START_FEN = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1';

export interface ParsedFen {
  /** 10 rows (top = black side), each 9 cells; empty string = empty square. */
  board: string[][];
  turn: Side;
  halfmoveClock: number;
  fullmoveNumber: number;
}

export function parseFen(fen: string): ParsedFen {
  const parts = fen.trim().split(/\s+/);
  const placement = parts[0];
  if (!placement) throw new Error('Invalid FEN: empty placement');
  const rows = placement.split('/');
  if (rows.length !== 10) throw new Error('Invalid FEN: expected 10 rows');

  const board = rows.map((row) => {
    const cells: string[] = [];
    for (const ch of row) {
      if (/[1-9]/.test(ch)) {
        for (let i = 0; i < Number(ch); i++) cells.push('');
      } else if (/[rnbakcpRNBAKCP]/.test(ch)) {
        cells.push(ch);
      } else {
        throw new Error(`Invalid FEN: unknown piece "${ch}"`);
      }
    }
    if (cells.length !== 9) throw new Error('Invalid FEN: each row needs 9 files');
    return cells;
  });

  return {
    board,
    turn: parts[1] === 'b' ? Side.BLACK : Side.RED,
    halfmoveClock: Number(parts[4] ?? 0),
    fullmoveNumber: Number(parts[5] ?? 1),
  };
}

export function toFen(state: ParsedFen): string {
  const placement = state.board
    .map((row) => {
      let out = '';
      let empty = 0;
      for (const cell of row) {
        if (cell === '') {
          empty++;
        } else {
          if (empty) out += String(empty);
          empty = 0;
          out += cell;
        }
      }
      if (empty) out += String(empty);
      return out;
    })
    .join('/');
  const turn = state.turn === Side.BLACK ? 'b' : 'w';
  return `${placement} ${turn} - - ${state.halfmoveClock} ${state.fullmoveNumber}`;
}

/* ------------------------------ Elo helpers ---------------------------- */

export function getKFactor(rating: number, gamesPlayed: number): RatingKFactor {
  if (gamesPlayed < RATING.PROVISIONAL_GAMES) return RatingKFactor.PROVISIONAL;
  return rating >= RATING.MASTER_THRESHOLD ? RatingKFactor.MASTER : RatingKFactor.NORMAL;
}

export function expectedScore(rating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - rating) / 400));
}

/**
 * Multiplier for Elo change by the number of rated games the same pair
 * played in the rolling 24h window (1-based index of the game being scored).
 */
export function getDailyPairMultiplier(gameIndexInWindow: number): number {
  if (gameIndexInWindow <= 3) return 1;
  if (gameIndexInWindow <= 5) return 0.5;
  return 0;
}

export interface EloInput {
  rating: number;
  gamesPlayed: number;
  /** 1 = win, 0.5 = draw, 0 = loss. */
  score: 0 | 0.5 | 1;
  opponentRating: number;
  /** Multiplier from {@link getDailyPairMultiplier}. */
  pairMultiplier?: number;
}

/** Returns the Elo delta (rounded) for one player, applying the floor. */
export function calculateEloDelta(input: EloInput): number {
  const k = getKFactor(input.rating, input.gamesPlayed);
  const raw =
    k *
    (input.score - expectedScore(input.rating, input.opponentRating)) *
    (input.pairMultiplier ?? 1);
  const next = Math.max(RATING.FLOOR, Math.round(input.rating + raw));
  return next - input.rating;
}

/** True when a player's early quit/resign is penalised and the opponent gets +0. */
export function isEarlyAbandon(pliesPerSide: number): boolean {
  return pliesPerSide < RATING.MIN_PLIES_PER_SIDE_FOR_ELO;
}

/* --------------------------- Room code helper -------------------------- */

export function isValidRoomCode(code: string): boolean {
  if (code.length !== ROOM.CODE_LENGTH) return false;
  return [...code].every((ch) => ROOM.CODE_ALPHABET.includes(ch));
}

/* --------------------- WebSocket protocol interfaces ------------------- */

export interface WSEnvelope<E extends WSEvents, P> {
  event: E;
  payload: P;
  /** Client-generated id echoed back in acks. */
  requestId?: string;
}

export interface AuthConnectPayload {
  /** Access token passed in the first message, never in the URL. */
  accessToken: string;
}
export interface AuthOkPayload {
  userId: string;
  username: string;
  /** Milliseconds until the access token expires, for auto-refresh. */
  expiresInMs: number;
}
export interface AuthErrorPayload {
  code: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'ORIGIN_NOT_ALLOWED';
  message: string;
}
export interface TokenRefreshPayload {
  refreshToken: string;
}
export interface TokenRefreshedPayload {
  accessToken: string;
  expiresInMs: number;
}

export interface ClientReadyPayload {
  gameId: string;
}

export interface MovePayload {
  gameId: string;
  /** UCCI move, e.g. "h2e2". */
  move: string;
  /** Client move sequence number, used for ack and idempotency. */
  seq: number;
}
export interface MoveAckPayload {
  gameId: string;
  seq: number;
  fen: string;
  redTimeMs: number;
  blackTimeMs: number;
  serverTs: number;
}
export interface InvalidMovePayload {
  gameId: string;
  seq: number;
  reason: 'ILLEGAL_MOVE' | 'NOT_YOUR_TURN' | 'GAME_OVER' | 'SELF_CHECK' | 'REPETITION_VIOLATION';
  /** Authoritative state to roll the client back to. */
  fen: string;
}

export interface SyncStatePayload {
  gameId: string;
  fen: string;
  moves: string[];
  turn: Side;
  redTimeMs: number;
  blackTimeMs: number;
  mode: GameMode;
  serverTs: number;
  disconnectBudgetLeftMs: { RED: number; BLACK: number };
}

export interface GameStartPayload {
  gameId: string;
  mode: GameMode;
  rated: boolean;
  side: Side;
  opponent: { userId: string; username: string; rating: number };
  fen: string;
  redTimeMs: number;
  blackTimeMs: number;
}
export interface GameEndPayload {
  gameId: string;
  result: GameResult;
  reason: GameEndReason;
}

export interface TakebackRequestPayload {
  gameId: string;
}
export interface TakebackResponsePayload {
  gameId: string;
  accept: boolean;
}
export interface TakebackSuccessPayload {
  gameId: string;
  fen: string;
  moves: string[];
  turn: Side;
  redTimeMs: number;
  blackTimeMs: number;
}

export interface DrawOfferPayload {
  gameId: string;
}
export interface DrawResponsePayload {
  gameId: string;
  accept: boolean;
}
export interface ResignPayload {
  gameId: string;
}

export interface OpponentDisconnectedPayload {
  gameId: string;
  /** Remaining window after subtracting the silence delay before the drop was detected. */
  windowMs: number;
  budgetLeftMs: number;
}
export interface OpponentReconnectedPayload {
  gameId: string;
}

export interface RatingUpdatePayload {
  gameId: string;
  mode: GameMode;
  oldRating: number;
  newRating: number;
  delta: number;
  provisional: boolean;
  /** Set when delta was reduced or zeroed by the daily pair limit or early-abandon rule. */
  adjustment?: 'DAILY_PAIR_LIMIT' | 'EARLY_ABANDON_PENALTY' | 'EARLY_ABANDON_NO_GAIN';
}

export interface MatchQueueJoinPayload {
  mode: GameMode;
}
export interface MatchFoundPayload {
  matchId: string;
  mode: GameMode;
  opponent: { username: string; rating: number };
  readyDeadlineTs: number;
}
export interface MatchReadyAcceptPayload {
  matchId: string;
}
export interface MatchTimeoutFallbackAiPayload {
  mode: GameMode;
}

export interface RoomCreatePayload {
  mode: GameMode;
}
export interface RoomJoinPayload {
  code: string;
}
export interface RoomJoinedPayload {
  code: string;
  gameId: string;
  expiresAtTs: number;
}
export interface RoomErrorPayload {
  code: 'ROOM_NOT_FOUND' | 'ROOM_EXPIRED' | 'ROOM_FULL' | 'TOO_MANY_ATTEMPTS';
  retryAfterMs?: number;
}

/** Maps every event to its payload for typed emit/on helpers. */
export interface WSEventPayloadMap {
  [WSEvents.AUTH_CONNECT]: AuthConnectPayload;
  [WSEvents.AUTH_OK]: AuthOkPayload;
  [WSEvents.AUTH_ERROR]: AuthErrorPayload;
  [WSEvents.TOKEN_REFRESH]: TokenRefreshPayload;
  [WSEvents.TOKEN_REFRESHED]: TokenRefreshedPayload;
  [WSEvents.CLIENT_READY]: ClientReadyPayload;
  [WSEvents.GAME_START]: GameStartPayload;
  [WSEvents.GAME_END]: GameEndPayload;
  [WSEvents.MOVE]: MovePayload;
  [WSEvents.MOVE_ACK]: MoveAckPayload;
  [WSEvents.INVALID_MOVE]: InvalidMovePayload;
  [WSEvents.SYNC_STATE]: SyncStatePayload;
  [WSEvents.RESIGN]: ResignPayload;
  [WSEvents.DRAW_OFFER]: DrawOfferPayload;
  [WSEvents.DRAW_RESPONSE]: DrawResponsePayload;
  [WSEvents.TAKEBACK_REQUEST]: TakebackRequestPayload;
  [WSEvents.TAKEBACK_RESPONSE]: TakebackResponsePayload;
  [WSEvents.TAKEBACK_SUCCESS]: TakebackSuccessPayload;
  [WSEvents.OPPONENT_DISCONNECTED]: OpponentDisconnectedPayload;
  [WSEvents.OPPONENT_RECONNECTED]: OpponentReconnectedPayload;
  [WSEvents.RATING_UPDATE]: RatingUpdatePayload;
  [WSEvents.MATCH_QUEUE_JOIN]: MatchQueueJoinPayload;
  [WSEvents.MATCH_QUEUE_LEAVE]: Record<string, never>;
  [WSEvents.MATCH_FOUND]: MatchFoundPayload;
  [WSEvents.MATCH_READY_CHECK]: MatchFoundPayload;
  [WSEvents.MATCH_READY_ACCEPT]: MatchReadyAcceptPayload;
  [WSEvents.MATCH_TIMEOUT_FALLBACK_AI]: MatchTimeoutFallbackAiPayload;
  [WSEvents.ROOM_CREATE]: RoomCreatePayload;
  [WSEvents.ROOM_JOIN]: RoomJoinPayload;
  [WSEvents.ROOM_JOINED]: RoomJoinedPayload;
  [WSEvents.ROOM_ERROR]: RoomErrorPayload;
}
