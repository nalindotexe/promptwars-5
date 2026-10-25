import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  DollarSign,
  PieChart as PieChartIcon,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import type { BudgetResponse, BudgetItem } from '../types';

interface BudgetVisualizerProps {
  data?: BudgetResponse | null;
  targetBudget?: number;
  isLoading?: boolean;
  error?: string | null;
}

const PALETTE = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#f97316', // Orange
  '#14b8a6', // Teal
];

export const BudgetVisualizer: React.FC<BudgetVisualizerProps> = ({
  data,
  targetBudget: propTargetBudget,
  isLoading = false,
  error = null,
}) => {
  // Local state initialized with the generated items
  const [items, setItems] = useState<BudgetItem[]>(data?.items || []);

  // Sync state if new data arrives
  useEffect(() => {
    if (data?.items) {
      setItems(data.items);
    }
  }, [data]);

  // Loading Card State
  if (isLoading) {
    return (
      <section
        aria-labelledby="budget-loading-heading"
        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl min-h-[380px] flex flex-col justify-between"
      >
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <PieChartIcon className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h2 id="budget-loading-heading" className="text-xl font-bold text-slate-100">
              Budget Allocation
            </h2>
            <p className="text-xs text-slate-400">Synthesizing category breakdown...</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-300">
            Finance Agent calculating optimal budget allocation...
          </p>
          <p className="text-xs text-slate-500">Checking mathematical contingency balance</p>
        </div>
      </section>
    );
  }

  // Error Card State
  if (error || !data) {
    return (
      <section
        aria-labelledby="budget-error-heading"
        className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 sm:p-7 shadow-xl min-h-[380px] flex flex-col justify-between"
      >
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="budget-error-heading" className="text-xl font-bold text-slate-100">
              Budget Allocation Notice
            </h2>
            <p className="text-xs text-slate-400">Financial computation status</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm space-y-1">
          <p className="font-semibold">Unable to load budget</p>
          <p className="text-xs text-red-300/80">
            {error || 'Budget generation delayed due to high demand. Please try again.'}
          </p>
        </div>
      </section>
    );
  }

  // Compute baseline target budget (either from prop or initial sum of items)
  const initialTotal = data.items.reduce(
    (sum, item) => sum + item.allocated_amount,
    0
  );
  const targetBudget =
    typeof propTargetBudget === 'number' && propTargetBudget > 0
      ? propTargetBudget
      : initialTotal;

  // Current total of editable items
  const currentTotal = items.reduce(
    (sum, item) => sum + (Number(item.allocated_amount) || 0),
    0
  );

  const budgetDifference = targetBudget - currentTotal;
  const isOverBudget = budgetDifference < -0.01;
  const hasRemaining = budgetDifference > 0.01;
  const isBalanced = Math.abs(budgetDifference) <= 0.01;

  // Handle amount edit for a row
  const handleAmountChange = (index: number, newAmountStr: string) => {
    const rawVal = Number(newAmountStr);
    const newAmount = isNaN(rawVal) ? 0 : Math.max(0, rawVal);

    setItems((prevItems) => {
      const updated = [...prevItems];
      const prev = updated[index];
      updated[index] = {
        ...prev,
        allocated_amount: newAmount,
      };

      const basis = targetBudget > 0 ? targetBudget : 1;
      return updated.map((it) => ({
        ...it,
        percentage: Number(((it.allocated_amount / basis) * 100).toFixed(1)),
      }));
    });
  };

  const chartData = items.map((item, index) => ({
    name: item.name,
    value: Math.max(0, item.allocated_amount),
    percentage: item.percentage,
    color: PALETTE[index % PALETTE.length],
  }));

  return (
    <section
      aria-labelledby="budget-heading"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6 flex flex-col justify-between animate-in fade-in duration-300"
    >
      {/* Header and Status Warning */}
      <div className="space-y-4 border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <PieChartIcon className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="budget-heading" className="text-xl font-bold text-slate-100">
                Interactive Budget Planner
              </h2>
              <p className="text-xs text-slate-400">
                Modify line item amounts below to simulate real-time adjustments
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Allocated / Target
            </span>
            <span className="text-lg font-bold text-slate-100 flex items-center justify-end">
              ${currentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs text-slate-400 ml-1">
                / ${targetBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </span>
          </div>
        </div>

        {/* Dynamic Budget Alert Banner */}
        {isOverBudget && (
          <div
            role="alert"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-sm font-medium animate-in fade-in"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <span className="font-bold">Over Budget Warning: </span>
              Allocations exceed target by{' '}
              <span className="font-mono font-bold text-white">
                ${Math.abs(budgetDifference).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>.
            </div>
          </div>
        )}

        {hasRemaining && (
          <div
            role="status"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-sm font-medium animate-in fade-in"
          >
            <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <span className="font-bold">Remaining Unallocated Budget: </span>
              <span className="font-mono font-bold text-white">
                ${budgetDifference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>{' '}
              is available to allocate.
            </div>
          </div>
        )}

        {isBalanced && (
          <div
            role="status"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-sm font-medium animate-in fade-in"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <span className="font-bold">Budget Balanced: </span>
              100% of your target budget is precisely allocated.
            </div>
          </div>
        )}
      </div>

      {/* Chart Visualizer */}
      <div
        className="w-full h-64 sm:h-72"
        role="region"
        aria-label="Interactive Budget Breakdown Chart"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: unknown) => [
                typeof val === 'number'
                  ? `$${val.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : String(val),
                'Allocated',
              ]}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              }}
              itemStyle={{ color: '#e2e8f0', fontSize: '0.875rem' }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Editable Structured Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm text-slate-200">
          <caption className="sr-only">Detailed editable breakdown of event budget line items</caption>
          <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" className="px-4 py-3 text-right">Editable Amount ($)</th>
              <th scope="col" className="px-4 py-3 text-right">Share (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/60">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-2.5 font-medium flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="inline-flex items-center relative max-w-[140px] ml-auto">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" aria-hidden="true" />
                    <input
                      type="number"
                      min="0"
                      step="50"
                      aria-label={`Allocated budget for ${item.name}`}
                      value={item.allocated_amount === 0 ? '' : item.allocated_amount}
                      placeholder="0"
                      onChange={(e) => handleAmountChange(idx, e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-right font-mono text-slate-100 rounded-lg pl-7 pr-2.5 py-1 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-indigo-300">
                  {item.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
