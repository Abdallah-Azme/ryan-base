"use client";
// @ts-nocheck
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2, Zap } from 'lucide-react';
import SafeImage from '../../components/SafeImage';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, getDocs, query, limit, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase-client';

const AdminLogin: React.FC = () => {
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
      // PREFIX STRATEGY: 
      // We prepend 'admin_' to the email for Auth to separate App Users from Dashboard Users.
      const authEmail = `admin_${email}`;

      const userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
      const user = userCredential.user;

      // CHECK: Is this user in the 'admins' collection?
      if (!db) throw new Error("Database not initialized");
      
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (!adminDoc.exists()) {
        await auth.signOut(); // Sign out immediately if not authorized
        throw new Error("Access Denied: You are not an administrator.");
      }

      const adminData = adminDoc.data();
      if (adminData.status === 'Disabled') {
        await auth.signOut();
        throw new Error("Access Denied: Your account has been disabled.");
      }
      
      // Success - Redirect. No localStorage "adminAuth" needed anymore.
      router.push('/admin/projects');

    } catch (err: any) {
      console.error("Admin Login Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
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
    if (!window.confirm("Create or Recover Super Admin (Nader)?\n\nIf the account exists, we'll try to update permissions (requires default password).")) return;
    
    setIsBootstrapping(true);
    setError('');
    setBootstrapMessage(null);

    try {
      if (!db) throw new Error("Database not connected");

      const realEmail = 'nader.alizddin@gmail.com';
      const authEmail = `admin_${realEmail}`; 
      const defaultPassword = 'Nader@321';
      const firstName = 'Nader';
      const lastName = 'Admin';

      let user;
      let actionTaken = '';

      // 1. Create Super Admin Role (Optional but good for data consistency)
      await setDoc(doc(db, 'roles', 'super_admin'), {
        name: 'Super Admin',
        description: 'Full system access and control',
        permissions: ['*'], 
        createdAt: serverTimestamp()
      }, { merge: true });

      // 2. Try to create Auth User
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, defaultPassword);
        user = userCredential.user;
        actionTaken = 'Created new Super Admin account';
      } catch (createErr: any) {
        if (createErr.code === 'auth/email-already-in-use') {
          // 3. If exists, try to login to verify ownership
          try {
             const userCredential = await signInWithEmailAndPassword(auth, authEmail, defaultPassword);
             user = userCredential.user;
             actionTaken = 'Recovered existing Super Admin account';
          } catch (loginErr) {
             throw new Error(`The admin account '${realEmail}' already exists, but the password is not the default. Cannot recover automatically.`);
           }
        } else {
          throw createErr;
        }
      }

      // 4. Update Profile & Create Root 'admins' Record
      if (user) {
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`
        });

        // Ensure Admin Record exists at root 'admins/{uid}'
        await setDoc(doc(db, 'admins', user.uid), {
          id: user.uid,
          name: `${firstName} ${lastName}`,
          email: realEmail,
          role: 'super_admin',
          // Permissions Map as required
          permissions: {
            projects: true,
            users: true,
            admins: true,
            roles: true,
            ai: true
          },
          status: 'Active',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        }, { merge: true });

        setBootstrapMessage(`${actionTaken} successfully! You can now log in.`);
        setEmail(realEmail);
        setPassword(defaultPassword);
      }

    } catch (err: any) {
      console.error("Bootstrap Error:", err);
      let msg = err.message || 'Failed to initialize system';
      setError(msg);
    } finally {
      setIsBootstrapping(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-6 relative z-10"
      >
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 mb-4 shadow-lg">
               <SafeImage 
                 src="https://raiyansoft.com/wp-content/uploads/2024/05/cropped-App-Icon-1.png"
                 className="w-10 h-10 object-contain"
               />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="name@raiyansoft.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-xs"
              >
                <ShieldCheck size={14} />
                {error}
              </motion.div>
            )}

            {bootstrapMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-emerald-400 text-xs text-center"
              >
                {bootstrapMessage}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_25px_rgba(29,183,240,0.5)] transition-all duration-300 mt-2 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center space-y-4">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">Secured Area • Raiyansoft® Admin</p>
            
            <button 
              onClick={handleBootstrap}
              disabled={isBootstrapping}
              className="text-[10px] text-slate-700 hover:text-slate-500 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              {isBootstrapping ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
              Initialize / Recover Super Admin
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
