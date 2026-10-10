import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service';
import { HEALTH_CHECK_TIMEOUT_MS, HealthService, type RedisPing } from './health.service';

function build(options: { db?: () => Promise<unknown>; redis?: () => Promise<string> }) {
  const prisma = {
    $queryRaw: vi.fn(options.db ?? (() => Promise.resolve([{ '?column?': 1 }]))),
  } as unknown as PrismaService;
  const redis: RedisPing = {
    ping: vi.fn(options.redis ?? (() => Promise.resolve('PONG'))),
    quit: vi.fn().mockResolvedValue('OK'),
  };
  return { service: new HealthService(prisma, redis), redis };
}

describe('HealthService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should report ok when database and redis answer', async () => {
    const { service } = build({});
    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      checks: { database: 'up', redis: 'up' },
    });
  });

  it('should report database down when the query fails', async () => {
    const { service } = build({ db: () => Promise.reject(new Error('refused')) });
    const report = await service.check();
    expect(report.status).toBe('error');
    expect(report.checks).toEqual({ database: 'down', redis: 'up' });
  });

  it('should report redis down when the ping fails', async () => {
    const { service } = build({ redis: () => Promise.reject(new Error('refused')) });
    const report = await service.check();
    expect(report.checks).toEqual({ database: 'up', redis: 'down' });
  });

  it('should report down when a check does not answer in time', async () => {
    const { service } = build({ redis: () => new Promise<string>(() => undefined) });
    const pending = service.check();
    await vi.advanceTimersByTimeAsync(HEALTH_CHECK_TIMEOUT_MS + 1);
    const report = await pending;
    expect(report.checks.redis).toBe('down');
  });

  it('should close the redis connection when the module is destroyed', async () => {
    const { service, redis } = build({});
    await service.onModuleDestroy();
    expect(redis.quit).toHaveBeenCalledTimes(1);
  });
});
