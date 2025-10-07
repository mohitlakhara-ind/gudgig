import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(token?: string): Socket {
  if (socket) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined);

  const base = (process as any)?.env?.NEXT_PUBLIC_BACKEND_WS_URL || (process as any)?.env?.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const origin = String(base).replace(/\/$/, '').replace(/\/api$/, '');

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


