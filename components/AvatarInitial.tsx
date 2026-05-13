import React from 'react';

interface AvatarInitialProps {
  name?: string;
  className?: string;
}

const AvatarInitial: React.FC<AvatarInitialProps> = ({ name, className = '' }) => {
  // Get first letter of first name
  const getInitial = (fullName?: string) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length > 0 && parts[0]) {
      return parts[0].charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div 
      className={`flex items-center justify-center bg-primary text-white font-bold rounded-full select-none shadow-[0_0_15px_rgba(29,183,240,0.4)] border border-white/10 relative overflow-hidden ${className}`}
      aria-label={name || 'User Avatar'}
    >
      {/* Subtle gradient overlay for polish */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10 pointer-events-none" />
      <span className="relative z-10 font-sans">{getInitial(name)}</span>
    </div>
  );
};

export default AvatarInitial;
