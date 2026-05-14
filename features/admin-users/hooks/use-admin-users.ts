import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc, orderBy } from 'firebase/firestore';
import { useUsers, userStore, User } from '@/lib/userStore';
import { app, db } from '@/lib/firebase-client';
import { UserProject } from '@/lib/userProjectsStore';

export function useAdminUsers() {
  const { users, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Disabled'>('All');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'projects'>('profile');
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (app && app.options) {
      console.log('Admin Dashboard Loaded. Firebase Project ID:', app.options.projectId);
    }
  }, []);

  const fetchUserProjects = async (uid: string) => {
    setLoadingProjects(true);
    const results: UserProject[] = [];
    const seenIds = new Set<string>();

    try {
      if (db) {
        try {
          const subColRef = collection(db, 'users', uid, 'projects');
          const subColQ = query(subColRef, orderBy('createdAt', 'desc'));
          const subColSnap = await getDocs(subColQ);
          subColSnap.forEach((d) => {
            if (!seenIds.has(d.id)) {
              results.push({ id: d.id, ...d.data() } as UserProject);
              seenIds.add(d.id);
            }
          });
        } catch (e) {
          console.warn('Subcollection fetch failed', e);
        }

        try {
          const rootColRef = collection(db, 'user-projects');
          const qUserId = query(rootColRef, where('userId', '==', uid));
          const snapUserId = await getDocs(qUserId);
          snapUserId.forEach((d) => {
            if (!seenIds.has(d.id)) {
              results.push({ id: d.id, ...d.data() } as UserProject);
              seenIds.add(d.id);
            }
          });
        } catch (e) {
          console.warn('Root collection fetch failed', e);
        }

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
          console.warn('Legacy doc fetch failed', e);
        }
      }

      results.sort((a, b) => {
        const dateA = a.createdAt || 0;
        const dateB = b.createdAt || 0;
        return dateB - dateA;
      });

      setUserProjects(results);
    } catch (err) {
      console.error('Error fetching user projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (selectedUser && activeTab === 'projects') {
      fetchUserProjects(selectedUser.id);
    }
  }, [selectedUser, activeTab]);

  useEffect(() => {
    if (!selectedUser) {
      setActiveTab('profile');
      setUserProjects([]);
    }
  }, [selectedUser]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    const matchesFilter = filterStatus === 'All' || user.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (ts: number) => {
    if (!ts) return 'N/A';
    return new Date(ts).toLocaleDateString('en-UK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (ts: number) => {
    if (!ts) return 'N/A';
    return new Date(ts).toLocaleString('en-UK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = () => {
    alert(`Exporting ${filteredUsers.length} users to CSV...`);
  };

  const handleToggleStatus = (user: User) => {
    userStore.toggleStatus(user.id);
    if (selectedUser?.id === user.id) {
      setSelectedUser((prev) =>
        prev ? { ...prev, status: prev.status === 'Active' ? 'Disabled' : 'Active' } : null
      );
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      userStore.deleteUser(deleteId);
      if (selectedUser?.id === deleteId) setSelectedUser(null);
      setDeleteId(null);
    }
  };

  return {
    users,
    error,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    selectedUser,
    setSelectedUser,
    deleteId,
    setDeleteId,
    activeTab,
    setActiveTab,
    userProjects,
    loadingProjects,
    filteredUsers,
    formatDate,
    formatDateTime,
    handleExport,
    handleToggleStatus,
    handleDelete,
  };
}
