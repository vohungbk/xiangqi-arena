import type { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const connect = vi.fn();
const disconnect = vi.fn();
const adapter = vi.fn();
const clientOptions = vi.fn();

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class {
    constructor(options: unknown) {
      adapter(options);
    }
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    $connect = connect;
    $disconnect = disconnect;
    constructor(options: unknown) {
      clientOptions(options);
    }
  },
}));

const { PrismaService } = await import('./prisma.service');

function configWith(url: string | undefined): ConfigService {
  return {
    getOrThrow: (key: string) => {
      if (url === undefined) throw new Error(`Configuration key "${key}" does not exist`);
      return url;
    },
  } as unknown as ConfigService;
}

const config = configWith('postgresql://user:pass@localhost:5432/xiangqi');

describe('PrismaService', () => {
  beforeEach(() => {
    connect.mockReset();
    disconnect.mockReset();
    adapter.mockReset();
    clientOptions.mockReset();
  });

  it('should connect to the database when the module starts', async () => {
    connect.mockResolvedValue(undefined);
    await new PrismaService(config).onModuleInit();
    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('should fail the startup when the database is not reachable', async () => {
    connect.mockRejectedValue(new Error('connection refused'));
    await expect(new PrismaService(config).onModuleInit()).rejects.toThrow('connection refused');
  });

  it('should disconnect when the module is destroyed', async () => {
    disconnect.mockResolvedValue(undefined);
    await new PrismaService(config).onModuleDestroy();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('should give the client a pg driver adapter built from DATABASE_URL', () => {
    new PrismaService(config);
    expect(adapter).toHaveBeenCalledWith({
      connectionString: 'postgresql://user:pass@localhost:5432/xiangqi',
    });
    expect(clientOptions).toHaveBeenCalledWith({ adapter: expect.anything() });
  });

  it('should fail when DATABASE_URL is not set', () => {
    expect(() => new PrismaService(configWith(undefined))).toThrow('DATABASE_URL');
  });
});
