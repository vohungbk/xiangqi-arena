import { assertInsideBoard, type Point } from '@xiangqi/shared-types';

/**
 * The piece at a point of a board from `parseFen`. An empty point gives `''`.
 * A point outside the board throws a `BoardError` and never returns a piece (ENG-F01 E1).
 */
export function pieceAt(board: readonly (readonly string[])[], point: Point): string {
  assertInsideBoard(point);
  return board[point.y]?.[point.x] ?? '';
}
