import React from 'react';
import { Loader2 } from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import { useAdminAccount } from '../hooks/use-admin-account';
import AdminProfileForm from './admin-profile-form';

export default function AdminAccountPage() {
  const { isLoading, isSaving, success, formData, setFormData, handleSave } = useAdminAccount();

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

      <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center space-y-3 w-full md:w-auto">
            <div className="w-24 h-24 rounded-full border-4 border-slate-800 shadow-2xl relative">
              <Avatar name={`${formData.firstName} ${formData.lastName}`} size="xl" className="w-full h-full text-3xl" />
              <div className="absolute bottom-0 right-0 bg-slate-800 rounded-full p-1 border border-white/10">
                <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-800" title="Active" />
              </div>
            </div>
            <div className="text-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 capitalize">
                {formData.role}
              </span>
            </div>
          </div>

          <AdminProfileForm
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            isSaving={isSaving}
            success={success}
          />
        </div>
      </div>
    </div>
  );
}
