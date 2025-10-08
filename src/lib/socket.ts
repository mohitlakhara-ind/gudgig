import io from 'socket.io-client';
import { getBackendWsUrl } from './backend-url';

let socket: ReturnType<typeof io> | null = null;

export function getSocket(token?: string): ReturnType<typeof io> {
  if (socket) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined);

  const origin = getBackendWsUrl();

  socket = io(origin, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    auth: { token: authToken },
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}


