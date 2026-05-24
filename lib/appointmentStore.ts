"use client";

import { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, onSnapshot, serverTimestamp, addDoc, orderBy, limit, Timestamp, runTransaction } from 'firebase/firestore';
import { db, auth } from './firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { sanitizeForFirestore } from './firestoreSanitize';

const DEBUG = true; // Toggle debugging logs

export interface AppointmentSettings {
  durationMin: number;
  dailyLimit: number;
  bufferMin: number;
  minNoticeHours: number;
  maxWindowDays: number;
  // 0=Sun, 1=Mon, ..., 6=Sat
  weeklyAvailability: Record<number, { enabled: boolean; ranges: (string | { start: string; end: string })[] }>;
}

export interface Appointment {
  id: string;
  userId?: string | null;
  userEmail?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  source?: string;
  startAt: Timestamp; 
  endAt: Timestamp;
  dateKey: string;
  time: string;
  status: 'pending' | 'confirmed' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  meetingType: 'online' | 'in_person';
  topic: string;
  notes?: string;
  adminNotes?: string;
  rejectReason?: string;
  statusHistory?: {
    status: string;
    reason?: string;
    createdAt: number;
    createdByName?: string;
  }[];
  createdAt: any;
}

const DEFAULT_SETTINGS: AppointmentSettings = {
  durationMin: 30,
  dailyLimit: 10,
  bufferMin: 15,
  minNoticeHours: 2,
  maxWindowDays: 30,
  weeklyAvailability: {
    0: { enabled: true, ranges: [{ start: "09:00", end: "17:00" }] }, // Sun
    1: { enabled: true, ranges: [{ start: "09:00", end: "17:00" }] }, // Mon
    2: { enabled: true, ranges: [{ start: "09:00", end: "17:00" }] }, // Tue
    3: { enabled: true, ranges: [{ start: "09:00", end: "17:00" }] }, // Wed
    4: { enabled: true, ranges: [{ start: "09:00", end: "17:00" }] }, // Thu
    5: { enabled: false, ranges: [] }, // Fri
    6: { enabled: false, ranges: [] }, // Sat
  },
};

// Helper: Parse time string (HH:mm or h:mm AM/PM) into {h, m}
const parseTime = (timeStr: string): { h: number, m: number } | null => {
  if (!timeStr) return null;
  try {
    const trimmed = timeStr.trim();
    // Match "HH:mm" or "H:mm" optionally followed by " AM"/" PM"
    const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const period = match[3] ? match[3].toUpperCase() : null;

      if (period === 'PM' && h < 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      
      return { h, m };
    }
    return null;
  } catch (e) {
    console.warn("Time parse error:", timeStr);
    return null;
  }
};

// Helper: Get Date Key in Kuwait Timezone
const getKuwaitDateKey = (date: Date): string => {
  return new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Kuwait', 
    year: 'numeric', month: '2-digit', day: '2-digit' 
  }).format(date);
};

class AppointmentStore {
  private settings: AppointmentSettings = DEFAULT_SETTINGS;
  private myAppointments: Appointment[] = [];
  private listeners: (() => void)[] = [];
  private currentUid: string | null = null;
  private currentEmail: string | null = null;
  private isSettingsLoaded = false;
  private unsubscribeAppointments: (() => void) | null = null;
  
  constructor() {
    if (auth) {
      onAuthStateChanged(auth, (user) => {
        this.currentUid = user ? user.uid : null;
        this.currentEmail = user ? user.email : null;
        
        if (DEBUG) console.log("[AppointmentStore] Auth State Changed:", { uid: this.currentUid, email: this.currentEmail });

        if (user) {
          this.subscribeToMyAppointments();
        } else {
          this.myAppointments = [];
          if (this.unsubscribeAppointments) {
            this.unsubscribeAppointments();
            this.unsubscribeAppointments = null;
          }
          this.notify();
        }
      });
    }
    this.fetchSettings();
  }

