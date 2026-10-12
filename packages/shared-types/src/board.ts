/* ------------------------- Board geometry (ENG-F01) ---------------------- */

/** The 9x10 board: 9 files (columns), 10 ranks (rows), 90 points (ENG-F01 R1). */
export const BOARD = {
  FILES: 9,
  RANKS: 10,
  POINTS: 90,
} as const;

/** File letters from left to right, so x = 0 is `a` and x = 8 is `i` (ENG-F01 R2). */
export const FILE_LETTERS = 'abcdefghi';

/**
 * A point of the board. This is also the JSON form (ENG-F01 R2, Q6).
 * x runs 0 to 8 from left to right. y runs 0 to 9 from top to bottom, so the Black side is y = 0.
 */
export interface Point {
  x: number;
  y: number;
}

export enum BoardErrorCode {
  POINT_OUT_OF_BOARD = 'POINT_OUT_OF_BOARD',
  INVALID_POINT = 'INVALID_POINT',
  INVALID_POINT_TEXT = 'INVALID_POINT_TEXT',
  INVALID_MOVE_TEXT = 'INVALID_MOVE_TEXT',
}

/** Error for a bad point. It carries a code, so a caller can tell the cases apart (ENG-F01 E1). */
export class BoardError extends Error {
  readonly code: BoardErrorCode;

  constructor(code: BoardErrorCode, message: string) {
    super(message);
    this.name = 'BoardError';
    this.code = code;
  }
}

/** True when x and y are whole numbers inside the board. The corners (0, 0) and (8, 9) are inside. */
export function isInsideBoard(point: Point): boolean {
  return (
    Number.isInteger(point.x) &&
    Number.isInteger(point.y) &&
    point.x >= 0 &&
    point.x < BOARD.FILES &&
    point.y >= 0 &&
    point.y < BOARD.RANKS
  );
}

/** Throw a `BoardError` for a point outside the board. Use it before reading a piece. */
export function assertInsideBoard(point: Point): void {
  if (!isInsideBoard(point)) {
    throw new BoardError(
      BoardErrorCode.POINT_OUT_OF_BOARD,
      `Point (${point.x}, ${point.y}) is outside the ${BOARD.FILES}x${BOARD.RANKS} board`,
    );
  }
}

/** All 90 points, row by row from the Black side (y = 0), each row from x = 0 to 8. */
export function allPoints(): Point[] {
  const points: Point[] = [];
  for (let y = 0; y < BOARD.RANKS; y++) {
    for (let x = 0; x < BOARD.FILES; x++) points.push({ x, y });
  }
  return points;
}

/**
 * Read a point from untrusted JSON (a WS payload, a request body).
 * Only `{x, y}` with whole numbers inside the board is accepted. Other fields are dropped.
 */
export function parsePoint(value: unknown): Point {
  if (typeof value !== 'object' || value === null) {
    throw new BoardError(BoardErrorCode.INVALID_POINT, 'A point must be an object {x, y}');
  }
  const { x, y } = value as Record<string, unknown>;
  if (typeof x !== 'number' || typeof y !== 'number') {
    throw new BoardError(BoardErrorCode.INVALID_POINT, 'A point needs a number x and a number y');
  }
  const point = { x, y };
  assertInsideBoard(point);
  return point;
}

/** Text form of a point, for example `{x: 1, y: 7}` gives `b2`. Rank = 9 - y (ENG-F01 R2, Q6). */
export function pointToText(point: Point): string {
  assertInsideBoard(point);
  return `${FILE_LETTERS.charAt(point.x)}${BOARD.RANKS - 1 - point.y}`;
}

/** Read the text form of a point, for example `b2` gives `{x: 1, y: 7}`. */
export function textToPoint(text: string): Point {
  const [, file, rank] = /^([a-i])([0-9])$/.exec(text) ?? [];
  if (file === undefined || rank === undefined) {
    throw new BoardError(
      BoardErrorCode.INVALID_POINT_TEXT,
      'A point text is a file a to i and a rank 0 to 9, for example b2',
    );
  }
  return {
    x: FILE_LETTERS.indexOf(file),
    y: BOARD.RANKS - 1 - Number(rank),
  };
}

/** Text form of a move, for example `b2e2`. */
export function moveToText(from: Point, to: Point): string {
  return `${pointToText(from)}${pointToText(to)}`;
}

/** Read the text form of a move, for example `b2e2`. */
export function textToMove(text: string): { from: Point; to: Point } {
  if (text.length !== 4) {
    throw new BoardError(
      BoardErrorCode.INVALID_MOVE_TEXT,
      'A move text is two points, for example b2e2',
    );
  }
  return { from: textToPoint(text.slice(0, 2)), to: textToPoint(text.slice(2)) };
}
