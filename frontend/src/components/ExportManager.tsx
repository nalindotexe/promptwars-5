import React, { useState } from 'react';
import axios from 'axios';
import { Download, Check, FileText, Loader2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface ExportManagerProps {
  planData: {
    event_info?: {
      event_type: string;
      budget: number;
      guest_count: number;
      date: string;
      location: string;
      vibe: string;
    };
    budget?: unknown;
    timeline?: unknown;
    vendors?: unknown;
    ideas?: unknown;
  };
  fileName?: string;
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  planData,
  fileName = 'Event_Plan.pdf',
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportPdf = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setIsSuccess(false);
    setExportError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/export-pdf`,
        planData,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 45000,
        }
      );

      // Create a blob URL and trigger download via a hidden <a> tag
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      // Clean up link and object URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Failed to export PDF from backend:', err);
      if (axios.isAxiosError(err)) {
        setExportError(err.response?.statusText || err.message);
      } else if (err instanceof Error) {
        setExportError(err.message);
      } else {
        setExportError('Unable to generate PDF from server.');
      }
    } finally {
      // Guaranteed UI unlock
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleExportPdf}
        disabled={isExporting}
        aria-label="Download Event Plan as formatted PDF"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-900/60 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
            <span>Generating PDF...</span>
          </>
        ) : isSuccess ? (
          <>
            <Check className="w-4 h-4 text-emerald-300 stroke-[2.5]" aria-hidden="true" />
            <span>PDF Downloaded!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Download Event Plan</span>
            <FileText className="w-3.5 h-3.5 text-indigo-200 opacity-90" aria-hidden="true" />
          </>
        )}
      </button>

      {exportError && (
        <span className="text-xs text-red-400 flex items-center gap-1 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {exportError}
        </span>
      )}
    </div>
  );
};