  // --- Settings Management ---
  async fetchSettings() {
    if (!db) return;
    try {
      const snap = await getDoc(doc(db, 'appointment_settings', 'global'));
      if (snap.exists()) {
        const data = snap.data();
        
        // Deep Merge & Normalize keys (ensure 0-6 exists)
        const mergedAvailability: any = { ...DEFAULT_SETTINGS.weeklyAvailability };
        
        if (data.weeklyAvailability) {
          for (let i = 0; i < 7; i++) {
            // Check for numeric key OR string key
            const config = data.weeklyAvailability[i] || data.weeklyAvailability[String(i)];
            if (config) {
              mergedAvailability[i] = config;
            }
          }
        }

        this.settings = { 
          ...DEFAULT_SETTINGS, 
          ...data,
          weeklyAvailability: mergedAvailability
        };
      } else {
        // Init default if not exists
        await setDoc(doc(db, 'appointment_settings', 'global'), DEFAULT_SETTINGS);
        console.log("Initialized default settings");
      }
      this.isSettingsLoaded = true;
      this.notify();
    } catch (e) {
      console.error("Error fetching settings", e);
    }
  }

  async updateSettings(newSettings: Partial<AppointmentSettings>) {
    if (!db) return;
    try {
      // Sanitize before saving to remove undefined
      const cleanSettings = sanitizeForFirestore(newSettings);
      await setDoc(doc(db, 'appointment_settings', 'global'), cleanSettings, { merge: true });
      
      // Update local state deeply
      this.settings = { ...this.settings, ...newSettings };
      if (newSettings.weeklyAvailability) {
        this.settings.weeklyAvailability = {
          ...this.settings.weeklyAvailability,
          ...newSettings.weeklyAvailability
        };
      }
      this.notify();
    } catch (e) {
      console.error("Error saving settings:", e);
      throw e;
    }
  }

  getSettings() {
    return this.settings;
  }

  // --- User Appointments Subscription ---
  private subscribeToMyAppointments() {
    if (!db || !this.currentUid) return;
    if (this.unsubscribeAppointments) this.unsubscribeAppointments();
    
    // Canonical Collection: appointment_bookings
    // QUERY: Query by userId only. Filter logic handled client-side for "Active".
    
    if (DEBUG) console.log("[AppointmentStore] Subscribing to appointments for userId:", this.currentUid);

    try {
        const q = query(
          collection(db, 'appointment_bookings'),
          where('userId', '==', this.currentUid)
        );

        this.unsubscribeAppointments = onSnapshot(q, (snap) => {
          const nowMs = Date.now();
          
          if (DEBUG) console.log(`[AppointmentStore] Raw Docs Fetched: ${snap.size}`);

          const allDocs = snap.docs.map(d => {
            const data = d.data();
            
            // Robust StartAt Handling
            let startAtTimestamp = data.startAt;
            let startAtMs = 0;
            let endAtTimestamp = data.endAt;
            let endAtMs = 0;

            if (startAtTimestamp && startAtTimestamp.toMillis) {
              startAtMs = startAtTimestamp.toMillis();
            } else if (data.dateKey && data.time) {
              // Fallback for start
              const datePart = data.dateKey;
              const timePart = data.time;
              const constructedDate = new Date(`${datePart}T${timePart}:00`);
              if (!isNaN(constructedDate.getTime())) {
                startAtMs = constructedDate.getTime();
                startAtTimestamp = Timestamp.fromMillis(startAtMs);
              }
            }

            if (endAtTimestamp && endAtTimestamp.toMillis) {
              endAtMs = endAtTimestamp.toMillis();
            } else {
              // Fallback: assume 30 mins if missing
              endAtMs = startAtMs + (30 * 60000);
              endAtTimestamp = Timestamp.fromMillis(endAtMs);
            }

            return { 
              id: d.id, 
              ...data,
              startAt: startAtTimestamp,
              endAt: endAtTimestamp,
              _startAtMs: startAtMs,
              _endAtMs: endAtMs
            };
          });

          // CLIENT-SIDE FILTERING:
          // Active Definition: endAt > now.
          // We want to show "Upcoming" (startAt > now) AND "In Progress" (startAt < now < endAt).
          // Basically: endAt > now.
          
          const activeOrFuture = allDocs.filter((d: any) => {
             // Keep cancelled ones in list if future? 
             // Usually My Appointments shows future bookings regardless of status so user sees they are cancelled.
             // But for the "Active Limit" check, we only care about 'confirmed' ones.
             // For visual list, let's show all future/in-progress.
             return d._endAtMs > nowMs;
          });

          // Sort ASC by start time
          activeOrFuture.sort((a: any, b: any) => a._startAtMs - b._startAtMs);

          if (DEBUG && activeOrFuture.length > 0) {
             console.log("[AppointmentStore] Filtered List (Future/Active):", activeOrFuture.length);
          }

          this.myAppointments = activeOrFuture as unknown as Appointment[];
          this.notify();
        }, (err) => {
          console.error("Error subscribing to appointments:", err);
        });
    } catch (e) {
        console.error("Query construction error:", e);
    }
  }

