"use client";

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Settings, Clock, List, Save, CheckCircle, Trash2, X, Plus, Loader2, AlertTriangle, Phone } from 'lucide-react';
import { appointmentStore, AppointmentSettings, Appointment } from '../../lib/appointmentStore';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase-client';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AdminAppointments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'settings' | 'bookings'>('bookings');
  const [settings, setSettings] = useState<AppointmentSettings | null>(null);
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null); // Track which day is saving
  const [error, setError] = useState<string | null>(null);

  // --- SEED SAMPLE DATA (One-time run for Guest 2 - Updated) ---
  useEffect(() => {
    const seedSampleBookingV3 = async () => {
      const SEED_KEY = 'rs_dashboard_preview_seed_v3';
      if (localStorage.getItem(SEED_KEY)) return;

      try {
        // Calculate Day After Tomorrow
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 2);
        
        // Format YYYY-MM-DD in Kuwait Time
        const formatter = new Intl.DateTimeFormat('en-CA', { 
            timeZone: 'Asia/Kuwait', year: 'numeric', month: '2-digit', day: '2-digit' 
        });
        const dateKey = formatter.format(targetDate);
        const time = "09:45";
        
        // ISO with Offset +03:00 for Kuwait
        const isoString = `${dateKey}T${time}:00+03:00`;
        const startAtDate = new Date(isoString);
        const startAtMs = startAtDate.getTime();
        const endAtMs = startAtMs + (30 * 60 * 1000); // 30 min duration

        const payload = {
          source: 'guest',
          userId: null,
          guestName: "Guest Test 2",
          guestPhone: "+96522255222",
          guestEmail: "guest2.test@demo1.com",
          topic: "Second demo booking",
          notes: "Created for dashboard preview (guest #2)",
          meetingType: "online",
          status: "pending",
          dateKey: dateKey,
          time: time,
          startAt: Timestamp.fromMillis(startAtMs),
          endAt: Timestamp.fromMillis(endAtMs),
          createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'appointment_bookings'), payload);
        
        console.log("%c SAMPLE BOOKING #3 CREATED ", "background: #222; color: #00ff00; font-size: 14px");
        console.log("Path:", `appointment_bookings/${docRef.id}`);
        console.log("Data:", payload);

        localStorage.setItem(SEED_KEY, 'true');
      } catch (e) {
        console.error("Seeding V3 failed:", e);
      }
    };

    seedSampleBookingV3();
  }, []);
  // ---------------------------------------

  useEffect(() => {
    // Load Settings
    const loadData = async () => {
      await appointmentStore.fetchSettings();
      setSettings(appointmentStore.getSettings());
    };
    loadData();

    // Subscribe for live updates
    const unsubStore = appointmentStore.subscribe(() => {
      setSettings(appointmentStore.getSettings());
    });

    // Load Bookings Live from Canonical Collection
    const loadBookings = () => {
      try {
        // Use 'appointment_bookings'
        // Order by startAt desc to show newest first
        const q = query(
          collection(db, 'appointment_bookings'), 
          orderBy('startAt', 'desc')
        );
        
        return onSnapshot(q, (snap) => {
          const data = snap.docs.map(d => ({ 
            id: d.id, 
            ...d.data(),
            // Ensure timestamp conversion
            startAt: d.data().startAt?.toMillis ? d.data().startAt.toMillis() : Date.now(),
            endAt: d.data().endAt?.toMillis ? d.data().endAt.toMillis() : Date.now(),
          } as unknown as Appointment));
          
          setBookings(data);
          setError(null);
        }, (err) => {
          console.error("Admin Booking Fetch Error:", err);
          if (err.code === 'failed-precondition') {
             setError("Missing Index. Please check console for creation link.");
          } else {
             setError(`Error loading bookings: ${err.message}`);
          }
        });
      } catch (e: any) {
        console.error("Query Error", e);
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
      alert("Settings saved successfully!");
    } catch (e) {
      alert("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  // Immediate toggle save
  const handleUpdateAvailability = async (dayIndex: number, enabled: boolean) => {
    if (!settings) return;
    console.log(`Toggling Day ${dayIndex}: ${enabled}`);
    
    // Optimistic Update
    const updatedWeekly = { ...settings.weeklyAvailability };
    const currentConfig = updatedWeekly[dayIndex] || { enabled: false, ranges: [] };
    
    // Create new object for that day
    updatedWeekly[dayIndex] = { ...currentConfig, enabled };
    
    // Ensure at least one range if enabling
    if (enabled && (!updatedWeekly[dayIndex].ranges || updatedWeekly[dayIndex].ranges.length === 0)) {
       updatedWeekly[dayIndex].ranges = [{ start: "09:00", end: "17:00" }];
    }

    const newSettings = { ...settings, weeklyAvailability: updatedWeekly };
    setSettings(newSettings);
    
    setSavingId(dayIndex);
    try {
      await appointmentStore.updateSettings({ weeklyAvailability: updatedWeekly });
    } catch (e) {
      console.error("Failed to toggle availability", e);
      // Revert on error?
    } finally {
      setSavingId(null);
    }
  };

  const handleAddRange = (dayIndex: number) => {
    if (!settings) return;
    const newWeekly = { ...settings.weeklyAvailability };
    if (!newWeekly[dayIndex].ranges) newWeekly[dayIndex].ranges = [];
    newWeekly[dayIndex].ranges.push({ start: "09:00", end: "17:00" });
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
    if(window.confirm("Cancel this appointment?")) {
      await updateDoc(doc(db, 'appointment_bookings', id), { status: 'cancelled' });
    }
  };

  const handleCompleteBooking = async (id: string) => {
    await updateDoc(doc(db, 'appointment_bookings', id), { status: 'completed' });
  };

  if (!settings) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Appointments</h1>
        <p className="text-slate-400 text-sm">Manage availability and view bookings.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-800/50 p-1 rounded-xl w-fit border border-white/5">
        {[
          { id: 'bookings', label: 'Bookings', icon: List },
          { id: 'schedule', label: 'Availability', icon: Calendar },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[#0f172a] border border-white/5 rounded-2xl shadow-xl min-h-[500px]">
        
        {/* Bookings View */}
        {activeTab === 'bookings' && (
          <div className="p-6">
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-4 flex items-center gap-3">
                <AlertTriangle className="text-red-400" size={20} />
                <span className="text-red-400 text-sm font-medium">{error}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase border-b border-white/5">
                    <th className="pb-3 pl-2">Date/Time</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Topic</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {bookings.map(appt => (
                    <tr key={appt.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-2 text-white">
                        <div className="font-medium">{new Date(appt.startAt as any).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(appt.startAt as any).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - 
                          {new Date(appt.endAt as any).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                      <td className="py-4 text-slate-300">
                        <div className="font-bold flex items-center gap-2">
                          {appt.guestName || 'User'}
                          {appt.source === 'guest' && <span className="px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] border border-orange-500/30">Guest</span>}
                        </div>
                        <div className="text-xs text-slate-500">{appt.guestEmail || appt.userEmail || 'No Email'}</div>
                        {appt.guestPhone && <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={10} /> {appt.guestPhone}</div>}
                      </td>
                      <td className="py-4 text-slate-300">
                        <div className="truncate max-w-[150px]">{appt.topic}</div>
                        <div className="text-xs text-slate-500 capitalize">{appt.meetingType}</div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                          appt.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                          appt.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          appt.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {(appt.status === 'confirmed' || appt.status === 'pending') && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleCompleteBooking(appt.id)} className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors" title="Complete">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => handleCancelBooking(appt.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Cancel">
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && !error && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-500">No bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Schedule View */}
        {activeTab === 'schedule' && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Weekly Availability</h3>
              <button onClick={handleSaveSettings} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-sky-400 transition-colors">
                <Save size={16} /> Save Changes
              </button>
            </div>
            
            <div className="space-y-4">
              {DAYS.map((dayName, idx) => {
                // Ensure we get the config using same robust logic as slot generation, though here we use idx directly
                const dayConfig = settings.weeklyAvailability[idx] || settings.weeklyAvailability[String(idx)] || { enabled: false, ranges: [] };
                const isEnabled = dayConfig.enabled;

                return (
                  <div key={dayName} className={`flex flex-col md:flex-row gap-4 p-4 rounded-xl border transition-all ${isEnabled ? 'bg-slate-900/50 border-white/5' : 'bg-slate-900/20 border-white/5 opacity-70'}`}>
                    
                    {/* Toggle Button */}
                    <div className="w-32 flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); handleUpdateAvailability(idx, !isEnabled); }}
                        className={`w-12 h-6 rounded-full p-1 transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 ${isEnabled ? 'bg-primary' : 'bg-slate-700'}`}
                        aria-pressed={isEnabled}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                      
                      <div className="flex flex-col">
                        <span className={`font-bold ${isEnabled ? 'text-white' : 'text-slate-500'}`}>{dayName}</span>
                        {savingId === idx && <span className="text-[10px] text-primary animate-pulse">Saving...</span>}
                      </div>
                    </div>

                    {/* Ranges Section */}
                    <div className="flex-1 space-y-2">
                      {isEnabled ? (
                        <>
                          {dayConfig.ranges && dayConfig.ranges.map((range, rIdx) => (
                            <div key={rIdx} className="flex items-center gap-2 flex-wrap">
                              <input 
                                type="time" 
                                value={(range as any).start}
                                onChange={(e) => handleChangeRange(idx, rIdx, 'start', e.target.value)}
                                className="bg-slate-800 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-primary outline-none text-sm"
                              />
                              <span className="text-slate-500">-</span>
                              <input 
                                type="time" 
                                value={(range as any).end}
                                onChange={(e) => handleChangeRange(idx, rIdx, 'end', e.target.value)}
                                className="bg-slate-800 text-white px-3 py-2 rounded-lg border border-white/10 focus:border-primary outline-none text-sm"
                              />
                              <button onClick={() => handleRemoveRange(idx, rIdx)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => handleAddRange(idx)} className="text-xs text-primary font-bold flex items-center gap-1 mt-2 hover:underline">
                            <Plus size={14} /> Add Range
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-600 text-sm italic flex items-center h-full">Unavailable</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings View */}
        {activeTab === 'settings' && (
          <div className="p-6 max-w-2xl">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400">Duration (Minutes)</label>
                  <input 
                    type="number" 
                    min="5"
                    value={settings.durationMin}
                    onChange={(e) => setSettings({...settings, durationMin: parseInt(e.target.value) || 30})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400">Buffer After Meeting (Minutes)</label>
                  <input 
                    type="number" 
                    value={settings.bufferMin}
                    onChange={(e) => setSettings({...settings, bufferMin: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400">Min Notice (Hours)</label>
                  <input 
                    type="number" 
                    value={settings.minNoticeHours}
                    onChange={(e) => setSettings({...settings, minNoticeHours: parseInt(e.target.value) || 2})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400">Booking Window (Days)</label>
                  <input 
                    type="number" 
                    value={settings.maxWindowDays}
                    onChange={(e) => setSettings({...settings, maxWindowDays: parseInt(e.target.value) || 30})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-400">Daily Meeting Limit</label>
                 <input 
                    type="number" 
                    value={settings.dailyLimit}
                    onChange={(e) => setSettings({...settings, dailyLimit: parseInt(e.target.value) || 10})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  />
                  <p className="text-xs text-slate-500">Max number of appointments allowed per day.</p>
              </div>

              <div className="pt-6">
                <button onClick={handleSaveSettings} disabled={loading} className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminAppointments;
