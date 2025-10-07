"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { Message } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = String(params?.id || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const currentUserRole = ((user as any)?.data || (user as any))?.role;
  const [canSend, setCanSend] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.getMessages(conversationId);
        if (!mounted) return;
        setMessages(res.data || []);
        await apiClient.markConversationRead(conversationId);
        // Determine if freelancer can send (must include an admin)
        try {
          const list = await api.getConversations();
          const conv = (list.data || []).find((c: any) => c._id === conversationId);
          if (currentUserRole === 'freelancer' && conv) {
            const hasAdmin = Array.isArray(conv.participants) && conv.participants.some((p: any) => p?.role === 'admin');
            setCanSend(!!hasAdmin);
          } else {
            setCanSend(true);
          }
        } catch {
          setCanSend(true);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    })();

    const sock = getSocket();
    const room = `conversation:${conversationId}`;
    // Join conversation room for real-time updates and on reconnect
    const joinRoom = () => sock.emit('join', room);
    joinRoom();
    const onNew = ({ conversationId: cid, message }: { conversationId: string; message: Message }) => {
      if (cid !== conversationId) return;
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    };
    sock.on('message:new', onNew);
    sock.on('connect', joinRoom);

    // Fallback polling in case sockets are blocked
    const poll = setInterval(async () => {
      try {
        const res = await apiClient.getMessages(conversationId);
        if (!mounted) return;
        setMessages(res.data || []);
      } catch {}
    }, 5000);

    const onVisibility = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const res = await apiClient.getMessages(conversationId);
          if (!mounted) return;
          setMessages(res.data || []);
        } catch {}
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      mounted = false;
      sock.emit('leave', room);
      sock.off('message:new', onNew);
      sock.off('connect', joinRoom);
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [conversationId]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  const onSend = async () => {
    const content = text.trim();
    if (!content || !canSend) return;
    setText('');
    try {
      // Optimistic update for immediate UX
      const optimistic: any = {
        _id: `temp-${Date.now()}`,
        conversationId,
        sender: ((user as any)?.data || (user as any))?._id || 'me',
        content,
        createdAt: new Date().toISOString(),
        readBy: []
      };
      setMessages((prev) => [...prev, optimistic]);
      scrollToBottom();
      await apiClient.sendMessage(conversationId, { content });
    } catch (e) {
      // best-effort, error already surfaced by API layer
    }
  };

  const body = useMemo(() => {
    if (loading) return <div className="p-6">Loading…</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;
    return (
      <div className="flex flex-col h-full w-full
      ">
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
          {messages.map((m: any, i: number) => {
            const senderId = typeof m?.sender === 'object' ? (m?.sender?._id || m?.sender?.id) : m?.sender;
            const myId = ((user as any)?.data || (user as any))?._id;
            const isMe = myId && senderId === myId;
            return (
              <div key={m?._id || `${m?.createdAt || ''}-${i}`} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 shadow border ${isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-background rounded-bl-sm'}`}>
                  <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
                  <div className={`text-[10px] mt-1 ${isMe ? 'opacity-90' : 'text-muted-foreground'}`}>{new Date(m.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-3 border-t bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              placeholder={canSend ? "Write a message…" : "You can only message admins"}
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              disabled={!canSend}
            />
            <button onClick={onSend} disabled={!canSend} className="px-4 py-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90">Send</button>
          </div>
        </div>
      </div>
    );
  }, [loading, error, messages, text, user, canSend]);

  return (
    <div className="h-[calc(100vh-140px)] max-w-3xl mx-auto w-full">
      {body}
    </div>
  );
}


