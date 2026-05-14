import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CheckCircle, Send } from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import { User } from '@/lib/userStore';

interface NotificationComposerProps {
  targetType: 'all' | 'single';
  setTargetType: React.Dispatch<React.SetStateAction<'all' | 'single'>>;
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  showUserDropdown: boolean;
  setShowUserDropdown: (val: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  filteredUsers: User[];
  handleUserSelect: (user: User) => void;
  formData: {
    title: string;
    message: string;
    imageUrl: string;
    deepLink: string;
    isScheduled: boolean;
    scheduledDate: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      title: string;
      message: string;
      imageUrl: string;
      deepLink: string;
      isScheduled: boolean;
      scheduledDate: string;
    }>
  >;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSending: boolean;
  successMessage: string | null;
}

export default function NotificationComposer({
  targetType,
  setTargetType,
  selectedUser,
  setSelectedUser,
  searchQuery,
  setSearchQuery,
  showUserDropdown,
  setShowUserDropdown,
  dropdownRef,
  filteredUsers,
  handleUserSelect,
  formData,
  setFormData,
  handleSubmit,
  isSending,
  successMessage,
}: NotificationComposerProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
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

            <AnimatePresence mode="wait">
              {targetType === 'single' ? (
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

                      <AnimatePresence>
                        {showUserDropdown && searchQuery ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                          >
                            {filteredUsers.length > 0 ? (
                              filteredUsers.map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => handleUserSelect(user)}
                                  className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center gap-3 transition-colors"
                                >
                                  <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" className="w-8 h-8 text-xs" />
                                  <div>
                                    <div className="text-sm font-medium text-white">
                                      {user.firstName} {user.lastName}
                                    </div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                  </div>
                                  <span
                                    className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                                      user.status === 'Active'
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-red-500/10 text-red-400'
                                    }`}
                                  >
                                    {user.status}
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="p-4 text-center text-slate-500 text-sm">No users found</div>
                            )}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-800/50 border border-primary/30 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={`${selectedUser.firstName} ${selectedUser.lastName}`}
                          size="md"
                          className="w-10 h-10 text-sm"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">
                            {selectedUser.firstName} {selectedUser.lastName}
                          </div>
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
              ) : null}
            </AnimatePresence>
          </div>

          <div className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Deep Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.deepLink}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deepLink: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="schedule"
                checked={formData.isScheduled}
                onChange={(e) => setFormData((prev) => ({ ...prev, isScheduled: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-700 text-primary focus:ring-primary bg-slate-900"
              />
              <label htmlFor="schedule" className="text-sm font-medium text-slate-300">
                Schedule for later
              </label>
            </div>
            {formData.isScheduled ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Schedule Date & Time
                </label>
                <input
                  required
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            ) : null}
            <button
              type="submit"
              disabled={isSending}
              className="w-full mt-4 bg-primary hover:bg-sky-400 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isSending ? <CheckCircle className="animate-spin" size={20} /> : <Send size={20} />}
              <span>{isSending ? 'Sending...' : 'Send Notification'}</span>
            </button>
            {successMessage ? (
              <div className="text-emerald-400 text-center text-sm font-medium mt-2">{successMessage}</div>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
