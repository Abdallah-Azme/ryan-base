import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { UploadedFile } from '../hooks/use-file-manager';
import FileListItem from './file-list-item';

interface FileListProps {
  files: UploadedFile[];
  isUploading: boolean;
  dir: string;
  t: (key: string) => string;
  isImage: (type: string) => boolean;
  formatSize: (size: number) => string;
  onDelete: (file: UploadedFile) => void;
}

export default function FileList({
  files,
  isUploading,
  dir,
  t,
  isImage,
  formatSize,
  onDelete,
}: FileListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <Check size={14} className="text-emerald-500" />
        {t('files.uploaded')} ({files.length})
      </h2>

      <AnimatePresence>
        {files.map((file) => (
          <FileListItem
            key={file.id}
            file={file}
            dir={dir}
            isImage={isImage}
            formatSize={formatSize}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>

      {files.length === 0 && !isUploading ? (
        <div className="text-center py-10 opacity-50">
          <p className="text-slate-500 text-sm">{t('files.empty')}</p>
        </div>
      ) : null}
    </div>
  );
}
