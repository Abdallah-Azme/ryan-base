import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, AlertTriangle } from 'lucide-react';
import ConfirmModal from '@/components/ui/confirm-modal';
import EmptyState from '@/components/ui/empty-state';
import Button from '@/components/ui/button';
import { useAppointmentsList } from '../hooks/use-appointments-list';
import AppointmentCard from './appointment-card';
import BookingWizard from './booking-wizard';

export default function AppointmentsPage() {
  const {
    t,
    dir,
    upcomingAppointments,
    showWizard,
    setShowWizard,
    showCancel,
    setShowCancel,
    formatDate,
    formatTime,
    initiateCancel,
    handleCancel,
    hasActiveBooking,
    handleOpenWizard,
  } = useAppointmentsList();

  return (
    <motion.div
      initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
      className="flex flex-col h-full bg-[#020617] relative overflow-y-auto no-scrollbar pb-24"
    >
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-4 border-b border-white/5 flex items-center shadow-lg">
        <h1 className="text-xl font-bold text-white ms-2">{t('appt.title')}</h1>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('appt.active_title')}</h2>

            {upcomingAppointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                id={appt.id}
                topic={appt.topic}
                meetingType={appt.meetingType}
                startAt={appt.startAt}
                endAt={appt.endAt}
                notes={appt.notes}
                status={appt.status}
                t={t}
                formatDate={formatDate}
                formatTime={formatTime}
                onCancel={initiateCancel}
              />
            ))}

            <button
              type="button"
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
            <EmptyState
              icon={<Calendar size={40} className="text-slate-500 animate-pulse" />}
              title={t('appt.no_appts')}
              subtitle={t('appt.no_appts_sub')}
              action={
                <Button onClick={handleOpenWizard} className="mt-4 flex items-center gap-2">
                  <Calendar size={20} />
                  {t('appt.book_btn')}
                </Button>
              }
            />
          </div>
        )}
      </div>

      <AnimatePresence>{showWizard ? <BookingWizard onClose={() => setShowWizard(false)} /> : null}</AnimatePresence>

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
}
