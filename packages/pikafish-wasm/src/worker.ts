/// <reference lib="webworker" />
import type { EngineRequest, EngineResponse } from './protocol';

/**
 * Web Worker entry. Loads the single-threaded Pikafish Wasm build and bridges
 * UCI text commands to typed messages.
 *
 * TODO(AI-F01): load the real Wasm binary, the embedded NNUE (~1.4MB compressed)
 * and `pikafish.obk` (~200KB). Pikafish is GPL v3: ship the source offer and licence.
 */
const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: EngineResponse): void {
  ctx.postMessage(message);
}

ctx.onmessage = (event: MessageEvent<EngineRequest>) => {
  const msg = event.data;
  switch (msg.type) {
    case 'init':
      post({ type: 'ready' });
      break;
    case 'go':
    case 'newGame':
    case 'setLevel':
    case 'stop':
      // Forward to the engine once the Wasm module is wired in.
      break;
    case 'quit':
      ctx.close();
      break;
  }
};
