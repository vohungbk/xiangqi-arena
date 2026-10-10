import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { HealthController } from './health.controller';
import type { HealthReport, HealthService } from './health.service';

function controllerWith(report: HealthReport): HealthController {
  const service = { check: vi.fn().mockResolvedValue(report) } as unknown as HealthService;
  return new HealthController(service);
}

describe('HealthController', () => {
  it('should return the report when database and redis are up', async () => {
    const report: HealthReport = { status: 'ok', checks: { database: 'up', redis: 'up' } };
    await expect(controllerWith(report).check()).resolves.toEqual(report);
  });

  it('should return 503 when the database is down', async () => {
    const report: HealthReport = { status: 'error', checks: { database: 'down', redis: 'up' } };
    await expect(controllerWith(report).check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('should return 503 when redis is down', async () => {
    const report: HealthReport = { status: 'error', checks: { database: 'up', redis: 'down' } };
    await expect(controllerWith(report).check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
