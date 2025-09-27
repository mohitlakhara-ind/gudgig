'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

interface UseSocketReturn {
  socket: ReturnType<typeof io> | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

export function useSocket(): UseSocketReturn {
  const { user, token } = useAuth();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    if (typeof window !== 'undefined') {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
      socketRef.current = io(socketUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
      });
    }

    const socket = socketRef.current!;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);

      // Join user-specific room
      socket.emit('join', { userId: user._id, role: user.role });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user, token]);

  const emit = (event: string, data?: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  };
}