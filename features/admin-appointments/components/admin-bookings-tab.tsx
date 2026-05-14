import React from 'react';
import { Phone, CheckCircle, X } from 'lucide-react';
import { Appointment } from '@/lib/appointmentStore';

interface AdminBookingsTabProps {
  bookings: Appointment[];
  onCompleteBooking: (id: string) => void;
  onCancelBooking: (id: string) => void;
}

export default function AdminBookingsTab({ bookings, onCompleteBooking, onCancelBooking }: AdminBookingsTabProps) {
  return (
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
          {bookings.map((appt) => (
            <tr key={appt.id} className="group hover:bg-white/5 transition-colors">
              <td className="py-4 pl-2 text-white">
                <div className="font-medium">{new Date(appt.startAt as any).toLocaleDateString()}</div>
                <div className="text-xs text-slate-500">
                  {new Date(appt.startAt as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                  {new Date(appt.endAt as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </td>
              <td className="py-4 text-slate-300">
                <div className="font-bold flex items-center gap-2">
                  {appt.guestName || 'User'}
                  {appt.source === 'guest' ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] border border-orange-500/30">
                      Guest
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-slate-500">{appt.guestEmail || appt.userEmail || 'No Email'}</div>
                {appt.guestPhone ? (
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone size={10} /> {appt.guestPhone}
                  </div>
                ) : null}
              </td>
              <td className="py-4 text-slate-300">
                <div className="truncate max-w-[150px]">{appt.topic}</div>
                <div className="text-xs text-slate-500 capitalize">{appt.meetingType}</div>
              </td>
              <td className="py-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                    appt.status === 'confirmed'
                      ? 'bg-blue-500/20 text-blue-400'
                      : appt.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : appt.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {appt.status}
                </span>
              </td>
              <td className="py-4 text-right">
                {appt.status === 'confirmed' || appt.status === 'pending' ? (
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onCompleteBooking(appt.id)}
                      className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                      title="Complete"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onCancelBooking(appt.id)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
          {bookings.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-10 text-slate-500">
                No bookings found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
