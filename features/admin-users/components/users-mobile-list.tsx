import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import { User } from '@/lib/userStore';

interface UsersMobileListProps {
  filteredUsers: User[];
  onSelectUser: (user: User) => void;
}

export default function UsersMobileList({ filteredUsers, onSelectUser }: UsersMobileListProps) {
  return (
    <div className="md:hidden divide-y divide-white/5">
      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => onSelectUser(user)}
        >
          <div className="flex items-center gap-3">
            <Avatar name={`${user.firstName} ${user.lastName}`} className="w-10 h-10 border border-white/10 text-sm" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs text-slate-500 mb-1">{user.email}</p>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  user.status === 'Active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}
              >
                {user.status}
              </span>
              <span className="text-[10px] text-slate-600">•</span>
              <span className="text-[10px] text-slate-500">{user.role}</span>
            </div>
          </div>
          <MoreHorizontal size={20} className="text-slate-600" />
        </div>
      ))}
    </div>
  );
}
