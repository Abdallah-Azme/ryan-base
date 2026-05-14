import React from 'react';
import { MessageCircle, Volume2, VolumeX, Search } from 'lucide-react';
import { Conversation } from '../hooks/use-admin-live-chat';
import ConversationListItem from './conversation-list-item';

interface ConversationListProps {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  formatTime: (ts: number) => string;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

export default function ConversationList({
  conversations,
  filteredConversations,
  selectedId,
  onSelectConversation,
  formatTime,
  isSoundEnabled,
  toggleSound,
  searchTerm,
  setSearchTerm,
}: ConversationListProps) {
  return (
    <div className="w-1/3 min-w-[300px] flex flex-col bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-white/5 bg-slate-900/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <MessageCircle size={20} className="text-primary" />
            Inbox
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-auto">
              {conversations.length}
            </span>
          </h2>
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-lg transition-colors ${
              isSoundEnabled ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={isSoundEnabled ? 'Sound On' : 'Sound Off'}
          >
            {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>No open conversations</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conv={conv}
              selectedId={selectedId}
              onSelectConversation={onSelectConversation}
              formatTime={formatTime}
            />
          ))
        )}
      </div>
    </div>
  );
}
