import React from 'react';
import { Lead } from '@/lib/leadStore';
import LeadsTableRow from './leads-table-row';

interface LeadsTableProps {
  filteredLeads: Lead[];
  onSelectLead: (lead: Lead) => void;
  toWhatsAppDigits: (phone: string) => string | null;
}

export default function LeadsTable({ filteredLeads, onSelectLead, toWhatsAppDigits }: LeadsTableProps) {
  return (
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
              {filteredLeads.map((lead) => (
                <LeadsTableRow
                  key={lead.id}
                  lead={lead}
                  onSelectLead={onSelectLead}
                  toWhatsAppDigits={toWhatsAppDigits}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
