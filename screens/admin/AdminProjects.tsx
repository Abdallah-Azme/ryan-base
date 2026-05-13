"use client";
// @ts-nocheck
import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, ExternalLink, X, Image as ImageIcon, Save } from 'lucide-react';
import { useProjects, projectStore, Project } from '../../lib/projectStore';
import SafeImage from '../../components/SafeImage';
import ConfirmModal from '../../components/ConfirmModal';

const AdminProjects: React.FC = () => {
  const { projects } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    link: '',
    logoUrl: ''
  });

  // Filter projects
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        link: project.link,
        logoUrl: project.logoUrl
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        link: '',
        logoUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      projectStore.updateProject(editingProject.id, formData);
    } else {
      projectStore.addProject(formData);
    }
    handleCloseModal();
  };

  const handleDelete = () => {
    if (deleteId) {
      projectStore.deleteProject(deleteId);
      setDeleteId(null);
    }
  };

  // Convert File to Base64 (Optional Helper)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* SECTION 1: PROJECTS */}
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Client Projects</h1>
            <p className="text-slate-400 text-sm">Manage the projects displayed on the mobile app home screen.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-sky-400 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            <span>Add Project</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-full md:max-w-md bg-[#0f172a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Projects Grid/Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0f172a] border border-white/5 rounded-2xl p-4 shadow-lg hover:border-white/10 transition-colors group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-14 h-14 bg-slate-800 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <SafeImage 
                      src={project.logoUrl} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(project)}
                      className="p-2 bg-slate-800 hover:bg-primary/20 hover:text-primary rounded-lg text-slate-400 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => setDeleteId(project.id)}
                      className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-white font-bold text-lg mb-1">{project.name}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2 h-10">{project.description}</p>
                
                <div className="flex items-center text-xs text-slate-500 gap-2 border-t border-white/5 pt-3 mt-auto">
                   <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary transition-colors truncate max-w-full">
                     <ExternalLink size={12} className="mr-1" />
                     <span className="truncate">{project.link}</span>
                   </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Search size={24} />
            </div>
            <p>No projects found matching your search.</p>
          </div>
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
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="projectForm" onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Project Name <span className="text-red-400">*</span></label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                      placeholder="e.g. Raiyan CRM"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Short Description <span className="text-red-400">*</span></label>
                    <textarea 
                      required
                      maxLength={120}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors h-24 resize-none"
                      placeholder="Brief overview (max 120 chars)"
                    />
                    <div className="text-right text-[10px] text-slate-500">{formData.description.length}/120</div>
                  </div>

                  {/* Link */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Project URL <span className="text-red-400">*</span></label>
                    <input 
                      type="url"
                      required
                      value={formData.link}
                      onChange={e => setFormData({...formData, link: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Logo Image */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300 ml-1">Project Logo</label>
                    
                    {/* URL Input */}
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={formData.logoUrl}
                        onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                        className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors text-sm"
                        placeholder="Paste image URL..."
                      />
                      {/* File Upload Button wrapper */}
                      <label className="bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors">
                        <ImageIcon size={20} className="text-slate-400" />
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                    
                    {/* Preview */}
                    {formData.logoUrl && (
                       <div className="mt-2 w-16 h-16 bg-slate-800 rounded-xl border border-white/10 overflow-hidden relative group">
                         <div className="relative w-full h-full">
                          <Image src={formData.logoUrl} alt="Preview" fill className="object-cover" />
                        </div>
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[10px] text-white">Preview</span>
                         </div>
                       </div>
                    )}
                  </div>

                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-white/10 flex justify-end gap-3">
                <button 
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  form="projectForm"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-sky-400 text-white font-medium text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-colors"
                >
                  <Save size={16} />
                  <span>Save Project</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Project?"
        message="Are you sure you want to remove this project? This will immediately remove it from the mobile app."
        confirmText="Delete Project"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

    </div>
  );
};

export default AdminProjects;