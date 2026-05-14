import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TabIconWithBadgeProps {
  icon: LucideIcon;
  isActive: boolean;
  badgeCount: number;
}

export default function TabIconWithBadge({ icon: Icon, isActive, badgeCount }: TabIconWithBadgeProps) {
  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-visible">
      <Icon
        size={24}
        className={`transition-all duration-300 ${
          isActive
            ? 'text-primary drop-shadow-[0_0_8px_rgba(29,183,240,0.6)] scale-110'
            : 'text-slate-400 hover:text-slate-300'
        }`}
      />

      <AnimatePresence>
        {badgeCount > 0 ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1.5 rtl:-left-1.5 rtl:right-auto z-10 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-[#0f172a] px-1 pointer-events-none"
          >
            <span className="text-[10px] font-bold text-white leading-none">
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
