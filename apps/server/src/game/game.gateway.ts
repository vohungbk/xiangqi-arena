import { JwtService } from '@nestjs/jwt';
import {
  type OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import {
  WSEvents,
  type AuthConnectPayload,
  type AuthErrorPayload,
  type AuthOkPayload,
  type ClientReadyPayload,
} from '@xiangqi/shared-types';
import { isOriginAllowed } from './auth.util';

/** How long a socket may stay unauthenticated before being dropped. */
const AUTH_TIMEOUT_MS = 5_000;

@WebSocketGateway({ transports: ['websocket'] })
export class GameGateway implements OnGatewayConnection {
  private readonly allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(
    ',',
  );

  constructor(private readonly jwt: JwtService) {}

  handleConnection(client: Socket): void {
    if (!isOriginAllowed(client.handshake.headers.origin, this.allowedOrigins)) {
      const error: AuthErrorPayload = {
        code: 'ORIGIN_NOT_ALLOWED',
        message: 'Origin not allowed',
      };
      client.emit(WSEvents.AUTH_ERROR, error);
      client.disconnect(true);
      return;
    }
    // The access token must arrive in the first message, not in the URL.
    const timer = setTimeout(() => client.disconnect(true), AUTH_TIMEOUT_MS);
    client.data.authTimer = timer;
  }

  @SubscribeMessage(WSEvents.AUTH_CONNECT)
  async onAuthConnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: AuthConnectPayload,
  ): Promise<void> {
    try {
      const claims = await this.jwt.verifyAsync<{ sub: string; username: string; exp: number }>(
        body.accessToken,
      );
      clearTimeout(client.data.authTimer);
      client.data.userId = claims.sub;
      const ok: AuthOkPayload = {
        userId: claims.sub,
        username: claims.username,
        expiresInMs: claims.exp * 1000 - Date.now(),
      };
      client.emit(WSEvents.AUTH_OK, ok);
    } catch {
      const error: AuthErrorPayload = { code: 'INVALID_TOKEN', message: 'Invalid token' };
      client.emit(WSEvents.AUTH_ERROR, error);
      client.disconnect(true);
    }
  }

  /**
   * The server-authoritative clock starts only after both players send CLIENT_READY,
   * which means the board has rendered on their screens.
   */
  @SubscribeMessage(WSEvents.CLIENT_READY)
  onClientReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() _body: ClientReadyPayload,
  ): void {
    if (!client.data.userId) return;
    // TODO(GAME-F01): mark player ready and start the clock when both are ready.
  }
}