  getMyAppointments() {
    return this.myAppointments;
  }

  // --- Slot Generation ---
  async getAvailableSlots(date: Date): Promise<string[]> {
    if (!db) return [];
    if (!this.isSettingsLoaded) await this.fetchSettings();
    
    try {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      const weekday = selectedDate.getDay();
      const wa = this.settings.weeklyAvailability || {};
      const dayConfig = wa[weekday] ?? wa[String(weekday)];
      
      if (!dayConfig || !dayConfig.enabled || !dayConfig.ranges || dayConfig.ranges.length === 0) {
        return [];
      }

      const targetDateKey = getKuwaitDateKey(selectedDate);
      
      const q = query(
        collection(db, 'appointment_bookings'),
        where('dateKey', '==', targetDateKey),
        where('status', '==', 'confirmed')
      );
      
      let bookedTimes: string[] = [];
      try {
        const snap = await getDocs(q);
        bookedTimes = snap.docs.map(d => d.data().time);
        
        if (snap.size >= (this.settings.dailyLimit || 10)) {
          console.log("[AppointmentStore] Daily limit reached for", targetDateKey);
          return []; 
        }
      } catch (e) {
        console.error("Error fetching daily bookings:", e);
        return [];
      }

      const slots: string[] = [];
      let safeDuration = this.settings.durationMin;
      if (!safeDuration || safeDuration < 5) safeDuration = 30;
      
      const durationMs = safeDuration * 60000;
      const bufferMs = (this.settings.bufferMin || 0) * 60000;
      const minNoticeMs = (this.settings.minNoticeHours || 0) * 3600000;
      const nowMs = Date.now();

      dayConfig.ranges.forEach((rangeRaw: any) => {
        let startStr = "";
        let endStr = "";

        if (typeof rangeRaw === 'string') {
          const parts = rangeRaw.split('-');
          if (parts.length === 2) { startStr = parts[0]; endStr = parts[1]; }
        } else if (typeof rangeRaw === 'object' && rangeRaw !== null) {
          startStr = rangeRaw.start || "";
          endStr = rangeRaw.end || "";
        }

        if (!startStr || !endStr) return;

        const parsedStart = parseTime(startStr);
        const parsedEnd = parseTime(endStr);

        if (!parsedStart || !parsedEnd) return;

        let currentSlotStart = new Date(selectedDate);
        currentSlotStart.setHours(parsedStart.h, parsedStart.m, 0, 0);
        
        const rangeEnd = new Date(selectedDate);
        rangeEnd.setHours(parsedEnd.h, parsedEnd.m, 0, 0);

        if (currentSlotStart.getTime() >= rangeEnd.getTime()) return;

        let safetyCount = 0;

        while (currentSlotStart.getTime() + durationMs <= rangeEnd.getTime()) {
          safetyCount++;
          if (safetyCount > 200) break;

          const slotStartMs = currentSlotStart.getTime();
          const slotEndMs = slotStartMs + durationMs;

          const isToday = selectedDate.toDateString() === new Date().toDateString();
          if ((isToday && slotStartMs < (nowMs + minNoticeMs)) || slotStartMs < nowMs) {
            currentSlotStart = new Date(slotEndMs + bufferMs);
            continue;
          }

          const slotTime = currentSlotStart.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false
          });

          if (!bookedTimes.includes(slotTime)) {
            slots.push(slotTime);
          }

          currentSlotStart = new Date(slotEndMs + bufferMs);
        }
      });

