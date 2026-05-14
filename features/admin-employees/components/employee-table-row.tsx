import React from 'react';
import { Mail, Phone, Eye, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import { AdminUser } from '@/lib/adminStore';

interface EmployeeTableRowProps {
  admin: AdminUser;
  getRoleName: (id: string) => string;
  formatDate: (ts: number) => string;
  onSelectAdmin: (admin: AdminUser) => void;
  onOpenModal: (admin: AdminUser) => void;
  onDeleteAdmin: (id: string) => void;
}

export default function EmployeeTableRow({
  admin,
  getRoleName,
  formatDate,
  onSelectAdmin,
  onOpenModal,
  onDeleteAdmin,
}: EmployeeTableRowProps) {
  return (
    <>
      <tr className="hidden md:table-row hover:bg-white/[0.02] transition-colors group">
        <td className="p-5">
          <div className="flex items-center gap-3">
            <Avatar name={admin.name} className="w-10 h-10 border border-white/10 text-sm" />
            <div>
              <div className="font-medium text-white">{admin.name}</div>
              <div className="text-slate-500 text-xs">ID: {admin.id.slice(-6)}</div>
            </div>
          </div>
        </td>
        <td className="p-5 text-slate-300">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5">
              <Mail size={12} className="text-slate-500" /> {admin.email}
            </span>
            {admin.phone ? (
              <span className="flex items-center gap-1.5">
                <Phone size={12} className="text-slate-500" /> {admin.phone}
              </span>
            ) : null}
          </div>
        </td>
        <td className="p-5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-white/5">
            {getRoleName(admin.role)}
          </span>
        </td>
        <td className="p-5">
          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                admin.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'
              }`}
            />
            <span className={admin.status === 'Active' ? 'text-slate-200' : 'text-slate-500'}>{admin.status}</span>
          </div>
        </td>
        <td className="p-5 text-slate-400">{formatDate(admin.createdAt)}</td>
        <td className="p-5 text-right">
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onSelectAdmin(admin)}
              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
              title="View"
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              onClick={() => onOpenModal(admin)}
              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => onDeleteAdmin(admin.id)}
              className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>

      <div
        className="md:hidden p-4 flex items-center justify-between cursor-pointer border-b border-white/5"
        onClick={() => onSelectAdmin(admin)}
      >
        <div className="flex items-center gap-3">
          <Avatar name={admin.name} className="w-10 h-10 border border-white/10 text-sm" />
          <div>
            <h3 className="text-sm font-medium text-white">{admin.name}</h3>
            <p className="text-xs text-slate-500">{getRoleName(admin.role)}</p>
          </div>
        </div>
        <MoreHorizontal size={20} className="text-slate-600" />
      </div>
    </>
  );
}
