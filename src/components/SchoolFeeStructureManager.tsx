import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Edit3,
  FileSpreadsheet,
  Lock,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type {
  CanonicalFeePaymentPlan,
  FeeLedgerAccount,
  School,
  SchoolFeeStructureRow,
} from '../types';
import { apiRequest } from '../utils/api';
import {
  CANONICAL_PAYMENT_PLANS,
  normalizeFeeClassName,
} from '../utils/financialDashboardEngine';
import {
  buildFeeStructureCsvTemplate,
  buildPrintableFeeStructureHtml,
  computeFeeStructureTotals,
  parseImportedFeeStructure,
  sortFeeStructureRows,
  type FeeStructureInputRow,
} from '../utils/feeStructureEngine';
import { pushToast } from './ToastProvider';

interface SchoolFeeStructureManagerProps {
  school: School;
  feeStructure: SchoolFeeStructureRow[];
  feeAccounts: FeeLedgerAccount[];
  token: string;
  canEdit: boolean;
  onRefresh: () => Promise<void>;
}

interface EditableFeeRow {
  localKey: string;
  id?: string;
  className: string;
  admissionFeeInr: number;
  annualChargesInr: number;
  tuitionMonthlyInr: number;
  labActivityMonthlyInr: number;
  transportOptionalMonthlyInr: number;
  defaultPaymentPlan: CanonicalFeePaymentPlan;
  notes: string;
}

const INR = new Intl.NumberFormat('en-IN');

function formatInr(amount: number): string {
  return `₹${INR.format(Math.round(amount || 0))}`;
}

function toEditableRows(rows: SchoolFeeStructureRow[]): EditableFeeRow[] {
  return sortFeeStructureRows(rows).map((r, idx) => ({
    localKey: `${r.id || r.className}-${idx}`,
    id: r.id,
    className: r.className,
    admissionFeeInr: r.admissionFeeInr,
    annualChargesInr: r.annualChargesInr,
    tuitionMonthlyInr: r.tuitionMonthlyInr,
    labActivityMonthlyInr: r.labActivityMonthlyInr,
    transportOptionalMonthlyInr: r.transportOptionalMonthlyInr,
    defaultPaymentPlan: r.defaultPaymentPlan,
    notes: r.notes || '',
  }));
}

const SAMPLE_DESIGNED_CSV = `Class,Admission Fee,Annual Charges,Monthly Tuition,Monthly Lab/Activity,Optional Transport,Default Payment Plan,Notes
Nursery,5000,3200,1900,250,900,Monthly,Play-way activity kit included
LKG,5000,3200,2000,250,900,Monthly,Foundational phonics & numeracy
UKG,5000,3500,2100,300,900,Quarterly,Smart classroom included
Class 1,5500,3800,2300,350,950,Quarterly,Primary STEM & reading lab
Class 2,5500,3800,2400,350,950,Quarterly,Primary STEM & reading lab
Class 3,6000,4000,2500,400,950,Quarterly,Computer & robotics lab
Class 4,6000,4000,2600,400,950,Quarterly,Computer & robotics lab
Class 5,6000,4200,2750,450,1000,Quarterly,Middle school readiness`;

