"use client";

import React from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, Briefcase, Check, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import Button from '@/components/ui/button';
import ConfirmModal from '@/components/ui/confirm-modal';
import { ProjectType, useAdminProjectTypes } from '../hooks/use-admin-project-types';

const inputClasses =
  'w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary focus:outline-none transition-colors';

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs text-slate-400 font-medium ms-1">{children}</label>
);

function TypeCard({
  type,
  index,
  total,
  isEditing,
  onEdit,
  onMove,
  onDelete,
}: {
  type: ProjectType;
  index: number;
  total: number;
  isEditing: boolean;
  onEdit: (type: ProjectType) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        isEditing ? 'bg-primary/10 border-primary/30' : 'bg-slate-900/50 border-white/5'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <button type="button" onClick={() => onEdit(type)} className="text-left min-w-0 flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center text-white shrink-0"
            style={{ background: type.color || '#1DB7F0' }}
          >
            <Briefcase size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-white font-bold break-words">{type.name}</h3>
              <span className={type.active ? 'text-[10px] text-emerald-400' : 'text-[10px] text-slate-500'}>
                {type.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-slate-400 line-clamp-2 mt-1">{type.description || 'No description added.'}</p>
            <p className="text-xs text-slate-500 mt-2">
              {type.priceMin || type.priceMax ? `${type.priceMin || 0}-${type.priceMax || 0} KWD` : 'No price range'} ·{' '}
              {type.durationMin || type.durationMax
                ? `${type.durationMin || 0}-${type.durationMax || 0} days`
                : 'No duration range'}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0 sm:self-start self-end">
          <button
            type="button"
            onClick={() => onMove(type.id, -1)}
            disabled={index === 0}
            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40"
            title="Move up"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => onMove(type.id, 1)}
            disabled={index === total - 1}
            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40"
            title="Move down"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(type.id)}
            className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            title="Delete type"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProjectTypesPage() {
  const state = useAdminProjectTypes();

  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-500">
        <Loader2 size={32} className="animate-spin mb-4 text-primary" />
        <p>Loading project types...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Types</h1>
          <p className="text-slate-400 text-sm">Manage service categories available to project requests.</p>
        </div>
        <Button type="button" onClick={state.startCreate} className="gap-2">
          <Plus size={18} />
          Add Type
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

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-3">
          {state.types.length === 0 ? (
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-16 text-center text-slate-500">
              <Briefcase size={32} className="mx-auto mb-3 text-slate-600" />
              <p>No project types yet.</p>
            </div>
          ) : (
            state.types.map((type, index) => (
              <TypeCard
                key={type.id}
                type={type}
                index={index}
                total={state.types.length}
                isEditing={state.editingId === type.id}
                onEdit={state.startEdit}
                onMove={state.moveType}
                onDelete={state.setDeleteId}
              />
            ))
          )}
        </div>

        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 h-fit sticky top-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Briefcase size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{state.editingId ? 'Edit Type' : 'Add Type'}</h2>
              <p className="text-xs text-slate-500">Optional estimates help admins price requests faster.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <FieldLabel>Name</FieldLabel>
                <input
                  value={state.form.name}
                  onChange={(e) => state.setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={inputClasses}
                  placeholder="E-commerce app"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Arabic Name</FieldLabel>
                <input
                  value={state.form.nameAr}
                  onChange={(e) => state.setForm((prev) => ({ ...prev, nameAr: e.target.value }))}
                  className={inputClasses}
                  placeholder="Arabic name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>Description</FieldLabel>
              <textarea
                value={state.form.description}
                onChange={(e) => state.setForm((prev) => ({ ...prev, description: e.target.value }))}
                className={`${inputClasses} h-24 resize-none`}
                placeholder="What this project type includes."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <FieldLabel>Min Price</FieldLabel>
                <input
                  type="number"
                  value={state.form.priceMin}
                  onChange={(e) => state.setForm((prev) => ({ ...prev, priceMin: e.target.value }))}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Max Price</FieldLabel>
                <input
                  type="number"
                  value={state.form.priceMax}
                  onChange={(e) => state.setForm((prev) => ({ ...prev, priceMax: e.target.value }))}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Min Days</FieldLabel>
                <input
                  type="number"
                  value={state.form.durationMin}
                  onChange={(e) => state.setForm((prev) => ({ ...prev, durationMin: e.target.value }))}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Max Days</FieldLabel>
                <input
                  type="number"
                  value={state.form.durationMax}
                  onChange={(e) => state.setForm((prev) => ({ ...prev, durationMax: e.target.value }))}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
              <div className="space-y-2">
                <FieldLabel>Color</FieldLabel>
                <input
                  type="color"
                  value={state.form.color}
                  onChange={(e) => state.setForm((prev) => ({ ...prev, color: e.target.value }))}
                  className="w-full h-12 bg-slate-900 border border-white/10 rounded-xl p-1"
                />
              </div>
              <button
                type="button"
                onClick={() => state.setForm((prev) => ({ ...prev, active: !prev.active }))}
                className={`h-12 rounded-xl border px-4 text-sm font-bold flex items-center gap-2 ${
                  state.form.active
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-slate-900 text-slate-500 border-white/5'
                }`}
              >
                {state.form.active ? <Check size={15} /> : <X size={15} />}
                Active
              </button>
            </div>

            <Button
              type="button"
              onClick={state.saveType}
              isLoading={state.saving}
              disabled={!state.form.name.trim()}
              className="w-full gap-2"
            >
              <Save size={16} />
              Save Type
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!state.deleteId}
        title="Delete Project Type?"
        message="This removes the type from dashboard configuration."
        confirmText="Delete Type"
        isDestructive
        onConfirm={state.deleteType}
        onCancel={() => state.setDeleteId(null)}
      />
    </div>
  );
}
