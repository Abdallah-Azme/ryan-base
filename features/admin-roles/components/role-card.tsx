import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Edit2, Trash2 } from 'lucide-react';
import { Role } from '@/lib/roleStore';

interface RoleCardProps {
  role: Role;
  onOpenModal: (role?: Role) => void;
  onDeleteRole: (id: string) => void;
}

export default function RoleCard({ role, onOpenModal, onDeleteRole }: RoleCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-lg hover:border-white/10 transition-colors group relative overflow-hidden flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 text-primary">
          <ShieldCheck size={24} />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onOpenModal(role)}
            className="p-2 bg-slate-800 hover:bg-primary/20 hover:text-primary rounded-lg text-slate-400 transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDeleteRole(role.id)}
            className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="text-white font-bold text-lg mb-1">{role.name}</h3>
      <p className="text-slate-400 text-sm mb-4 h-10 line-clamp-2">{role.description}</p>

      <div className="mt-auto">
        <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-2">Permissions</h4>
        <div className="flex flex-wrap gap-2">
          {role.permissions.slice(0, 3).map((perm) => (
            <span
              key={perm}
              className="text-[10px] bg-slate-800 border border-white/5 text-slate-300 px-2 py-1 rounded-md"
            >
              {perm}
            </span>
          ))}
          {role.permissions.length > 3 ? (
            <span className="text-[10px] bg-slate-800 border border-white/5 text-slate-400 px-2 py-1 rounded-md">
              +{role.permissions.length - 3} more
            </span>
          ) : null}
          {role.permissions.length === 0 ? (
            <span className="text-[10px] text-slate-600 italic">No specific permissions</span>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
