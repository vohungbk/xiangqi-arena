import {
  allPoints,
  assertInsideBoard,
  fenCharToPiece,
  parseFen,
  pieceToFenChar,
  START_FEN,
  toFen,
  type Piece,
  type PlacedPiece,
  type Point,
  type PointReading,
  type Position,
} from '@xiangqi/shared-types';

function copyPiece(piece: Piece): Piece {
  return { type: piece.type, side: piece.side };
}

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
 * It returns a copy, so changing it never changes the position (E5).
 * A point outside the board throws a `BoardError` and never returns a piece (E1).
 */
export function getPiece(position: Position, point: Point): Piece | null {
  assertInsideBoard(point);
  const piece = position.board[point.y]?.[point.x];
  return piece ? copyPiece(piece) : null;
}

/**
 * The piece at a point with its type, side and point (ENG-F01 R13), or null for an empty point.
 * It returns a copy. A point outside the board throws a `BoardError`.
 */
export function readPoint(position: Position, point: Point): PlacedPiece | null {
  const piece = getPiece(position, point);
  return piece ? { ...piece, point: { x: point.x, y: point.y } } : null;
}

/** All 90 points of the board, from the Black side, with the piece on each (ENG-F01 R9, R1). */
export function readAllPoints(position: Position): PointReading[] {
  return allPoints().map((point) => ({ point, piece: readPoint(position, point) }));
}

/** A deep copy of a position. Changing the copy never changes the original (ENG-F01 E5). */
export function clonePosition(position: Position): Position {
  return {
    board: position.board.map((row) => row.map((piece) => (piece ? copyPiece(piece) : null))),
    turn: position.turn,
    halfmoveClock: position.halfmoveClock,
    fullmoveNumber: position.fullmoveNumber,
  };
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
