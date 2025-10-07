"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { Conversation } from '@/types/api';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatListPage() {
  const { user } = useAuth();
  const currentUserId = (user as any)?.data?._id || (user as any)?._id || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.getConversations();
        if (!mounted) return;
        setConversations(res.data || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    })();

    const sock = getSocket();
    sock.on('message:new', ({ conversationId }: { conversationId: string }) => {
      setConversations((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((c) => c._id === conversationId);
        if (idx > -1) {
          const updated = { ...copy[idx], lastMessageAt: new Date().toISOString() };
          copy.splice(idx, 1);
          return [updated, ...copy];
        }
        return prev;
      });
    });
    return () => {
      mounted = false;
      sock.off('message:new');
    };
  }, []);

  const content = useMemo(() => {
    if (loading) return <div className="p-6">Loading conversations...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!conversations.length) return (
      <div className="p-10 text-center text-muted-foreground">No conversations yet.</div>
    );
    const normalized = conversations.map((c: any) => {
      const others = Array.isArray(c.participants) ? c.participants.filter((p: any) => (p?._id || p) !== currentUserId) : [];
      const other = others?.[0] || {};
      const last = Array.isArray(c.messages) && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
      const name: string = other?.name || other?._id || 'Conversation';
      const snippet: string = last?.content || '';
      return { raw: c, name: String(name), snippet, time: c.lastMessageAt };
    }).filter(item => item.name.toLowerCase().includes(query.toLowerCase()) || item.snippet.toLowerCase().includes(query.toLowerCase()));

    return (
      <div className="px-4">
        <div className="mb-4">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or message"
              className="w-full border rounded-full pl-10 pr-4 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔎</span>
          </div>
        </div>
        <div className="rounded-xl border bg-card divide-y">
          {normalized.map(({ raw, name, snippet, time }) => (
            <Link key={raw._id} href={`/chat/${raw._id}`} className="flex items-center gap-3 p-4 hover:bg-muted/60 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold shadow-sm">
                {String(name).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium truncate">{name}</div>
                  <div className="text-[11px] text-muted-foreground whitespace-nowrap">{new Date(time).toLocaleTimeString()}</div>
                </div>
                <div className="text-sm text-muted-foreground truncate">{snippet || 'No messages yet'}</div>
              </div>
              {Array.isArray((raw as any).unreadBy) && (raw as any).unreadBy.includes(currentUserId) && (
                <span className="inline-block w-2 h-2 rounded-full bg-primary" aria-label="unread" />
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }, [loading, error, conversations, currentUserId, query]);

  return (
    <div className="max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-semibold p-6 pb-2">Chats</h1>
      {/* Tip: freelancers can message only admins */}
      <div className="px-6 flex items-center justify-between pb-2">
        <div className="text-xs text-muted-foreground">Tip: You can search by name or message. Freelancers can only message admins.</div>
        <button
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs hover:opacity-90"
          onClick={async () => {
            try {
              const res = await apiClient.startConversation({ participantRole: 'admin' });
              if ((res as any)?.data?._id) {
                window.location.href = `/chat/${(res as any).data._id}`;
              }
            } catch {}
          }}
        >Message Support</button>
      </div>
      {content}
    </div>
  );
}


