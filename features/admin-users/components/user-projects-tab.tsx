import React from 'react';
import { Loader2, LayoutGrid } from 'lucide-react';
import { UserProject } from '@/lib/userProjectsStore';
import UserProjectCard from './user-project-card';

interface UserProjectsTabProps {
  loadingProjects: boolean;
  userProjects: UserProject[];
  formatDate: (ts: number) => string;
}

export default function UserProjectsTab({ loadingProjects, userProjects, formatDate }: UserProjectsTabProps) {
  if (loadingProjects) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-500">
        <Loader2 size={32} className="animate-spin mb-2" />
        <p>Loading projects...</p>
      </div>
    );
  }

  if (userProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-500 bg-slate-800/20 rounded-2xl border border-white/5">
        <LayoutGrid size={32} className="mb-2 opacity-50" />
        <p>No projects for this user yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userProjects.map((project) => (
        <UserProjectCard key={project.id} project={project} formatDate={formatDate} />
      ))}
    </div>
  );
}
