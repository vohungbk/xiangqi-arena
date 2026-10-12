import { BoardError, BoardErrorCode } from './board';

/* ----------------------- Sides and piece types (ENG-F01) ------------------ */

/** The two sides, named Red and Black in code and APIs (ENG-F01 R6). */
export enum Side {
  RED = 'RED',
  BLACK = 'BLACK',
}

/** The 7 piece types of each side (ENG-F01 R5). */
export enum PieceType {
  GENERAL = 'GENERAL',
  ADVISOR = 'ADVISOR',
  ELEPHANT = 'ELEPHANT',
  HORSE = 'HORSE',
  CHARIOT = 'CHARIOT',
  CANNON = 'CANNON',
  SOLDIER = 'SOLDIER',
}

export interface Piece {
  type: PieceType;
  side: Side;
}

/** FEN letter of each piece type, in lower case. Upper case is the Red side. */
const PIECE_FEN_CHARS: Record<PieceType, string> = {
  [PieceType.GENERAL]: 'k',
  [PieceType.ADVISOR]: 'a',
  [PieceType.ELEPHANT]: 'b',
  [PieceType.HORSE]: 'n',
  [PieceType.CHARIOT]: 'r',
  [PieceType.CANNON]: 'c',
  [PieceType.SOLDIER]: 'p',
};

/** Read a side from untrusted input. Only `RED` and `BLACK` are accepted. */
export function parseSide(value: unknown): Side {
  const side = Object.values(Side).find((known) => known === value);
  if (side === undefined) {
    throw new BoardError(BoardErrorCode.INVALID_SIDE, 'A side is RED or BLACK');
  }
  return side;
}

/** Read a piece type from untrusted input. Only the 7 names of `PieceType` are accepted. */
export function parsePieceType(value: unknown): PieceType {
  const type = Object.values(PieceType).find((known) => known === value);
  if (type === undefined) {
    throw new BoardError(
      BoardErrorCode.INVALID_PIECE_TYPE,
      'A piece type is one of GENERAL, ADVISOR, ELEPHANT, HORSE, CHARIOT, CANNON, SOLDIER',
    );
  }
  return type;
}

/** FEN letter of a piece: upper case for Red, lower case for Black. */
export function pieceToFenChar(piece: Piece): string {
  const char = PIECE_FEN_CHARS[piece.type];
  return piece.side === Side.RED ? char.toUpperCase() : char;
}

/** Read the piece of a FEN letter: upper case is Red, lower case is Black. */
export function fenCharToPiece(char: string): Piece {
  const lower = char.toLowerCase();
  const type = Object.values(PieceType).find((known) => PIECE_FEN_CHARS[known] === lower);
  if (char.length !== 1 || type === undefined) {
    throw new BoardError(
      BoardErrorCode.INVALID_PIECE_CHAR,
      'A piece letter is one of r n b a k c p, upper case for Red',
    );
  }
  return { type, side: char === lower ? Side.BLACK : Side.RED };
}
