import React from 'react';
import { User } from '@/lib/userStore';
import UsersTableRow from './users-table-row';

interface UsersTableProps {
  filteredUsers: User[];
  formatDate: (ts: number) => string;
  onSelectUser: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export default function UsersTable({
  filteredUsers,
  formatDate,
  onSelectUser,
  onToggleStatus,
  onDeleteUser,
}: UsersTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
            <th className="p-5 font-medium">User</th>
            <th className="p-5 font-medium">Contact</th>
            <th className="p-5 font-medium">Role</th>
            <th className="p-5 font-medium">Status</th>
            <th className="p-5 font-medium">Registered</th>
            <th className="p-5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm">
          {filteredUsers.map((user) => (
            <UsersTableRow
              key={user.id}
              user={user}
              formatDate={formatDate}
              onSelectUser={onSelectUser}
              onToggleStatus={onToggleStatus}
              onDeleteUser={onDeleteUser}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
