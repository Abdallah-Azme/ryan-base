import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, Download } from 'lucide-react';
import SafeImage from '@/components/ui/safe-image';
import { UploadedFile } from '../hooks/use-file-manager';

interface FileListItemProps {
  file: UploadedFile;
  dir: string;
  isImage: (type: string) => boolean;
  formatSize: (size: number) => string;
  onDelete: (file: UploadedFile) => void;
}

export default function FileListItem({ file, dir, isImage, formatSize, onDelete }: FileListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
      className="bg-slate-800/40 border border-white/5 rounded-xl p-3 flex items-center gap-3 group"
    >
      <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
        {isImage(file.type) ? (
          <SafeImage src={file.url} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <FileText size={20} className="text-slate-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-white text-sm font-medium truncate mb-0.5">{file.name}</h4>
        <p className="text-slate-500 text-xs flex items-center gap-2">
          <span>{formatSize(file.size)}</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="uppercase">{file.type.split('/')[1] || 'FILE'}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <Download size={16} />
        </a>
        <button
          type="button"
          onClick={() => onDelete(file)}
          className="p-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}
