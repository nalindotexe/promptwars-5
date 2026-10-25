import React, { useState } from 'react';
import { Download, Check, FileJson } from 'lucide-react';
import type { ConsolidatedPlan } from '../types';

interface ExportManagerProps {
  plan: ConsolidatedPlan;
}

export const ExportManager: React.FC<ExportManagerProps> = ({ plan }) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    try {
      const jsonContent = JSON.stringify(plan, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'event-plan.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error('Failed to trigger event-plan.json download', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      aria-label="Download Event Plan as JSON file"
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
    >
      {downloaded ? (
        <>
          <Check className="w-4 h-4 text-emerald-300 stroke-[2.5]" aria-hidden="true" />
          <span>Downloaded!</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Download Event Plan</span>
          <FileJson className="w-3.5 h-3.5 text-indigo-200 opacity-80" aria-hidden="true" />
        </>
      )}
    </button>
  );
};
