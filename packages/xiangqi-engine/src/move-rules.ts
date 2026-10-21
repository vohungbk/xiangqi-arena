import { isInsideBoard, MoveReasonCode, type Move, type Position } from '@xiangqi/shared-types';
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
