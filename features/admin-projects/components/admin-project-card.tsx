import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import SafeImage from '@/components/ui/safe-image';
import { Project } from '@/lib/projectStore';

interface AdminProjectCardProps {
  project: Project;
  onOpenModal: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export default function AdminProjectCard({ project, onOpenModal, onDeleteProject }: AdminProjectCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#0f172a] border border-white/5 rounded-2xl p-4 shadow-lg hover:border-white/10 transition-colors group relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-14 h-14 bg-slate-800 rounded-xl overflow-hidden border border-white/10 shrink-0">
          <SafeImage src={project.logoUrl} alt={project.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onOpenModal(project)}
            className="p-2 bg-slate-800 hover:bg-primary/20 hover:text-primary rounded-lg text-slate-400 transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDeleteProject(project.id)}
            className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="text-white font-bold text-lg mb-1">{project.name}</h3>
      <p className="text-slate-400 text-sm mb-4 line-clamp-2 h-10">{project.description}</p>

      <div className="flex items-center text-xs text-slate-500 gap-2 border-t border-white/5 pt-3 mt-auto">
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center hover:text-primary transition-colors truncate max-w-full"
        >
          <ExternalLink size={12} className="mr-1" />
          <span className="truncate">{project.link}</span>
        </a>
      </div>
    </motion.div>
  );
}
