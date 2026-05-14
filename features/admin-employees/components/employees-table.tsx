import React from 'react';
import { Briefcase } from 'lucide-react';
import { AdminUser } from '@/lib/adminStore';
import EmployeeTableRow from './employee-table-row';

interface EmployeesTableProps {
  filteredAdmins: AdminUser[];
  getRoleName: (id: string) => string;
  formatDate: (ts: number) => string;
  onSelectAdmin: (admin: AdminUser) => void;
  onOpenModal: (admin: AdminUser) => void;
  onDeleteAdmin: (id: string) => void;
}

export default function EmployeesTable({
  filteredAdmins,
  getRoleName,
  formatDate,
  onSelectAdmin,
  onOpenModal,
  onDeleteAdmin,
}: EmployeesTableProps) {
  return (
    <div className="bg-[#0f172a] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
      {filteredAdmins.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <Briefcase size={24} />
          </div>
          <p>No admins found.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="p-5 font-medium">Name</th>
                  <th className="p-5 font-medium">Contact</th>
                  <th className="p-5 font-medium">Role</th>
                  <th className="p-5 font-medium">Status</th>
                  <th className="p-5 font-medium">Created</th>
                  <th className="p-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredAdmins.map((admin) => (
                  <EmployeeTableRow
                    key={admin.id}
                    admin={admin}
                    getRoleName={getRoleName}
                    formatDate={formatDate}
                    onSelectAdmin={onSelectAdmin}
                    onOpenModal={onOpenModal}
                    onDeleteAdmin={onDeleteAdmin}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-white/5">
            {filteredAdmins.map((admin) => (
              <EmployeeTableRow
                key={admin.id}
                admin={admin}
                getRoleName={getRoleName}
                formatDate={formatDate}
                onSelectAdmin={onSelectAdmin}
                onOpenModal={onOpenModal}
                onDeleteAdmin={onDeleteAdmin}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
