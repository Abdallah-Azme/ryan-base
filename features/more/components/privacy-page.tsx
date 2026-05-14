import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18nContext';

export default function PrivacyPage() {
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
        <h1 className="text-lg font-bold text-white ms-2">{t('more.privacy')}</h1>
      </div>

      <div className="p-6">
        <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 backdrop-blur-sm text-sm text-slate-300 leading-relaxed space-y-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-1">PRIVACY POLICY</h2>
            <p className="text-slate-500 text-xs">Effective Date: December 26, 2025</p>
          </div>

          <section>
            <h3 className="text-white font-bold mb-2">1. Overview</h3>
            <p>
              Raiyansoft® (“we”, “us”) values your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices you have.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">2. Information We Collect</h3>
            <p className="mb-2">We may collect:</p>
            <ul className="list-disc ps-5 space-y-1 text-slate-400">
              <li>Account information (name, email, phone).</li>
              <li>Usage information (pages visited, actions taken, device and browser data).</li>
              <li>Support communications (messages you send to our support team).</li>
              <li>Technical information (IP address, approximate location derived from IP, logs, and diagnostics).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">3. How We Use Information</h3>
            <p className="mb-2">We use information to:</p>
            <ul className="list-disc ps-5 space-y-1 text-slate-400">
              <li>Provide and operate the service.</li>
              <li>Improve performance, security, and user experience.</li>
              <li>Respond to support requests and communicate service updates.</li>
              <li>Send important administrative messages.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">4. Sharing and Disclosure</h3>
            <p className="mb-2">We may share information with:</p>
            <ul className="list-disc ps-5 space-y-1 text-slate-400 mb-2">
              <li>Service providers that help us operate the app (hosting, analytics, customer support tools).</li>
              <li>Professional advisors (legal/accounting) when necessary.</li>
              <li>Authorities if required by law, or to protect rights and safety.</li>
              <li>
                Marketing and advertising partners to help measure campaigns and deliver relevant marketing, subject to your choices and applicable laws.
              </li>
            </ul>
            <p>
              We do not disclose personal information for third-party direct marketing where prohibited by law, and we provide choices where required.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">5. Marketing Choices</h3>
            <p>
              You may opt out of promotional communications at any time by using unsubscribe options (if available) or contacting us. Some service messages are non-promotional and may still be sent.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">6. Data Retention</h3>
            <p>
              We retain information as long as needed for the purposes described, unless a longer retention period is required by law.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">7. Security</h3>
            <p>
              We use reasonable administrative, technical, and organizational measures designed to protect your information. No method of transmission or storage is 100% secure.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">8. International Transfers</h3>
            <p>
              Your information may be processed in countries other than your own, which may have different data protection laws.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">9. Children’s Privacy</h3>
            <p>Our services are not intended for children, and we do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">10. Your Rights</h3>
            <p>
              Depending on your location, you may have rights to access, correct, delete, or object to certain processing of your information. To request these rights, contact us.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">11. Changes to This Policy</h3>
            <p>We may update this policy from time to time. We will update the “Effective Date” and provide notice where required.</p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">12. Contact Us</h3>
            <p>
              For privacy questions, contact: <span className="text-primary">privacy@raiyansoft.com</span>
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
