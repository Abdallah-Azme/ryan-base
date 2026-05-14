import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import ConfirmModal from '@/components/ui/confirm-modal';
import { useAdminRoles } from '../hooks/use-admin-roles';
import RoleCard from './role-card';
import RoleFormModal from './role-form-modal';

export default function AdminRolesPage() {
  const {
    roles,
    isModalOpen,
    setIsModalOpen,
    editingRole,
    deleteId,
    setDeleteId,
    formData,
    setFormData,
    handleOpenModal,
    handleSubmit,
    togglePermission,
    handleDelete,
  } = useAdminRoles();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
          <p className="text-slate-400 text-sm">Define access levels for employees.</p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-sky-400 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          <span>Add Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} onOpenModal={handleOpenModal} onDeleteRole={setDeleteId} />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen ? (
          <RoleFormModal
            onClose={() => setIsModalOpen(false)}
            editingRole={editingRole}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onTogglePermission={togglePermission}
          />
        ) : null}
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
}
