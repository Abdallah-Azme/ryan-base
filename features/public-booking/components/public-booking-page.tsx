import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { usePublicBooking } from '../hooks/use-public-booking';
import CalendarSlotPicker from './calendar-slot-picker';
import GuestDetailsForm from './guest-details-form';
import BookingSuccessStep from './booking-success-step';

export default function PublicBookingPage() {
  const {
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
    bookingRef,
    viewDate,
    handleBook,
    handlePrevMonth,
    handleNextMonth,
    getCalendarRows,
  } = usePublicBooking();

  return (
    <div className="flex flex-col h-full bg-[#020617] relative overflow-y-auto no-scrollbar pb-24 text-white">
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-4 border-b border-white/5 flex items-center shadow-lg">
        <h1 className="text-xl font-bold ms-2">Book an Appointment</h1>
      </div>

      <div className="p-6 max-w-lg mx-auto w-full">
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-slate-800'}`} />
          ))}
        </div>

        {errorMsg ? (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertTriangle className="text-red-400 shrink-0" size={20} />
            <span className="text-red-400 text-sm font-medium">{errorMsg}</span>
          </motion.div>
        ) : null}

        {step === 1 ? (
          <CalendarSlotPicker
            viewDate={viewDate}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableSlots={availableSlots}
            loadingSlots={loadingSlots}
            settings={settings}
            dir={dir}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onSelectDate={setSelectedDate}
            onSelectTime={setSelectedTime}
            getCalendarRows={getCalendarRows}
          />
        ) : null}

        {step === 2 ? (
          <GuestDetailsForm
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            isSubmitting={isSubmitting}
            onBook={handleBook}
            onChangeStep={() => setStep(1)}
          />
        ) : null}

        {step === 3 ? <BookingSuccessStep bookingRef={bookingRef} /> : null}
      </div>

      {step === 1 ? (
        <div className="p-6 border-t border-white/5 bg-[#0f172a] fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto">
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!selectedDate || !selectedTime}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
