import React from 'react';
import { Search } from 'lucide-react';

interface LeadsFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export default function LeadsFilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: LeadsFilterBarProps) {
  return (
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
        {['all', 'new', 'reviewing', 'approved', 'claimed', 'rejected', 'deleted'].map((status) => (
          <button
            type="button"
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
  );
}
