import { Inject, Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

/** Max time a dependency check may take before it counts as down. */
export const HEALTH_CHECK_TIMEOUT_MS = 2000;

export interface RedisPing {
  ping(): Promise<string>;
  quit(): Promise<unknown>;
}

export type DependencyState = 'up' | 'down';

export interface HealthReport {
  status: 'ok' | 'error';
  checks: { database: DependencyState; redis: DependencyState };
}

@Injectable()
export class HealthService implements OnModuleDestroy {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: RedisPing,
  ) {}

  async check(): Promise<HealthReport> {
    const [database, redis] = await Promise.all([
      this.probe('database', () => this.prisma.$queryRaw`SELECT 1`),
      this.probe('redis', () => this.redis.ping()),
    ]);
    return {
      status: database === 'up' && redis === 'up' ? 'ok' : 'error',
      checks: { database, redis },
    };
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit().catch(() => undefined);
  }

  private async probe(name: string, run: () => Promise<unknown>): Promise<DependencyState> {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('timeout')), HEALTH_CHECK_TIMEOUT_MS);
    });
    try {
      await Promise.race([run(), timeout]);
      return 'up';
    } catch (error) {
      // Log the error type only. Connection details must not reach the logs.
      this.logger.warn(`${name} check failed: ${error instanceof Error ? error.name : 'unknown'}`);
      return 'down';
    } finally {
      clearTimeout(timer);
    }
  }
}
