"use client";
// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, ShieldCheck, Check } from 'lucide-react';
import { useRoles, roleStore, Role, PERMISSIONS_LIST } from '../../lib/roleStore';
import ConfirmModal from '../../components/ConfirmModal';

const AdminRoles: React.FC = () => {
  const { roles } = useRoles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      roleStore.updateRole(editingRole.id, formData);
    } else {
      roleStore.addRole(formData);
    }
    setIsModalOpen(false);
  };

  const togglePermission = (perm: string) => {
    setFormData(prev => {
      if (prev.permissions.includes(perm)) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== perm) };
      }
      return { ...prev, permissions: [...prev.permissions, perm] };
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      roleStore.deleteRole(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
          <p className="text-slate-400 text-sm">Define access levels for employees.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-sky-400 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          <span>Add Role</span>
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {roles.map((role) => (
            <motion.div
              key={role.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-lg hover:border-white/10 transition-colors group relative overflow-hidden flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 text-primary">
                  <ShieldCheck size={24} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(role)}
                    className="p-2 bg-slate-800 hover:bg-primary/20 hover:text-primary rounded-lg text-slate-400 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => setDeleteId(role.id)}
                    className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-white font-bold text-lg mb-1">{role.name}</h3>
              <p className="text-slate-400 text-sm mb-4 h-10 line-clamp-2">{role.description}</p>
              
              <div className="mt-auto">
                <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-2">Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.slice(0, 3).map(perm => (
                    <span key={perm} className="text-[10px] bg-slate-800 border border-white/5 text-slate-300 px-2 py-1 rounded-md">
                      {perm}
                    </span>
                  ))}
                  {role.permissions.length > 3 && (
                    <span className="text-[10px] bg-slate-800 border border-white/5 text-slate-400 px-2 py-1 rounded-md">
                      +{role.permissions.length - 3} more
                    </span>
                  )}
                  {role.permissions.length === 0 && (
                    <span className="text-[10px] text-slate-600 italic">No specific permissions</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
                <h2 className="text-xl font-bold text-white">
                  {editingRole ? 'Edit Role' : 'Add New Role'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="roleForm" onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Role Name <span className="text-red-400">*</span></label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                      placeholder="e.g. Sales Manager"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors h-20 resize-none"
                      placeholder="Role purpose..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300 ml-1">Permissions</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PERMISSIONS_LIST.map(perm => {
                        const isSelected = formData.permissions.includes(perm);
                        return (
                          <div 
                            key={perm}
                            onClick={() => togglePermission(perm)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-primary/10 border-primary/40 text-white' 
                                : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'
                            }`}
                          >
                            <span className="text-sm">{perm}</span>
                            {isSelected && <Check size={16} className="text-primary" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-5 border-t border-white/10 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  form="roleForm"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-white font-medium text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-colors"
                >
                  <Save size={16} />
                  <span>Save Role</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Role?"
        message="Are you sure you want to remove this role? Employees assigned to this role may lose access."
        confirmText="Delete Role"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminRoles;