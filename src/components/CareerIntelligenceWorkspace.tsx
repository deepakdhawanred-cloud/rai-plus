import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Compass,
  GitCompare,
  GraduationCap,
  IndianRupee,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
} from 'lucide-react';
import type { BudgetTier, CareerEntryStage, CareerProfile } from '../types';
import type { WorkspaceData } from '../types/workspace';
import { apiRequest } from '../utils/api';
import {
  buildEvidenceLinkedCareerSuggestions,
  filterCareerProfiles,
} from '../utils/careerIntelligenceEngine';
import {
  buildCareerExplorationIndicators,
  buildDomainSummaries,
} from '../utils/vcipScoringEngine';

interface CareerIntelligenceWorkspaceProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

type CareerViewTab = 'library' | 'compare' | 'counselling';

const ENTRY_STAGES: Array<CareerEntryStage | 'ALL'> = [
  'ALL',
  'After Class 10',
  'After Class 12 — Science',
  'After Class 12 — Commerce',
  'After Class 12 — Humanities',
  'Interdisciplinary & Vocational',
];

const BUDGET_TIERS: Array<BudgetTier | 'ALL'> = [
  'ALL',
  'Budget (Under ₹3L)',
  'Moderate (₹3L – ₹12L)',
  'Premium (₹12L+)',
];

