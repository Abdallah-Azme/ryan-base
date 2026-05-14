import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase-client';

export function useAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapMessage, setBootstrapMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const authEmail = `admin_${email}`;
      const userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
      const user = userCredential.user;

      if (!db) throw new Error('Database not initialized');

      const adminDoc = await getDoc(doc(db, 'admins', user.uid));

      if (!adminDoc.exists()) {
        await auth.signOut();
        throw new Error('Access Denied: You are not an administrator.');
      }

      const adminData = adminDoc.data();
      if (adminData.status === 'Disabled') {
        await auth.signOut();
        throw new Error('Access Denied: Your account has been disabled.');
      }

      router.push('/admin/projects');
    } catch (err: any) {
      console.error('Admin Login Error:', err);
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Try again later.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBootstrap = async () => {
    if (
      !window.confirm(
        "Create or Recover Super Admin (Nader)?\n\nIf the account exists, we'll try to update permissions (requires default password)."
      )
    )
      return;

    setIsBootstrapping(true);
    setError('');
    setBootstrapMessage(null);

    try {
      if (!db) throw new Error('Database not connected');

      const realEmail = 'nader.alizddin@gmail.com';
      const authEmail = `admin_${realEmail}`;
      const defaultPassword = 'Nader@321';
      const firstName = 'Nader';
      const lastName = 'Admin';

      let user;
      let actionTaken = '';

      await setDoc(
        doc(db, 'roles', 'super_admin'),
        {
          name: 'Super Admin',
          description: 'Full system access and control',
          permissions: ['*'],
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, defaultPassword);
        user = userCredential.user;
        actionTaken = 'Created new Super Admin account';
      } catch (createErr: any) {
        if (createErr.code === 'auth/email-already-in-use') {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, authEmail, defaultPassword);
            user = userCredential.user;
            actionTaken = 'Recovered existing Super Admin account';
          } catch (loginErr) {
            throw new Error(
              `The admin account '${realEmail}' already exists, but the password is not the default. Cannot recover automatically.`
            );
          }
        } else {
          throw createErr;
        }
      }

      if (user) {
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`,
        });

        await setDoc(
          doc(db, 'admins', user.uid),
          {
            id: user.uid,
            name: `${firstName} ${lastName}`,
            email: realEmail,
            role: 'super_admin',
            permissions: {
              projects: true,
              users: true,
              admins: true,
              roles: true,
              ai: true,
            },
            status: 'Active',
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );

        setBootstrapMessage(`${actionTaken} successfully! You can now log in.`);
        setEmail(realEmail);
        setPassword(defaultPassword);
      }
    } catch (err: any) {
      console.error('Bootstrap Error:', err);
      const msg = err.message || 'Failed to initialize system';
      setError(msg);
    } finally {
      setIsBootstrapping(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    isBootstrapping,
    bootstrapMessage,
    handleLogin,
    handleBootstrap,
  };
}
