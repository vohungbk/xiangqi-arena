import {
  isInsideBoard,
  MoveReasonCode,
  type Move,
  type Piece,
  type Position,
} from '@xiangqi/shared-types';
import { getPiece } from './position';

/**
 * The first rule of the validation of a move (ENG-F02 R10): the source and the target are
 * inside the 9x10 board, the source holds a piece, and the move goes somewhere.
 *
 * It returns the reason code when the move is refused, or null when the move passes to the
 * next rule. It does not change the position, does not throw, and does not check the turn or
 * the pattern of the piece (later rules do). The checks run in this order:
 * 1. A point outside the board is `out_of_bounds` (E3).
 * 2. A source with no piece is `empty_source` (E1).
 * 3. A source equal to the target is `same_point`.
 */
export function checkBoundsAndSource(position: Position, move: Move): MoveReasonCode | null {
  if (!isInsideBoard(move.from) || !isInsideBoard(move.to)) return MoveReasonCode.OUT_OF_BOUNDS;
  if (getPiece(position, move.from) === null) return MoveReasonCode.EMPTY_SOURCE;
  if (move.from.x === move.to.x && move.from.y === move.to.y) return MoveReasonCode.SAME_POINT;
  return null;
}

/**
 * The piece at a point, or null when the point is outside the board or empty. The rules below
 * use it so that they never throw: a bad point is reported by `checkBoundsAndSource`.
 */
function pieceOrNull(position: Position, point: Move['from']): Piece | null {
  return isInsideBoard(point) ? getPiece(position, point) : null;
}

/**
 * The turn rule (ENG-F02 R8, E2): the piece that moves belongs to the side to move.
 *
 * It returns `wrong_turn` when the piece is of the other side, or null when the move passes to
 * the next rule. It returns null when the source is outside the board or empty, because
 * `checkBoundsAndSource` reports that. It does not change the position and does not throw.
 */
export function checkTurn(position: Position, move: Move): MoveReasonCode | null {
  const moving = pieceOrNull(position, move.from);
  if (moving && moving.side !== position.turn) return MoveReasonCode.WRONG_TURN;
  return null;
}

/**
 * The capture rule (ENG-F02 R9, E4): the target is empty or holds a piece of the opponent.
 *
 * It returns `own_piece` when the target holds a piece of the same side as the piece that
 * moves, or null when the move passes to the next rule (an empty target and a capture of an
 * opponent piece both pass). It returns null when a point is outside the board or the source is
 * empty, because `checkBoundsAndSource` reports that. It does not change the position and does
 * not throw.
 *
 * In the chain of rules it comes after `checkTurn`, so a piece of the wrong side that also
 * lands on its own piece is `wrong_turn`.
 */
export function checkCapture(position: Position, move: Move): MoveReasonCode | null {
  const moving = pieceOrNull(position, move.from);
  const target = pieceOrNull(position, move.to);
  if (moving && target && target.side === moving.side) return MoveReasonCode.OWN_PIECE;
  return null;
}
