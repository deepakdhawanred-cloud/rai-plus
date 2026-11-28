import React, { useMemo, useState } from 'react';
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  Download,
  Edit3,
  FileDown,
  GitMerge,
  IndianRupee,
  PlusCircle,
  Printer,
  Receipt,
  RotateCcw,
  Search,
  Users,
  X,
} from 'lucide-react';
import type {
  CanonicalFeePaymentPlan,
  FeeLedgerAccount,
  FeeMonthKey,
  FeePaymentMode,
  FeePaymentReceipt,
  FeeReminderCalendarEvent,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import {
  ACADEMIC_FEE_MONTHS,
  CANONICAL_PAYMENT_PLANS,
  allocateFamilyPayment,
  buildStudentPaymentTimeline,
  computeFinancialDashboardMetrics,
  computeStudentFeeMonthAllocation,
  normalizePaymentPlan,
  resolveCurrentAcademicFeeMonth,
  type SiblingAlertCardView,
} from '../../utils/financialDashboardEngine';
import { ClassMonthlyFeeChart } from '../ClassMonthlyFeeChart';
import { AccountantDashboardPanel } from '../AccountantDashboardPanel';
import { MonthlyExpenseBreakdownChart } from '../MonthlyExpenseBreakdownChart';
import { PrintableFeeReceiptModal } from '../PrintableFeeReceiptModal';
import { FeeReminderCalendar } from '../FeeReminderCalendar';
import { SchoolFeeStructureManager } from '../SchoolFeeStructureManager';
import {
  StudentPaymentMiniTimeline,
  StudentPaymentTimelineModal,
} from '../StudentPaymentTimelinePanel';
import { DefaulterNotificationCenter } from '../DefaulterNotificationCenter';
import {
  exportDefaultersListPdf,
  exportStudentPaymentTimelinePdf,
} from '../../utils/financialPdfExporter';
import { pushToast } from '../ToastProvider';

interface FinancialDashboardModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

type SiblingTab = 'Alert' | 'Merged' | 'Dismissed';

interface CollectModalTarget {
  mode: 'family' | 'single' | 'quick';
  familyCard?: SiblingAlertCardView;
  singleAccount?: FeeLedgerAccount;
}

const INR = new Intl.NumberFormat('en-IN');

function formatInr(amount: number): string {
  return `₹${INR.format(Math.round(amount || 0))}`;
}

function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getNextAcademicMonth(month: FeeMonthKey): FeeMonthKey {
  const idx = ACADEMIC_FEE_MONTHS.indexOf(month);
  if (idx < 0 || idx === ACADEMIC_FEE_MONTHS.length - 1) return 'March';
  return ACADEMIC_FEE_MONTHS[idx + 1];
}

function suggestNextExpectedFeeDate(baseIso: string): string {
  const parts = baseIso.split('-').map(Number);
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
    const dt = new Date(parts[0], parts[1], 10); // 10th of next calendar month
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const next = new Date();
  next.setMonth(next.getMonth() + 1, 10);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
}

export const FinancialDashboardModule: React.FC<FinancialDashboardModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const {
    user,
    activeSchool,
    feeAccounts = [],
    siblingGroups = [],
    financialTarget,
    feeReceipts = [],
    feeReminders = [],
    feeStructure = [],
    feeDefaulterAlertConfig,
    feeDefaulterAlertLogs = [],
    notificationGatewayStatus,
    students = [],
    schoolUsers = [],
  } = data;

  const canMutateFinance = ['super_admin', 'school_admin', 'principal'].includes(user.role);
  const canCollectFees = ['super_admin', 'school_admin', 'principal', 'accountant'].includes(
    user.role,
  );
  const canTriageSiblings = [
    'super_admin',
    'school_admin',
    'principal',
    'coordinator',
  ].includes(user.role);

  const [financeView, setFinanceView] = useState<'accounting' | 'fees' | 'structure'>(
    user.role === 'accountant' ? 'accounting' : 'fees',
  );
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [siblingTab, setSiblingTab] = useState<SiblingTab>('Alert');
  const [siblingSearch, setSiblingSearch] = useState<string>('');
  const [showAllDefaulters, setShowAllDefaulters] = useState<boolean>(false);

  // Target override editor state
  const [editingTarget, setEditingTarget] = useState<boolean>(false);
  const [targetInput, setTargetInput] = useState<string>('');
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [categorizingExpensesAi, setCategorizingExpensesAi] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const accountingEntries = data.accountingEntries || [];
  const hasUnlabeledExpenses = useMemo(
    () =>
      accountingEntries.some(
        (e) => e.direction === 'Expense' && e.status !== 'rejected' && !e.expenseClassification,
      ),
    [accountingEntries],
  );

  async function handleOverviewCategorizeExpenses() {
    setCategorizingExpensesAi(true);
    setFeedback(null);
    try {
      const res = await apiRequest<{
        ok: boolean;
        categorizedCount: number;
        message?: string;
        breakdown: { Operational: number; Administrative: number; Developmental: number };
      }>(
        '/api/accounting/entries/categorize-ai',
        {
          method: 'POST',
          body: JSON.stringify({
            mode: hasUnlabeledExpenses ? 'unclassified' : 'all',
          }),
        },
        token,
      );
      if (res.categorizedCount === 0) {
        setFeedback({
          type: 'ok',
          text: res.message || 'All expense entries are already categorized.',
        });
      } else {
        setFeedback({
          type: 'ok',
          text: `Gemini categorized ${res.categorizedCount} expenses: ${res.breakdown.Operational} Operational, ${res.breakdown.Administrative} Administrative, ${res.breakdown.Developmental} Developmental.`,
        });
      }
      await onRefresh();
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to categorize expenses with Gemini.',
      });
    } finally {
      setCategorizingExpensesAi(false);
    }
  }

  // Fee Collection & Printable Receipt Modal state
  const [collectModal, setCollectModal] = useState<CollectModalTarget | null>(null);
  const [modalAccountSearch, setModalAccountSearch] = useState<string>('');
  const [selectedPaymentPlan, setSelectedPaymentPlan] =
    useState<CanonicalFeePaymentPlan>('Monthly');
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<FeePaymentMode>('UPI');
  const [paymentMonth, setPaymentMonth] = useState<FeeMonthKey>(
    financialTarget?.monthKey ?? 'November',
  );
  const [paidTillMonth, setPaidTillMonth] = useState<FeeMonthKey>(
    financialTarget?.monthKey ?? 'November',
  );
  const [paidDateInput, setPaidDateInput] = useState<string>(getTodayIso());
  const [nextExpectedFeeDate, setNextExpectedFeeDate] = useState<string>('');
  const [nextExpectedFeeAmountInput, setNextExpectedFeeAmountInput] = useState<string>('');
  const [nextExpectedFeeMonth, setNextExpectedFeeMonth] = useState<FeeMonthKey>('December');
  const [paymentRemarks, setPaymentRemarks] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [receiptToPrint, setReceiptToPrint] = useState<FeePaymentReceipt | null>(null);
  const [timelineAccount, setTimelineAccount] = useState<FeeLedgerAccount | null>(null);
  const [timelineExplorerQuery, setTimelineExplorerQuery] = useState<string>('');

  const currentTodayIso = useMemo(() => getTodayIso(), []);
  const resolvedActiveMonth = financialTarget?.monthKey ?? resolveCurrentAcademicFeeMonth(currentTodayIso);

  // School-wide metrics (unfiltered by class, used for top KPIs + class directory)
  const schoolMetrics = useMemo(
    () =>
      computeFinancialDashboardMetrics({
        accounts: feeAccounts,
        siblingGroups,
        targetConfig: financialTarget,
        activeMonth: resolvedActiveMonth,
        todayIso: currentTodayIso,
        classFilter: 'ALL',
        topDefaultersPerClassLimit: 3,
      }),
    [feeAccounts, siblingGroups, financialTarget, resolvedActiveMonth, currentTodayIso],
  );

  // Filtered view metrics when class filter is active
  const activeMetrics = useMemo(
    () =>
      classFilter === 'ALL'
        ? schoolMetrics
        : computeFinancialDashboardMetrics({
            accounts: feeAccounts,
            siblingGroups,
            targetConfig: financialTarget,
            activeMonth: resolvedActiveMonth,
            todayIso: currentTodayIso,
            classFilter,
            topDefaultersPerClassLimit: 5,
          }),
    [
      classFilter,
      feeAccounts,
      financialTarget,
      schoolMetrics,
      siblingGroups,
      resolvedActiveMonth,
      currentTodayIso,
    ],
  );

  const availableClasses = useMemo(
    () => schoolMetrics.classSummaries.map((c) => c.className),
    [schoolMetrics.classSummaries],
  );

  const filteredDefaulters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = activeMetrics.schoolTopDefaulters;
    if (!q) return list;
    return list.filter(
      (a) =>
        a.studentName.toLowerCase().includes(q) ||
        a.fatherName.toLowerCase().includes(q) ||
        a.admissionNo.toLowerCase().includes(q) ||
        a.className.toLowerCase().includes(q) ||
        a.contactNo.toLowerCase().includes(q) ||
        a.remarks.toLowerCase().includes(q),
    );
  }, [activeMetrics.schoolTopDefaulters, searchQuery]);

  const displayedDefaulters = showAllDefaulters
    ? filteredDefaulters
    : filteredDefaulters.slice(0, 25);

  const timelineExplorerMatches = useMemo(() => {
    const q = timelineExplorerQuery.trim().toLowerCase();
    if (!q) return [];
    const scoped =
      classFilter === 'ALL'
        ? feeAccounts
        : feeAccounts.filter((a) => a.className === classFilter);
    return scoped
      .filter(
        (a) =>
          a.studentName.toLowerCase().includes(q) ||
          a.admissionNo.toLowerCase().includes(q) ||
          a.fatherName.toLowerCase().includes(q) ||
          a.className.toLowerCase().includes(q) ||
          a.contactNo.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [feeAccounts, classFilter, timelineExplorerQuery]);

  const siblingCardsForTab = useMemo(() => {
    const base =
      siblingTab === 'Alert'
        ? activeMetrics.siblingAlerts
        : siblingTab === 'Merged'
          ? activeMetrics.mergedFamilies
          : activeMetrics.dismissedFamilies;
    const q = siblingSearch.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (card) =>
        card.group.guardianName.toLowerCase().includes(q) ||
        card.group.contactNo.toLowerCase().includes(q) ||
        card.group.address.toLowerCase().includes(q) ||
        card.members.some(
          (m) =>
            m.studentName.toLowerCase().includes(q) ||
            m.className.toLowerCase().includes(q) ||
            m.remarks.toLowerCase().includes(q),
        ),
    );
  }, [
    activeMetrics.dismissedFamilies,
    activeMetrics.mergedFamilies,
    activeMetrics.siblingAlerts,
    siblingSearch,
    siblingTab,
  ]);

  const maxMonthlyCollected = useMemo(
    () => Math.max(1, ...activeMetrics.monthlySeries.map((m) => m.collectedInr)),
    [activeMetrics.monthlySeries],
  );

  async function handleSaveTargetOverride(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(targetInput.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFeedback({ type: 'err', text: 'Enter a valid positive INR monthly target.' });
      return;
    }
    setBusyAction('target');
    setFeedback(null);
    try {
      await apiRequest(
        '/api/finance/target',
        {
          method: 'POST',
          body: JSON.stringify({
            overrideTargetInr: Math.round(parsed),
            monthKey: activeMetrics.activeMonth,
          }),
        },
        token,
      );
      await onRefresh();
      setEditingTarget(false);
      setFeedback({
        type: 'ok',
        text: `Saved ${activeMetrics.activeMonth} target override: ${formatInr(Math.round(parsed))}.`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to update monthly target.',
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleResetTargetToSchedule() {
    setBusyAction('target-reset');
    setFeedback(null);
    try {
      await apiRequest(
        '/api/finance/target',
        {
          method: 'POST',
          body: JSON.stringify({
            overrideTargetInr: null,
            monthKey: activeMetrics.activeMonth,
          }),
        },
        token,
      );
      await onRefresh();
      setEditingTarget(false);
      setFeedback({
        type: 'ok',
        text: `Reset ${activeMetrics.activeMonth} target to schedule-computed expectation (${formatInr(schoolMetrics.scheduleExpectedMonthInr)}).`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to reset monthly target.',
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSiblingAction(groupId: string, action: 'merge' | 'dismiss') {
    setBusyAction(`${action}:${groupId}`);
    setFeedback(null);
    try {
      await apiRequest(
        `/api/finance/sibling-groups/${groupId}/${action}`,
        { method: 'POST' },
        token,
      );
      await onRefresh();
      setFeedback({
        type: 'ok',
        text:
          action === 'merge'
            ? 'Sibling accounts confirmed & auto-merged into unified family payment ledger.'
            : 'Sibling pairing alert dismissed.',
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to update sibling cluster.',
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleUpdateStudentPaymentPlan(
    acc: FeeLedgerAccount,
    nextPlan: CanonicalFeePaymentPlan,
  ) {
    setBusyAction(`plan:${acc.id}`);
    setFeedback(null);
    try {
      await apiRequest(
        `/api/finance/accounts/${acc.id}/schedule`,
        {
          method: 'PATCH',
          body: JSON.stringify({ scheduleCadence: nextPlan }),
        },
        token,
      );
      await onRefresh();
      const msg = `${acc.studentName} payment plan updated to ${nextPlan}. Coming expected payments recalculated.`;
      setFeedback({ type: 'ok', text: msg });
      pushToast(msg, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to update student payment plan.';
      setFeedback({ type: 'err', text: msg });
      pushToast(msg, 'error');
    } finally {
      setBusyAction(null);
    }
  }

  function applyAutoAllocationToFields(
    accounts: FeeLedgerAccount[],
    amountInr: number,
    plan: CanonicalFeePaymentPlan,
    dateIso: string,
  ) {
    const auto = computeStudentFeeMonthAllocation({
      accounts,
      paymentNowInr: amountInr,
      scheduleCadence: plan,
      paymentDateIso: dateIso,
    });
    setPaidTillMonth(auto.paidTillMonth);
    setPaymentMonth(
      auto.coveredMonths[auto.coveredMonths.length - 1] ??
        auto.partialAdjustment?.month ??
        auto.paidTillMonth,
    );
    if (auto.nextExpectedInstallment && auto.remainingPendingAfterInr > 0) {
      setNextExpectedFeeDate(auto.nextExpectedInstallment.dueDate);
      setNextExpectedFeeAmountInput(String(auto.nextExpectedInstallment.expectedAmountInr));
      setNextExpectedFeeMonth(
        auto.nextExpectedInstallment.months[0] ?? getNextAcademicMonth(auto.paidTillMonth),
      );
    } else {
      setNextExpectedFeeDate('');
      setNextExpectedFeeAmountInput('');
      setNextExpectedFeeMonth(getNextAcademicMonth(auto.paidTillMonth));
    }
  }

  function hydrateModalDefaultsForAccounts(
    accounts: FeeLedgerAccount[],
    preferredAmountInr?: number,
    preferredPlan?: CanonicalFeePaymentPlan,
  ) {
    const today = getTodayIso();
    const resolvedPlan = preferredPlan ?? normalizePaymentPlan(accounts[0]?.scheduleCadence);
    setSelectedPaymentPlan(resolvedPlan);

    // Inspect pre-payment status to auto-suggest the student's current plan installment
    const preAlloc = computeStudentFeeMonthAllocation({
      accounts,
      paymentNowInr: 0,
      scheduleCadence: resolvedPlan,
      paymentDateIso: today,
    });

    const totalPending = preAlloc.totalPendingBeforeInr;
    const defaultAmt =
      preferredAmountInr && preferredAmountInr > 0
        ? Math.min(totalPending, Math.round(preferredAmountInr))
        : preAlloc.recommendedInstallmentAmountInr > 0
          ? preAlloc.recommendedInstallmentAmountInr
          : totalPending;

    setPaymentAmountInput(defaultAmt > 0 ? String(defaultAmt) : '');
    setPaymentMode('UPI');
    setPaidDateInput(today);
    setPaymentRemarks('');
    setModalError(null);

    applyAutoAllocationToFields(accounts, defaultAmt, resolvedPlan, today);
  }

  function openCollectModal(target: CollectModalTarget, preferredAmountInr?: number) {
    setCollectModal(target);
    setModalAccountSearch('');
    const targetAccounts =
      target.mode === 'family' && target.familyCard
        ? target.familyCard.members
        : target.singleAccount
          ? [target.singleAccount]
          : [];
    if (targetAccounts.length > 0) {
      hydrateModalDefaultsForAccounts(targetAccounts, preferredAmountInr);
    } else {
      const today = getTodayIso();
      setSelectedPaymentPlan('Monthly');
      setPaymentAmountInput('');
      setPaymentMode('UPI');
      setPaymentMonth(activeMetrics.activeMonth);
      setPaidTillMonth(activeMetrics.activeMonth);
      setPaidDateInput(today);
      setNextExpectedFeeDate(suggestNextExpectedFeeDate(today));
      setNextExpectedFeeAmountInput('');
      setNextExpectedFeeMonth(getNextAcademicMonth(activeMetrics.activeMonth));
      setPaymentRemarks('');
      setModalError(null);
    }
  }

  function handleCollectFromReminder(rem: FeeReminderCalendarEvent) {
    if (rem.familyGroupId) {
      const famCard = schoolMetrics.mergedFamilies.find((f) => f.group.id === rem.familyGroupId);
      if (famCard && famCard.combinedBalanceInr > 0) {
        openCollectModal({ mode: 'family', familyCard: famCard }, rem.expectedAmountInr);
        return;
      }
    }
    const primaryAccId = rem.accountIds[0];
    const acc = feeAccounts.find((a) => a.id === primaryAccId);
    if (acc && acc.balanceFeesInr > 0) {
      openCollectModal({ mode: 'single', singleAccount: acc }, rem.expectedAmountInr);
      return;
    }
    openCollectModal({ mode: 'quick' });
  }

  const quickPickerAccounts = useMemo(() => {
    const pending = feeAccounts
      .filter((a) => a.balanceFeesInr > 0)
      .sort((a, b) => b.balanceFeesInr - a.balanceFeesInr);
    const q = modalAccountSearch.trim().toLowerCase();
    if (!q) return pending.slice(0, 12);
    return pending
      .filter(
        (a) =>
          a.studentName.toLowerCase().includes(q) ||
          a.fatherName.toLowerCase().includes(q) ||
          a.admissionNo.toLowerCase().includes(q) ||
          a.className.toLowerCase().includes(q) ||
          a.contactNo.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [feeAccounts, modalAccountSearch]);

  const modalTargetAccounts = useMemo(() => {
    if (!collectModal) return [] as FeeLedgerAccount[];
    if (collectModal.mode === 'family' && collectModal.familyCard) {
      return collectModal.familyCard.members;
    }
    if (collectModal.singleAccount) {
      return [collectModal.singleAccount];
    }
    return [] as FeeLedgerAccount[];
  }, [collectModal]);

  const modalPreviousPendingInr = useMemo(
    () => modalTargetAccounts.reduce((sum, a) => sum + (a.balanceFeesInr || 0), 0),
    [modalTargetAccounts],
  );

  const modalPaidNowNumeric = useMemo(() => {
    const n = Math.round(Number(paymentAmountInput) || 0);
    return n > 0 ? n : 0;
  }, [paymentAmountInput]);

  const modalRemainingPendingInr = Math.max(0, modalPreviousPendingInr - modalPaidNowNumeric);

  const liveMonthAllocation = useMemo(() => {
    if (modalTargetAccounts.length === 0) return null;
    return computeStudentFeeMonthAllocation({
      accounts: modalTargetAccounts,
      paymentNowInr: modalPaidNowNumeric,
      scheduleCadence: selectedPaymentPlan,
      paymentDateIso: paidDateInput || getTodayIso(),
    });
  }, [modalTargetAccounts, modalPaidNowNumeric, selectedPaymentPlan, paidDateInput]);

  const liveModalPreview = useMemo(() => {
    if (!collectModal || modalTargetAccounts.length === 0) return null;
    const primaryId =
      collectModal.mode === 'family' && collectModal.familyCard
        ? collectModal.familyCard.group.primaryAccountId
        : collectModal.singleAccount?.id;
    const amt = Number(paymentAmountInput);
    if (!Number.isFinite(amt) || amt <= 0) {
      return { valid: false, error: 'Enter payment amount in INR.', allocations: [] };
    }
    return allocateFamilyPayment(modalTargetAccounts, amt, primaryId);
  }, [collectModal, modalTargetAccounts, paymentAmountInput]);

  async function handleSubmitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!collectModal || modalTargetAccounts.length === 0) {
      setModalError('Select a student or family fee account first.');
      return;
    }
    if (!liveModalPreview?.valid) {
      setModalError(liveModalPreview?.error || 'Enter a valid payment amount.');
      return;
    }

    const parsedNextExpectedAmt = Number(nextExpectedFeeAmountInput);
    const trimmedNextDate = nextExpectedFeeDate.trim();

    setBusyAction('collect-fee');
    setModalError(null);
    setFeedback(null);
    try {
      const baseFields = {
        paymentAmountInr: Math.round(Number(paymentAmountInput)),
        paymentMode,
        monthKey: paymentMonth,
        scheduleCadence: selectedPaymentPlan,
        paidTillMonth,
        paidDate: paidDateInput || getTodayIso(),
        nextExpectedFeeDate: modalRemainingPendingInr > 0 && trimmedNextDate ? trimmedNextDate : undefined,
        nextExpectedFeeAmountInr:
          modalRemainingPendingInr > 0 && Number.isFinite(parsedNextExpectedAmt) && parsedNextExpectedAmt > 0
            ? Math.round(parsedNextExpectedAmt)
            : modalRemainingPendingInr > 0 && trimmedNextDate
              ? modalRemainingPendingInr
              : undefined,
        nextExpectedFeeMonth:
          modalRemainingPendingInr > 0 && trimmedNextDate ? nextExpectedFeeMonth : undefined,
        remarks: paymentRemarks.trim() || undefined,
      };

      const payload =
        collectModal.mode === 'family' && collectModal.familyCard
          ? {
              familyGroupId: collectModal.familyCard.group.id,
              ...baseFields,
            }
          : {
              accountId: collectModal.singleAccount?.id,
              ...baseFields,
            };

      const res = await apiRequest<{
        receipt: FeePaymentReceipt;
        reminder?: FeeReminderCalendarEvent | null;
      }>(
        '/api/finance/collect',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        token,
      );
      await onRefresh();
      setCollectModal(null);
      setReceiptToPrint(res.receipt);
      const reminderNote = res.reminder?.dueDate
        ? ` Next expected fee reminder synced to calendar for ${res.reminder.dueDate}.`
        : '';
      const message = `Receipt ${res.receipt.receiptNo} issued (${formatInr(res.receipt.amountInr)} · Paid till ${res.receipt.paidTillMonth || paidTillMonth} · Pending ${formatInr(res.receipt.totalPendingBalanceInr ?? 0)}).${reminderNote}`;
      setFeedback({ type: 'ok', text: message });
      pushToast(message, 'success');
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Fee collection failed.');
    } finally {
      setBusyAction(null);
    }
  }

  function handleExportCsv() {
    const headers = [
      'Rank',
      'Priority Score',
      'Risk Tier',
      'Admission No',
      'Student Name',
      'Father Name',
      'Class',
      'Contact No',
      'Schedule',
      'Payment Nature',
      `Months Paid (Apr-${activeMetrics.activeMonth.slice(0, 3)})`,
      'Last Payment Month',
      'Paid Till',
      'Gross Fee (INR)',
      'Paid YTD (INR)',
      '% Paid',
      '% Left',
      `Overdue Till ${activeMetrics.activeMonth} (INR)`,
      'Last Year Balance (INR)',
      'Yearly Demand (INR)',
      'Fine (INR)',
      'Balance Due (INR)',
      'Remarks',
    ];
    const rows = filteredDefaulters.map((acc, idx) => {
      const tl = buildStudentPaymentTimeline({
        account: acc,
        activeMonth: activeMetrics.activeMonth,
        receipts: feeReceipts,
      });
      return [
        String(idx + 1),
        String(acc.defaulterMetrics.defaulterPriorityScore),
        acc.defaulterMetrics.riskTier,
        acc.admissionNo,
        acc.studentName,
        acc.fatherName,
        acc.className,
        acc.contactNo,
        acc.scheduleCadence,
        tl.paymentNature,
        `${tl.activePaymentMonthsCount}/${tl.monthsElapsed}`,
        tl.lastPaymentMonth || 'None',
        acc.defaulterMetrics.paidTillMonthLabel,
        String(acc.defaulterMetrics.grossFeeInr),
        String(acc.paidAmountInr),
        `${acc.defaulterMetrics.percentPaid}%`,
        `${acc.defaulterMetrics.percentLeft}%`,
        String(acc.defaulterMetrics.overdueTillCurrentMonthInr),
        String(acc.lastYearBalanceInr),
        String(acc.yearlyDemandInr),
        String(acc.fineInr),
        String(acc.balanceFeesInr),
        acc.remarks,
      ];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeSchool.code.toLowerCase()}-fee-defaulters-${activeMetrics.activeMonth.toLowerCase()}-${classFilter.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleExportDefaultersPdf() {
    const filename = exportDefaultersListPdf({
      schoolName: activeSchool.name,
      schoolCode: activeSchool.code,
      session: activeSchool.session,
      activeMonth: activeMetrics.activeMonth,
      classScope: classFilter,
      defaulters: filteredDefaulters,
      receipts: feeReceipts,
      paidTillCurrentMonthExcludedCount: activeMetrics.paidTillCurrentMonthPendingCount,
      generatedBy: user.name,
      generatedAtIso: currentTodayIso,
    });
    pushToast(`Saved ${filename} (${filteredDefaulters.length} accounts).`, 'success', {
      title: 'Defaulters PDF Downloaded',
    });
  }

  function handleExportStudentTimelinePdf(account: FeeLedgerAccount) {
    const filename = exportStudentPaymentTimelinePdf({
      account,
      schoolName: activeSchool.name,
      schoolCode: activeSchool.code,
      session: activeSchool.session,
      activeMonth: activeMetrics.activeMonth,
      receipts: feeReceipts,
      generatedBy: user.name,
      generatedAtIso: currentTodayIso,
    });
    pushToast(`Saved ${filename} for ${account.studentName}.`, 'success', {
      title: 'Payment Timeline PDF Downloaded',
    });
  }

  async function handleSendSingleDefaulterAlert(account: FeeLedgerAccount) {
    setBusyAction(`alert:${account.id}`);
    try {
      const res = await apiRequest<{
        dispatchedCount: number;
        records: Array<{ status: string; channel: string }>;
      }>(
        '/api/finance/defaulter-notifications/dispatch',
        {
          method: 'POST',
          body: JSON.stringify({
            mode: 'single',
            accountId: account.id,
          }),
        },
        token,
      );
      await onRefresh();
      const first = res.records?.[0];
      pushToast(
        `${first?.channel || 'WhatsApp/Email'} fee alert dispatched for ${account.studentName} (${first?.status || 'Recorded'}).`,
        'success',
        { title: 'Parent Fee Alert Sent' },
      );
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : 'Unable to send parent fee alert.',
        'error',
        { title: 'Alert Dispatch Failed' },
      );
    } finally {
      setBusyAction(null);
    }
  }

  const mtdPctClamped = Math.min(100, Math.max(0, activeMetrics.mtdAttainmentPct));

  return (
    <div className="space-y-8">
      {/* Header & Class Scope Bar — full-width 2-row executive layout with zero wasted blank space */}
      <div className="space-y-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-amber-700">
              {activeSchool.name} · Session {activeSchool.session} · Financial Oversight
            </p>
            <h1 className="font-display text-2xl font-bold text-slate-900 mt-1">
              Real-Time Fee Collection &amp; Sibling Pairing Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Live ledger across{' '}
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {schoolMetrics.accountsTotal}
              </span>{' '}
              student fee accounts · Schedule-driven MTD targets · Per-class defaulters &amp; merged family households.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {canCollectFees && (
              <button
                type="button"
                data-testid="open-enter-fee-modal-btn"
                onClick={() => openCollectModal({ mode: 'quick' })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D3A5C] whitespace-nowrap shrink-0 shadow-xs"
              >
                <PlusCircle className="h-3.5 w-3.5 text-[#D6B66D]" />
                Enter Fee Received &amp; Print Receipt
              </button>
            )}

            <button
              type="button"
              data-testid="export-defaulters-pdf-btn"
              onClick={handleExportDefaultersPdf}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#142B46] bg-white px-3.5 py-2 text-xs font-semibold text-[#142B46] hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <FileDown className="h-3.5 w-3.5" />
              Export Defaulters PDF
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              Export Defaulters CSV
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="inline-flex flex-wrap rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setFinanceView('fees')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                financeView === 'fees'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Fee Ledgers
            </button>
            <button
              type="button"
              onClick={() => setFinanceView('accounting')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                financeView === 'accounting'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Finance 360° Accounting &amp; Payroll
            </button>
            <button
              type="button"
              data-testid="finance-tab-fee-structure"
              onClick={() => setFinanceView('structure')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                financeView === 'structure'
                  ? 'bg-[#142B46] text-[#D6B66D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              School Fee Structure
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="finance-class-filter" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Class Scope
            </label>
            <select
              id="finance-class-filter"
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setShowAllDefaulters(false);
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
            >
              <option value="ALL">All Classes ({schoolMetrics.accountsTotal})</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {financeView === 'structure' ? (
        <SchoolFeeStructureManager
          school={activeSchool}
          feeStructure={feeStructure}
          feeAccounts={feeAccounts}
          token={token}
          canEdit={canMutateFinance}
          onRefresh={onRefresh}
        />
      ) : (
        <>
          {financeView === 'accounting' ? (
            <AccountantDashboardPanel
              data={data}
              user={user}
              token={token}
              onRefresh={onRefresh}
            />
          ) : (
            <MonthlyExpenseBreakdownChart
              entries={accountingEntries}
              categorizingAi={categorizingExpensesAi}
              onCategorizeWithGemini={canCollectFees ? handleOverviewCategorizeExpenses : undefined}
              onOpenLedger={() => setFinanceView('accounting')}
            />
          )}

      {feedback && (
        <div
          role="status"
          className={`rounded-xl border px-5 py-3 text-xs font-medium flex items-center justify-between gap-4 ${
            feedback.type === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-500 hover:text-slate-900"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {!canCollectFees && (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs text-slate-600">
          Coordinator view: You can review class defaulters, monitor month-to-date targets, and confirm or dismiss sibling pairing alerts. Fee receipt collection and target overrides are restricted to Principal &amp; School Admin accounts.
        </div>
      )}

      {/* 4 Top Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Gross Receivable (LYB + 26–27)</p>
          <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-2">
            {formatInr(activeMetrics.totalGrossReceivableInr)}
          </p>
          <p className="font-mono text-xs text-slate-500 tabular-nums mt-1">
            LYB {formatInr(activeMetrics.totalLastYearBalanceInr)} · Session {formatInr(activeMetrics.totalYearlyDemandInr)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Total Collected YTD</p>
          <p className="font-mono text-2xl font-semibold text-emerald-700 tabular-nums mt-2">
            {formatInr(activeMetrics.totalCollectedYtdInr)}
          </p>
          <p className="font-mono text-xs text-slate-500 tabular-nums mt-1">
            {activeMetrics.collectionRatePct}% realized · {activeMetrics.settledAccountsCount} settled accounts
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Total Outstanding Balance</p>
          <p className="font-mono text-2xl font-semibold text-amber-700 tabular-nums mt-2">
            {formatInr(activeMetrics.totalOutstandingInr)}
          </p>
          <p className="font-mono text-xs text-slate-500 tabular-nums mt-1">
            {activeMetrics.defaulterAccountsCount} unpaid till {activeMetrics.activeMonth} · Fines {formatInr(activeMetrics.totalFinesInr)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-500">
              {activeMetrics.activeMonth} MTD Target
            </p>
            <span className="font-mono text-[11px] font-semibold text-blue-900 tabular-nums">
              {activeMetrics.isCustomTargetOverride ? 'Custom Target' : 'Schedule Auto'}
            </span>
          </div>
          <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-2">
            {formatInr(activeMetrics.effectiveMonthTargetInr)}
          </p>
          <p className="font-mono text-xs text-slate-500 tabular-nums mt-1">
            Collected {formatInr(activeMetrics.collectedThisMonthInr)} ({activeMetrics.mtdAttainmentPct}%)
          </p>
        </div>
      </div>

      {/* Next Expected Fee Reminder Calendar */}
      <FeeReminderCalendar
        reminders={feeReminders}
        receipts={feeReceipts}
        schoolName={activeSchool.name}
        token={token}
        canManage={canCollectFees}
        onRefresh={onRefresh}
        onPrintReceipt={(rcp) => setReceiptToPrint(rcp)}
        onCollectFromReminder={handleCollectFromReminder}
      />

      {/* Month-to-Date Target Engine & Monthly Cashflow Breakdown */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-blue-900" />
              {activeMetrics.activeMonth} 2026 Collection Pace &amp; Monthly Target
            </h2>
            <p className="text-xs text-slate-500">
              Schedule-driven expectation across Monthly, Quarterly, Periodic, and Yearly plans · Baseline:{' '}
              <span className="font-mono font-semibold text-slate-800 tabular-nums">
                {formatInr(activeMetrics.scheduleExpectedMonthInr)}
              </span>
            </p>
          </div>

          {canMutateFinance && classFilter === 'ALL' && !editingTarget && (
            <div className="flex items-center gap-2 shrink-0">
              {activeMetrics.isCustomTargetOverride && (
                <button
                  type="button"
                  disabled={busyAction === 'target-reset'}
                  onClick={() => void handleResetTargetToSchedule()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset to Schedule
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setTargetInput(String(schoolMetrics.effectiveMonthTargetInr));
                  setEditingTarget(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Monthly Target
              </button>
            </div>
          )}
        </div>

        {editingTarget && canMutateFinance && (
          <form
            onSubmit={handleSaveTargetOverride}
            className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex flex-col sm:flex-row sm:items-end gap-3"
          >
            <div className="flex-1 max-w-xs">
              <label htmlFor="mtd-target-override-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Custom {activeMetrics.activeMonth} Target (INR)
              </label>
              <input
                id="mtd-target-override-input"
                type="number"
                min={1}
                step={1}
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm text-slate-900 tabular-nums"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={busyAction === 'target'}
                className="rounded-lg bg-blue-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
              >
                {busyAction === 'target' ? 'Saving...' : 'Save Target'}
              </button>
              <button
                type="button"
                onClick={() => setEditingTarget(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="p-6 space-y-6">
          {/* MTD Progress + Daily/Weekly Expectations */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
            <div className="lg:col-span-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Month-to-Date Realization ({activeMetrics.activeMonth})
                </span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {formatInr(activeMetrics.collectedThisMonthInr)} /{' '}
                  {formatInr(activeMetrics.effectiveMonthTargetInr)} ({activeMetrics.mtdAttainmentPct}%)
                </span>
              </div>
              <div className="h-3 w-full rounded bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-blue-900 transition-all duration-300"
                  style={{ width: `${mtdPctClamped}%` }}
                />
              </div>
              <p className="font-mono text-xs text-slate-500 tabular-nums">
                Remaining Monthly Gap: {formatInr(activeMetrics.remainingMonthGapInr)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">Expected Today</p>
              <p className="font-mono text-lg font-semibold text-slate-900 tabular-nums mt-0.5">
                {formatInr(activeMetrics.expectedTodayInr)}
              </p>
              <p className="font-mono text-[11px] text-slate-500 tabular-nums">
                Required Run-Rate / Day
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">Expected This Week</p>
              <p className="font-mono text-lg font-semibold text-slate-900 tabular-nums mt-0.5">
                {formatInr(activeMetrics.expectedThisWeekInr)}
              </p>
              <p className="font-mono text-[11px] text-slate-500 tabular-nums">
                6-day operational window
              </p>
            </div>
          </div>

          {/* 12-Month Academic Cashflow Strip */}
          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-700">
                Session 2026–27 Monthly Collection Ledger (April – March)
              </p>
              <span className="text-xs text-slate-500">
                Active session month: {activeMetrics.activeMonth}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2">
              {activeMetrics.monthlySeries.map((pt) => {
                const barHeightPct = Math.round((pt.collectedInr / maxMonthlyCollected) * 100);
                const isActive = pt.monthKey === activeMetrics.activeMonth;
                return (
                  <div
                    key={pt.monthKey}
                    className={`rounded-lg border p-2.5 flex flex-col justify-between ${
                      isActive ? 'border-blue-900 bg-blue-50/40' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-slate-700 truncate">
                      {pt.monthKey.slice(0, 3)}
                    </span>
                    <div className="h-12 flex items-end my-2">
                      <div
                        className={`w-full rounded-sm ${
                          isActive ? 'bg-blue-900' : pt.collectedInr > 0 ? 'bg-emerald-600' : 'bg-slate-200'
                        }`}
                        style={{ height: `${Math.max(6, barHeightPct)}%` }}
                      />
                    </div>
                    <div>
                      <p className="font-mono text-[11px] font-semibold text-slate-900 tabular-nums truncate">
                        {pt.collectedInr >= 100000
                          ? `₹${(pt.collectedInr / 100000).toFixed(1)}L`
                          : pt.collectedInr >= 1000
                            ? `₹${(pt.collectedInr / 1000).toFixed(0)}k`
                            : `₹${pt.collectedInr}`}
                      </p>
                      <p className="font-mono text-[10px] text-slate-500 tabular-nums">
                        {pt.payerCount} paid
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Class-Wise Expected vs Collected Monthly Fees Chart (Recharts) */}
      <ClassMonthlyFeeChart
        classSummaries={schoolMetrics.classSummaries}
        activeMonth={schoolMetrics.activeMonth}
        selectedClass={classFilter}
        onSelectClass={(nextClass) => {
          setClassFilter(nextClass);
          setShowAllDefaulters(false);
        }}
      />

      {/* Automated Sibling-Pairing Alerts & Merged Family Flow */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-blue-900" />
              Automated Sibling-Pairing Alerts &amp; Family Fee Flow
            </h2>
            <p className="text-xs text-slate-500">
              Automatically pairs siblings by shared contact phone, guardian/locality match, and{' '}
              <span className="font-mono">SEE WITH</span> cross-reference remarks so billing-linked ₹0 rows are never misread.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={siblingSearch}
              onChange={(e) => setSiblingSearch(e.target.value)}
              placeholder="Search guardian, phone, sibling..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900"
            />
          </div>
        </div>

        {/* Clean underline tabs */}
        <div className="border-b border-slate-200 px-6 flex items-center gap-6 overflow-x-auto">
          {(
            [
              { key: 'Alert', label: 'Unreviewed Alerts', count: activeMetrics.siblingAlerts.length },
              { key: 'Merged', label: 'Merged Families', count: activeMetrics.mergedFamilies.length },
              { key: 'Dismissed', label: 'Dismissed', count: activeMetrics.dismissedFamilies.length },
            ] as const
          ).map((tab) => {
            const active = siblingTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSiblingTab(tab.key)}
                className={`py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                  active
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono tabular-nums text-slate-500">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {siblingCardsForTab.length === 0 ? (
          <div className="px-6 py-8 text-xs text-slate-500 flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            No sibling clusters in “{siblingTab}” for the active filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {siblingCardsForTab.slice(0, 20).map((card) => (
              <div key={card.group.id} className="p-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                      <span>{card.group.guardianName}</span>
                      <span className="font-mono text-xs font-medium text-slate-600 tabular-nums">
                        {card.group.contactNo || 'Phone Missing'}
                      </span>
                      {card.group.address && (
                        <span className="text-xs font-normal text-slate-500">
                          · {card.group.address}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold text-blue-900">Detected Signals: </span>
                      {card.group.matchReasons.join(' · ')}
                      {card.hasZeroBalanceSiblingLink && (
                        <span className="text-amber-700 font-medium">
                          {' '}
                          · Consolidated billing note (₹0 linked sibling present)
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="text-right pr-2">
                      <p className="text-[11px] font-medium text-slate-500">Combined Family Balance</p>
                      <p className="font-mono text-base font-bold text-slate-900 tabular-nums">
                        {formatInr(card.combinedBalanceInr)}
                      </p>
                    </div>

                    {card.group.status === 'Alert' && canTriageSiblings && (
                      <>
                        <button
                          type="button"
                          disabled={busyAction === `merge:${card.group.id}`}
                          onClick={() => void handleSiblingAction(card.group.id, 'merge')}
                          className="rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
                        >
                          {busyAction === `merge:${card.group.id}`
                            ? 'Merging...'
                            : 'Confirm & Auto-Merge Family'}
                        </button>
                        <button
                          type="button"
                          disabled={busyAction === `dismiss:${card.group.id}`}
                          onClick={() => void handleSiblingAction(card.group.id, 'dismiss')}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                        >
                          Dismiss
                        </button>
                      </>
                    )}

                    {card.group.status === 'Merged' && canCollectFees && card.combinedBalanceInr > 0 && (
                      <button
                        type="button"
                        onClick={() => openCollectModal({ mode: 'family', familyCard: card })}
                        className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 whitespace-nowrap shrink-0"
                      >
                        Collect Family Fee
                      </button>
                    )}

                    {card.group.status === 'Merged' && card.combinedBalanceInr === 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Family Settled
                      </span>
                    )}
                  </div>
                </div>

                {/* Linked siblings table */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Sibling Name</th>
                        <th className="px-4 py-2 font-semibold">Adm No.</th>
                        <th className="px-4 py-2 font-semibold">Class</th>
                        <th className="px-4 py-2 font-semibold">Ledger Remarks</th>
                        <th className="px-4 py-2 font-semibold text-right">Demand + LYB</th>
                        <th className="px-4 py-2 font-semibold text-right">Paid YTD</th>
                        <th className="px-4 py-2 font-semibold text-right">Pending Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {card.members.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-semibold text-slate-900">
                            <button
                              type="button"
                              onClick={() => setTimelineAccount(m)}
                              className="hover:underline text-left text-slate-900"
                            >
                              {m.studentName}
                            </button>
                            {m.id === card.primaryAccount.id && (
                              <span className="ml-2 text-[11px] font-medium text-blue-900">
                                Primary Billing
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 font-mono text-slate-600 tabular-nums">
                            {m.admissionNo}
                          </td>
                          <td className="px-4 py-2 text-slate-700 whitespace-nowrap">{m.className}</td>
                          <td className="px-4 py-2 text-slate-500">{m.remarks || '—'}</td>
                          <td className="px-4 py-2 font-mono text-slate-700 text-right tabular-nums">
                            {formatInr(m.lastYearBalanceInr + m.yearlyDemandInr - m.settleAmountInr)}
                          </td>
                          <td className="px-4 py-2 font-mono text-emerald-700 text-right tabular-nums">
                            {formatInr(m.paidAmountInr)}
                          </td>
                          <td className="px-4 py-2 font-mono font-semibold text-slate-900 text-right tabular-nums whitespace-nowrap">
                            <span>{formatInr(m.balanceFeesInr)}</span>
                            <button
                              type="button"
                              onClick={() => setTimelineAccount(m)}
                              className="ml-2.5 font-sans text-[11px] font-semibold text-blue-900 hover:underline"
                            >
                              Timeline
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top Fee Defaulters Per Class Overview */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Top Fee Defaulters Per Class Overview
            </h2>
            <p className="text-xs text-slate-500">
              Only accounts unpaid through {schoolMetrics.activeMonth}, ranked by % fee left, total paid YTD, and balance due. Select any class to filter the ledger below.
            </p>
          </div>
          {classFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setClassFilter('ALL')}
              className="text-xs font-semibold text-blue-900 hover:underline self-start sm:self-auto whitespace-nowrap"
            >
              Show All Classes
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Class</th>
                <th className="px-4 py-3 font-semibold text-right">Students</th>
                <th className="px-4 py-3 font-semibold text-right">
                  Unpaid Till {schoolMetrics.activeMonth.slice(0, 3)}
                </th>
                <th className="px-4 py-3 font-semibold text-right">Gross Demand</th>
                <th className="px-4 py-3 font-semibold text-right">Collected</th>
                <th className="px-4 py-3 font-semibold text-right">Outstanding</th>
                <th className="px-4 py-3 font-semibold text-right">Recovery</th>
                <th className="px-5 py-3 font-semibold">
                  Top 3 Defaulters (% Left · Paid · Balance)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schoolMetrics.classSummaries.map((cls) => {
                const isSelected = classFilter === cls.className;
                return (
                  <tr
                    key={cls.className}
                    className={isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}
                  >
                    <td className="px-5 py-3 font-semibold whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          setClassFilter(isSelected ? 'ALL' : cls.className)
                        }
                        className={`hover:underline ${
                          isSelected ? 'text-blue-900 font-bold' : 'text-slate-900'
                        }`}
                      >
                        {cls.className}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 text-right tabular-nums">
                      {cls.studentCount}
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-700 font-semibold text-right tabular-nums">
                      {cls.defaulterCount}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 text-right tabular-nums">
                      {formatInr(cls.totalDemandInr)}
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-700 text-right tabular-nums">
                      {formatInr(cls.collectedInr)}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900 text-right tabular-nums">
                      {formatInr(cls.outstandingInr)}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-right tabular-nums">
                      {cls.collectionPct}%
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {cls.topDefaulters.length === 0 ? (
                        <span className="text-emerald-700 font-medium">
                          Paid Till {schoolMetrics.activeMonth}
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] tabular-nums">
                          {cls.topDefaulters
                            .map(
                              (d, idx) =>
                                `${idx + 1}. ${d.studentName} (${d.defaulterMetrics.percentLeft}% left · Paid ${formatInr(d.paidAmountInr)} · Due ${formatInr(d.balanceFeesInr)})`,
                            )
                            .join(' · ')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Any-Student Annual Payment Timeline Explorer */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Student Annual Payment Timeline Explorer
            </h2>
            <p className="text-xs text-slate-500">
              Inspect April–March deposit rhythm and payment nature for any student across {activeSchool.name} (defaulters, advance payers, and settled accounts).
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              data-testid="student-timeline-explorer-input"
              value={timelineExplorerQuery}
              onChange={(e) => setTimelineExplorerQuery(e.target.value)}
              placeholder="Search any student by name, adm no., father..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-8 py-1.5 text-xs text-slate-900"
            />
            {timelineExplorerQuery && (
              <button
                type="button"
                onClick={() => setTimelineExplorerQuery('')}
                aria-label="Clear student timeline search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {timelineExplorerQuery.trim() && (
          <div className="border-t border-slate-200 divide-y divide-slate-100">
            {timelineExplorerMatches.length === 0 ? (
              <p className="px-6 py-4 text-xs text-slate-500">
                No student fee accounts match “{timelineExplorerQuery.trim()}”.
              </p>
            ) : (
              timelineExplorerMatches.map((acc) => (
                <div
                  key={acc.id}
                  className="px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {acc.studentName}{' '}
                      <span className="font-normal text-slate-500">
                        · {acc.className} · {acc.admissionNo}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Guardian: {acc.fatherName}
                      {acc.contactNo ? ` · ${acc.contactNo}` : ''} · Paid{' '}
                      <span className="font-mono text-emerald-700 tabular-nums">
                        {formatInr(acc.paidAmountInr)}
                      </span>{' '}
                      · Balance{' '}
                      <span className="font-mono text-slate-800 tabular-nums">
                        {formatInr(acc.balanceFeesInr)}
                      </span>
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StudentPaymentMiniTimeline
                      account={acc}
                      activeMonth={activeMetrics.activeMonth}
                      onOpenTimeline={(a) => setTimelineAccount(a)}
                      onExportPdf={handleExportStudentTimelinePdf}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Ranked School-Wide / Class-Scoped Defaulters Leaderboard */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              {classFilter === 'ALL'
                ? 'School-Wide Top Fee Defaulters Ledger'
                : `${classFilter} Fee Defaulters Ledger`}
            </h2>
            <p className="text-xs text-slate-500">
              Showing{' '}
              <span className="font-mono font-semibold text-slate-800 tabular-nums">
                {displayedDefaulters.length}
              </span>{' '}
              of{' '}
              <span className="font-mono font-semibold text-slate-800 tabular-nums">
                {filteredDefaulters.length}
              </span>{' '}
              accounts unpaid till {activeMetrics.activeMonth} · ranked by % amount left, total paid YTD, and balance due
              {activeMetrics.paidTillCurrentMonthPendingCount > 0
                ? ` (${activeMetrics.paidTillCurrentMonthPendingCount} paid till ${activeMetrics.activeMonth} excluded)`
                : ''}
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, father, adm no, phone..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900"
              />
            </div>
            <button
              type="button"
              onClick={handleExportDefaultersPdf}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#142B46] bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <FileDown className="h-3.5 w-3.5" />
              Download PDF
            </button>
          </div>
        </div>

        {displayedDefaulters.length === 0 ? (
          <div className="px-6 py-8 text-xs text-slate-500">
            All accounts matching this filter are paid through {activeMetrics.activeMonth}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Student &amp; Adm No.</th>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold">Guardian &amp; Contact</th>
                  <th className="px-4 py-3 font-semibold">Payment Nature &amp; Timeline</th>
                  <th className="px-4 py-3 font-semibold">Payment Plan &amp; Next Due</th>
                  <th className="px-4 py-3 font-semibold text-right">% Left &amp; Risk</th>
                  <th className="px-4 py-3 font-semibold text-right">Paid YTD</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Due Till {activeMetrics.activeMonth.slice(0, 3)}
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">Balance Due</th>
                  {canCollectFees && <th className="px-4 py-3 font-semibold text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedDefaulters.map((acc, idx) => {
                  const rowPlan = normalizePaymentPlan(acc.scheduleCadence);
                  const dm = acc.defaulterMetrics;
                  const rowStatus = computeStudentFeeMonthAllocation({
                    accounts: [acc],
                    paymentNowInr: 0,
                    scheduleCadence: rowPlan,
                  });
                  const riskTextClass =
                    dm.riskTier === 'Critical'
                      ? 'text-rose-700'
                      : dm.riskTier === 'High'
                        ? 'text-amber-700'
                        : 'text-slate-600';
                  const barFillClass =
                    dm.riskTier === 'Critical'
                      ? 'bg-rose-600'
                      : dm.riskTier === 'High'
                        ? 'bg-amber-500'
                        : 'bg-slate-400';

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setTimelineAccount(acc)}
                          className="font-semibold text-slate-900 hover:text-blue-900 hover:underline text-left"
                        >
                          {acc.studentName}
                        </button>
                        <p className="font-mono text-[11px] text-slate-500 tabular-nums">
                          {acc.admissionNo}
                          {acc.familyGroupId ? ' · Family Linked' : ''}
                        </p>
                        <p className="text-[10px] font-semibold text-[#142B46] mt-0.5 tabular-nums">
                          {dm.paidTillMonthLabel === 'Unpaid'
                            ? `No full month paid · ${dm.monthsBehindCurrentMonth}m behind`
                            : `Paid till ${dm.paidTillMonthLabel} · ${dm.monthsBehindCurrentMonth}m behind`}
                          {rowStatus.previousPartialMonth
                            ? ` (+${formatInr(rowStatus.previousPartialPaidInr)} partial)`
                            : ''}
                        </p>
                        {acc.remarks && (
                          <p className="text-[11px] text-amber-700 mt-0.5">{acc.remarks}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{acc.className}</td>
                      <td className="px-4 py-3">
                        <p className="text-slate-800 font-medium">{acc.fatherName}</p>
                        <p className="font-mono text-[11px] text-slate-500 tabular-nums">
                          {acc.contactNo || 'No Phone'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StudentPaymentMiniTimeline
                          account={acc}
                          activeMonth={activeMetrics.activeMonth}
                          onOpenTimeline={(a) => setTimelineAccount(a)}
                          onExportPdf={handleExportStudentTimelinePdf}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {canCollectFees ? (
                          <select
                            aria-label={`Payment plan for ${acc.studentName}`}
                            value={rowPlan}
                            disabled={busyAction === `plan:${acc.id}`}
                            onChange={(e) =>
                              void handleUpdateStudentPaymentPlan(
                                acc,
                                e.target.value as CanonicalFeePaymentPlan,
                              )
                            }
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-[#142B46] disabled:opacity-50"
                          >
                            {CANONICAL_PAYMENT_PLANS.map((plan) => (
                              <option key={plan} value={plan}>
                                {plan}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-semibold text-slate-700">{rowPlan}</span>
                        )}
                        {rowStatus.nextExpectedInstallment && (
                          <p className="font-mono text-[10px] text-[#7B5D1C] mt-1 tabular-nums">
                            Next: {formatInr(rowStatus.nextExpectedInstallment.expectedAmountInr)} (
                            {acc.nextExpectedFeeDate || rowStatus.nextExpectedInstallment.dueDate})
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <p className={`font-mono font-bold tabular-nums ${riskTextClass}`}>
                          {dm.percentLeft}% left
                        </p>
                        <div className="mt-1 ml-auto h-1.5 w-20 rounded-xs bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full ${barFillClass}`}
                            style={{ width: `${Math.min(100, Math.max(4, dm.percentLeft))}%` }}
                          />
                        </div>
                        <p className="font-mono text-[10px] text-slate-500 tabular-nums mt-0.5">
                          {dm.riskTier} · Score {dm.defaulterPriorityScore}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <p
                          className={`font-mono font-semibold tabular-nums ${
                            acc.paidAmountInr === 0 ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          {formatInr(acc.paidAmountInr)}
                        </p>
                        <p className="font-mono text-[10px] text-slate-500 tabular-nums">
                          {dm.percentPaid}% of {formatInr(dm.grossFeeInr)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <p className="font-mono font-semibold text-rose-700 tabular-nums">
                          {formatInr(dm.overdueTillCurrentMonthInr)}
                        </p>
                        <p className="font-mono text-[10px] text-slate-500 tabular-nums">
                          {acc.lastYearBalanceInr > 0
                            ? `incl. LYB ${formatInr(acc.lastYearBalanceInr)}`
                            : `${dm.unpaidTillMonthPct}% of due`}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <p className="font-mono font-bold text-amber-700 tabular-nums">
                          {formatInr(acc.balanceFeesInr)}
                        </p>
                        {acc.fineInr > 0 && (
                          <p className="font-mono text-[10px] text-slate-500 tabular-nums">
                            Fine {formatInr(acc.fineInr)}
                          </p>
                        )}
                      </td>
                      {canCollectFees && (
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              disabled={busyAction === `alert:${acc.id}`}
                              onClick={() => void handleSendSingleDefaulterAlert(acc)}
                              title={`Send WhatsApp/Email fee alert to ${acc.fatherName}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50 whitespace-nowrap"
                            >
                              <BellRing className="h-3 w-3" />
                              {busyAction === `alert:${acc.id}` ? 'Sending...' : 'Send Alert'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openCollectModal({ mode: 'single', singleAccount: acc })
                              }
                              className="rounded-lg border border-blue-900 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-900 hover:bg-blue-50 whitespace-nowrap"
                            >
                              Record Payment
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredDefaulters.length > 25 && (
          <div className="border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Showing {displayedDefaulters.length} of {filteredDefaulters.length} unpaid accounts till {activeMetrics.activeMonth}
            </span>
            <button
              type="button"
              onClick={() => setShowAllDefaulters((v) => !v)}
              className="font-semibold text-blue-900 hover:underline whitespace-nowrap"
            >
              {showAllDefaulters
                ? 'Collapse to Top 25'
                : `Show All ${filteredDefaulters.length} Defaulters`}
            </button>
          </div>
        )}
      </section>

      {/* Automated High-Priority Defaulter Notification Center (WhatsApp & Email) */}
      <DefaulterNotificationCenter
        schoolId={activeSchool.id}
        schoolName={activeSchool.name}
        activeMonth={activeMetrics.activeMonth}
        classFilter={classFilter}
        rankedDefaulters={schoolMetrics.schoolTopDefaulters}
        students={students}
        schoolUsers={schoolUsers}
        config={feeDefaulterAlertConfig}
        logs={feeDefaulterAlertLogs}
        gatewayStatus={notificationGatewayStatus}
        canDispatch={canCollectFees}
        token={token}
        onRefresh={onRefresh}
      />

      {/* Recent Collection Receipts Log */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-700" />
              Recent Real-Time Collection Receipts
            </h2>
            <p className="text-xs text-slate-500">
              Auditable receipts showing paid till month, total pending balance, next expected fee date, and 1-click official printing.
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
            {feeReceipts.length} Receipts
          </span>
        </div>

        {feeReceipts.length === 0 ? (
          <div className="px-6 py-6 text-xs text-slate-500">
            No live receipts recorded in the current session yet. Use “Enter Fee Received &amp; Print Receipt”, “Collect Family Fee”, or “Record Payment” on any student ledger row.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Receipt No. &amp; Date</th>
                  <th className="px-4 py-3 font-semibold">Payer / Family</th>
                  <th className="px-4 py-3 font-semibold">Paid Till &amp; Mode</th>
                  <th className="px-4 py-3 font-semibold text-right">Paid Now</th>
                  <th className="px-4 py-3 font-semibold text-right">Pending Balance</th>
                  <th className="px-4 py-3 font-semibold">Next Expected Fee</th>
                  <th className="px-5 py-3 font-semibold text-right">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feeReceipts.slice(0, 20).map((rcp) => (
                  <tr key={rcp.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <p className="font-mono font-semibold text-[#142B46] tabular-nums">
                        {rcp.receiptNo}
                      </p>
                      <p className="font-mono text-[11px] text-slate-500 tabular-nums">
                        {rcp.paidDate}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{rcp.payerLabel}</p>
                      <p className="text-[11px] text-slate-500">
                        {rcp.allocations
                          .map((al) => `${al.studentName} (${al.className})`)
                          .join(' · ')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#142B46]">
                        {rcp.coveredMonths && rcp.coveredMonths.length > 0
                          ? rcp.coveredMonths.join(', ')
                          : `Till ${rcp.paidTillMonth || rcp.monthKey}`}
                      </p>
                      {rcp.partialAdjustedMonth && (rcp.partialMonthTotalPaidInr ?? 0) > 0 && (
                        <p className="text-[10px] font-semibold text-[#7B5D1C] tabular-nums">
                          + {formatInr(rcp.partialMonthTotalPaidInr ?? 0)} partial in{' '}
                          {rcp.partialAdjustedMonth} ({formatInr(rcp.partialMonthRemainingInr ?? 0)} bal.)
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500">
                        {rcp.paymentMode}
                        {rcp.scheduleCadence ? ` · ${rcp.scheduleCadence} Plan` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700 text-right tabular-nums whitespace-nowrap">
                      {formatInr(rcp.amountInr)}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-amber-800 text-right tabular-nums whitespace-nowrap">
                      {rcp.totalPendingBalanceInr !== undefined
                        ? formatInr(rcp.totalPendingBalanceInr)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {rcp.nextExpectedFeeDate ? (
                        <div>
                          <p className="font-mono font-semibold text-[#142B46] tabular-nums">
                            {rcp.nextExpectedFeeAmountInr
                              ? formatInr(rcp.nextExpectedFeeAmountInr)
                              : 'Scheduled'}
                            {rcp.nextExpectedFeeMonth ? ` (${rcp.nextExpectedFeeMonth})` : ''}
                          </p>
                          <p className="font-mono text-[11px] text-[#7B5D1C] tabular-nums flex items-center gap-1">
                            <CalendarClock className="h-3 w-3 shrink-0" />
                            {rcp.nextExpectedFeeDate}
                          </p>
                        </div>
                      ) : rcp.totalPendingBalanceInr === 0 ? (
                        <span className="text-[11px] font-semibold text-emerald-700">Settled</span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        data-testid={`print-receipt-btn-${rcp.receiptNo}`}
                        onClick={() => setReceiptToPrint(rcp)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#142B46] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#142B46] hover:bg-[#FAF4EC] whitespace-nowrap"
                      >
                        <Printer className="h-3 w-3" />
                        Print Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
        </>
      )}

      {/* Collect Fee / Enter Fee Received Modal */}
      {collectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="collect-fee-modal-title"
          data-testid="enter-fee-received-modal"
        >
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-[#FAF4EC] px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7B5D1C]">
                  Rai Plus Accounts Desk · Official Fee Entry
                </p>
                <h3
                  id="collect-fee-modal-title"
                  className="font-display text-base font-bold text-[#142B46]"
                >
                  {collectModal.mode === 'family'
                    ? 'Collect Merged Family Fee & Issue Receipt'
                    : 'Enter Fee Received & Print Official Receipt'}
                </h3>
                {modalTargetAccounts.length > 0 && (
                  <p className="text-xs text-slate-600 mt-0.5">
                    {collectModal.mode === 'family' && collectModal.familyCard
                      ? `${collectModal.familyCard.group.guardianName} (${collectModal.familyCard.members.length} linked siblings)`
                      : `${collectModal.singleAccount?.studentName} · ${collectModal.singleAccount?.className} · Adm ${collectModal.singleAccount?.admissionNo}`}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setCollectModal(null)}
                aria-label="Close fee collection dialog"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-5">
              {modalError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-900">
                  {modalError}
                </div>
              )}

              {/* Student Picker (when opened from top quick CTA) */}
              {collectModal.mode === 'quick' && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="quick-student-search"
                      className="text-xs font-semibold text-[#142B46]"
                    >
                      {collectModal.singleAccount
                        ? `Selected Student: ${collectModal.singleAccount.studentName} (${collectModal.singleAccount.className})`
                        : 'Select Student Account (Search by Name, Adm No., Father, or Class)'}
                    </label>
                    {collectModal.singleAccount && (
                      <button
                        type="button"
                        onClick={() =>
                          setCollectModal({ mode: 'quick', singleAccount: undefined })
                        }
                        className="text-[11px] font-semibold text-[#142B46] hover:underline"
                      >
                        Change Student
                      </button>
                    )}
                  </div>

                  {!collectModal.singleAccount && (
                    <>
                      <div className="relative">
                        <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="quick-student-search"
                          type="text"
                          value={modalAccountSearch}
                          onChange={(e) => setModalAccountSearch(e.target.value)}
                          placeholder="Type student name, admission no., father name..."
                          className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs text-slate-900"
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
                        {quickPickerAccounts.length === 0 ? (
                          <p className="px-3 py-3 text-xs text-slate-500">
                            No pending student fee accounts match your search.
                          </p>
                        ) : (
                          quickPickerAccounts.map((acc) => (
                            <button
                              key={acc.id}
                              type="button"
                              onClick={() => {
                                setCollectModal({ mode: 'quick', singleAccount: acc });
                                hydrateModalDefaultsForAccounts([acc]);
                              }}
                              className="w-full px-3 py-2 text-left text-xs hover:bg-[#FAF4EC] flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-[#142B46] truncate">
                                  {acc.studentName}{' '}
                                  <span className="font-normal text-slate-500">
                                    ({acc.className} · Adm {acc.admissionNo})
                                  </span>
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  Father: {acc.fatherName} · {acc.contactNo || 'No phone'}
                                </p>
                              </div>
                              <span className="font-mono font-bold text-amber-800 tabular-nums shrink-0">
                                Due {formatInr(acc.balanceFeesInr)}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Mandatory Student Payment Plan Selector (Monthly / Quarterly / Half-Yearly / Yearly) */}
              {modalTargetAccounts.length > 0 && (
                <div
                  data-testid="student-payment-plan-selector"
                  className="rounded-xl border border-[#142B46]/20 bg-[#FAF4EC]/75 p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-[#142B46]">
                        Student Annual Payment Plan (Required)
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Defines how the whole session fee is collected and automatically schedules coming expected payments.
                      </p>
                    </div>
                    {liveMonthAllocation && (
                      <span className="font-mono text-[11px] font-semibold text-[#7B5D1C] tabular-nums">
                        Monthly Rate: {formatInr(liveMonthAllocation.monthlyRateInr)}/mo
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CANONICAL_PAYMENT_PLANS.map((plan) => {
                      const active = selectedPaymentPlan === plan;
                      const planDesc =
                        plan === 'Monthly'
                          ? '12 Installments'
                          : plan === 'Quarterly'
                            ? '4 Quarters (3 mo)'
                            : plan === 'Half-Yearly'
                              ? '2 Halves (6 mo)'
                              : '1 Annual Payment';
                      return (
                        <button
                          key={plan}
                          type="button"
                          data-testid={`payment-plan-option-${plan.toLowerCase()}`}
                          onClick={() => {
                            setSelectedPaymentPlan(plan);
                            applyAutoAllocationToFields(
                              modalTargetAccounts,
                              modalPaidNowNumeric,
                              plan,
                              paidDateInput || getTodayIso(),
                            );
                          }}
                          className={`rounded-lg border px-3 py-2 text-left transition ${
                            active
                              ? 'border-[#142B46] bg-[#142B46] text-white'
                              : 'border-slate-300 bg-white text-[#142B46] hover:bg-slate-50'
                          }`}
                        >
                          <p className="text-xs font-bold">{plan}</p>
                          <p
                            className={`text-[10px] mt-0.5 ${
                              active ? 'text-[#D6B66D]' : 'text-slate-500'
                            }`}
                          >
                            {planDesc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Live 3-Column Pending Balance Strip */}
              {modalTargetAccounts.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-slate-200 bg-[#FAF4EC] px-3.5 py-2.5">
                    <p className="text-[11px] font-medium text-slate-600">Previous Pending</p>
                    <p className="mt-0.5 font-mono text-base font-bold text-[#142B46] tabular-nums">
                      {formatInr(modalPreviousPendingInr)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                    <p className="text-[11px] font-semibold text-emerald-800">Fee Received Now</p>
                    <p className="mt-0.5 font-mono text-base font-bold text-emerald-800 tabular-nums">
                      {formatInr(modalPaidNowNumeric)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#D6B66D] bg-[#FCF7EE] px-3.5 py-2.5">
                    <p className="text-[11px] font-semibold text-[#7B5D1C]">
                      Total Pending Balance
                    </p>
                    <p
                      data-testid="modal-live-pending-balance"
                      className="mt-0.5 font-mono text-base font-bold text-[#7B5D1C] tabular-nums"
                    >
                      {formatInr(modalRemainingPendingInr)}
                    </p>
                  </div>
                </div>
              )}

              {/* Core Fee Payment Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label
                      htmlFor="collect-amount-input"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Fee Received Amount (INR)
                    </label>
                    {modalTargetAccounts.length > 0 && liveMonthAllocation && (
                      <div className="flex items-center gap-2">
                        {liveMonthAllocation.recommendedInstallmentAmountInr > 0 &&
                          liveMonthAllocation.recommendedInstallmentAmountInr <
                            modalPreviousPendingInr && (
                            <button
                              type="button"
                              onClick={() => {
                                const v = liveMonthAllocation.recommendedInstallmentAmountInr;
                                setPaymentAmountInput(String(v));
                                applyAutoAllocationToFields(
                                  modalTargetAccounts,
                                  v,
                                  selectedPaymentPlan,
                                  paidDateInput || getTodayIso(),
                                );
                              }}
                              className="text-[10px] font-semibold text-[#142B46] hover:underline whitespace-nowrap"
                            >
                              {liveMonthAllocation.recommendedInstallmentLabel} (
                              {formatInr(liveMonthAllocation.recommendedInstallmentAmountInr)})
                            </button>
                          )}
                        <button
                          type="button"
                          onClick={() => {
                            const fullAmt = Math.round(modalPreviousPendingInr);
                            setPaymentAmountInput(String(fullAmt));
                            applyAutoAllocationToFields(
                              modalTargetAccounts,
                              fullAmt,
                              selectedPaymentPlan,
                              paidDateInput || getTodayIso(),
                            );
                          }}
                          className="text-[10px] font-semibold text-emerald-700 hover:underline whitespace-nowrap"
                        >
                          Full ({formatInr(modalPreviousPendingInr)})
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    id="collect-amount-input"
                    type="number"
                    min={1}
                    step={1}
                    value={paymentAmountInput}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setPaymentAmountInput(raw);
                      const amt = Math.round(Number(raw) || 0);
                      if (modalTargetAccounts.length > 0) {
                        applyAutoAllocationToFields(
                          modalTargetAccounts,
                          amt,
                          selectedPaymentPlan,
                          paidDateInput || getTodayIso(),
                        );
                      }
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="collect-paid-till-select"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Fee Paid Till Month (Auto-Selected)
                  </label>
                  <select
                    id="collect-paid-till-select"
                    value={paidTillMonth}
                    onChange={(e) => {
                      const nextPaidTill = e.target.value as FeeMonthKey;
                      setPaidTillMonth(nextPaidTill);
                      setPaymentMonth(nextPaidTill);
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#142B46]"
                  >
                    {ACADEMIC_FEE_MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="collect-mode-select"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Payment Mode
                  </label>
                  <select
                    id="collect-mode-select"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as FeePaymentMode)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="collect-date-input"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Receipt Date
                  </label>
                  <input
                    id="collect-date-input"
                    type="date"
                    value={paidDateInput}
                    onChange={(e) => {
                      const nextDate = e.target.value;
                      setPaidDateInput(nextDate);
                      if (modalTargetAccounts.length > 0) {
                        applyAutoAllocationToFields(
                          modalTargetAccounts,
                          modalPaidNowNumeric,
                          selectedPaymentPlan,
                          nextDate || getTodayIso(),
                        );
                      }
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Auto-Selected Months Covered & Lump-Sum Partial Adjustment Breakdown */}
              {liveMonthAllocation && (
                <div
                  data-testid="auto-month-coverage-panel"
                  className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-[#142B46]">
                        Auto-Selected Months Covered (From Last Payments + Current Amount)
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {liveMonthAllocation.previousPaidTillMonth
                          ? `Previously paid till ${liveMonthAllocation.previousPaidTillMonth}`
                          : 'No full session month paid yet'}
                        {liveMonthAllocation.previousPartialMonth
                          ? ` (+ ${formatInr(liveMonthAllocation.previousPartialPaidInr)} prior partial in ${liveMonthAllocation.previousPartialMonth})`
                          : ''}
                        {liveMonthAllocation.lybAdjustedNowInr > 0
                          ? ` · Clears ${formatInr(liveMonthAllocation.lybAdjustedNowInr)} LYB arrears first`
                          : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                      <span className="text-emerald-700">● Earlier Paid</span>
                      <span className="text-[#142B46]">● Covered Now</span>
                      <span className="text-[#7B5D1C]">● Partial Adjusted</span>
                    </div>
                  </div>

                  {/* 12-Month Academic Visual Strip */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {liveMonthAllocation.months.map((mItem) => {
                      const isEarlierPaid =
                        mItem.status === 'Paid' && !mItem.coveredNow && mItem.dueInr > 0;
                      const isCoveredNow = mItem.coveredNow;
                      const isPartial = mItem.status === 'Partial';
                      return (
                        <div
                          key={mItem.month}
                          className={`rounded-lg border px-2 py-1.5 text-[11px] ${
                            isCoveredNow
                              ? 'border-[#142B46] bg-[#142B46] text-white'
                              : isPartial
                                ? 'border-[#D6B66D] bg-[#FCF7EE] text-[#142B46]'
                                : isEarlierPaid
                                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                                  : 'border-slate-200 bg-slate-50/60 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold">{mItem.month.slice(0, 3)}</span>
                            <span
                              className={`text-[9px] font-bold uppercase ${
                                isCoveredNow
                                  ? 'text-[#D6B66D]'
                                  : isPartial
                                    ? 'text-[#7B5D1C]'
                                    : isEarlierPaid
                                      ? 'text-emerald-700'
                                      : 'text-slate-400'
                              }`}
                            >
                              {isCoveredNow
                                ? 'Now'
                                : isPartial
                                  ? 'Part'
                                  : isEarlierPaid
                                    ? 'Paid'
                                    : 'Due'}
                            </span>
                          </div>
                          <p
                            className={`font-mono text-[10px] mt-0.5 tabular-nums truncate ${
                              isCoveredNow ? 'text-[#F3E6D8]' : ''
                            }`}
                          >
                            {isCoveredNow
                              ? `+${formatInr(mItem.paidNowInr)}`
                              : isPartial
                                ? `${formatInr(mItem.totalPaidInr)}/${formatInr(mItem.dueInr)}`
                                : isEarlierPaid
                                  ? formatInr(mItem.dueInr)
                                  : formatInr(mItem.remainingInr)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Clear text readout for covered months + lump-sum partial adjustment */}
                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs space-y-1">
                    {liveMonthAllocation.coveredMonths.length > 0 ? (
                      <p className="text-[#142B46]">
                        <strong>Months Auto-Covered by This Payment:</strong>{' '}
                        {liveMonthAllocation.coveredMonths.join(', ')}
                      </p>
                    ) : (
                      <p className="text-slate-600">
                        This payment adjusts toward{' '}
                        <strong>
                          {liveMonthAllocation.partialAdjustment?.month ||
                            (liveMonthAllocation.lybAdjustedNowInr > 0
                              ? 'Last Year Arrears (LYB)'
                              : liveMonthAllocation.paidTillMonth)}
                        </strong>
                        .
                      </p>
                    )}

                    {liveMonthAllocation.postPaymentPartial && (
                      <p
                        data-testid="partial-adjustment-banner"
                        className="font-semibold text-[#7B5D1C] tabular-nums"
                      >
                        Lump-Sum Partial Adjustment:{' '}
                        {formatInr(liveMonthAllocation.postPaymentPartial.totalPaidInr)} adjusted in{' '}
                        {liveMonthAllocation.postPaymentPartial.month} (out of{' '}
                        {formatInr(liveMonthAllocation.postPaymentPartial.dueInr)}) · Remaining{' '}
                        {formatInr(liveMonthAllocation.postPaymentPartial.remainingInr)} carried to
                        next expected payment.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Next Expected Fee & Auto Calendar Reminder Section */}
              <div className="rounded-xl border border-[#D6B66D] bg-[#FAF4EC]/80 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[#142B46] flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5 text-[#7B5D1C]" />
                      Coming Expected Payments ({selectedPaymentPlan} Plan) &amp; Calendar Sync
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Auto-calculated from the student’s {selectedPaymentPlan} plan + any partial
                      month adjustment; synced directly to the Fee Reminder Calendar.
                    </p>
                  </div>
                  {modalRemainingPendingInr === 0 && modalTargetAccounts.length > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Full balance cleared — no follow-up needed
                    </span>
                  )}
                </div>

                {/* Coming Expected Installments Preview Strip */}
                {liveMonthAllocation && liveMonthAllocation.upcomingInstallments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {liveMonthAllocation.upcomingInstallments.slice(0, 3).map((inst, idx) => (
                      <div
                        key={`${inst.label}-${idx}`}
                        className={`rounded-lg border px-3 py-2 text-[11px] ${
                          idx === 0
                            ? 'border-[#142B46] bg-white'
                            : 'border-[#D6B66D]/60 bg-white/75'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[#142B46] truncate">{inst.label}</span>
                          {idx === 0 && (
                            <span className="text-[9px] font-bold uppercase text-[#7B5D1C] shrink-0">
                              Next Due
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs font-bold text-[#7B5D1C] mt-0.5 tabular-nums">
                          {formatInr(inst.expectedAmountInr)}
                        </p>
                        <p className="font-mono text-[10px] text-slate-500 tabular-nums">
                          Due {inst.dueDate}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="next-expected-date-input"
                      className="block text-[11px] font-semibold text-slate-700 mb-1"
                    >
                      Next Expected Date
                    </label>
                    <input
                      id="next-expected-date-input"
                      type="date"
                      value={nextExpectedFeeDate}
                      disabled={modalRemainingPendingInr === 0 && modalTargetAccounts.length > 0}
                      onChange={(e) => setNextExpectedFeeDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="next-expected-amount-input"
                      className="block text-[11px] font-semibold text-slate-700 mb-1"
                    >
                      Next Expected Fee (INR)
                    </label>
                    <input
                      id="next-expected-amount-input"
                      type="number"
                      min={0}
                      step={1}
                      value={nextExpectedFeeAmountInput}
                      disabled={modalRemainingPendingInr === 0 && modalTargetAccounts.length > 0}
                      onChange={(e) => setNextExpectedFeeAmountInput(e.target.value)}
                      placeholder={String(modalRemainingPendingInr)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 tabular-nums disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="next-expected-month-select"
                      className="block text-[11px] font-semibold text-slate-700 mb-1"
                    >
                      Next Due Month
                    </label>
                    <select
                      id="next-expected-month-select"
                      value={nextExpectedFeeMonth}
                      disabled={modalRemainingPendingInr === 0 && modalTargetAccounts.length > 0}
                      onChange={(e) => setNextExpectedFeeMonth(e.target.value as FeeMonthKey)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {ACADEMIC_FEE_MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional UTR / Remarks */}
              <div>
                <label
                  htmlFor="collect-remarks-input"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  UTR / Cheque Ref / Remarks (Optional)
                </label>
                <input
                  id="collect-remarks-input"
                  type="text"
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  placeholder="e.g., UPI Ref 631498221, cash received from father"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              {/* Allocation preview */}
              {modalTargetAccounts.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Live Sibling &amp; Account Allocation Preview
                  </p>
                  {liveModalPreview?.valid ? (
                    <div className="space-y-1.5">
                      {liveModalPreview.allocations.map((al) => (
                        <div
                          key={al.accountId}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-700">
                            {al.studentName} ({al.className})
                          </span>
                          <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                            +{formatInr(al.allocatedInr)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700">
                      {liveModalPreview?.error || 'Enter a valid amount.'}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCollectModal(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="confirm-issue-receipt-btn"
                  disabled={
                    busyAction === 'collect-fee' ||
                    modalTargetAccounts.length === 0 ||
                    !liveModalPreview?.valid
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D3A5C] disabled:opacity-50 whitespace-nowrap"
                >
                  <Printer className="h-3.5 w-3.5 text-[#D6B66D]" />
                  {busyAction === 'collect-fee'
                    ? 'Saving & Generating Receipt...'
                    : 'Save Payment & Open Printable Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Rai Plus Fee Receipt Modal */}
      <PrintableFeeReceiptModal
        receipt={receiptToPrint}
        school={activeSchool}
        onClose={() => setReceiptToPrint(null)}
      />

      {/* Year-Long Student Payment Timeline & Nature Modal */}
      {timelineAccount && (
        <StudentPaymentTimelineModal
          account={timelineAccount}
          schoolName={activeSchool.name}
          schoolCode={activeSchool.code}
          session={activeSchool.session}
          generatedBy={user.name}
          activeMonth={activeMetrics.activeMonth}
          receipts={feeReceipts}
          onClose={() => setTimelineAccount(null)}
          onRecordPayment={
            canCollectFees
              ? (acc) => {
                  setTimelineAccount(null);
                  openCollectModal({ mode: 'single', singleAccount: acc });
                }
              : undefined
          }
          onPrintReceipt={(rcp) => {
            setTimelineAccount(null);
            setReceiptToPrint(rcp);
          }}
        />
      )}
    </div>
  );
};
