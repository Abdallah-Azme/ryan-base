import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  className = '',
  dir,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2 w-full">
      {label ? (
        <label className="text-xs text-slate-400 ms-1 block font-medium">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        ) : null}
        <input
          dir={dir}
          className={`w-full bg-slate-800 rounded-xl ${
            icon ? 'ps-10 pe-4' : 'px-4'
          } py-3 text-white border focus:outline-none transition-all ${
            error
              ? 'border-red-500/50 focus:border-red-500'
              : 'border-white/10 focus:border-primary'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[10px] text-red-400 ms-1 mt-0.5 font-medium">{error}</p>
      ) : null}
    </div>
  );
}
