import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAppointments, appointmentStore } from '@/lib/appointmentStore';
import { useTranslation } from '@/lib/i18nContext';
import { db } from '@/lib/firebase-client';
import { GuestDetailsValues } from '../schemas/guest-details.schema';

export function usePublicBooking() {
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
  const [viewDate, setViewDate] = useState(new Date());


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
        console.error('Failed to load time slots:', error);
      } finally {
        if (isActive) setLoadingSlots(false);
      }
    };
    fetchSlots();
    return () => {
      isActive = false;
    };
  }, [selectedDate]);

  const handleBook = async (data: GuestDetailsValues) => {
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const dateKey = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kuwait',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(selectedDate);

      const isoString = `${dateKey}T${selectedTime}:00+03:00`;
      let startAtDate = new Date(isoString);

      if (isNaN(startAtDate.getTime())) {
        const [h, m] = selectedTime.split(':').map(Number);
        const fallbackDate = new Date(selectedDate);
        fallbackDate.setHours(h, m, 0, 0);
        startAtDate = fallbackDate;
      }

      const startAtMs = startAtDate.getTime();
      const durationMin = settings.durationMin || 30;
      const endAtMs = startAtMs + durationMin * 60 * 1000;

      const payload = {
        source: 'guest',
        userId: null,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        guestEmail: data.guestEmail || null,
        topic: data.topic || 'Guest Meeting',
        notes: data.notes || '',
        meetingType: 'online',
        status: 'pending',
        dateKey,
        time: selectedTime,
        startAt: Timestamp.fromMillis(startAtMs),
        endAt: Timestamp.fromMillis(endAtMs),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'appointment_bookings'), payload);

      setBookingRef(docRef.id);
      setStep(3);
    } catch (err: any) {
      console.error('Booking Error:', err);
      if (err.code === 'permission-denied') {
        setErrorMsg('Unable to book. Please check your network or try again later.');
      } else {
        setErrorMsg('Booking failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const getCalendarRows = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startGrid = new Date(firstDay);
    startGrid.setDate(1 - firstDay.getDay());

    const rows: Date[][] = [];
    let current = new Date(startGrid);
    for (let i = 0; i < 6; i++) {
      const week: Date[] = [];
      for (let j = 0; j < 7; j++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      const workDays = week.slice(0, 5);
      if (workDays[0].getMonth() !== month && workDays[0] > firstDay) break;
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
    bookingRef,
    viewDate,
    handleBook,
    handlePrevMonth,
    handleNextMonth,
    getCalendarRows,
  };
}
