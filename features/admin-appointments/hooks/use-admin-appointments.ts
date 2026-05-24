import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';
import { appointmentStore, AppointmentSettings, Appointment } from '@/lib/appointmentStore';
import { auth, db } from '@/lib/firebase-client';
import { createAuditLogSafe } from '@/lib/auditLogStore';
import { createServiceNotificationSafe } from '@/lib/serviceNotifications';

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function useAdminAppointments() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'settings' | 'bookings'>('bookings');
  const [settings, setSettings] = useState<AppointmentSettings | null>(null);
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Appointment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState('');

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
            setSelectedBooking((current) => (current ? data.find((booking) => booking.id === current.id) || null : null));
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

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = bookingStatusFilter === 'all' || booking.status === bookingStatusFilter;
    const query = bookingSearch.trim().toLowerCase();
    if (!query) return matchesStatus;
    const haystack = [
      booking.guestName,
      booking.guestEmail,
      booking.userEmail,
      booking.guestPhone,
      booking.topic,
      booking.notes,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return matchesStatus && haystack.includes(query);
  });

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
      await updateBookingStatus(id, 'cancelled');
    }
  };

  const handleCompleteBooking = async (id: string) => {
    await updateBookingStatus(id, 'completed');
  };

  const getAdminName = () => auth.currentUser?.displayName || auth.currentUser?.email || 'Admin';

  const updateBookingStatus = async (
    id: string,
    status: Appointment['status'],
    reason?: string,
    notes?: string
  ) => {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) return;

    const historyEntry = {
      status,
      reason: reason || '',
      createdAt: Date.now(),
      createdByName: getAdminName(),
    };

    const statusHistory = [...(booking.statusHistory || []), historyEntry];
    const updates: Partial<Appointment> = {
      status,
      statusHistory,
      adminNotes: notes ?? booking.adminNotes ?? '',
    };

    if (status === 'rejected') updates.rejectReason = reason || '';

    await updateDoc(doc(db, 'appointment_bookings', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    await createAuditLogSafe({
      entityType: 'appointment',
      entityId: id,
      action: `appointment.${status}`,
      reason,
      oldValue: { status: booking.status },
      newValue: updates,
    });

    if (booking.userId && ['accepted', 'confirmed', 'rejected', 'cancelled', 'completed'].includes(status)) {
      const title =
        status === 'rejected'
          ? 'Appointment rejected'
          : status === 'cancelled'
          ? 'Appointment cancelled'
          : status === 'completed'
          ? 'Appointment completed'
          : 'Appointment accepted';
      const message =
        status === 'rejected'
          ? `Your appointment about ${booking.topic} was rejected. ${reason || ''}`.trim()
          : `Your appointment about ${booking.topic} is now ${status}.`;
      await createServiceNotificationSafe({
        userId: booking.userId,
        type: status === 'rejected' || status === 'cancelled' ? 'warning' : 'success',
        title,
        message,
        deepLink: '/appointments',
      });
    }
  };

  const handleAcceptBooking = async (id: string) => {
    await updateBookingStatus(id, 'accepted', undefined, adminNotes);
  };

  const handleRejectBooking = async (id: string) => {
    if (!rejectReason.trim()) {
      setError('Add a rejection reason before rejecting this appointment.');
      return;
    }
    await updateBookingStatus(id, 'rejected', rejectReason.trim(), adminNotes);
    setRejectReason('');
  };

  const handleSaveAdminNotes = async (id: string) => {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) return;
    await updateDoc(doc(db, 'appointment_bookings', id), {
      adminNotes,
      updatedAt: serverTimestamp(),
    });
    await createAuditLogSafe({
      entityType: 'appointment',
      entityId: id,
      action: 'appointment.admin_notes_updated',
      oldValue: { adminNotes: booking.adminNotes || '' },
      newValue: { adminNotes },
    });
  };

  const openBooking = (booking: Appointment) => {
    setSelectedBooking(booking);
    setAdminNotes(booking.adminNotes || '');
    setRejectReason(booking.rejectReason || '');
  };

  return {
    activeTab,
    setActiveTab,
    settings,
    setSettings,
    bookings,
    filteredBookings,
    bookingStatusFilter,
    setBookingStatusFilter,
    bookingSearch,
    setBookingSearch,
    loading,
    savingId,
    error,
    selectedBooking,
    rejectReason,
    setRejectReason,
    adminNotes,
    setAdminNotes,
    setSelectedBooking,
    handleSaveSettings,
    handleUpdateAvailability,
    handleAddRange,
    handleRemoveRange,
    handleChangeRange,
    handleCancelBooking,
    handleCompleteBooking,
    handleAcceptBooking,
    handleRejectBooking,
    handleSaveAdminNotes,
    openBooking,
  };
}
