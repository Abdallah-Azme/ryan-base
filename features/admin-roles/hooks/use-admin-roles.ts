import { useState } from 'react';
import { useRoles, roleStore, Role } from '@/lib/roleStore';
import { RoleValues } from '../schemas/role.schema';

export function useAdminRoles() {
  const { roles } = useRoles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<RoleValues>({
    name: '',
    description: '',
    permissions: [],
  });

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (data: RoleValues) => {
    const roleData = {
      ...data,
      description: data.description || '',
    };

    if (editingRole) {
      roleStore.updateRole(editingRole.id, roleData);
    } else {
      roleStore.addRole(roleData);
    }
    setIsModalOpen(false);
  };

  const togglePermission = (perm: string) => {
    setFormData((prev) => {
      if (prev.permissions.includes(perm)) {
        return { ...prev, permissions: prev.permissions.filter((p) => p !== perm) };
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

  return {
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
  };
}
