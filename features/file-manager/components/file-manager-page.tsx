import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFileManager } from '../hooks/use-file-manager';
import FileUploadButton from './file-upload-button';
import FileList from './file-list';

export default function FileManagerPage() {
  const {
    router,
    t,
    dir,
    fileInputRef,
    files,
    isUploading,
    error,
    handleFileSelect,
    handleDelete,
    formatSize,
    isImage,
  } = useFileManager();

  return (
    <div className="flex flex-col h-full bg-[#020617] relative overflow-y-auto no-scrollbar pb-24">
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-4 border-b border-white/5 flex items-center shadow-lg">
        <button
          type="button"
          onClick={() => router.push('/more')}
          className="p-2 -ms-2 text-slate-400 hover:text-white transition-colors"
        >
          {dir === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
        <h1 className="text-lg font-bold text-white ms-2">{t('files.title')}</h1>
      </div>

      <div className="p-6">
        <FileUploadButton
          fileInputRef={fileInputRef}
          isUploading={isUploading}
          onFileSelect={handleFileSelect}
          error={error}
          t={t}
        />

        <FileList
          files={files}
          isUploading={isUploading}
          dir={dir}
          t={t}
          isImage={isImage}
          formatSize={formatSize}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
