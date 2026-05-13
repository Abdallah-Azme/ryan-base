"use client";

// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Filter } from 'lucide-react';
import NotificationItem from '../components/NotificationItem';
import NotificationSheet from '../components/NotificationSheet';
import { notificationStore, useNotifications, Notification } from '../lib/notificationStore';
import { useTranslation } from '../lib/i18nContext';

type FilterType = 'all' | 'unread' | 'system';

const Notifications: React.FC = () => {
  const { notifications } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const { t } = useTranslation();

  const filteredNotifications = notifications.filter(n => {
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

  return (
    <>
      <div className="flex flex-col h-full pb-24 relative overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-6 py-5 border-b border-white/5 flex flex-col gap-4 shadow-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">{t('notif.title')}</h1>
            <button 
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-primary flex items-center gap-1 hover:text-blue-300 transition-colors bg-primary/10 px-3 py-1.5 rounded-lg"
            >
              <CheckCheck size={14} />
              <span>{t('notif.mark_all')}</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex space-x-2 rtl:space-x-reverse no-scrollbar overflow-x-auto">
            {(['all', 'unread', 'system'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                  activeFilter === filter
                    ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(29,183,240,0.3)]'
                    : 'bg-slate-800 text-slate-400 border-white/5 hover:border-white/20'
                } capitalize`}
              >
                {t(`notif.filter_${filter}`)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="p-4">
          <AnimatePresence mode='popLayout'>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <NotificationItem 
                  key={n.id} 
                  notification={n} 
                  onClick={handleOpen}
                  onDismiss={handleDismiss}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-slate-500"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                  <CheckCheck size={32} className="opacity-50" />
                </div>
                <p>{t('notif.empty')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Sheet */}
      {selectedNotification && (
        <NotificationSheet 
          notification={selectedNotification} 
          onClose={() => setSelectedNotification(null)} 
        />
      )}
    </>
  );
};

export default Notifications;
