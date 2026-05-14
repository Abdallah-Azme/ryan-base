import React from 'react';
import { motion } from 'framer-motion';
import { Info, CheckCircle, AlertTriangle, MessageCircle, CreditCard, X } from 'lucide-react';
import { Notification, NotificationType } from '@/lib/notificationStore';
import { useTranslation } from '@/lib/i18nContext';

interface NotificationListItemProps {
  notification: Notification;
  onClick: (n: Notification) => void;
  onDismiss: (e: React.MouseEvent, id: string) => void;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={20} className="text-emerald-400" />;
    case 'warning':
      return <AlertTriangle size={20} className="text-amber-400" />;
    case 'message':
      return <MessageCircle size={20} className="text-blue-400" />;
    case 'payment':
      return <CreditCard size={20} className="text-purple-400" />;
    case 'system':
    default:
      return <Info size={20} className="text-slate-400" />;
  }
};

export default function NotificationListItem({ notification, onClick, onDismiss }: NotificationListItemProps) {
  const { id, type, title, message, timestamp, read } = notification;
  const { t, dir } = useTranslation();

  const getTimeLabel = (ts: number) => {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('notif.just_now');
    if (minutes < 60) return `${minutes} ${t('notif.ago_m')}`;
    if (hours < 24) return `${hours} ${t('notif.ago_h')}`;
    if (days === 1) return t('notif.yesterday');
    return `${days} ${t('notif.ago_d')}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: dir === 'rtl' ? 100 : -100 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(notification)}
      className={`group relative p-4 rounded-2xl mb-3 cursor-pointer border transition-all duration-300 ${
        !read ? 'bg-slate-800/60 border-primary/30 shadow-[0_0_15px_rgba(29,183,240,0.1)]' : 'bg-slate-800/30 border-white/5 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-white/5 ${
            !read ? 'bg-slate-700/50' : 'bg-slate-800/50'
          }`}
        >
          {getIcon(type)}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex justify-between items-start mb-0.5">
            <h4 className={`text-sm truncate pe-2 rtl:pe-0 rtl:ps-2 ${!read ? 'text-white font-bold' : 'text-slate-300 font-medium'}`}>
              {title}
            </h4>
            <span className="text-[10px] text-slate-500 shrink-0 whitespace-nowrap">{getTimeLabel(timestamp)}</span>
          </div>
          <p className="text-xs text-slate-400 truncate leading-relaxed">{message}</p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
          {!read ? <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(29,183,240,0.8)]" /> : null}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => onDismiss(e, id)}
        className="absolute top-2 end-2 p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
