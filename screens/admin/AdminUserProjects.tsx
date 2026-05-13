"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, Edit2, X, Save, Clock, User as UserIcon, Link as LinkIcon, DollarSign, Activity, Briefcase, AlertTriangle, Loader2 } from 'lucide-react';
import { UserProject, ProjectStatus } from '../../lib/userProjectsStore';
import AvatarInitial from '../../components/AvatarInitial';
import { app, db } from '../../lib/firebase-client';
import { collectionGroup, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';

const statusOptions: ProjectStatus[] = ["pricing", "design", "development", "publishing", "support", "cancelled"];
const INDUSTRIES = [
  'Food & Delivery',
  'Fashion & Clothing',
  'Pharmacy & Healthcare',
  'Pets & Animals',
  'Services',
  'Education',
  'Real Estate',
  'Travel & Tourism',
  'Finance',
  'Logistics & Shipping',
  'Other'
];

const AdminUserProjects: React.FC = () => {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Modal State
  const [editingProject, setEditingProject] = useState<UserProject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimatedPrice: '' as string | number,
    estimatedDuration: '' as string | number,
    status: 'pricing' as ProjectStatus,
    projectUrl: '',
    industry: '',
    industryOther: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (app && app.options) {
      console.log("Admin User Projects Page Loaded. Firebase Project ID:", app.options.projectId);
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!db) {
        throw new Error("Database not initialized");
      }

      // Query all 'projects' subcollections across all users
      // Note: collectionGroup requires an index if you combine it with certain filters/sorts.
      // We fetch all and sort client-side to ensure it works without complex index setup initially.
      const q = query(collectionGroup(db, 'projects'));
      
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        // Fallback for missing timestamps
        createdAt: d.data().createdAt?.toMillis?.() || Date.now(),
        updatedAt: d.data().updatedAt?.toMillis?.() || Date.now()
      })) as UserProject[];

      // Client-side sort by createdAt desc
      results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      setProjects(results);
    } catch (err: any) {
      console.error("Failed to load projects:", err.code, err.message, err);
      if (err.code === 'permission-denied') {
        setError("Firestore permission denied. Admin panel must use server-side Admin SDK or rules must allow admin read.");
      } else {
        setError(`Error loading projects: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sync form data when editingProject changes
  useEffect(() => {
    if (editingProject) {
      setFormData({ 
        name: editingProject.name || '', 
        description: editingProject.description || '',
        estimatedPrice: editingProject.estimatedPrice ?? '',
        estimatedDuration: editingProject.estimatedDuration ?? '',
        status: editingProject.status || 'pricing',
        projectUrl: editingProject.projectUrl || '',
        industry: editingProject.industry || '',
        industryOther: editingProject.industryOther || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        estimatedPrice: '',
        estimatedDuration: '',
        status: 'pricing',
        projectUrl: '',
        industry: '',
        industryOther: ''
      });
    }
  }, [editingProject]);

  // Filter Logic
  const filteredProjects = projects.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.ownerName && p.ownerName.toLowerCase().includes(term)) ||
      (p.ownerEmail && p.ownerEmail.toLowerCase().includes(term))
    );
  });

  const handleEdit = (project: UserProject) => {
    setEditingProject(project);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !db) return;
    
    setIsSaving(true);
    try {
      if (!editingProject.ownerId) {
        throw new Error("Cannot update project: Missing Owner ID");
      }

      // Update specific document path: users/{ownerId}/projects/{projectId}
      const docRef = doc(db, 'users', editingProject.ownerId, 'projects', editingProject.id);
      
      const updates = {
        name: formData.name,
        description: formData.description,
        estimatedPrice: formData.estimatedPrice !== '' ? Number(formData.estimatedPrice) : null,
        estimatedDuration: formData.estimatedDuration !== '' ? Number(formData.estimatedDuration) : null,
        status: formData.status,
        projectUrl: formData.projectUrl || null,
        industry: formData.industry,
        industryOther: formData.industryOther || null
      };

      await updateDoc(docRef, updates);

      // Update local state to reflect changes
      setProjects(prev => prev.map(p => 
        p.id === editingProject.id 
          ? { ...p, ...updates } 
          : p
      ));

      setEditingProject(null);
    } catch (err) {
      console.error("Error updating project:", err);
      alert("Failed to update project. See console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (ts: number) => {
    if (!ts) return 'N/A';
    return new Date(ts).toLocaleDateString('en-UK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          User Projects
          <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded-full border border-white/5">
            {filteredProjects.length} Total
          </span>
        </h1>
        <p className="text-slate-400 text-sm">Projects created by customers inside their accounts.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={20} />
          <div>
            <h3 className="text-red-400 font-bold text-sm">Access Denied</h3>
            <p className="text-red-400/80 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#0f172a] p-4 rounded-2xl border border-white/5 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by project, customer, or email..."
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 text-slate-500">
             <Loader2 size={32} className="animate-spin mb-4 text-primary" />
             <p>Loading projects from Firestore...</p>
           </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
              <LayoutGrid size={24} />
            </div>
            <p>{error ? "Unable to load data." : "No user projects found."}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="p-5 font-medium">Project</th>
                    <th className="p-5 font-medium">Status</th>
                    <th className="p-5 font-medium">Pricing</th>
                    <th className="p-5 font-medium">Customer</th>
                    <th className="p-5 font-medium">Created</th>
                    <th className="p-5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${p.iconBg || 'bg-slate-700'} rounded-lg flex items-center justify-center text-white border border-white/10 shadow-inner`}>
                             <LayoutGrid size={18} className="opacity-80" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{p.name}</div>
                            <div className="text-slate-500 text-xs flex items-center gap-1">
                              {p.projectUrl && <LinkIcon size={10} />}
                              {p.version || 'v1.0.0'}
                              {p.industry && <span className="text-slate-600">• {p.industry === 'Other' ? p.industryOther : p.industry}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          p.status === 'cancelled' 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-0.5">
                           <span className="text-white text-xs font-medium">
                             {p.estimatedPrice ? `${p.estimatedPrice.toLocaleString()} KWD` : '—'}
                           </span>
                           <span className="text-slate-500 text-[10px]">
                             {p.estimatedDuration ? `${p.estimatedDuration} days` : '—'}
                           </span>
                        </div>
                      </td>
                      <td className="p-5">
                         <div className="flex items-center gap-2">
                            <AvatarInitial name={p.ownerName} className="w-6 h-6 text-[10px]" />
                            <div>
                               <div className="text-white text-xs font-medium">{p.ownerName}</div>
                               <div className="text-slate-500 text-[10px]">{p.ownerEmail}</div>
                            </div>
                         </div>
                      </td>
                      <td className="p-5 text-slate-400 text-xs">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => handleEdit(p)}
                          className="p-2 bg-slate-800 hover:bg-white/5 rounded-lg text-slate-400 hover:text-primary transition-colors border border-white/5 hover:border-primary/30"
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredProjects.map((p) => (
                <div key={p.id} className="p-4 flex flex-col gap-3">
                   <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${p.iconBg || 'bg-slate-700'} rounded-lg flex items-center justify-center text-white border border-white/10 shadow-inner`}>
                           <LayoutGrid size={18} className="opacity-80" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{p.name}</h3>
                          <div className="text-slate-500 text-xs flex items-center gap-2 mt-1">
                             <span className="capitalize text-primary font-medium">{p.status}</span>
                             <span>•</span>
                             <span>{p.estimatedPrice ? `${p.estimatedPrice} KWD` : '—'}</span>
                          </div>
                          {p.industry && <div className="text-xs text-slate-600 mt-1">{p.industry === 'Other' ? p.industryOther : p.industry}</div>}
                          <div className="text-xs text-slate-500 mt-1">Owner: {p.ownerName}</div>
                        </div>
                      </div>
                      <button 
                         onClick={() => handleEdit(p)}
                         className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                      >
                         <Edit2 size={16} />
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Drawer/Modal */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Edit User Project</h2>
                <button 
                  onClick={() => setEditingProject(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="editForm" onSubmit={handleSave} className="space-y-4">
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Project Name</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Industry</label>
                    <div className="relative">
                      <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <select
                        value={formData.industry}
                        onChange={e => setFormData({...formData, industry: e.target.value})}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white focus:border-primary focus:outline-none transition-colors appearance-none"
                      >
                         <option value="">Select Industry</option>
                         {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                    </div>
                  </div>

                  {formData.industry === 'Other' && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300 ml-1">Specify Industry</label>
                      <input 
                        type="text"
                        value={formData.industryOther}
                        onChange={e => setFormData({...formData, industryOther: e.target.value})}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                        placeholder="e.g. Automotive"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300 ml-1">Estimated Price (KWD)</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="number"
                          value={formData.estimatedPrice}
                          onChange={e => setFormData({...formData, estimatedPrice: e.target.value})}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white focus:border-primary focus:outline-none transition-colors"
                          placeholder="e.g. 1500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300 ml-1">Est. Duration (Days)</label>
                      <div className="relative">
                        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="number"
                          value={formData.estimatedDuration}
                          onChange={e => setFormData({...formData, estimatedDuration: e.target.value})}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white focus:border-primary focus:outline-none transition-colors"
                          placeholder="e.g. 21"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Project Status</label>
                    <div className="relative">
                      <Activity size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <select
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as ProjectStatus})}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white focus:border-primary focus:outline-none transition-colors appearance-none capitalize"
                      >
                        {statusOptions.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Project URL</label>
                    <div className="relative">
                      <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="url"
                        value={formData.projectUrl}
                        onChange={e => setFormData({...formData, projectUrl: e.target.value})}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white focus:border-primary focus:outline-none transition-colors"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Description</label>
                    <textarea 
                      maxLength={250}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors h-24 resize-none"
                    />
                  </div>

                </form>
              </div>

              <div className="p-5 border-t border-white/10 flex justify-end gap-3">
                <button 
                  onClick={() => setEditingProject(null)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  form="editForm"
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-white font-medium text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-colors disabled:opacity-70"
                >
                  {isSaving ? (
                     <Loader2 size={16} className="animate-spin" />
                  ) : (
                     <Save size={16} />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUserProjects;