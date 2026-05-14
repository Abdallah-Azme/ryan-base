'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18nContext';
import DesktopHeader from './desktop-header';

interface MobileShellProps {
  children: ReactNode;
}

export default function MobileShell({ children }: MobileShellProps) {
  const { dir } = useTranslation();
  const pathname = usePathname();
  const isLeadPage = pathname === '/lead';

  return (
    <div className="fixed inset-0 w-full h-full flex justify-center items-start md:items-center bg-[#020617] overflow-hidden" dir={dir}>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-navy-900 to-black hidden md:block opacity-50 pointer-events-none" />

      <div
        className={`
        w-full h-full relative z-10 shadow-2xl overflow-hidden flex flex-col text-white transition-all duration-300
        max-w-[430px] 
        lg:max-w-none lg:w-full lg:bg-transparent lg:shadow-none
        bg-gradient-to-b from-[#0f172a] to-[#020617] 
      `}
      >
        <div className="noise-bg absolute inset-0 pointer-events-none opacity-5 z-0" />

        {!isLeadPage ? <DesktopHeader /> : null}

        <div className="flex-1 w-full relative z-10 overflow-y-auto no-scrollbar flex flex-col">
          <div className="w-full flex-1 flex flex-col lg:max-w-5xl lg:mx-auto lg:px-6 lg:w-full lg:border-x lg:border-white/5 lg:bg-[#0f172a]/30">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
