import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Loader2 } from 'lucide-react';
import PhoneInput from '@/components/ui/phone-input';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { guestDetailsSchema, GuestDetailsValues } from '../schemas/guest-details.schema';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

interface GuestDetailsFormProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  isSubmitting: boolean;
  onBook: (data: GuestDetailsValues) => void;
  onChangeStep: () => void;
}

export default function GuestDetailsForm({
  selectedDate,
  selectedTime,
  isSubmitting,
  onBook,
  onChangeStep,
}: GuestDetailsFormProps) {
  const form = useForm<GuestDetailsValues>({
    resolver: zodResolver(guestDetailsSchema),
    defaultValues: {
      guestName: '',
      guestPhone: '',
      guestEmail: '',
      topic: '',
      notes: '',
    },
  });

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

      <form onSubmit={form.handleSubmit(onBook)} className="space-y-4">
        <Controller
          name="guestName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Full Name <span className="text-red-400">*</span></FieldLabel>
              <div className="relative">
                <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...field}
                  type="text"
                  aria-invalid={fieldState.invalid}
                  className={`w-full bg-slate-800 border border-white/10 rounded-xl ps-10 pe-4 py-3 text-white focus:outline-none transition-all ${
                    fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : 'focus:border-primary'
                  }`}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="guestPhone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Phone Number <span className="text-red-400">*</span></FieldLabel>
              <PhoneInput value={field.value} onChange={field.onChange} required />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="guestEmail"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Email Address (Optional)</FieldLabel>
              <div className="relative">
                <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...field}
                  type="email"
                  aria-invalid={fieldState.invalid}
                  className={`w-full bg-slate-800 border border-white/10 rounded-xl ps-10 pe-4 py-3 text-white focus:outline-none transition-all ${
                    fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : 'focus:border-primary'
                  }`}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="topic"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Topic <span className="text-red-400">*</span></FieldLabel>
              <input
                {...field}
                type="text"
                aria-invalid={fieldState.invalid}
                className={`w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none transition-all ${
                  fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : 'focus:border-primary'
                }`}
                placeholder="e.g. Project Consultation"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="notes"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Notes (Optional)</FieldLabel>
              <textarea
                {...field}
                aria-invalid={fieldState.invalid}
                className={`w-full h-24 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none transition-all resize-none ${
                  fieldState.invalid ? 'border-red-500/50 focus:border-red-500' : 'focus:border-primary'
                }`}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

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
