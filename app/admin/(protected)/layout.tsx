'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/admin-layout';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/admin/login');
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists() && adminDoc.data().status === 'Active') {
          setIsChecking(false);
        } else {
          router.replace('/home');
        }
      } catch (e) {
        router.replace('/home');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isChecking) {
    return (
      <div className="h-screen w-full bg-[#020617] flex items-center justify-center text-white">Loading...</div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
