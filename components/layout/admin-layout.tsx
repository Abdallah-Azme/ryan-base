'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Menu,
  X,
  FolderKanban,
  Users,
  Briefcase,
  Shield,
  LayoutGrid,
  MessageSquareText,
  User,
  ChevronDown,
  Calendar,
  Inbox,
  ListChecks,
} from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, doc, getDoc, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase-client';
import { useAdminChatNotifications } from '@/lib/adminChatStore';
import { hasPermission } from '@/lib/permissions';
import SafeImage from '../ui/safe-image';
import Avatar from '../ui/avatar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [currentPermissions, setCurrentPermissions] = useState<string[]>(['*']);
  const [upcomingApptsCount, setUpcomingApptsCount] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const { totalUnread } = useAdminChatNotifications();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && db) {
        Promise.all([
          getDoc(doc(db, 'users', user.uid)).catch(() => null),
          getDoc(doc(db, 'admins', user.uid)).catch(() => null),
        ])
          .then(([userSnap, adminSnap]) => {
            const userData = userSnap?.data();
            const adminData = adminSnap?.data();
            if (userData?.role === 'admin' || adminData?.role === 'super_admin') {
              setCurrentPermissions(['*']);
              return;
            }
            const adminPermissions = adminData?.permissions
              ? Object.keys(adminData.permissions).filter((key) => adminData.permissions[key])
              : [];
            const userPermissions = Array.isArray(userData?.permissions) ? userData.permissions : [];
            setCurrentPermissions([...new Set([...adminPermissions, ...userPermissions])]);
          })
          .catch(() => setCurrentPermissions([]));
      } else {
        setCurrentPermissions([]);
      }
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    let unsubscribeAppts = () => {};
    if (db) {
      const apptsQuery = query(
        collection(db, 'appointment_bookings'),
        where('startAt', '>=', Timestamp.now()),
        where('status', 'not-in', ['cancelled', 'completed'])
      );

      unsubscribeAppts = onSnapshot(
        apptsQuery,
        (snap) => {
          setUpcomingApptsCount(snap.size);
        },
        (err) => {
          console.warn('Upcoming appointments badge subscription error:', err);
        }
      );
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      unsubscribeAuth();
      unsubscribeAppts();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navItems = [
    { id: 'leads', label: 'Leads', icon: Inbox, path: '/admin/leads', badge: 0, permission: 'leads.view' },
    { id: 'project-types', label: 'Project Types', icon: Briefcase, path: '/admin/project-types', badge: 0, permission: 'project_types.manage' },
    { id: 'project-questions', label: 'Project Questions', icon: ListChecks, path: '/admin/project-questions', badge: 0, permission: 'lead_questions.manage' },
    { id: 'projects', label: 'Portfolio', icon: FolderKanban, path: '/admin/projects', badge: 0, permission: 'portfolio.manage' },
    { id: 'user-projects', label: 'User Projects', icon: LayoutGrid, path: '/admin/user-projects', badge: 0, permission: 'projects.view' },
    {
      id: 'live-chat',
      label: 'Live Chat',
      icon: MessageSquareText,
      path: '/admin/live-chat',
      badge: totalUnread,
      permission: 'chat.manage',
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      path: '/admin/appointments',
      badge: upcomingApptsCount,
      permission: 'appointments.view',
    },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users', badge: 0, permission: 'users.view' },
    { id: 'employees', label: 'Employees', icon: Briefcase, path: '/admin/employees', badge: 0, permission: 'employees.manage' },
    { id: 'roles', label: 'Roles', icon: Shield, path: '/admin/roles', badge: 0, permission: 'roles.manage' },
  ].filter((item) => hasPermission(currentPermissions, item.permission));

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 flex items-center space-x-3 border-b border-white/5">
          <div className="w-8 h-8 relative">
            <SafeImage
              src="https://raiyansoft.com/wp-content/uploads/2024/05/cropped-App-Icon-1.png"
              alt="Raiyansoft"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Raiyansoft</h1>
            <span className="text-xs text-primary font-medium">Admin Panel</span>
          </div>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname.includes(item.path);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  router.push(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <item.icon size={20} />
                  {item.badge > 0 ? (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[#0f172a] shadow-sm z-10">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600">v1.2.0 • Admin Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white flex overflow-hidden font-sans">
      <aside className="hidden md:block w-64 bg-[#0f172a] border-r border-white/5 shadow-2xl z-20 shrink-0">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col relative w-full h-screen overflow-hidden">
        <header className="h-16 shrink-0 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-400 hover:text-white transition-colors md:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="md:hidden flex items-center space-x-2">
              <SafeImage
                src="https://raiyansoft.com/wp-content/uploads/2024/05/cropped-App-Icon-1.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-white text-sm">Admin</span>
            </div>

            <div className="hidden md:block text-slate-500 text-sm font-medium" />
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                <Avatar name={currentUser?.displayName || 'Admin'} size="sm" className="w-full h-full text-xs" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-none">{currentUser?.displayName || 'Admin User'}</p>
                <p className="text-[10px] text-slate-400 leading-none mt-1 group-hover:text-primary transition-colors">
                  View Account
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {isUserMenuOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/5 mb-1">
                    <p className="text-sm font-bold text-white truncate">{currentUser?.displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push('/admin/account');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <User size={16} />
                    <span>Edit Account</span>
                  </button>

                  <div className="my-1 border-t border-white/5" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </header>

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 w-64 bg-[#0f172a] border-r border-white/10 z-50 md:hidden shadow-2xl"
              >
                <SidebarContent />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white"
                >
                  <X size={20} />
                </button>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto bg-[#020617] p-4 md:p-8 relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent" />
          </div>

          <div className="max-w-6xl mx-auto relative z-10 h-full pb-20">{children}</div>
        </main>
      </div>
    </div>
  );
}
