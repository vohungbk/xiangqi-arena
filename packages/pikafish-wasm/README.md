# @xiangqi/pikafish-wasm

Web Worker wrapper for the Pikafish engine compiled to WebAssembly.

- Single-threaded build. No `SharedArrayBuffer` or COOP/COEP headers needed.
- Embedded NNUE network (about 1.4MB compressed) and `pikafish.obk` opening book (about 200KB).
- Runs fully in the browser. Guests can play the AI.
- Put the built binaries in `assets/` (not committed yet).

## Licence

Pikafish is licensed under GPL v3. Any distribution of the Wasm build must include:

- the GPL v3 licence text,
- a link to the exact corresponding source,
- the NNUE network licence.

## Usage

```ts
import { PikafishEngine } from '@xiangqi/pikafish-wasm';

const engine = new PikafishEngine({ workerUrl, wasmUrl, nnueUrl, bookUrl });
await engine.init();
const move = await engine.bestMove(fen, moves, 1000);
```
