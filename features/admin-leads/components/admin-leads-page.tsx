import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAdminLeads } from '../hooks/use-admin-leads';
import LeadsFilterBar from './leads-filter-bar';
import LeadsTable from './leads-table';
import LeadDetailDrawer from './lead-detail-drawer';

export default function AdminLeadsPage() {
  const {
    selectedLead,
    setSelectedLead,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    claimLink,
    setClaimLink,
    isGeneratingLink,
    language,
    filteredLeads,
    handleGenerateLink,
    handleUpdateStatus,
    handleDeleteLead,
    toWhatsAppDigits,
  } = useAdminLeads();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 text-sm">Manage incoming project requests.</p>
        </div>
      </div>

      <LeadsFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <LeadsTable
        filteredLeads={filteredLeads}
        onSelectLead={setSelectedLead}
        toWhatsAppDigits={toWhatsAppDigits}
      />

      <AnimatePresence>
        {selectedLead ? (
          <LeadDetailDrawer
            selectedLead={selectedLead}
            onClose={() => {
              setSelectedLead(null);
              setClaimLink(null);
            }}
            language={language}
            toWhatsAppDigits={toWhatsAppDigits}
            onUpdateStatus={handleUpdateStatus}
            onDeleteLead={handleDeleteLead}
            claimLink={claimLink}
            isGeneratingLink={isGeneratingLink}
            onGenerateLink={handleGenerateLink}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
