import React, { useState } from 'react';
import {
  BookOpenCheck,
  CalendarCheck2,
  CalendarClock,
  HeartHandshake,
  Printer,
  Receipt,
  Users,
} from 'lucide-react';
import type { FeePaymentReceipt, StudentRecord } from '../types';
import type { WorkspaceData, WorkspaceTab } from '../types/workspace';
import type { ParentLang } from '../utils/parentTranslations';
import { PrintableFeeReceiptModal } from './PrintableFeeReceiptModal';

interface ParentQuickDigestCardProps {
  data: WorkspaceData;
  linkedStudent: StudentRecord;
  allChildren: StudentRecord[];
  onSelectChild: (studentId: string) => void;
  todayStatusLabel: string;
  activeHomeworkCount: number;
  pendingHomeworkCount: number;
  parentLang: ParentLang;
  onNavigate: (tab: WorkspaceTab) => void;
  onOpenStudent?: (studentId: string) => void;
}

export const ParentQuickDigestCard: React.FC<ParentQuickDigestCardProps> = ({
  data,
  linkedStudent,
  allChildren,
  onSelectChild,
  todayStatusLabel,
  activeHomeworkCount,
  pendingHomeworkCount,
  parentLang,
  onNavigate,
  onOpenStudent,
}) => {
  const isHi = parentLang === 'hi';
  const [receiptToPrint, setReceiptToPrint] = useState<FeePaymentReceipt | null>(null);

  const childReceipts = (data.feeReceipts || []).filter(
    (r) =>
      r.admissionNo === linkedStudent.admissionNo ||
      r.allocations.some(
        (a) => a.studentName.toLowerCase() === linkedStudent.name.toLowerCase(),
      ),
  );
  const latestReceipt = childReceipts[0] || (data.feeReceipts || [])[0] || null;
  const nextReminder = (data.feeReminders || [])
    .filter(
      (rem) =>
        rem.status !== 'Paid' &&
        ((rem.studentIds || []).includes(linkedStudent.id) ||
          rem.payerLabel.toLowerCase().includes(linkedStudent.name.toLowerCase())),
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  // Derive 1 warm, jargon-free home practice tip from real child data
  const activeTherapyPlan = (data.clinicalCare?.therapyPlans || []).find(
    (tp) => tp.studentId === linkedStudent.id && tp.approvalStatus === 'Approved & Active',
  );
  const activeRemedial = (data.remedialAssignments || []).find(
    (r) => r.studentId === linkedStudent.id && r.status !== 'Completed',
  );

  const homeTipText = activeTherapyPlan?.homePracticeRecommendations
    ? `${activeTherapyPlan.homePracticeRecommendations} (${activeTherapyPlan.dailyHomePracticeMin} min/day)`
    : activeRemedial
      ? activeRemedial.title
      : isHi
        ? 'प्रतिदिन 15 मिनट साथ बैठकर पाठ दोहराएँ और आज का होमवर्क नोटबुक देखें।'
        : 'Spend 15 calm minutes reviewing today’s notebook work and reading aloud together.';

  return (
    <section
      data-testid="parent-quick-digest"
      aria-label="This Week at a Glance"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Pinned Sibling Switcher (when 2+ children linked to family) */}
      {allChildren.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 px-5 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Users className="h-3.5 w-3.5 text-blue-900 shrink-0" />
            <span>{isHi ? 'बच्चा चुनें:' : 'Switch Child:'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {allChildren.map((child) => {
              const active = child.id === linkedStudent.id;
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => onSelectChild(child.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition ${
                    active
                      ? 'bg-blue-900 text-white'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {child.name} · {child.classSection}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 px-5 py-4 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            {isHi
              ? `${linkedStudent.name} का इस सप्ताह का सरल सारांश`
              : `This Week at a Glance — ${linkedStudent.name}`}
          </h2>
          <p className="text-xs text-slate-500 tabular-nums">
            Class {linkedStudent.classSection} · Roll {linkedStudent.rollNo} · Adm{' '}
            {linkedStudent.admissionNo}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 print:hidden">
          {onOpenStudent && (
            <button
              type="button"
              onClick={() => onOpenStudent(linkedStudent.id)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              {isHi ? 'पूरा 360° रिपोर्ट' : 'Full 360° Report'}
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
          >
            <Printer className="h-3.5 w-3.5" />
            {isHi ? 'सारांश प्रिंट करें' : 'Print Summary'}
          </button>
        </div>
      </div>

      {/* 3-Card Plain-Language Digest Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        <div className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <CalendarCheck2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span>{isHi ? '1. उपस्थिति (Attendance)' : '1. Attendance'}</span>
          </div>
          <p className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
            {linkedStudent.attendancePct}%{' '}
            <span className="font-sans text-xs font-medium text-emerald-700">
              · {todayStatusLabel}
            </span>
          </p>
          <p className="text-xs text-slate-600">
            {linkedStudent.attendancePct >= 85
              ? isHi
                ? 'नियमित स्कूल उपस्थिति बहुत अच्छी है।'
                : 'Regular school attendance is on track.'
              : isHi
                ? 'नियमित उपस्थिति बढ़ाने के लिए कक्षा अध्यापक से जुड़ें।'
                : 'Try to keep daily attendance steady; reach out if unwell.'}
          </p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <BookOpenCheck className="h-3.5 w-3.5 text-blue-900 shrink-0" />
            <span>{isHi ? '2. आज का होमवर्क' : "2. Today's Homework"}</span>
          </div>
          <p className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
            {activeHomeworkCount}{' '}
            <span className="font-sans text-xs font-medium text-slate-600">
              {isHi ? 'सक्रिय' : 'active'} · {pendingHomeworkCount}{' '}
              {isHi ? 'बाकी' : 'pending check'}
            </span>
          </p>
          <p className="text-xs text-slate-600">
            {pendingHomeworkCount === 0
              ? isHi
                ? 'सभी होमवर्क समय पर पूरे हैं।'
                : 'All active class tasks are caught up.'
              : isHi
                ? 'कृपया आज शाम बच्चे के साथ होमवर्क पूरा करवाएँ।'
                : 'Check the homework list below to help finish pending work.'}
          </p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <HeartHandshake className="h-3.5 w-3.5 text-amber-700 shrink-0" />
              <span>{isHi ? '3. घर पर 1 आसान अभ्यास' : '3. One Simple Home Tip'}</span>
            </div>
            {activeTherapyPlan && (
              <button
                type="button"
                onClick={() => onNavigate('clinical_care')}
                className="text-[11px] font-semibold text-blue-900 hover:underline whitespace-nowrap shrink-0"
              >
                {isHi ? 'खोलें →' : 'Open →'}
              </button>
            )}
          </div>
          <p className="text-sm font-medium text-slate-900 leading-snug">{homeTipText}</p>
        </div>
      </div>

      {/* Latest Official Fee Receipt & Next Expected Fee Reminder Strip */}
      {(latestReceipt || nextReminder) && (
        <div className="border-t border-slate-200 bg-[#FAF4EC]/80 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#142B46]">
            {latestReceipt && (
              <span className="inline-flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span>
                  {isHi ? 'नवीनतम रसीद' : 'Latest Receipt'}{' '}
                  <strong className="font-mono">{latestReceipt.receiptNo}</strong> ·{' '}
                  {isHi ? 'माह तक भुगतान' : 'Paid till'}{' '}
                  <strong>{latestReceipt.paidTillMonth || latestReceipt.monthKey}</strong> ·{' '}
                  {isHi ? 'शेष राशि' : 'Pending'}{' '}
                  <strong className="font-mono text-[#7B5D1C]">
                    ₹{(latestReceipt.totalPendingBalanceInr ?? linkedStudent.feeBalanceInr).toLocaleString('en-IN')}
                  </strong>
                </span>
              </span>
            )}
            {nextReminder && (
              <span className="inline-flex items-center gap-1.5 text-[#7B5D1C]">
                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {isHi ? 'अगली अपेक्षित फीस' : 'Next Expected Fee'}:{' '}
                  <strong className="font-mono">
                    ₹{nextReminder.expectedAmountInr.toLocaleString('en-IN')}
                  </strong>{' '}
                  ({nextReminder.dueDate})
                </span>
              </span>
            )}
          </div>
          {latestReceipt && (
            <button
              type="button"
              onClick={() => setReceiptToPrint(latestReceipt)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#142B46] bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-[#F3E6D8]/60 whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <Printer className="h-3.5 w-3.5" />
              {isHi ? 'फीस रसीद प्रिंट करें' : 'Print Fee Receipt'}
            </button>
          )}
        </div>
      )}

      <PrintableFeeReceiptModal
        receipt={receiptToPrint}
        school={data.activeSchool}
        onClose={() => setReceiptToPrint(null)}
      />
    </section>
  );
};
