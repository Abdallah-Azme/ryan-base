import React from 'react';
import { Send } from 'lucide-react';

interface AdminChatInputProps {
  inputText: string;
  setInputText: (val: string) => void;
  onSend: (e?: React.FormEvent) => void;
}

export default function AdminChatInput({ inputText, setInputText, onSend }: AdminChatInputProps) {
  return (
    <div className="p-4 bg-slate-900 border-t border-white/5">
      <form onSubmit={onSend} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a reply..."
          className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-primary hover:bg-sky-400 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
