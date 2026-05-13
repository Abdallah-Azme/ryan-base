"use client";

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Eye, CheckCircle, X, ExternalLink, MessageCircle, Copy, Clock, Phone, Loader2 } from 'lucide-react';
import { leadStore, Lead } from '../../lib/leadStore';
import AvatarInitial from '../../components/AvatarInitial';
import { useTranslation } from '../../lib/i18nContext';

const AdminLeads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [claimLink, setClaimLink] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const { language } = useTranslation();

  useEffect(() => {
    const unsubscribe = leadStore.subscribeToLeads(() => {
      setLeads(leadStore.getLeads());
    });
    return () => unsubscribe();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = statusFilter === 'all' 
      ? lead.status !== 'deleted' 
      : lead.status === statusFilter;
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lead.phone.includes(searchQuery) ||
      lead.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleGenerateLink = async (lead: Lead) => {
    setIsGeneratingLink(true);
    setClaimLink(null);
    try {
      // Auto approve if not already
      if (lead.status !== 'approved') {
        await leadStore.updateLeadStatus(lead.id, 'approved');
      }
      
      const token = await leadStore.generateClaimToken(lead.id);
      const url = `${window.location.origin}/#/claim?token=${token}`;
      setClaimLink(url);
    } catch (e) {
      console.error(e);
      alert("Failed to generate link");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleUpdateStatus = async (status: Lead['status']) => {
    if (!selectedLead) return;
    if (status === 'rejected') {
        const reason = prompt("Rejection reason (optional):");
        await leadStore.updateLeadStatus(selectedLead.id, status, reason || undefined);
    } else {
        await leadStore.updateLeadStatus(selectedLead.id, status);
    }
    setSelectedLead(null);
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;
    if (!window.confirm("Delete this lead?\n\nThis will hide it from the main list, but it will remain in the database.")) return;
    try {
      await leadStore.deleteLead(selectedLead.id);
      setSelectedLead(null);
      alert("Lead moved to Deleted");
    } catch (e: any) {
      console.error(e);
      alert("Failed to delete lead: " + e.message);
    }
  };

  // Helper to parse phone for WhatsApp
  const toWhatsAppDigits = (phone: string): string | null => {
    if (!phone) return null;
    // Remove non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Logic: If 8 digits, assume Kuwait (965). If length < 8, invalid.
    if (digits.length === 8) return `965${digits}`;
    if (digits.length < 8) return null;
    
    return digits;
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 text-sm">Manage incoming project requests.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0f172a] p-4 rounded-2xl border border-white/5 shadow-lg flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'new', 'reviewing', 'approved', 'claimed', 'rejected', 'deleted'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize border transition-all ${
                statusFilter === status 
                  ? 'bg-primary/10 text-primary border-primary/30' 
                  : 'bg-slate-900 text-slate-400 border-white/5 hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="p-5 font-medium">Name</th>
                  <th className="p-5 font-medium">Project Info</th>
                  <th className="p-5 font-medium">Status</th>
                  <th className="p-5 font-medium">Date</th>
                  <th className="p-5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredLeads.map(lead => {
                  const waDigits = toWhatsAppDigits(lead.phone);
                  const waMessage = `السلام عليكم ورحمة الله وبركاته\nحضرتك قدمت عندنا طلب تطبيق ، طلبك مقبول ان شاء الله ممكن تفاصيل اكثر عن المشروع`;
                  const encodedWaMessage = encodeURIComponent(waMessage);
                  
                  // Use web.whatsapp.com explicitly
                  const waUrl = waDigits 
                    ? `https://web.whatsapp.com/send/?phone=${waDigits}&text=${encodedWaMessage}&type=phone_number&app_absent=0` 
                    : null;

                  return (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <AvatarInitial name={lead.name} className="w-10 h-10 text-sm" />
                          <div>
                            <div className="font-bold text-white">{lead.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone size={10} /> {lead.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-medium text-white">{lead.projectPayload.name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[150px]">
                          {lead.projectPayload.industry} • {lead.projectPayload.serviceModel}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          lead.status === 'new' ? 'bg-blue-500/10 text-blue-400' :
                          lead.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                          lead.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                          lead.status === 'claimed' ? 'bg-purple-500/10 text-purple-400' :
                          lead.status === 'deleted' ? 'bg-slate-800 text-slate-500 line-through' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-5 text-slate-400 text-xs">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={waUrl || undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => !waUrl && e.preventDefault()}
                            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                              waUrl 
                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                                : 'bg-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
                            }`}
                            title={waUrl ? "Chat on WhatsApp Web" : "No Phone"}
                          >
                            <MessageCircle size={16} />
                          </a>
                          
                          <button 
                            onClick={() => setSelectedLead(lead)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{selectedLead.projectPayload.name}</h2>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>{selectedLead.name}</span>
                      <span>•</span>
                      <div className="flex items-center gap-2">
                          <span>{selectedLead.phone}</span>
                          {(() => {
                              const waDigits = toWhatsAppDigits(selectedLead.phone);
                              const waMessage = `السلام عليكم ورحمة الله وبركاته\nحضرتك قدمت عندنا طلب تطبيق ، طلبك مقبول ان شاء الله ممكن تفاصيل اكثر عن المشروع`;
                              const encodedWaMessage = encodeURIComponent(waMessage);
                              const waUrl = waDigits 
                                  ? `https://web.whatsapp.com/send/?phone=${waDigits}&text=${encodedWaMessage}&type=phone_number&app_absent=0` 
                                  : null;
                              
                              return (
                                  <a 
                                      href={waUrl || undefined}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={e => !waUrl && e.preventDefault()}
                                      className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                                      waUrl 
                                          ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                                          : 'bg-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
                                      }`}
                                      title={waUrl ? "Chat on WhatsApp Web" : "No Phone"}
                                  >
                                      <MessageCircle size={14} />
                                  </a>
                              );
                          })()}
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
                <button onClick={() => { setSelectedLead(null); setClaimLink(null); }} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                
                {/* Status Bar */}
                <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 uppercase font-bold tracking-wider">Current Status:</span>
                    <span className={`text-sm font-bold capitalize ${
                        selectedLead.status === 'new' ? 'text-blue-400' :
                        selectedLead.status === 'approved' ? 'text-emerald-400' :
                        selectedLead.status === 'deleted' ? 'text-slate-500 line-through' :
                        'text-slate-200'
                    }`}>
                        {selectedLead.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {selectedLead.status === 'new' && (
                        <button onClick={() => handleUpdateStatus('reviewing')} className="px-3 py-1.5 bg-slate-700 text-white text-xs rounded-lg hover:bg-slate-600">Mark Reviewing</button>
                    )}
                    {selectedLead.status !== 'rejected' && selectedLead.status !== 'claimed' && selectedLead.status !== 'deleted' && (
                        <button onClick={() => handleUpdateStatus('rejected')} className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-lg hover:bg-red-500/20 border border-red-500/20">Reject</button>
                    )}
                    {selectedLead.status !== 'deleted' && (
                        <button onClick={handleDeleteLead} className="px-3 py-1.5 bg-red-900/30 text-red-400 text-xs rounded-lg hover:bg-red-900/50 border border-red-500/30 transition-colors">
                            Delete
                        </button>
                    )}
                  </div>
                </div>

                {/* Request ID */}
                <div className="flex items-center justify-between bg-slate-800/30 p-4 rounded-xl border border-white/5">
                  <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">
                    {language === 'ar' ? 'رقم الطلب' : 'Request ID'}
                  </span>
                  <div className="flex items-center gap-2">
                     <code className="text-white text-sm font-mono bg-slate-900 px-2 py-1 rounded border border-white/10">{selectedLead.id}</code>
                     <button 
                       onClick={() => { navigator.clipboard.writeText(selectedLead.id); alert(language === 'ar' ? 'تم النسخ!' : 'Copied!'); }}
                       className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded border border-white/10 hover:bg-slate-800 transition-colors"
                       title="Copy ID"
                     >
                       <Copy size={14} />
                     </button>
                  </div>
                </div>

                {/* Project Data */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Project Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-800/30 p-3 rounded-lg">
                            <span className="text-slate-500 block text-xs mb-1">Industry</span>
                            <span className="text-white">{selectedLead.projectPayload.industry} {selectedLead.projectPayload.industryOther ? `(${selectedLead.projectPayload.industryOther})` : ''}</span>
                        </div>
                        <div className="bg-slate-800/30 p-3 rounded-lg">
                            <span className="text-slate-500 block text-xs mb-1">Service Model</span>
                            <span className="text-white">{selectedLead.projectPayload.serviceModel}</span>
                        </div>
                        <div className="bg-slate-800/30 p-3 rounded-lg">
                            <span className="text-slate-500 block text-xs mb-1">Target Markets</span>
                            <span className="text-white">{selectedLead.projectPayload.markets.join(', ')}</span>
                        </div>
                        <div className="bg-slate-800/30 p-3 rounded-lg">
                            <span className="text-slate-500 block text-xs mb-1">Platforms</span>
                            <span className="text-white">{selectedLead.projectPayload.platforms.join(', ')}</span>
                        </div>
                    </div>
                    
                    <div className="bg-slate-800/30 p-4 rounded-lg">
                        <span className="text-slate-500 block text-xs mb-2">Description</span>
                        <p className="text-slate-300 leading-relaxed text-sm">{selectedLead.projectPayload.description}</p>
                    </div>
                </div>

                {/* Claim Link Generation */}
                {selectedLead.status !== 'rejected' && selectedLead.status !== 'claimed' && selectedLead.status !== 'deleted' && (
                    <div className="pt-4 border-t border-white/5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Approval & Access</h3>
                        
                        {!claimLink ? (
                            <button 
                                onClick={() => handleGenerateLink(selectedLead)}
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
                                        onClick={() => { navigator.clipboard.writeText(claimLink); alert('Copied!'); }}
                                        className="px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                                <p className="text-slate-500 text-[10px] mt-2">Link expires in 7 days.</p>
                            </div>
                        )}
                    </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminLeads;
