"use client";

// @ts-nocheck
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Info } from 'lucide-react';
import { chatStore, useMessages, Message } from '../lib/chatStore';
import SafeImage from '../components/SafeImage';
import { useTranslation } from '../lib/i18nContext';
import { auth, db } from '../lib/firebase-client';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

// --- Constants ---
const TAB_BAR_HEIGHT = 80; // Standard bottom nav height (64px + padding)
const BOTTOM_SAFE_AREA = 20; // Extra buffer for iOS safe area

// --- Helpers ---
const safelyFormatTime = (timestamp: number) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
};

const safelyFormatDate = (timestamp: number) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  } catch (e) {
    return '';
  }
};

// --- Sub-components ---

const ChatHeader = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between shadow-lg z-30 shrink-0 h-[72px]">
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
            <SafeImage 
              src="https://raiyansoft.com/wp-content/uploads/2024/05/cropped-App-Icon-1.png" 
              alt="Support" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="absolute bottom-0 right-0 rtl:right-auto rtl:left-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
        </div>
        <div>
          <h2 className="text-white font-bold text-sm leading-tight">{t('chat.header')}</h2>
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <p className="text-slate-400 text-[10px] uppercase tracking-wide font-medium">{t('chat.team')}</p>
            <span className="text-emerald-500 text-[10px]">• {t('chat.online')}</span>
          </div>
        </div>
      </div>
      <button className="text-slate-400 hover:text-white transition-colors">
        <Info size={20} />
      </button>
    </div>
  );
};

const MessageBubble: React.FC<{ msg: Message, showName: boolean }> = ({ msg, showName }) => {
  const isMe = msg.sender === 'customer';
  const { t, dir } = useTranslation();
  
  // Alignment Logic:
  // We want User (isMe) always on the RIGHT.
  // We want Support (!isMe) always on the LEFT.
  // In LTR: items-end = Right, items-start = Left.
  // In RTL: items-start = Right, items-end = Left.
  
  const alignClass = isMe
    ? (dir === 'rtl' ? 'items-start' : 'items-end')  // Force Right side
    : (dir === 'rtl' ? 'items-end' : 'items-start'); // Force Left side

  // Bubble Shape Logic:
  // User (Right side): Sharp Top-Right corner (rounded-tr-sm)
  // Support (Left side): Sharp Top-Left corner (rounded-tl-sm)
  // We remove rtl: overrides to enforce physical shape consistency with visual position.

  const bubbleClass = isMe 
    ? 'bg-primary text-white rounded-tr-sm rounded-tl-2xl rounded-bl-2xl rounded-br-2xl' 
    : 'bg-slate-800 text-slate-200 rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl border border-white/5';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col mb-4 ${alignClass}`}
    >
      {showName && !isMe && (
        <span className="text-[10px] text-slate-400 mb-1 ml-3 font-medium">{msg.senderName || 'Support'}</span>
      )}
      
      <div 
        className={`max-w-[85%] px-4 py-3 text-sm relative shadow-md ${bubbleClass}`}
      >
        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        <div className={`text-[9px] mt-1 text-end w-full ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
          {safelyFormatTime(msg.createdAt)}
        </div>
      </div>
      
      {showName && isMe && (
        <span className="text-[10px] text-slate-500 mt-1 mr-2">{t('chat.delivered')}</span>
      )}
    </motion.div>
  );
};

const DayDivider: React.FC<{ date: number }> = ({ date }) => {
  const dateStr = safelyFormatDate(date);
  const isToday = new Date().toDateString() === new Date(date).toDateString();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center my-6 opacity-70">
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent w-full max-w-[100px]"></div>
      <span className="mx-3 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
        {isToday ? t('chat.today') : dateStr}
      </span>
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent w-full max-w-[100px]"></div>
    </div>
  );
};

// --- Main Page Component ---

