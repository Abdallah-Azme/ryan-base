"use client";
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, Search, Calendar, Image as ImageIcon, Link as LinkIcon, 
  Send, Clock, CheckCircle, Smartphone, X, User as UserIcon, 
  ChevronDown, History
} from 'lucide-react';
import SafeImage from '../../components/SafeImage';
import AvatarInitial from '../../components/AvatarInitial';
import { marketingStore, useMarketingHistory, NotificationPayload } from '../../lib/marketingNotifications';
import { useUsers, User } from '../../lib/userStore';

const AdminMarketingNotifications: React.FC = () => {
  const { history } = useMarketingHistory();
  const { users } = useUsers();
  
  // Form State
  const [targetType, setTargetType] = useState<'all' | 'single'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    imageUrl: '',
    deepLink: '',
    isScheduled: false,
    scheduledDate: ''
  });

  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter users for search
  const filteredUsers = searchQuery.trim() === '' 
    ? [] 
    : users.filter(u => 
        u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery)
      ).slice(0, 5); // Limit results

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchQuery('');
    setShowUserDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetType === 'single' && !selectedUser) return;

    setIsSending(true);

    try {
      await marketingStore.sendNotification({
        target: {
          type: targetType,
          userId: selectedUser?.id,
          userName: selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : undefined
        },
        title: formData.title,
        body: formData.message,
        imageUrl: formData.imageUrl,
        deepLink: formData.deepLink,
        scheduledAt: formData.isScheduled && formData.scheduledDate ? new Date(formData.scheduledDate).getTime() : undefined
      });

      // Show success
      setSuccessMessage(
        targetType === 'all' 
          ? 'Notification queued for all users' 
          : `Notification queued for ${selectedUser?.firstName}`
      );
      
      // Reset form partially
      setFormData({
        title: '',
        message: '',
        imageUrl: '',
        deepLink: '',
        isScheduled: false,
        scheduledDate: ''
      });
      setSelectedUser(null);
      
      // Hide success message after 3s
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  // Format date for history
  const formatHistoryDate = (ts: number) => {
    return new Date(ts).toLocaleString('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Send Marketing Notifications</h1>
        <p className="text-slate-400 text-sm">Create and send promotional messages to users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Recipient Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recipients</label>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 w-full sm:w-fit">
                  <button
                    type="button"
                    onClick={() => setTargetType('all')}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                      targetType === 'all' 
                        ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('single')}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                      targetType === 'single' 
                        ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Single User
                  </button>
                </div>

                {/* Single User Search */}
                <AnimatePresence mode="wait">
                  {targetType === 'single' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-visible"
                    >
                      {!selectedUser ? (
                        <div className="relative" ref={dropdownRef}>
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                          <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setShowUserDropdown(true);
                            }}
                            onFocus={() => setShowUserDropdown(true)}
                            placeholder="Search user by name, email, or phone..."
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors"
                          />
                          
                          {/* Dropdown Results */}
                          <AnimatePresence>
                            {showUserDropdown && searchQuery && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                              >
                                {filteredUsers.length > 0 ? (
                                  filteredUsers.map(user => (
                                    <button
                                      key={user.id}
                                      type="button"
                                      onClick={() => handleUserSelect(user)}
                                      className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center gap-3 transition-colors"
                                    >
                                      <AvatarInitial name={`${user.firstName} ${user.lastName}`} className="w-8 h-8 text-xs" />
                                      <div>
                                        <div className="text-sm font-medium text-white">{user.firstName} {user.lastName}</div>
                                        <div className="text-xs text-slate-500">{user.email}</div>
                                      </div>
                                      <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {user.status}
                                      </span>
                                    </button>
                                  ))
                                ) : (
                                  <div className="p-4 text-center text-slate-500 text-sm">No users found</div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-slate-800/50 border border-primary/30 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <AvatarInitial name={`${selectedUser.firstName} ${selectedUser.lastName}`} className="w-10 h-10 text-sm" />
                            <div>
                              <div className="font-bold text-white text-sm">{selectedUser.firstName} {selectedUser.lastName}</div>
                              <div className="text-xs text-slate-400">{selectedUser.email}</div>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setSelectedUser(null)}
                            className="p-2 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Message Content */}
              <div className="space-y-4 pt-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message</label>
                  <textarea required rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Image URL (Optional)</label>
                    <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deep Link (Optional)</label>
                    <input type="text" value={formData.deepLink} onChange={e => setFormData({...formData, deepLink: e.target.value})} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="schedule" checked={formData.isScheduled} onChange={e => setFormData({...formData, isScheduled: e.target.checked})} className="w-4 h-4 rounded border-slate-700 text-primary focus:ring-primary bg-slate-900" />
                  <label htmlFor="schedule" className="text-sm font-medium text-slate-300">Schedule for later</label>
                </div>
                {formData.isScheduled && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule Date & Time</label>
                    <input required type="datetime-local" value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                  </div>
                )}
                <button type="submit" disabled={isSending} className="w-full mt-4 bg-primary hover:bg-sky-400 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
                  {isSending ? <CheckCircle className="animate-spin" size={20} /> : <Send size={20} />}
                  <span>{isSending ? 'Sending...' : 'Send Notification'}</span>
                </button>
                {successMessage && <div className="text-emerald-400 text-center text-sm font-medium mt-2">{successMessage}</div>}
              </div>
            </form>
          </div>
        </div>
        
        {/* Right Column: History */}
        <div className="lg:col-span-1">
           <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-xl h-full max-h-[800px] flex flex-col">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><History size={20} /> History</h2>
              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                 {history.length > 0 ? history.map(item => (
                   <div key={item.id} className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-2">
                     <div className="flex justify-between items-start">
                       <h3 className="text-sm font-bold text-white">{item.title}</h3>
                       <span className="text-[10px] text-slate-500">{formatHistoryDate(item.createdAt)}</span>
                     </div>
                     <p className="text-xs text-slate-400 line-clamp-2">{item.body}</p>
                     <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full capitalize">{item.target.type}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400' : item.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>{item.status}</span>
                     </div>
                   </div>
                 )) : <div className="text-center text-slate-500 text-sm py-10">No history available</div>}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AdminMarketingNotifications;