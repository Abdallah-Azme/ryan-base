"use client";

// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MoreHorizontal, Eye, Ban, CheckCircle, Trash2, X, Mail, Phone, Calendar, Briefcase, Save, Edit2, Lock, RefreshCw, Loader2, Copy, Check } from 'lucide-react';
import { useAdmins, adminStore, AdminUser } from '../../lib/adminStore';
import { useRoles } from '../../lib/roleStore';
import AvatarInitial from '../../components/AvatarInitial';
import ConfirmModal from '../../components/ConfirmModal';

// Firebase Client SDKs for creating secondary users
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig, db, auth } from '../../lib/firebase-client';

const AdminEmployees: React.FC = () => {
  const { admins } = useAdmins(); // Was useEmployees
  const { roles } = useRoles();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roleId: '', // Maps to 'role' in AdminUser
    status: 'Active' as 'Active' | 'Disabled',
    password: ''
  });

  // Helpers
  const getRoleName = (id: string) => roles.find(r => r.id === id)?.name || id;
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-UK', { day: 'numeric', month: 'short', year: 'numeric' });

  // Filtering
  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (admin?: AdminUser) => {
    setCreatedPassword(null);
    if (admin) {
      // Split name back to first/last for the form (rough approx)
      const nameParts = admin.name.split(' ');
      const fName = nameParts[0] || '';
      const lName = nameParts.slice(1).join(' ') || '';

      setEditingAdmin(admin);
      setFormData({
        firstName: fName,
        lastName: lName,
        email: admin.email,
        phone: admin.phone || '',
        roleId: admin.role,
        status: admin.status,
        password: '' 
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        roleId: roles[0]?.id || 'admin',
        status: 'Active',
        password: ''
      });
    }
    setIsModalOpen(true);
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password: pass });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Logic to determine permissions map from selected Role
      const selectedRole = roles.find(r => r.id === formData.roleId);
      const permissionsMap: Record<string, boolean> = {};
      if (selectedRole) {
        selectedRole.permissions.forEach(p => {
          // Slugify permission name for map key (e.g. "Manage Users" -> "users")
          // Simplified logic: use first word or map known ones
          const key = p.toLowerCase().replace('manage ', '').replace('view ', '').replace(' ', '_');
          permissionsMap[key] = true;
        });
      }

      if (editingAdmin) {
        // Update existing admin
        await adminStore.updateAdmin(editingAdmin.id, {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          role: formData.roleId,
          status: formData.status,
          permissions: permissionsMap
        });
        setIsModalOpen(false);
      } else {
        // Create new Admin
        if (formData.password.length < 8) {
          alert("Password must be at least 8 characters");
          setIsSubmitting(false);
          return;
        }

        const secondaryAppName = `secondaryApp-${Date.now()}`;
        const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
        const secondaryAuth = getAuth(secondaryApp);

        try {
          const authEmail = `admin_${formData.email}`;

          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, authEmail, formData.password);
          const newUser = userCredential.user;

          await updateProfile(newUser, {
            displayName: `${formData.firstName} ${formData.lastName}`
          });

          // Create root 'admins/{uid}' doc
          const adminRef = doc(db, 'admins', newUser.uid);
          
          await setDoc(adminRef, {
            id: newUser.uid,
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone || '',
            role: formData.roleId,
            status: formData.status,
            permissions: permissionsMap,
            createdAt: serverTimestamp(),
            lastLoginAt: null
          });

          await signOut(secondaryAuth);
          await deleteApp(secondaryApp);

          setCreatedPassword(formData.password);

        } catch (innerError: any) {
          await deleteApp(secondaryApp);
          throw innerError;
        }
      }
    } catch (error: any) {
      console.error("Operation failed:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (admin: AdminUser) => {
    adminStore.toggleStatus(admin.id);
    if (selectedAdmin?.id === admin.id) {
       setSelectedAdmin(prev => prev ? ({...prev, status: prev.status === 'Active' ? 'Disabled' : 'Active'}) : null);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      adminStore.deleteAdmin(deleteId);
      if (selectedAdmin?.id === deleteId) setSelectedAdmin(null);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admins & Staff</h1>
          <p className="text-slate-400 text-sm">Manage dashboard access and permissions.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-sky-400 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          <span>Add Admin</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0f172a] p-4 rounded-2xl border border-white/5 shadow-lg">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        {filteredAdmins.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
             <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
               <Briefcase size={24} />
             </div>
             <p>No admins found.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="p-5 font-medium">Name</th>
                    <th className="p-5 font-medium">Contact</th>
                    <th className="p-5 font-medium">Role</th>
                    <th className="p-5 font-medium">Status</th>
                    <th className="p-5 font-medium">Created</th>
                    <th className="p-5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <AvatarInitial name={admin.name} className="w-10 h-10 border border-white/10 text-sm" />
                          <div>
                            <div className="font-medium text-white">{admin.name}</div>
                            <div className="text-slate-500 text-xs">ID: {admin.id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-slate-300">
                         <div className="flex flex-col gap-1">
                           <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-500"/> {admin.email}</span>
                           {admin.phone && <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-500"/> {admin.phone}</span>}
                         </div>
                      </td>
                      <td className="p-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-white/5">
                          {getRoleName(admin.role)}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${admin.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`} />
                          <span className={admin.status === 'Active' ? 'text-slate-200' : 'text-slate-500'}>{admin.status}</span>
                        </div>
                      </td>
                      <td className="p-5 text-slate-400">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSelectedAdmin(admin)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title="View">
                             <Eye size={16} />
                          </button>
                          <button onClick={() => handleOpenModal(admin)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title="Edit">
                             <Edit2 size={16} />
                          </button>
                          <button onClick={() => setDeleteId(admin.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400" title="Delete">
                             <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredAdmins.map((admin) => (
                <div key={admin.id} className="p-4 flex items-center justify-between" onClick={() => setSelectedAdmin(admin)}>
                   <div className="flex items-center gap-3">
                     <AvatarInitial name={admin.name} className="w-10 h-10 border border-white/10 text-sm" />
                     <div>
                       <h3 className="text-sm font-medium text-white">{admin.name}</h3>
                       <p className="text-xs text-slate-500">{getRoleName(admin.role)}</p>
                     </div>
                   </div>
                   <MoreHorizontal size={20} className="text-slate-600" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="bg-[#0f172a] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
            >
               <div className="p-5 border-b border-white/10 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-white">{editingAdmin ? 'Edit Admin' : 'Add Admin'}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
               </div>
               
               {createdPassword ? (
                 <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
                       <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Admin Created!</h3>
                    <p className="text-slate-400 text-sm mb-6">The account is ready. Please copy the password below.</p>
                    
                    <div className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 flex items-center justify-between mb-6">
                      <span className="font-mono text-white text-lg">{createdPassword}</span>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(createdPassword); alert('Copied!'); }}
                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                      >
                        <Copy size={20} />
                      </button>
                    </div>

                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium"
                    >
                      Done
                    </button>
                 </div>
               ) : (
                 <>
                   <div className="p-6 overflow-y-auto custom-scrollbar">
                     <form id="empForm" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300 ml-1">First Name <span className="text-red-400">*</span></label>
                            <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300 ml-1">Last Name <span className="text-red-400">*</span></label>
                            <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-300 ml-1">Email <span className="text-red-400">*</span></label>
                          <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-300 ml-1">Phone</label>
                          {/* Force LTR for phone input */}
                          <input 
                            type="tel" 
                            dir="ltr"
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: e.target.value})} 
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" 
                          />
                        </div>

                        {!editingAdmin && (
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300 ml-1">Password <span className="text-red-400">*</span></label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input 
                                  type="text" 
                                  required 
                                  minLength={8}
                                  value={formData.password} 
                                  onChange={e => setFormData({...formData, password: e.target.value})} 
                                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary focus:outline-none font-mono"
                                  placeholder="Min 8 characters" 
                                />
                              </div>
                              <button 
                                type="button"
                                onClick={generatePassword}
                                className="bg-slate-800 border border-white/10 hover:bg-slate-700 text-white px-3 rounded-xl flex items-center gap-2 transition-colors"
                              >
                                <RefreshCw size={16} />
                                <span className="text-xs hidden sm:inline">Generate</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300 ml-1">Role <span className="text-red-400">*</span></label>
                            <select 
                              required 
                              value={formData.roleId} 
                              onChange={e => setFormData({...formData, roleId: e.target.value})} 
                              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none appearance-none"
                            >
                              <option value="" disabled>Select Role</option>
                              {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300 ml-1">Status</label>
                            <select 
                              value={formData.status} 
                              onChange={e => setFormData({...formData, status: e.target.value as any})} 
                              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none appearance-none"
                            >
                              <option value="Active">Active</option>
                              <option value="Disabled">Disabled</option>
                            </select>
                          </div>
                        </div>
                     </form>
                   </div>

                   <div className="p-5 border-t border-white/10 flex justify-end gap-3">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium text-sm">Cancel</button>
                     <button 
                       form="empForm" 
                       type="submit" 
                       disabled={isSubmitting}
                       className="px-5 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-white font-medium text-sm shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-70"
                     >
                       {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                       <span>{editingAdmin ? 'Update' : 'Create'} Admin</span>
                     </button>
                   </div>
                 </>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Drawer */}
      <AnimatePresence>
        {selectedAdmin && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAdmin(null)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
            <motion.div 
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
               className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0f172a] border-l border-white/10 shadow-2xl flex flex-col"
            >
               <div className="flex items-center justify-between p-6 border-b border-white/5">
                 <h2 className="text-xl font-bold text-white">Admin Details</h2>
                 <button onClick={() => setSelectedAdmin(null)} className="p-2 text-slate-400 hover:text-white"><X size={20}/></button>
               </div>

               <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex flex-col items-center mb-8">
                     <div className="w-24 h-24 mb-4">
                       <AvatarInitial name={selectedAdmin.name} className="w-full h-full text-3xl border-4 border-slate-800 shadow-xl" />
                     </div>
                     <h3 className="text-2xl font-bold text-white">{selectedAdmin.name}</h3>
                     <p className="text-slate-400">{getRoleName(selectedAdmin.role)}</p>
                  </div>

                  <div className="space-y-4">
                     <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-500 mb-1 flex items-center gap-2"><Mail size={12}/> Email</div>
                        <div className="text-white">{selectedAdmin.email}</div>
                     </div>
                     <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-500 mb-1 flex items-center gap-2"><Phone size={12}/> Phone</div>
                        <div className="text-white">{selectedAdmin.phone || 'N/A'}</div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                           <div className="text-xs text-slate-500 mb-1">Status</div>
                           <div className={selectedAdmin.status === 'Active' ? 'text-emerald-400' : 'text-red-400'}>{selectedAdmin.status}</div>
                        </div>
                        <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                           <div className="text-xs text-slate-500 mb-1">Created</div>
                           <div className="text-white text-sm">{formatDate(selectedAdmin.createdAt)}</div>
                        </div>
                     </div>

                     {/* Permissions View */}
                     <div className="mt-4">
                       <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Effective Permissions</h4>
                       <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedAdmin.permissions || {}).map(([perm, enabled]) => (
                            enabled ? (
                              <span key={perm} className="text-[10px] bg-slate-800 border border-white/10 px-2 py-1 rounded text-slate-300">
                                {perm}
                              </span>
                            ) : null
                          ))}
                       </div>
                     </div>
                  </div>
               </div>

               <div className="p-6 border-t border-white/5 bg-[#0f172a] flex gap-3">
                 <button onClick={() => handleToggleStatus(selectedAdmin)} className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${selectedAdmin.status === 'Active' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {selectedAdmin.status === 'Active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                    {selectedAdmin.status === 'Active' ? 'Disable' : 'Enable'}
                 </button>
                 <button onClick={() => setDeleteId(selectedAdmin.id)} className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 font-medium text-sm flex items-center justify-center gap-2">
                    <Trash2 size={18} /> Delete
                 </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal isOpen={!!deleteId} title="Delete Admin?" message="This action is permanent." confirmText="Delete" isDestructive={true} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
};

export default AdminEmployees;
