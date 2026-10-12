import {
  assertInsideBoard,
  fenCharToPiece,
  parseFen,
  pieceToFenChar,
  START_FEN,
  toFen,
  type Piece,
  type Point,
  type Position,
} from '@xiangqi/shared-types';

/**
 * A new game in the standard WXF starting position with Red to move (ENG-F01 R7, R8).
 * Every call builds a new position, so changing one game never changes another (E8).
 */
export function createStartingPosition(): Position {
  const parsed = parseFen(START_FEN);
  return {
    board: parsed.board.map((row) =>
      row.map((cell) => (cell === '' ? null : fenCharToPiece(cell))),
    ),
    turn: parsed.turn,
    halfmoveClock: parsed.halfmoveClock,
    fullmoveNumber: parsed.fullmoveNumber,
  };
}

/**
 * The piece at a point, or null for an empty point (ENG-F01 E2).
 * A point outside the board throws a `BoardError` and never returns a piece (E1).
 */
export function getPiece(position: Position, point: Point): Piece | null {
  assertInsideBoard(point);
  return position.board[point.y]?.[point.x] ?? null;
}

/** The FEN of a position. */
export function positionToFen(position: Position): string {
  return toFen({
    board: position.board.map((row) => row.map((piece) => (piece ? pieceToFenChar(piece) : ''))),
    turn: position.turn,
    halfmoveClock: position.halfmoveClock,
    fullmoveNumber: position.fullmoveNumber,
  });
}

function samePiece(a: Piece | null, b: Piece | null): boolean {
  return a?.type === b?.type && a?.side === b?.side;
}

/** Two positions are equal when they have the same pieces and the same side to move (ENG-F01 E8). */
export function positionsEqual(a: Position, b: Position): boolean {
  if (a.turn !== b.turn) return false;
  return a.board.every((row, y) =>
    row.every((piece, x) => samePiece(piece, b.board[y]?.[x] ?? null)),
  );
}