      return [...new Set(slots)].sort();

    } catch (e) {
      console.error("Critical error generating slots:", e);
      return [];
    }
  }

  // --- Actions with Transactions ---
  
  async bookAppointment(data: any) {
    if (!db) throw new Error("DB not connected");
    const user = auth.currentUser;
    // Fallback for guest booking logic if strict rule not enforced for guests (or track by email)
    // Rule says: "Prevent a user from booking...". Implies authenticated mostly.
    // We will assume `this.currentUid` matches `user.uid`.
    const userId = this.currentUid;
    
    if (!userId) {
       // Allow guests? Or enforce login?
       // If no userId, we can't lock easily by userId. 
       // For this implementation, we focus on authenticated users.
       throw new Error("You must be signed in to book.");
    }

    const { date, time, ...details } = data;
    
    const dateKey = getKuwaitDateKey(date); 
    const isoString = `${dateKey}T${time}:00+03:00`;
    
    let startAtDate = new Date(isoString);
    if (isNaN(startAtDate.getTime())) {
        const [h, m] = time.split(':').map(Number);
        startAtDate = new Date(date);
        startAtDate.setHours(h, m, 0, 0);
    }

    let safeDuration = this.settings.durationMin;
    if (!safeDuration || safeDuration < 5) safeDuration = 30;
    
    const startAtMs = startAtDate.getTime();
    const durationMs = safeDuration * 60000;
    const endAtMs = startAtMs + durationMs;

    const userEmail = user ? user.email?.toLowerCase() : (details.guestEmail?.toLowerCase() || 'guest@example.com');

    const payload = {
      userId: userId,
      userEmail: userEmail,
      guestName: details.guestName || null,
      guestEmail: details.guestEmail || null,
      guestPhone: details.guestPhone || null,
      meetingType: details.meetingType || 'online',
      topic: details.topic || '',
      notes: details.notes || '',
      startAt: Timestamp.fromMillis(startAtMs),
      endAt: Timestamp.fromMillis(endAtMs),
      createdAt: serverTimestamp(),
      dateKey: dateKey,
      time: time,
      status: 'confirmed'
    };

    try {
        await runTransaction(db, async (transaction) => {
            // 1. Check Lock Document for strict "One Active" rule
            const lockRef = doc(db, 'user_active_appointments', userId);
            const lockSnap = await transaction.get(lockRef);
            
            if (lockSnap.exists()) {
                const lockData = lockSnap.data();
                const lockEndAt = lockData.endAt?.toMillis ? lockData.endAt.toMillis() : 0;
                
                // Active Condition: status is confirmed AND endAt is in the future
                if (lockData.status === 'confirmed' && lockEndAt > Date.now()) {
                    if (DEBUG) console.log("[Transaction] Blocked. Active Booking:", lockData);
                    throw new Error("You already have an upcoming appointment. Please cancel it first.");
                }
            }

            // 2. Create Booking Doc (Ref generated first)
            const bookingRef = doc(collection(db, 'appointment_bookings'));
            transaction.set(bookingRef, payload);

            // 3. Update/Set Lock Document
            transaction.set(lockRef, {
                bookingId: bookingRef.id,
                endAt: Timestamp.fromMillis(endAtMs),
                status: 'confirmed',
                lastUpdated: serverTimestamp()
            });
        });
        
        return { success: true };
    } catch (e: any) {
        console.error("Booking Transaction Error:", e);
        throw e;
    }
  }

  async cancelAppointment(id: string) {
    if (!db) return;
    const userId = this.currentUid;
    if (!userId) return;

    try {
        await runTransaction(db, async (transaction) => {
            // 1. Get booking to confirm ownership/existence
            const bookingRef = doc(db, 'appointment_bookings', id);
            const bookingSnap = await transaction.get(bookingRef);
            
            if (!bookingSnap.exists()) {
                throw new Error("Booking not found");
            }

            // 2. Mark booking as cancelled
            transaction.update(bookingRef, { status: 'cancelled' });

            // 3. Update Lock Doc IF it matches this booking
            const lockRef = doc(db, 'user_active_appointments', userId);
            const lockSnap = await transaction.get(lockRef);
            
            if (lockSnap.exists()) {
                const lockData = lockSnap.data();
                if (lockData.bookingId === id) {
                    transaction.update(lockRef, { status: 'cancelled' });
                }
            }
        });
    } catch (e) {
        console.error("Cancellation Transaction Error:", e);
        throw e;
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const appointmentStore = new AppointmentStore();

export const useAppointments = () => {
  const [myAppointments, setMyAppointments] = useState<Appointment[]>(appointmentStore.getMyAppointments());
  const [settings, setSettings] = useState<AppointmentSettings>(appointmentStore.getSettings());

  useEffect(() => {
    const update = () => {
      setMyAppointments(appointmentStore.getMyAppointments());
      setSettings(appointmentStore.getSettings());
    };
    
    update();
    
    return appointmentStore.subscribe(update);
  }, []);

  return { appointments: myAppointments, settings };
};