export const SchoolFeeStructureManager: React.FC<SchoolFeeStructureManagerProps> = ({
  school,
  feeStructure,
  feeAccounts,
  token,
  canEdit,
  onRefresh,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftRows, setDraftRows] = useState<EditableFeeRow[]>(() => toEditableRows(feeStructure));
  const [syncLedgersOnSave, setSyncLedgersOnSave] = useState(false);
  const [saving, setSaving] = useState(false);

  // Import modal state
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [syncLedgersOnImport, setSyncLedgersOnImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sortedPublished = useMemo(() => sortFeeStructureRows(feeStructure), [feeStructure]);

  // Count active students per normalized class for transparent impact preview
  const studentCountByClass = useMemo(() => {
    const map = new Map<string, number>();
    for (const acc of feeAccounts) {
      const key = normalizeFeeClassName(acc.className || acc.rawClass).toLowerCase();
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [feeAccounts]);

  const summaryStats = useMemo(() => {
    const count = sortedPublished.length;
    if (count === 0) {
      return {
        classesCount: 0,
        avgMonthlyInr: 0,
        avgAnnualInr: 0,
        lastUpdatedBy: 'Not published yet',
        lastUpdatedAt: '—',
      };
    }
    const avgMonthlyInr = Math.round(
      sortedPublished.reduce((s, r) => s + r.totalMonthlyInr, 0) / count,
    );
    const avgAnnualInr = Math.round(
      sortedPublished.reduce((s, r) => s + r.totalAnnualRecurringInr, 0) / count,
    );
    const latest = [...sortedPublished].sort((a, b) =>
      (b.updatedAt || '').localeCompare(a.updatedAt || ''),
    )[0];
    return {
      classesCount: count,
      avgMonthlyInr,
      avgAnnualInr,
      lastUpdatedBy: latest?.updatedBy || 'Principal Office',
      lastUpdatedAt: latest?.updatedAt ? latest.updatedAt.slice(0, 10) : '—',
    };
  }, [sortedPublished]);

  const parsedImport = useMemo(() => {
    if (!importText.trim()) return null;
    return parseImportedFeeStructure(importText, school.id, school.session, 'Principal');
  }, [importText, school.id, school.session]);

  const matchingStudentsForDraft = useMemo(() => {
    const activeSet = new Set(
      (isEditing ? draftRows : sortedPublished)
        .map((r) => normalizeFeeClassName(r.className).toLowerCase())
        .filter(Boolean),
    );
    let total = 0;
    for (const key of activeSet) {
      total += studentCountByClass.get(key) || 0;
    }
    return total;
  }, [draftRows, isEditing, sortedPublished, studentCountByClass]);

  const matchingStudentsForImport = useMemo(() => {
    if (!parsedImport) return 0;
    const keys = new Set(
      parsedImport.rows.map((r) => normalizeFeeClassName(r.className).toLowerCase()),
    );
    let total = 0;
    for (const key of keys) {
      total += studentCountByClass.get(key) || 0;
    }
    return total;
  }, [parsedImport, studentCountByClass]);

  function startManualEdit() {
    setDraftRows(toEditableRows(sortedPublished));
    setSyncLedgersOnSave(false);
    setIsEditing(true);
  }

  function cancelManualEdit() {
    setDraftRows(toEditableRows(sortedPublished));
    setSyncLedgersOnSave(false);
    setIsEditing(false);
  }

  function updateDraftField<K extends keyof EditableFeeRow>(
    localKey: string,
    field: K,
    value: EditableFeeRow[K],
  ) {
    setDraftRows((prev) =>
      prev.map((row) => (row.localKey === localKey ? { ...row, [field]: value } : row)),
    );
  }

  function addDraftRow() {
    setDraftRows((prev) => [
      ...prev,
      {
        localKey: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        className: `Class ${prev.length + 1}`,
        admissionFeeInr: 5500,
        annualChargesInr: 3500,
        tuitionMonthlyInr: 2500,
        labActivityMonthlyInr: 300,
        transportOptionalMonthlyInr: 950,
        defaultPaymentPlan: 'Quarterly',
        notes: '',
      },
    ]);
  }

  function removeDraftRow(localKey: string) {
    setDraftRows((prev) => prev.filter((r) => r.localKey !== localKey));
  }

  async function handleSaveManualStructure() {
    const cleaned: FeeStructureInputRow[] = draftRows
      .map((r) => ({
        id: r.id,
        className: r.className.trim(),
        admissionFeeInr: Math.max(0, Math.round(Number(r.admissionFeeInr) || 0)),
        annualChargesInr: Math.max(0, Math.round(Number(r.annualChargesInr) || 0)),
        tuitionMonthlyInr: Math.max(0, Math.round(Number(r.tuitionMonthlyInr) || 0)),
        labActivityMonthlyInr: Math.max(0, Math.round(Number(r.labActivityMonthlyInr) || 0)),
        transportOptionalMonthlyInr: Math.max(
          0,
          Math.round(Number(r.transportOptionalMonthlyInr) || 0),
        ),
        defaultPaymentPlan: r.defaultPaymentPlan,
        notes: r.notes.trim(),
      }))
      .filter((r) => r.className.length > 0);

    if (cleaned.length === 0) {
      pushToast('Add at least one class with a valid name before saving.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await apiRequest<{
        feeStructure: SchoolFeeStructureRow[];
        syncedAccountsCount: number;
      }>(
        '/api/finance/fee-structure',
        {
          method: 'PUT',
          body: JSON.stringify({
            rows: cleaned,
            mode: 'replace',
            source: 'manual',
            syncStudentLedgers: syncLedgersOnSave,
          }),
        },
        token,
      );
      await onRefresh();
      setIsEditing(false);
      pushToast(
        `Fee structure published (${res.feeStructure.length} classes)${
          res.syncedAccountsCount > 0
            ? ` · Synced ${res.syncedAccountsCount} student ledgers`
            : ''
        }.`,
        'success',
      );
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : 'Unable to save school fee structure.',
        'error',
      );
    } finally {
      setSaving(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setImportText(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function handleConfirmImport() {
    if (!parsedImport || parsedImport.rows.length === 0) {
      pushToast('No valid class rows found to import. Check the preview warnings.', 'error');
      return;
    }

    setImporting(true);
    try {
      const payloadRows: FeeStructureInputRow[] = parsedImport.rows.map((r) => ({
        className: r.className,
        admissionFeeInr: r.admissionFeeInr,
        annualChargesInr: r.annualChargesInr,
        tuitionMonthlyInr: r.tuitionMonthlyInr,
        labActivityMonthlyInr: r.labActivityMonthlyInr,
        transportOptionalMonthlyInr: r.transportOptionalMonthlyInr,
        defaultPaymentPlan: r.defaultPaymentPlan,
        notes: r.notes || '',
      }));

      const res = await apiRequest<{
        feeStructure: SchoolFeeStructureRow[];
        syncedAccountsCount: number;
      }>(
        '/api/finance/fee-structure',
        {
          method: 'PUT',
          body: JSON.stringify({
            rows: payloadRows,
            mode: importMode,
            source: 'import',
            syncStudentLedgers: syncLedgersOnImport,
          }),
        },
        token,
      );

      await onRefresh();
      setImportOpen(false);
      setImportText('');
      setImportFileName(null);
      setIsEditing(false);
      pushToast(
        `Imported ${payloadRows.length} class rows (${importMode === 'merge' ? 'merged' : 'replaced'} → ${res.feeStructure.length} total classes)${
          res.syncedAccountsCount > 0
            ? ` · Synced ${res.syncedAccountsCount} student ledgers`
            : ''
        }.`,
        'success',
      );
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : 'Unable to import fee structure.',
        'error',
      );
    } finally {
      setImporting(false);
    }
  }

  function handleExportCsv(rowsToExport: SchoolFeeStructureRow[], filenameSuffix: string) {
    const csv = buildFeeStructureCsvTemplate(rowsToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rai-plus-fee-structure-${school.session}-${filenameSuffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrintOfficialFeeCard() {
    const html = buildPrintableFeeStructureHtml(sortedPublished, school);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 1200);
      }
    }, 250);
  }

  return (
    <div className="space-y-6" data-testid="school-fee-structure-manager">
      {/* Authoritative Principal Governance Banner */}
      <section className="rounded-2xl border border-[#D6B66D]/45 bg-[#142B46] text-[#FAF4EC] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#D6B66D]">
              Rai Plus Principal Tariff Control · Session {school.session}
            </p>
            <h2 className="font-display text-xl font-bold text-white mt-1">
              Official School Fee Structure
            </h2>
            <p className="text-xs text-[#F3E6D8]/85 mt-1 max-w-2xl">
              {canEdit
                ? 'Manually edit class-wise admission, annual, tuition, and lab charges or import your pre-designed school fee structure directly from Excel, Google Sheets, CSV, or JSON.'
                : 'Authoritative fee tariff card published by the Principal Office. Accounts and coordinators can reference, print, or export the official schedule.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {canEdit && !isEditing && (
              <>
                <button
                  type="button"
                  data-testid="edit-fee-structure-btn"
                  onClick={startManualEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#D6B66D] px-3.5 py-2 text-xs font-bold text-[#142B46] hover:bg-[#E1C580] transition whitespace-nowrap"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Manually
                </button>
                <button
                  type="button"
                  data-testid="open-import-fee-structure-btn"
                  onClick={() => setImportOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6B66D]/60 bg-[#1D3A5C] px-3.5 py-2 text-xs font-bold text-[#FAF4EC] hover:bg-[#24466E] transition whitespace-nowrap"
                >
                  <Upload className="h-3.5 w-3.5 text-[#D6B66D]" />
                  Import Designed Structure
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => handleExportCsv(sortedPublished, 'official')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 transition whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>

            <button
              type="button"
              data-testid="print-fee-structure-btn"
              onClick={handlePrintOfficialFeeCard}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white px-3 py-2 text-xs font-bold text-[#142B46] hover:bg-[#FAF4EC] transition whitespace-nowrap"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Official Card
            </button>
          </div>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/15">
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-[11px] font-medium text-[#A9C5D8]">Classes Configured</p>
            <p className="font-mono text-xl font-bold text-white tabular-nums mt-0.5">
              {summaryStats.classesCount}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-[11px] font-medium text-[#A9C5D8]">Avg. Total Monthly Fee</p>
            <p className="font-mono text-xl font-bold text-[#D6B66D] tabular-nums mt-0.5">
              {formatInr(summaryStats.avgMonthlyInr)}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-[11px] font-medium text-[#A9C5D8]">Avg. Annual Recurring</p>
            <p className="font-mono text-xl font-bold text-white tabular-nums mt-0.5">
              {formatInr(summaryStats.avgAnnualInr)}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-[11px] font-medium text-[#A9C5D8]">Last Published</p>
            <p className="text-xs font-bold text-white truncate mt-1">
              {summaryStats.lastUpdatedBy}
            </p>
            <p className="font-mono text-[11px] text-[#F3E6D8]/75 tabular-nums">
              {summaryStats.lastUpdatedAt}
            </p>
          </div>
        </div>
      </section>

      {!canEdit && (
        <div className="rounded-xl border border-[#A9C5D8]/60 bg-[#FAF4EC] px-5 py-3 text-xs text-[#142B46] flex items-center gap-2.5">
          <Lock className="h-4 w-4 text-[#7B5D1C] shrink-0" />
          <span>
            <strong>Principal Governance Lock:</strong> Only the Principal or School Admin can
            manually modify or import the school fee structure. Use <strong>Print Official Card</strong> or{' '}
            <strong>Export CSV</strong> to share this schedule with parents and staff.
          </span>
        </div>
      )}

      {/* Active Manual Edit Action Bar */}
      {canEdit && isEditing && (
        <div className="rounded-xl border-2 border-[#D6B66D] bg-[#FAF4EC] px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#142B46] flex items-center gap-1.5">
              <Edit3 className="h-3.5 w-3.5 text-[#7B5D1C]" />
              Principal Manual Edit Mode ({draftRows.length} classes)
            </p>
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncLedgersOnSave}
                onChange={(e) => setSyncLedgersOnSave(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#142B46] focus:ring-[#142B46]"
              />
              <span>
                Sync updated class fees to existing student ledgers (
                <strong className="font-mono tabular-nums">{matchingStudentsForDraft}</strong>{' '}
                matching accounts)
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              data-testid="add-fee-structure-row-btn"
              onClick={addDraftRow}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#142B46]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#142B46] hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Class
            </button>
            <button
              type="button"
              onClick={cancelManualEdit}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Discard
            </button>
            <button
              type="button"
              data-testid="save-fee-structure-btn"
              onClick={handleSaveManualStructure}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#1D3A5C] disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5 text-[#D6B66D]" />
              {saving ? 'Publishing...' : 'Save & Publish Structure'}
            </button>
          </div>
        </div>
      )}

      {/* Main Class-Wise Fee Structure Table */}
      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="border-b border-slate-200 bg-[#FAF4EC]/70 px-6 py-3.5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-bold text-[#142B46]">
              Class-Wise Fee Heads &amp; Installment Matrix
            </h3>
            <p className="text-[11px] text-slate-600">
              Total Monthly = Tuition + Lab/Activity · Annual Recurring = (Total Monthly × 12) + Annual Charges · Transport is optional per route.
            </p>
          </div>
          {canEdit && !isEditing && (
            <button
              type="button"
              onClick={() => handleExportCsv(sortedPublished, 'template')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#142B46] hover:underline"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#6E987A]" />
              Download Excel/CSV Template
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="px-4 py-3 whitespace-nowrap">Class</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Admission (1x)</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Annual Charges</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Tuition / Mo.</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Lab &amp; Activity / Mo.</th>
                <th className="px-3 py-3 text-right whitespace-nowrap bg-[#FAF4EC] text-[#142B46]">
                  Total Monthly
                </th>
                <th className="px-3 py-3 text-right whitespace-nowrap bg-[#FAF4EC] text-[#142B46]">
                  Annual Recurring
                </th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Quarterly</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Half-Yearly</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Transport (Opt.)</th>
                <th className="px-3 py-3 whitespace-nowrap">Default Plan</th>
                <th className="px-3 py-3 whitespace-nowrap">Notes</th>
                {isEditing && <th className="px-3 py-3 text-right">Remove</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isEditing
                ? draftRows.map((row) => {
                    const totals = computeFeeStructureTotals(row);
                    const studentCount =
                      studentCountByClass.get(
                        normalizeFeeClassName(row.className).toLowerCase(),
                      ) || 0;
                    return (
                      <tr key={row.localKey} className="hover:bg-[#FAF4EC]/35">
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <input
                            type="text"
                            value={row.className}
                            onChange={(e) =>
                              updateDraftField(row.localKey, 'className', e.target.value)
                            }
                            aria-label="Class name"
                            className="w-28 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-[#142B46]"
                          />
                          {studentCount > 0 && (
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {studentCount} student{studentCount === 1 ? '' : 's'}
                            </p>
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-right">
                          <input
                            type="number"
                            min={0}
                            value={row.admissionFeeInr}
                            onChange={(e) =>
                              updateDraftField(
                                row.localKey,
                                'admissionFeeInr',
                                Number(e.target.value) || 0,
                              )
                            }
                            aria-label={`Admission fee for ${row.className}`}
                            className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-right font-mono text-xs tabular-nums"
                          />
                        </td>
                        <td className="px-2 py-2.5 text-right">
                          <input
                            type="number"
                            min={0}
                            value={row.annualChargesInr}
                            onChange={(e) =>
                              updateDraftField(
                                row.localKey,
                                'annualChargesInr',
                                Number(e.target.value) || 0,
                              )
                            }
                            aria-label={`Annual charges for ${row.className}`}
                            className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-right font-mono text-xs tabular-nums"
                          />
                        </td>
                        <td className="px-2 py-2.5 text-right">
                          <input
                            type="number"
                            min={0}
                            value={row.tuitionMonthlyInr}
                            onChange={(e) =>
                              updateDraftField(
                                row.localKey,
                                'tuitionMonthlyInr',
                                Number(e.target.value) || 0,
                              )
                            }
                            aria-label={`Monthly tuition for ${row.className}`}
                            className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-right font-mono text-xs tabular-nums"
                          />
                        </td>
                        <td className="px-2 py-2.5 text-right">
                          <input
                            type="number"
                            min={0}
                            value={row.labActivityMonthlyInr}
                            onChange={(e) =>
                              updateDraftField(
                                row.localKey,
                                'labActivityMonthlyInr',
                                Number(e.target.value) || 0,
                              )
                            }
                            aria-label={`Lab and activity fee for ${row.className}`}
                            className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-right font-mono text-xs tabular-nums"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-[#142B46] bg-[#FAF4EC]/60 tabular-nums whitespace-nowrap">
                          {formatInr(totals.totalMonthlyInr)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-[#142B46] bg-[#FAF4EC]/60 tabular-nums whitespace-nowrap">
                          {formatInr(totals.totalAnnualRecurringInr)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                          {formatInr(totals.quarterlyInstallmentInr)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                          {formatInr(totals.halfYearlyInstallmentInr)}
                        </td>
                        <td className="px-2 py-2.5 text-right">
                          <input
                            type="number"
                            min={0}
                            value={row.transportOptionalMonthlyInr}
                            onChange={(e) =>
                              updateDraftField(
                                row.localKey,
                                'transportOptionalMonthlyInr',
                                Number(e.target.value) || 0,
                              )
                            }
                            aria-label={`Transport fee for ${row.className}`}
                            className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-right font-mono text-xs tabular-nums"
                          />
                        </td>
                        <td className="px-2 py-2.5 whitespace-nowrap">
                          <select
                            value={row.defaultPaymentPlan}
                            onChange={(e) =>
                              updateDraftField(
                                row.localKey,
                                'defaultPaymentPlan',
                                e.target.value as CanonicalFeePaymentPlan,
                              )
                            }
                            aria-label={`Default plan for ${row.className}`}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-[#142B46]"
                          >
                            {CANONICAL_PAYMENT_PLANS.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2.5">
                          <input
                            type="text"
                            value={row.notes}
                            onChange={(e) =>
                              updateDraftField(row.localKey, 'notes', e.target.value)
                            }
                            placeholder="Optional remark"
                            aria-label={`Notes for ${row.className}`}
                            className="w-36 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => removeDraftRow(row.localKey)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Remove class row"
                            aria-label={`Remove ${row.className}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                : sortedPublished.map((row) => {
                    const studentCount =
                      studentCountByClass.get(
                        normalizeFeeClassName(row.className).toLowerCase(),
                      ) || 0;
                    return (
                      <tr key={row.id} className="hover:bg-[#FAF4EC]/40 transition">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-bold text-[#142B46]">{row.className}</p>
                          <p className="text-[10px] text-slate-500">
                            {studentCount} active student{studentCount === 1 ? '' : 's'}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                          {formatInr(row.admissionFeeInr)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                          {formatInr(row.annualChargesInr)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-800 tabular-nums whitespace-nowrap">
                          {formatInr(row.tuitionMonthlyInr)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                          {formatInr(row.labActivityMonthlyInr)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-[#142B46] bg-[#FAF4EC]/55 tabular-nums whitespace-nowrap">
                          {formatInr(row.totalMonthlyInr)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-[#142B46] bg-[#FAF4EC]/55 tabular-nums whitespace-nowrap">
                          {formatInr(row.totalAnnualRecurringInr)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                          {formatInr(row.quarterlyInstallmentInr)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                          {formatInr(row.halfYearlyInstallmentInr)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-600 tabular-nums whitespace-nowrap">
                          {row.transportOptionalMonthlyInr > 0
                            ? formatInr(row.transportOptionalMonthlyInr)
                            : '—'}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-md border border-[#142B46]/15 bg-[#FAF4EC] px-2 py-0.5 text-[11px] font-bold text-[#142B46]">
                            {row.defaultPaymentPlan}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-600 max-w-[200px] truncate" title={row.notes || ''}>
                          {row.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Import Designed Fee Structure Modal */}
      {importOpen && canEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-fee-structure-title"
          data-testid="import-fee-structure-modal"
        >
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-[#142B46] px-6 py-4 flex items-center justify-between gap-4 text-white">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#D6B66D]">
                  Principal Fee Structure Importer
                </p>
                <h3
                  id="import-fee-structure-title"
                  className="font-display text-base font-bold text-white"
                >
                  Import Your Designed School Fee Structure (CSV / Excel Paste / JSON)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Close import modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Upload / Template Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-dashed border-[#142B46]/35 bg-[#FAF4EC]/60 p-4 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#142B46]">
                      Option 1 · Upload Designed File
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Upload a <code>.csv</code>, <code>.tsv</code>, <code>.txt</code>, or{' '}
                      <code>.json</code> file exported from Excel or Google Sheets.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.tsv,.txt,.json,text/csv,application/json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1D3A5C]"
                    >
                      <Upload className="h-3.5 w-3.5 text-[#D6B66D]" />
                      Choose File
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportCsv(sortedPublished, 'template')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#142B46] hover:bg-slate-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Template CSV
                    </button>
                    {importFileName && (
                      <span className="text-[11px] font-semibold text-[#6E987A]">
                        Loaded: {importFileName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <p className="text-xs font-bold text-[#142B46]">Import Behavior &amp; Sync</p>
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-[#142B46]"
                      />
                      Merge with existing classes
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-[#142B46]"
                      />
                      Replace entire structure
                    </label>
                  </div>
                  <label className="inline-flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncLedgersOnImport}
                      onChange={(e) => setSyncLedgersOnImport(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#142B46]"
                    />
                    <span>
                      Also update active student ledgers for imported classes (
                      <strong className="font-mono tabular-nums">{matchingStudentsForImport}</strong>{' '}
                      matched accounts)
                    </span>
                  </label>
                </div>
              </div>

              {/* Paste Box */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label
                    htmlFor="fee-structure-paste-area"
                    className="text-xs font-bold text-[#142B46]"
                  >
                    Option 2 · Copy &amp; Paste Rows Directly from Excel / Google Sheets / CSV
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setImportText(SAMPLE_DESIGNED_CSV);
                      setImportFileName('sample-designed-tariff.csv');
                    }}
                    className="text-[11px] font-bold text-[#7B5D1C] hover:underline"
                  >
                    Load Sample Designed Tariff
                  </button>
                </div>
                <textarea
                  id="fee-structure-paste-area"
                  data-testid="import-fee-structure-textarea"
                  rows={6}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`Paste columns like:\nClass, Admission Fee, Annual Charges, Monthly Tuition, Lab/Activity, Transport, Default Payment Plan, Notes\nNursery, 5000, 3200, 1900, 250, 900, Monthly, Play-way kit included`}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs text-slate-800 focus:border-[#142B46] focus:outline-none"
                />
              </div>

              {/* Live Parsed Preview */}
              {parsedImport && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[#142B46] flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-[#6E987A]" />
                      Live Parsed Preview: {parsedImport.rows.length} class
                      {parsedImport.rows.length === 1 ? '' : 'es'} detected (
                      {parsedImport.detectedFormat.toUpperCase()})
                    </p>
                    {parsedImport.skippedLines > 0 && (
                      <span className="text-[11px] text-slate-500">
                        {parsedImport.skippedLines} header/blank line(s) skipped
                      </span>
                    )}
                  </div>

                  {parsedImport.warnings.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 space-y-1">
                      {parsedImport.warnings.map((w, idx) => (
                        <p key={idx} className="flex items-start gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-700" />
                          <span>{w}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {parsedImport.rows.length > 0 && (
                    <div className="max-h-60 overflow-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-[#FAF4EC] border-b border-slate-200 text-[11px] font-bold text-[#142B46]">
                          <tr>
                            <th className="px-3 py-2">Class</th>
                            <th className="px-3 py-2 text-right">Admission</th>
                            <th className="px-3 py-2 text-right">Annual</th>
                            <th className="px-3 py-2 text-right">Tuition/Mo.</th>
                            <th className="px-3 py-2 text-right">Lab/Mo.</th>
                            <th className="px-3 py-2 text-right">Total Mo.</th>
                            <th className="px-3 py-2 text-right">Annual Recurring</th>
                            <th className="px-3 py-2">Plan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedImport.rows.map((r) => (
                            <tr key={r.id}>
                              <td className="px-3 py-2 font-bold text-[#142B46]">{r.className}</td>
                              <td className="px-3 py-2 text-right font-mono tabular-nums">
                                {formatInr(r.admissionFeeInr)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono tabular-nums">
                                {formatInr(r.annualChargesInr)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono tabular-nums">
                                {formatInr(r.tuitionMonthlyInr)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono tabular-nums">
                                {formatInr(r.labActivityMonthlyInr)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-[#142B46] tabular-nums">
                                {formatInr(r.totalMonthlyInr)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-[#142B46] tabular-nums">
                                {formatInr(r.totalAnnualRecurringInr)}
                              </td>
                              <td className="px-3 py-2">{r.defaultPaymentPlan}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setImportOpen(false)}
                  disabled={importing}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-testid="confirm-import-fee-structure-btn"
                  onClick={handleConfirmImport}
                  disabled={importing || !parsedImport || parsedImport.rows.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-5 py-2 text-xs font-bold text-white hover:bg-[#1D3A5C] disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-[#D6B66D] ${importing ? 'animate-spin' : ''}`} />
                  {importing
                    ? 'Importing & Publishing...'
                    : `Confirm & Publish ${parsedImport?.rows.length || 0} Classes`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