const SupportChat: React.FC = () => {
  const { messages } = useMessages();
  const [inputText, setInputText] = useState('');
  const { t, dir } = useTranslation();
  
  // Refs
  const pageRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  
  // 1. Dynamic Height Measurement
  useLayoutEffect(() => {
    if (!composerRef.current || !pageRef.current) return;

    const updateHeights = () => {
      const composerH = composerRef.current?.offsetHeight || 60;
      pageRef.current?.style.setProperty('--composer-h', `${composerH}px`);
      pageRef.current?.style.setProperty('--tabbar-h', `${TAB_BAR_HEIGHT}px`);
    };

    // Initial measure
    updateHeights();

    // Observe changes (e.g. textarea expansion)
    const observer = new ResizeObserver(updateHeights);
    observer.observe(composerRef.current);

    return () => observer.disconnect();
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  // 2. Scroll Logic
  // Initial load
  useEffect(() => {
    // Small timeout to allow layout to settle
    const timer = setTimeout(() => scrollToBottom('auto'), 100);
    return () => clearTimeout(timer);
  }, []);

  // On new messages
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length]);

  // 3. Mark messages as read (Reset counter)
  useEffect(() => {
    const clearUnread = async () => {
      if (!auth.currentUser || !db) return;
      try {
        // Reset unreadForUser in conversation document
        await setDoc(doc(db, 'conversations', auth.currentUser.uid), {
          unreadForUser: 0
        }, { merge: true });
        
        // Also reset legacy user doc counter if needed
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          chatUnreadCount: 0
        }).catch(() => {}); // Ignore if user doc missing
      } catch (e) {
        // Silently ignore if permission/network issues
        console.warn("Failed to clear unread count", e);
      }
    };
    
    // Clear on mount
    clearUnread();

    // Clear when new messages arrive while this page is open
    if (messages.length > 0) {
        clearUnread();
    }
  }, [messages.length]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    chatStore.sendMessage(inputText.trim());
    setInputText('');
    // Force scroll after sending
    setTimeout(() => scrollToBottom('auto'), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages
  const groupedMessages: { date: number; msgs: Message[] }[] = [];
  messages.forEach(msg => {
    const d = new Date(msg.createdAt);
    if (isNaN(d.getTime())) return;
    
    const date = d.setHours(0,0,0,0);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === date) {
      lastGroup.msgs.push(msg);
    } else {
      groupedMessages.push({ date, msgs: [msg] });
    }
  });

  return (
    // 3. Root Container
    // Fixed height (100dvh) to prevent body scroll interaction
    // Flex column to stack Header, Messages, and (Absolute) Composer
    <div 
      ref={pageRef}
      className="flex flex-col w-full h-full relative overflow-hidden bg-[#020617]"
      style={{ height: '100dvh' }}
    >
      <ChatHeader />

      {/* 
         4. Messages Scroller 
         - Takes remaining space (flex-1)
         - Handles its own scrolling (overflow-y-auto)
         - Dynamic padding-bottom reserves space for Composer + TabBar + Safe Area
      */}
      <div 
        className="flex-1 overflow-y-auto w-full px-4 pt-4 no-scrollbar"
        style={{
          paddingBottom: `calc(var(--composer-h, 60px) + var(--tabbar-h, 80px) + ${BOTTOM_SAFE_AREA}px)`,
          scrollPaddingBottom: `calc(var(--composer-h, 60px) + var(--tabbar-h, 80px) + ${BOTTOM_SAFE_AREA}px)`
        }}
      >
        {groupedMessages.map((group) => (
          <React.Fragment key={group.date}>
            <DayDivider date={group.date} />
            {group.msgs.map((msg, index) => {
              const prevMsg = group.msgs[index - 1];
              const showName = !prevMsg || prevMsg.sender !== msg.sender;
              return <MessageBubble key={msg.id} msg={msg} showName={showName} />;
            })}
          </React.Fragment>
        ))}
        
        {/* Bottom Sentinel for Auto-scroll */}
        <div ref={messagesEndRef} className="h-px w-full" />
      </div>

      {/* 
         5. Fixed Composer 
         - Positioned absolutely at the bottom (above tab bar)
         - Uses Z-index to float above potential content
      */}
      <div 
        ref={composerRef}
        className="absolute left-0 right-0 z-40 px-4"
        style={{
          bottom: `calc(var(--tabbar-h, 80px) + 5px)` 
        }}
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.4)] flex items-end gap-2 max-w-[430px] mx-auto"
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.type_message')}
            rows={1}
            dir={dir}
            className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-sm py-3 focus:outline-none resize-none max-h-24 no-scrollbar"
            style={{ minHeight: '44px' }}
          />
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className={`p-3 rounded-xl transition-all duration-300 shrink-0 ${
              inputText.trim()
                ? 'bg-primary text-white shadow-[0_0_15px_rgba(29,183,240,0.4)]' 
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {dir === 'rtl' ? <Send size={20} className="scale-x-[-1]" /> : <Send size={20} />}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default SupportChat;
