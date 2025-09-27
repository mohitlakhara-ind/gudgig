"use client";
import React, { useState } from 'react';
import ConversationList from '@/components/messaging/ConversationList';
import ChatInterface from '@/components/messaging/ChatInterface';
import useConversations from '@/hooks/useConversations';

export default function MessagesPage() {
  const { conversations, getMessages, sendMessage } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
        <div className="md:col-span-1 overflow-y-auto">
          <ConversationList conversations={conversations} selectedId={activeConversationId || undefined} onSelect={setActiveConversationId} />
        </div>
        <div className="md:col-span-2">
          <ChatInterface conversationId={activeConversationId} fetchMessages={getMessages} sendMessage={sendMessage} />
        </div>
      </div>
    </div>
  );
}


