import React from 'react';
import Link from 'next/link';
import { Eye, LayoutGrid, Link as LinkIcon, Edit2 } from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import { UserProject } from '@/lib/userProjectsStore';

interface UserProjectsRowProps {
  project: UserProject;
  onEdit: (project: UserProject) => void;
  formatDate: (ts: number) => string;
}

export default function UserProjectsRow({ project, onEdit, formatDate }: UserProjectsRowProps) {
  const detailHref = project.ownerId
    ? `/admin/user-projects/${encodeURIComponent(project.ownerId)}/${encodeURIComponent(project.id)}`
    : '/admin/user-projects';

  return (
    <>
      <tr className="hidden md:table-row hover:bg-white/[0.02] transition-colors group">
        <td className="p-5">
          <Link href={detailHref} className="flex items-center gap-3 group/project">
            <div
              className={`w-10 h-10 ${
                project.iconBg || 'bg-slate-700'
              } rounded-lg flex items-center justify-center text-white border border-white/10 shadow-inner`}
            >
              <LayoutGrid size={18} className="opacity-80" />
            </div>
            <div>
              <div className="font-medium text-white group-hover/project:text-primary transition-colors">{project.name}</div>
              <div className="text-slate-500 text-xs flex items-center gap-1">
                {project.projectUrl ? <LinkIcon size={10} /> : null}
                {project.version || 'v1.0.0'}
                {project.industry ? (
                  <span className="text-slate-600">
                    • {project.industry === 'Other' ? project.industryOther : project.industry}
                  </span>
                ) : null}
              </div>
            </div>
          </Link>
        </td>
        <td className="p-5">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
              project.status === 'cancelled'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {project.status}
          </span>
        </td>
        <td className="p-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-white text-xs font-medium">
              {project.estimatedPrice ? `${project.estimatedPrice.toLocaleString()} KWD` : '—'}
            </span>
            <span className="text-slate-500 text-[10px]">
              {project.estimatedDuration ? `${project.estimatedDuration} days` : '—'}
            </span>
          </div>
        </td>
        <td className="p-5">
          <div className="flex items-center gap-2">
            <Avatar name={project.ownerName} size="sm" className="w-6 h-6 text-[10px]" />
            <div>
              <div className="text-white text-xs font-medium">{project.ownerName}</div>
              <div className="text-slate-500 text-[10px]">{project.ownerEmail}</div>
            </div>
          </div>
        </td>
        <td className="p-5 text-slate-400 text-xs">{formatDate(project.createdAt)}</td>
        <td className="p-5 text-right">
          <div className="flex items-center justify-end gap-2">
            <Link
              href={detailHref}
              className="p-2 bg-slate-800 hover:bg-primary/20 rounded-lg text-slate-400 hover:text-primary transition-colors border border-white/5 hover:border-primary/30"
              title="Open operations"
            >
              <Eye size={16} />
            </Link>
            <button
              type="button"
              onClick={() => onEdit(project)}
              className="p-2 bg-slate-800 hover:bg-white/5 rounded-lg text-slate-400 hover:text-primary transition-colors border border-white/5 hover:border-primary/30"
              title="Edit project"
            >
              <Edit2 size={16} />
            </button>
          </div>
        </td>
      </tr>

      <div className="md:hidden p-4 flex flex-col gap-3 border-b border-white/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${
                project.iconBg || 'bg-slate-700'
              } rounded-lg flex items-center justify-center text-white border border-white/10 shadow-inner`}
            >
              <LayoutGrid size={18} className="opacity-80" />
            </div>
            <div>
              <Link href={detailHref} className="text-sm font-bold text-white hover:text-primary transition-colors">
                {project.name}
              </Link>
              <div className="text-slate-500 text-xs flex items-center gap-2 mt-1">
                <span className="capitalize text-primary font-medium">{project.status}</span>
                <span>•</span>
                <span>{project.estimatedPrice ? `${project.estimatedPrice} KWD` : '—'}</span>
              </div>
              {project.industry ? (
                <div className="text-xs text-slate-600 mt-1">
                  {project.industry === 'Other' ? project.industryOther : project.industry}
                </div>
              ) : null}
              <div className="text-xs text-slate-500 mt-1">Owner: {project.ownerName}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={detailHref} className="p-2 text-slate-400 hover:text-primary bg-slate-800 rounded-lg">
              <Eye size={16} />
            </Link>
            <button
              type="button"
              onClick={() => onEdit(project)}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              <Edit2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
