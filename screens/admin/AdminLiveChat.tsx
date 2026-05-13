"use client";

// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Clock, User, MessageCircle, X, CheckCircle, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, setDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase-client';
import AvatarInitial from '../../components/AvatarInitial';
import { adminChatStore, useAdminChatNotifications } from '../../lib/adminChatStore';

interface Conversation {
  id: string; // customerId
  customerName: string;
  lastMessageText: string;
  lastMessageAt: number;
  status: 'open' | 'closed';
  unreadForAdmin: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'staff';
  createdAt: number;
  senderName?: string;
}

const AdminLiveChat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { isSoundEnabled } = useAdminChatNotifications();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Subscribe to Conversations List (Open)
  useEffect(() => {
    const q = query(
      collection(db, 'conversations'),
      where('status', '==', 'open')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          customerName: data.customerName || 'Anonymous',
          lastMessageText: data.lastMessageText || '',
          lastMessageAt: data.lastMessageAt?.toMillis ? data.lastMessageAt.toMillis() : (Date.now()),
          status: data.status,
          unreadForAdmin: data.unreadForAdmin || 0
        } as Conversation;
      });
      // Client-side sort by newest first
      convs.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      setConversations(convs);
    });

    return () => unsubscribe();
  }, []);

  // 2. Handle Selection & Mark as Read Logic
  const handleSelectConversation = async (id: string) => {
    setSelectedId(id);
    adminChatStore.setCurrentChat(id); // Inform global store so it doesn't play sound for this chat

    // Mark as Read in Firestore
    try {
      await updateDoc(doc(db, 'conversations', id), {
        unreadForAdmin: 0,
        lastReadAtByAdmin: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to mark read", e);
    }
  };

  // Reset current chat in store on unmount or deselect
  useEffect(() => {
    return () => {
      adminChatStore.setCurrentChat(null);
    };
  }, []);

  // 3. Subscribe to Messages of Selected Conversation
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'conversations', selectedId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          sender: data.sender,
          senderName: data.senderName,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
        } as Message;
      });
      setMessages(msgs);

      // If we are viewing the chat and a new message comes in, ensure unread stays 0
      // This handles the case where admin is looking at screen, customer types,
      // The customer write increments unread -> we immediately reset it.
      if (msgs.length > 0) {
         // Debounce or check simple condition to avoid write loops?
         // Since we only set it to 0, it's idempotent.
         // However, doing this on every message load might be heavy.
         // Better: relies on the fact handleSelectConversation cleared it.
         // But if a NEW message arrives while open, unread becomes 1.
         // We should clear it again.
         
         updateDoc(doc(db, 'conversations', selectedId), { unreadForAdmin: 0 })
           .catch(e => console.warn("Auto-read failed", e));
      }

    }, (err) => {
      console.error("Error fetching messages:", err);
    });

    return () => unsubscribe();
  }, [selectedId]);

  // Auto-scroll on new messages
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
      
      // Add to subcollection
      await addDoc(collection(db, 'conversations', selectedId, 'messages'), {
        text,
        sender: 'staff',
        senderName: auth.currentUser?.displayName || 'Admin',
        createdAt: timestamp,
        staffId: auth.currentUser?.uid
      });

      // Update parent doc with unreadForUser increment
      // Using setDoc with merge:true ensures the doc exists and fields are preserved
      await setDoc(doc(db, 'conversations', selectedId), {
        customerId: selectedId,
        status: 'open',
        lastMessageText: text,
        lastMessageAt: timestamp,
        lastMessageSender: 'staff',
        unreadForUser: increment(1)
      }, { merge: true });

    } catch (err) {
      console.error("Send failed", err);
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedId || !window.confirm("Close this conversation?")) return;
    try {
      await updateDoc(doc(db, 'conversations', selectedId), {
        status: 'closed',
        unreadForAdmin: 0 // Clear unread on close
      });
      setSelectedId(null);
      adminChatStore.setCurrentChat(null);
    } catch (err) {
      console.error("Close failed", err);
    }
  };

  const toggleSound = () => {
    adminChatStore.toggleSound(!isSoundEnabled);
  };

  const filteredConversations = conversations.filter(c => 
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

  const selectedConversation = conversations.find(c => c.id === selectedId);

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 overflow-hidden">
      
      {/* LEFT: Conversation List */}
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
              onClick={toggleSound}
              className={`p-2 rounded-lg transition-colors ${isSoundEnabled ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-300'}`}
              title={isSoundEnabled ? "Sound On" : "Sound Off"}
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
            filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full p-4 flex items-start gap-3 border-b border-white/5 transition-colors text-left group relative ${
                  selectedId === conv.id 
                    ? 'bg-primary/10 border-l-4 border-l-primary' 
                    : 'hover:bg-white/5 border-l-4 border-l-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <AvatarInitial name={conv.customerName} className="w-10 h-10 text-sm" />
                  {/* Unread Badge for List Item */}
                  {conv.unreadForAdmin > 0 && selectedId !== conv.id && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0f172a]" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`text-sm font-bold truncate ${selectedId === conv.id ? 'text-white' : 'text-slate-300'} ${conv.unreadForAdmin > 0 && selectedId !== conv.id ? 'text-white' : ''}`}>
                      {conv.customerName}
                    </h3>
                    <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate max-w-[85%] ${conv.unreadForAdmin > 0 && selectedId !== conv.id ? 'text-white font-medium' : 'text-slate-400 opacity-80'}`}>
                      {conv.lastMessageText}
                    </p>
                    {/* Unread Count Badge */}
                    {conv.unreadForAdmin > 0 && selectedId !== conv.id && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {conv.unreadForAdmin}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden shadow-xl relative">
        {selectedId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <AvatarInitial name={selectedConversation?.customerName || 'User'} className="w-10 h-10" />
                <div>
                  <h2 className="text-white font-bold text-base">
                    {selectedConversation?.customerName || 'Unknown User'}
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-emerald-400 font-medium">Open Ticket</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleCloseConversation}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors border border-white/10"
              >
                <CheckCircle size={14} />
                Close Ticket
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0b1121]" ref={scrollRef}>
              {messages.map((msg, idx) => {
                const isStaff = msg.sender === 'staff';
                const showName = idx === 0 || messages[idx-1].sender !== msg.sender;
                
                return (
                  <div key={msg.id} className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}>
                    {showName && (
                      <span className="text-[10px] text-slate-500 mb-1 px-1">
                        {isStaff ? (msg.senderName || 'You') : (selectedConversation?.customerName || 'Customer')}
                      </span>
                    )}
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
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 bg-slate-900 border-t border-white/5">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a reply..."
                  className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-primary hover:bg-sky-400 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
              <MessageCircle size={32} className="opacity-50" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Live Support Console</h3>
            <p className="max-w-xs text-center text-sm">Select an open conversation from the list to start chatting with a customer.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLiveChat;
