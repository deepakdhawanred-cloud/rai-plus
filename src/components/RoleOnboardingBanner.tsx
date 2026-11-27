import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, HelpCircle, Sparkles, X } from 'lucide-react';
import type { UserRole } from '../types';
import type { WorkspaceTab } from '../types/workspace';

interface QuickStartStep {
  id: string;
  label: string;
  detail: string;
  targetTab: WorkspaceTab;
}

const ROLE_QUICK_START: Partial<Record<UserRole, QuickStartStep[]>> = {
  principal: [
    {
      id: 'fee_health',
      label: 'Review Finance 360° & Fee Defaulters',
      detail: 'Check monthly collection target & send automated parent reminders.',
      targetTab: 'finance',
    },
    {
      id: 'att_heatmap',
      label: 'Inspect Attendance Heatmap',
      detail: 'Spot declining class trends and early support alerts in seconds.',
      targetTab: 'attendance_heatmap',
    },
    {
      id: 'vcip_review',
      label: 'Approve Pending Cognitive Profiles (VCIP)',
      detail: 'Release counsellor-reviewed student reports to families.',
      targetTab: 'cognitive_profile',
    },
  ],
  school_admin: [
    {
      id: 'admissions',
      label: 'Check New Admission Leads',
      detail: 'Review website enquiries & auto-matched school bus routes.',
      targetTab: 'admissions',
    },
    {
      id: 'gate_pass',
      label: 'Open Campus Gate & Visitors Desk',
      detail: 'Approve digital gate passes and log campus visitors.',
      targetTab: 'campus_gate',
    },
    {
      id: 'staff_payroll',
      label: 'Verify Staff Attendance & Payroll',
      detail: 'Confirm daily staff check-ins synced with monthly salary register.',
      targetTab: 'staff_payroll',
    },
  ],
  teacher: [
    {
      id: 'one_go_att',
      label: 'Mark Today’s Class Attendance',
      detail: 'Complete one-go roll call and auto-notify absent parents.',
      targetTab: 'today_workspace',
    },
    {
      id: 'notebook_fast',
      label: 'Fast Notebook & Homework Check',
      detail: 'Use checkbox toggles & A/B/C quality buttons with keyboard arrows.',
      targetTab: 'notebook',
    },
    {
      id: 'marks_entry',
      label: 'Update Marks or Class Mindmaps',
      detail: 'Publish chapter study games & NCERT/HBSE visual mindmaps.',
      targetTab: 'academics',
    },
  ],
  accountant: [
    {
      id: 'daily_ledger',
      label: 'Record Fee Receipts & Daily Expenses',
      detail: 'Post collections, sibling adjustments & bus fuel bills.',
      targetTab: 'finance',
    },
    {
      id: 'family_merge',
      label: 'Review Sibling Family Ledger Groups',
      detail: 'Reconcile linked sibling households to avoid duplicate follow-ups.',
      targetTab: 'families',
    },
    {
      id: 'payroll_prep',
      label: 'Prepare Monthly Staff Payroll',
      detail: 'Verify attendance deductions and submit for Principal approval.',
      targetTab: 'staff_payroll',
    },
  ],
  parent: [
    {
      id: 'child_360',
      label: 'View Your Child’s 360° Progress',
      detail: 'Check attendance, notebook remarks, OLQs & yearly skill targets.',
      targetTab: 'students',
    },
    {
      id: 'report_card',
      label: 'Open Marks & Report Cards',
      detail: 'Track subject progress and print term summaries.',
      targetTab: 'marks_report_card',
    },
    {
      id: 'revise_hub',
      label: 'Explore Visual Mindmaps & Quick Revise',
      detail: 'Help your child practice 5-minute chapter revision games.',
      targetTab: 'academics',
    },
  ],
  student: [
    {
      id: 'quick_revise',
      label: 'Play Today’s Quick Revise Quest',
      detail: 'Keep your Revision Streak alive with chapter visual games.',
      targetTab: 'academics',
    },
    {
      id: 'brain_gym',
      label: 'Complete 5-Min Daily Brain Gym',
      detail: 'Sharpen reasoning, memory, and visual-spatial skills.',
      targetTab: 'cognitive_profile',
    },
    {
      id: 'my_marks',
      label: 'Check My Report Card & Goals',
      detail: 'Track chapter mastery badges and subject improvements.',
      targetTab: 'marks_report_card',
    },
  ],
};

