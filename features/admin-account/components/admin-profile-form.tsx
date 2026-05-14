import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Lock, CheckCircle, Loader2, Save } from 'lucide-react';

interface AdminProfileFormProps {
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    email: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      firstName: string;
      lastName: string;
      phone: string;
      role: string;
      email: string;
    }>
  >;
  onSave: (e: React.FormEvent) => Promise<void>;
  isSaving: boolean;
  success: boolean;
}

export default function AdminProfileForm({
  formData,
  setFormData,
  onSave,
  isSaving,
  success,
}: AdminProfileFormProps) {
  return (
    <form onSubmit={onSave} className="flex-1 w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
        <div className="relative" dir="ltr">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
            placeholder="+965 ..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
        <div className="relative opacity-60">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-slate-400 cursor-not-allowed"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 flex items-center gap-1">
            <Lock size={12} /> Read-only
          </div>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-end gap-4">
        {success ? (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-emerald-400 text-sm font-medium flex items-center gap-2"
          >
            <CheckCircle size={16} /> Saved Successfully
          </motion.div>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="bg-primary hover:bg-sky-400 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
}
