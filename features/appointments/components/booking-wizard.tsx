import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, ChevronLeft, Loader2, CheckCircle, X, AlertTriangle, Video, MapPin } from 'lucide-react';
import { useBookingWizard } from '../hooks/use-booking-wizard';

interface BookingWizardProps {
  onClose: () => void;
}

export default function BookingWizard({ onClose }: BookingWizardProps) {
  const {
    t,
    dir,
    settings,
    step,
    setStep,
    selectedDate,
    setSelectedDate,
    availableSlots,
    selectedTime,
    setSelectedTime,
    loadingSlots,
    isSubmitting,
    errorMsg,
    viewDate,
    formData,
    setFormData,
    currentUser,
    handleBook,
    handlePrevMonth,
    handleNextMonth,
    getCalendarRows,
  } = useBookingWizard(onClose);

  const calendarRows = getCalendarRows();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  const monthLabel = viewDate.toLocaleDateString(dir === 'rtl' ? 'ar-KW' : 'en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="fixed inset-0 z-[60] bg-[#020617] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md shrink-0">
        <button type="button" onClick={onClose} className="p-2 -ms-2 text-slate-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-white font-bold text-lg">{t('appt.book_btn')}</h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="flex justify-center gap-2 mb-8 shrink-0">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-slate-800'}`}
            />
          ))}
        </div>

        {errorMsg ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 flex items-start gap-3"
          >
            <AlertTriangle className="text-red-400 shrink-0" size={20} />
            <span className="text-red-400 text-sm font-medium">{errorMsg}</span>
          </motion.div>
        ) : null}

        {step === 1 ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-white/5"
                >
                  <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                </button>
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">{monthLabel}</h3>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-white/5"
                >
                  <ChevronRight size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {calendarRows.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-5 gap-2">
                    {row.map((date, cIdx) => {
                      const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      const isToday = date.toDateString() === today.toDateString();
                      const isPast = date < today;

                      const dayIndex = date.getDay();
                      const wa = settings.weeklyAvailability || {};
                      const dayConfig = wa[dayIndex] ?? wa[String(dayIndex)];
                      const isDayEnabled = dayConfig?.enabled;

                      const isClickable = isCurrentMonth && !isPast && isDayEnabled;

                      return (
                        <button
                          type="button"
                          key={cIdx}
                          onClick={() => isClickable && setSelectedDate(date)}
                          disabled={!isClickable}
                          className={`h-9 rounded-xl flex flex-col items-center justify-center border transition-all relative overflow-hidden ${
                            !isCurrentMonth
                              ? 'border-transparent text-slate-700 opacity-30 cursor-default'
                              : isSelected
                              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                              : isClickable
                              ? 'bg-slate-800 text-slate-300 border-white/5 hover:bg-slate-700'
                              : 'bg-slate-900/50 text-slate-600 border-transparent cursor-not-allowed'
                          }`}
                        >
                          <span className={`text-sm font-bold ${isToday && !isSelected ? 'text-primary' : ''}`}>
                            {date.getDate()}
                          </span>
                          {isToday ? <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {selectedDate ? (
                <motion.div
                  key="time-selection"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="border-t border-white/5 pt-6">
                    <h3 className="text-xl font-bold text-white mb-2">{t('appt.step_time')}</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      {selectedDate.toLocaleDateString(dir === 'rtl' ? 'ar-KW' : 'en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>

                    {loadingSlots ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-primary" size={24} />
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 bg-slate-800/30 rounded-xl border border-white/5">
                        <Clock size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No slots available on this date.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {availableSlots.map((time) => (
                          <button
                            type="button"
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 rounded-xl border font-medium text-sm transition-all ${
                              selectedTime === time
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}

        {step === 2 ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-2">{t('appt.step_details')}</h3>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-primary font-bold text-sm">
                  {selectedDate?.toLocaleDateString(dir === 'rtl' ? 'ar-KW' : 'en-US', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
                <p className="text-white text-lg font-bold">{selectedTime}</p>
              </div>
              <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-400 underline hover:text-white">
                Change
              </button>
            </div>

            {!currentUser ? (
              <div className="space-y-4 p-4 bg-slate-800/30 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">{t('appt.guest_name')}</label>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">{t('appt.guest_email')}</label>
                  <input
                    type="email"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">{t('appt.guest_phone')}</label>
                  <input
                    type="tel"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-1">
              <label className="text-xs text-slate-400">{t('appt.topic_label')}</label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                placeholder="e.g. Project Consultation"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Meeting Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, meetingType: 'online' })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    formData.meetingType === 'online' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-800 border-white/10 text-slate-400'
                  }`}
                >
                  <Video size={20} />
                  <span className="text-xs font-bold">{t('appt.type_online')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, meetingType: 'in_person' })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    formData.meetingType === 'in_person' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-800 border-white/10 text-slate-400'
                  }`}
                >
                  <MapPin size={20} />
                  <span className="text-xs font-bold">{t('appt.type_inperson')}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">{t('appt.notes_label')}</label>
              <textarea
                className="w-full h-24 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </motion.div>
        ) : null}

        {step === 3 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 space-y-6">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/30">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white">{t('appt.booking_success')}</h2>
            <button type="button" onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Done
            </button>
          </motion.div>
        ) : null}
      </div>

      {step < 3 ? (
        <div className="p-6 border-t border-white/5 bg-[#0f172a] flex justify-between gap-4">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className={`px-6 py-3 rounded-xl font-bold text-slate-400 transition-colors ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'hover:text-white'
            }`}
          >
            {t('auth.back')}
          </button>
          <button
            type="button"
            onClick={step === 2 ? handleBook : () => setStep(step + 1)}
            disabled={
              (step === 1 && (!selectedDate || !selectedTime)) ||
              (step === 2 && (!formData.topic || (!currentUser && (!formData.guestName || !formData.guestEmail)))) ||
              isSubmitting
            }
            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_25px_rgba(29,183,240,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : step === 2 ? t('appt.confirm_btn') : t('wizard.next')}
            {step < 2 && !isSubmitting ? dir === 'rtl' ? <ChevronLeft size={18} /> : <ChevronRight size={18} /> : null}
          </button>
        </div>
      ) : null}
    </div>
  );
}
