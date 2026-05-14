import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: number;
  fullScreen?: boolean;
  className?: string;
}

export default function Loader({ size = 24, fullScreen = false, className = '' }: LoaderProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/80 backdrop-blur-sm">
        <Loader2 className={`animate-spin text-primary ${className}`} size={size} />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Loader2 className="animate-spin text-primary" size={size} />
    </div>
  );
}
