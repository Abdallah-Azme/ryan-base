import React from 'react';
import { Phone, MessageCircle, Eye } from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import { Lead } from '@/lib/leadStore';

interface LeadsTableRowProps {
  lead: Lead;
  onSelectLead: (lead: Lead) => void;
  toWhatsAppDigits: (phone: string) => string | null;
}

export default function LeadsTableRow({ lead, onSelectLead, toWhatsAppDigits }: LeadsTableRowProps) {
  const waDigits = toWhatsAppDigits(lead.phone);
  const waMessage =
    'السلام عليكم ورحمة الله وبركاته\nحضرتك قدمت عندنا طلب تطبيق ، طلبك مقبول ان شاء الله ممكن تفاصيل اكثر عن المشروع';
  const encodedWaMessage = encodeURIComponent(waMessage);

  const waUrl = waDigits
    ? `https://web.whatsapp.com/send/?phone=${waDigits}&text=${encodedWaMessage}&type=phone_number&app_absent=0`
    : null;

  return (
    <tr className="hover:bg-white/[0.02] transition-colors group">
      <td className="p-5">
        <div className="flex items-center gap-3">
          <Avatar name={lead.name} size="md" className="w-10 h-10 text-sm" />
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
        <span
          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
            lead.status === 'new'
              ? 'bg-blue-500/10 text-blue-400'
              : lead.status === 'approved'
              ? 'bg-emerald-500/10 text-emerald-400'
              : lead.status === 'rejected'
              ? 'bg-red-500/10 text-red-400'
              : lead.status === 'claimed'
              ? 'bg-purple-500/10 text-purple-400'
              : lead.status === 'deleted'
              ? 'bg-slate-800 text-slate-500 line-through'
              : 'bg-slate-700 text-slate-300'
          }`}
        >
          {lead.status}
        </span>
      </td>
      <td className="p-5 text-slate-400 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</td>
      <td className="p-5 text-right">
        <div className="flex items-center justify-end gap-2">
          <a
            href={waUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!waUrl) e.preventDefault();
            }}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              waUrl
                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                : 'bg-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
            }`}
            title={waUrl ? 'Chat on WhatsApp Web' : 'No Phone'}
          >
            <MessageCircle size={16} />
          </a>

          <button
            type="button"
            onClick={() => onSelectLead(lead)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <Eye size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
