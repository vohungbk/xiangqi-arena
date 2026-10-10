import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EngineRequest, EngineResponse } from './protocol';
import { PikafishEngine } from './index';

class FakeWorker {
  static last: FakeWorker;
  onmessage: ((e: MessageEvent<EngineResponse>) => void) | null = null;
  sent: EngineRequest[] = [];
  terminated = false;

  constructor() {
    FakeWorker.last = this;
  }

  postMessage(msg: EngineRequest): void {
    this.sent.push(msg);
  }

  terminate(): void {
    this.terminated = true;
  }

  reply(msg: EngineResponse): void {
    this.onmessage?.({ data: msg } as MessageEvent<EngineResponse>);
  }
}

const options = { workerUrl: 'worker.js', wasmUrl: 'a.wasm', nnueUrl: 'a.nnue' };

describe('PikafishEngine', () => {
  beforeEach(() => {
    vi.stubGlobal('Worker', FakeWorker);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should resolve init when the worker replies ready', async () => {
    const engine = new PikafishEngine(options);
    const init = engine.init();
    FakeWorker.last.reply({ type: 'ready' });
    await expect(init).resolves.toBeUndefined();
    expect(FakeWorker.last.sent[0]).toMatchObject({ type: 'init', wasmUrl: 'a.wasm' });
  });

  it('should return the best move from the worker', async () => {
    const engine = new PikafishEngine(options);
    const best = engine.bestMove('fen', ['h2e2'], 500);
    FakeWorker.last.reply({ type: 'bestmove', move: 'h9g7' });
    await expect(best).resolves.toBe('h9g7');
    expect(FakeWorker.last.sent[0]).toMatchObject({ type: 'go', moveTimeMs: 500 });
  });

  it('should reject when the worker replies with an error', async () => {
    const engine = new PikafishEngine(options);
    const best = engine.bestMove('fen', []);
    FakeWorker.last.reply({ type: 'error', message: 'engine crashed' });
    await expect(best).rejects.toThrow('engine crashed');
  });

  it('should terminate the worker on destroy', () => {
    const engine = new PikafishEngine(options);
    engine.destroy();
    expect(FakeWorker.last.terminated).toBe(true);
    expect(FakeWorker.last.sent.at(-1)).toEqual({ type: 'quit' });
  });
});
