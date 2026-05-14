import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Download, AlertTriangle, User as UserIcon } from 'lucide-react';
import ConfirmModal from '@/components/ui/confirm-modal';
import { useAdminUsers } from '../hooks/use-admin-users';
import UsersFilterBar from './users-filter-bar';
import UsersTable from './users-table';
import UsersMobileList from './users-mobile-list';
import UserDetailDrawer from './user-detail-drawer';

export default function AdminUsersPage() {
  const {
    users,
    error,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    selectedUser,
    setSelectedUser,
    deleteId,
    setDeleteId,
    activeTab,
    setActiveTab,
    userProjects,
    loadingProjects,
    filteredUsers,
    formatDate,
    formatDateTime,
    handleExport,
    handleToggleStatus,
    handleDelete,
  } = useAdminUsers();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Users
            <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded-full border border-white/5">
              {users.length}
            </span>
          </h1>
          <p className="text-slate-400 text-sm">Registered accounts management.</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border border-white/5"
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={20} />
          <div>
            <h3 className="text-red-400 font-bold text-sm">Error Loading Users</h3>
            <p className="text-red-400/80 text-xs mt-1">{error}</p>
          </div>
        </div>
      ) : null}

      <UsersFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <div className="bg-[#0f172a] border border-white/5 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
              <UserIcon size={24} />
            </div>
            <p>{error ? 'Unable to load users.' : 'No users found matching your criteria.'}</p>
          </div>
        ) : (
          <>
            <UsersTable
              filteredUsers={filteredUsers}
              formatDate={formatDate}
              onSelectUser={setSelectedUser}
              onToggleStatus={handleToggleStatus}
              onDeleteUser={setDeleteId}
            />

            <UsersMobileList filteredUsers={filteredUsers} onSelectUser={setSelectedUser} />
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedUser ? (
          <UserDetailDrawer
            selectedUser={selectedUser}
            onClose={() => setSelectedUser(null)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loadingProjects={loadingProjects}
            userProjects={userProjects}
            formatDate={formatDate}
            formatDateTime={formatDateTime}
            onToggleStatus={handleToggleStatus}
            onDeleteUser={setDeleteId}
          />
        ) : null}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete User?"
        message="Are you sure you want to delete this user? This action cannot be undone and they will lose access immediately."
        confirmText="Delete User"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
