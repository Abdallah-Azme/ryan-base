'use client';
import { I18nProvider } from '@/lib/i18nContext';
import { AuthGuardProvider } from '@/lib/authGuardContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthGuardProvider>
        {children}
      </AuthGuardProvider>
    </I18nProvider>
  );
}
