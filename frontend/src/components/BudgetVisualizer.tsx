import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import type { BudgetResponse } from '../types';

interface BudgetVisualizerProps {
  data: BudgetResponse;
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

export const BudgetVisualizer: React.FC<BudgetVisualizerProps> = ({ data }) => {
  const chartData = data.items.map((item, index) => ({
    name: item.name,
    value: item.allocated_amount,
    percentage: item.percentage,
    color: PALETTE[index % PALETTE.length],
  }));

  const totalAllocated = data.items.reduce(
    (sum, item) => sum + item.allocated_amount,
    0
  );

  return (
    <section
      aria-labelledby="budget-heading"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <PieChartIcon className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="budget-heading" className="text-xl font-bold text-slate-100">
              Budget Allocation
            </h2>
            <p className="text-xs text-slate-400">
              Total Planned Expenditure
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total
          </span>
          <span className="text-xl font-extrabold text-emerald-400 flex items-center justify-end">
            <DollarSign className="w-4 h-4" aria-hidden="true" />
            {totalAllocated.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* Chart Visualizer */}
      <div
        className="w-full h-64 sm:h-72"
        role="region"
        aria-label="Budget Breakdown Chart"
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

      {/* Structured Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm text-slate-200">
          <caption className="sr-only">Detailed breakdown of event budget line items</caption>
          <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" className="px-4 py-3 text-right">Amount ($)</th>
              <th scope="col" className="px-4 py-3 text-right">Share (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/60">
            {data.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-2.5 font-medium flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-slate-100">
                  ${item.allocated_amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
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
