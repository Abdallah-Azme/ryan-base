import React from 'react';
import { motion } from 'framer-motion';
import { Box } from 'lucide-react';
import { useTranslation } from '@/lib/i18nContext';

interface AppCardProps {
  id: string;
  name: string;
  version: string;
  description?: string;
  iconBg?: string;
  brandColor?: string;
  onOpen: () => void;
}

export default function AppCard({
  name,
  version,
  description,
  brandColor,
  onOpen,
}: AppCardProps) {
  const finalColor = brandColor || '#1DB7F0';
  const { t } = useTranslation();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-slate-800/40 border border-white/5 p-3 rounded-2xl flex items-center justify-between mb-3 shadow-lg backdrop-blur-sm cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-center space-x-3 rtl:space-x-reverse overflow-hidden">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner shrink-0 transition-colors duration-300"
          style={{
            backgroundColor: finalColor,
            border: `1px solid ${finalColor}40`,
            boxShadow: `0 0 12px ${finalColor}30`,
          }}
        >
          <Box className="text-white opacity-90" size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm truncate pe-2 rtl:pe-0 rtl:ps-2">{name}</h3>
          <p className="text-slate-400 text-xs truncate">{description || version}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="bg-slate-700/50 hover:bg-primary/20 text-xs font-medium text-white px-4 py-2 rounded-lg transition-colors border border-white/5 shrink-0"
      >
        {t('home.open')}
      </button>
    </motion.div>
  );
}
