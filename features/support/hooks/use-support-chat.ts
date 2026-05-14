import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { chatStore, useMessages as useStoreMessages, Message } from '@/lib/chatStore';
import { useTranslation } from '@/lib/i18nContext';
import { auth, db } from '@/lib/firebase-client';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

export const TAB_BAR_HEIGHT = 80;
export const BOTTOM_SAFE_AREA = 20;

export function useSupportChat() {
  const { messages } = useStoreMessages();
  const [inputText, setInputText] = useState('');
  const { t, dir } = useTranslation();

  const pageRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!composerRef.current || !pageRef.current) return;

    const updateHeights = () => {
      const composerH = composerRef.current?.offsetHeight || 60;
      pageRef.current?.style.setProperty('--composer-h', `${composerH}px`);
      pageRef.current?.style.setProperty('--tabbar-h', `${TAB_BAR_HEIGHT}px`);
    };

    updateHeights();

    const observer = new ResizeObserver(updateHeights);
    observer.observe(composerRef.current);

    return () => observer.disconnect();
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom('auto'), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length]);

  useEffect(() => {
    const clearUnread = async () => {
      if (!auth.currentUser || !db) return;
      try {
        await setDoc(
          doc(db, 'conversations', auth.currentUser.uid),
          {
            unreadForUser: 0,
          },
          { merge: true }
        );

        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          chatUnreadCount: 0,
        }).catch(() => {});
      } catch (e) {
        console.warn('Failed to clear unread count', e);
      }
    };

    clearUnread();

    if (messages.length > 0) {
      clearUnread();
    }
  }, [messages.length]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    chatStore.sendMessage(inputText.trim());
    setInputText('');
    setTimeout(() => scrollToBottom('auto'), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const groupedMessages: { date: number; msgs: Message[] }[] = [];
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt);
    if (isNaN(d.getTime())) return;

    const date = d.setHours(0, 0, 0, 0);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === date) {
      lastGroup.msgs.push(msg);
    } else {
      groupedMessages.push({ date, msgs: [msg] });
    }
  });

  return {
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
  };
}
