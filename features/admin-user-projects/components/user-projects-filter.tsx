import React from 'react';
import { Search } from 'lucide-react';

interface UserProjectsFilterProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

export default function UserProjectsFilter({ searchTerm, setSearchTerm }: UserProjectsFilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 bg-[#0f172a] p-4 rounded-2xl border border-white/5 shadow-lg">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by project, customer, or email..."
          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors"
        />
      </div>
    </div>
  );
}
