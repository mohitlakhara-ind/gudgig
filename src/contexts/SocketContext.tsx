'use client';

import React, { createContext, useContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

// Define Socket.io event types
export interface NotificationEvent {
  id: string;
  type: 'application_status' | 'job_match' | 'interview' | 'offer' | 'message';
  title: string;
  message: string;
  data?: any;
  createdAt: string;
}

export interface ApplicationStatusEvent {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  employerId: string;
  oldStatus: string;
  newStatus: string;
  timestamp: string;
}

export interface JobApplicationEvent {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantName: string;
  employerId: string;
  timestamp: string;
}

export interface UserPresenceEvent {
  userId: string;
  status: 'online' | 'offline';
  timestamp: string;
}

interface SocketContextType {
  socket: ReturnType<typeof useSocket>['socket'];
  isConnected: boolean;
  connectionError: string | null;
  emit: ReturnType<typeof useSocket>['emit'];
  on: ReturnType<typeof useSocket>['on'];
  off: ReturnType<typeof useSocket>['off'];
  
  // Notification events
  onNotificationReceived: (callback: (notification: NotificationEvent) => void) => () => void;
  onNotificationUpdated: (callback: (data: { id: string; read: boolean }) => void) => () => void;
  markNotificationAsRead: (notificationId: string) => void;
  
  // Application events
  onApplicationStatusChanged: (callback: (data: ApplicationStatusEvent) => void) => () => void;
  onNewJobApplication: (callback: (data: JobApplicationEvent) => void) => () => void;
  emitApplicationStatusUpdate: (data: ApplicationStatusEvent) => void;
  emitNewJobApplication: (data: JobApplicationEvent) => void;
  
  // User presence events
  onUserOnline: (callback: (data: UserPresenceEvent) => void) => () => void;
  onUserOffline: (callback: (data: UserPresenceEvent) => void) => () => void;
  setUserOnline: () => void;
  
  // Room management
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { socket, isConnected, emit, on, off } = useSocket();
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Handle connection errors
  useEffect(() => {
    if (!socket) return;

    const handleConnectError = (error: Error) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message);
    };

    const handleConnect = () => {
      setConnectionError(null);
    };

    const handleDisconnect = (reason: string) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        setConnectionError('Server disconnected the connection');
      }
    };

    socket.on('connect_error', handleConnectError);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect_error', handleConnectError);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  // Notification event handlers
  const onNotificationReceived = useCallback((callback: (notification: NotificationEvent) => void) => {
    if (!socket) return () => {};
    
    const handler = (notification: NotificationEvent) => {
      callback(notification);
    };
    
    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, [socket]);

  const onNotificationUpdated = useCallback((callback: (data: { id: string; read: boolean }) => void) => {
    if (!socket) return () => {};
    
    const handler = (data: { id: string; read: boolean }) => {
      callback(data);
    };
    
    socket.on('notification:updated', handler);
    return () => socket.off('notification:updated', handler);
  }, [socket]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    if (socket && isConnected) {
      socket.emit('notification:read', notificationId);
    }
  }, [socket, isConnected]);

  // Application event handlers
  const onApplicationStatusChanged = useCallback((callback: (data: ApplicationStatusEvent) => void) => {
    if (!socket) return () => {};
    
    const handler = (data: ApplicationStatusEvent) => {
      callback(data);
    };
    
    socket.on('application:statusChanged', handler);
    return () => socket.off('application:statusChanged', handler);
  }, [socket]);

  const onNewJobApplication = useCallback((callback: (data: JobApplicationEvent) => void) => {
    if (!socket) return () => {};
    
    const handler = (data: JobApplicationEvent) => {
      callback(data);
    };
    
    socket.on('job:newApplication', handler);
    return () => socket.off('job:newApplication', handler);
  }, [socket]);

  const emitApplicationStatusUpdate = useCallback((data: ApplicationStatusEvent) => {
    if (socket && isConnected) {
      socket.emit('application:statusUpdate', data);
    }
  }, [socket, isConnected]);

  const emitNewJobApplication = useCallback((data: JobApplicationEvent) => {
    if (socket && isConnected) {
      socket.emit('job:newApplication', data);
    }
  }, [socket, isConnected]);

  // User presence event handlers
  const onUserOnline = useCallback((callback: (data: UserPresenceEvent) => void) => {
    if (!socket) return () => {};
    
    const handler = (data: UserPresenceEvent) => {
      callback(data);
    };
    
    socket.on('user:online', handler);
    return () => socket.off('user:online', handler);
  }, [socket]);

  const onUserOffline = useCallback((callback: (data: UserPresenceEvent) => void) => {
    if (!socket) return () => {};
    
    const handler = (data: UserPresenceEvent) => {
      callback(data);
    };
    
    socket.on('user:offline', handler);
    return () => socket.off('user:offline', handler);
  }, [socket]);

  const setUserOnline = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('user:setOnline');
    }
  }, [socket, isConnected]);

  // Room management
  const joinRoom = useCallback((roomId: string) => {
    if (socket && isConnected) {
      socket.emit('join', roomId);
    }
  }, [socket, isConnected]);

  const leaveRoom = useCallback((roomId: string) => {
    if (socket && isConnected) {
      socket.emit('leave', roomId);
    }
  }, [socket, isConnected]);

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    connectionError,
    emit,
    on,
    off,
    
    // Notification events
    onNotificationReceived,
    onNotificationUpdated,
    markNotificationAsRead,
    
    // Application events
    onApplicationStatusChanged,
    onNewJobApplication,
    emitApplicationStatusUpdate,
    emitNewJobApplication,
    
    // User presence events
    onUserOnline,
    onUserOffline,
    setUserOnline,
    
    // Room management
    joinRoom,
    leaveRoom,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}