"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { Conversation } from '@/types/api';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AdminChatListPage() {
  const { user } = useAuth();
  const currentUserId = (user as any)?.data?._id || (user as any)?._id || '';
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialUserId = searchParams?.get('userId') || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [participantId, setParticipantId] = useState(initialUserId);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userId = searchParams?.get('userId') || undefined;
        const res = await apiClient.getConversations(userId ? { userId } : undefined);
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
  }, [searchParams]);

  const onStartConversation = async () => {
    const pid = participantId.trim();
    if (!pid) return;
    setCreating(true);
    try {
      const res = await apiClient.startConversation({ participantId: pid });
      if (res?.data) {
        setConversations((prev) => {
          const exists = prev.find((c) => c._id === (res.data as any)._id);
          return exists ? prev : [res.data as any, ...prev];
        });
        setParticipantId('');
        // Push filter to URL so reloads preserve view
        const sp = new URLSearchParams(searchParams?.toString());
        sp.set('userId', pid);
        router.push(`/admin/chat?${sp.toString()}`);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to start conversation');
    } finally {
      setCreating(false);
    }
  };

  const searchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await apiClient.getAllUsers({ limit: 20, page: 1, search: userQuery });
      setUsers(res?.data?.users || []);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const content = useMemo(() => {
    if (loading) return <div className="p-6">Loading conversations...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!conversations.length) return (
      <div className="p-10 text-center text-muted-foreground">
        No conversations yet.
      </div>
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
            <Link key={raw._id} href={`/admin/chat/${raw._id}`} className="flex items-center gap-3 p-4 hover:bg-muted/60 transition-colors">
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
            </Link>
          ))}
        </div>
      </div>
    );
  }, [loading, error, conversations, currentUserId, query]);

  return (
    <div className="max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-semibold p-6 pb-2">Admin Chats</h1>
      {/* User picker for easy chat start */}
      <div className="px-6 pb-4">
        <div className="flex gap-2">
          <input
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Search users by name or email"
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button onClick={searchUsers} className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90">Search</button>
        </div>
        {usersLoading ? (
          <div className="text-sm text-muted-foreground mt-2">Searching…</div>
        ) : users.length > 0 ? (
          <div className="mt-2 max-h-64 overflow-auto border rounded-xl divide-y bg-card">
            {users.map((u) => (
              <div key={u._id} className="flex items-center justify-between p-2 hover:bg-muted/40">
                <div className="min-w-0">
                  <div className="font-medium truncate">{u.name || u.email || u._id}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                </div>
                <button
                  className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs"
                  onClick={async () => {
                    setParticipantId(u._id);
                    await onStartConversation();
                  }}
                >Message</button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {content}
    </div>
  );
}


