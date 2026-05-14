import React from 'react';
import { useAdminLiveChat } from '../hooks/use-admin-live-chat';
import ConversationList from './conversation-list';
import ChatPanel from './chat-panel';

export default function AdminLiveChatPage() {
  const {
    conversations,
    selectedId,
    messages,
    inputText,
    setInputText,
    searchTerm,
    setSearchTerm,
    isSoundEnabled,
    scrollRef,
    filteredConversations,
    selectedConversation,
    handleSelectConversation,
    handleSend,
    handleCloseConversation,
    toggleSound,
    formatTime,
  } = useAdminLiveChat();

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 overflow-hidden">
      <ConversationList
        conversations={conversations}
        filteredConversations={filteredConversations}
        selectedId={selectedId}
        onSelectConversation={handleSelectConversation}
        formatTime={formatTime}
        isSoundEnabled={isSoundEnabled}
        toggleSound={toggleSound}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <ChatPanel
        selectedId={selectedId}
        selectedConversation={selectedConversation}
        messages={messages}
        scrollRef={scrollRef}
        onCloseConversation={handleCloseConversation}
        inputText={inputText}
        setInputText={setInputText}
        onSend={handleSend}
      />
    </div>
  );
}
