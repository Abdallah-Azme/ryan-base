import React from 'react';
import { History } from 'lucide-react';
import { NotificationPayload } from '@/lib/marketingNotifications';
import SentNotificationItem from './sent-notification-item';

interface SentNotificationsListProps {
  history: NotificationPayload[];
  formatHistoryDate: (ts: number) => string;
}

export default function SentNotificationsList({
  history,
  formatHistoryDate,
}: SentNotificationsListProps) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-xl h-full max-h-[800px] flex flex-col">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <History size={20} /> History
        </h2>
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
          {history.length > 0 ? (
            history.map((item) => (
              <SentNotificationItem key={item.id} item={item} formatHistoryDate={formatHistoryDate} />
            ))
          ) : (
            <div className="text-center text-slate-500 text-sm py-10">No history available</div>
          )}
        </div>
      </div>
    </div>
  );
}
