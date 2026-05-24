import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MessageCircle, Save, X, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { Lead } from '@/lib/leadStore';
import LeadProjectSummary from './lead-project-summary';

interface LeadDetailDrawerProps {
  selectedLead: Lead;
  onClose: () => void;
  language: string;
  toWhatsAppDigits: (phone: string) => string | null;
  onUpdateStatus: (status: Lead['status']) => void;
  onDeleteLead: () => void;
  claimLink: string | null;
  isGeneratingLink: boolean;
  onGenerateLink: (lead: Lead) => void;
  rejectReason: string;
  onRejectReasonChange: (value: string) => void;
  assignedTo: string;
  onAssignedToChange: (value: string) => void;
  reviewNotes: string;
  onReviewNotesChange: (value: string) => void;
  onSaveReview: () => void;
}

export default function LeadDetailDrawer({
  selectedLead,
  onClose,
  language,
  toWhatsAppDigits,
  onUpdateStatus,
  onDeleteLead,
  claimLink,
  isGeneratingLink,
  onGenerateLink,
  rejectReason,
  onRejectReasonChange,
  assignedTo,
  onAssignedToChange,
  reviewNotes,
  onReviewNotesChange,
  onSaveReview,
}: LeadDetailDrawerProps) {
  const waDigits = toWhatsAppDigits(selectedLead.phone);
  const waMessage = 'السلام عليكم ورحمة الله وبركاته\nحضرتك قدمت عندنا طلب تطبيق ، طلبك مقبول ان شاء الله ممكن تفاصيل اكثر عن المشروع';
  const encodedWaMessage = encodeURIComponent(waMessage);
  const waUrl = waDigits
    ? `https://web.whatsapp.com/send/?phone=${waDigits}&text=${encodedWaMessage}&type=phone_number&app_absent=0`
    : null;
  const claimExpiry = selectedLead.claimTokenExpiresAt
    ? new Date(selectedLead.claimTokenExpiresAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0f172a] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">{selectedLead.projectPayload.name}</h2>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>{selectedLead.name}</span>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <span>{selectedLead.phone}</span>
                  <a
                    href={waUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!waUrl) e.preventDefault();
                    }}
                    className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                      waUrl
                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                        : 'bg-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                    title={waUrl ? 'Chat on WhatsApp Web' : 'No Phone'}
                  >
                    <MessageCircle size={14} />
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {selectedLead.email ? (
                  <span className="text-slate-400">{selectedLead.email}</span>
                ) : (
                  <span className="text-slate-500 italic">No Email</span>
                )}
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 uppercase font-bold tracking-wider">Current Status:</span>
              <span
                className={`text-sm font-bold capitalize ${
                  selectedLead.status === 'new'
                    ? 'text-blue-400'
                    : selectedLead.status === 'approved'
                    ? 'text-emerald-400'
                    : selectedLead.status === 'deleted'
                    ? 'text-slate-500 line-through'
                    : 'text-slate-200'
                }`}
              >
                {selectedLead.status}
              </span>
            </div>
            <div className="flex gap-2">
              {selectedLead.status === 'new' ? (
                <button
                  type="button"
                  onClick={() => onUpdateStatus('reviewing')}
                  className="px-3 py-1.5 bg-slate-700 text-white text-xs rounded-lg hover:bg-slate-600"
                >
                  Mark Reviewing
                </button>
              ) : null}
              {selectedLead.status !== 'deleted' ? (
                <button
                  type="button"
                  onClick={onDeleteLead}
                  className="px-3 py-1.5 bg-red-900/30 text-red-400 text-xs rounded-lg hover:bg-red-900/50 border border-red-500/30 transition-colors"
                >
                  Delete
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-800/30 p-4 rounded-xl border border-white/5">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">
              {language === 'ar' ? 'رقم الطلب' : 'Request ID'}
            </span>
            <div className="flex items-center gap-2">
              <code className="text-white text-sm font-mono bg-slate-900 px-2 py-1 rounded border border-white/10">
                {selectedLead.id}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedLead.id);
                  alert(language === 'ar' ? 'تم النسخ!' : 'Copied!');
                }}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded border border-white/10 hover:bg-slate-800 transition-colors"
                title="Copy ID"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <LeadProjectSummary projectPayload={selectedLead.projectPayload} />

          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Review Controls</h3>
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium ms-1">Assigned To</label>
              <input
                value={assignedTo}
                onChange={(event) => onAssignedToChange(event.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary focus:outline-none"
                placeholder="Sales or admin owner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium ms-1">Internal Review Notes</label>
              <textarea
                value={reviewNotes}
                onChange={(event) => onReviewNotesChange(event.target.value)}
                className="w-full h-24 resize-none bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary focus:outline-none"
                placeholder="Notes visible to dashboard users only."
              />
            </div>
            <button
              type="button"
              onClick={onSaveReview}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-sm font-bold"
            >
              <Save size={15} />
              Save Review
            </button>
          </div>

          {selectedLead.status !== 'rejected' &&
          selectedLead.status !== 'claimed' &&
          selectedLead.status !== 'deleted' ? (
            <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10 space-y-3">
              <label className="text-xs text-red-300 font-bold uppercase tracking-wider">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(event) => onRejectReasonChange(event.target.value)}
                className="w-full h-20 resize-none bg-slate-950 border border-red-500/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-red-400 focus:outline-none"
                placeholder="Required before rejecting this lead."
              />
              <button
                type="button"
                onClick={() => onUpdateStatus('rejected')}
                disabled={!rejectReason.trim()}
                className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-lg hover:bg-red-500/20 border border-red-500/20 disabled:opacity-40"
              >
                Reject Lead
              </button>
            </div>
          ) : null}

          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock size={15} /> Timeline
            </h3>
            {selectedLead.timeline?.length ? (
              <div className="space-y-3">
                {selectedLead.timeline.map((item, index) => (
                  <div key={`${item.action}-${item.createdAt}-${index}`} className="border-l border-primary/30 ps-3">
                    <p className="text-sm text-white font-bold">{item.action.replace('.', ' ')}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} by{' '}
                      {item.createdByName || 'Admin'}
                    </p>
                    {item.reason ? <p className="text-xs text-slate-400 mt-1">{item.reason}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No timeline events yet.</p>
            )}
          </div>

          {selectedLead.status !== 'rejected' &&
          selectedLead.status !== 'claimed' &&
          selectedLead.status !== 'deleted' ? (
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Approval & Access
              </h3>

              {!claimLink ? (
                <button
                  type="button"
                  onClick={() => onGenerateLink(selectedLead)}
                  disabled={isGeneratingLink}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                  {isGeneratingLink ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                  <span>Approve & Generate Claim Link</span>
                </button>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-emerald-400 text-xs font-bold mb-2 flex items-center gap-2">
                    <CheckCircle size={14} /> Project Approved! Share this link with the client:
                  </p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={claimLink}
                      className="flex-1 bg-slate-900 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(claimLink);
                        alert('Copied!');
                      }}
                      className="px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <p className="text-slate-500 text-[10px] mt-2">
                    {claimExpiry ? `Link expires ${claimExpiry}.` : 'Link expires in 7 days.'}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
