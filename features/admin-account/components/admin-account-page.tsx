import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAdminAccount } from '../hooks/use-admin-account';
import AdminProfileForm from './admin-profile-form';

export default function AdminAccountPage() {
  const { isLoading, isSaving, success, formData, handleSave } = useAdminAccount();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 min-h-[50vh]">
        <Loader2 className="animate-spin mr-2" /> Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-slate-400 text-sm">Manage your admin profile and preferences.</p>
      </div>

      <AdminProfileForm
        defaultValues={formData}
        onSave={handleSave}
        isSaving={isSaving}
        success={success}
      />
    </div>
  );
}
