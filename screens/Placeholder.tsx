"use client";
// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';

const Placeholder: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex flex-col h-full items-center justify-center p-6 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="text-primary text-6xl mb-4 opacity-20 font-bold">
          {title.charAt(0)}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <div className="h-1 w-12 bg-primary rounded-full mx-auto mb-4"></div>
        <p className="text-slate-400">Coming soon</p>
      </motion.div>
    </div>
  );
};

export default Placeholder;