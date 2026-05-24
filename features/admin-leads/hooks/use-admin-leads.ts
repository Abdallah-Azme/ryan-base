import { useState, useEffect } from 'react';
import { leadStore, Lead } from '@/lib/leadStore';
import { useTranslation } from '@/lib/i18nContext';

export function useAdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [claimLink, setClaimLink] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const { language } = useTranslation();

  useEffect(() => {
    const unsubscribe = leadStore.subscribeToLeads(() => {
      setLeads(leadStore.getLeads());
    });
    return () => unsubscribe();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === 'all' ? lead.status !== 'deleted' : lead.status === statusFilter;
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
      if (lead.status !== 'approved') {
        await leadStore.updateLeadStatus(lead.id, 'approved');
      }

      const token = await leadStore.generateClaimToken(lead.id);
      const url = `${window.location.origin}/#/claim?token=${token}`;
      setClaimLink(url);
    } catch (e) {
      console.error(e);
      alert('Failed to generate link');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleUpdateStatus = async (status: Lead['status']) => {
    if (!selectedLead) return;
    if (status === 'rejected') {
      if (!rejectReason.trim()) return;
      await leadStore.updateLeadStatus(selectedLead.id, status, rejectReason.trim());
      setRejectReason('');
    } else {
      await leadStore.updateLeadStatus(selectedLead.id, status);
    }
    setSelectedLead(null);
  };

  const openLead = (lead: Lead) => {
    setSelectedLead(lead);
    setAssignedTo(lead.assignedTo || '');
    setReviewNotes(lead.reviewNotes || '');
    setRejectReason(lead.rejectReason || '');
  };

  const handleSaveReview = async () => {
    if (!selectedLead) return;
    await leadStore.updateLeadReview(selectedLead.id, {
      assignedTo: assignedTo.trim(),
      reviewNotes: reviewNotes.trim(),
    });
    setSelectedLead({
      ...selectedLead,
      assignedTo: assignedTo.trim(),
      reviewNotes: reviewNotes.trim(),
    });
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;
    if (
      !window.confirm(
        'Delete this lead?\n\nThis will hide it from the main list, but it will remain in the database.'
      )
    )
      return;
    try {
      await leadStore.deleteLead(selectedLead.id);
      setSelectedLead(null);
      alert('Lead moved to Deleted');
    } catch (e: any) {
      console.error(e);
      alert(`Failed to delete lead: ${e.message}`);
    }
  };

  const toWhatsAppDigits = (phone: string): string | null => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');

    if (digits.length === 8) return `965${digits}`;
    if (digits.length < 8) return null;

    return digits;
  };

  return {
    leads,
    selectedLead,
    setSelectedLead,
    openLead,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    claimLink,
    setClaimLink,
    isGeneratingLink,
    rejectReason,
    setRejectReason,
    assignedTo,
    setAssignedTo,
    reviewNotes,
    setReviewNotes,
    language,
    filteredLeads,
    handleGenerateLink,
    handleUpdateStatus,
    handleSaveReview,
    handleDeleteLead,
    toWhatsAppDigits,
  };
}
