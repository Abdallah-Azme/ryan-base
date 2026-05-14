import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18nContext';

export function useLeadCapture() {
  const searchParams = useSearchParams();
  const source = searchParams?.get('source') || 'direct';
  const [isCompleted, setIsCompleted] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const { dir, language } = useTranslation();

  const handleComplete = (id?: string) => {
    if (id) setRequestId(id);
    setIsCompleted(true);
  };

  const getWhatsAppLink = () => {
    if (!requestId) return '';
    const text = language === 'ar' ? `تأكيد طلب رقم ${requestId}` : `Confirm request #${requestId}`;
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/96560070353?text=${encodedText}`;
  };

  const handleWizardClose = () => {
    window.location.href = 'https://raiyansoft.com';
  };

  return {
    source,
    isCompleted,
    requestId,
    dir,
    language,
    handleComplete,
    getWhatsAppLink,
    handleWizardClose,
  };
}
