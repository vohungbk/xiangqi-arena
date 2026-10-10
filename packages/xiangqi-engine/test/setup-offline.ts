import { vi } from 'vitest';

// Engine tests must not reach the network. Any attempt fails the test loudly.
vi.stubGlobal('fetch', () => {
  throw new Error('Network access is not allowed in engine tests');
});
