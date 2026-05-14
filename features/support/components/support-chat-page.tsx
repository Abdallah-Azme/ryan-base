import React from 'react';
import { useSupportChat, BOTTOM_SAFE_AREA } from '../hooks/use-support-chat';
import ChatHeader from './chat-header';
import ChatMessageList from './chat-message-list';
import ChatInputBar from './chat-input-bar';

export default function SupportChatPage() {
  const {
    t,
    dir,
    inputText,
    setInputText,
    pageRef,
    messagesEndRef,
    composerRef,
    handleSend,
    handleKeyDown,
    groupedMessages,
  } = useSupportChat();

  return (
    <div
      ref={pageRef}
      className="flex flex-col w-full h-full relative overflow-hidden bg-[#020617]"
      style={{ height: '100dvh' }}
    >
      <ChatHeader />

      <ChatMessageList
        groupedMessages={groupedMessages}
        messagesEndRef={messagesEndRef}
        bottomSafeArea={BOTTOM_SAFE_AREA}
      />

      <ChatInputBar
        inputText={inputText}
        onChangeInput={setInputText}
        onKeyDown={handleKeyDown}
        onSend={handleSend}
        placeholder={t('chat.type_message')}
        dir={dir}
        composerRef={composerRef}
      />
    </div>
  );
}
