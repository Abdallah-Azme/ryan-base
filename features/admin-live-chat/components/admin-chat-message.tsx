import React from 'react';
import { Message } from '../hooks/use-admin-live-chat';

interface AdminChatMessageProps {
  msg: Message;
  isStaff: boolean;
  showName: boolean;
  customerName: string;
}

export default function AdminChatMessage({
  msg,
  isStaff,
  showName,
  customerName,
}: AdminChatMessageProps) {
  return (
    <div className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}>
      {showName ? (
        <span className="text-[10px] text-slate-500 mb-1 px-1">
          {isStaff ? msg.senderName || 'You' : customerName}
        </span>
      ) : null}
      <div
        className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isStaff
            ? 'bg-primary text-white rounded-tr-sm shadow-lg shadow-primary/10'
            : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5'
        }`}
      >
        {msg.text}
      </div>
      <span className="text-[9px] text-slate-600 mt-1 px-1">
        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}
