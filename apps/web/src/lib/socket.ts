import { io, type Socket } from 'socket.io-client';
import { WSEvents } from '@xiangqi/shared-types';

let socket: Socket | null = null;

/**
 * Creates the singleton socket. The access token is never sent in the URL:
 * it is sent in the first message (AUTH_CONNECT) after the socket connects.
 */
export function connectSocket(accessToken: string): Socket {
  if (socket) return socket;
  socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000', {
    transports: ['websocket'],
    autoConnect: false,
  });
  socket.on('connect', () => {
    socket?.emit(WSEvents.AUTH_CONNECT, { accessToken });
  });
  socket.connect();
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
