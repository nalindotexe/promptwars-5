import React, { useState } from 'react';
import { CheckSquare, Search, Check } from 'lucide-react';
import type { VendorChecklist } from '../types';

interface VendorListProps {
  data: VendorChecklist;
}

export const VendorList: React.FC<VendorListProps> = ({ data }) => {
  // Store ticked categories by index or unique key
  const [checkedCategories, setCheckedCategories] = useState<Record<number, boolean>>({});

  const toggleCategory = (index: number) => {
    setCheckedCategories((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const completedCount = Object.values(checkedCategories).filter(Boolean).length;
  const totalCount = data.categories.length;

  return (
    <section
      aria-labelledby="vendor-heading"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <CheckSquare className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="vendor-heading" className="text-xl font-bold text-slate-100">
              Vendor Procurement Checklist
            </h2>
            <p className="text-xs text-slate-400">
              Interactive vendor sourcing list
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
          {completedCount} of {totalCount} completed
        </div>
      </div>

      <div className="space-y-4">
        {data.categories.map((vendor, index) => {
          const isDone = !!checkedCategories[index];
          const inputId = `vendor-checkbox-${index}`;

          return (
            <div
              key={index}
              onClick={() => toggleCategory(index)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isDone
                  ? 'bg-slate-900/50 border-emerald-500/40 opacity-75'
                  : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-800'
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
