import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { HealthController } from './health.controller';
import { HealthService, REDIS_CLIENT } from './health.service';

@Module({
  controllers: [HealthController],
  providers: [
    HealthService,
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const client = new Redis(config.get<string>('REDIS_URL', 'redis://localhost:6379'), {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
        });
        // The health check reports connection errors. Without a handler ioredis prints each one.
        client.on('error', () => undefined);
        return client;
      },
    },
  ],
})
export class HealthModule {}
