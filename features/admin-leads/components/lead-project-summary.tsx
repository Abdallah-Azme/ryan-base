import React from 'react';
import { Lead } from '@/lib/leadStore';

interface LeadProjectSummaryProps {
  projectPayload: Lead['projectPayload'];
}

export default function LeadProjectSummary({ projectPayload }: LeadProjectSummaryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
        Project Details
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-800/30 p-3 rounded-lg">
          <span className="text-slate-500 block text-xs mb-1">Industry</span>
          <span className="text-white">
            {projectPayload.industry}{' '}
            {projectPayload.industryOther ? `(${projectPayload.industryOther})` : ''}
          </span>
        </div>
        <div className="bg-slate-800/30 p-3 rounded-lg">
          <span className="text-slate-500 block text-xs mb-1">Service Model</span>
          <span className="text-white">{projectPayload.serviceModel}</span>
        </div>
        <div className="bg-slate-800/30 p-3 rounded-lg">
          <span className="text-slate-500 block text-xs mb-1">Target Markets</span>
          <span className="text-white">{projectPayload.markets.join(', ')}</span>
        </div>
        <div className="bg-slate-800/30 p-3 rounded-lg">
          <span className="text-slate-500 block text-xs mb-1">Platforms</span>
          <span className="text-white">{projectPayload.platforms.join(', ')}</span>
        </div>
      </div>

      <div className="bg-slate-800/30 p-4 rounded-lg">
        <span className="text-slate-500 block text-xs mb-2">Description</span>
        <p className="text-slate-300 leading-relaxed text-sm">{projectPayload.description}</p>
      </div>
    </div>
  );
}
