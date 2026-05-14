import React from 'react';
import { LayoutGrid, Loader2 } from 'lucide-react';
import { UserProject } from '@/lib/userProjectsStore';
import UserProjectsRow from './user-projects-row';

interface UserProjectsTableProps {
  loading: boolean;
  error: string | null;
  filteredProjects: UserProject[];
  onEdit: (project: UserProject) => void;
  formatDate: (ts: number) => string;
}

export default function UserProjectsTable({
  loading,
  error,
  filteredProjects,
  onEdit,
  formatDate,
}: UserProjectsTableProps) {
  return (
    <div className="bg-[#0f172a] border border-white/5 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 size={32} className="animate-spin mb-4 text-primary" />
          <p>Loading projects from Firestore...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
            <LayoutGrid size={24} />
          </div>
          <p>{error ? 'Unable to load data.' : 'No user projects found.'}</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="p-5 font-medium">Project</th>
                  <th className="p-5 font-medium">Status</th>
                  <th className="p-5 font-medium">Pricing</th>
                  <th className="p-5 font-medium">Customer</th>
                  <th className="p-5 font-medium">Created</th>
                  <th className="p-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredProjects.map((p) => (
                  <UserProjectsRow key={p.id} project={p} onEdit={onEdit} formatDate={formatDate} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-white/5">
            {filteredProjects.map((p) => (
              <UserProjectsRow key={p.id} project={p} onEdit={onEdit} formatDate={formatDate} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
