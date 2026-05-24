import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18nContext';

interface ForgotPasswordLinkProps {
  onClick: () => void;
  isLoading?: boolean;
}

export default function ForgotPasswordLink({ onClick, isLoading = false }: ForgotPasswordLinkProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end pt-3 pb-1">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 disabled:opacity-50"
      >
        {isLoading ? <Loader2 size={10} className="animate-spin" /> : null}
        {t('auth.forgot_password')}
      </button>
    </div>
  );
}
