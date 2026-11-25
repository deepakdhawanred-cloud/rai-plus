import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  FileUp,
  Fuel,
  IndianRupee,
  Landmark,
  Lock,
  Plus,
  Printer,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import type {
  AccountingEntry,
  AccountingEntryCategory,
  UserAccount,
} from '../types';
import type { WorkspaceData } from '../types/workspace';
import { canPerformFinanceAction } from '../utils/accountantRbacEngine';
import { BulkPayrollSheetPanel } from './BulkPayrollSheetPanel';

interface Props {
  data: WorkspaceData;
  user: UserAccount;
  token: string;
  onRefresh: () => Promise<void>;
}

type AccountingSubTab = 'ledger' | 'payroll' | 'bank' | 'ai_extract' | 'tasks_reports';

const ENTRY_CATEGORIES: AccountingEntryCategory[] = [
  'Fee Collection',
  'Teacher Payroll',
  'Driver Payroll',
  'Bus Fuel Expense',
  'Maintenance Expense',
  'Vendor Purchase',
  'Utility & Operations',
  'Misc Receipt',
];

export const AccountantDashboardPanel: React.FC<Props> = ({
  data,
  user,
  token,
  onRefresh,
}) => {
  const isManagementApprover = canPerformFinanceAction(
    user.role,
    'approve_accounting_entry',
  ).allowed;
  const isAccountant = user.role === 'accountant';

  const entries = data.accountingEntries || [];
  const payrolls = data.payrollRegisters || [];
  const bankItems = data.bankReconciliationItems || [];
  const tasks = data.accountingTasks || [];

  const [subTab, setSubTab] = useState<AccountingSubTab>('ledger');
  const [categoryFilter, setCategoryFilter] = useState<'All' | AccountingEntryCategory>('All');
  const [busFilter, setBusFilter] = useState<string>('All');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  // New accounting entry form
  const [entryDate, setEntryDate] = useState<string>('2026-11-21');
  const [entryCategory, setEntryCategory] = useState<AccountingEntryCategory>('Bus Fuel Expense');
  const [entryDirection, setEntryDirection] = useState<'Income' | 'Expense'>('Expense');
  const [vendorOrParty, setVendorOrParty] = useState<string>('');
  const [busCode, setBusCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [amountInr, setAmountInr] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [supportingDocName, setSupportingDocName] = useState<string>('');
  const [extractedByAi, setExtractedByAi] = useState<boolean>(false);

  // AI Document Extractor state
  const [docFileName, setDocFileName] = useState<string>('hpcl-diesel-bus04-bill.pdf');
  const [docRawText, setDocRawText] = useState<string>(
    'Vendor: Jhajjar Highway HPCL Station\nBus-04 Diesel Refill 65 Litres\nAmount: Rs. 5,980\nPaid via UPI',
  );
  const [extractResultLabel, setExtractResultLabel] = useState<string | null>(null);

  // Bank matching selection
  const [matchEntryMap, setMatchEntryMap] = useState<Record<string, string>>({});

  // Management Task creation
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskCategory, setNewTaskCategory] = useState<
    'Reconciliation' | 'Payroll' | 'Fee Audit' | 'Vendor Verification' | 'Monthly Closing'
  >('Reconciliation');
  const [newTaskDue, setNewTaskDue] = useState<string>('2026-11-28');

  // KPIs
  const todayIso = '2026-11-21';
  const todaysEntriesCount = entries.filter((e) => e.date === todayIso).length;
  const pendingApprovalCount = entries.filter((e) => e.status === 'submitted').length;
  const draftCount = entries.filter((e) => e.status === 'draft').length;
  const unmatchedBankCount = bankItems.filter((b) => b.matchStatus === 'Unmatched').length;
  const openTasksCount = tasks.filter((t) => t.status !== 'Completed').length;

  const totalIncome = entries
    .filter((e) => e.direction === 'Income' && e.status !== 'rejected')
    .reduce((acc, e) => acc + e.amountInr, 0);
  const totalExpense = entries
    .filter((e) => e.direction === 'Expense' && e.status !== 'rejected')
    .reduce((acc, e) => acc + e.amountInr, 0);

  const busCodes = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      if (e.busCode) set.add(e.busCode);
    }
    return Array.from(set).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (categoryFilter !== 'All' && e.category !== categoryFilter) return false;
      if (busFilter !== 'All' && e.busCode !== busFilter) return false;
      return true;
    });
  }, [entries, categoryFilter, busFilter]);

  const clearAlerts = () => {
    setFeedback(null);
    setErrorMsg(null);
  };

  const handleCreateEntry = async (submitForApproval: boolean) => {
    clearAlerts();
    setBusy(true);
    try {
      await apiRequest(
        '/api/accounting/entries',
        {
          method: 'POST',
          body: JSON.stringify({
            date: entryDate,
            category: entryCategory,
            direction: entryDirection,
            vendorOrParty,
            busCode: busCode.trim() || undefined,
            description,
            amountInr: Number(amountInr),
            paymentMode,
            supportingDocName: supportingDocName.trim() || undefined,
            extractedByAi,
            submitForApproval,
          }),
        },
        token,
      );
      setVendorOrParty('');
      setBusCode('');
      setDescription('');
      setAmountInr('');
      setSupportingDocName('');
      setExtractedByAi(false);
      setFeedback(
        submitForApproval
          ? 'Accounting voucher submitted for Principal approval (dual-control enforced).'
          : 'Accounting voucher saved as editable draft.',
      );
      await onRefresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save accounting entry.');
    } finally {
      setBusy(false);
    }
  };

  const handleEntryDecision = async (id: string, decision: 'approved' | 'rejected') => {
    clearAlerts();
    setBusy(true);
    try {
      await apiRequest(
        `/api/accounting/entries/${id}/decision`,
        {
          method: 'POST',
          body: JSON.stringify({
            decision,
            rejectionReason:
              decision === 'rejected' ? 'Please attach verified vendor voucher.' : undefined,
          }),
        },
        token,
      );
      setFeedback(
        decision === 'approved'
          ? 'Entry approved and posted to institutional ledger.'
          : 'Entry returned to Accountant for revision.',
      );
      await onRefresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Action blocked.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    clearAlerts();
    setBusy(true);
    try {
      await apiRequest(`/api/accounting/entries/${id}`, { method: 'DELETE' }, token);
      setFeedback('Draft voucher removed.');
      await onRefresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to delete transaction.');
    } finally {
      setBusy(false);
    }
  };

  const handleReconcileBank = async (bankId: string) => {
    clearAlerts();
    const matchedEntryId = matchEntryMap[bankId];
    if (!matchedEntryId) {
      setErrorMsg('Select a ledger voucher to match against this bank transaction.');
      return;
    }
    setBusy(true);
    try {
      await apiRequest(
        `/api/accounting/bank-reconcile/${bankId}`,
        {
          method: 'POST',
          body: JSON.stringify({ matchedEntryId }),
        },
        token,
      );
      setFeedback('Bank statement transaction reconciled and linked to ledger entry.');
      await onRefresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Reconciliation failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleExtractDocument = async () => {
    clearAlerts();
    setBusy(true);
    try {
      const res = await apiRequest<{
        extracted: {
          category: AccountingEntryCategory;
          direction: 'Income' | 'Expense';
          vendorOrParty: string;
          busCode?: string;
          amountInr: number;
          description: string;
          confidenceLabel: string;
        };
      }>(
        '/api/accounting/extract-document',
        {
          method: 'POST',
          body: JSON.stringify({
            fileName: docFileName,
            rawText: docRawText,
          }),
        },
        token,
      );
      setEntryCategory(res.extracted.category);
      setEntryDirection(res.extracted.direction);
      setVendorOrParty(res.extracted.vendorOrParty);
      setBusCode(res.extracted.busCode || '');
      setAmountInr(String(res.extracted.amountInr));
      setDescription(res.extracted.description);
      setSupportingDocName(docFileName);
      setExtractedByAi(true);
      setExtractResultLabel(res.extracted.confidenceLabel);
      setSubTab('ledger');
      setFeedback(
        `AI extracted voucher draft (${res.extracted.confidenceLabel}). Verify fields below and submit for Principal approval.`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Document extraction failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!newTaskTitle.trim()) return;
    setBusy(true);
    try {
      await apiRequest(
        '/api/accounting/tasks',
        {
          method: 'POST',
          body: JSON.stringify({
            title: newTaskTitle,
            category: newTaskCategory,
            dueDate: newTaskDue,
            assignedTo: 'Suresh Kumar (Accountant)',
          }),
        },
        token,
      );
      setNewTaskTitle('');
      setFeedback('Accounting task assigned.');
      await onRefresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to assign task.');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateTaskStatus = async (
    taskId: string,
    status: 'Pending' | 'In Progress' | 'Completed',
  ) => {
    clearAlerts();
    await apiRequest(
      `/api/accounting/tasks/${taskId}`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      token,
    );
    await onRefresh();
  };

  const handleExportLedgerCsv = () => {
    const header = [
      'Date',
      'Month',
      'Category',
      'Direction',
      'Vendor/Party',
      'Bus Code',
      'Amount (INR)',
      'Mode',
      'Status',
      'Created By',
      'Approved By',
      'Period Locked',
    ];
    const lines = [
      header.join(','),
      ...entries.map((e) =>
        [
          e.date,
          e.monthKey,
          e.category,
          e.direction,
          `"${e.vendorOrParty.replace(/"/g, '""')}"`,
          e.busCode || '',
          e.amountInr,
          e.paymentMode,
          e.status,
          e.createdBy,
          e.approvedBy || '',
          e.periodLocked ? 'LOCKED' : 'OPEN',
        ].join(','),
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Finance360_Accounting_Ledger_${data.activeSchool.code}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" data-testid="accountant-finance-360-panel">
      {/* Header + Segregation of Duties Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Building2 className="h-4 w-4" />
              Finance 360° — School Accounting, Payroll &amp; Bank Reconciliation
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {isAccountant
                ? `Accountant Operations Desk — ${user.name}`
                : 'Institutional Accounting, Payroll & Dual-Control Approvals'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-600">
              Daily entries, bus-wise fuel &amp; maintenance, teacher &amp; driver payroll
              preparation, bank statement matching, AI document extraction, and monthly closing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportLedgerCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              Export Ledger CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Financial Statement
            </button>
          </div>
        </div>

        {/* Segregation of Duties Governance Notice */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-950">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div>
            <span className="font-bold">Segregation of Duties Enforced:</span>{' '}
            {isAccountant
              ? 'You can record daily entries, collect student fees, prepare Teacher & Driver payroll, upload financial documents, and reconcile bank statements. Final voucher approval, payroll authorisation, deleting posted transactions, and modifying locked financial periods (Oct 2026) are restricted to School Management.'
              : 'Dual-control active: Principal / School Admin approves submitted accounting entries & payroll registers prepared by the Accountant. Posted transactions are immutable and October 2026 is period-locked.'}
          </div>
        </div>

        {/* 5 Operational KPI Cards */}
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="text-[11px] font-semibold text-slate-500">Today&apos;s Entries</div>
            <div className="mt-1 font-mono text-2xl font-bold text-slate-900">
              {todaysEntriesCount}
            </div>
            <div className="text-[11px] text-slate-500">{draftCount} draft(s) open</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
            <div className="text-[11px] font-semibold text-amber-800">Pending Approvals</div>
            <div className="mt-1 font-mono text-2xl font-bold text-amber-900">
              {pendingApprovalCount}
            </div>
            <div className="text-[11px] text-amber-700">Awaiting Principal sign-off</div>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
            <div className="text-[11px] font-semibold text-rose-800">Unmatched Bank Txns</div>
            <div className="mt-1 font-mono text-2xl font-bold text-rose-900">
              {unmatchedBankCount}
            </div>
            <div className="text-[11px] text-rose-700">Reconcile against ledger</div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
            <div className="text-[11px] font-semibold text-emerald-800">Ledger Net Position</div>
            <div className="mt-1 font-mono text-lg font-bold text-emerald-900">
              ₹{(totalIncome - totalExpense).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-700">
              In ₹{totalIncome.toLocaleString('en-IN')} · Out ₹{totalExpense.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5">
            <div className="text-[11px] font-semibold text-indigo-800">Monthly Closing Status</div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-indigo-950">
              <Lock className="h-4 w-4 text-indigo-600" />
              Oct 2026 Locked
            </div>
            <div className="mt-0.5 text-[11px] text-indigo-700">
              Nov 2026 Open · {openTasksCount} task(s)
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {[
            { id: 'ledger' as AccountingSubTab, label: `Daily Entries & Bus Fuel (${entries.length})`, icon: IndianRupee },
            { id: 'payroll' as AccountingSubTab, label: `Teacher & Driver Payroll (${payrolls.length})`, icon: Users },
            { id: 'bank' as AccountingSubTab, label: `Bank Reconciliation (${unmatchedBankCount} Unmatched)`, icon: Landmark },
            { id: 'ai_extract' as AccountingSubTab, label: 'Upload Document & AI Extract', icon: FileUp },
            { id: 'tasks_reports' as AccountingSubTab, label: `Closing Tasks & Reports (${openTasksCount})`, icon: ClipboardCheck },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  subTab === t.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-900">
          {feedback}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-900">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* TAB 1: DAILY ACCOUNTING ENTRIES, BUS FUEL, MAINTENANCE & VENDORS */}
      {subTab === 'ledger' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Voucher Creation Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Plus className="h-4 w-4 text-emerald-600" />
              Record Daily Accounting Voucher
            </h3>
            {extractResultLabel && (
              <div className="mt-2 rounded-lg bg-purple-50 px-3 py-1.5 text-[11px] font-semibold text-purple-800">
                AI Draft Loaded: {extractResultLabel}
              </div>
            )}
            <div className="mt-3 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Date</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Flow</label>
                  <select
                    value={entryDirection}
                    onChange={(e) => setEntryDirection(e.target.value as 'Income' | 'Expense')}
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-2"
                  >
                    <option value="Expense">Expense (Outflow)</option>
                    <option value="Income">Income (Receipt)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">Category</label>
                <select
                  value={entryCategory}
                  onChange={(e) => setEntryCategory(e.target.value as AccountingEntryCategory)}
                  className="w-full rounded-xl border border-slate-200 px-2.5 py-2"
                >
                  {ENTRY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  Vendor / Party / Batch Name *
                </label>
                <input
                  type="text"
                  value={vendorOrParty}
                  onChange={(e) => setVendorOrParty(e.target.value)}
                  placeholder="e.g., HPCL Fuel Station / Haryana Stationers"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Amount (INR) *</label>
                  <input
                    type="number"
                    min={1}
                    value={amountInr}
                    onChange={(e) => setAmountInr(e.target.value)}
                    placeholder="e.g., 6480"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) =>
                      setPaymentMode(
                        e.target.value as 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque',
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-2.5 py-2"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Bus Code (for Fuel/Maint)
                  </label>
                  <input
                    type="text"
                    value={busCode}
                    onChange={(e) => setBusCode(e.target.value)}
                    placeholder="e.g., BUS-03"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Supporting Invoice Ref
                  </label>
                  <input
                    type="text"
                    value={supportingDocName}
                    onChange={(e) => setSupportingDocName(e.target.value)}
                    placeholder="bill-884.pdf"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-700">Narration / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Diesel litres, route, invoice breakdown..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleCreateEntry(false)}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleCreateEntry(true)}
                  className="flex-1 rounded-xl bg-emerald-700 px-3 py-2 font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                >
                  Submit for Approval
                </button>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Institutional Accounting Ledger ({filteredEntries.length} Entries)
              </h3>
              <div className="flex flex-wrap gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value as 'All' | AccountingEntryCategory)
                  }
                  className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-medium"
                >
                  <option value="All">All Categories</option>
                  {ENTRY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {busCodes.length > 0 && (
                  <select
                    value={busFilter}
                    onChange={(e) => setBusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-medium"
                  >
                    <option value="All">All Buses</option>
                    {busCodes.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5">Date &amp; Category</th>
                    <th className="px-3 py-2.5">Vendor / Narration</th>
                    <th className="px-3 py-2.5 text-right">Amount</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                    <th className="px-3 py-2.5 text-right">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEntries.map((entry: AccountingEntry) => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5">
                        <div className="font-mono font-semibold text-slate-800">{entry.date}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                            {entry.category}
                          </span>
                          {entry.busCode && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                              <Fuel className="h-2.5 w-2.5" />
                              {entry.busCode}
                            </span>
                          )}
                          {entry.periodLocked && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              <Lock className="h-2.5 w-2.5" />
                              Locked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{entry.vendorOrParty}</div>
                        <div className="text-[11px] text-slate-500">{entry.description}</div>
                        <div className="mt-0.5 text-[10px] text-slate-400">
                          By {entry.createdBy} · {entry.paymentMode}
                          {entry.supportingDocName ? ` · Doc: ${entry.supportingDocName}` : ''}
                        </div>
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right font-mono font-bold ${
                          entry.direction === 'Income' ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {entry.direction === 'Income' ? '+' : '-'}₹
                        {entry.amountInr.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${
                            entry.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : entry.status === 'submitted'
                                ? 'bg-amber-100 text-amber-800'
                                : entry.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        {entry.periodLocked ? (
                          <span className="text-[10px] font-semibold text-slate-400">
                            Immutable
                          </span>
                        ) : entry.status === 'submitted' && isManagementApprover ? (
                          <div className="inline-flex gap-1">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleEntryDecision(entry.id, 'approved')}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleEntryDecision(entry.id, 'rejected')}
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-rose-700"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </button>
                          </div>
                        ) : entry.status === 'draft' ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDeleteDraft(entry.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete Draft
                          </button>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500">
                            {entry.status === 'submitted'
                              ? 'Awaiting Principal'
                              : `Posted (${entry.approvedBy || 'Mgmt'})`}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHOLE-STAFF BULK TEACHER & DRIVER PAYROLL SHEET */}
      {subTab === 'payroll' && (
        <BulkPayrollSheetPanel
          data={data}
          user={user}
          token={token}
          isManagementApprover={isManagementApprover}
          onRefresh={onRefresh}
        />
      )}

      {/* TAB 3: BANK RECONCILIATION */}
      {subTab === 'bank' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">
            Bank Statement Reconciliation Workspace
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Match incoming bank statement credits and debits against recorded accounting vouchers.
          </p>
          <div className="mt-4 space-y-3">
            {bankItems.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">{b.txnDate}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                      {b.bankRef}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        b.matchStatus === 'Matched'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.matchStatus}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{b.narration}</div>
                  <div className="text-xs font-mono font-bold text-indigo-700">
                    {b.direction === 'Credit' ? '+' : '-'}₹{b.amountInr.toLocaleString('en-IN')}
                  </div>
                </div>
                {b.matchStatus === 'Matched' ? (
                  <div className="text-xs font-semibold text-emerald-700">
                    Matched to Ledger Entry {b.matchedEntryId} by {b.reconciledBy}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={matchEntryMap[b.id] || ''}
                      onChange={(e) =>
                        setMatchEntryMap((prev) => ({ ...prev, [b.id]: e.target.value }))
                      }
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    >
                      <option value="">Select matching voucher...</option>
                      {entries.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.date} · {e.vendorOrParty} (₹{e.amountInr.toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleReconcileBank(b.id)}
                      className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      Reconcile Match
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENT UPLOAD & AI EXTRACTION */}
      {subTab === 'ai_extract' && (
        <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-950">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Financial Document Upload &amp; AI Draft Extraction
          </div>
          <p className="text-xs text-slate-600">
            Upload or paste text from a fuel receipt, bus maintenance bill, vendor invoice, or
            salary sheet. The AI extractor creates an editable draft voucher for Accountant review
            and Principal approval (never auto-posted).
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Document File Name
              </label>
              <input
                type="text"
                value={docFileName}
                onChange={(e) => setDocFileName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Attach Invoice / Bill File (PDF, PNG, JPG, XLSX)
              </label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setDocFileName(f.name);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Invoice / Receipt Text Content
            </label>
            <textarea
              rows={4}
              value={docRawText}
              onChange={(e) => setDocRawText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono"
            />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={handleExtractDocument}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-60"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Extract Draft Voucher into Ledger Form
          </button>
        </div>
      )}

      {/* TAB 5: MANAGEMENT-ASSIGNED ACCOUNTING TASKS */}
      {subTab === 'tasks_reports' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-7">
            <h3 className="text-sm font-bold text-slate-900">
              Accounting &amp; Monthly Closing Tasks ({tasks.length})
            </h3>
            <div className="mt-3 space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3.5 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{task.title}</div>
                    <div className="text-[11px] text-slate-500">
                      {task.category} · Due {task.dueDate} · Assigned by {task.assignedBy}
                    </div>
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleUpdateTaskStatus(
                        task.id,
                        e.target.value as 'Pending' | 'In Progress' | 'Completed',
                      )
                    }
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5">
            <h3 className="text-sm font-bold text-slate-900">
              {isManagementApprover ? 'Assign Task to Accountant' : 'Financial Reporting Packs'}
            </h3>
            {isManagementApprover ? (
              <form onSubmit={handleCreateTask} className="mt-3 space-y-3 text-xs">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g., Reconcile Route 2 diesel vouchers for Nov"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">Category</label>
                    <select
                      value={newTaskCategory}
                      onChange={(e) =>
                        setNewTaskCategory(
                          e.target.value as
                            | 'Reconciliation'
                            | 'Payroll'
                            | 'Fee Audit'
                            | 'Vendor Verification'
                            | 'Monthly Closing',
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-2.5 py-2"
                    >
                      <option value="Reconciliation">Reconciliation</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Fee Audit">Fee Audit</option>
                      <option value="Vendor Verification">Vendor Verification</option>
                      <option value="Monthly Closing">Monthly Closing</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">Due Date</label>
                    <input
                      type="date"
                      value={newTaskDue}
                      onChange={(e) => setNewTaskDue(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-2.5 py-2"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700"
                >
                  Assign Accounting Task
                </button>
              </form>
            ) : (
              <div className="mt-3 space-y-2.5 text-xs text-slate-600">
                <p>
                  Generate clean audit-ready accounting statements for Principal review and
                  monthly closing sign-off.
                </p>
                <button
                  type="button"
                  onClick={handleExportLedgerCsv}
                  className="w-full rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 font-bold text-emerald-900 hover:bg-emerald-100"
                >
                  Download Monthly Ledger (Excel/CSV)
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 font-bold text-white hover:bg-slate-800"
                >
                  Print Closing Summary (PDF)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
