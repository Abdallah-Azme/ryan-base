'use client';
import MobileShell from '@/components/layout/mobile-shell';
import BottomNav from '@/components/layout/bottom-nav';
import ErrorBoundary from '@/components/layout/error-boundary';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainTabs = ['/home', '/support', '/appointments', '/notifications', '/more'];
  const showBottomNav = mainTabs.includes(pathname || '');

  return (
    <MobileShell>
      <ErrorBoundary>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname || 'empty'}
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </ErrorBoundary>
      {showBottomNav ? <BottomNav /> : null}
    </MobileShell>
  );
}
