import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAdminUserProjects } from '../hooks/use-admin-user-projects';
import UserProjectsFilter from './user-projects-filter';
import UserProjectsTable from './user-projects-table';
import UserProjectEditDrawer from './user-project-edit-drawer';

export default function AdminUserProjectsPage() {
  const {
    loading,
    error,
    searchTerm,
    setSearchTerm,
    editingProject,
    setEditingProject,
    formData,
    setFormData,
    isSaving,
    filteredProjects,
    handleEdit,
    handleSave,
    formatDate,
  } = useAdminUserProjects();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          User Projects
          <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded-full border border-white/5">
            {filteredProjects.length} Total
          </span>
        </h1>
        <p className="text-slate-400 text-sm">Projects created by customers inside their accounts.</p>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={20} />
          <div>
            <h3 className="text-red-400 font-bold text-sm">Access Denied</h3>
            <p className="text-red-400/80 text-xs mt-1">{error}</p>
          </div>
        </div>
      ) : null}

      <UserProjectsFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <UserProjectsTable
        loading={loading}
        error={error}
        filteredProjects={filteredProjects}
        onEdit={handleEdit}
        formatDate={formatDate}
      />

      <UserProjectEditDrawer
        editingProject={editingProject}
        onClose={() => setEditingProject(null)}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
