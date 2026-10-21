import {
  isInsideBoard,
  MoveReasonCode,
  PieceType,
  type Move,
  type Position,
} from '@xiangqi/shared-types';
import { pieceOrNull } from './move-rules';
import { isInPalace } from './zones';

/**
 * The rules of the pieces (ENG-F02 R1 to R7). Each rule has the form of the other rules of the
 * validation: it returns `illegal_pattern` when the move breaks the pattern of its piece, or null
 * when the move passes to the next rule. A rule applies only to the piece type it is written for
 * and returns null for any other piece, so the join of ENG-F02-S10 can run all of them in turn.
 *
 * A rule never throws and does not change the position. When the source is outside the board or
 * empty, or the target is outside the board, it returns null, because `checkBoundsAndSource`
 * reports that. It does not look at the turn, at a piece on the target (`checkTurn` and
 * `checkCapture` do), at a check, or at the Flying General (later rules do).
 */

function steps(move: Move): { dx: number; dy: number } {
  return { dx: Math.abs(move.to.x - move.from.x), dy: Math.abs(move.to.y - move.from.y) };
}

/**
 * The General (ENG-F02 R1): 1 step along a file or a rank, and the target is inside the Palace of
 * its own side. A capture follows the same step (ENG-F02-S04-ASM01).
 */
export function checkGeneralMove(position: Position, move: Move): MoveReasonCode | null {
  const piece = pieceOrNull(position, move.from);
  if (piece?.type !== PieceType.GENERAL || !isInsideBoard(move.to)) return null;
  const { dx, dy } = steps(move);
  const oneStepStraight = dx + dy === 1;
  return oneStepStraight && isInPalace(move.to, piece.side) ? null : MoveReasonCode.ILLEGAL_PATTERN;
}

/**
 * The Advisor (ENG-F02 R2): 1 step on a diagonal, and the target is inside the Palace of its own
 * side.
 */
export function checkAdvisorMove(position: Position, move: Move): MoveReasonCode | null {
  const piece = pieceOrNull(position, move.from);
  if (piece?.type !== PieceType.ADVISOR || !isInsideBoard(move.to)) return null;
  const { dx, dy } = steps(move);
  const oneStepDiagonal = dx === 1 && dy === 1;
  return oneStepDiagonal && isInPalace(move.to, piece.side) ? null : MoveReasonCode.ILLEGAL_PATTERN;
}
