import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import type { ServerOptions } from 'socket.io';

/** Socket.io adapter backed by Redis pub/sub so game rooms work across server instances. */
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  constructor(
    app: INestApplicationContext,
    private readonly allowedOrigins: string[],
  ) {
    super(app);
  }

  async connectToRedis(url: string): Promise<void> {
    const pubClient = new Redis(url);
    const subClient = pubClient.duplicate();
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    // Object.assign keeps the optional keys of `options` as they are. A spread would give
    // `path: string | undefined`, which the strict optional property check of Nest 12 rejects.
    const server = super.createIOServer(
      port,
      Object.assign({}, options, {
        cors: { origin: this.allowedOrigins, credentials: true },
      }),
    );
    if (this.adapterConstructor) server.adapter(this.adapterConstructor);
    return server;
  }
}
