import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface BookingSuccessStepProps {
  bookingRef: string | null;
}

export default function BookingSuccessStep({ bookingRef }: BookingSuccessStepProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
      <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/30">
        <CheckCircle size={48} />
      </div>
      <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
      <p className="text-slate-400 text-sm">Your appointment is set. We've sent a confirmation to your contact details.</p>
      {bookingRef ? (
        <div className="bg-slate-800 p-3 rounded-lg border border-white/5 mt-4">
          <span className="text-xs text-slate-500 uppercase block mb-1">Reference ID</span>
          <span className="font-mono text-white select-all">{bookingRef}</span>
        </div>
      ) : null}
      <button type="button" onClick={() => window.location.reload()} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-colors mt-6">
        Book Another
      </button>
    </motion.div>
  );
}
