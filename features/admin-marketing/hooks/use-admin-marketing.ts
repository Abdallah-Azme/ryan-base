import { useState, useEffect, useRef } from 'react';
import { marketingStore, useMarketingHistory } from '@/lib/marketingNotifications';
import { useUsers, User } from '@/lib/userStore';
import { NotificationValues } from '../schemas/notification.schema';

export function useAdminMarketing() {
  const { history } = useMarketingHistory();
  const { users } = useUsers();

  const [targetType, setTargetType] = useState<'all' | 'single'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [formData, setFormData] = useState<NotificationValues>({
    title: '',
    message: '',
    imageUrl: '',
    deepLink: '',
    isScheduled: false,
    scheduledDate: '',
  });

  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredUsers =
    searchQuery.trim() === ''
      ? []
      : users
          .filter(
            (u) =>
              u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.phone.includes(searchQuery)
          )
          .slice(0, 5);

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

  const handleSubmit = async (data: NotificationValues) => {
    if (targetType === 'single' && !selectedUser) return;

    setIsSending(true);

    try {
      await marketingStore.sendNotification({
        target: {
          type: targetType,
          userId: selectedUser?.id,
          userName: selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : undefined,
        },
        title: data.title,
        body: data.message,
        imageUrl: data.imageUrl,
        deepLink: data.deepLink,
        scheduledAt:
          data.isScheduled && data.scheduledDate
            ? new Date(data.scheduledDate).getTime()
            : undefined,
      });

      setSuccessMessage(
        targetType === 'all'
          ? 'Notification queued for all users'
          : `Notification queued for ${selectedUser?.firstName}`
      );

      setFormData({
        title: '',
        message: '',
        imageUrl: '',
        deepLink: '',
        isScheduled: false,
        scheduledDate: '',
      });
      setSelectedUser(null);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const formatHistoryDate = (ts: number) => {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
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
  };
}
