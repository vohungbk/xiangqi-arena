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
