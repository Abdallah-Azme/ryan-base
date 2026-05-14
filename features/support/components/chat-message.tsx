import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '@/lib/chatStore';
import { useTranslation } from '@/lib/i18nContext';

interface ChatMessageProps {
  msg: Message;
  showName: boolean;
}

const safelyFormatTime = (timestamp: number) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
};

export default function ChatMessage({ msg, showName }: ChatMessageProps) {
  const isMe = msg.sender === 'customer';
  const { t, dir } = useTranslation();

  const alignClass = isMe
    ? dir === 'rtl' ? 'items-start' : 'items-end'
    : dir === 'rtl' ? 'items-end' : 'items-start';

  const bubbleClass = isMe
    ? 'bg-primary text-white rounded-tr-sm rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
    : 'bg-slate-800 text-slate-200 rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl border border-white/5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col mb-4 ${alignClass}`}
    >
      {showName && !isMe ? (
        <span className="text-[10px] text-slate-400 mb-1 ms-3 font-medium">{msg.senderName || 'Support'}</span>
      ) : null}

      <div className={`max-w-[85%] px-4 py-3 text-sm relative shadow-md ${bubbleClass}`}>
        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        <div className={`text-[9px] mt-1 text-end w-full ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
          {safelyFormatTime(msg.createdAt)}
        </div>
      </div>

      {showName && isMe ? <span className="text-[10px] text-slate-500 mt-1 me-2">{t('chat.delivered')}</span> : null}
    </motion.div>
  );
}
