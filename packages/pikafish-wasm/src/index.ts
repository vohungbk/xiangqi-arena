import type { EngineRequest, EngineResponse } from './protocol';

export * from './protocol';

export interface PikafishOptions {
  /** URL of the bundled worker script. */
  workerUrl: string | URL;
  wasmUrl: string;
  nnueUrl: string;
  bookUrl?: string;
}

/** Thin promise-based wrapper around the Pikafish Web Worker. */
export class PikafishEngine {
  private worker: Worker;
  private listeners = new Set<(msg: EngineResponse) => void>();

  constructor(private readonly options: PikafishOptions) {
    this.worker = new Worker(options.workerUrl, { type: 'module' });
    this.worker.onmessage = (e: MessageEvent<EngineResponse>) => {
      this.listeners.forEach((l) => l(e.data));
    };
  }

  private send(msg: EngineRequest): void {
    this.worker.postMessage(msg);
  }

  private once<T extends EngineResponse['type']>(
    type: T,
  ): Promise<Extract<EngineResponse, { type: T }>> {
    return new Promise((resolve, reject) => {
      const listener = (msg: EngineResponse) => {
        if (msg.type === 'error') {
          this.listeners.delete(listener);
          reject(new Error(msg.message));
        } else if (msg.type === type) {
          this.listeners.delete(listener);
          resolve(msg as Extract<EngineResponse, { type: T }>);
        }
      };
      this.listeners.add(listener);
    });
  }

  async init(): Promise<void> {
    const ready = this.once('ready');
    this.send({
      type: 'init',
      wasmUrl: this.options.wasmUrl,
      nnueUrl: this.options.nnueUrl,
      bookUrl: this.options.bookUrl,
    });
    await ready;
  }

  async bestMove(fen: string, moves: string[], moveTimeMs = 1000): Promise<string> {
    const result = this.once('bestmove');
    this.send({ type: 'go', fen, moves, moveTimeMs });
    return (await result).move;
  }

  setLevel(level: number): void {
    this.send({ type: 'setLevel', level });
  }

  newGame(): void {
    this.send({ type: 'newGame' });
  }

  destroy(): void {
    this.send({ type: 'quit' });
    this.worker.terminate();
    this.listeners.clear();
  }
}
