import React from 'react';
import { Message } from '@/lib/chatStore';
import DayDivider from './day-divider';
import ChatMessage from './chat-message';

interface ChatMessageListProps {
  groupedMessages: { date: number; msgs: Message[] }[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  bottomSafeArea: number;
}

export default function ChatMessageList({ groupedMessages, messagesEndRef, bottomSafeArea }: ChatMessageListProps) {
  return (
    <div
      className="flex-1 overflow-y-auto w-full px-4 pt-4 no-scrollbar"
      style={{
        paddingBottom: `calc(var(--composer-h, 60px) + var(--tabbar-h, 80px) + ${bottomSafeArea}px)`,
        scrollPaddingBottom: `calc(var(--composer-h, 60px) + var(--tabbar-h, 80px) + ${bottomSafeArea}px)`,
      }}
    >
      {groupedMessages.map((group) => (
        <React.Fragment key={group.date}>
          <DayDivider date={group.date} />
          {group.msgs.map((msg, index) => {
            const prevMsg = group.msgs[index - 1];
            const showName = !prevMsg || prevMsg.sender !== msg.sender;
            return <ChatMessage key={msg.id} msg={msg} showName={showName} />;
          })}
        </React.Fragment>
      ))}

      <div ref={messagesEndRef} className="h-px w-full" />
    </div>
  );
}
