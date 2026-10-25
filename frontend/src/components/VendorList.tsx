import React, { useState } from 'react';
import { CheckSquare, Search, Check, AlertTriangle, Loader2 } from 'lucide-react';
import type { VendorChecklist } from '../types';

interface VendorListProps {
  data?: VendorChecklist | null;
  isLoading?: boolean;
  error?: string | null;
}

export const VendorList: React.FC<VendorListProps> = ({
  data,
  isLoading = false,
  error = null,
}) => {
  // Store ticked categories by index
  const [checkedCategories, setCheckedCategories] = useState<Record<number, boolean>>({});

  // Loading Card State
  if (isLoading) {
    return (
      <section
        aria-labelledby="vendor-loading-heading"
        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl min-h-[300px] flex flex-col justify-between"
      >
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <CheckSquare className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h2 id="vendor-loading-heading" className="text-xl font-bold text-slate-100">
              Vendor Procurement Checklist
            </h2>
            <p className="text-xs text-slate-400">Sourcing categories and targeted search queries...</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-300">
            Vendor Agent gathering tailored category contacts...
          </p>
          <p className="text-xs text-slate-500">Creating search term keywords for local outreach</p>
        </div>
      </section>
    );
  }

  // Error Card State
  if (error || !data) {
    return (
      <section
        aria-labelledby="vendor-error-heading"
        className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 sm:p-7 shadow-xl min-h-[300px] flex flex-col justify-between"
      >
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="vendor-error-heading" className="text-xl font-bold text-slate-100">
              Vendor Checklist Notice
            </h2>
            <p className="text-xs text-slate-400">Procurement status</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm space-y-1">
          <p className="font-semibold">Unable to load vendor checklist</p>
          <p className="text-xs text-red-300/80">
            {error || 'Vendor checklist generation delayed due to high demand. Please try again.'}
          </p>
        </div>
      </section>
    );
  }

  const toggleCategory = (index: number) => {
    setCheckedCategories((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const totalCount = data.categories.length;
  const completedCount = Object.values(checkedCategories).filter(Boolean).length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <section
      aria-labelledby="vendor-heading"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6 animate-in fade-in duration-300"
    >
      {/* Header and Progress Bar */}
      <div className="space-y-4 border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <CheckSquare className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="vendor-heading" className="text-xl font-bold text-slate-100">
                Vendor Procurement Checklist
              </h2>
              <p className="text-xs text-slate-400">
                Track vendor contacts, bookings, and outreach progress
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Outreach Progress
            </span>
            <span className="text-sm font-bold text-cyan-300">
              {completedCount} of {totalCount} completed ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
            <div
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Vendor checklist completion progress"
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3.5">
        {data.categories.map((vendor, index) => {
          const isDone = !!checkedCategories[index];
          const inputId = `vendor-checkbox-${index}`;

          return (
            <div
              key={index}
              onClick={() => toggleCategory(index)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isDone
                  ? 'bg-slate-900/60 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="pt-0.5">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleCategory(index)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Mark ${vendor.category} as contacted`}
                    className="sr-only"
                  />
                  <div
                    aria-hidden="true"
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                        : 'border-slate-600 bg-slate-900/80 hover:border-slate-400'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={inputId}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-base font-semibold block cursor-pointer transition-colors ${
                        isDone
                          ? 'line-through text-slate-400'
                          : 'text-slate-100 hover:text-cyan-300'
                      }`}
                    >
                      {vendor.category}
                    </label>
                    {isDone && (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Contacted
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
                      <Search className="w-3 h-3 text-cyan-400" aria-hidden="true" />
                      Search terms:
                    </span>
                    {vendor.suggested_search_terms.map((term, termIdx) => (
                      <span
                        key={termIdx}
                        className="inline-block text-xs bg-slate-800 border border-slate-700/80 text-slate-300 px-2.5 py-0.5 rounded-md"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
