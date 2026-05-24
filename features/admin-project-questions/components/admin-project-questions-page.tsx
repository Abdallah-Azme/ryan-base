"use client";

import React from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  GripVertical,
  ListChecks,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import Button from '@/components/ui/button';
import ConfirmModal from '@/components/ui/confirm-modal';
import {
  ProjectQuestion,
  ProjectQuestionType,
  useAdminProjectQuestions,
} from '../hooks/use-admin-project-questions';

const inputClasses =
  'w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary focus:outline-none transition-colors';

const questionTypes: { value: ProjectQuestionType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'single_select', label: 'Single select' },
  { value: 'multi_select', label: 'Multi select' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'color', label: 'Color' },
  { value: 'reference_app', label: 'Reference app' },
];

const optionTypes: ProjectQuestionType[] = ['single_select', 'multi_select'];

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs text-slate-400 font-medium ms-1">{children}</label>
);

function QuestionRow({
  question,
  index,
  total,
  isActive,
  onEdit,
  onMove,
  onDelete,
}: {
  question: ProjectQuestion;
  index: number;
  total: number;
  isActive: boolean;
  onEdit: (question: ProjectQuestion) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        isActive ? 'bg-primary/10 border-primary/30' : 'bg-slate-900/50 border-white/5'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="mt-1 text-slate-500">
          <GripVertical size={16} />
        </div>
        <button type="button" onClick={() => onEdit(question)} className="text-left min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white break-words">{question.label}</h3>
            <span className="text-[10px] text-slate-300 bg-slate-800 border border-white/5 rounded-full px-2 py-0.5">
              {question.type.replace('_', ' ')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className={question.active ? 'text-emerald-400' : 'text-slate-500'}>
              {question.active ? 'Active' : 'Inactive'}
            </span>
            <span className={question.required ? 'text-primary' : 'text-slate-500'}>
              {question.required ? 'Required' : 'Optional'}
            </span>
            {question.locked ? <span className="text-amber-400">Locked</span> : null}
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0 sm:self-start self-end">
          <button
            type="button"
            onClick={() => onMove(question.id, -1)}
            disabled={index === 0}
            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40"
            title="Move up"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => onMove(question.id, 1)}
            disabled={index === total - 1}
            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40"
            title="Move down"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(question.id)}
            disabled={question.locked}
            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40"
            title="Delete question"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionPreview({
  label,
  type,
  optionsText,
  required,
}: {
  label: string;
  type: ProjectQuestionType;
  optionsText: string;
  required: boolean;
}) {
  const options = optionsText
    .split('\n')
    .map((line) => line.split('|')[0].trim())
    .filter(Boolean);

  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Eye size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Client Preview</h2>
          <p className="text-xs text-slate-500">A compact preview of the wizard question.</p>
        </div>
      </div>
      <div className="bg-[#020617] border border-white/5 rounded-2xl p-5">
        <p className="text-lg font-bold text-white leading-snug">
          {label || 'Question label'}
          {required ? <span className="text-primary"> *</span> : null}
        </p>
        <div className="mt-5">
          {type === 'textarea' ? <div className="h-28 rounded-xl bg-slate-900 border border-white/10" /> : null}
          {type === 'text' || type === 'reference_app' ? (
            <div className="h-12 rounded-xl bg-slate-900 border border-white/10" />
          ) : null}
          {type === 'yes_no' ? (
            <div className="grid grid-cols-2 gap-3">
              {['Yes', 'No'].map((item) => (
                <div key={item} className="rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          ) : null}
          {type === 'color' ? (
            <div className="flex gap-3">
              {['#1DB7F0', '#22C55E', '#F59E0B', '#EF4444'].map((color) => (
                <div key={color} className="w-10 h-10 rounded-full border border-white/10" style={{ background: color }} />
              ))}
            </div>
          ) : null}
          {optionTypes.includes(type) ? (
            <div className="space-y-2">
              {(options.length ? options : ['Option one', 'Option two']).map((option) => (
                <div key={option} className="rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm text-slate-300">
                  {option}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AdminProjectQuestionsPage() {
  const state = useAdminProjectQuestions();

  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-500">
        <Loader2 size={32} className="animate-spin mb-4 text-primary" />
        <p>Loading project questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Questions</h1>
          <p className="text-slate-400 text-sm">Manage the client project request wizard questions and options.</p>
        </div>
        <Button type="button" onClick={state.startCreate} className="gap-2">
          <Plus size={18} />
          Add Question
        </Button>
      </div>

      {state.error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={20} />
          <p className="text-red-400/80 text-sm">{state.error}</p>
          <button type="button" onClick={() => state.setError(null)} className="ms-auto text-red-300">
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 h-fit">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Question Order</h2>
            <span className="text-xs text-slate-500 bg-slate-900/70 border border-white/5 rounded-full px-3 py-1">
              {state.questions.length} total
            </span>
          </div>

          {state.questions.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <ListChecks size={30} className="mx-auto mb-3 text-slate-600" />
              <p>No project questions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.questions.map((question, index) => (
                <QuestionRow
                  key={question.id}
                  question={question}
                  index={index}
                  total={state.questions.length}
                  isActive={state.selectedQuestion?.id === question.id}
                  onEdit={state.startEdit}
                  onMove={state.moveQuestion}
                  onDelete={state.setDeleteId}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <ListChecks size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {state.selectedQuestion ? 'Edit Question' : 'Add Question'}
                </h2>
                <p className="text-xs text-slate-500">Use one option per line. Add Arabic after a pipe character.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <FieldLabel>English Label</FieldLabel>
                  <input
                    value={state.form.label}
                    onChange={(e) => state.setForm((prev) => ({ ...prev, label: e.target.value }))}
                    className={inputClasses}
                    placeholder="What platforms do you need?"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Arabic Label</FieldLabel>
                  <input
                    value={state.form.labelAr}
                    onChange={(e) => state.setForm((prev) => ({ ...prev, labelAr: e.target.value }))}
                    className={inputClasses}
                    placeholder="Arabic label"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <FieldLabel>Question Type</FieldLabel>
                  <select
                    value={state.form.type}
                    onChange={(e) => state.setForm((prev) => ({ ...prev, type: e.target.value as ProjectQuestionType }))}
                    className={inputClasses}
                  >
                    {questionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:pt-6">
                  {[
                    ['required', 'Required'],
                    ['active', 'Active'],
                    ['locked', 'Locked'],
                  ].map(([key, label]) => {
                    const checked = state.form[key as 'required' | 'active' | 'locked'];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          state.setForm((prev) => ({
                            ...prev,
                            [key]: !checked,
                          }))
                        }
                        className={`rounded-xl border px-3 py-2 text-xs font-bold flex items-center justify-center gap-1 ${
                          checked
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-slate-900 text-slate-500 border-white/5'
                        }`}
                      >
                        {checked ? <Check size={13} /> : <X size={13} />}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {optionTypes.includes(state.form.type) ? (
                <div className="space-y-2">
                  <FieldLabel>Options</FieldLabel>
                  <textarea
                    value={state.form.optionsText}
                    onChange={(e) => state.setForm((prev) => ({ ...prev, optionsText: e.target.value }))}
                    className={`${inputClasses} h-36 resize-none`}
                    placeholder={'iOS | ايفون\nAndroid | اندرويد\nWeb | ويب'}
                  />
                </div>
              ) : null}

              <Button
                type="button"
                onClick={state.saveQuestion}
                isLoading={state.saving}
                disabled={!state.form.label.trim()}
                className="gap-2"
              >
                <Save size={16} />
                Save Question
              </Button>
            </div>
          </div>

          <QuestionPreview
            label={state.form.label}
            type={state.form.type}
            optionsText={state.form.optionsText}
            required={state.form.required}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={!!state.deleteId}
        title="Delete Question?"
        message="This removes the question from the project request wizard configuration."
        confirmText="Delete Question"
        isDestructive
        onConfirm={state.deleteQuestion}
        onCancel={() => state.setDeleteId(null)}
      />
    </div>
  );
}
