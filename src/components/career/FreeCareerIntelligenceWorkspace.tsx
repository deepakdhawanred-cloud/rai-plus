import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  Brain,
  Briefcase,
  CheckCircle2,
  Compass,
  Download,
  ExternalLink,
  FileText,
  Globe,
  IndianRupee,
  LogOut,
  Printer,
  Shield,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import type { UserAccount } from '../../types';
import type {
  BudgetBypassPathway,
  CareerBudgetInput,
  CareerMarketOpportunity,
  CareerPersonalityInput,
  CareerUserWorkspaceState,
} from '../../types/flagshipProducts';
import { apiRequest } from '../../utils/api';
import type { CapacityQuestion } from '../../utils/careerFiveStageEngine';
import { RAI_PLUS_LOGO_URL } from '../../utils/transportEngine';

interface CareerWorkspacePayload {
  user: UserAccount;
  workspace: CareerUserWorkspaceState;
  stage1Questions: CapacityQuestion[];
  verifiedBypassPathways: BudgetBypassPathway[];
  marketCatalog: CareerMarketOpportunity[];
  alwaysFreeBadge: string;
  disclaimer: string;
}

interface FreeCareerIntelligenceWorkspaceProps {
  token: string;
  onSwitchUser: () => void;
  onLogout: () => void;
}

type CareerStageTab = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'stage5' | 'report' | 'privacy';

