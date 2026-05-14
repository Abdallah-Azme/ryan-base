import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-slate-800/20 rounded-2xl border border-white/5 ${className}`}>
      <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5 text-slate-500">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      {subtitle ? (
        <p className="text-slate-400 text-sm max-w-xs mb-6">{subtitle}</p>
      ) : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}
