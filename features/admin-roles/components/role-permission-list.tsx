import React from 'react';
import { Check, Shield } from 'lucide-react';
import { PERMISSION_GROUPS } from '@/lib/permissions';

interface RolePermissionListProps {
  selectedPermissions: string[];
  onTogglePermission: (perm: string) => void;
}

export default function RolePermissionList({
  selectedPermissions,
  onTogglePermission,
}: RolePermissionListProps) {
  return (
    <div className="space-y-4">
      <label className="text-xs font-medium text-slate-300 ml-1">Permissions</label>
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.label} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-primary" />
            <h3 className="text-sm font-bold text-white">{group.label}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {group.permissions.map(([value, label]) => {
              const isSelected = selectedPermissions.includes(value);
              return (
                <button
                  type="button"
                  key={value}
                  onClick={() => onTogglePermission(value)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all text-left ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40 text-white'
                      : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'
                  }`}
                >
                  <span className="text-sm">{label}</span>
                  {isSelected ? <Check size={16} className="text-primary shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
