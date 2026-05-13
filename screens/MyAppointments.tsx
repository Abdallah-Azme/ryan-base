"use client";

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, MapPin, X, ChevronRight, ChevronLeft, Loader2, CheckCircle, Plus, AlertTriangle } from 'lucide-react';
import { useAppointments, appointmentStore } from '../lib/appointmentStore';
import { useTranslation } from '../lib/i18nContext';
import ConfirmModal from '../components/ConfirmModal';
import { auth, app } from '../lib/firebase-client';

const BookingWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t, dir } = useTranslation();
  const { settings } = useAppointments();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Calendar View State
  const [viewDate, setViewDate] = useState(new Date());

  const [formData, setFormData] = useState({
    topic: '',
    meetingType: 'online', // online | in_person
    notes: '',
    // Guest fields
    guestName: '',
    guestEmail: '',
    guestPhone: ''
  });

  const currentUser = auth.currentUser;

  // Fetch slots when date changes
  useEffect(() => {
    let isActive = true;

    const fetchSlots = async () => {
      if (!selectedDate) {
        setAvailableSlots([]);
        return;
      }

      // Reset time selection when date changes
      setSelectedTime(null);
      setLoadingSlots(true);
      setAvailableSlots([]);

      try {
        const slots = await appointmentStore.getAvailableSlots(selectedDate);
        if (isActive) {
          setAvailableSlots(slots);
        }
      } catch (error) {
        console.error("Failed to load time slots:", error);
        if (isActive) {
          setAvailableSlots([]);
        }
      } finally {
        if (isActive) {
          setLoadingSlots(false);
        }
      }
    };

    fetchSlots();

    return () => {
      isActive = false;
    };
  }, [selectedDate]);

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await appointmentStore.bookAppointment({
        date: selectedDate,
        time: selectedTime,
        ...formData
      });
      setStep(3); // Success
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Booking failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  // --- Calendar Logic ---
  const handlePrevMonth = () => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    setViewDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    setViewDate(newDate);
  };

  const getCalendarRows = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Start grid at the Sunday of the first week
    const startGridDate = new Date(firstDayOfMonth);
    startGridDate.setDate(1 - firstDayOfMonth.getDay()); // Adjust to Sunday

    const rows: Date[][] = [];
    let current = new Date(startGridDate);

    // Generate up to 6 rows to cover any month configuration
    for (let i = 0; i < 6; i++) {
      const week: Date[] = [];
      for (let j = 0; j < 7; j++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      
      // Filter to keep only Sun(0) -> Thu(4) (5 days)
      const workDays = week.slice(0, 5);
      
      // Stop generating rows if the entire work week belongs to the next month
      if (workDays[0].getMonth() !== month && workDays[0] > firstDayOfMonth) {
        break;
      }
      
      rows.push(workDays);
    }
    return rows;
  };

  const calendarRows = getCalendarRows();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  const monthLabel = viewDate.toLocaleDateString(dir === 'rtl' ? 'ar-KW' : 'en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div className="fixed inset-0 z-[60] bg-[#020617] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-white font-bold text-lg">{t('appt.book_btn')}</h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32">
        
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8 shrink-0">
          {[1, 2].map(i => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-slate-800'}`} />
          ))}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 flex items-start gap-3"
          >
            <AlertTriangle className="text-red-400 shrink-0" size={20} />
            <span className="text-red-400 text-sm font-medium">{errorMsg}</span>
          </motion.div>
        )}

        {/* Step 1: Date & Time (Unified) */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            
            {/* Calendar Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <button onClick={handlePrevMonth} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-white/5">
                   <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                </button>
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">{monthLabel}</h3>
                <button onClick={handleNextMonth} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-white/5">
                   <ChevronRight size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                </button>
              </div>

              {/* Grid Header */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid Body */}
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
                          key={cIdx}
                          onClick={() => isClickable && setSelectedDate(date)}
                          disabled={!isClickable}
                          className={`
                            h-9 rounded-xl flex flex-col items-center justify-center border transition-all relative overflow-hidden
                            ${!isCurrentMonth 
                               ? 'border-transparent text-slate-700 opacity-30 cursor-default' // Padding cells
                               : isSelected 
                                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' // Selected
                                  : isClickable
                                    ? 'bg-slate-800 text-slate-300 border-white/5 hover:bg-slate-700' // Available
                                    : 'bg-slate-900/50 text-slate-600 border-transparent cursor-not-allowed' // Disabled/Past
                            }
                          `}
                        >
                          <span className={`text-sm font-bold ${isToday && !isSelected ? 'text-primary' : ''}`}>
                            {date.getDate()}
                          </span>
                          {isToday && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Time Section - Appears below Calendar when selected */}
            <AnimatePresence mode="wait">
              {selectedDate && (
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
                      {selectedDate.toLocaleDateString(dir === 'rtl' ? 'ar-KW' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric'})}
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
                        {availableSlots.map(time => (
                          <button
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
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-2">{t('appt.step_details')}</h3>
            
            {/* Summary */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
               <div>
                 <p className="text-primary font-bold text-sm">
                   {selectedDate?.toLocaleDateString(dir === 'rtl' ? 'ar-KW' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                 </p>
                 <p className="text-white text-lg font-bold">{selectedTime}</p>
               </div>
               <button onClick={() => setStep(1)} className="text-xs text-slate-400 underline hover:text-white">Change</button>
            </div>

            {/* Guest Fields */}
            {!currentUser && (
              <div className="space-y-4 p-4 bg-slate-800/30 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">{t('appt.guest_name')}</label>
                  <input type="text" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                    value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">{t('appt.guest_email')}</label>
                  <input type="email" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                    value={formData.guestEmail} onChange={e => setFormData({...formData, guestEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">{t('appt.guest_phone')}</label>
                  <input type="tel" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                    value={formData.guestPhone} onChange={e => setFormData({...formData, guestPhone: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-slate-400">{t('appt.topic_label')}</label>
              <input type="text" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                placeholder="e.g. Project Consultation"
                value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Meeting Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({...formData, meetingType: 'online'})}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${formData.meetingType === 'online' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-800 border-white/10 text-slate-400'}`}
                >
                  <Video size={20} />
                  <span className="text-xs font-bold">{t('appt.type_online')}</span>
                </button>
                <button
                  onClick={() => setFormData({...formData, meetingType: 'in_person'})}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${formData.meetingType === 'in_person' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-800 border-white/10 text-slate-400'}`}
                >
                  <MapPin size={20} />
                  <span className="text-xs font-bold">{t('appt.type_inperson')}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">{t('appt.notes_label')}</label>
              <textarea className="w-full h-24 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none resize-none"
                value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 space-y-6">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/30">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white">{t('appt.booking_success')}</h2>
            <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Done
            </button>
          </motion.div>
        )}

      </div>

      {/* Footer Nav */}
      {step < 3 && (
        <div className="p-6 border-t border-white/5 bg-[#0f172a] flex justify-between gap-4">
          <button 
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className={`px-6 py-3 rounded-xl font-bold text-slate-400 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'hover:text-white'}`}
          >
            {t('auth.back')}
          </button>
          <button 
            onClick={step === 2 ? handleBook : () => setStep(step + 1)}
            disabled={
              (step === 1 && (!selectedDate || !selectedTime)) || 
              (step === 2 && (!formData.topic || (!currentUser && (!formData.guestName || !formData.guestEmail)))) || 
              isSubmitting
            }
            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_25px_rgba(29,183,240,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : (step === 2 ? t('appt.confirm_btn') : t('wizard.next'))}
            {step < 2 && !isSubmitting && (dir === 'rtl' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />)}
          </button>
        </div>
      )}
    </div>
  );
};

const MyAppointments: React.FC = () => {
  const { t, dir } = useTranslation();
  const { appointments } = useAppointments();
  const [showWizard, setShowWizard] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  const formatDate = (val: any) => {
    let ts;
    if (val && typeof val.toMillis === 'function') {
      ts = val.toMillis();
    } else if (typeof val === 'number') {
      ts = val;
    } else {
      ts = Date.now();
    }
    return new Date(ts).toLocaleDateString(dir === 'rtl' ? 'ar-KW' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const formatTime = (val: any) => {
    let ts;
    if (val && typeof val.toMillis === 'function') {
      ts = val.toMillis();
    } else if (typeof val === 'number') {
      ts = val;
    } else {
      ts = Date.now();
    }
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const initiateCancel = (id: string) => {
    setAppointmentToCancel(id);
    setShowCancel(true);
  };

  const handleCancel = async () => {
    if (appointmentToCancel) {
      await appointmentStore.cancelAppointment(appointmentToCancel);
      setShowCancel(false);
      setAppointmentToCancel(null);
    }
  };

  const upcomingAppointments = appointments || [];
  
  // Client-side guard: Check if any active appointment exists
  // We use endAt to allow booking immediately after the previous one finishes.
  const hasActiveBooking = upcomingAppointments.some(appt => {
    const endAtMs = appt.endAt?.toMillis ? appt.endAt.toMillis() : (typeof appt.endAt === 'number' ? appt.endAt : 0);
    return appt.status === 'confirmed' && endAtMs > Date.now();
  });

  const handleOpenWizard = () => {
    if (hasActiveBooking) {
      alert(t('appt.limit_error'));
      return;
    }
    setShowWizard(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
      className="flex flex-col h-full bg-[#020617] relative overflow-y-auto no-scrollbar pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-4 border-b border-white/5 flex items-center shadow-lg">
        <h1 className="text-xl font-bold text-white ml-2 rtl:mr-2 rtl:ml-0">{t('appt.title')}</h1>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('appt.active_title')}</h2>
            
            {upcomingAppointments.map((appt) => (
              <div key={appt.id} className="bg-slate-800/40 border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                        appt.meetingType === 'online' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {t(`appt.type_${appt.meetingType === 'online' ? 'online' : 'inperson'}`)}
                      </span>
                      <h3 className="text-2xl font-bold text-white leading-tight">{appt.topic}</h3>
                    </div>
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10">
                      <Calendar size={24} />
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Calendar size={18} className="text-primary" />
                      <span className="font-medium">{formatDate(appt.startAt)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Clock size={18} className="text-primary" />
                      <span className="font-medium">{formatTime(appt.startAt)} - {formatTime(appt.endAt)}</span>
                    </div>
                    {appt.notes && (
                      <div className="p-3 bg-slate-900/50 rounded-xl text-sm text-slate-400 italic">
                        "{appt.notes}"
                      </div>
                    )}
                  </div>

                  {appt.status !== 'cancelled' && (
                    <button 
                      onClick={() => initiateCancel(appt.id)}
                      className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-bold transition-colors border border-red-500/20"
                    >
                      {t('appt.cancel_btn')}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button
              onClick={handleOpenWizard}
              className={`w-full py-4 border rounded-2xl transition-colors flex items-center justify-center gap-2 ${
                hasActiveBooking 
                  ? 'bg-slate-900/50 border-white/5 text-slate-500 cursor-not-allowed opacity-70' 
                  : 'bg-slate-800/50 hover:bg-slate-800 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {hasActiveBooking ? <AlertTriangle size={20} /> : <Plus size={20} />}
              <span>{hasActiveBooking ? t('appt.complete_current') : t('appt.book_another')}</span>
            </button>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center border border-white/5 animate-pulse">
              <Calendar size={40} className="text-slate-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{t('appt.no_appts')}</h2>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">{t('appt.no_appts_sub')}</p>
            </div>
            <button
              onClick={handleOpenWizard}
              className="bg-primary text-white font-bold px-8 py-4 rounded-2xl shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_30px_rgba(29,183,240,0.5)] transition-all flex items-center gap-2"
            >
              <Calendar size={20} />
              {t('appt.book_btn')}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showWizard && <BookingWizard onClose={() => setShowWizard(false)} />}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showCancel}
        title={t('appt.cancel_btn')}
        message={t('appt.cancel_confirm')}
        confirmText="Yes, Cancel"
        isDestructive={true}
        onConfirm={handleCancel}
        onCancel={() => setShowCancel(false)}
      />
    </motion.div>
  );
};

export default MyAppointments;
