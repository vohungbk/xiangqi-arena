/** Messages exchanged between the main thread and the Pikafish Web Worker. */

export type EngineRequest =
  | { type: 'init'; wasmUrl: string; nnueUrl: string; bookUrl?: string }
  | { type: 'newGame' }
  | { type: 'setLevel'; level: number }
  | { type: 'go'; fen: string; moves: string[]; moveTimeMs?: number; depth?: number }
  | { type: 'stop' }
  | { type: 'quit' };

export type EngineResponse =
  | { type: 'ready' }
  | { type: 'info'; depth: number; scoreCp: number; pv: string[] }
  | { type: 'bestmove'; move: string; ponder?: string }
  | { type: 'error'; message: string };