export const FreeCareerIntelligenceWorkspace: React.FC<FreeCareerIntelligenceWorkspaceProps> = ({
  token,
  onSwitchUser,
  onLogout,
}) => {
  const [data, setData] = useState<CareerWorkspacePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<CareerStageTab>('stage1');

  // Stage 1 answers
  const [stage1Answers, setStage1Answers] = useState<Record<string, number>>({});

  // Stage 2 personality form
  const [personality, setPersonality] = useState<CareerPersonalityInput>({
    extroversion: 3,
    leadershipDrive: 4,
    independence: 4,
    teamOrientation: 4,
    structurePreference: 3,
    riskTolerance: 3,
    creativityDrive: 4,
    routineTolerance: 3,
    competitiveDrive: 4,
    pressureComposure: 4,
    communicationStyle: 'Analytical & Written',
    learningEnvironment: 'Hands-on Labs & Field',
    happinessDriver: 'Building useful systems and mentoring people',
    topMotivation: 'Mastery & Innovation',
  });

  // Stage 3 budget form
  const [budgetInput, setBudgetInput] = useState<CareerBudgetInput>({
    currentEducation: 'Class 12 / Undergraduate',
    annualFamilyEducationBudgetInr: 45000,
    availableSavingsInr: 25000,
    locationCityState: 'Haryana, India',
    willingToRelocate: true,
    willingToWorkWhileStudying: true,
    preparationYearsAvailable: 3,
    categoryOrMeritScholarshipInterest: true,
  });

  // Stage 4 filters & compare
  const [scopeFilter, setScopeFilter] = useState<'All' | 'India' | 'International'>('All');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [deleteReason, setDeleteReason] = useState('');

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<CareerWorkspacePayload>(
        '/api/career-intelligence/workspace',
        {},
        token || undefined,
      );
      setData(res);
      if (res.workspace.stage2Personality?.input) {
        setPersonality(res.workspace.stage2Personality.input);
      }
      if (res.workspace.stage3Budget?.input) {
        setBudgetInput(res.workspace.stage3Budget.input);
      }
      if (res.workspace.selectedCareerIds?.length) {
        setCompareIds(res.workspace.selectedCareerIds);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Career Intelligence workspace.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  async function handleSubmitStage1(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setError(null);
    try {
      const filledAnswers: Record<string, number> = { ...stage1Answers };
      data.stage1Questions.forEach((q) => {
        if (filledAnswers[q.id] === undefined) {
          filledAnswers[q.id] = q.options[1]?.score ?? 70;
        }
      });
      const res = await apiRequest<{ workspace: CareerUserWorkspaceState }>(
        '/api/career-intelligence/stage1',
        { method: 'POST', body: JSON.stringify({ answers: filledAnswers }) },
        token || undefined,
      );
      setData((prev) => (prev ? { ...prev, workspace: res.workspace } : prev));
      setNotice('Stage 1 Capacity Profile (IQ, EQ, AQ, CQ) generated! Continue to Stage 2.');
      setActiveStage('stage2');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to evaluate Stage 1.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitStage2(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await apiRequest<{ workspace: CareerUserWorkspaceState }>(
        '/api/career-intelligence/stage2',
        { method: 'POST', body: JSON.stringify(personality) },
        token || undefined,
      );
      setData((prev) => (prev ? { ...prev, workspace: res.workspace } : prev));
      setNotice('Stage 2 Personality & 12 Working Environment Fit saved! Continue to Stage 3.');
      setActiveStage('stage3');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save Stage 2.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitStage3(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await apiRequest<{ workspace: CareerUserWorkspaceState }>(
        '/api/career-intelligence/stage3',
        { method: 'POST', body: JSON.stringify(budgetInput) },
        token || undefined,
      );
      setData((prev) => (prev ? { ...prev, workspace: res.workspace } : prev));
      setNotice('Stage 3 Budget Reality, 5-Pathway Cost Comparator & Budget Bypass Schemes calculated!');
      setActiveStage('stage4');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to evaluate Stage 3.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRefreshStage4(nextScope: 'All' | 'India' | 'International', nextCompareIds = compareIds) {
    setScopeFilter(nextScope);
    setSaving(true);
    setError(null);
    try {
      const res = await apiRequest<{ workspace: CareerUserWorkspaceState }>(
        '/api/career-intelligence/stage4',
        {
          method: 'POST',
          body: JSON.stringify({ scopeFilter: nextScope, selectedCareerIds: nextCompareIds }),
        },
        token || undefined,
      );
      setData((prev) => (prev ? { ...prev, workspace: res.workspace } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to refresh market matches.');
    } finally {
      setSaving(false);
    }
  }

  function toggleCompareCareer(id: string) {
    setCompareIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 3
          ? [...prev.slice(1), id]
          : [...prev, id];
      void handleRefreshStage4(scopeFilter, next);
      return next;
    });
  }

  async function handleGenerateStage5(targetCareerId: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await apiRequest<{ workspace: CareerUserWorkspaceState }>(
        '/api/career-intelligence/stage5',
        { method: 'POST', body: JSON.stringify({ targetCareerId, saveReport: true }) },
        token || undefined,
      );
      setData((prev) => (prev ? { ...prev, workspace: res.workspace } : prev));
      setNotice('Stage 5 Competition Diagnosis, Skill Gaps & Today→12-Month Roadmap generated and saved!');
      setActiveStage('stage5');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate roadmap.');
    } finally {
      setSaving(false);
    }
  }

  async function handleExportJson() {
    try {
      const payload = await apiRequest<Record<string, unknown>>(
        '/api/career-intelligence/privacy/export',
        {},
        token || undefined,
      );
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rai-plus-career-intelligence-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice('Personal Career Intelligence JSON export downloaded.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    }
  }

  async function handleDeleteRequest(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiRequest(
        '/api/career-intelligence/privacy/delete-request',
        { method: 'POST', body: JSON.stringify({ reason: deleteReason || 'DPDP erasure request' }) },
        token || undefined,
      );
      setDeleteReason('');
      setNotice('DPDP data deletion request logged.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit deletion request.');
    }
  }

  const comparedCareers = useMemo(() => {
    if (!data) return [];
    return compareIds
      .map((id) => data.marketCatalog.find((c) => c.id === id))
      .filter((c): c is CareerMarketOpportunity => Boolean(c));
  }, [data, compareIds]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <Compass className="h-10 w-10 text-emerald-400 mx-auto animate-pulse" />
          <p className="text-sm text-slate-300">Loading 100% Free Rai Plus Career Intelligence…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-rose-200 bg-white p-6 text-center space-y-4">
          <p className="text-sm font-semibold text-rose-700">{error || 'Unable to load workspace.'}</p>
          <button type="button" onClick={onLogout} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white">
            Back to Rai Plus
          </button>
        </div>
      </div>
    );
  }

  const ws = data.workspace;
  const stagesCompletedCount = [
    ws.stage1Capacity,
    ws.stage2Personality,
    ws.stage3Budget,
    ws.stage4Matches.length > 0,
    ws.stage5Roadmap,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F5F8FA] text-slate-900 flex flex-col">
      {/* Standalone Free Career Intelligence Header — Zero School ERP exposure */}
      <header className="sticky top-0 z-30 border-b border-emerald-900/40 bg-[#0F2A3F] text-white shadow-sm print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={RAI_PLUS_LOGO_URL}
              alt="Rai Plus Career Intelligence"
              className="h-10 w-10 rounded-lg border border-emerald-400/50 bg-[#F3E6D8] object-cover"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold tracking-tight">RAI PLUS CAREER INTELLIGENCE</span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                  {data.alwaysFreeBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {data.user.name} · 5-Stage Scientific Career Discovery · {stagesCompletedCount}/5 Stages Complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSwitchUser}
              className="rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700"
            >
              Switch Account
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* 5-Stage Progress Stepper */}
        <nav className="border-t border-slate-800 bg-[#0B2031] px-4 sm:px-6 overflow-x-auto">
          <div className="mx-auto max-w-7xl flex items-center gap-1 py-1.5">
            {(
              [
                { id: 'stage1', label: '1. Capacity (IQ/EQ/AQ/CQ)', done: Boolean(ws.stage1Capacity), icon: Brain },
                { id: 'stage2', label: '2. Personality & Fit', done: Boolean(ws.stage2Personality), icon: Sparkles },
                { id: 'stage3', label: '3. Budget & Bypass', done: Boolean(ws.stage3Budget), icon: IndianRupee },
                { id: 'stage4', label: '4. India & Global Market', done: ws.stage4Matches.length > 0, icon: Globe },
                { id: 'stage5', label: '5. Competition & Roadmap', done: Boolean(ws.stage5Roadmap), icon: TrendingUp },
                { id: 'report', label: '16-Section Report', done: Boolean(ws.stage5Roadmap), icon: FileText },
                { id: 'privacy', label: 'Privacy & DPDP', done: false, icon: Shield },
              ] as const
            ).map((step) => {
              const Icon = step.icon;
              const active = activeStage === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStage(step.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-emerald-400 text-[#0B2031]'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {step.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Icon className="h-3.5 w-3.5" />}
                  {step.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl w-full flex-1 px-4 sm:px-6 py-6 space-y-5">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 flex justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="underline">Dismiss</button>
          </div>
        )}
        {notice && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900 flex justify-between">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice(null)} className="underline">Dismiss</button>
          </div>
        )}

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-950 flex items-center justify-between gap-3">
          <span>
            <strong>Ethical Guidance Notice:</strong> {data.disclaimer}
          </span>
          <span className="shrink-0 rounded-full bg-emerald-700 px-2.5 py-0.5 text-[10px] font-bold text-white">
            ₹0 FREE FOREVER
          </span>
        </div>

        {/* ==================== STAGE 1: CAPACITY DISCOVERY ==================== */}
        {activeStage === 'stage1' && (
          <div className="space-y-5">
            {ws.stage1Capacity && (
              <div className="rounded-xl border border-emerald-200 bg-white p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-[#0F2A3F]">Your Capacity Profile (IQ · EQ · AQ · CQ)</h3>
                  <button
                    type="button"
                    onClick={() => setActiveStage('stage2')}
                    className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white"
                  >
                    Continue to Stage 2 →
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'IQ (Cognitive & Analytical)', val: ws.stage1Capacity.iq.overallPct, color: 'bg-[#142B46]' },
                    { label: 'EQ (Emotional Intelligence)', val: ws.stage1Capacity.eq.overallPct, color: 'bg-emerald-600' },
                    { label: 'AQ (Adversity & Resilience)', val: ws.stage1Capacity.aq.overallPct, color: 'bg-amber-600' },
                    { label: 'CQ (Creativity & Innovation)', val: ws.stage1Capacity.cq.overallPct, color: 'bg-indigo-600' },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                      <p className="text-[11px] font-bold text-slate-600">{m.label}</p>
                      <p className="mt-1 text-2xl font-extrabold text-slate-900">{m.val}%</p>
                      <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className={`h-full ${m.color}`} style={{ width: `${m.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-lg bg-emerald-50 p-3.5 border border-emerald-200">
                    <p className="font-bold text-emerald-900">Strength Areas & Suggested Clusters</p>
                    <p className="mt-1 text-emerald-800">{ws.stage1Capacity.strengthAreas.join(' · ')}</p>
                    <p className="mt-1.5 font-semibold text-emerald-900">
                      Clusters: {ws.stage1Capacity.suggestedClusters.join(', ')}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3.5 border border-amber-200">
                    <p className="font-bold text-amber-900">Growth Exercises</p>
                    <ul className="mt-1 space-y-1 text-amber-900">
                      {ws.stage1Capacity.suggestedExercises.map((ex) => (
                        <li key={ex}>• {ex}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitStage1} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#0F2A3F]">
                  Stage 1: Multi-Dimensional Capacity Assessment (IQ, EQ, AQ & CQ)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Answer honestly — there are no paywalls or pass/fail labels. This discovers your natural cognitive, emotional, adaptability, and creative strengths.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.stage1Questions.map((q, idx) => (
                  <div key={q.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-[#0F2A3F] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        {q.label}
                      </span>
                      <span className="text-[11px] text-slate-500">Q{idx + 1}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">{q.prompt}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt) => {
                        const checked = stage1Answers[q.id] === opt.score;
                        return (
                          <label
                            key={opt.text}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs cursor-pointer transition-colors ${
                              checked
                                ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-950'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={checked}
                              onChange={() =>
                                setStage1Answers((prev) => ({ ...prev, [q.id]: opt.score }))
                              }
                            />
                            <span>{opt.text}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#0F2A3F] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#173D5B] disabled:opacity-60"
                >
                  {saving ? 'Analyzing Capacity…' : 'Calculate IQ / EQ / AQ / CQ & Proceed to Stage 2 →'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================== STAGE 2: PERSONALITY & WORKING ENVIRONMENT FIT ==================== */}
        {activeStage === 'stage2' && (
          <div className="space-y-5">
            <form onSubmit={handleSubmitStage2} className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
              <div>
                <h2 className="text-base font-bold text-[#0F2A3F]">
                  Stage 2: Personality, Motivation & 12 Working Environment Fit
                </h2>
                <p className="text-xs text-slate-600">
                  Rate each preference from 1 (Low) to 5 (Very High) so we match you with environments where you genuinely thrive.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {(
                  [
                    ['extroversion', 'Social Energy (Extroversion)'],
                    ['leadershipDrive', 'Leadership Drive'],
                    ['independence', 'Independent Ownership'],
                    ['teamOrientation', 'Team Collaboration'],
                    ['structurePreference', 'Structured Rules'],
                    ['riskTolerance', 'Risk Appetite'],
                    ['creativityDrive', 'Creative Expression'],
                    ['routineTolerance', 'Routine Comfort'],
                    ['competitiveDrive', 'Competitive Drive'],
                    ['pressureComposure', 'Calm Under Pressure'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{label}</span>
                      <span className="text-emerald-700">{personality[key]}/5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={personality[key]}
                      onChange={(e) =>
                        setPersonality((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                      }
                      className="w-full accent-[#0F2A3F]"
                    />
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <label className="space-y-1">
                  <span className="font-bold text-slate-700">Preferred Communication Style</span>
                  <select
                    value={personality.communicationStyle}
                    onChange={(e) =>
                      setPersonality((prev) => ({
                        ...prev,
                        communicationStyle: e.target.value as CareerPersonalityInput['communicationStyle'],
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="Analytical & Written">Analytical & Written</option>
                    <option value="Persuasive & Verbal">Persuasive & Verbal</option>
                    <option value="Visual & Hands-on">Visual & Hands-on</option>
                    <option value="Empathetic & Collaborative">Empathetic & Collaborative</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="font-bold text-slate-700">Learning Environment</span>
                  <select
                    value={personality.learningEnvironment}
                    onChange={(e) =>
                      setPersonality((prev) => ({
                        ...prev,
                        learningEnvironment: e.target.value as CareerPersonalityInput['learningEnvironment'],
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="Structured Classroom">Structured Classroom</option>
                    <option value="Hands-on Labs & Field">Hands-on Labs & Field</option>
                    <option value="Self-Paced Digital">Self-Paced Digital</option>
                    <option value="Mentored Studio / Team">Mentored Studio / Team</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="font-bold text-slate-700">Core Motivation</span>
                  <select
                    value={personality.topMotivation}
                    onChange={(e) =>
                      setPersonality((prev) => ({
                        ...prev,
                        topMotivation: e.target.value as CareerPersonalityInput['topMotivation'],
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="Mastery & Innovation">Mastery & Innovation</option>
                    <option value="Impact & Service">Impact & Service</option>
                    <option value="Leadership & Autonomy">Leadership & Autonomy</option>
                    <option value="Financial Growth">Financial Growth</option>
                    <option value="Stability & Balance">Stability & Balance</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-1 text-xs">
                <span className="font-bold text-slate-700">What makes a workday deeply satisfying for you?</span>
                <input
                  type="text"
                  value={personality.happinessDriver}
                  onChange={(e) => setPersonality((prev) => ({ ...prev, happinessDriver: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#0F2A3F] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#173D5B]"
                >
                  {saving ? 'Analyzing Fit…' : 'Match 12 Working Environments & Proceed to Stage 3 →'}
                </button>
              </div>
            </form>

            {ws.stage2Personality && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-emerald-200 bg-white p-5 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-900">Top Best-Fit Working Environments</h3>
                  {ws.stage2Personality.preferredEnvironments.map((env) => (
                    <div key={env.environment} className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-3 text-xs">
                      <div className="flex justify-between font-bold text-emerald-950">
                        <span>{env.environment}</span>
                        <span>{env.fitPct}% Match</span>
                      </div>
                      <p className="mt-1 text-emerald-800">{env.why}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-amber-200 bg-white p-5 space-y-3">
                  <h3 className="text-sm font-bold text-amber-900">Challenging Environments & Safe Experiments</h3>
                  {ws.stage2Personality.challengingEnvironments.map((env) => (
                    <div key={env.environment} className="rounded-lg bg-amber-50/70 border border-amber-200 p-3 text-xs">
                      <p className="font-bold text-amber-950">{env.environment}</p>
                      <p className="mt-0.5 text-amber-900">{env.frictionNote}</p>
                    </div>
                  ))}
                  <div className="pt-2 text-xs text-slate-700">
                    <p className="font-bold">Recommended Mini Career Experiments:</p>
                    <ul className="mt-1 space-y-1">
                      {ws.stage2Personality.careerExperiments.map((ex) => (
                        <li key={ex}>• {ex}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== STAGE 3: BUDGET REALITY & BYPASS ENGINE ==================== */}
        {activeStage === 'stage3' && (
          <div className="space-y-5">
            <form onSubmit={handleSubmitStage3} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#0F2A3F]">
                  Stage 3: Financial Reality & Budget Constraint Bypass Engine
                </h2>
                <p className="text-xs text-slate-600">
                  Limited funds should never block real talent. Enter your honest budget to unlock verified scholarships, zero-tuition public routes, apprenticeships, and earn-while-you-learn pathways.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <label className="space-y-1">
                  <span className="font-bold text-slate-700">Current Education Level</span>
                  <input
                    type="text"
                    value={budgetInput.currentEducation}
                    onChange={(e) => setBudgetInput((p) => ({ ...p, currentEducation: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-bold text-slate-700">Annual Family Budget (₹)</span>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={budgetInput.annualFamilyEducationBudgetInr}
                    onChange={(e) =>
                      setBudgetInput((p) => ({ ...p, annualFamilyEducationBudgetInr: Number(e.target.value) || 0 }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-bold text-slate-700">Available Savings (₹)</span>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={budgetInput.availableSavingsInr}
                    onChange={(e) =>
                      setBudgetInput((p) => ({ ...p, availableSavingsInr: Number(e.target.value) || 0 }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-bold text-slate-700">Preparation Years Available</span>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={budgetInput.preparationYearsAvailable}
                    onChange={(e) =>
                      setBudgetInput((p) => ({ ...p, preparationYearsAvailable: Number(e.target.value) || 2 }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-5 text-xs">
                <label className="inline-flex items-center gap-2 font-medium">
                  <input
                    type="checkbox"
                    checked={budgetInput.willingToRelocate}
                    onChange={(e) => setBudgetInput((p) => ({ ...p, willingToRelocate: e.target.checked }))}
                  />
                  Willing to relocate for public institutions / jobs
                </label>
                <label className="inline-flex items-center gap-2 font-medium">
                  <input
                    type="checkbox"
                    checked={budgetInput.willingToWorkWhileStudying}
                    onChange={(e) => setBudgetInput((p) => ({ ...p, willingToWorkWhileStudying: e.target.checked }))}
                  />
                  Open to Earn-and-Learn / Apprenticeship routes
                </label>
                <label className="inline-flex items-center gap-2 font-medium">
                  <input
                    type="checkbox"
                    checked={budgetInput.categoryOrMeritScholarshipInterest}
                    onChange={(e) =>
                      setBudgetInput((p) => ({ ...p, categoryOrMeritScholarshipInterest: e.target.checked }))
                    }
                  />
                  Include Merit / Government Scholarships & Grants
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#0F2A3F] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#173D5B]"
                >
                  {saving ? 'Computing Bypass Routes…' : 'Compute 5 Pathways & Verified Bypass Schemes →'}
                </button>
              </div>
            </form>

            {ws.stage3Budget && (
              <div className="space-y-5">
                {/* 5-Pathway Cost Comparison Table */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#0F2A3F]">
                      5-Pathway Cost Comparator · Financial Tier:{' '}
                      <span className="text-emerald-700">{ws.stage3Budget.capacityTier}</span>
                    </h3>
                    <span className="text-xs text-slate-600">
                      Max Feasible Budget: ₹{ws.stage3Budget.maxFeasibleTotalBudgetInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                          <th className="py-2.5 px-3">Pathway Mode</th>
                          <th className="py-2.5 px-3">Est. Total Cost</th>
                          <th className="py-2.5 px-3">Duration</th>
                          <th className="py-2.5 px-3">Feasibility</th>
                          <th className="py-2.5 px-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ws.stage3Budget.pathwayComparisons.map((pc) => (
                          <tr key={pc.mode} className="border-b border-slate-100">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{pc.mode}</td>
                            <td className="py-2.5 px-3 font-mono">₹{pc.estimatedTotalCostInr.toLocaleString('en-IN')}</td>
                            <td className="py-2.5 px-3">{pc.estimatedDurationYears} yrs</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  pc.feasibility === 'Comfortable'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : pc.feasibility === 'Achievable with Aid'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {pc.feasibility}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{pc.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Verified Budget Bypass Schemes */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <h3 className="text-sm font-bold text-[#0F2A3F]">
                    Verified Budget Constraint Bypass Pathways ({ws.stage3Budget.bypassPathways.length} Matched)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ws.stage3Budget.bypassPathways.map((bp) => (
                      <div key={bp.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2 text-xs">
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                          {bp.category}
                        </span>
                        <h4 className="font-bold text-slate-900">{bp.name}</h4>
                        <p className="text-emerald-800 font-semibold">{bp.estimatedBenefit}</p>
                        <p className="text-slate-600"><strong>Eligibility:</strong> {bp.eligibility}</p>
                        <p className="text-slate-600"><strong>Documents:</strong> {bp.requiredDocuments.join(', ')}</p>
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <span className="text-slate-500">Verified: {bp.verifiedDate}</span>
                          <a
                            href={bp.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-[#0F2A3F] hover:underline"
                          >
                            Official Portal <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== STAGE 4: INDIA & INTERNATIONAL MARKET STUDY ==================== */}
        {activeStage === 'stage4' && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#0F2A3F]">
                  Stage 4: Verified India & International Career Market Study
                </h2>
                <p className="text-xs text-slate-600">
                  Every opportunity includes verified source provenance, realistic compensation ranges, licensing/visa notes, and budget-aligned entry routes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(['All', 'India', 'International'] as const).map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => void handleRefreshStage4(sc)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                      scopeFilter === sc
                        ? 'bg-[#0F2A3F] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Career Comparison Matrix */}
            {comparedCareers.length > 0 && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Side-by-Side Career Comparison Matrix ({comparedCareers.length}/3 Selected)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCompareIds([])}
                    className="text-xs font-semibold text-indigo-700 underline"
                  >
                    Clear Compare
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left bg-white rounded-lg overflow-hidden border border-indigo-200">
                    <thead>
                      <tr className="bg-indigo-900 text-white">
                        <th className="p-2.5">Criterion</th>
                        {comparedCareers.map((c) => (
                          <th key={c.id} className="p-2.5">{c.title}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-bold">Scope & Countries</td>
                        {comparedCareers.map((c) => <td key={c.id} className="p-2.5">{c.countries.join(', ')}</td>)}
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">India Est. Cost</td>
                        {comparedCareers.map((c) => <td key={c.id} className="p-2.5 font-mono">₹{c.estimatedIndiaCostInr.toLocaleString('en-IN')}</td>)}
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">India Salary Band</td>
                        {comparedCareers.map((c) => <td key={c.id} className="p-2.5">{c.indiaSalaryRangeInr}</td>)}
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Global Salary Band</td>
                        {comparedCareers.map((c) => <td key={c.id} className="p-2.5">{c.internationalSalaryRange || 'India Domestic Track'}</td>)}
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Competition Level</td>
                        {comparedCareers.map((c) => <td key={c.id} className="p-2.5">{c.competitionLevel}</td>)}
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Licensing / Visa</td>
                        {comparedCareers.map((c) => <td key={c.id} className="p-2.5">{c.licensingOrVisaNotes}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(ws.stage4Matches.length > 0
                ? ws.stage4Matches
                : data.marketCatalog.map((op) => ({
                    opportunity: op,
                    capacityMatchNote: 'Complete Stage 1 for personalized capacity calibration.',
                    personalityFitNote: 'Complete Stage 2 for work-environment fit.',
                    budgetFitNote: `Est. India pathway cost ₹${op.estimatedIndiaCostInr.toLocaleString('en-IN')}`,
                    whyItMatches: op.alternativeEntryRoutes,
                    alreadyPossessed: ['Foundational motivation'],
                    missingGaps: op.coreSkills.slice(0, 2),
                    risks: [op.entryBarriers],
                    rankReason: op.growthOutlook,
                  }))
              ).map((m) => {
                const op = m.opportunity;
                const isSelected = compareIds.includes(op.id);
                return (
                  <div key={op.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                          {op.scope} · {op.industry}
                        </span>
                        <h3 className="mt-1.5 text-base font-bold text-[#0F2A3F]">{op.title}</h3>
                        <p className="text-xs text-slate-600">{op.countries.join(' · ')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCompareCareer(op.id)}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? 'In Compare ✓' : '+ Compare'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-500">India Compensation</p>
                        <p className="font-semibold text-slate-900">{op.indiaSalaryRangeInr}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-500">International Range</p>
                        <p className="font-semibold text-slate-900">{op.internationalSalaryRange || 'Domestic Commission / Role'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-500">Est. India Path Cost</p>
                        <p className="font-semibold text-emerald-800">₹{op.estimatedIndiaCostInr.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-500">Demand & Competition</p>
                        <p className="font-semibold text-slate-900">{op.employmentDemand} · {op.competitionLevel}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-700">
                      <p><strong>Fit Summary:</strong> {m.capacityMatchNote} {m.budgetFitNote}</p>
                      <p><strong>Licensing / Visa:</strong> {op.licensingOrVisaNotes}</p>
                      <p><strong>Alternative Low-Cost Routes:</strong> {op.alternativeEntryRoutes.join(' · ')}</p>
                      <p className="text-[11px] text-slate-500">
                        <strong>Verified Source:</strong> {op.sourceName} ({op.sourceDate} · {op.sourceScope})
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleGenerateStage5(op.id)}
                      className="w-full rounded-lg bg-[#0F2A3F] px-4 py-2 text-xs font-bold text-white hover:bg-[#173D5B]"
                    >
                      Build Stage 5 Competition Diagnosis & 12-Month Roadmap →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== STAGE 5: COMPETITION & 12-MONTH ROADMAP ==================== */}
        {activeStage === 'stage5' && (
          <div className="space-y-5">
            {!ws.stage5Roadmap ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-3">
                <Target className="h-10 w-10 text-[#0F2A3F] mx-auto" />
                <h3 className="text-base font-bold text-[#0F2A3F]">Select a Career from Stage 4 to Build Your Action Roadmap</h3>
                <button
                  type="button"
                  onClick={() => setActiveStage('stage4')}
                  className="rounded-lg bg-[#0F2A3F] px-5 py-2 text-xs font-bold text-white"
                >
                  Open Stage 4 Career Market
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-900">
                      STAGE 5 COMPLETE · ACTION PLAN READY
                    </span>
                    <h2 className="mt-1 text-lg font-bold text-[#0F2A3F]">
                      Target Pathway: {ws.stage5Roadmap.targetCareerTitle}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStage('report')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white"
                  >
                    <FileText className="h-3.5 w-3.5" /> Open Full 16-Section Printable Report
                  </button>
                </div>

                {/* Competition Facts vs Qualitative Assessment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2 text-xs">
                    <h3 className="text-sm font-bold text-[#0F2A3F]">Measurable Competition & Market Facts</h3>
                    {ws.stage5Roadmap.measurableCompetitionFacts.map((f) => (
                      <p key={f} className="text-slate-700">• {f}</p>
                    ))}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2 text-xs">
                    <h3 className="text-sm font-bold text-[#0F2A3F]">Qualitative Entry Strategy Assessment</h3>
                    {ws.stage5Roadmap.qualitativeMarketAssessment.map((q) => (
                      <p key={q} className="text-slate-700">• {q}</p>
                    ))}
                  </div>
                </div>

                {/* 6-Part Skill Gap Diagnosis */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <h3 className="text-sm font-bold text-[#0F2A3F]">6-Dimension Skill Gap Diagnosis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                      <p className="font-bold text-emerald-900">Already Demonstrated</p>
                      <ul className="mt-1 space-y-1">{ws.stage5Roadmap.skillGap.demonstrated.map((x) => <li key={x}>• {x}</li>)}</ul>
                    </div>
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                      <p className="font-bold text-amber-900">Skills to Strengthen</p>
                      <ul className="mt-1 space-y-1">{ws.stage5Roadmap.skillGap.needsImprovement.map((x) => <li key={x}>• {x}</li>)}</ul>
                    </div>
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                      <p className="font-bold text-blue-900">Target Certifications & Qualifications</p>
                      <ul className="mt-1 space-y-1">{ws.stage5Roadmap.skillGap.certifications.map((x) => <li key={x}>• {x}</li>)}</ul>
                    </div>
                  </div>
                </div>

                {/* 6-Horizon Action Roadmap (TODAY -> 12 MONTHS) */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                  <h3 className="text-sm font-bold text-[#0F2A3F]">
                    Step-by-Step Action Roadmap (TODAY → NEXT 12 MONTHS)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ws.stage5Roadmap.milestones.map((ms) => (
                      <div key={ms.horizon} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-[#0F2A3F] px-2 py-0.5 text-[10px] font-bold text-white">
                            {ms.horizon}
                          </span>
                          <span className="font-mono font-bold text-emerald-800">
                            {ms.estimatedCostInr === 0 ? '₹0 Free' : `₹${ms.estimatedCostInr.toLocaleString('en-IN')}`}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900">{ms.objective}</h4>
                        <p className="text-slate-600"><strong>Time:</strong> {ms.timeRequirement}</p>
                        <p className="text-slate-600"><strong>Resource:</strong> {ms.learningResource}</p>
                        <p className="text-slate-700"><strong>Output:</strong> {ms.expectedOutput}</p>
                        <p className="text-emerald-800"><strong>Done When:</strong> {ms.completionCriteria}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================== 16-SECTION PRINTABLE CAREER INTELLIGENCE REPORT ==================== */}
        {activeStage === 'report' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  RAI PLUS · 100% FREE CAREER INTELLIGENCE REPORT (16 SECTIONS)
                </p>
                <h2 className="text-xl font-extrabold text-[#0F2A3F] mt-1">
                  Personal Career Blueprint — {data.user.name}
                </h2>
                <p className="text-xs text-slate-500">Generated {new Date().toISOString().slice(0, 10)}</p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2A3F] px-4 py-2 text-xs font-bold text-white print:hidden"
              >
                <Printer className="h-3.5 w-3.5" /> Print / Save Full PDF Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                <p className="font-bold text-[#0F2A3F]">1–4. Capacity Profile (IQ / EQ / AQ / CQ)</p>
                <p className="mt-1">
                  IQ: {ws.stage1Capacity?.iq.overallPct ?? '—'}% · EQ: {ws.stage1Capacity?.eq.overallPct ?? '—'}% ·
                  AQ: {ws.stage1Capacity?.aq.overallPct ?? '—'}% ({ws.stage1Capacity?.aq.resilienceBand ?? 'Pending'}) ·
                  CQ: {ws.stage1Capacity?.cq.overallPct ?? '—'}%
                </p>
                <p className="mt-1 text-slate-600">
                  Strengths: {ws.stage1Capacity?.strengthAreas.join(', ') || 'Complete Stage 1'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                <p className="font-bold text-[#0F2A3F]">5–6. Personality & Best-Fit Working Environments</p>
                <p className="mt-1">
                  Top Fit: {ws.stage2Personality?.preferredEnvironments.map((e) => e.environment).join(', ') || 'Complete Stage 2'}
                </p>
                <p className="mt-1 text-slate-600">
                  Avoid Friction: {ws.stage2Personality?.challengingEnvironments.map((e) => e.environment).join(', ') || '—'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                <p className="font-bold text-[#0F2A3F]">7–8. Budget Reality & Bypass Pathways</p>
                <p className="mt-1">
                  Financial Tier: {ws.stage3Budget?.capacityTier || 'Complete Stage 3'} · Matched Verified Schemes:{' '}
                  {ws.stage3Budget?.bypassPathways.length ?? 0}
                </p>
                <p className="mt-1 text-slate-600">
                  Top Schemes: {ws.stage3Budget?.bypassPathways.slice(0, 3).map((b) => b.name).join(' · ') || '—'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                <p className="font-bold text-[#0F2A3F]">9–11. India & International Career Matches</p>
                <p className="mt-1">
                  Top Matches: {ws.stage4Matches.slice(0, 3).map((m) => m.opportunity.title).join(', ') || 'Complete Stage 4'}
                </p>
                <p className="mt-1 text-slate-600">
                  Selected Target: {ws.stage5Roadmap?.targetCareerTitle || 'Select a target in Stage 4'}
                </p>
              </div>
            </div>

            {ws.stage5Roadmap && (
              <div className="space-y-3 text-xs">
                <p className="font-bold text-[#0F2A3F]">12–15. Competition Reality, Skill Gaps & Today→12-Month Action Roadmap</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ws.stage5Roadmap.milestones.map((ms) => (
                    <div key={ms.horizon} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-bold text-[#0F2A3F]">{ms.horizon}</p>
                      <p className="mt-0.5 font-semibold">{ms.objective}</p>
                      <p className="mt-1 text-slate-600">{ms.expectedOutput}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950">
              <strong>16. Guidance Disclaimer:</strong> {data.disclaimer}
            </div>
          </div>
        )}

        {/* ==================== PRIVACY & DPDP ==================== */}
        {activeStage === 'privacy' && (
          <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0F2A3F] flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-700" /> Personal Privacy & DPDP Controls
            </h3>
            <p className="text-xs text-slate-600">
              Your Career Intelligence assessments, budget details, and saved reports are private to your account and completely isolated from all School ERP tenants.
            </p>
            <button
              type="button"
              onClick={() => void handleExportJson()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" /> Export My Career Data (JSON)
            </button>
            <form onSubmit={handleDeleteRequest} className="pt-4 border-t border-slate-200 space-y-2">
              <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" /> Request Account & Assessment Erasure
              </p>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Optional reason..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <button type="submit" className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white">
                Submit DPDP Deletion Request
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
