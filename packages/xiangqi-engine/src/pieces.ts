import { fenCharToPiece, PieceType, type Side } from '@xiangqi/shared-types';

/**
 * How many pieces of each type a side has on a board from `parseFen`.
 * Every type is in the result, with 0 when the side has none of it.
 */
export function countPieces(
  board: readonly (readonly string[])[],
  side: Side,
): Record<PieceType, number> {
  const counts = Object.fromEntries(Object.values(PieceType).map((type) => [type, 0])) as Record<
    PieceType,
    number
  >;
  for (const row of board) {
    for (const cell of row) {
      if (cell === '') continue;
      const piece = fenCharToPiece(cell);
      if (piece.side === side) counts[piece.type] += 1;
    }
  }
  return counts;
}
