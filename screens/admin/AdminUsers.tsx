"use client";
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, MoreHorizontal, Eye, Ban, CheckCircle, Trash2, X, Calendar, User as UserIcon, Phone, Mail, Clock, Briefcase, AlertTriangle, LayoutGrid, ExternalLink, Loader2 } from 'lucide-react';
import { useUsers, userStore, User, UserStatus } from '../../lib/userStore';
import AvatarInitial from '../../components/AvatarInitial';
import ConfirmModal from '../../components/ConfirmModal';
import { app, db } from '../../lib/firebase-client';
import { collection, getDocs, query, where, doc, getDoc, orderBy } from 'firebase/firestore';
import { UserProject } from '../../lib/userProjectsStore';

const AdminUsers: React.FC = () => {
  const { users, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Disabled'>('All');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Drawer Tabs State
  const [activeTab, setActiveTab] = useState<'profile' | 'projects'>('profile');
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Debug: Log Firebase Project ID on mount
  useEffect(() => {
    if (app && app.options) {
      console.log("Admin Dashboard Loaded. Firebase Project ID:", app.options.projectId);
    }
  }, []);

  // Fetch projects when tab changes to 'projects' or user changes
  useEffect(() => {
    if (selectedUser && activeTab === 'projects') {
      fetchUserProjects(selectedUser.id);
    }
  }, [selectedUser, activeTab]);

  // Reset tab when closing drawer
  useEffect(() => {
    if (!selectedUser) {
      setActiveTab('profile');
      setUserProjects([]);
    }
  }, [selectedUser]);

  const fetchUserProjects = async (uid: string) => {
    setLoadingProjects(true);
    const results: UserProject[] = [];
    const seenIds = new Set<string>();

    try {
      if (db) {
        // 1. Query Standard Subcollection: users/{uid}/projects
        // This is where the wizard currently writes.
        try {
          const subColRef = collection(db, 'users', uid, 'projects');
          const subColQ = query(subColRef, orderBy('createdAt', 'desc'));
          const subColSnap = await getDocs(subColQ);
          subColSnap.forEach(d => {
            if (!seenIds.has(d.id)) {
              results.push({ id: d.id, ...d.data() } as UserProject);
              seenIds.add(d.id);
            }
          });
        } catch (e) {
          console.warn("Subcollection fetch failed", e);
        }

        // 2. Query Root Collection: user-projects (One doc per project)
        try {
          const rootColRef = collection(db, 'user-projects');
          // Try querying by userId or phone if available
          const qUserId = query(rootColRef, where('userId', '==', uid));
          const snapUserId = await getDocs(qUserId);
          snapUserId.forEach(d => {
            if (!seenIds.has(d.id)) {
              results.push({ id: d.id, ...d.data() } as UserProject);
              seenIds.add(d.id);
            }
          });
        } catch (e) {
           console.warn("Root collection fetch failed", e);
        }

        // 3. Query Root Document Array: user-projects/{uid} (Legacy Array Shape)
        try {
           const legacyDocRef = doc(db, 'user-projects', uid);
           const legacySnap = await getDoc(legacyDocRef);
           if (legacySnap.exists()) {
             const data = legacySnap.data();
             if (data.projects && Array.isArray(data.projects)) {
               data.projects.forEach((p: any, idx: number) => {
                 const pseudoId = `legacy_${uid}_${idx}`;
                 if (!seenIds.has(pseudoId)) {
                   results.push({ ...p, id: pseudoId } as UserProject);
                   seenIds.add(pseudoId);
                 }
               });
             }
           }
        } catch (e) {
          console.warn("Legacy doc fetch failed", e);
        }
      }
      
      // Sort combined results by date
      results.sort((a, b) => {
        const dateA = a.createdAt || 0;
        const dateB = b.createdAt || 0;
        return dateB - dateA;
      });

      setUserProjects(results);
    } catch (err) {
      console.error("Error fetching user projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  // --- Filtering Logic ---
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'All' || user.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // --- Helpers ---
  const formatDate = (ts: number) => {
    if (!ts) return 'N/A';
    return new Date(ts).toLocaleDateString('en-UK', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatDateTime = (ts: number) => {
    if (!ts) return 'N/A';
    return new Date(ts).toLocaleString('en-UK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // --- Handlers ---
  const handleExport = () => {
    // Demo export
    alert(`Exporting ${filteredUsers.length} users to CSV...`);
  };

  const handleToggleStatus = (user: User) => {
    userStore.toggleStatus(user.id);
    if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? ({ ...prev, status: prev.status === 'Active' ? 'Disabled' : 'Active' }) : null);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      userStore.deleteUser(deleteId);
      if (selectedUser?.id === deleteId) setSelectedUser(null);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Users 
            <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded-full border border-white/5">
              {users.length}
            </span>
          </h1>
          <p className="text-slate-400 text-sm">Registered accounts management.</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border border-white/5"
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={20} />
          <div>
            <h3 className="text-red-400 font-bold text-sm">Error Loading Users</h3>
            <p className="text-red-400/80 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#0f172a] p-4 rounded-2xl border border-white/5 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, or phone..."
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {(['All', 'Active', 'Disabled'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                filterStatus === status 
                  ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_10px_rgba(29,183,240,0.2)]' 
                  : 'bg-slate-900 text-slate-400 border-white/5 hover:border-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
        {filteredUsers.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-slate-500">
             <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
               <UserIcon size={24} />
             </div>
             <p>{error ? "Unable to load users." : "No users found matching your criteria."}</p>
           </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="p-5 font-medium">User</th>
                    <th className="p-5 font-medium">Contact</th>
                    <th className="p-5 font-medium">Role</th>
                    <th className="p-5 font-medium">Status</th>
                    <th className="p-5 font-medium">Registered</th>
                    <th className="p-5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <AvatarInitial name={`${user.firstName} ${user.lastName}`} className="w-10 h-10 border border-white/10 text-sm" />
                          <div>
                            <div className="font-medium text-white">{user.firstName} {user.lastName}</div>
                            <div className="text-slate-500 text-xs">ID: {user.id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-slate-300">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-500"/> {user.email}</span>
                          <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-500"/> {user.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          user.role === 'Admin' 
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`} />
                          <span className={user.status === 'Active' ? 'text-slate-200' : 'text-slate-500'}>{user.status}</span>
                        </div>
                      </td>
                      <td className="p-5 text-slate-400">
                        {formatDate(user.registeredAt)}
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${user.status === 'Active' ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                            title={user.status === 'Active' ? 'Disable Account' : 'Enable Account'}
                          >
                            {user.status === 'Active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <button 
                            onClick={() => setDeleteId(user.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between" onClick={() => setSelectedUser(user)}>
                  <div className="flex items-center gap-3">
                    <AvatarInitial name={`${user.firstName} ${user.lastName}`} className="w-10 h-10 border border-white/10 text-sm" />
                    <div>
                      <h3 className="text-sm font-medium text-white">{user.firstName} {user.lastName}</h3>
                      <p className="text-xs text-slate-500 mb-1">{user.email}</p>
                      <div className="flex items-center gap-2">
                         <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                         }`}>
                           {user.status}
                         </span>
                         <span className="text-[10px] text-slate-600">•</span>
                         <span className="text-[10px] text-slate-500">{user.role}</span>
                      </div>
                    </div>
                  </div>
                  <MoreHorizontal size={20} className="text-slate-600" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* User Details Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#0f172a] border-l border-white/10 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white">User Details</h2>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/5 bg-slate-900/50">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'profile' 
                      ? 'border-primary text-primary bg-primary/5' 
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Profile Info
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'projects' 
                      ? 'border-primary text-primary bg-primary/5' 
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Projects ({selectedUser.projectsCount || 0})
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6">
                
                {activeTab === 'profile' ? (
                  <>
                    {/* Profile Header */}
                    <div className="flex flex-col items-center mb-8">
                      <div className="w-24 h-24 mb-4 relative">
                        <AvatarInitial name={`${selectedUser.firstName} ${selectedUser.lastName}`} className="w-full h-full text-3xl border-4 border-slate-800 shadow-xl" />
                        <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-slate-800 ${
                          selectedUser.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">{selectedUser.firstName} {selectedUser.lastName}</h3>
                      <p className="text-slate-400 text-sm">{selectedUser.email}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                        <div className="text-slate-500 text-xs mb-1 flex items-center gap-1"><Phone size={12} /> Phone</div>
                        <div className="text-white text-sm font-medium">{selectedUser.phone || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                        <div className="text-slate-500 text-xs mb-1 flex items-center gap-1"><UserIcon size={12} /> Role</div>
                        <div className="text-white text-sm font-medium">{selectedUser.role}</div>
                      </div>
                      <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                        <div className="text-slate-500 text-xs mb-1 flex items-center gap-1"><Calendar size={12} /> Registered</div>
                        <div className="text-white text-sm font-medium">{formatDate(selectedUser.registeredAt)}</div>
                      </div>
                      <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                         <div className="text-slate-500 text-xs mb-1 flex items-center gap-1"><Briefcase size={12} /> Projects</div>
                         <div className="text-white text-sm font-medium">{selectedUser.projectsCount} Created</div>
                      </div>
                    </div>

                    {/* Activity Summary */}
                    <div className="mb-8">
                      <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Activity</h4>
                      <div className="bg-slate-800/20 rounded-xl border border-white/5 divide-y divide-white/5">
                        <div className="p-4 flex items-center justify-between">
                          <span className="text-slate-400 text-sm flex items-center gap-2">
                            <Clock size={16} /> Last Login
                          </span>
                          <span className="text-white text-sm">{formatDateTime(selectedUser.lastLoginAt)}</span>
                        </div>
                         <div className="p-4 flex items-center justify-between">
                          <span className="text-slate-400 text-sm flex items-center gap-2">
                            <CheckCircle size={16} /> Account Status
                          </span>
                          <span className={`text-sm font-medium ${selectedUser.status === 'Active' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {selectedUser.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Projects Tab */
                  <div className="space-y-4">
                     {loadingProjects ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                          <Loader2 size={32} className="animate-spin mb-2" />
                          <p>Loading projects...</p>
                        </div>
                     ) : userProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-500 bg-slate-800/20 rounded-2xl border border-white/5">
                          <LayoutGrid size={32} className="mb-2 opacity-50" />
                          <p>No projects for this user yet.</p>
                        </div>
                     ) : (
                       userProjects.map((project) => (
                         <div key={project.id} className="bg-slate-800/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 group hover:border-white/10 transition-colors">
                           <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 ${project.iconBg || 'bg-slate-700'} rounded-lg flex items-center justify-center text-white border border-white/10`}>
                                   <LayoutGrid size={20} />
                                 </div>
                                 <div>
                                   <h4 className="font-bold text-white text-sm">{project.name}</h4>
                                   <p className="text-slate-400 text-xs">{project.industry || 'General App'}</p>
                                 </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                project.status === 'cancelled' 
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {project.status || 'Draft'}
                              </span>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-2 mt-1">
                              <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
                                <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Platform</span>
                                <span className="text-xs text-white truncate block">
                                  {project.platforms?.join(', ') || 'Web & Mobile'}
                                </span>
                              </div>
                              <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
                                <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Updated</span>
                                <span className="text-xs text-white truncate block">
                                  {formatDate(project.updatedAt)}
                                </span>
                              </div>
                           </div>

                           <div className="pt-2 border-t border-white/5 flex justify-end">
                              {project.projectUrl ? (
                                <a 
                                  href={project.projectUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs font-medium text-primary hover:text-white flex items-center gap-1 transition-colors"
                                >
                                  Open Project <ExternalLink size={12} />
                                </a>
                              ) : (
                                <span className="text-xs text-slate-600 cursor-not-allowed">No URL</span>
                              )}
                           </div>
                         </div>
                       ))
                     )}
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions (Only for Profile) */}
              {activeTab === 'profile' && (
                <div className="p-6 border-t border-white/5 bg-[#0f172a]">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleToggleStatus(selectedUser)}
                      className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                        selectedUser.status === 'Active' 
                          ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
                      }`}
                    >
                      {selectedUser.status === 'Active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                      {selectedUser.status === 'Active' ? 'Disable Account' : 'Activate Account'}
                    </button>
                    <button
                      onClick={() => setDeleteId(selectedUser.id)}
                      className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete User?"
        message="Are you sure you want to delete this user? This action cannot be undone and they will lose access immediately."
        confirmText="Delete User"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

    </div>
  );
};

export default AdminUsers;