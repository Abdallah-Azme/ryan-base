import React from 'react';
import { Check } from 'lucide-react';
import { PERMISSIONS_LIST } from '@/lib/roleStore';

interface RolePermissionListProps {
  selectedPermissions: string[];
  onTogglePermission: (perm: string) => void;
}

export default function RolePermissionList({
  selectedPermissions,
  onTogglePermission,
}: RolePermissionListProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-300 ml-1">Permissions</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PERMISSIONS_LIST.map((perm) => {
          const isSelected = selectedPermissions.includes(perm);
          return (
            <div
              key={perm}
              onClick={() => onTogglePermission(perm)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-primary/10 border-primary/40 text-white'
                  : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'
              }`}
            >
              <span className="text-sm">{perm}</span>
              {isSelected ? <Check size={16} className="text-primary" /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
