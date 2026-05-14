import React from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

interface ChatInputBarProps {
  inputText: string;
  onChangeInput: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  placeholder: string;
  dir: string;
  composerRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatInputBar({
  inputText,
  onChangeInput,
  onKeyDown,
  onSend,
  placeholder,
  dir,
  composerRef,
}: ChatInputBarProps) {
  return (
    <div ref={composerRef} className="absolute left-0 right-0 z-40 px-4" style={{ bottom: 'calc(var(--tabbar-h, 80px) + 5px)' }}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-900/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.4)] flex items-end gap-2 max-w-[430px] mx-auto"
      >
        <textarea
          value={inputText}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={1}
          dir={dir}
          className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-sm py-3 focus:outline-none resize-none max-h-24 no-scrollbar"
          style={{ minHeight: '44px' }}
        />

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={onSend}
          disabled={!inputText.trim()}
          className={`p-3 rounded-xl transition-all duration-300 shrink-0 ${
            inputText.trim() ? 'bg-primary text-white shadow-[0_0_15px_rgba(29,183,240,0.4)]' : 'bg-slate-800 text-slate-500'
          }`}
        >
          {dir === 'rtl' ? <Send size={20} className="scale-x-[-1]" /> : <Send size={20} />}
        </motion.button>
      </motion.div>
    </div>
  );
}
