import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import ProjectWizard from '@/features/projects/components/project-wizard';
import { useLeadCapture } from '../hooks/use-lead-capture';

export default function LeadCapturePage() {
  const {
    source,
    isCompleted,
    requestId,
    dir,
    language,
    handleComplete,
    getWhatsAppLink,
    handleWizardClose,
  } = useLeadCapture();

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen bg-[#020617] text-white p-6" dir={dir}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-800/50 border border-white/5 rounded-3xl p-8 max-w-sm w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {language === 'ar' ? 'تم استلام طلبك' : 'Request Received'}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            {language === 'ar'
              ? 'شكراً لمشاركتك فكرتك. فريقنا يراجع تفاصيل مشروعك الآن وسيتواصل معك قريباً.'
              : 'Thank you for sharing your vision. Our team is reviewing your project details and will contact you shortly.'}
          </p>

          {requestId ? (
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full bg-[#25D366] text-white font-bold py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_25px_rgba(37,211,102,0.5)] transition-all"
            >
              {language === 'ar' ? 'اضغط هنا لتأكيد الطلب' : 'Click here to confirm your request'}
            </a>
          ) : null}
        </motion.div>
      </div>
    );
  }

  return (
    <ProjectWizard
      onClose={handleWizardClose}
      onComplete={handleComplete}
      isLeadMode={true}
      source={source}
    />
  );
}
