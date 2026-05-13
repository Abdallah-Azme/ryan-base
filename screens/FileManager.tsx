"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Upload, FileText, Image as ImageIcon, Trash2, X, Check, Loader2, Download, ChevronRight } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase-client';
import SafeImage from '../components/SafeImage';
import { useTranslation } from '../lib/i18nContext';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: any;
}

const FileManager: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { t, dir } = useTranslation();

  // Subscribe to Firestore 'uploads' collection
  useEffect(() => {
    const q = query(collection(db, 'uploads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedFiles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UploadedFile[];
      setFiles(fetchedFiles);
    }, (err) => {
      console.error("Firestore Error:", err);
      // Optional: Set default files or error state if needed
    });

    return () => unsubscribe();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      
      // 2. Get Download URL
      const url = await getDownloadURL(snapshot.ref);

      // 3. Save Metadata to Firestore
      await addDoc(collection(db, 'uploads'), {
        name: file.name,
        url: url,
        type: file.type,
        size: file.size,
        createdAt: Timestamp.now()
      });

      setUploadProgress(100);
    } catch (err: any) {
      console.error("Upload failed", err);
      setError("Failed to upload file. Check console/config.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!window.confirm(t('files.delete_confirm'))) return;
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'uploads', file.id));
      
      // 2. Try to delete from Storage (optional, might fail if permission denied or refs differ)
      // Extract path from URL or reconstruct it if we saved the ref path. 
      // For simplicity in this demo, we just remove the db entry primarily.
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImage = (type: string) => type.startsWith('image/');

  return (
    <div className="flex flex-col h-full bg-[#020617] relative overflow-y-auto no-scrollbar pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-4 border-b border-white/5 flex items-center shadow-lg">
        <button 
          onClick={() => router.push('/more')}
          className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
        >
          {dir === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
        <h1 className="text-lg font-bold text-white ml-2 rtl:mr-2 rtl:ml-0">{t('files.title')}</h1>
      </div>

      <div className="p-6">
        
        {/* Upload Area */}
        <div className="mb-8">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
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
          
          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
              {error}
            </div>
          )}
        </div>

        {/* File List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Check size={14} className="text-emerald-500" />
            {t('files.uploaded')} ({files.length})
          </h2>
          
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                className="bg-slate-800/40 border border-white/5 rounded-xl p-3 flex items-center gap-3 group"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {isImage(file.type) ? (
                    <SafeImage src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <FileText size={20} className="text-slate-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-medium truncate mb-0.5">{file.name}</h4>
                  <p className="text-slate-500 text-xs flex items-center gap-2">
                    <span>{formatSize(file.size)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="uppercase">{file.type.split('/')[1] || 'FILE'}</span>
                  </p>
                </div>

                {/* Actions */}
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
                     onClick={() => handleDelete(file)}
                     className="p-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {files.length === 0 && !isUploading && (
             <div className="text-center py-10 opacity-50">
               <p className="text-slate-500 text-sm">{t('files.empty')}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManager;
