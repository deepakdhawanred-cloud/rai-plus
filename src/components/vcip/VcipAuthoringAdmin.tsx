import React, { useState } from 'react';
import {
  Archive,
  CalendarPlus,
  CheckCircle2,
  FilePlus2,
  ShieldCheck,
} from 'lucide-react';
import type {
  VcipAuthoredQuestion,
  VcipClassAssignment,
  VcipClassTier,
  VcipDomainId,
  VcipGovernanceConfig,
  VcipLanguage,
  VcipMode,
  VcipQuestionApprovalStatus,
} from '../../types/vcip';
import {
  ALL_VCIP_DOMAINS,
  VCIP_DOMAIN_META,
  getClassTierLabel,
} from '../../utils/vcipQuestionBank';
import { apiRequest } from '../../utils/api';

interface VcipAuthoringAdminProps {
  token: string;
  questions: VcipAuthoredQuestion[];
  assignments: VcipClassAssignment[];
  governance: VcipGovernanceConfig | undefined;
  onRefresh: () => Promise<void>;
}

export const VcipAuthoringAdmin: React.FC<VcipAuthoringAdminProps> = ({
  token,
  questions,
  assignments,
  governance,
  onRefresh,
}) => {
  // Authoring form state
  const [domain, setDomain] = useState<VcipDomainId>('verbal_reasoning');
  const [category, setCategory] = useState('Word Analogy');
  const [classTier, setClassTier] = useState<VcipClassTier>('middle_6_8');
  const [language, setLanguage] = useState<VcipLanguage>('en');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const [sourceType, setSourceType] = useState<'human_authored' | 'ai_assisted'>('human_authored');
  const [prompt, setPrompt] = useState('');
  const [diagramUrl, setDiagramUrl] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [timeLimitSec, setTimeLimitSec] = useState(60);

  // Schedule assignment state
  const [asgTitle, setAsgTitle] = useState('');
  const [asgTargetClass, setAsgTargetClass] = useState('Classes 6–12');
  const [asgMode, setAsgMode] = useState<VcipMode>('timed');
  const [asgLanguage, setAsgLanguage] = useState<VcipLanguage>('en');
  const [asgDueDate, setAsgDueDate] = useState('2026-12-10');
  const [asgTimeMinutes, setAsgTimeMinutes] = useState(35);

  // Governance policy state
  const [launchRange, setLaunchRange] = useState<'classes_5_12' | 'classes_6_12'>(
    governance?.launchClassRange || 'classes_6_12',
  );
  const [parentAccess, setParentAccess] = useState<boolean>(
    governance?.parentAccessEnabled ?? true,
  );
  const [requireConsent, setRequireConsent] = useState<boolean>(
    governance?.requireGuardianConsent ?? true,
  );
  const [retentionMonths, setRetentionMonths] = useState<number>(
    governance?.retentionMonths ?? 36,
  );
  const [extraTimePct, setExtraTimePct] = useState<number>(
    governance?.accommodationsExtraTimePct ?? 25,
  );

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    const opts = [optA, optB, optC, optD].map((o) => o.trim()).filter(Boolean);
    if (!prompt.trim() || opts.length < 2) {
      setFeedback('Enter a question prompt and at least 2 answer options.');
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/vcip/questions',
        {
          method: 'POST',
          body: JSON.stringify({
            domain,
            category,
            classTier,
            language,
            difficulty,
            sourceType,
            prompt,
            diagramUrl: diagramUrl.trim() || undefined,
            options: opts,
            correctIndex: Math.min(correctIndex, opts.length - 1),
            explanation,
            timeLimitSec,
          }),
        },
        token,
      );
      setPrompt('');
      setDiagramUrl('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setExplanation('');
      setFeedback(
        sourceType === 'ai_assisted'
          ? 'Original AI-assisted item saved as Pending Review (mandatory counsellor/admin approval required before live use).'
          : 'Original authored question saved as Draft (v1). Approve it in the Question Bank below to publish.',
      );
      await onRefresh();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to save authored question.');
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateQuestionStatus(id: string, status: VcipQuestionApprovalStatus) {
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        `/api/vcip/questions/${encodeURIComponent(id)}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ approvalStatus: status }),
        },
        token,
      );
      setFeedback(`Updated question status to "${status.replace('_', ' ')}" and incremented version audit record.`);
      await onRefresh();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to update question status.');
    } finally {
      setBusy(false);
    }
  }

  async function handleScheduleAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!asgTitle.trim()) {
      setFeedback('Enter an assessment schedule title.');
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/vcip/assignments',
        {
          method: 'POST',
          body: JSON.stringify({
            title: asgTitle.trim(),
            targetClass: asgTargetClass,
            domains: ALL_VCIP_DOMAINS,
            mode: asgMode,
            language: asgLanguage,
            dueDate: asgDueDate,
            timeLimitMinutes: asgTimeMinutes,
          }),
        },
        token,
      );
      setAsgTitle('');
      setFeedback('Scheduled class VCIP assessment and recorded in audit log.');
      await onRefresh();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to schedule assignment.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveGovernance(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/vcip/governance',
        {
          method: 'PATCH',
          body: JSON.stringify({
            launchClassRange: launchRange,
            parentAccessEnabled: parentAccess,
            requireGuardianConsent: requireConsent,
            retentionMonths,
            accommodationsExtraTimePct: extraTimePct,
          }),
        },
        token,
      );
      setFeedback('Saved school VCIP privacy, consent, retention, and accommodation policy.');
      await onRefresh();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to save governance config.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900">
          {feedback}
        </div>
      )}

      {/* Row 1: Original Question Authoring Form + Question Bank Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleCreateQuestion}
          className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <FilePlus2 className="h-4 w-4 text-blue-700" />
            <h3 className="text-sm font-bold text-slate-900">Author Original VCIP Item</h3>
          </div>
          <p className="text-xs text-slate-600">
            Author 100% original questions & diagrams only. AI-assisted drafts are automatically held in
            Pending Review until approved by authorised staff.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="vcip-auth-domain" className="block text-xs font-medium text-slate-700 mb-1">
                Cognitive Domain
              </label>
              <select
                id="vcip-auth-domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value as VcipDomainId)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900"
              >
                {ALL_VCIP_DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {VCIP_DOMAIN_META[d].shortLabel}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="vcip-auth-tier" className="block text-xs font-medium text-slate-700 mb-1">
                Class Tier
              </label>
              <select
                id="vcip-auth-tier"
                value={classTier}
                onChange={(e) => setClassTier(e.target.value as VcipClassTier)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900"
              >
                <option value="foundation_5">Class 5 Foundation</option>
                <option value="middle_6_8">Classes 6–8 Middle</option>
                <option value="secondary_9_10">Classes 9–10 Secondary</option>
                <option value="senior_11_12">Classes 11–12 Senior</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label htmlFor="vcip-auth-lang" className="block text-xs font-medium text-slate-700 mb-1">
                Language
              </label>
              <select
                id="vcip-auth-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value as VcipLanguage)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div>
              <label htmlFor="vcip-auth-diff" className="block text-xs font-medium text-slate-700 mb-1">
                Difficulty
              </label>
              <select
                id="vcip-auth-diff"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value) as 1 | 2 | 3)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs"
              >
                <option value={1}>Level 1</option>
                <option value={2}>Level 2</option>
                <option value={3}>Level 3</option>
              </select>
            </div>
            <div>
              <label htmlFor="vcip-auth-src" className="block text-xs font-medium text-slate-700 mb-1">
                Source
              </label>
              <select
                id="vcip-auth-src"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as 'human_authored' | 'ai_assisted')}
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs"
              >
                <option value="human_authored">Human Original</option>
                <option value="ai_assisted">AI Draft (Review)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="vcip-auth-cat" className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <input
                id="vcip-auth-cat"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label htmlFor="vcip-auth-time" className="block text-xs font-medium text-slate-700 mb-1">
                Time Limit (sec)
              </label>
              <input
                id="vcip-auth-time"
                type="number"
                min={15}
                max={300}
                value={timeLimitSec}
                onChange={(e) => setTimeLimitSec(Number(e.target.value) || 60)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="vcip-auth-prompt" className="block text-xs font-medium text-slate-700 mb-1">
              Original Question Prompt
            </label>
            <textarea
              id="vcip-auth-prompt"
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write an original reasoning question..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label htmlFor="vcip-auth-diagram" className="block text-xs font-medium text-slate-700 mb-1">
              Optional Original Diagram Asset Path / SVG URL
            </label>
            <input
              id="vcip-auth-diagram"
              type="text"
              value={diagramUrl}
              onChange={(e) => setDiagramUrl(e.target.value)}
              placeholder="/assets/diagrams/custom-pattern.svg (optional)"
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              aria-label="Option A"
              value={optA}
              onChange={(e) => setOptA(e.target.value)}
              placeholder="Option A"
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
            />
            <input
              type="text"
              aria-label="Option B"
              value={optB}
              onChange={(e) => setOptB(e.target.value)}
              placeholder="Option B"
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
            />
            <input
              type="text"
              aria-label="Option C"
              value={optC}
              onChange={(e) => setOptC(e.target.value)}
              placeholder="Option C"
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
            />
            <input
              type="text"
              aria-label="Option D"
              value={optD}
              onChange={(e) => setOptD(e.target.value)}
              placeholder="Option D"
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="vcip-auth-correct" className="block text-xs font-medium text-slate-700 mb-1">
                Correct Option
              </label>
              <select
                id="vcip-auth-correct"
                value={correctIndex}
                onChange={(e) => setCorrectIndex(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
              >
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
                <option value={3}>Option D</option>
              </select>
            </div>
            <div>
              <label htmlFor="vcip-auth-exp" className="block text-xs font-medium text-slate-700 mb-1">
                Reasoning Explanation
              </label>
              <input
                id="vcip-auth-exp"
                type="text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain the logic rule..."
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Save Original Question to Review Queue
          </button>
        </form>

        {/* Question Bank & Version Approval Table */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                School Original Question Bank & Approval Queue ({questions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Version-tracked items · Tenant-isolated · AI-assisted items require review before approval.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200 max-h-[520px] overflow-y-auto pr-1">
            {questions.map((q) => (
              <div key={q.id} className="py-3.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    {VCIP_DOMAIN_META[q.domain].shortLabel} · {getClassTierLabel(q.classTier)} ·{' '}
                    {q.language.toUpperCase()} · v{q.version} ·{' '}
                    {q.sourceType === 'ai_assisted' ? 'AI Draft' : 'Human Original'}
                  </span>
                  <span
                    className={`font-semibold ${
                      q.approvalStatus === 'approved'
                        ? 'text-emerald-700'
                        : q.approvalStatus === 'archived'
                          ? 'text-slate-400'
                          : 'text-amber-700'
                    }`}
                  >
                    {q.approvalStatus.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
                <p className="text-xs text-slate-600">
                  Options: {q.options.map((o, idx) => `${idx === q.correctIndex ? '✓ ' : ''}${o}`).join(' · ')}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">
                    By {q.createdBy}
                    {q.approvedBy ? ` · Approved by ${q.approvedBy}` : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    {q.approvalStatus !== 'approved' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleUpdateQuestionStatus(q.id, 'approved')}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve Live
                      </button>
                    )}
                    {q.approvalStatus !== 'archived' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleUpdateQuestionStatus(q.id, 'archived')}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Archive className="h-3.5 w-3.5" /> Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Class Assessment Scheduling + Privacy/Consent/Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <CalendarPlus className="h-4 w-4 text-blue-700" />
            <h3 className="text-sm font-bold text-slate-900">Assign & Schedule Class VCIP Assessments</h3>
          </div>
          <form onSubmit={handleScheduleAssignment} className="space-y-3">
            <div>
              <label htmlFor="vcip-asg-title" className="block text-xs font-medium text-slate-700 mb-1">
                Schedule Title
              </label>
              <input
                id="vcip-asg-title"
                type="text"
                value={asgTitle}
                onChange={(e) => setAsgTitle(e.target.value)}
                placeholder="e.g. Term-2 Complete VCIP Assessment (Class 8)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label htmlFor="vcip-asg-class" className="block text-xs font-medium text-slate-700 mb-1">
                  Target Class
                </label>
                <input
                  id="vcip-asg-class"
                  type="text"
                  value={asgTargetClass}
                  onChange={(e) => setAsgTargetClass(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label htmlFor="vcip-asg-mode" className="block text-xs font-medium text-slate-700 mb-1">
                  Mode
                </label>
                <select
                  id="vcip-asg-mode"
                  value={asgMode}
                  onChange={(e) => setAsgMode(e.target.value as VcipMode)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
                >
                  <option value="timed">Timed</option>
                  <option value="practice">Practice</option>
                </select>
              </div>
              <div>
                <label htmlFor="vcip-asg-lang" className="block text-xs font-medium text-slate-700 mb-1">
                  Language
                </label>
                <select
                  id="vcip-asg-lang"
                  value={asgLanguage}
                  onChange={(e) => setAsgLanguage(e.target.value as VcipLanguage)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              <div>
                <label htmlFor="vcip-asg-due" className="block text-xs font-medium text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  id="vcip-asg-due"
                  type="date"
                  value={asgDueDate}
                  onChange={(e) => setAsgDueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs text-slate-600 flex items-center gap-2">
                Duration (min):
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={asgTimeMinutes}
                  onChange={(e) => setAsgTimeMinutes(Number(e.target.value) || 35)}
                  className="w-16 rounded border border-slate-300 px-2 py-1 font-mono text-xs"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-blue-800 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900"
              >
                Schedule Assessment
              </button>
            </div>
          </form>

          <div className="border-t border-slate-200 pt-3 space-y-2">
            <p className="text-xs font-semibold text-slate-700">Active & Scheduled Assignments</p>
            {assignments.map((a) => (
              <div key={a.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                <p className="font-semibold text-slate-900">{a.title}</p>
                <p className="text-slate-600 mt-0.5">
                  {a.targetClass} · {a.domains.length} domains · {a.mode} · {a.language.toUpperCase()} · Due{' '}
                  {a.dueDate}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Governance, Privacy & Accommodations */}
        <form
          onSubmit={handleSaveGovernance}
          className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <ShieldCheck className="h-4 w-4 text-blue-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Fairness, Data Privacy, Consent & Accommodations
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label htmlFor="vcip-gov-range" className="block font-medium text-slate-700 mb-1">
                Active School Rollout Cohort
              </label>
              <select
                id="vcip-gov-range"
                value={launchRange}
                onChange={(e) => setLaunchRange(e.target.value as 'classes_5_12' | 'classes_6_12')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                <option value="classes_6_12">Classes 6–12 (Recommended Initial Launch)</option>
                <option value="classes_5_12">Classes 5–12 (Includes Class 5 Foundation Tier)</option>
              </select>
            </div>

            <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="text-slate-800 font-medium">Parent/Guardian Dashboard Access</span>
              <input
                type="checkbox"
                checked={parentAccess}
                onChange={(e) => setParentAccess(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="text-slate-800 font-medium">Require Guardian Consent Before Formal Assessment</span>
              <input
                type="checkbox"
                checked={requireConsent}
                onChange={(e) => setRequireConsent(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="vcip-gov-ret" className="block font-medium text-slate-700 mb-1">
                  Data Retention Policy (Months)
                </label>
                <input
                  id="vcip-gov-ret"
                  type="number"
                  min={6}
                  max={120}
                  value={retentionMonths}
                  onChange={(e) => setRetentionMonths(Number(e.target.value) || 36)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-xs"
                />
              </div>
              <div>
                <label htmlFor="vcip-gov-acc" className="block font-medium text-slate-700 mb-1">
                  Reasonable Extra Time Accommodation (%)
                </label>
                <input
                  id="vcip-gov-acc"
                  type="number"
                  min={0}
                  max={100}
                  value={extraTimePct}
                  onChange={(e) => setExtraTimePct(Number(e.target.value) || 25)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Scoring Rule Version: {governance?.scoringRuleVersion || 'vcip-dev-v1.0'}
              </span>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Save Policy Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
