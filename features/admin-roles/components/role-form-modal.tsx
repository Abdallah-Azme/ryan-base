import React from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Role } from '@/lib/roleStore';
import RolePermissionList from './role-permission-list';

interface RoleFormModalProps {
  onClose: () => void;
  editingRole: Role | null;
  formData: {
    name: string;
    description: string;
    permissions: string[];
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      permissions: string[];
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
  onTogglePermission: (perm: string) => void;
}

export default function RoleFormModal({
  onClose,
  editingRole,
  formData,
  setFormData,
  onSubmit,
  onTogglePermission,
}: RoleFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0f172a] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {editingRole ? 'Edit Role' : 'Add New Role'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="roleForm" onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 ml-1">
                Role Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="e.g. Sales Manager"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 ml-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors h-20 resize-none"
                placeholder="Role purpose..."
              />
            </div>

            <RolePermissionList
              selectedPermissions={formData.permissions}
              onTogglePermission={onTogglePermission}
            />
          </form>
        </div>

        <div className="p-5 border-t border-white/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            form="roleForm"
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-white font-medium text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-colors"
          >
            <Save size={16} />
            <span>Save Role</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
