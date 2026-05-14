import React from 'react';
import { motion } from 'framer-motion';
import SafeImage from '@/components/ui/safe-image';

interface ProjectListItemProps {
  name: string;
  description: string;
  logoUrl: string;
  link: string;
}

export default function ProjectListItem({ name, description, logoUrl, link }: ProjectListItemProps) {
  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, backgroundColor: 'rgba(30, 41, 59, 0.6)' }}
      whileTap={{ scale: 0.98 }}
      className="bg-slate-800/40 border border-white/5 p-3 rounded-2xl mb-3 flex items-center space-x-3 rtl:space-x-reverse transition-colors cursor-pointer block"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 relative bg-slate-800 shadow-md">
        <SafeImage src={logoUrl} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-bold text-sm truncate">{name}</h4>
        <p className="text-slate-400 text-xs truncate">{description}</p>
      </div>
    </motion.a>
  );
}
