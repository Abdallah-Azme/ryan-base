import React from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Phone, Ban, CheckCircle, Trash2 } from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import { AdminUser } from '@/lib/adminStore';

interface EmployeeDetailDrawerProps {
  selectedAdmin: AdminUser;
  onClose: () => void;
  getRoleName: (id: string) => string;
  formatDate: (ts: number) => string;
  onToggleStatus: (admin: AdminUser) => void;
  onDeleteAdmin: (id: string) => void;
}

export default function EmployeeDetailDrawer({
  selectedAdmin,
  onClose,
  getRoleName,
  formatDate,
  onToggleStatus,
  onDeleteAdmin,
}: EmployeeDetailDrawerProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0f172a] border-l border-white/10 shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Admin Details</h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 mb-4">
              <Avatar name={selectedAdmin.name} size="xl" className="w-full h-full text-3xl border-4 border-slate-800 shadow-xl" />
            </div>
            <h3 className="text-2xl font-bold text-white">{selectedAdmin.name}</h3>
            <p className="text-slate-400">{getRoleName(selectedAdmin.role)}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
              <div className="text-xs text-slate-500 mb-1 flex items-center gap-2">
                <Mail size={12} /> Email
              </div>
              <div className="text-white">{selectedAdmin.email}</div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
              <div className="text-xs text-slate-500 mb-1 flex items-center gap-2">
                <Phone size={12} /> Phone
              </div>
              <div className="text-white">{selectedAdmin.phone || 'N/A'}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                <div className="text-xs text-slate-500 mb-1">Status</div>
                <div className={selectedAdmin.status === 'Active' ? 'text-emerald-400' : 'text-red-400'}>
                  {selectedAdmin.status}
                </div>
              </div>
              <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                <div className="text-xs text-slate-500 mb-1">Created</div>
                <div className="text-white text-sm">{formatDate(selectedAdmin.createdAt)}</div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Effective Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedAdmin.permissions || {}).map(([perm, enabled]) =>
                  enabled ? (
                    <span
                      key={perm}
                      className="text-[10px] bg-slate-800 border border-white/10 px-2 py-1 rounded text-slate-300"
                    >
                      {perm}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-[#0f172a] flex gap-3">
          <button
            type="button"
            onClick={() => onToggleStatus(selectedAdmin)}
            className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${
              selectedAdmin.status === 'Active' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
            }`}
          >
            {selectedAdmin.status === 'Active' ? <Ban size={18} /> : <CheckCircle size={18} />}
            {selectedAdmin.status === 'Active' ? 'Disable' : 'Enable'}
          </button>
          <button
            type="button"
            onClick={() => onDeleteAdmin(selectedAdmin.id)}
            className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 font-medium text-sm flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </motion.div>
    </>
  );
}
