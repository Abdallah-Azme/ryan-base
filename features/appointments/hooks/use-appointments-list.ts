import { useState } from 'react';
import { useTranslation } from '@/lib/i18nContext';
import { useAppointments, appointmentStore } from '@/lib/appointmentStore';

export function useAppointmentsList() {
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
    return new Date(ts).toLocaleDateString(dir === 'rtl' ? 'ar-KW' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
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

  const hasActiveBooking = upcomingAppointments.some((appt) => {
    const endAtMs = appt.endAt?.toMillis ? appt.endAt.toMillis() : typeof appt.endAt === 'number' ? appt.endAt : 0;
    return appt.status === 'confirmed' && endAtMs > Date.now();
  });

  const handleOpenWizard = () => {
    if (hasActiveBooking) {
      alert(t('appt.limit_error'));
      return;
    }
    setShowWizard(true);
  };

  return {
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
  };
}
