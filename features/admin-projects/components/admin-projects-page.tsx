import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import ConfirmModal from '@/components/ui/confirm-modal';
import { useAdminProjects } from '../hooks/use-admin-projects';
import AdminProjectCard from './admin-project-card';
import ProjectFormModal from './project-form-modal';

export default function AdminProjectsPage() {
  const {
    searchTerm,
    setSearchTerm,
    isModalOpen,
    editingProject,
    deleteId,
    setDeleteId,
    formData,
    setFormData,
    filteredProjects,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    handleFileChange,
  } = useAdminProjects();

  return (
    <div className="space-y-12 pb-20">
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Client Projects</h1>
            <p className="text-slate-400 text-sm">
              Manage the projects displayed on the mobile app home screen.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-sky-400 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            <span>Add Project</span>
          </button>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <AdminProjectCard
                key={project.id}
                project={project}
                onOpenModal={handleOpenModal}
                onDeleteProject={setDeleteId}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Search size={24} />
            </div>
            <p>No projects found matching your search.</p>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {isModalOpen ? (
          <ProjectFormModal
            onClose={handleCloseModal}
            editingProject={editingProject}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onFileChange={handleFileChange}
          />
        ) : null}
      </AnimatePresence>

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
}
