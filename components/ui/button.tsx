import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-xl transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary text-white shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_25px_rgba(29,183,240,0.5)]',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50',
    destructive: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
    outline: 'bg-slate-800/50 text-slate-300 border border-white/10 hover:bg-slate-700 hover:text-white',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin me-2" size={18} /> : null}
      {children}
    </button>
  );
}
