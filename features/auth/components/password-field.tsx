import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/input';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function PasswordField({
  label,
  error,
  icon,
  dir,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        label={label}
        type={showPassword ? 'text' : 'password'}
        error={error}
        icon={icon}
        dir={dir}
        className="pe-12"
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute end-3 top-[34px] text-slate-500 hover:text-white transition-colors p-1"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
