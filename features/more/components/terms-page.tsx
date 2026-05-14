import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18nContext';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="mb-6 last:mb-0">
    <h3 className="text-base font-bold text-white mb-2">{title}</h3>
    <div className="text-sm text-slate-400 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function TermsPage() {
  const router = useRouter();
  const { t, dir } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
      className="flex flex-col h-full bg-[#020617] relative overflow-y-auto no-scrollbar pb-24"
    >
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-4 py-4 border-b border-white/5 flex items-center shadow-lg">
        <button
          type="button"
          onClick={() => router.push('/more')}
          className="p-2 -ms-2 text-slate-400 hover:text-white transition-colors"
        >
          {dir === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
        <h1 className="text-lg font-bold text-white ms-2">{t('more.terms')}</h1>
      </div>

      <div className="p-6">
        <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
          <Section title="1. Acceptance of Terms">
            <p>
              By downloading, installing, or using the Raiyansoft® application, you agree to be bound by these Terms of Use. If you do not agree, please do not use our services.
            </p>
          </Section>

          <Section title="2. Account Registration">
            <p>
              You may be required to register an account. You agree to provide accurate information and keep your account credentials secure. You are responsible for all activities under your account.
            </p>
          </Section>

          <Section title="3. User Content">
            <p>
              You retain ownership of content you submit. By submitting content, you grant us a license to use it to provide our services. Do not submit illegal or offensive material.
            </p>
          </Section>

          <Section title="4. Prohibited Use">
            <p>
              You may not use the app for any illegal purpose, to harass others, or to interfere with the app's operation. Reverse engineering is strictly prohibited.
            </p>
          </Section>

          <Section title="5. Disclaimers">
            <p>
              The app is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free.
            </p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>
              Raiyansoft® shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.
            </p>
          </Section>

          <Section title="7. Termination">
            <p>We reserve the right to suspend or terminate your access at any time for violation of these terms.</p>
          </Section>

          <Section title="8. Changes to Terms">
            <p>We may modify these terms at any time. Continued use of the app constitutes acceptance of the new terms.</p>
          </Section>

          <div className="mt-8 pt-6 border-t border-white/5 text-xs text-slate-500 text-center">
            Last updated: December 2025
          </div>
        </div>
      </div>
    </motion.div>
  );
}
