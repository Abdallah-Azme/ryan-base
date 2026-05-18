import React from 'react';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useClaim } from '../hooks/use-claim';
import ClaimForm from './claim-form';

export default function ClaimProjectPage() {
  const {
    router,
    t,
    dir,
    language,
    setLanguage,
    status,
    errorMsg,
    handleClaim,
  } = useClaim();

  if (status === 'validating') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white p-6 text-center">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-sm">
          <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Invalid Link</h1>
          <p className="text-slate-400 text-sm">{errorMsg}</p>
          <button type="button" onClick={() => router.push('/')} className="mt-6 text-sm text-white underline">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617] text-white p-6 text-center">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl max-w-sm">
          <CheckCircle size={40} className="text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Welcome Aboard!</h1>
          <p className="text-slate-400 text-sm">Your project is ready. Redirecting you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col p-6 overflow-y-auto relative" dir={dir}>
      <div className="absolute top-6 end-6 z-20">
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors bg-slate-800/50 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md"
        >
          {language === 'en' ? 'عربي' : 'English'}
        </button>
      </div>

      <div className="max-w-md mx-auto w-full pt-10 pb-20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary animate-pulse">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Claim Your Project</h1>
          <p className="text-slate-400 text-sm">Create your account to access your approved project dashboard.</p>
        </div>

        <ClaimForm
          status={status}
          onSubmit={handleClaim}
          t={t}
        />
      </div>
    </div>
  );
}
