"use client";

// @ts-nocheck
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageCircle, Calendar, Bell, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '../lib/notificationStore';
import { useUserMetadata } from '../lib/userMetadataStore';
import { useTranslation } from '../lib/i18nContext';
import { useAuthGuard } from '../lib/authGuardContext';
import TabIconWithBadge from './TabIconWithBadge';

const BottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const { chatUnreadCount } = useUserMetadata();
  const { t } = useTranslation();
  const { requireAuth } = useAuthGuard();

  const tabs = [
    { 
      id: 'home', 
      icon: Home, 
      label: t('home.my_apps'), 
      path: '/home', 
      protected: false, 
      badge: 0 
    },
    { 
      id: 'support', 
      icon: MessageCircle, 
      label: t('status.support'), 
      path: '/support', 
      protected: true,
      badge: chatUnreadCount 
    },
    { 
      id: 'appointments', 
      icon: Calendar, 
      label: t('appt.title'), 
      path: '/appointments', 
      protected: true, 
      badge: 0 
    },
    { 
      id: 'notifications', 
      icon: Bell, 
      label: t('notif.title'), 
      path: '/notifications', 
      badge: unreadCount, 
      protected: true 
    },
    { 
      id: 'more', 
      icon: MoreHorizontal, 
      label: t('more.title'), 
      path: '/more', 
      protected: false, 
      badge: 0 
    },
  ];

  const handleNav = (path: string, isProtected: boolean) => {
    if (isProtected) {
      requireAuth(() => router.push(path));
    } else {
      router.push(path);
    }
  };

  return (
    // Added lg:hidden to hide on desktop
    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-50 px-2 pb-2 pointer-events-none lg:hidden">
      {/* 
         glass-panel: 
         - removed internal padding logic that might constrain height 
         - added overflow-visible to allow badges to peek if needed (though they are inside buttons) 
         - pointer-events-auto restores clicking since parent has none 
      */}
      <div className="glass-panel rounded-2xl h-16 flex items-center justify-around px-1 shadow-lg shadow-black/40 pointer-events-auto overflow-visible">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleNav(tab.path, tab.protected)}
              aria-label={tab.label}
              className="flex items-center justify-center w-12 h-12 relative group"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <TabIconWithBadge 
                icon={tab.icon} 
                isActive={isActive} 
                badgeCount={tab.badge || 0} 
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
