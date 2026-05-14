import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase-client';
import { adminChatStore, useAdminChatNotifications } from '@/lib/adminChatStore';

export interface Conversation {
  id: string;
  customerName: string;
  lastMessageText: string;
  lastMessageAt: number;
  status: 'open' | 'closed';
  unreadForAdmin: number;
}

export interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'staff';
  createdAt: number;
  senderName?: string;
}

export function useAdminLiveChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { isSoundEnabled } = useAdminChatNotifications();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'conversations'), where('status', '==', 'open'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          customerName: data.customerName || 'Anonymous',
          lastMessageText: data.lastMessageText || '',
          lastMessageAt: data.lastMessageAt?.toMillis ? data.lastMessageAt.toMillis() : Date.now(),
          status: data.status,
          unreadForAdmin: data.unreadForAdmin || 0,
        } as Conversation;
      });
      convs.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      setConversations(convs);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectConversation = async (id: string) => {
    setSelectedId(id);
    adminChatStore.setCurrentChat(id);

    try {
      await updateDoc(doc(db, 'conversations', id), {
        unreadForAdmin: 0,
        lastReadAtByAdmin: serverTimestamp(),
      });
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  useEffect(() => {
    return () => {
      adminChatStore.setCurrentChat(null);
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    const q = query(collection(db, 'conversations', selectedId, 'messages'), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            text: data.text,
            sender: data.sender,
            senderName: data.senderName,
            createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
          } as Message;
        });
        setMessages(msgs);

        if (msgs.length > 0) {
          updateDoc(doc(db, 'conversations', selectedId), { unreadForAdmin: 0 }).catch((e) =>
            console.warn('Auto-read failed', e)
          );
        }
      },
      (err) => {
        console.error('Error fetching messages:', err);
      }
    );

    return () => unsubscribe();
  }, [selectedId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedId || !inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const timestamp = serverTimestamp();

      await addDoc(collection(db, 'conversations', selectedId, 'messages'), {
        text,
        sender: 'staff',
        senderName: auth.currentUser?.displayName || 'Admin',
        createdAt: timestamp,
        staffId: auth.currentUser?.uid,
      });

      await setDoc(
        doc(db, 'conversations', selectedId),
        {
          customerId: selectedId,
          status: 'open',
          lastMessageText: text,
          lastMessageAt: timestamp,
          lastMessageSender: 'staff',
          unreadForUser: increment(1),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Send failed', err);
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedId || !window.confirm('Close this conversation?')) return;
    try {
      await updateDoc(doc(db, 'conversations', selectedId), {
        status: 'closed',
        unreadForAdmin: 0,
      });
      setSelectedId(null);
      adminChatStore.setCurrentChat(null);
    } catch (err) {
      console.error('Close failed', err);
    }
  };

  const toggleSound = () => {
    adminChatStore.toggleSound(!isSoundEnabled);
  };

  const filteredConversations = conversations.filter((c) =>
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  return {
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
  };
}
