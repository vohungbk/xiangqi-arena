import {
  allPoints,
  assertInsideBoard,
  BOARD,
  BoardError,
  BoardErrorCode,
  fenCharToPiece,
  parseFen,
  pieceToFenChar,
  Side,
  START_FEN,
  toFen,
  type Move,
  type MoveResult,
  type Piece,
  type PlacedPiece,
  type Point,
  type PointReading,
  type Position,
  type PositionInput,
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

/**
 * Apply a move that ENG-F02 already accepted and return a new position (ENG-F01 R10).
 * It is `applyMoveWithCapture` without the capture record.
 */
export function applyMove(position: Position, move: Move): Position {
  return applyMoveWithCapture(position, move).position;
}

/**
 * Apply a move that ENG-F02 already accepted and return the new position and the captured
 * piece (ENG-F01 R10, R12).
 *
 * The piece moves to the target point, the piece there (if any) is removed and reported in
 * `captured` with its type, side and point, and the side to move switches. The half-move clock
 * goes back to 0 on a capture and grows by 1 otherwise. The full-move number grows by 1 after
 * a Black move. The given position is not changed (E5).
 *
 * The engine does not check the rules of a piece (ENG-F02 does). It refuses a move that would
 * damage the position and throws a `BoardError`, and the position is left as it was (R11):
 * - `POINT_OUT_OF_BOARD`: a point outside the board (E1)
 * - `MOVE_FROM_EMPTY_POINT`: no piece on the point the move starts from (E3)
 * - `MOVE_OUT_OF_TURN`: the piece is of the side that is not to move
 * - `MOVE_ONTO_OWN_PIECE`: the target holds a piece of the same side (E4)
 */
export function applyMoveWithCapture(position: Position, move: Move): MoveResult {
  const moving = getPiece(position, move.from);
  const target = getPiece(position, move.to);
  if (!moving) {
    throw new BoardError(
      BoardErrorCode.MOVE_FROM_EMPTY_POINT,
      `There is no piece on (${move.from.x}, ${move.from.y})`,
    );
  }
  if (moving.side !== position.turn) {
    throw new BoardError(BoardErrorCode.MOVE_OUT_OF_TURN, `It is not the turn of ${moving.side}`);
  }
  if (target && target.side === moving.side) {
    throw new BoardError(
      BoardErrorCode.MOVE_ONTO_OWN_PIECE,
      `The target (${move.to.x}, ${move.to.y}) holds a piece of the same side`,
    );
  }

  const next = clonePosition(position);
  const fromRow = next.board[move.from.y];
  const toRow = next.board[move.to.y];
  if (fromRow) fromRow[move.from.x] = null;
  if (toRow) toRow[move.to.x] = moving;
  next.turn = position.turn === Side.RED ? Side.BLACK : Side.RED;
  next.halfmoveClock = target ? 0 : position.halfmoveClock + 1;
  next.fullmoveNumber =
    position.turn === Side.BLACK ? position.fullmoveNumber + 1 : position.fullmoveNumber;
  return {
    position: next,
    captured: target ? { ...target, point: { x: move.to.x, y: move.to.y } } : null,
  };
}

/**
 * Build a position from a list of pieces (ENG-F01-S10).
 *
 * The engine represents a position and does not judge it. A position with no General, with 3
 * Cannons for one side, with a General outside the Palace or with two Generals facing each
 * other is built like any other (E6, E7). ENG-F04 validates a position when it loads a FEN
 * (Q4); do not rely on this function to refuse a position that breaks the rules of the game.
 *
 * It refuses only what cannot be represented, with a `BoardError`: a point outside the board
 * (`POINT_OUT_OF_BOARD`) and two pieces on the same point (`POINT_OCCUPIED`). The counters are
 * taken as they are. The list and the pieces are copied, so changing them later does not
 * change the position. Pass the type and the side through `parsePieceType` and `parseSide`
 * first when they come from outside.
 */
export function createPosition(input: PositionInput): Position {
  const board: (Piece | null)[][] = Array.from({ length: BOARD.RANKS }, () =>
    Array.from({ length: BOARD.FILES }, () => null),
  );
  for (const piece of input.pieces) {
    assertInsideBoard(piece.point);
    const row = board[piece.point.y];
    if (!row) continue;
    if (row[piece.point.x]) {
      throw new BoardError(
        BoardErrorCode.POINT_OCCUPIED,
        `There are two pieces on (${piece.point.x}, ${piece.point.y})`,
      );
    }
    row[piece.point.x] = { type: piece.type, side: piece.side };
  }
  return {
    board,
    turn: input.turn,
    halfmoveClock: input.halfmoveClock ?? 0,
    fullmoveNumber: input.fullmoveNumber ?? 1,
  };
}
