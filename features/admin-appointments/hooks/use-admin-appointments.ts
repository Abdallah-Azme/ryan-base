import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';
import { appointmentStore, AppointmentSettings, Appointment } from '@/lib/appointmentStore';
import { db } from '@/lib/firebase-client';

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function useAdminAppointments() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'settings' | 'bookings'>('bookings');
  const [settings, setSettings] = useState<AppointmentSettings | null>(null);
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const seedSampleBookingV3 = async () => {
      const SEED_KEY = 'rs_dashboard_preview_seed_v3';
      if (localStorage.getItem(SEED_KEY)) return;

      try {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 2);

        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Kuwait',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        const dateKey = formatter.format(targetDate);
        const time = '09:45';

        const isoString = `${dateKey}T${time}:00+03:00`;
        const startAtDate = new Date(isoString);
        const startAtMs = startAtDate.getTime();
        const endAtMs = startAtMs + 30 * 60 * 1000;

        const payload = {
          source: 'guest',
          userId: null,
          guestName: 'Guest Test 2',
          guestPhone: '+96522255222',
          guestEmail: 'guest2.test@demo1.com',
          topic: 'Second demo booking',
          notes: 'Created for dashboard preview (guest #2)',
          meetingType: 'online',
          status: 'pending',
          dateKey,
          time,
          startAt: Timestamp.fromMillis(startAtMs),
          endAt: Timestamp.fromMillis(endAtMs),
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'appointment_bookings'), payload);

        console.log('%c SAMPLE BOOKING #3 CREATED ', 'background: #222; color: #00ff00; font-size: 14px');
        console.log('Path:', `appointment_bookings/${docRef.id}`);
        console.log('Data:', payload);

        localStorage.setItem(SEED_KEY, 'true');
      } catch (e) {
        console.error('Seeding V3 failed:', e);
      }
    };

    seedSampleBookingV3();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await appointmentStore.fetchSettings();
      setSettings(appointmentStore.getSettings());
    };
    loadData();

    const unsubStore = appointmentStore.subscribe(() => {
      setSettings(appointmentStore.getSettings());
    });

    const loadBookings = () => {
      try {
        const q = query(collection(db, 'appointment_bookings'), orderBy('startAt', 'desc'));

        return onSnapshot(
          q,
          (snap) => {
            const data = snap.docs.map(
              (d) =>
                ({
                  id: d.id,
                  ...d.data(),
                  startAt: d.data().startAt?.toMillis ? d.data().startAt.toMillis() : Date.now(),
                  endAt: d.data().endAt?.toMillis ? d.data().endAt.toMillis() : Date.now(),
                } as unknown as Appointment)
            );

            setBookings(data);
            setError(null);
          },
          (err) => {
            console.error('Admin Booking Fetch Error:', err);
            if (err.code === 'failed-precondition') {
              setError('Missing Index. Please check console for creation link.');
            } else {
              setError(`Error loading bookings: ${err.message}`);
            }
          }
        );
      } catch (e: any) {
        console.error('Query Error', e);
        setError(e.message);
        return () => {};
      }
    };

    const unsubscribeBookings = loadBookings();

    return () => {
      unsubscribeBookings();
      unsubStore();
    };
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setLoading(true);
    try {
      await appointmentStore.updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (e) {
      alert('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async (dayIndex: number, enabled: boolean) => {
    if (!settings) return;
    console.log(`Toggling Day ${dayIndex}: ${enabled}`);

    const updatedWeekly = { ...settings.weeklyAvailability };
    const currentConfig = updatedWeekly[dayIndex] || { enabled: false, ranges: [] };

    updatedWeekly[dayIndex] = { ...currentConfig, enabled };

    if (enabled && (!updatedWeekly[dayIndex].ranges || updatedWeekly[dayIndex].ranges.length === 0)) {
      updatedWeekly[dayIndex].ranges = [{ start: '09:00', end: '17:00' }];
    }

    const newSettings = { ...settings, weeklyAvailability: updatedWeekly };
    setSettings(newSettings);

    setSavingId(dayIndex);
    try {
      await appointmentStore.updateSettings({ weeklyAvailability: updatedWeekly });
    } catch (e) {
      console.error('Failed to toggle availability', e);
    } finally {
      setSavingId(null);
    }
  };

  const handleAddRange = (dayIndex: number) => {
    if (!settings) return;
    const newWeekly = { ...settings.weeklyAvailability };
    if (!newWeekly[dayIndex].ranges) newWeekly[dayIndex].ranges = [];
    newWeekly[dayIndex].ranges.push({ start: '09:00', end: '17:00' });
    setSettings({ ...settings, weeklyAvailability: newWeekly });
  };

  const handleRemoveRange = (dayIndex: number, rangeIndex: number) => {
    if (!settings) return;
    const newWeekly = { ...settings.weeklyAvailability };
    newWeekly[dayIndex].ranges = newWeekly[dayIndex].ranges.filter((_, i) => i !== rangeIndex);
    setSettings({ ...settings, weeklyAvailability: newWeekly });
  };

  const handleChangeRange = (dayIndex: number, rangeIndex: number, field: 'start' | 'end', value: string) => {
    if (!settings) return;
    const newWeekly = { ...settings.weeklyAvailability };
    newWeekly[dayIndex].ranges[rangeIndex][field] = value;
    setSettings({ ...settings, weeklyAvailability: newWeekly });
  };

  const handleCancelBooking = async (id: string) => {
    if (window.confirm('Cancel this appointment?')) {
      await updateDoc(doc(db, 'appointment_bookings', id), { status: 'cancelled' });
    }
  };

  const handleCompleteBooking = async (id: string) => {
    await updateDoc(doc(db, 'appointment_bookings', id), { status: 'completed' });
  };

  return {
    activeTab,
    setActiveTab,
    settings,
    setSettings,
    bookings,
    loading,
    savingId,
    error,
    handleSaveSettings,
    handleUpdateAvailability,
    handleAddRange,
    handleRemoveRange,
    handleChangeRange,
    handleCancelBooking,
    handleCompleteBooking,
  };
}
