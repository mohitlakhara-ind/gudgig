import React from 'react';
import { Conversation } from '@/types/api';

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (conversationId: string) => void;
  selectedId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, onSelect, selectedId }) => {
  return (
    <div className="border rounded-lg divide-y">
      {conversations.map((c) => {
        const other = (c.participants || []).find((p: any) => typeof p !== 'string');
        return (
          <button
            key={c._id}
            onClick={() => onSelect(c._id)}
            className={`w-full text-left p-3 hover:bg-gray-50 ${selectedId === c._id ? 'bg-gray-50' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{(other as any)?.name || 'Conversation'}</div>
              {c.unreadBy?.length ? <span className="text-xs bg-blue-600 text-white rounded px-2 py-0.5">{c.unreadBy.length}</span> : null}
            </div>
            <div className="text-xs text-gray-500">{new Date(c.lastMessageAt).toLocaleString()}</div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;


