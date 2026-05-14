import React from 'react';
import Avatar from '@/components/ui/avatar';
import { Conversation } from '../hooks/use-admin-live-chat';

interface ConversationListItemProps {
  conv: Conversation;
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  formatTime: (ts: number) => string;
}

export default function ConversationListItem({
  conv,
  selectedId,
  onSelectConversation,
  formatTime,
}: ConversationListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelectConversation(conv.id)}
      className={`w-full p-4 flex items-start gap-3 border-b border-white/5 transition-colors text-left group relative ${
        selectedId === conv.id
          ? 'bg-primary/10 border-l-4 border-l-primary'
          : 'hover:bg-white/5 border-l-4 border-l-transparent'
      }`}
    >
      <div className="relative shrink-0">
        <Avatar name={conv.customerName} size="md" className="w-10 h-10 text-sm" />
        {conv.unreadForAdmin > 0 && selectedId !== conv.id ? (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0f172a]" />
        ) : null}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3
            className={`text-sm font-bold truncate ${
              selectedId === conv.id ? 'text-white' : 'text-slate-300'
            } ${conv.unreadForAdmin > 0 && selectedId !== conv.id ? 'text-white' : ''}`}
          >
            {conv.customerName}
          </h3>
          <span className="text-[10px] text-slate-500 shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
        </div>
        <div className="flex justify-between items-center">
          <p
            className={`text-xs truncate max-w-[85%] ${
              conv.unreadForAdmin > 0 && selectedId !== conv.id
                ? 'text-white font-medium'
                : 'text-slate-400 opacity-80'
            }`}
          >
            {conv.lastMessageText}
          </p>
          {conv.unreadForAdmin > 0 && selectedId !== conv.id ? (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {conv.unreadForAdmin}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
