import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Loader2 } from 'lucide-react';
import PhoneInput from '@/components/ui/phone-input';

interface GuestDetailsFormProps {
  formData: any;
  setFormData: (val: any) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  isSubmitting: boolean;
  onBook: (e: React.FormEvent) => void;
  onChangeStep: () => void;
}

export default function GuestDetailsForm({
  formData,
  setFormData,
  selectedDate,
  selectedTime,
  isSubmitting,
  onBook,
  onChangeStep,
}: GuestDetailsFormProps) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-primary font-bold text-sm">
            {selectedDate?.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
          <p className="text-white text-lg font-bold">{selectedTime}</p>
        </div>
        <button type="button" onClick={onChangeStep} className="text-xs text-slate-400 underline hover:text-white">
          Change
        </button>
      </div>

      <form onSubmit={onBook} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Full Name *</label>
          <div className="relative">
            <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              required
              type="text"
              className="w-full bg-slate-800 border border-white/10 rounded-xl ps-10 pe-4 py-3 text-white focus:border-primary focus:outline-none"
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Phone Number *</label>
          <PhoneInput
            value={formData.guestPhone}
            onChange={(val) => setFormData({ ...formData, guestPhone: val })}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Email Address (Optional)</label>
          <div className="relative">
            <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              className="w-full bg-slate-800 border border-white/10 rounded-xl ps-10 pe-4 py-3 text-white focus:border-primary focus:outline-none"
              value={formData.guestEmail}
              onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Topic *</label>
          <input
            required
            type="text"
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
            placeholder="e.g. Project Consultation"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Notes (Optional)</label>
          <textarea
            className="w-full h-24 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none resize-none"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
        </button>
      </form>
    </motion.div>
  );
}
