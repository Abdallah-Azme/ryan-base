"use client";

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Save, Shield, CheckCircle, Loader2, Key, Lock } from 'lucide-react';
import { updateProfile, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase-client';
import AvatarInitial from '../../components/AvatarInitial';

const AdminAccount: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
    email: ''
  });

  // 1. Ensure we catch Auth updates. 
  // Without this, if auth.currentUser is null on mount, the page stays loading forever.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsLoading(false); // Stop loading if not logged in (ProtectedRoute will handle redirect)
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Data when User is available
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user) return; // Wait for auth
      
      try {
        const docRef = doc(db, 'admins', user.uid);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          const data = snap.data();
          const nameParts = (data.name || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          setFormData({
            firstName,
            lastName,
            phone: data.phone || '',
            role: data.role || 'Admin',
            email: data.email || user.email || ''
          });
        } else {
          // Fallback if no firestore doc exists yet
          const nameParts = (user.displayName || '').split(' ');
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phone: '',
            role: 'Admin',
            email: user.email || ''
          });
        }
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSuccess(false);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      // 1. Update Auth Profile
      await updateProfile(user, {
        displayName: fullName
      });

      // 2. Update Firestore
      const docRef = doc(db, 'admins', user.uid);
      await updateDoc(docRef, {
        name: fullName,
        phone: formData.phone
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 min-h-[50vh]">
        <Loader2 className="animate-spin mr-2" /> Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-slate-400 text-sm">Manage your admin profile and preferences.</p>
      </div>

      <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3 w-full md:w-auto">
            <div className="w-24 h-24 rounded-full border-4 border-slate-800 shadow-2xl relative">
              <AvatarInitial name={`${formData.firstName} ${formData.lastName}`} className="w-full h-full text-3xl" />
              <div className="absolute bottom-0 right-0 bg-slate-800 rounded-full p-1 border border-white/10">
                 <div className="bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-800" title="Active"></div>
              </div>
            </div>
            <div className="text-center">
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 capitalize">
                 {formData.role}
               </span>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSave} className="flex-1 w-full space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
              {/* Force LTR for phone input container */}
              <div className="relative" dir="ltr">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                  placeholder="+965 ..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative opacity-60">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-slate-400 cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 flex items-center gap-1">
                  <Lock size={12} /> Read-only
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
              {success && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-emerald-400 text-sm font-medium flex items-center gap-2"
                >
                  <CheckCircle size={16} /> Saved Successfully
                </motion.div>
              )}
              
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary hover:bg-sky-400 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>Save Changes</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAccount;
