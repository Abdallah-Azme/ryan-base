import React, { useEffect } from 'react';
import { Send } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { chatInputSchema, ChatInputValues } from '../schemas/chat-input.schema';

interface AdminChatInputProps {
  inputText: string;
  setInputText: (val: string) => void;
  onSend: (e?: React.FormEvent) => void;
}

export default function AdminChatInput({ inputText, setInputText, onSend }: AdminChatInputProps) {
  const form = useForm<ChatInputValues>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: { text: inputText },
  });

  useEffect(() => {
    if (inputText !== form.getValues('text')) {
      form.setValue('text', inputText);
    }
  }, [inputText, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.text !== undefined) {
        setInputText(value.text);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setInputText]);

  const handleSubmit = (data: ChatInputValues) => {
    // We construct a fake event to pass to onSend since it expects one
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    onSend(fakeEvent);
  };

  const isInvalid = !form.watch('text')?.trim();

  return (
    <div className="p-4 bg-slate-900 border-t border-white/5">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex gap-2">
        <Controller
          name="text"
          control={form.control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder="Type a reply..."
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
          )}
        />
        <button
          type="submit"
          disabled={isInvalid}
          className="bg-primary hover:bg-sky-400 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
