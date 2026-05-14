import React from 'react';
import { useTranslation } from '@/lib/i18nContext';

interface DayDividerProps {
  date: number;
}

const safelyFormatDate = (timestamp: number) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  } catch (e) {
    return '';
  }
};

export default function DayDivider({ date }: DayDividerProps) {
  const dateStr = safelyFormatDate(date);
  const isToday = new Date().toDateString() === new Date(date).toDateString();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center my-6 opacity-70">
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent w-full max-w-[100px]" />
      <span className="mx-3 text-[10px] font-medium text-slate-500 uppercase tracking-widest">
        {isToday ? t('chat.today') : dateStr}
      </span>
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent w-full max-w-[100px]" />
    </div>
  );
}
