import React from 'react';
import { NotificationPayload } from '@/lib/marketingNotifications';

interface SentNotificationItemProps {
  item: NotificationPayload;
  formatHistoryDate: (ts: number) => string;
}

export default function SentNotificationItem({ item, formatHistoryDate }: SentNotificationItemProps) {
  return (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-bold text-white">{item.title}</h3>
        <span className="text-[10px] text-slate-500">{formatHistoryDate(item.createdAt)}</span>
      </div>
      <p className="text-xs text-slate-400 line-clamp-2">{item.body}</p>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full capitalize">
          {item.target.type}
        </span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${
            item.status === 'sent'
              ? 'bg-emerald-500/10 text-emerald-400'
              : item.status === 'scheduled'
              ? 'bg-blue-500/10 text-blue-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {item.status}
        </span>
      </div>
    </div>
  );
}
