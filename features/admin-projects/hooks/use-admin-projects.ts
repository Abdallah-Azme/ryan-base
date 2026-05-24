import { useState } from 'react';
import { useProjects, projectStore, Project } from '@/lib/projectStore';
import { ProjectValues } from '../schemas/project.schema';

export function useAdminProjects() {
  const { projects } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProjectValues>({
    name: '',
    description: '',
    link: '',
    logoUrl: '',
  });

  const filteredProjects = projects.filter(
    (p) =>
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
        logoUrl: project.logoUrl,
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        link: '',
        logoUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = (data: ProjectValues) => {
    const projectData = {
      ...data,
      logoUrl: data.logoUrl || '',
    };

    if (editingProject) {
      projectStore.updateProject(editingProject.id, projectData);
    } else {
      projectStore.addProject(projectData);
    }
    handleCloseModal();
  };

  const handleDelete = () => {
    if (deleteId) {
      projectStore.deleteProject(deleteId);
      setDeleteId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return {
    projects,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
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
  };
}
