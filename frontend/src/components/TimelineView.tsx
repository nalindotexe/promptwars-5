import React from 'react';
import { CalendarClock, AlertTriangle, Clock, Flag, Loader2 } from 'lucide-react';
import type { TimelineResponse } from '../types';

interface TimelineViewProps {
  data?: TimelineResponse | null;
  isLoading?: boolean;
  error?: string | null;
}

const getPriorityBadge = (priority: 'High' | 'Medium' | 'Low' | string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return {
        badgeClass: 'bg-red-500/10 text-red-400 border-red-500/30',
        dotClass: 'bg-red-500',
        icon: AlertTriangle,
      };
    case 'medium':
      return {
        badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        dotClass: 'bg-amber-500',
        icon: Clock,
      };
    case 'low':
    default:
      return {
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-500',
        icon: Flag,
      };
  }
};

export const TimelineView: React.FC<TimelineViewProps> = ({
  data,
  isLoading = false,
  error = null,
}) => {
  // Loading Card State
  if (isLoading) {
    return (
      <section
        aria-labelledby="timeline-loading-heading"
        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl min-h-[380px] flex flex-col justify-between"
      >
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <CalendarClock className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h2 id="timeline-loading-heading" className="text-xl font-bold text-slate-100">
              Chronological Milestones
            </h2>
            <p className="text-xs text-slate-400">Synthesizing execution timeline...</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-300">
            Timeline Agent drafting phased milestones...
          </p>
          <p className="text-xs text-slate-500">Prioritizing critical paths leading to event day</p>
        </div>
      </section>
    );
  }

  // Error Card State
  if (error || !data) {
    return (
      <section
        aria-labelledby="timeline-error-heading"
        className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 sm:p-7 shadow-xl min-h-[380px] flex flex-col justify-between"
      >
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="timeline-error-heading" className="text-xl font-bold text-slate-100">
              Timeline Notice
            </h2>
            <p className="text-xs text-slate-400">Milestone schedule status</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm space-y-1">
          <p className="font-semibold">Unable to load timeline milestones</p>
          <p className="text-xs text-red-300/80">
            {error || 'Timeline generation delayed due to high demand. Please try again.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="timeline-heading"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6 animate-in fade-in duration-300"
    >
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <CalendarClock className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id="timeline-heading" className="text-xl font-bold text-slate-100">
            Chronological Milestones
          </h2>
          <p className="text-xs text-slate-400">
            Action items and execution deadlines
          </p>
        </div>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {data.milestones.map((milestone, index) => {
          const { badgeClass, dotClass, icon: Icon } = getPriorityBadge(
            milestone.priority
          );

          return (
            <div key={index} className="relative group">
              {/* Stepper Dot */}
              <div
                className={`absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-2 border-slate-950 ${dotClass} shadow-md`}
                aria-hidden="true"
              />

              <div className="bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 rounded-xl p-4 transition-all space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-purple-300">
                    {milestone.timeline_label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}
                  >
                    <Icon className="w-3 h-3" aria-hidden="true" />
                    <span>{milestone.priority} Priority</span>
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {milestone.task}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
