import { START_FEN } from '@xiangqi/shared-types';

/**
 * Entry point of the pure rules engine.
 * Move generation and validation are added by later tickets.
 * This package must stay free of browser, network and database code.
 */
export function isStartPosition(fen: string): boolean {
  return fen.trim() === START_FEN;
}

export { pieceAt } from './board';
export {
  getZone,
  isAcrossRiver,
  isInPalace,
  palaceBounds,
  riverSideOf,
  type PalaceBounds,
  type Zone,
} from './zones';

export { countPieces } from './pieces';

export {
  applyMove,
  applyMoveWithCapture,
  clonePosition,
  createPosition,
  createStartingPosition,
  getPiece,
  positionsEqual,
  positionToFen,
  readAllPoints,
  readPoint,
} from './position';

export { checkBoundsAndSource, checkCapture, checkTurn } from './move-rules';
