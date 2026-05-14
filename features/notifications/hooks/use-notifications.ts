import { useState } from 'react';
import { notificationStore, useNotifications as useStoreNotifications, Notification } from '@/lib/notificationStore';
import { useTranslation } from '@/lib/i18nContext';

export type NotificationFilterType = 'all' | 'unread' | 'system';

export function useNotifications() {
  const { notifications } = useStoreNotifications();
  const [activeFilter, setActiveFilter] = useState<NotificationFilterType>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const { t, dir } = useTranslation();

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'system') return n.type === 'system' || n.type === 'warning';
    return true;
  });

  const handleOpen = (n: Notification) => {
    notificationStore.markAsRead(n.id);
    setSelectedNotification(n);
  };

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    notificationStore.dismiss(id);
  };

  const handleMarkAllRead = () => {
    notificationStore.markAllAsRead();
  };

  return {
    t,
    dir,
    filteredNotifications,
    activeFilter,
    setActiveFilter,
    selectedNotification,
    setSelectedNotification,
    handleOpen,
    handleDismiss,
    handleMarkAllRead,
  };
}
