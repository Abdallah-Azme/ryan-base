"use client";

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, MapPin, X, ChevronRight, ChevronLeft, Loader2, CheckCircle, AlertTriangle, User, Mail, Phone, FileText } from 'lucide-react';
import { useAppointments, appointmentStore } from '../../lib/appointmentStore';
import { useTranslation } from '../../lib/i18nContext';
import { db } from '../../lib/firebase-client';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import PhoneInput from '../../components/PhoneInput';

const PublicBooking: React.FC = () => {
  const { t, dir } = useTranslation();
  const { settings } = useAppointments();
  
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  // Calendar View State
  const [viewDate, setViewDate] = useState(new Date());

  const [formData, setFormData] = useState({
    topic: '',
    meetingType: 'online', 
    notes: '',
    guestName: '',
    guestEmail: '',
    guestPhone: ''
  });

  // Fetch slots when date changes (Reusing logic from appointmentStore)
  useEffect(() => {
    let isActive = true;
    const fetchSlots = async () => {
      if (!selectedDate) {
        setAvailableSlots([]);
        return;
      }
      setSelectedTime(null);
      setLoadingSlots(true);
      setAvailableSlots([]);
      try {
        const slots = await appointmentStore.getAvailableSlots(selectedDate);
        if (isActive) setAvailableSlots(slots);
      } catch (error) {
        console.error("Failed to load time slots:", error);
      } finally {
        if (isActive) setLoadingSlots(false);
      }
    };
    fetchSlots();
    return () => { isActive = false; };
  }, [selectedDate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Format Date Key (YYYY-MM-DD)
      const dateKey = new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'Asia/Kuwait', 
        year: 'numeric', month: '2-digit', day: '2-digit' 
      }).format(selectedDate);

      // 2. Calculate Timestamps
      // Time is usually HH:mm (24h) from availableSlots
      const isoString = `${dateKey}T${selectedTime}:00+03:00`;
      let startAtDate = new Date(isoString);
      
      // Fallback if Date parsing fails (safeguard)
      if (isNaN(startAtDate.getTime())) {
         const [h, m] = selectedTime.split(':').map(Number);
         const fallbackDate = new Date(selectedDate);
         fallbackDate.setHours(h, m, 0, 0);
         startAtDate = fallbackDate;
      }

      const startAtMs = startAtDate.getTime();
      // Default duration 30 mins
      const durationMin = settings.durationMin || 30;
      const endAtMs = startAtMs + (durationMin * 60 * 1000);

      // 3. Create Payload
      const payload = {
        source: 'guest',
        userId: null,
        guestName: formData.guestName,
        guestPhone: formData.guestPhone,
        guestEmail: formData.guestEmail || null,
        topic: formData.topic || 'Guest Meeting',
        notes: formData.notes || '',
        meetingType: formData.meetingType || 'online',
        status: 'pending',
        dateKey: dateKey,
        time: selectedTime,
        startAt: Timestamp.fromMillis(startAtMs),
        endAt: Timestamp.fromMillis(endAtMs),
        createdAt: serverTimestamp()
      };

      // 4. Write to Firestore
      const docRef = await addDoc(collection(db, 'appointment_bookings'), payload);

      setBookingRef(docRef.id);
      setStep(3);

    } catch (err: any) {
      console.error("Booking Error:", err);
      if (err.code === 'permission-denied') {
         setErrorMsg("Unable to book. Please check your network or try again later.");
      } else {
         setErrorMsg("Booking failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar Nav
  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  // Calendar Grid Generation
  const getCalendarRows = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startGrid = new Date(firstDay);
    startGrid.setDate(1 - firstDay.getDay()); // Start Sunday

    const rows: Date[][] = [];
    let current = new Date(startGrid);
    for (let i = 0; i < 6; i++) {
      const week: Date[] = [];
      for (let j = 0; j < 7; j++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      const workDays = week.slice(0, 5); // Sun-Thu
      if (workDays[0].getMonth() !== month && workDays[0] > firstDay) break;
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
    <div className="flex flex-col h-full bg-[#020617] relative overflow-y-auto no-scrollbar pb-24 text-white">
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-4 border-b border-white/5 flex items-center shadow-lg">
        <h1 className="text-xl font-bold ml-2 rtl:mr-2 rtl:ml-0">Book an Appointment</h1>
      </div>

      <div className="p-6 max-w-lg mx-auto w-full">
        
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2].map(i => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-slate-800'}`} />
          ))}
        </div>

        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertTriangle className="text-red-400 shrink-0" size={20} />
            <span className="text-red-400 text-sm font-medium">{errorMsg}</span>
          </motion.div>
        )}

        {/* Step 1: Slot Picker */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <button onClick={handlePrevMonth} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-white/5"><ChevronLeft size={20}/></button>
                <h3 className="text-lg font-bold uppercase tracking-wide">{monthLabel}</h3>
                <button onClick={handleNextMonth} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-white/5"><ChevronRight size={20}/></button>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-2 text-center text-xs font-bold text-slate-500 uppercase">
                {weekDays.map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="space-y-2">
                {calendarRows.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-5 gap-2">
                    {row.map((date, cIdx) => {
                      const isCurrent = date.getMonth() === viewDate.getMonth();
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      const isPast = date < today;
                      
                      // Check availability settings
                      const dayConfig = settings.weeklyAvailability?.[date.getDay()];
                      const isDayEnabled = dayConfig?.enabled;
                      const isClickable = isCurrent && !isPast && isDayEnabled;

                      return (
                        <button
                          key={cIdx}
                          onClick={() => isClickable && setSelectedDate(date)}
                          disabled={!isClickable}
                          className={`h-10 rounded-xl flex flex-col items-center justify-center border transition-all ${
                            !isCurrent ? 'opacity-0 pointer-events-none' : 
                            isSelected ? 'bg-primary border-primary text-white shadow-lg' : 
                            isClickable ? 'bg-slate-800 text-slate-300 border-white/5 hover:bg-slate-700' : 
                            'bg-slate-900/50 text-slate-600 border-transparent cursor-not-allowed'
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

            {selectedDate && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-white font-bold">Select Time</h3>
                {loadingSlots ? (
                  <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" /></div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-4 text-slate-500 bg-slate-800/30 rounded-xl">No slots available</div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {availableSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 rounded-xl border font-medium text-sm transition-all ${
                          selectedTime === time ? 'bg-primary text-white border-primary shadow-lg' : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2: Details Form */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
               <div>
                 <p className="text-primary font-bold text-sm">
                   {selectedDate?.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                 </p>
                 <p className="text-white text-lg font-bold">{selectedTime}</p>
               </div>
               <button onClick={() => setStep(1)} className="text-xs text-slate-400 underline hover:text-white">Change</button>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input required type="text" className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary focus:outline-none"
                    value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Phone Number *</label>
                <PhoneInput 
                  value={formData.guestPhone}
                  onChange={(val) => setFormData({...formData, guestPhone: val})}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Email Address (Optional)</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" className="w-full bg-slate-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary focus:outline-none"
                    value={formData.guestEmail} onChange={e => setFormData({...formData, guestEmail: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Topic *</label>
                <input required type="text" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                  placeholder="e.g. Project Consultation"
                  value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Notes (Optional)</label>
                <textarea className="w-full h-24 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none resize-none"
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm Booking"}
              </button>
            </form>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/30">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
            <p className="text-slate-400 text-sm">
              Your appointment is set. We've sent a confirmation to your contact details.
            </p>
            {bookingRef && (
              <div className="bg-slate-800 p-3 rounded-lg border border-white/5 mt-4">
                <span className="text-xs text-slate-500 uppercase block mb-1">Reference ID</span>
                <span className="font-mono text-white select-all">{bookingRef}</span>
              </div>
            )}
            <button onClick={() => window.location.reload()} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-colors mt-6">
              Book Another
            </button>
          </motion.div>
        )}

      </div>

      {/* Footer Nav for Step 1 */}
      {step === 1 && (
        <div className="p-6 border-t border-white/5 bg-[#0f172a] fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto">
          <button 
            onClick={() => setStep(2)}
            disabled={!selectedDate || !selectedTime}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PublicBooking;
