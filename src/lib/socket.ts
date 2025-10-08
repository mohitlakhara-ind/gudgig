import { io, Socket } from 'socket.io-client';
import { getBackendWsUrl } from './backend-url';

let socket: Socket | null = null;

export function getSocket(token?: string): Socket {
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
    withCredentials: true,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}


