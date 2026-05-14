import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Notification } from '@/lib/notificationStore';
import { useTranslation } from '@/lib/i18nContext';

interface NotificationSheetProps {
  notification: Notification | null;
  onClose: () => void;
}

export default function NotificationSheet({ notification, onClose }: NotificationSheetProps) {
  const { t, dir } = useTranslation();
  if (!notification) return null;

  const dateStr = new Date(notification.timestamp).toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = new Date(notification.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        dir={dir}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[380px] bg-[#0f172a] rounded-3xl border border-white/10 p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <div className="flex items-start justify-between mb-6 relative z-10">
            <h2 className="text-xl font-bold text-white leading-tight pe-4 rtl:pe-0 rtl:ps-4">{notification.title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6 text-xs text-slate-400 relative z-10">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Calendar size={14} />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Clock size={14} />
              <span>{timeStr}</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5 mb-8 relative z-10">
            <p className="text-slate-300 leading-relaxed text-sm">{notification.message}</p>
          </div>

          <div className="flex space-x-3 rtl:space-x-reverse relative z-10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl bg-slate-800 text-white font-medium text-sm hover:bg-slate-700 transition-colors border border-white/5"
            >
              {t('notif.dismiss')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl bg-primary text-white font-medium text-sm shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_25px_rgba(29,183,240,0.5)] transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <span>{t('notif.view_details')}</span>
              {dir === 'rtl' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