const PLATFORM_GLOSSARY = [
  { term: 'VCIP', desc: 'Virat Cognitive Intelligence Profile — 6-domain non-diagnostic reasoning & learning profile.' },
  { term: '15 OLQs', desc: '15 Officer Like Qualities (Planning, Social Adjustment, Effectiveness, Dynamic Traits) derived from daily classroom evidence.' },
  { term: 'Erikson Stage', desc: 'Age-appropriate psychosocial development milestones guiding supportive teacher & parent remedials.' },
  { term: 'RCI Care', desc: 'Rehabilitation Council of India aligned Clinical Psychology, Speech (SLP), Audiology & Special Education workflows.' },
];

interface RoleOnboardingBannerProps {
  schoolId: string;
  userId: string;
  role: UserRole;
  userName: string;
  onNavigateTab: (tab: WorkspaceTab) => void;
}

export const RoleOnboardingBanner: React.FC<RoleOnboardingBannerProps> = ({
  schoolId,
  userId,
  role,
  userName,
  onNavigateTab,
}) => {
  const storageKey = `rai_onboarding_v1_${schoolId}_${userId}`;
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${storageKey}_dismissed`) === '1';
    } catch {
      return false;
    }
  });
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(`${storageKey}_done`);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [showGlossary, setShowGlossary] = useState(false);

  const steps = useMemo(() => ROLE_QUICK_START[role] || [], [role]);
  if (dismissed || steps.length === 0) return null;

  const doneCount = steps.filter((s) => completedIds.includes(s.id)).length;

  function markStepAndGo(step: QuickStartStep) {
    const next = Array.from(new Set([...completedIds, step.id]));
    setCompletedIds(next);
    try {
      localStorage.setItem(`${storageKey}_done`, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
    onNavigateTab(step.targetTab);
  }

  function handleDismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(`${storageKey}_dismissed`, '1');
    } catch {
      // ignore storage errors
    }
  }

  return (
    <section
      aria-label="Quick start checklist"
      data-testid="role-onboarding-banner"
      className="mb-5 rounded-xl border border-[#D6B66D]/50 bg-gradient-to-r from-[#FAF5EA] via-white to-[#F0F6FB] p-4 shadow-2xs print:hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#142B46] text-[#D6B66D]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-[#142B46]">
              Welcome, {userName.split(' ')[0]} · Quick-Start Guide ({doneCount}/{steps.length})
            </p>
            <p className="text-[11px] text-slate-600">
              Jump straight to your top 3 daily actions — press <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 font-mono text-[10px]">Ctrl+K</kbd> anytime to search.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGlossary((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5 text-[#142B46]" />
            {showGlossary ? 'Hide Terms' : 'Key Terms'}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss quick start checklist"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {steps.map((step, idx) => {
          const isDone = completedIds.includes(step.id);
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => markStepAndGo(step)}
              className={`group text-left rounded-lg border p-3 transition-all flex flex-col justify-between gap-1.5 ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-slate-200 bg-white hover:border-[#142B46]/50 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 inline-flex items-center gap-1.5">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#142B46]/10 font-mono text-[10px] font-bold text-[#142B46] shrink-0">
                      {idx + 1}
                    </span>
                  )}
                  {step.label}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#142B46] shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">{step.detail}</p>
            </button>
          );
        })}
      </div>

      {showGlossary && (
        <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PLATFORM_GLOSSARY.map((item) => (
            <div key={item.term} className="rounded-lg bg-white border border-slate-200 p-2.5">
              <p className="text-[11px] font-bold text-[#142B46]">{item.term}</p>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
