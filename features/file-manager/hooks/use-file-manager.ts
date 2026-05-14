import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase-client';
import { useTranslation } from '@/lib/i18nContext';

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: any;
}

export function useFileManager() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { t, dir } = useTranslation();

  useEffect(() => {
    const q = query(collection(db, 'uploads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedFiles = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as UploadedFile[];
        setFiles(fetchedFiles);
      },
      (err) => {
        console.error('Firestore Error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'uploads'), {
        name: file.name,
        url,
        type: file.type,
        size: file.size,
        createdAt: Timestamp.now(),
      });

      setUploadProgress(100);
    } catch (err: any) {
      console.error('Upload failed', err);
      setError('Failed to upload file. Check console/config.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await uploadFile(file);
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!window.confirm(t('files.delete_confirm'))) return;
    try {
      await deleteDoc(doc(db, 'uploads', file.id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const isImage = (type: string) => type.startsWith('image/');

  return {
    router,
    t,
    dir,
    fileInputRef,
    files,
    isUploading,
    uploadProgress,
    error,
    handleFileSelect,
    handleDelete,
    formatSize,
    isImage,
  };
}
