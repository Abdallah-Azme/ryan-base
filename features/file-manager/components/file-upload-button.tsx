import React from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface FileUploadButtonProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string | null;
  t: (key: string) => string;
}

export default function FileUploadButton({
  fileInputRef,
  isUploading,
  onFileSelect,
  error,
  t,
}: FileUploadButtonProps) {
  return (
    <div className="mb-8">
      <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
          isUploading
            ? 'bg-slate-800/50 border-primary/50 cursor-wait'
            : 'bg-slate-800/30 border-white/10 hover:bg-slate-800/50 hover:border-primary/50 cursor-pointer group'
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 size={32} className="text-primary mb-2 animate-spin" />
            <span className="text-slate-400 text-sm">{t('files.uploading')}</span>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload size={24} className="text-primary" />
            </div>
            <h3 className="text-white font-medium mb-1">{t('files.tap_upload')}</h3>
            <p className="text-slate-500 text-xs">{t('files.upload_types')}</p>
          </>
        )}
      </button>

      {error ? (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
          {error}
        </div>
      ) : null}
    </div>
  );
}
