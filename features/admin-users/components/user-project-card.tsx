import React from 'react';
import { LayoutGrid, ExternalLink } from 'lucide-react';
import { UserProject } from '@/lib/userProjectsStore';

interface UserProjectCardProps {
  project: UserProject;
  formatDate: (ts: number) => string;
}

export default function UserProjectCard({ project, formatDate }: UserProjectCardProps) {
  return (
    <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 group hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 ${
              project.iconBg || 'bg-slate-700'
            } rounded-lg flex items-center justify-center text-white border border-white/10`}
          >
            <LayoutGrid size={20} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">{project.name}</h4>
            <p className="text-slate-400 text-xs">{project.industry || 'General App'}</p>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
            project.status === 'cancelled'
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {project.status || 'Draft'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
          <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Platform</span>
          <span className="text-xs text-white truncate block">{project.platforms?.join(', ') || 'Web & Mobile'}</span>
        </div>
        <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
          <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Updated</span>
          <span className="text-xs text-white truncate block">{formatDate(project.updatedAt)}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-white/5 flex justify-end">
        {project.projectUrl ? (
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary hover:text-white flex items-center gap-1 transition-colors"
          >
            Open Project <ExternalLink size={12} />
          </a>
        ) : (
          <span className="text-xs text-slate-600 cursor-not-allowed">No URL</span>
        )}
      </div>
    </div>
  );
}