export const CareerIntelligenceWorkspace: React.FC<CareerIntelligenceWorkspaceProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const careers = data.careerProfiles || [];
  const plans = data.studentCareerPlans || [];
  const canEditPlan = ['super_admin', 'school_admin', 'principal', 'coordinator', 'counsellor', 'student'].includes(
    data.user.role,
  );

  const [viewTab, setViewTab] = useState<CareerViewTab>('library');
  const [query, setQuery] = useState('');
  const [entryStage, setEntryStage] = useState<CareerEntryStage | 'ALL'>('ALL');
  const [streamFilter, setStreamFilter] = useState('ALL');
  const [budgetTier, setBudgetTier] = useState<BudgetTier | 'ALL'>('ALL');
  const [locationScope, setLocationScope] = useState<CareerProfile['locationScope'] | 'ALL'>('ALL');
  const [interestOrSkill, setInterestOrSkill] = useState('');

  const [selectedCareerId, setSelectedCareerId] = useState<string>(careers[0]?.id || '');
  const [compareIds, setCompareIds] = useState<string[]>(
    careers.slice(0, 2).map((c) => c.id),
  );

  // Personal Career Counselling State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const withPlan = data.students.find((st) =>
      (data.studentCareerPlans || []).some((p) => p.studentId === st.id),
    );
    if (withPlan) return withPlan.id;
    const senior = data.students.find((st) => /^(9|10|11|12)\b/.test(st.classSection));
    return senior?.id || data.students[0]?.id || '';
  });
  const [declaredInterestsText, setDeclaredInterestsText] = useState('Coding, Mathematics, Leadership');
  const [counsellorNoteDraft, setCounsellorNoteDraft] = useState('');
  const [sessionSummaryDraft, setSessionSummaryDraft] = useState('');
  const [sessionReflectionDraft, setSessionReflectionDraft] = useState('');
  const [shareWithParentDraft, setShareWithParentDraft] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredCareers = useMemo(
    () =>
      filterCareerProfiles(careers, {
        query,
        entryStage,
        stream: streamFilter,
        budgetTier,
        locationScope,
        interestOrSkill,
      }),
    [careers, query, entryStage, streamFilter, budgetTier, locationScope, interestOrSkill],
  );

  const selectedCareer = useMemo(
    () => careers.find((c) => c.id === selectedCareerId) || filteredCareers[0] || careers[0] || null,
    [careers, selectedCareerId, filteredCareers],
  );

  const comparedCareers = useMemo(
    () => compareIds.map((id) => careers.find((c) => c.id === id)).filter((c): c is CareerProfile => Boolean(c)),
    [compareIds, careers],
  );

  const effectiveStudentId =
    data.students.some((s) => s.id === selectedStudentId)
      ? selectedStudentId
      : data.students[0]?.id || '';
  const activeStudent = data.students.find((s) => s.id === effectiveStudentId) || null;
  const activePlan = plans.find((p) => p.studentId === effectiveStudentId) || null;

  const vcipCareerIndicators = useMemo(() => {
    if (!activeStudent) return [];
    const attempts = (data.vcipAttempts || []).filter((a) => a.studentId === activeStudent.id);
    if (attempts.length === 0) return [];
    return buildCareerExplorationIndicators(buildDomainSummaries(attempts));
  }, [activeStudent, data.vcipAttempts]);

  const suggestions = useMemo(() => {
    if (!activeStudent) return [];
    const interests = declaredInterestsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return buildEvidenceLinkedCareerSuggestions({
      student: activeStudent,
      breakdown: data.studentBreakdowns[activeStudent.id],
      thinkingSessions: data.thinkingAssessments || [],
      profiles: careers,
      declaredInterests: interests,
    });
  }, [activeStudent, declaredInterestsText, data.studentBreakdowns, data.thinkingAssessments, careers]);

  function toggleCompare(careerId: string) {
    setCompareIds((prev) => {
      if (prev.includes(careerId)) return prev.filter((id) => id !== careerId);
      if (prev.length >= 3) return [...prev.slice(1), careerId];
      return [...prev, careerId];
    });
  }

  async function handleSaveStudentPlan(shortlistOverride?: string[]) {
    if (!activeStudent) return;
    setSavingPlan(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/career/student-plans',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: activeStudent.id,
            shortlistedCareerIds: shortlistOverride ?? activePlan?.shortlistedCareerIds ?? [],
            counsellorNotes: counsellorNoteDraft || activePlan?.counsellorNotes || '',
            sharedWithParent: shareWithParentDraft,
            newSessionLog: sessionSummaryDraft.trim()
              ? {
                  summary: sessionSummaryDraft.trim(),
                  studentReflections: sessionReflectionDraft.trim(),
                  nextSteps: ['Review shortlisted 9-section roadmaps with parents', 'Complete one starter project'],
                }
              : undefined,
          }),
        },
        token,
      );
      setSessionSummaryDraft('');
      setSessionReflectionDraft('');
      await onRefresh();
      setFeedback(`Saved personal Career Intelligence plan for ${activeStudent.name}.`);
    } finally {
      setSavingPlan(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header & Sub-Tabs */}
      <div className="border-b border-slate-200 pb-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="h-6 w-6 text-blue-900" />
            Career Counselling &amp; Career Intelligence Platform
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Evidence-based Indian &amp; global career roadmaps (9 structured sections per career), side-by-side comparison, and OLQ + Thinking-linked personal counselling.
          </p>
        </div>

        <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setViewTab('library')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              viewTab === 'library' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Career Library &amp; 9-Section Roadmaps ({careers.length})
          </button>
          <button
            type="button"
            onClick={() => setViewTab('compare')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              viewTab === 'compare' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Side-by-Side Comparison ({comparedCareers.length}/3)
          </button>
          <button
            type="button"
            onClick={() => setViewTab('counselling')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              viewTab === 'counselling' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Evidence-Linked Personal Counselling
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ==================================================================
          TAB 1: SEARCHABLE CAREER LIBRARY + 9-SECTION ROADMAP VIEWER
      ================================================================== */}
      {viewTab === 'library' && (
        <div className="space-y-4">
          {/* Multi-Facet Filter Bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            <div className="lg:col-span-2 relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                aria-label="Search careers, exams, or skills"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search career, exam (JEE, NEET, CLAT, NDA)..."
                className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 text-xs"
              />
            </div>
            <select
              aria-label="Filter by entry stage"
              value={entryStage}
              onChange={(e) => setEntryStage(e.target.value as CareerEntryStage | 'ALL')}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
            >
              {ENTRY_STAGES.map((st) => (
                <option key={st} value={st}>
                  {st === 'ALL' ? 'All Entry Stages' : st}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by stream"
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
            >
              <option value="ALL">All Streams</option>
              <option value="Science">Science</option>
              <option value="Commerce">Commerce</option>
              <option value="Humanities">Humanities</option>
              <option value="After Class 10">After Class 10</option>
            </select>
            <select
              aria-label="Filter by INR budget tier"
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value as BudgetTier | 'ALL')}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
            >
              {BUDGET_TIERS.map((b) => (
                <option key={b} value={b}>
                  {b === 'ALL' ? 'All INR Budgets' : b}
                </option>
              ))}
            </select>
            <input
              type="text"
              aria-label="Filter by interest or skill"
              value={interestOrSkill}
              onChange={(e) => setInterestOrSkill(e.target.value)}
              placeholder="Interest / skill..."
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Career Cards */}
            <div className="lg:col-span-4 space-y-2.5 max-h-[820px] overflow-y-auto pr-1">
              {filteredCareers.map((career) => {
                const active = selectedCareer?.id === career.id;
                const inCompare = compareIds.includes(career.id);
                return (
                  <div
                    key={career.id}
                    className={`rounded-xl border p-3.5 transition-colors ${
                      active ? 'border-blue-900 bg-blue-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCareerId(career.id)}
                      className="w-full text-left space-y-1"
                    >
                      <p className="text-[11px] font-semibold text-blue-900">{career.entryStage}</p>
                      <p className="text-sm font-bold text-slate-900">{career.title}</p>
                      <p className="text-[11px] text-slate-600">
                        {career.streams.join(' · ')} · {career.budgetTier}
                      </p>
                    </button>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500">{career.locationScope}</span>
                      <button
                        type="button"
                        onClick={() => toggleCompare(career.id)}
                        className={`font-semibold ${
                          inCompare ? 'text-emerald-700' : 'text-blue-900 hover:underline'
                        }`}
                      >
                        {inCompare ? '✓ In Compare' : '+ Compare'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredCareers.length === 0 && (
                <p className="text-xs text-slate-500 p-6 text-center rounded-xl border border-slate-200 bg-white">
                  No careers matched your current filter combination.
                </p>
              )}
            </div>

            {/* Right 9-Section Complete Roadmap */}
            <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6 space-y-6">
              {selectedCareer ? (
                <>
                  <div className="border-b border-slate-200 pb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-blue-900">{selectedCareer.entryStage}</p>
                      <h2 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                        {selectedCareer.title}
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        Streams: {selectedCareer.streams.join(' / ')} · Budget: {selectedCareer.budgetTier} · {selectedCareer.locationScope}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!compareIds.includes(selectedCareer.id)) toggleCompare(selectedCareer.id);
                          setViewTab('compare');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        <GitCompare className="h-3.5 w-3.5 text-blue-900" />
                        Compare Side-by-Side
                      </button>
                    </div>
                  </div>

                  {/* Section 1: Career Overview */}
                  <section className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-blue-900">
                      1. Career Overview
                    </h3>
                    <p className="text-xs text-slate-800 leading-relaxed">{selectedCareer.overview.summary}</p>
                    <p className="text-xs text-slate-600">
                      <strong>Core Purpose:</strong> {selectedCareer.overview.corePurpose}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                        <p className="font-bold text-slate-900 mb-1">Typical Roles</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                          {selectedCareer.overview.typicalRoles.map((r) => <li key={r}>{r}</li>)}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                        <p className="font-bold text-slate-900 mb-1">Emerging Directions</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                          {selectedCareer.overview.emergingDirections.map((r) => <li key={r}>{r}</li>)}
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Section 2: Educational Roadmap */}
                  <section className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-blue-900 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" />
                      2. Educational Roadmap (Class 10 → Employment &amp; Specialisation)
                    </h3>
                    <div className="space-y-2">
                      {selectedCareer.educationalRoadmap.map((step, idx) => (
                        <div key={idx} className="rounded-lg border border-slate-200 p-3 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{step.stage}</span>
                            <span className="font-mono text-[11px] text-blue-900">{step.timeline}</span>
                          </div>
                          <p className="text-slate-700">{step.milestones.join(' · ')}</p>
                          <p className="text-[11px] text-slate-500">
                            <strong>Exams / Credentials:</strong> {step.keyExamsOrCredentials.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Section 3: Aptitude & Capability Requirements (IQ/EQ/AQ/CQ) */}
                  <section className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-blue-900">
                      3. Aptitude &amp; Capability Profile (IQ · EQ · AQ · CQ — No Invented Cut-Offs)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="rounded-lg border border-slate-200 p-3">
                        <strong className="text-slate-900">IQ (Analytical):</strong>{' '}
                        <span className="text-slate-700">{selectedCareer.aptitudeProfile.iqFocus}</span>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-3">
                        <strong className="text-slate-900">EQ (Emotional):</strong>{' '}
                        <span className="text-slate-700">{selectedCareer.aptitudeProfile.eqFocus}</span>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-3">
                        <strong className="text-slate-900">AQ (Adversity / Grit):</strong>{' '}
                        <span className="text-slate-700">{selectedCareer.aptitudeProfile.aqFocus}</span>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-3">
                        <strong className="text-slate-900">CQ (Creative):</strong>{' '}
                        <span className="text-slate-700">{selectedCareer.aptitudeProfile.cqFocus}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">{selectedCareer.aptitudeProfile.qualitativeNote}</p>
                  </section>

                  {/* Section 4: Job Nature & Working Life */}
                  <section className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-blue-900">
                      4. Job Nature &amp; Daily Working Life
                    </h3>
                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 text-xs space-y-1.5">
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-800">
                        {selectedCareer.workingLife.dailyResponsibilities.map((d) => <li key={d}>{d}</li>)}
                      </ul>
                      <p className="text-slate-700"><strong>Environment:</strong> {selectedCareer.workingLife.workEnvironment}</p>
                      <p className="text-slate-700"><strong>Hours &amp; Pace:</strong> {selectedCareer.workingLife.workHoursAndPace}</p>
                      <p className="text-slate-700"><strong>Trade-Offs:</strong> {selectedCareer.workingLife.challengesAndRewards}</p>
                    </div>
                  </section>

                  {/* Section 5: Financial Roadmap & Budget (INR) */}
                  <section className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-blue-900 flex items-center gap-1.5">
                      <IndianRupee className="h-3.5 w-3.5" />
                      5. Financial Roadmap &amp; Budget (INR · Verified vs Estimated)
                    </h3>
                    <div className="space-y-2">
                      {selectedCareer.financialRoadmap.tiers.map((tier) => (
                        <div key={tier.tierLabel} className="rounded-lg border border-slate-200 p-3 text-xs space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">{tier.tierLabel}</span>
                            <span
                              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                                tier.verificationStatus === 'verified_official'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {tier.verificationStatus === 'verified_official'
                                ? `Verified Official · ${tier.lastUpdated}`
                                : `Estimated · ${tier.lastUpdated}`}
                            </span>
                          </div>
                          <p className="font-mono font-semibold text-blue-900">{tier.estimatedTotalInr}</p>
                          <p className="text-slate-600">Annual Range: {tier.annualFeeRangeInr} · {tier.scholarshipNotes}</p>
                          <p className="text-[11px] text-slate-500">Source: {tier.sourceNote}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {selectedCareer.financialRoadmap.additionalCostsNote} {selectedCareer.financialRoadmap.disclaimer}
                    </p>
                  </section>

                  {/* Section 6 & 7: Market Study & Competition */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <section className="rounded-lg border border-slate-200 p-3.5 space-y-1.5 text-xs">
                      <h3 className="font-bold uppercase tracking-wide text-blue-900">
                        6. Market Study &amp; Industry Analysis
                      </h3>
                      <p className="text-slate-800">{selectedCareer.marketStudy.demandOutlook}</p>
                      <p className="text-slate-600">
                        <strong>Hubs:</strong> {selectedCareer.marketStudy.geographicHubs.join(', ')}
                      </p>
                      <div className="pt-1 space-y-1">
                        {selectedCareer.marketStudy.credibleSources.map((src) => (
                          <p key={src.name} className="text-[11px] text-slate-600">
                            • <strong>{src.name} ({src.year}):</strong> {src.note}
                          </p>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 italic">{selectedCareer.marketStudy.dataIntegrityNote}</p>
                    </section>

                    <section className="rounded-lg border border-slate-200 p-3.5 space-y-1.5 text-xs">
                      <h3 className="font-bold uppercase tracking-wide text-blue-900">
                        7. Competition Analysis &amp; Backup Tracks
                      </h3>
                      <p className="text-slate-800">
                        <strong>Key Exams:</strong> {selectedCareer.competitionAnalysis.keyEntranceExams.join(', ')}
                      </p>
                      <p className="text-slate-700">{selectedCareer.competitionAnalysis.preparationReality}</p>
                      <p className="text-slate-700">
                        <strong>Parallel Backup Tracks:</strong>{' '}
                        {selectedCareer.competitionAnalysis.parallelBackupTracks.join(' · ')}
                      </p>
                    </section>
                  </div>

                  {/* Section 8: Skills Required Across 8 Categories */}
                  <section className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-blue-900">
                      8. Skills Required to Excel (8 Competency Categories)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[11px]">
                      {(
                        [
                          ['Cognitive & Analytical', selectedCareer.skillsRequired.cognitiveAnalytical],
                          ['Technical & Domain', selectedCareer.skillsRequired.technicalDomain],
                          ['Communication', selectedCareer.skillsRequired.communication],
                          ['Leadership & Teamwork', selectedCareer.skillsRequired.leadershipCollaboration],
                          ['Digital & AI Literacy', selectedCareer.skillsRequired.digitalAiLiteracy],
                          ['Emotional Resilience', selectedCareer.skillsRequired.emotionalResilience],
                          ['Execution & Ownership', selectedCareer.skillsRequired.executionSelfManagement],
                          ['Ethics & Civic Duty', selectedCareer.skillsRequired.ethicsCivicAwareness],
                        ] as const
                      ).map(([label, list]) => (
                        <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                          <p className="font-bold text-slate-900 mb-1">{label}</p>
                          <p className="text-slate-700">{list.join(', ')}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Section 9: Personalised Student Action Plan */}
                  <section className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-blue-900 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      9. Stage-by-Stage Student Action Plan (Class 9 → Pre-Job)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                      {selectedCareer.actionPlan.stages.map((st) => (
                        <div key={st.stage} className="rounded-lg border border-slate-200 p-3">
                          <p className="font-bold text-blue-900 mb-1">{st.stage}</p>
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-700 text-[11px]">
                            {st.actions.map((a) => <li key={a}>{a}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                        <strong className="text-slate-900 block mb-0.5">Recommended Books</strong>
                        {selectedCareer.actionPlan.recommendedBooks.join(' · ')}
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                        <strong className="text-slate-900 block mb-0.5">Starter Projects</strong>
                        {selectedCareer.actionPlan.starterProjects.join(' · ')}
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                        <strong className="text-slate-900 block mb-0.5">Exposure &amp; Internships</strong>
                        {selectedCareer.actionPlan.internshipsAndExposure.join(' · ')}
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <p className="text-xs text-slate-500">Select a career on the left to inspect all 9 sections.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================
          TAB 2: SIDE-BY-SIDE CAREER COMPARISON TOOL
      ================================================================== */}
      {viewTab === 'compare' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Side-by-Side Career Comparison (Up to 3)</h2>
              <p className="text-xs text-slate-600">Select up to 3 careers below to compare education pathway, INR costs, exams, aptitude focus, and backup tracks.</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {careers.map((c) => {
                const active = compareIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCompare(c.id)}
                    className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold ${
                      active
                        ? 'border-blue-900 bg-blue-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {c.title.split('(')[0].trim()}
                  </button>
                );
              })}
            </div>
          </div>

          {comparedCareers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-2.5 pr-4 w-44 text-slate-500">Dimension</th>
                    {comparedCareers.map((c) => (
                      <th key={c.id} className="py-2.5 px-3 font-bold text-slate-900">
                        {c.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 align-top">
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-slate-700">Entry Stage &amp; Streams</td>
                    {comparedCareers.map((c) => (
                      <td key={c.id} className="py-2.5 px-3 text-slate-700">
                        {c.entryStage}<br />
                        <span className="text-slate-500">{c.streams.join(', ')}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-slate-700">Key Entrance Exams</td>
                    {comparedCareers.map((c) => (
                      <td key={c.id} className="py-2.5 px-3 text-slate-800">
                        {c.competitionAnalysis.keyEntranceExams.join(', ')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-slate-700">Public / Govt Budget (INR)</td>
                    {comparedCareers.map((c) => (
                      <td key={c.id} className="py-2.5 px-3 font-mono text-blue-900">
                        {c.financialRoadmap.tiers[0]?.estimatedTotalInr || '—'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-slate-700">IQ / EQ / AQ Focus</td>
                    {comparedCareers.map((c) => (
                      <td key={c.id} className="py-2.5 px-3 text-slate-700 space-y-1">
                        <div><strong>IQ:</strong> {c.aptitudeProfile.iqFocus}</div>
                        <div><strong>EQ:</strong> {c.aptitudeProfile.eqFocus}</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-slate-700">Working Life</td>
                    {comparedCareers.map((c) => (
                      <td key={c.id} className="py-2.5 px-3 text-slate-700">
                        {c.workingLife.workEnvironment} ({c.workingLife.workHoursAndPace})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-semibold text-slate-700">Parallel Backup Tracks</td>
                    {comparedCareers.map((c) => (
                      <td key={c.id} className="py-2.5 px-3 text-slate-700">
                        {c.competitionAnalysis.parallelBackupTracks.join(' · ')}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-8 text-center">Select at least two careers above to compare.</p>
          )}
        </div>
      )}

      {/* ==================================================================
          TAB 3: EVIDENCE-LINKED PERSONAL CAREER COUNSELLING
      ================================================================== */}
      {viewTab === 'counselling' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-blue-900" />
                    Transparent Evidence-Linked Exploration Suggestions
                  </h2>
                  <p className="text-xs text-slate-600">
                    Connects live Academics, Layer 1 Cognitive Profile (VCIP), 15-OLQ strengths, Thinking Tests, and interests — advisory only (never excludes students from any career).
                  </p>
                </div>
                {data.students.length > 1 && (
                  <select
                    aria-label="Select student for personal career counselling"
                    value={effectiveStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
                  >
                    {data.students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} · Class {st.classSection}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Student Interests (comma-separated for transparent exploration)
                </label>
                <input
                  type="text"
                  value={declaredInterestsText}
                  onChange={(e) => setDeclaredInterestsText(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>

              {vcipCareerIndicators.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3.5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900">
                      Authorised Layer 1 Cognitive Exploration Indicators (VCIP · Non-Exclusionary)
                    </p>
                    <span className="text-[11px] text-slate-500">
                      Internal developmental indicators · Never an eligibility restriction
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {vcipCareerIndicators.slice(0, 4).map((ind) => (
                      <div key={ind.field} className="rounded-md border border-slate-200 bg-white p-2.5 space-y-1">
                        <p className="font-semibold text-slate-900">{ind.field}</p>
                        {ind.demonstratedStrengths.length > 0 && (
                          <p className="text-[11px] text-emerald-800">
                            Demonstrated: {ind.demonstratedStrengths.join(' · ')}
                          </p>
                        )}
                        {ind.skillsToDevelop.length > 0 && (
                          <p className="text-[11px] text-slate-600">
                            Growth focus: {ind.skillsToDevelop[0]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {suggestions.slice(0, 5).map((sug) => {
                  const isShortlisted = Boolean(
                    activePlan?.shortlistedCareerIds.includes(sug.career.id),
                  );
                  return (
                    <div key={sug.career.id} className="rounded-lg border border-slate-200 p-3.5 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{sug.career.title}</p>
                          <p className="text-[11px] text-blue-900 font-semibold">{sug.alignmentIndicator}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCareerId(sug.career.id);
                              setViewTab('library');
                            }}
                            className="text-[11px] font-semibold text-slate-700 hover:underline"
                          >
                            9-Section Roadmap
                          </button>
                          {canEditPlan && (
                            <button
                              type="button"
                              disabled={savingPlan}
                              onClick={() => {
                                const cur = activePlan?.shortlistedCareerIds || [];
                                const next = isShortlisted
                                  ? cur.filter((id) => id !== sug.career.id)
                                  : [...cur, sug.career.id];
                                void handleSaveStudentPlan(next);
                              }}
                              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                                isShortlisted
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-blue-900 text-white hover:bg-blue-800'
                              }`}
                            >
                              {isShortlisted ? '✓ Shortlisted' : '+ Shortlist'}
                            </button>
                          )}
                        </div>
                      </div>
                      <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5">
                        {sug.transparentReasons.map((r, i) => <li key={i}>{r}</li>)}
                        <li>{sug.academicContext}</li>
                        <li>{sug.thinkingContext}</li>
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Counsellor Plan & Session Log */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-blue-900" />
                Personal Career Plan &amp; Session Notes — {activeStudent?.name}
              </h3>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                <p className="font-semibold text-slate-800">
                  Shortlisted Careers ({activePlan?.shortlistedCareerIds.length || 0}):
                </p>
                <p className="text-slate-600">
                  {activePlan && activePlan.shortlistedCareerIds.length > 0
                    ? activePlan.shortlistedCareerIds
                        .map((id) => careers.find((c) => c.id === id)?.title || id)
                        .join(' · ')
                    : 'None shortlisted yet.'}
                </p>
              </div>

              {canEditPlan && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Counsellor Guidance Notes
                    </label>
                    <textarea
                      rows={2}
                      value={counsellorNoteDraft || activePlan?.counsellorNotes || ''}
                      onChange={(e) => setCounsellorNoteDraft(e.target.value)}
                      placeholder="Human counsellor observations & stream alignment notes..."
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Log New Counselling Session Summary
                    </label>
                    <input
                      type="text"
                      value={sessionSummaryDraft}
                      onChange={(e) => setSessionSummaryDraft(e.target.value)}
                      placeholder="e.g., Reviewed PCM vs Commerce backups with student & parent"
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareWithParentDraft}
                      onChange={(e) => setShareWithParentDraft(e.target.checked)}
                    />
                    Share approved career exploration plan with Parents
                  </label>
                  <button
                    type="button"
                    disabled={savingPlan}
                    onClick={() => void handleSaveStudentPlan()}
                    className="w-full rounded-lg bg-blue-900 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                  >
                    Save Plan &amp; Session Log
                  </button>
                </div>
              )}

              {/* Historical Session Logs */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-blue-900" />
                  Recorded Counselling Sessions ({activePlan?.sessionLogs.length || 0})
                </p>
                {(activePlan?.sessionLogs || []).map((log) => (
                  <div key={log.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs space-y-0.5">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-800">{log.counsellorName}</span>
                      <span className="font-mono">{log.date}</span>
                    </div>
                    <p className="text-slate-700">{log.summary}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-2.5 text-[11px] text-blue-950 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-900 shrink-0 mt-0.5" />
                <span>Final stream and career choices always remain with the student, family, and human counsellor.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
