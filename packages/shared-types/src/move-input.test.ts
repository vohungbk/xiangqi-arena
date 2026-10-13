import { describe, expect, it } from 'vitest';
import { allPoints, moveToText, pointToText } from './board';
import { MoveReasonCode, parseMoveInput } from './move-input';

function reasonOf(input: unknown): MoveReasonCode | undefined {
  const result = parseMoveInput(input);
  return result.isValid ? undefined : result.reasonCode;
}

describe('parseMoveInput text form', () => {
  it('should read b2e2 with the file as x and the rank counted from the Red side', () => {
    expect(parseMoveInput('b2e2')).toEqual({
      isValid: true,
      move: { from: { x: 1, y: 7 }, to: { x: 4, y: 7 } },
    });
  });

  it('should read the corner moves a0a1 and i9i8', () => {
    expect(parseMoveInput('a0a1')).toEqual({
      isValid: true,
      move: { from: { x: 0, y: 9 }, to: { x: 0, y: 8 } },
    });
    expect(parseMoveInput('i9i8')).toEqual({
      isValid: true,
      move: { from: { x: 8, y: 0 }, to: { x: 8, y: 1 } },
    });
  });

  it('should put the Red Cannon b2 at x 1 and y 7 because y is 9 minus the rank', () => {
    const result = parseMoveInput('b2b9');
    expect(result.isValid && result.move.from).toEqual({ x: 1, y: 7 });
    expect(result.isValid && result.move.to).toEqual({ x: 1, y: 0 });
  });
});

describe('parseMoveInput JSON form', () => {
  it('should read { from, to } with y from top to bottom', () => {
    expect(parseMoveInput({ from: { x: 1, y: 7 }, to: { x: 4, y: 7 } })).toEqual({
      isValid: true,
      move: { from: { x: 1, y: 7 }, to: { x: 4, y: 7 } },
    });
  });

  it('should accept the corners and the edges of the board', () => {
    for (const x of [0, 8]) {
      for (const y of [0, 9]) {
        expect(parseMoveInput({ from: { x, y }, to: { x: 4, y: 4 } }).isValid).toBe(true);
      }
    }
  });

  it('should drop fields other than from and to', () => {
    const result = parseMoveInput({ from: { x: 1, y: 7, z: 1 }, to: { x: 4, y: 7 }, extra: 'no' });
    expect(result).toEqual({
      isValid: true,
      move: { from: { x: 1, y: 7 }, to: { x: 4, y: 7 } },
    });
  });

  it('should return out_of_bounds for a whole number outside the board', () => {
    const outside = [
      { x: -1, y: 0 },
      { x: 9, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 10 },
    ];
    for (const point of outside) {
      expect(reasonOf({ from: point, to: { x: 4, y: 4 } })).toBe(MoveReasonCode.OUT_OF_BOUNDS);
      expect(reasonOf({ from: { x: 4, y: 4 }, to: point })).toBe(MoveReasonCode.OUT_OF_BOUNDS);
    }
  });
});

describe('the two forms give the same move', () => {
  it('should give the same result for b2e2 and the JSON form of it', () => {
    expect(parseMoveInput('b2e2')).toEqual(
      parseMoveInput({ from: { x: 1, y: 7 }, to: { x: 4, y: 7 } }),
    );
  });

  it('should give the same move after text, JSON and text for every point', () => {
    for (const from of allPoints()) {
      const to = { x: (from.x + 3) % 9, y: (from.y + 4) % 10 };
      const text = moveToText(from, to);
      const fromText = parseMoveInput(text);
      const fromJson = parseMoveInput({ from, to });
      expect(fromText).toEqual(fromJson);
      expect(fromText.isValid && moveToText(fromText.move.from, fromText.move.to)).toBe(text);
      expect(pointToText(from)).toBe(text.slice(0, 2));
    }
  });
});

describe('parseMoveInput refuses a bad input', () => {
  it('should return malformed_input and not throw for input that is not a move', () => {
    const bad: unknown[] = [
      '',
      'zz99',
      'b2',
      'b2e',
      'b2e22',
      null,
      undefined,
      0,
      42,
      true,
      [],
      ['b2', 'e2'],
      {},
      { from: { x: 1, y: 7 } },
      { to: { x: 1, y: 7 } },
      { from: 'b2', to: 'e2' },
      { from: null, to: null },
      { from: [1, 7], to: [4, 7] },
    ];
    for (const input of bad) {
      expect(() => parseMoveInput(input)).not.toThrow();
      expect(reasonOf(input), String(JSON.stringify(input))).toBe(MoveReasonCode.MALFORMED_INPUT);
    }
  });

  it('should not accept upper case, spaces, or a wrong rank or file', () => {
    for (const text of ['B2E2', ' b2e2', 'b2e2 ', 'b2 e2', 'j2e2', 'b2e:', 'b-2e2', 'b2e2\n']) {
      expect(reasonOf(text), text).toBe(MoveReasonCode.MALFORMED_INPUT);
    }
  });

  it('should not accept a fraction, NaN, Infinity or a string as a coordinate', () => {
    const bad = [
      { x: 1.5, y: 7 },
      { x: Number.NaN, y: 7 },
      { x: Number.POSITIVE_INFINITY, y: 7 },
      { x: '1', y: 7 },
      { x: 1, y: null },
      { x: 1 },
    ];
    for (const point of bad) {
      expect(reasonOf({ from: point, to: { x: 4, y: 7 } })).toBe(MoveReasonCode.MALFORMED_INPUT);
    }
  });

  it('should not accept WXF notation as input', () => {
    for (const notation of ['C2=5', 'C2.5', 'C2+3', 'Cb2e2', 'H2+3', '炮二平五', '马八进七']) {
      expect(reasonOf(notation), notation).toBe(MoveReasonCode.MALFORMED_INPUT);
    }
  });

  it('should not read fields from the prototype of the input', () => {
    const proto = { from: { x: 1, y: 7 }, to: { x: 4, y: 7 } };
    expect(reasonOf(Object.create(proto))).toBe(MoveReasonCode.MALFORMED_INPUT);
    const point = Object.create({ x: 1, y: 7 });
    expect(reasonOf({ from: point, to: { x: 4, y: 7 } })).toBe(MoveReasonCode.MALFORMED_INPUT);
  });

  it('should return malformed_input when one point is malformed and the other is outside', () => {
    expect(reasonOf({ from: { x: 'a', y: 0 }, to: { x: 9, y: 0 } })).toBe(
      MoveReasonCode.MALFORMED_INPUT,
    );
  });

  it('should use the reason codes of the spec as values', () => {
    expect(MoveReasonCode.MALFORMED_INPUT).toBe('malformed_input');
    expect(MoveReasonCode.OUT_OF_BOUNDS).toBe('out_of_bounds');
  });
});
