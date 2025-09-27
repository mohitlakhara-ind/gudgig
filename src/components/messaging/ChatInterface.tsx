"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Message } from '@/types/api';

interface ChatInterfaceProps {
  conversationId: string | null;
  fetchMessages: (conversationId: string) => Promise<Message[]>;
  sendMessage: (conversationId: string, payload: { content?: string; attachments?: Array<{ url: string; publicId?: string; name?: string; size?: number }> }) => Promise<any>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId, fetchMessages, sendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    (async () => {
      const msgs = await fetchMessages(conversationId);
      setMessages(msgs);
      requestAnimationFrame(() => scrollerRef.current?.scrollTo(0, 999999));
    })();
  }, [conversationId, fetchMessages]);

  const onSend = useCallback(async () => {
    if (!conversationId || !input.trim()) return;
    await sendMessage(conversationId, { content: input.trim() });
    setInput('');
    const msgs = await fetchMessages(conversationId);
    setMessages(msgs);
    requestAnimationFrame(() => scrollerRef.current?.scrollTo(0, 999999));
  }, [conversationId, input, sendMessage, fetchMessages]);

  if (!conversationId) {
    return <div className="flex items-center justify-center h-full text-gray-500">Select a conversation</div>;
  }

  return (
    <div className="flex flex-col h-full border rounded-lg">
      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className="text-sm">
            <span className="font-medium">{typeof m.sender === 'string' ? 'You' : (m.sender as any)?.name || 'User'}:</span> {m.content}
          </div>
        ))}
      </div>
      <div className="border-t p-3 flex items-center gap-2">
        <input className="flex-1 border rounded px-3 py-2" placeholder="Type a message" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') onSend(); }} />
        <button className="px-3 py-2 rounded bg-gray-900 text-white" onClick={onSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;


