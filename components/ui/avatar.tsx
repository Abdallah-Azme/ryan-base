import React from 'react';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const getInitial = (fullName?: string) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length > 0 && parts[0]) {
      return parts[0].charAt(0).toUpperCase();
    }
    return 'U';
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-24 h-24 text-3xl',
  };

  return (
    <div
      className={`flex items-center justify-center bg-primary text-white font-bold rounded-full select-none shadow-[0_0_15px_rgba(29,183,240,0.4)] border border-white/10 relative overflow-hidden ${sizeClasses[size]} ${className}`}
      aria-label={name || 'User Avatar'}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10 pointer-events-none" />
      <span className="relative z-10 font-sans">{getInitial(name)}</span>
    </div>
  );
}
