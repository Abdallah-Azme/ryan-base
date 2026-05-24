import React from 'react';
import { List, Calendar, Settings as SettingsIcon, Loader2, AlertTriangle } from 'lucide-react';
import { useAdminAppointments, DAYS } from '../hooks/use-admin-appointments';
import AdminBookingsTab from './admin-bookings-tab';
import AdminScheduleTab from './admin-schedule-tab';
import AdminSettingsTab from './admin-settings-tab';

export default function AdminAppointmentsPage() {
  const {
    activeTab,
    setActiveTab,
    settings,
    setSettings,
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
  } = useAdminAppointments();

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white">Appointments</h1>
        <p className="text-slate-400 text-sm">Manage availability and view bookings.</p>
      </div>

      <div className="flex bg-slate-800/50 p-1 rounded-xl w-fit border border-white/5">
        {[
          { id: 'bookings', label: 'Bookings', icon: List },
          { id: 'schedule', label: 'Availability', icon: Calendar },
          { id: 'settings', label: 'Settings', icon: SettingsIcon },
        ].map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[#0f172a] border border-white/5 rounded-2xl shadow-xl min-h-[500px]">
        {activeTab === 'bookings' ? (
          <div className="p-6">
            {error ? (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-4 flex items-center gap-3">
                <AlertTriangle className="text-red-400" size={20} />
                <span className="text-red-400 text-sm font-medium">{error}</span>
              </div>
            ) : null}

            <AdminBookingsTab
              bookings={filteredBookings}
              statusFilter={bookingStatusFilter}
              searchQuery={bookingSearch}
              onStatusFilterChange={setBookingStatusFilter}
              onSearchQueryChange={setBookingSearch}
              selectedBooking={selectedBooking}
              rejectReason={rejectReason}
              adminNotes={adminNotes}
              onSetRejectReason={setRejectReason}
              onSetAdminNotes={setAdminNotes}
              onOpenBooking={openBooking}
              onCloseBooking={() => setSelectedBooking(null)}
              onAcceptBooking={handleAcceptBooking}
              onRejectBooking={handleRejectBooking}
              onSaveAdminNotes={handleSaveAdminNotes}
              onCompleteBooking={handleCompleteBooking}
              onCancelBooking={handleCancelBooking}
            />
          </div>
        ) : null}

        {activeTab === 'schedule' ? (
          <div className="p-6">
            <AdminScheduleTab
              settings={settings}
              savingId={savingId}
              onSaveSettings={handleSaveSettings}
              onUpdateAvailability={handleUpdateAvailability}
              onAddRange={handleAddRange}
              onRemoveRange={handleRemoveRange}
              onChangeRange={handleChangeRange}
              days={DAYS}
            />
          </div>
        ) : null}

        {activeTab === 'settings' ? (
          <div className="p-6 max-w-2xl">
            <AdminSettingsTab
              settings={settings}
              setSettings={setSettings}
              loading={loading}
              onSaveSettings={handleSaveSettings}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
