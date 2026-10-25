import React, { useState } from 'react';
import axios from 'axios';
import {
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import type { ConsolidatedPlan, PlannerRequest } from './types';
import { BudgetVisualizer } from './components/BudgetVisualizer';
import { TimelineView } from './components/TimelineView';
import { VendorList } from './components/VendorList';
import { MoodBoard } from './components/MoodBoard';

export default function App() {
  const [formData, setFormData] = useState<PlannerRequest>({
    event_type: 'Wedding',
    budget: 15000,
    guest_count: 100,
    date: '2027-06-15',
    location: 'Napa Valley, CA',
    vibe: 'Modern rustic romance with warm fairy lights and live acoustic music',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [planResult, setPlanResult] = useState<ConsolidatedPlan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'budget' || name === 'guest_count'
          ? Number(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post<ConsolidatedPlan>(
        'http://localhost:8000/api/plan',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 90000,
        }
      );
      setPlanResult(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        setErrorMessage(
          typeof detail === 'string'
            ? detail
            : err.message || 'Failed to generate event plan from server.'
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred while communicating with the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>AI-Powered Multi-Agent Event Architecture</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Autonomous Event Planner
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Provide your event parameters. Four Gemini 3.1 flash lite agents simultaneously formulate
            the budget, operational milestones, vendor procurement items, and aesthetic concepts.
          </p>
        </header>

        {/* Input Form Card */}
        <div className="max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Event Type */}
              <div className="space-y-2">
                <label htmlFor="event_type" className="block text-sm font-medium text-slate-300">
                  Event Type
                </label>
                <select
                  id="event_type"
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Community">Community</option>
                  <option value="Corporate Retreat">Corporate Retreat</option>
                </select>
              </div>

              {/* Target Date */}
              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium text-slate-300">
                  Target Date / Timeline
                </label>
                <div className="relative flex items-center">
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" aria-hidden="true" />
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <label htmlFor="budget" className="block text-sm font-medium text-slate-300">
                  Budget ($ USD)
                </label>
                <div className="relative flex items-center">
                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" aria-hidden="true" />
                </div>
              </div>

              {/* Guest Count */}
              <div className="space-y-2">
                <label htmlFor="guest_count" className="block text-sm font-medium text-slate-300">
                  Guest Count
                </label>
                <div className="relative flex items-center">
                  <input
                    id="guest_count"
                    name="guest_count"
                    type="number"
                    min="1"
                    value={formData.guest_count}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-slate-300">
                Location / Venue Preference
              </label>
              <div className="relative flex items-center">
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. Austin, TX or Mountain Resort"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            {/* Vibe / Notes */}
            <div className="space-y-2">
              <label htmlFor="vibe" className="block text-sm font-medium text-slate-300">
                Vibe / Aesthetic Notes
              </label>
              <textarea
                id="vibe"
                name="vibe"
                rows={3}
                placeholder="Describe your desired mood, color accents, aesthetic goals, or special constraints..."
                value={formData.vibe}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y"
              />
            </div>

            {/* Submit & Reset actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    Synthesizing Multi-Agent Plan...
                  </>
                ) : (
                  <>
                    Generate Full Event Plan
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>

              {planResult && (
                <button
                  type="button"
                  onClick={() => setPlanResult(null)}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  Reset View
                </button>
              )}
            </div>
          </form>

          {/* Error Message Box */}
          {errorMessage && (
            <div
              role="alert"
              className="mt-6 p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-sm">Failed to generate plan</p>
                <p className="text-xs text-red-300/90 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Plan Display Grid */}
        {planResult && (
          <main className="space-y-8 animate-in fade-in duration-500">
            {/* Grid layout for Budget and Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <BudgetVisualizer data={planResult.budget} />
              <TimelineView data={planResult.timeline} />
            </div>

            {/* Vendor Checklist */}
            <VendorList data={planResult.vendors} />

            {/* Creative Themes & MoodBoard */}
            <MoodBoard data={planResult.ideas} />
          </main>
        )}
      </div>
    </div>
  );
}
