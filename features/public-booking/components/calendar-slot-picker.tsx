import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface CalendarSlotPickerProps {
  viewDate: Date;
  selectedDate: Date | null;
  selectedTime: string | null;
  availableSlots: string[];
  loadingSlots: boolean;
  settings: any;
  dir: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
  getCalendarRows: () => Date[][];
}

export default function CalendarSlotPicker({
  viewDate,
  selectedDate,
  selectedTime,
  availableSlots,
  loadingSlots,
  settings,
  dir,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onSelectTime,
  getCalendarRows,
}: CalendarSlotPickerProps) {
  const calendarRows = getCalendarRows();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  const monthLabel = viewDate.toLocaleDateString(dir === 'rtl' ? 'ar-KW' : 'en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={onPrevMonth} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-white/5">
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-bold uppercase tracking-wide">{monthLabel}</h3>
          <button type="button" onClick={onNextMonth} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-white/5">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-2 text-center text-xs font-bold text-slate-500 uppercase">
          {weekDays.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="space-y-2">
          {calendarRows.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-5 gap-2">
              {row.map((date, cIdx) => {
                const isCurrent = date.getMonth() === viewDate.getMonth();
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isPast = date < today;

                const dayConfig = settings.weeklyAvailability?.[date.getDay()];
                const isDayEnabled = dayConfig?.enabled;
                const isClickable = isCurrent && !isPast && isDayEnabled;

                return (
                  <button
                    type="button"
                    key={cIdx}
                    onClick={() => isClickable && onSelectDate(date)}
                    disabled={!isClickable}
                    className={`h-10 rounded-xl flex flex-col items-center justify-center border transition-all ${
                      !isCurrent
                        ? 'opacity-0 pointer-events-none'
                        : isSelected
                        ? 'bg-primary border-primary text-white shadow-lg'
                        : isClickable
                        ? 'bg-slate-800 text-slate-300 border-white/5 hover:bg-slate-700'
                        : 'bg-slate-900/50 text-slate-600 border-transparent cursor-not-allowed'
                    }`}
                  >
                    <span className="text-sm font-bold">{date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedDate ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="text-white font-bold">Select Time</h3>
          {loadingSlots ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-4 text-slate-500 bg-slate-800/30 rounded-xl">No slots available</div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.map((time) => (
                <button
                  type="button"
                  key={time}
                  onClick={() => onSelectTime(time)}
                  className={`py-3 rounded-xl border font-medium text-sm transition-all ${
                    selectedTime === time
                      ? 'bg-primary text-white border-primary shadow-lg'
                      : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
