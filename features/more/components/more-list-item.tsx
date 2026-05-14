import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18nContext';

interface MoreListItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
  rightElement?: React.ReactNode;
  disabled?: boolean;
}

export default function MoreListItem({
  icon: Icon,
  label,
  onClick,
  className = '',
  rightElement,
  disabled = false,
}: MoreListItemProps) {
  const { dir } = useTranslation();
  return (
    <motion.button
      type="button"
      whileTap={!disabled ? { scale: 0.98, backgroundColor: 'rgba(255,255,255,0.05)' } : {}}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between p-4 bg-slate-800/40 border-b border-white/5 last:border-0 first:rounded-t-2xl last:rounded-b-2xl backdrop-blur-sm transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800/60 cursor-pointer'
      } ${className}`}
    >
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-300 border border-white/5">
          <Icon size={20} />
        </div>
        <span className="text-sm font-medium text-white">{label}</span>
      </div>

      <div className="flex items-center text-slate-500">
        {rightElement}
        <ChevronRight size={18} className={`ms-2 opacity-70 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
      </div>
    </motion.button>
  );
}
