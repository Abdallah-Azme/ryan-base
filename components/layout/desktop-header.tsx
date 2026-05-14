'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, MessageCircle, Calendar, Bell, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/lib/notificationStore';
import { useUserMetadata } from '@/lib/userMetadataStore';
import { useTranslation } from '@/lib/i18nContext';
import { useAuthGuard } from '@/lib/authGuardContext';
import SafeImage from '../ui/safe-image';

export default function DesktopHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const { chatUnreadCount } = useUserMetadata();
  const { t } = useTranslation();
  const { requireAuth } = useAuthGuard();

  const tabs = [
    { id: 'home', icon: Home, label: t('home.my_apps'), path: '/home', protected: false, badge: 0 },
    {
      id: 'support',
      icon: MessageCircle,
      label: t('status.support'),
      path: '/support',
      protected: true,
      badge: chatUnreadCount,
    },
    { id: 'appointments', icon: Calendar, label: t('appt.title'), path: '/appointments', protected: true, badge: 0 },
    { id: 'notifications', icon: Bell, label: t('notif.title'), path: '/notifications', protected: true, badge: unreadCount },
    { id: 'more', icon: MoreHorizontal, label: t('more.title'), path: '/more', protected: false, badge: 0 },
  ];

  const handleNav = (path: string, isProtected: boolean) => {
    if (isProtected) {
      requireAuth(() => router.push(path));
    } else {
      router.push(path);
    }
  };

  return (
    <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-slate-900/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 shrink-0">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/home')}>
        <div className="w-9 h-9 relative">
          <SafeImage
            src="https://raiyansoft.com/wp-content/uploads/2024/05/cropped-App-Icon-1.png"
            alt="Raiyansoft"
            className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(29,183,240,0.5)]"
          />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Raiyansoft</span>
      </div>

      <div className="flex items-center gap-1 bg-slate-800/40 p-1 rounded-xl border border-white/5">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.path) && (tab.path !== '/home' || pathname === '/home');
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleNav(tab.path, tab.protected)}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 group
                ${isActive ? 'text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <div className="relative flex items-center">
                <tab.icon
                  size={18}
                  className={`transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-white'}`}
                />
                {tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full border-2 border-slate-900 shadow-sm">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-sm font-medium">{tab.label}</span>

              {isActive ? (
                <motion.div
                  layoutId="desktopNavHighlight"
                  className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20 pointer-events-none"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
