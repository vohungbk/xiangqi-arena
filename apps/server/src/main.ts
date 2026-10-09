import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(',');
  app.enableCors({ origin: origins, credentials: true });

  const redisAdapter = new RedisIoAdapter(app, origins);
  await redisAdapter.connectToRedis(process.env.REDIS_URL ?? 'redis://localhost:6379');
  app.useWebSocketAdapter(redisAdapter);

  await app.listen(Number(process.env.SERVER_PORT ?? 4000));
}

void bootstrap();
