import React from 'react';
import { motion } from 'framer-motion';
import { X, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { User } from '@/lib/userStore';
import { UserProject } from '@/lib/userProjectsStore';
import UserProfileTab from './user-profile-tab';
import UserProjectsTab from './user-projects-tab';

interface UserDetailDrawerProps {
  selectedUser: User;
  onClose: () => void;
  activeTab: 'profile' | 'projects';
  setActiveTab: (tab: 'profile' | 'projects') => void;
  loadingProjects: boolean;
  userProjects: UserProject[];
  formatDate: (ts: number) => string;
  formatDateTime: (ts: number) => string;
  onToggleStatus: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export default function UserDetailDrawer({
  selectedUser,
  onClose,
  activeTab,
  setActiveTab,
  loadingProjects,
  userProjects,
  formatDate,
  formatDateTime,
  onToggleStatus,
  onDeleteUser,
}: UserDetailDrawerProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#0f172a] border-l border-white/10 shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">User Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-white/5 bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Profile Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'projects'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Projects ({selectedUser.projectsCount || 0})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' ? (
            <UserProfileTab
              selectedUser={selectedUser}
              formatDate={formatDate}
              formatDateTime={formatDateTime}
            />
          ) : (
            <UserProjectsTab
              loadingProjects={loadingProjects}
              userProjects={userProjects}
              formatDate={formatDate}
            />
          )}
        </div>

        {activeTab === 'profile' ? (
          <div className="p-6 border-t border-white/5 bg-[#0f172a]">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onToggleStatus(selectedUser)}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                  selectedUser.status === 'Active'
                    ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
                }`}
              >
                {selectedUser.status === 'Active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                {selectedUser.status === 'Active' ? 'Disable Account' : 'Activate Account'}
              </button>
              <button
                type="button"
                onClick={() => onDeleteUser(selectedUser.id)}
                className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        ) : null}
      </motion.div>
    </>
  );
}
