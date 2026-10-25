import React, { useState } from 'react';
import axios from 'axios';
import {
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import type {
  BudgetResponse,
  TimelineResponse,
  VendorChecklist,
  CreativeIdeas,
  ConsolidatedPlan,
  PlannerRequest,
} from './types';
import { BudgetVisualizer } from './components/BudgetVisualizer';
import { TimelineView } from './components/TimelineView';
import { VendorList } from './components/VendorList';
import { MoodBoard } from './components/MoodBoard';
import { ExportManager } from './components/ExportManager';

export default function App() {
  const [formData, setFormData] = useState<PlannerRequest>({
    event_type: 'Wedding',
    budget: 15000,
    guest_count: 100,
    date: '2027-06-15',
    location: 'Napa Valley, CA',
    vibe: 'Modern rustic romance with warm fairy lights and live acoustic music',
  });

  // Controls whether the main layout grid has been triggered
  const [hasStartedPlanning, setHasStartedPlanning] = useState(false);

  // Decoupled module states
  const [budgetData, setBudgetData] = useState<BudgetResponse | null>(null);
  const [isBudgetLoading, setIsBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  const [timelineData, setTimelineData] = useState<TimelineResponse | null>(null);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const [vendorsData, setVendorsData] = useState<VendorChecklist | null>(null);
  const [isVendorsLoading, setIsVendorsLoading] = useState(false);
  const [vendorsError, setVendorsError] = useState<string | null>(null);

  const [ideasData, setIdeasData] = useState<CreativeIdeas | null>(null);
  const [isIdeasLoading, setIsIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState<string | null>(null);

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

  const handleReset = () => {
    setHasStartedPlanning(false);
    setBudgetData(null);
    setTimelineData(null);
    setVendorsData(null);
    setIdeasData(null);
    setBudgetError(null);
    setTimelineError(null);
    setVendorsError(null);
    setIdeasError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Immediately render empty layout grid with individual loading spinners
    setHasStartedPlanning(true);

    // Initialize all loading states and clear old errors/data
    setIsBudgetLoading(true);
    setBudgetError(null);

    setIsTimelineLoading(true);
    setTimelineError(null);

    setIsVendorsLoading(true);
    setVendorsError(null);

    setIsIdeasLoading(true);
    setIdeasError(null);

    // 1. Budget Agent Request
    axios
      .post<BudgetResponse>('http://localhost:8000/api/plan/budget', formData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 90000,
      })
      .then((res) => {
        setBudgetData(res.data);
      })
      .catch((err) => {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.detail || err.message
          : 'Failed to generate budget.';
        setBudgetError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      })
      .finally(() => {
        setIsBudgetLoading(false);
      });

    // 2. Timeline Agent Request
    axios
      .post<TimelineResponse>('http://localhost:8000/api/plan/timeline', formData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 90000,
      })
      .then((res) => {
        setTimelineData(res.data);
      })
      .catch((err) => {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.detail || err.message
          : 'Failed to generate timeline.';
        setTimelineError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      })
      .finally(() => {
        setIsTimelineLoading(false);
      });

    // 3. Vendors Agent Request
    axios
      .post<VendorChecklist>('http://localhost:8000/api/plan/vendors', formData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 90000,
      })
      .then((res) => {
        setVendorsData(res.data);
      })
      .catch((err) => {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.detail || err.message
          : 'Failed to generate vendor checklist.';
        setVendorsError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      })
      .finally(() => {
        setIsVendorsLoading(false);
      });

    // 4. Ideas Agent Request
    axios
      .post<CreativeIdeas>('http://localhost:8000/api/plan/ideas', formData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 90000,
      })
      .then((res) => {
        setIdeasData(res.data);
      })
      .catch((err) => {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.detail || err.message
          : 'Failed to generate creative concepts.';
        setIdeasError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      })
      .finally(() => {
        setIsIdeasLoading(false);
      });
  };

  const isAnyLoading =
    isBudgetLoading || isTimelineLoading || isVendorsLoading || isIdeasLoading;

  // Build combined plan object for ExportManager if any data exists
  const combinedPlan: ConsolidatedPlan = {
    budget: budgetData || { error: budgetError || 'Budget not loaded' },
    timeline: timelineData || { error: timelineError || 'Timeline not loaded' },
    vendors: vendorsData || { error: vendorsError || 'Vendors not loaded' },
    ideas: ideasData || { error: ideasError || 'Ideas not loaded' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Decoupled Multi-Agent Event Architecture</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Autonomous Event Planner
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Submit your event parameters. Four autonomous Gemini agents will stream into their
            respective dashboard cards asynchronously.
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
                disabled={isAnyLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isAnyLoading ? (
                  <span>Streaming Agent Modules Asynchronously...</span>
                ) : (
                  <>
                    <span>Generate Full Event Plan</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>

              {hasStartedPlanning && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Reset Dashboard</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Dashboard Grid rendered immediately on form submission */}
        {hasStartedPlanning && (
          <main className="space-y-8 animate-in fade-in duration-500">
            {/* Dashboard Action Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">
                  {formData.event_type} Master Plan
                </h2>
                <p className="text-sm text-slate-400">
                  Target: ${formData.budget.toLocaleString()} • {formData.guest_count} Guests • {formData.location}
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <ExportManager plan={combinedPlan} />
              </div>
            </div>

            {/* Grid layout for Budget and Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <BudgetVisualizer
                data={budgetData}
                targetBudget={formData.budget}
                isLoading={isBudgetLoading}
                error={budgetError}
              />
              <TimelineView
                data={timelineData}
                isLoading={isTimelineLoading}
                error={timelineError}
              />
            </div>

            {/* Vendor Checklist */}
            <VendorList
              data={vendorsData}
              isLoading={isVendorsLoading}
              error={vendorsError}
            />

            {/* Creative Themes & MoodBoard */}
            <MoodBoard
              data={ideasData}
              isLoading={isIdeasLoading}
              error={ideasError}
            />
          </main>
        )}
      </div>
    </div>
  );
}
