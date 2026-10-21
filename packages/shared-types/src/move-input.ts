import { isInsideBoard, textToMove, type Move, type Point } from './board';

/* ------------------------ Move input formats (ENG-F02) -------------------- */

/**
 * Stable reason codes of a rejected move (ENG-F02 R14, Q2). The values are the codes of the
 * spec, so the UI and the API can map them to messages. Later stories add the other codes.
 */
export enum MoveReasonCode {
  /** The input is not a move in the text form or the JSON form (E10). */
  MALFORMED_INPUT = 'malformed_input',
  /** A coordinate is a whole number but outside the 9x10 board (E3). */
  OUT_OF_BOUNDS = 'out_of_bounds',
  /** The move starts from a point with no piece (E1). */
  EMPTY_SOURCE = 'empty_source',
  /** The source and the target are the same point, so nothing moves. */
  SAME_POINT = 'same_point',
  /** The piece that moves is not of the side to move (R8, E2). */
  WRONG_TURN = 'wrong_turn',
  /** The target holds a piece of the same side as the piece that moves (R9, E4). */
  OWN_PIECE = 'own_piece',
}

/** The result of reading a move from input: the move, or a reason code. It never throws. */
export type MoveInputResult =
  { isValid: true; move: Move } | { isValid: false; reasonCode: MoveReasonCode };

/** The text form: file a to i and rank 0 to 9, twice. Lower case only (ENG-F02 R15). */
const MOVE_TEXT = /^[a-i][0-9][a-i][0-9]$/;

function reject(reasonCode: MoveReasonCode): MoveInputResult {
  return { isValid: false, reasonCode };
}

/** An own property of an object, so that the prototype of the input is never read. */
function ownProperty(value: object, key: string): unknown {
  return Object.hasOwn(value, key) ? (value as Record<string, unknown>)[key] : undefined;
}

function isPlainObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A point `{x, y}` of whole numbers, or null when the input is not one. */
function readJsonPoint(value: unknown): Point | null {
  if (!isPlainObject(value)) return null;
  const x = ownProperty(value, 'x');
  const y = ownProperty(value, 'y');
  if (typeof x !== 'number' || typeof y !== 'number') return null;
  if (!Number.isInteger(x) || !Number.isInteger(y)) return null;
  return { x, y };
}

/**
 * Read a move that comes from outside (a client, a request, a WS payload) in one of the two
 * forms of ENG-F02 R15, and say why when it is refused. It never throws.
 *
 * - Text, UCCI style: `b2e2`. The letter is the file a to i (x 0 to 8). The digit is the rank
 *   counted from the Red side, so y = 9 - rank. Lower case, exactly 4 characters, no spaces.
 * - JSON: `{ from: {x, y}, to: {x, y} }` with y from top to bottom (y = 0 is the Black side).
 *
 * WXF notation (for example `C2=5`) is for display and history only and is not accepted.
 * Every input that is not one of the two forms is `malformed_input`. A JSON coordinate that is
 * a whole number outside the board is `out_of_bounds`.
 */
export function parseMoveInput(input: unknown): MoveInputResult {
  if (typeof input === 'string') {
    if (!MOVE_TEXT.test(input)) return reject(MoveReasonCode.MALFORMED_INPUT);
    return { isValid: true, move: textToMove(input) };
  }
  if (!isPlainObject(input)) return reject(MoveReasonCode.MALFORMED_INPUT);

  const from = readJsonPoint(ownProperty(input, 'from'));
  const to = readJsonPoint(ownProperty(input, 'to'));
  if (!from || !to) return reject(MoveReasonCode.MALFORMED_INPUT);
  if (!isInsideBoard(from) || !isInsideBoard(to)) return reject(MoveReasonCode.OUT_OF_BOUNDS);
  return { isValid: true, move: { from, to } };
}
