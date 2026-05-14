import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import ConfirmModal from '@/components/ui/confirm-modal';
import { useAdminEmployees } from '../hooks/use-admin-employees';
import EmployeesTable from './employees-table';
import EmployeeFormModal from './employee-form-modal';
import EmployeeDetailDrawer from './employee-detail-drawer';

export default function AdminEmployeesPage() {
  const {
    roles,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    editingAdmin,
    selectedAdmin,
    setSelectedAdmin,
    deleteId,
    setDeleteId,
    isSubmitting,
    createdPassword,
    formData,
    setFormData,
    getRoleName,
    formatDate,
    filteredAdmins,
    handleOpenModal,
    generatePassword,
    handleSubmit,
    handleToggleStatus,
    handleDelete,
  } = useAdminEmployees();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admins & Staff</h1>
          <p className="text-slate-400 text-sm">Manage dashboard access and permissions.</p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-sky-400 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          <span>Add Admin</span>
        </button>
      </div>

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

      <EmployeesTable
        filteredAdmins={filteredAdmins}
        getRoleName={getRoleName}
        formatDate={formatDate}
        onSelectAdmin={setSelectedAdmin}
        onOpenModal={handleOpenModal}
        onDeleteAdmin={setDeleteId}
      />

      <AnimatePresence>
        {isModalOpen ? (
          <EmployeeFormModal
            onClose={() => setIsModalOpen(false)}
            editingAdmin={editingAdmin}
            createdPassword={createdPassword}
            formData={formData}
            setFormData={setFormData}
            roles={roles}
            onSubmit={handleSubmit}
            generatePassword={generatePassword}
            isSubmitting={isSubmitting}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAdmin ? (
          <EmployeeDetailDrawer
            selectedAdmin={selectedAdmin}
            onClose={() => setSelectedAdmin(null)}
            getRoleName={getRoleName}
            formatDate={formatDate}
            onToggleStatus={handleToggleStatus}
            onDeleteAdmin={setDeleteId}
          />
        ) : null}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Admin?"
        message="This action is permanent."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
