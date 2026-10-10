import { beforeEach, describe, expect, it, vi } from 'vitest';

const connect = vi.fn();
const disconnect = vi.fn();

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    $connect = connect;
    $disconnect = disconnect;
  },
}));

const { PrismaService } = await import('./prisma.service');

describe('PrismaService', () => {
  beforeEach(() => {
    connect.mockReset();
    disconnect.mockReset();
  });

  it('should connect to the database when the module starts', async () => {
    connect.mockResolvedValue(undefined);
    await new PrismaService().onModuleInit();
    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('should fail the startup when the database is not reachable', async () => {
    connect.mockRejectedValue(new Error('connection refused'));
    await expect(new PrismaService().onModuleInit()).rejects.toThrow('connection refused');
  });

  it('should disconnect when the module is destroyed', async () => {
    disconnect.mockResolvedValue(undefined);
    await new PrismaService().onModuleDestroy();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
