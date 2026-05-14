import React from 'react';
import { useAdminMarketing } from '../hooks/use-admin-marketing';
import NotificationComposer from './notification-composer';
import SentNotificationsList from './sent-notifications-list';

export default function AdminMarketingPage() {
  const {
    history,
    targetType,
    setTargetType,
    selectedUser,
    setSelectedUser,
    searchQuery,
    setSearchQuery,
    showUserDropdown,
    setShowUserDropdown,
    formData,
    setFormData,
    isSending,
    successMessage,
    dropdownRef,
    filteredUsers,
    handleUserSelect,
    handleSubmit,
    formatHistoryDate,
  } = useAdminMarketing();

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white">Send Marketing Notifications</h1>
        <p className="text-slate-400 text-sm">Create and send promotional messages to users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <NotificationComposer
          targetType={targetType}
          setTargetType={setTargetType}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showUserDropdown={showUserDropdown}
          setShowUserDropdown={setShowUserDropdown}
          dropdownRef={dropdownRef}
          filteredUsers={filteredUsers}
          handleUserSelect={handleUserSelect}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          isSending={isSending}
          successMessage={successMessage}
        />

        <SentNotificationsList history={history} formatHistoryDate={formatHistoryDate} />
      </div>
    </div>
  );
}
