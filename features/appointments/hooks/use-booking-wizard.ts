import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18nContext';
import { useAppointments, appointmentStore } from '@/lib/appointmentStore';
import { auth } from '@/lib/firebase-client';

export function useBookingWizard(onClose: () => void) {
  const { t, dir } = useTranslation();
  const { settings } = useAppointments();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [viewDate, setViewDate] = useState(new Date());

  const [formData, setFormData] = useState({
    topic: '',
    meetingType: 'online',
    notes: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
  });

  const currentUser = auth.currentUser;

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
        if (isActive) {
          setAvailableSlots(slots);
        }
      } catch (error) {
        console.error('Failed to load time slots:', error);
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
        ...formData,
      });
      setStep(3);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Booking failed. Please try again.');
      setIsSubmitting(false);
    }
  };

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

    const startGridDate = new Date(firstDayOfMonth);
    startGridDate.setDate(1 - firstDayOfMonth.getDay());

    const rows: Date[][] = [];
    let current = new Date(startGridDate);

    for (let i = 0; i < 6; i++) {
      const week: Date[] = [];
      for (let j = 0; j < 7; j++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      const workDays = week.slice(0, 5);

      if (workDays[0].getMonth() !== month && workDays[0] > firstDayOfMonth) {
        break;
      }

      rows.push(workDays);
    }
    return rows;
  };

  return {
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
  };
}
