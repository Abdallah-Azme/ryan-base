import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorAlertProps {
  message?: string | null;
  className?: string;
}

export default function ErrorAlert({ message, className = '' }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 ${className}`}
    >
      <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={20} />
      <span className="text-red-400 text-sm font-medium leading-relaxed">{message}</span>
    </motion.div>
  );
}
