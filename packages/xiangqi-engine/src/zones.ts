import { assertInsideBoard, PALACE, RIVER, Side, type Point } from '@xiangqi/shared-types';

/** Inclusive limits of a Palace. */
export interface PalaceBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** The zone of a point: the Palace it is in, if any, and the side of the River it lies on. */
export interface Zone {
  /** The side whose Palace holds the point, or null when the point is in no Palace. */
  palace: Side | null;
  /** The side that owns the half of the board with this point (Black y 0 to 4, Red y 5 to 9). */
  riverSide: Side;
}

/** The limits of the Palace of a side (ENG-F01 R3). */
export function palaceBounds(side: Side): PalaceBounds {
  const rows = side === Side.BLACK ? PALACE.BLACK : PALACE.RED;
  return { minX: PALACE.MIN_X, maxX: PALACE.MAX_X, minY: rows.MIN_Y, maxY: rows.MAX_Y };
}

/** True when the point is in the Palace of the side. Throws a `BoardError` outside the board. */
export function isInPalace(point: Point, side: Side): boolean {
  assertInsideBoard(point);
  const { minX, maxX, minY, maxY } = palaceBounds(side);
  return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}

/** The side that owns the half of the board with the point (ENG-F01 R4). */
export function riverSideOf(point: Point): Side {
  assertInsideBoard(point);
  return point.y <= RIVER.BLACK_BANK_Y ? Side.BLACK : Side.RED;
}

/** True when the point lies on the opponent half, so a piece of `side` has crossed the River. */
export function isAcrossRiver(point: Point, side: Side): boolean {
  return riverSideOf(point) !== side;
}

/** The Palace and the River side of a point (ENG-F01 R3, R4). */
export function getZone(point: Point): Zone {
  // `isInPalace` and `riverSideOf` throw a `BoardError` for a point outside the board.
  let palace: Side | null = null;
  if (isInPalace(point, Side.BLACK)) palace = Side.BLACK;
  else if (isInPalace(point, Side.RED)) palace = Side.RED;
  return { palace, riverSide: riverSideOf(point) };
}
