import type { Point } from './board';
import type { Piece, Side } from './pieces';

/**
 * A position of a game (ENG-F01 R9): the piece at each point and the side to move.
 * It also holds the half-move counter and the full-move number, which the FEN needs (Q5).
 * History is not stored here.
 */
export interface Position {
  /** 10 rows from the Black side (y = 0) to the Red side, each with 9 points. null is empty. */
  board: (Piece | null)[][];
  turn: Side;
  halfmoveClock: number;
  fullmoveNumber: number;
}

/** A piece that reports its type, its side and its point (ENG-F01 R13). */
export interface PlacedPiece extends Piece {
  point: Point;
}

/** One point of a position and what is on it. `piece` is null for an empty point (E2). */
export interface PointReading {
  point: Point;
  piece: PlacedPiece | null;
}

/**
 * The result of a move (ENG-F01 R10, R12): the new position and the piece that was captured.
 * `captured` has its type, side and point, so Replay and the UI show a capture without a
 * second lookup. It is null when the move does not capture.
 */
export interface MoveResult {
  position: Position;
  captured: PlacedPiece | null;
}

/**
 * What `createPosition` builds a position from: a list of pieces and the side to move.
 * The counters default to 0 and 1.
 */
export interface PositionInput {
  pieces: readonly PlacedPiece[];
  turn: Side;
  halfmoveClock?: number;
  fullmoveNumber?: number;
}
