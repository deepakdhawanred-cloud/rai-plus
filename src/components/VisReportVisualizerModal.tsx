import React from 'react';
import { ExternalLink, Fingerprint, Sparkles, X } from 'lucide-react';
import type { VisParsedReportProfile, VisReportCatalogItem } from '../types';
import { EXPANDABLE_FINGERPRINT_CODES } from '../utils/visReportParser';

interface VisDmitProfilePanelProps {
  profile: VisParsedReportProfile;
  catalogItem?: VisReportCatalogItem;
  onOpenFullModal?: () => void;
}

export const VisDmitProfilePanel: React.FC<VisDmitProfilePanelProps> = ({
  profile,
  catalogItem,
  onOpenFullModal,
}) => {
  const left = profile.brainDominance.leftPct;
  const right = profile.brainDominance.rightPct;

  return (
    <div
      data-testid="vis-dmit-panel"
      className="rounded-xl border border-slate-200 bg-white p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-semibold text-blue-900">
            VIS 360° DMIT & Learning Style Telemetry ({profile.extractionSource === 'live_drive_pdf' ? 'Live Extracted from Drive PDF' : 'Pre-Parsed Drive Report'})
          </p>
          <h2 className="font-display text-base font-bold text-slate-900 mt-0.5">
            {profile.reportSubjectName} — Cognitive & Personality Snapshot
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{profile.advisorySummary.governanceNotice}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {catalogItem && (
            <a
              href={catalogItem.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              Drive PDF
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {onOpenFullModal && (
            <button
              type="button"
              onClick={onOpenFullModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
            >
              Full DMIT & Brain Lobe Report
            </button>
          )}
        </div>
      </div>

      {/* Top Row KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
          <p className="text-slate-500">Dominant VAK Style</p>
          <p className="font-display text-lg font-bold text-blue-900 mt-0.5">
            {profile.vak.dominantStyle || 'Balanced'}
          </p>
          <p className="font-mono text-[11px] text-slate-600 tabular-nums mt-1">
            V {profile.vak.visualPct ?? '—'}% · A {profile.vak.auditoryPct ?? '—'}% · K {profile.vak.kinestheticPct ?? '—'}%
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
          <p className="text-slate-500">Brain Hemisphere Split</p>
          <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-0.5">
            L {left !== null ? `${left}%` : '—'} / R {right !== null ? `${right}%` : '—'}
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
            {left !== null && (
              <div className="bg-blue-900 h-full" style={{ width: `${left}%` }} />
            )}
            {right !== null && (
              <div className="bg-amber-500 h-full" style={{ width: `${right}%` }} />
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
          <p className="text-slate-500">DISC Bird Typology</p>
          <p className="font-display text-lg font-bold text-slate-900 mt-0.5">
            {profile.personality.primaryBird || '—'}
            {profile.personality.secondaryBird ? ` · ${profile.personality.secondaryBird}` : ''}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            {profile.personality.primaryTrait || 'Profile'} / {profile.personality.secondaryTrait || '—'}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
          <p className="text-slate-500">Top Multiple Intelligence</p>
          <p className="font-display text-sm font-bold text-emerald-800 mt-1 truncate">
            {profile.topIntelligences[0]?.label || 'See Full Chart'}
          </p>
          <p className="font-mono text-[11px] text-slate-600 tabular-nums mt-1">
            {profile.topIntelligences[0] ? `${profile.topIntelligences[0].score}% score` : 'Chart summary'}
            {profile.topIntelligences[1] ? ` · #2 ${profile.topIntelligences[1].label}` : ''}
          </p>
        </div>
      </div>

      {/* DMIT Fingerprint Potential & 1-on-1 Mentoring Card (X / X1 / X2 / X2.1 / X2.2 Rule) */}
      {profile.fingerprintProfile && (
        <div
          data-testid="vis-dmit-fingerprint-card"
          className={`rounded-xl border p-4 text-xs space-y-2 ${
            profile.fingerprintProfile.hasExpandableXSeries
              ? 'border-amber-300 bg-amber-50/80'
              : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Fingerprint
                className={`h-4 w-4 ${
                  profile.fingerprintProfile.hasExpandableXSeries
                    ? 'text-amber-800'
                    : 'text-blue-900'
                }`}
              />
              <span className="font-bold text-slate-900">
                Fingerprint Pattern &amp; Potential Classification
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  profile.fingerprintProfile.hasExpandableXSeries
                    ? 'bg-amber-200 text-amber-950'
                    : 'bg-blue-100 text-blue-900'
                }`}
              >
                {profile.fingerprintProfile.potentialBand}
              </span>
              <span className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800">
                {profile.fingerprintProfile.learnerArchetype}
              </span>
              {profile.fingerprintProfile.matchedXPatterns.length > 0 && (
                <span className="rounded-full bg-[#142B46] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#D6B66D]">
                  Prints: {profile.fingerprintProfile.matchedXPatterns.join(', ')}
                </span>
              )}
            </div>
          </div>
          <p className="text-slate-800 leading-relaxed">
            {profile.fingerprintProfile.coachingDirective}
          </p>
          {profile.fingerprintProfile.hasExpandableXSeries && (
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-md bg-white border border-amber-300 px-2 py-0.5 text-[11px] font-semibold text-amber-950">
                1-on-1 Mentoring Focus Required
              </span>
              <span className="rounded-md bg-white border border-amber-300 px-2 py-0.5 text-[11px] font-semibold text-amber-950">
                Grows Best with Structured Guided Pressure
              </span>
              <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">
                VIS Rule: {EXPANDABLE_FINGERPRINT_CODES.join(', ')} → Expandable Potential (Reflective)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Advisory Match */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-1.5">
          <p className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-900" />
            Classroom & Study Tips (From VAK & Brain Profile)
          </p>
          {profile.advisorySummary.studyTips.map((tip) => (
            <p key={tip} className="text-slate-700">· {tip}</p>
          ))}
          {profile.advisorySummary.classroomSupport.slice(0, 2).map((sup) => (
            <p key={sup} className="text-slate-700">· {sup}</p>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-2">
          <p className="font-semibold text-slate-900">Multiple Intelligences Top Strengths</p>
          <div className="space-y-1.5">
            {profile.topIntelligences.slice(0, 4).map((mi) => (
              <div key={mi.key} className="flex items-center gap-2">
                <span className="w-36 truncate text-slate-700">{mi.label}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-blue-900"
                    style={{ width: `${Math.min(100, mi.score * 4.5)}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-900 tabular-nums w-12 text-right">
                  {mi.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface VisReportVisualizerModalProps {
  profile: VisParsedReportProfile | null;
  catalogItem?: VisReportCatalogItem;
  onClose: () => void;
}

export const VisReportVisualizerModal: React.FC<VisReportVisualizerModalProps> = ({
  profile,
  catalogItem,
  onClose,
}) => {
  if (!profile) return null;

  const quotients = [
    { label: 'IQ (Intelligence Quotient)', val: profile.quotients.iq },
    { label: 'EQ (Emotional Quotient)', val: profile.quotients.eq },
    { label: 'AQ (Adversity Quotient)', val: profile.quotients.aq },
    { label: 'CQ (Creativity Quotient)', val: profile.quotients.cq },
  ];

  const lobes = [
    { label: 'Action (Planning & Execution)', val: profile.brainLobes.action },
    { label: 'Thinking (Logic & Ideas)', val: profile.brainLobes.thinking },
    { label: 'Tactile (Motor & Hands-On)', val: profile.brainLobes.tactile },
    { label: 'Auditory (Listening & Speech)', val: profile.brainLobes.auditory },
    { label: 'Visual (Observation & Space)', val: profile.brainLobes.visual },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vis-dmit-modal-title"
    >
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-xs font-semibold text-blue-900">
              Virat International School, Kapriwas (Rewari) · DMIT &amp; Learning Telemetry
            </p>
            <h2 id="vis-dmit-modal-title" className="font-display text-lg font-bold text-slate-900 mt-0.5">
              {catalogItem ? `${catalogItem.studentName} (${catalogItem.normalizedClass} ${catalogItem.section})` : profile.reportSubjectName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{profile.advisorySummary.governanceNotice}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {catalogItem && (
              <a
                href={catalogItem.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                Open Original Drive PDF
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close DMIT visualizer"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Fingerprint Potential & 1-on-1 Mentoring Banner (X / X1 / X2 / X2.1 / X2.2 Rule) */}
          {profile.fingerprintProfile && (
            <div
              className={`rounded-xl border p-4 space-y-2 ${
                profile.fingerprintProfile.hasExpandableXSeries
                  ? 'border-amber-300 bg-amber-50/80'
                  : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Fingerprint className="h-4 w-4 text-amber-800" />
                  Fingerprint Potential Profile — {profile.fingerprintProfile.potentialBand}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800">
                    {profile.fingerprintProfile.learnerArchetype}
                  </span>
                  {profile.fingerprintProfile.matchedXPatterns.length > 0 && (
                    <span className="rounded-full bg-[#142B46] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#D6B66D]">
                      Prints: {profile.fingerprintProfile.matchedXPatterns.join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-slate-800">{profile.fingerprintProfile.coachingDirective}</p>
            </div>
          )}

          {/* Row 1: VAK + Hemispheres + Leadership/Motive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
              <p className="font-bold text-slate-900">VAK Learning Styles</p>
              {[
                { label: 'Visual Learner', val: profile.vak.visualPct, color: 'bg-blue-900' },
                { label: 'Auditory Learner', val: profile.vak.auditoryPct, color: 'bg-emerald-700' },
                { label: 'Kinesthetic Learner', val: profile.vak.kinestheticPct, color: 'bg-amber-600' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-900">
                      {item.val !== null ? `${item.val}%` : '—'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    {item.val !== null && (
                      <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <p className="font-bold text-slate-900">Brain Dominance & Motive/Thought</p>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Left Brain ({profile.brainDominance.leftPct ?? '—'}%)</span>
                  <span>Right Brain ({profile.brainDominance.rightPct ?? '—'}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden flex">
                  {profile.brainDominance.leftPct !== null && (
                    <div className="bg-blue-900 h-full" style={{ width: `${profile.brainDominance.leftPct}%` }} />
                  )}
                  {profile.brainDominance.rightPct !== null && (
                    <div className="bg-amber-500 h-full" style={{ width: `${profile.brainDominance.rightPct}%` }} />
                  )}
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Motive Leading ({profile.motiveThought.motivePct ?? '—'}%)</span>
                  <span>Thought Leading ({profile.motiveThought.thoughtPct ?? '—'}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden flex">
                  {profile.motiveThought.motivePct !== null && (
                    <div className="bg-emerald-700 h-full" style={{ width: `${profile.motiveThought.motivePct}%` }} />
                  )}
                  {profile.motiveThought.thoughtPct !== null && (
                    <div className="bg-slate-600 h-full" style={{ width: `${profile.motiveThought.thoughtPct}%` }} />
                  )}
                </div>
              </div>
              <div className="pt-1 border-t border-slate-200 flex justify-between text-slate-700">
                <span>Task Leader: <strong className="font-mono">{profile.leadership.taskOrientedPct ?? '—'}%</strong></span>
                <span>Relationship Leader: <strong className="font-mono">{profile.leadership.relationshipOrientedPct ?? '—'}%</strong></span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
              <p className="font-bold text-slate-900">Multiple Quotients & Bird Type</p>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <p className="text-[11px] text-slate-500">DISC Bird Profile</p>
                <p className="font-display text-base font-bold text-blue-900">
                  {profile.personality.primaryBird || '—'}
                  {profile.personality.secondaryBird ? ` + ${profile.personality.secondaryBird}` : ''}
                </p>
                <p className="text-[11px] text-slate-600">
                  Primary: {profile.personality.primaryTrait || '—'} · Secondary: {profile.personality.secondaryTrait || '—'}
                </p>
              </div>
              <div className="space-y-1">
                {quotients.map((q) => (
                  <div key={q.label} className="flex justify-between">
                    <span className="text-slate-600 truncate">{q.label}</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-900">
                      {q.val !== null ? `${q.val}%` : 'Omitted'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: 8 Multiple Intelligences + 5 Brain Lobes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
              <p className="font-bold text-slate-900">8 Multiple Intelligences (Ranked %)</p>
              {profile.topIntelligences.length > 0 ? (
                <div className="space-y-2">
                  {profile.topIntelligences.map((mi, idx) => (
                    <div key={mi.key} className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] text-slate-400 w-4">#{idx + 1}</span>
                      <span className="w-36 truncate font-medium text-slate-800">{mi.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-blue-900" style={{ width: `${Math.min(100, mi.score * 4.5)}%` }} />
                      </div>
                      <span className="font-mono font-semibold tabular-nums text-slate-900 w-12 text-right">
                        {mi.score}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">MI chart unavailable in this PDF edition.</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
              <p className="font-bold text-slate-900">5 Brain Lobes Distribution</p>
              <div className="space-y-2">
                {lobes.map((lobe) => (
                  <div key={lobe.label} className="flex items-center gap-2.5">
                    <span className="w-48 truncate font-medium text-slate-800">{lobe.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      {lobe.val !== null && (
                        <div className="h-full bg-emerald-700" style={{ width: `${Math.min(100, lobe.val * 2.5)}%` }} />
                      )}
                    </div>
                    <span className="font-mono font-semibold tabular-nums text-slate-900 w-10 text-right">
                      {lobe.val !== null ? `${lobe.val}%` : '—'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="font-semibold text-slate-800 mb-1">Suggested Cognitive Game Focus</p>
                <p className="text-slate-600">
                  {profile.advisorySummary.suggestedCognitiveCategories.join(' · ')}
                </p>
              </div>
            </div>
          </div>

          {/* Row 3: Actionable Guidance */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2">
            <p className="font-bold text-blue-950">Recommended Classroom & Home Guidance</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
              <ul className="space-y-1">
                {profile.advisorySummary.studyTips.map((t) => (
                  <li key={t}>· {t}</li>
                ))}
              </ul>
              <ul className="space-y-1">
                {profile.advisorySummary.classroomSupport.map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
