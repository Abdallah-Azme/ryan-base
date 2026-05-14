import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck } from 'lucide-react';
import EmptyState from '@/components/ui/empty-state';
import { useNotifications, NotificationFilterType } from '../hooks/use-notifications';
import NotificationListItem from './notification-list-item';
import NotificationSheet from './notification-sheet';

export default function NotificationsPage() {
  const {
    t,
    filteredNotifications,
    activeFilter,
    setActiveFilter,
    selectedNotification,
    setSelectedNotification,
    handleOpen,
    handleDismiss,
    handleMarkAllRead,
  } = useNotifications();

  const filters: NotificationFilterType[] = ['all', 'unread', 'system'];

  return (
    <>
      <div className="flex flex-col h-full pb-24 relative overflow-y-auto no-scrollbar">
        <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-6 py-5 border-b border-white/5 flex flex-col gap-4 shadow-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">{t('notif.title')}</h1>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-primary flex items-center gap-1 hover:text-blue-300 transition-colors bg-primary/10 px-3 py-1.5 rounded-lg"
            >
              <CheckCheck size={14} />
              <span>{t('notif.mark_all')}</span>
            </button>
          </div>

          <div className="flex space-x-2 rtl:space-x-reverse no-scrollbar overflow-x-auto">
            {filters.map((filter) => (
              <button
                type="button"
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

        <div className="p-4">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <NotificationListItem
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
                <EmptyState
                  icon={<CheckCheck size={32} className="opacity-50" />}
                  title={t('notif.empty')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {selectedNotification ? (
        <NotificationSheet
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      ) : null}
    </>
  );
}
