import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  Boxes,
  Building2,
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FolderTree,
  IndianRupee,
  Package,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  ShieldAlert,
  ShoppingCart,
  Sparkles,
  Trash2,
  Wrench,
} from 'lucide-react';
import type { WorkspaceData } from '../../types/workspace';
import type {
  AnnualSessionRequirementLine,
  FixedAsset,
  InventoryAiRecommendation,
  InventoryAutomatedAlert,
  InventoryUnit,
  SchoolInventoryState,
  StockTransactionType,
} from '../../types/inventory';
import { apiRequest } from '../../utils/api';
import {
  buildInventoryFinancialCsv,
  generateDeterministicQrSvg,
} from '../../utils/inventoryIntelligenceEngine';

interface InventoryAssetModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

type InvTab =
  | 'dashboard'
  | 'consumables'
  | 'assets'
  | 'procurement'
  | 'books_planner'
  | 'classrooms'
  | 'audits_finance'
  | 'categories_requests';

interface InventoryWorkspacePayload {
  state: SchoolInventoryState;
  ai: {
    recommendations: InventoryAiRecommendation[];
    alerts: InventoryAutomatedAlert[];
    potentialSavingsInr: number;
    wastageValueInr: number;
    idleAssetsCount: number;
    replacementCandidatesCount: number;
  };
  financials: {
    totalInventoryAndAssetValueInr: number;
    consumableStockValueInr: number;
    consumableFifoValueInr: number;
    assetAcquisitionCostInr: number;
    totalDepreciationInr: number;
    assetBookValueInr: number;
    purchaseExpenditureInr: number;
    totalRepairSpendInr: number;
    wastageValueInr: number;
    disposalProceedsInr: number;
    inventoryTurnoverRatio: number;
    budgetUtilizationPct: number;
    byCategory: Array<{ categoryName: string; consumableValue: number; assetBookValue: number; count: number }>;
    byDepartment: Array<{ department: string; consumableValue: number; assetBookValue: number; maintenanceSpend: number }>;
    byLocation: Array<{ locationName: string; stockValue: number; assetBookValue: number }>;
  };
  classroomReadiness: Array<{
    locationId: string;
    roomLabel: string;
    classSection: string;
    requiredTotal: number;
    workingTotal: number;
    damagedTotal: number;
    missingTotal: number;
    readinessPct: number;
    openTicketsCount: number;
    items: SchoolInventoryState['classroomResources'];
  }>;
  annualPlan: {
    currentStudents: number;
    expectedNewAdmissions: number;
    projectedStudents: number;
    lines: AnnualSessionRequirementLine[];
    totalEstimatedBudgetInr: number;
    totalNormalBudgetInr: number;
    totalGrowthBudgetInr: number;
    totalEmergencyBudgetInr: number;
  };
  assetValuations: Record<
    string,
    {
      ageYears: number;
      remainingLifeYears: number;
      accumulatedDepreciationInr: number;
      currentBookValueInr: number;
      warrantyDaysRemaining: number;
      amcDaysRemaining: number | null;
      repairToValuePct: number;
      recommendReplacement: boolean;
    }
  >;
  permissions: {
    canApprove: boolean;
    canManageStock: boolean;
    role: string;
  };
}

function fmtInr(n: number): string {
  return `₹${Math.round(n || 0).toLocaleString('en-IN')}`;
}

export const InventoryAssetModule: React.FC<InventoryAssetModuleProps> = ({ data, token }) => {
  const [tab, setTab] = useState<InvTab>('dashboard');
  const [payload, setPayload] = useState<InventoryWorkspacePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters & Interactive Form States
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Ledger Tx Form
  const [txItemId, setTxItemId] = useState('');
  const [txType, setTxType] = useState<StockTransactionType | 'TRANSFER'>('ISSUE');
  const [txQty, setTxQty] = useState<number>(5);
  const [txLocId, setTxLocId] = useState('');
  const [txDestLocId, setTxDestLocId] = useState('');
  const [txRecipient, setTxRecipient] = useState('');
  const [txPurpose, setTxPurpose] = useState('');

  // QR Scanner & Asset Modals
  const [qrInput, setQrInput] = useState('AST-IT-002');
  const [qrResult, setQrResult] = useState<Record<string, unknown> | null>(null);
  const [showBatchQrPrint, setShowBatchQrPrint] = useState(false);
  const [transferAsset, setTransferAsset] = useState<FixedAsset | null>(null);
  const [transferLocId, setTransferLocId] = useState('');
  const [transferCustodian, setTransferCustodian] = useState('');
  const [transferReason, setTransferReason] = useState('Redistributing idle asset to active classroom');

  // New Asset Form
  const [showNewAsset, setShowNewAsset] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetBrand, setNewAssetBrand] = useState('');
  const [newAssetModel, setNewAssetModel] = useState('');
  const [newAssetCost, setNewAssetCost] = useState(25000);
  const [newAssetCat, setNewAssetCat] = useState('');
  const [newAssetLoc, setNewAssetLoc] = useState('');

  // Purchase Request & GRN Form
  const [prItemName, setPrItemName] = useState('');
  const [prQty, setPrQty] = useState(25);
  const [prUnit, setPrUnit] = useState<InventoryUnit>('pcs');
  const [prCost, setPrCost] = useState(250);
  const [prDept, setPrDept] = useState('Academics');
  const [prPurpose, setPrPurpose] = useState('');
  const [grnPoId, setGrnPoId] = useState<string | null>(null);
  const [grnAccepted, setGrnAccepted] = useState(50);
  const [grnDamaged, setGrnDamaged] = useState(0);
  const [grnInvoice, setGrnInvoice] = useState('');

  // Books Distribution Form
  const [bookStudentId, setBookStudentId] = useState('');
  const [bookItemId, setBookItemId] = useState('');
  const [bookIsReplacement, setBookIsReplacement] = useState(false);
  const [bookReplaceReason, setBookReplaceReason] = useState('');

  // Annual Plan Assumptions Form
  const [admPct, setAdmPct] = useState(12);
  const [nbPerStu, setNbPerStu] = useState(10);
  const [bufPct, setBufPct] = useState(8);

  // Stock Audit Form
  const [auditItemId, setAuditItemId] = useState('');
  const [auditPhysQty, setAuditPhysQty] = useState(0);
  const [auditDmgQty, setAuditDmgQty] = useState(0);
  const [auditExplain, setAuditExplain] = useState('');

  // Category & Resource Request Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatKind, setNewCatKind] = useState<'consumable' | 'fixed_asset' | 'both'>('both');
  const [reqItemId, setReqItemId] = useState('');
  const [reqQty, setReqQty] = useState(5);
  const [reqPurpose, setReqPurpose] = useState('');

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<InventoryWorkspacePayload>(
        '/api/inventory/workspace',
        { method: 'GET' },
        token,
      );
      setPayload(res);
      setAdmPct(res.state.annualAssumptions.expectedNewAdmissionsPct);
      setNbPerStu(res.state.annualAssumptions.notebooksPerStudent);
      setBufPct(res.state.annualAssumptions.bufferStockPct);
      if (!txItemId && res.state.consumables[0]) {
        setTxItemId(res.state.consumables[0].id);
        setTxLocId(res.state.consumables[0].primaryLocationId);
        setReqItemId(res.state.consumables[0].id);
        setBookItemId(res.state.consumables[0].id);
        setAuditItemId(res.state.consumables[0].id);
        setAuditPhysQty(res.state.consumables[0].availableStock);
      }
      if (!txDestLocId && res.state.locations[1]) {
        setTxDestLocId(res.state.locations[1].id);
        setTransferLocId(res.state.locations[1].id);
        setNewAssetLoc(res.state.locations[0]!.id);
      }
      if (!newAssetCat && res.state.categories[4]) {
        setNewAssetCat(res.state.categories[4].id);
      }
      if (!bookStudentId && data.students[0]) {
        setBookStudentId(data.students[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load Inventory & Asset Intelligence workspace.');
    } finally {
      setLoading(false);
    }
  }, [token, data.students, txItemId, txDestLocId, newAssetCat, bookStudentId]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const locNameMap = useMemo(() => {
    const m = new Map<string, string>();
    payload?.state.locations.forEach((l) => m.set(l.id, l.name));
    return m;
  }, [payload]);

  const catNameMap = useMemo(() => {
    const m = new Map<string, string>();
    payload?.state.categories.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [payload]);

  async function runAction(fn: () => Promise<void>, successMessage: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
      await loadWorkspace();
      setNotice(successMessage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleQrLookup(codeToScan: string) {
    setError(null);
    setQrResult(null);
    if (!codeToScan.trim()) return;
    try {
      const res = await apiRequest<Record<string, unknown>>(
        `/api/inventory/qr/${encodeURIComponent(codeToScan.trim())}`,
        { method: 'GET' },
        token,
      );
      setQrResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'QR lookup failed.');
    }
  }

  function handleExportCsv() {
    if (!payload) return;
    const csv = buildInventoryFinancialCsv(payload.state);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rai-plus-inventory-financials-${data.activeSchool.code}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading && !payload) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
        Loading AI Inventory, Fixed Asset Register &amp; Procurement Intelligence…
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        {error || 'Inventory module unavailable for this role.'}
      </div>
    );
  }

  const { state, ai, financials, classroomReadiness, annualPlan, assetValuations, permissions } =
    payload;
  const lowStockCount = state.consumables.filter(
    (c) => c.active && c.availableStock <= c.reorderLevel,
  ).length;
  const outOfStockCount = state.consumables.filter((c) => c.active && c.availableStock <= 0).length;
  const activeAssets = state.assets.filter((a) => a.disposalStatus !== 'Disposed');
  const repairAssetsCount = activeAssets.filter(
    (a) => a.condition === 'Damaged' || a.condition === 'Under Repair',
  ).length;
  const pendingPrCount = state.purchaseRequests.filter((p) => p.status === 'Pending Approval').length;
  const pendingReqCount = state.resourceRequests.filter((r) => r.status === 'Pending').length;
  const pendingAuditCount = state.audits.filter((a) => a.status === 'Pending Approval').length;

  const filteredConsumables = state.consumables.filter((c) => {
    if (catFilter !== 'all' && c.categoryId !== catFilter) return false;
    if (lowStockOnly && c.availableStock > c.reorderLevel) return false;
    if (
      search.trim() &&
      !`${c.name} ${c.sku} ${c.department} ${c.subcategory || ''}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredAssets = state.assets.filter((a) => {
    if (catFilter !== 'all' && a.categoryId !== catFilter) return false;
    if (
      search.trim() &&
      !`${a.name} ${a.assetCode} ${a.brand} ${a.model} ${a.serialNumber} ${a.assignedEmployee}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const TABS: Array<{ id: InvTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: 'AI Dashboard', icon: Sparkles, badge: ai.recommendations.length },
    { id: 'consumables', label: 'Stock & Ledger', icon: Boxes, badge: lowStockCount || undefined },
    { id: 'assets', label: 'Fixed Assets & QR', icon: QrCode, badge: activeAssets.length },
    { id: 'procurement', label: 'Procurement & POs', icon: ShoppingCart, badge: pendingPrCount || undefined },
    { id: 'books_planner', label: 'Books & Session Plan', icon: BookOpen },
    { id: 'classrooms', label: 'Classrooms & Repairs', icon: Wrench, badge: repairAssetsCount || undefined },
    { id: 'audits_finance', label: 'Audits & Finance', icon: IndianRupee, badge: pendingAuditCount || undefined },
    { id: 'categories_requests', label: 'Categories & Requests', icon: FolderTree, badge: pendingReqCount || undefined },
  ];

  return (
    <div className="space-y-5" data-testid="inventory-asset-module">
      {/* Executive Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#0F243D] via-[#153152] to-[#1D4068] p-5 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-200">
                <Sparkles className="h-3 w-3" />
                AI Resource Optimization Engine
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-200">
                Ledger-Backed · Multi-Tenant · {data.activeSchool.name}
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold mt-2">
              Rai Plus — Inventory, Fixed Assets &amp; Procurement Intelligence
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Single source of truth for consumable stock, QR-tracked fixed assets, classroom readiness,
              multi-quote procurement, physical audits, depreciation, and AI-guided resource optimization.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
            >
              <Download className="h-3.5 w-3.5" />
              Export Accounting CSV
            </button>
            <button
              type="button"
              onClick={() => void loadWorkspace()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#D6B66D] px-3 py-1.5 text-xs font-bold text-[#0F243D] hover:bg-[#e3c681]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Live
            </button>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                data-testid={`inv-tab-${t.id}`}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  tab === t.id
                    ? 'bg-white text-[#0F243D] shadow-xs'
                    : 'bg-white/10 text-slate-100 hover:bg-white/20'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
                {t.badge != null && t.badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold font-mono ${
                      tab === t.id ? 'bg-[#142B46] text-white' : 'bg-amber-400/25 text-amber-100'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-900 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-700 shrink-0" />
          {error}
        </div>
      )}

      {/* ==================== TAB 1: EXECUTIVE DASHBOARD & AI INTELLIGENCE ==================== */}
      {tab === 'dashboard' && (
        <div className="space-y-5">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold text-slate-500">Total Inventory &amp; Asset Value</p>
              <p className="font-mono text-xl font-bold text-[#0F243D] mt-1">
                {fmtInr(financials.totalInventoryAndAssetValueInr)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Stock {fmtInr(financials.consumableStockValueInr)} · Assets {fmtInr(financials.assetBookValueInr)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold text-slate-500">AI Identified Savings</p>
              <p className="font-mono text-xl font-bold text-emerald-700 mt-1">
                {fmtInr(ai.potentialSavingsInr)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {ai.idleAssetsCount} idle asset(s) · transfer &amp; quote optimization
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold text-slate-500">Stock &amp; Asset Alerts</p>
              <p className="font-mono text-xl font-bold text-amber-700 mt-1">
                {lowStockCount} Low · {repairAssetsCount} Repair
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {outOfStockCount} out of stock · {pendingAuditCount} audit variance(s)
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold text-slate-500">Procurement &amp; Wastage</p>
              <p className="font-mono text-xl font-bold text-slate-900 mt-1">
                {pendingPrCount} PRs · {financials.budgetUtilizationPct}% Budget
              </p>
              <p className="text-[11px] text-rose-700 mt-1">
                Preventable wastage: {fmtInr(financials.wastageValueInr)}
              </p>
            </div>
          </div>

          {/* AI Recommendations Grid (6 Buckets — Always Explainable & Human-Approved!) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  AI Inventory &amp; Procurement Recommendations ({ai.recommendations.length})
                </h2>
                <p className="text-xs text-slate-600">
                  Every recommendation shows its formula &amp; checks existing stock, pending POs, and internal transfers first. AI never auto-approves spending.
                </p>
              </div>
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-900">
                Advisory Only · Management Approval Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {ai.recommendations.map((rec) => {
                const badgeMap: Record<InventoryAiRecommendation['bucket'], { label: string; cls: string }> = {
                  purchase: { label: 'What to Purchase', cls: 'bg-blue-100 text-blue-900' },
                  do_not_purchase: { label: 'Do NOT Purchase / Save', cls: 'bg-emerald-100 text-emerald-900' },
                  transfer: { label: 'Transfer Idle Asset', cls: 'bg-indigo-100 text-indigo-900' },
                  repair: { label: 'Repair Recommended', cls: 'bg-amber-100 text-amber-900' },
                  replace: { label: 'Replace End-of-Life', cls: 'bg-rose-100 text-rose-900' },
                  wastage: { label: 'Wastage / Expiry Alert', cls: 'bg-orange-100 text-orange-900' },
                };
                const b = badgeMap[rec.bucket];
                return (
                  <div
                    key={rec.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${b.cls}`}>
                          {b.label}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {fmtInr(rec.estimatedFinancialImpactInr)}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900">{rec.title}</h3>
                      <p className="text-[11px] text-slate-600">{rec.detail}</p>
                      <p className="rounded-lg bg-white border border-slate-200/80 p-2 text-[10px] text-slate-600 font-mono leading-relaxed">
                        {rec.calculationExplanation}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (rec.bucket === 'purchase' || rec.bucket === 'do_not_purchase') setTab('procurement');
                        else if (rec.bucket === 'transfer' || rec.bucket === 'replace') setTab('assets');
                        else if (rec.bucket === 'repair') setTab('classrooms');
                        else setTab('consumables');
                      }}
                      className="w-full rounded-lg bg-[#142B46] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1E3B5C]"
                    >
                      {rec.actionLabel} →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Automated Operational Triggers + Department Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                Automated Triggers &amp; Task Feed ({ai.alerts.length})
              </h3>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {ai.alerts.slice(0, 12).map((al) => (
                  <div key={al.id} className="py-2.5 flex items-start justify-between gap-2 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{al.title}</p>
                      <p className="text-[11px] text-slate-600">{al.detail}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Owner: {al.ownerRole} · Due: {al.deadline}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        al.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : al.priority === 'High'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {al.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-900" />
                Department-Wise Inventory &amp; Asset Value
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Department</th>
                      <th className="px-3 py-2 text-right">Stock</th>
                      <th className="px-3 py-2 text-right">Asset Book Val</th>
                      <th className="px-3 py-2 text-right">Repairs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {financials.byDepartment.map((d) => (
                      <tr key={d.department}>
                        <td className="px-3 py-2 font-semibold text-slate-900">{d.department}</td>
                        <td className="px-3 py-2 text-right font-mono">{fmtInr(d.consumableValue)}</td>
                        <td className="px-3 py-2 text-right font-mono">{fmtInr(d.assetBookValue)}</td>
                        <td className="px-3 py-2 text-right font-mono text-rose-700">
                          {fmtInr(d.maintenanceSpend)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: CONSUMABLE STOCK & IMMUTABLE LEDGER ==================== */}
      {tab === 'consumables' && (
        <div className="space-y-5">
          {/* Stock Movement / Transfer Form */}
          {permissions.canManageStock && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void runAction(async () => {
                  await apiRequest(
                    '/api/inventory/ledger',
                    {
                      method: 'POST',
                      body: JSON.stringify({
                        itemId: txItemId,
                        txType,
                        quantity: Number(txQty),
                        locationId: txLocId || undefined,
                        destinationLocationId: txType === 'TRANSFER' ? txDestLocId : undefined,
                        recipientName: txRecipient || undefined,
                        purpose: txPurpose || `${txType} via Inventory Desk`,
                        idempotencyKey: `ui-${txType}-${txItemId}-${Date.now()}`,
                      }),
                    },
                    token,
                  );
                  setTxPurpose('');
                }, `Recorded ${txType} of ${txQty} unit(s) into immutable stock ledger.`);
              }}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-blue-900" />
                  Post Auditable Stock Movement (Receipt / Issue / Return / Transfer / Damage / Wastage)
                </h3>
                <span className="text-[11px] text-slate-500">
                  Negative stock blocked automatically · Duplicate receipts prevented
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
                <select
                  aria-label="Consumable item"
                  value={txItemId}
                  onChange={(e) => {
                    setTxItemId(e.target.value);
                    const found = state.consumables.find((c) => c.id === e.target.value);
                    if (found) setTxLocId(found.primaryLocationId);
                  }}
                  className="lg:col-span-2 rounded-lg border border-slate-300 px-2.5 py-2 font-semibold"
                >
                  {state.consumables.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.availableStock} {c.unit})
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Transaction type"
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as StockTransactionType | 'TRANSFER')}
                  className="rounded-lg border border-slate-300 px-2.5 py-2 font-semibold"
                >
                  <option value="ISSUE">Issue Stock</option>
                  <option value="PURCHASE_RECEIPT">Receive Stock</option>
                  <option value="RETURN">Return to Store</option>
                  <option value="TRANSFER">Inter-Store Transfer</option>
                  <option value="DAMAGE">Record Damage</option>
                  <option value="WASTAGE">Record Wastage</option>
                </select>
                <input
                  type="number"
                  min={1}
                  value={txQty}
                  onChange={(e) => setTxQty(Number(e.target.value))}
                  placeholder="Qty"
                  className="rounded-lg border border-slate-300 px-2.5 py-2 font-mono"
                />
                {txType === 'TRANSFER' ? (
                  <select
                    aria-label="Destination location"
                    value={txDestLocId}
                    onChange={(e) => setTxDestLocId(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2.5 py-2"
                  >
                    {state.locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        To: {l.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={txRecipient}
                    onChange={(e) => setTxRecipient(e.target.value)}
                    placeholder="Issued to / Department"
                    className="rounded-lg border border-slate-300 px-2.5 py-2"
                  />
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-[#142B46] px-3 py-2 font-bold text-white hover:bg-[#1E3B5C]"
                >
                  {busy ? 'Posting…' : 'Post Ledger Tx'}
                </button>
              </div>
              <input
                type="text"
                value={txPurpose}
                onChange={(e) => setTxPurpose(e.target.value)}
                placeholder="Purpose / Voucher note (recorded in permanent audit trail)"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
              />
            </form>
          )}

          {/* Filter Bar + Consumables Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search SKU, item, department…"
                    className="rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 text-xs w-56"
                  />
                </div>
                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                >
                  <option value="all">All 12 Categories</option>
                  {state.categories
                    .filter((c) => c.active)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} · {c.name}
                      </option>
                    ))}
                </select>
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                  />
                  Low Stock Only ({lowStockCount})
                </label>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {filteredConsumables.length} items · Reconciled from {state.ledger.length} ledger tx
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">SKU &amp; Item</th>
                    <th className="px-3 py-2.5">Category / Location</th>
                    <th className="px-3 py-2.5 text-right">Available</th>
                    <th className="px-3 py-2.5 text-right">Reorder / Min</th>
                    <th className="px-3 py-2.5 text-right">Dmg / Waste</th>
                    <th className="px-3 py-2.5 text-right">Avg Price</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredConsumables.map((c) => {
                    const isLow = c.availableStock <= c.reorderLevel;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2.5">
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <p className="text-[10px] font-mono text-slate-500">
                            {c.sku} · {c.valuationMethod.toUpperCase()} · GST {c.gstPct}%
                          </p>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-slate-800">{catNameMap.get(c.categoryId)}</p>
                          <p className="text-[10px] text-slate-500">
                            {locNameMap.get(c.primaryLocationId)}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                          {c.availableStock} {c.unit}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                          {c.reorderLevel} / {c.minimumStock}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-rose-700">
                          {c.damagedStock} / {c.wastageStock}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono">
                          {fmtInr(c.averagePurchasePriceInr)}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              c.availableStock <= 0
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {c.availableStock <= 0 ? 'Out of Stock' : isLow ? 'Reorder Due' : 'Healthy'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Immutable Transaction Ledger */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900">
              Immutable Stock Transaction Ledger (Latest 15 Entries)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2 text-right">Delta</th>
                    <th className="px-3 py-2">Location / Recipient</th>
                    <th className="px-3 py-2">Purpose &amp; Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.ledger.slice(0, 15).map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-500">
                        {tx.timestamp.slice(0, 16).replace('T', ' ')}
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-800">
                          {tx.txType}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-900">{tx.itemName}</td>
                      <td
                        className={`px-3 py-2 text-right font-mono font-bold ${
                          tx.signedDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {tx.signedDelta >= 0 ? `+${tx.signedDelta}` : tx.signedDelta} {tx.unit}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {locNameMap.get(tx.locationId) || tx.locationId}
                        {tx.recipientName ? ` → ${tx.recipientName}` : ''}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {tx.purpose} <span className="text-slate-400">({tx.actorName})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: FIXED ASSETS & QR STUDIO ==================== */}
      {tab === 'assets' && (
        <div className="space-y-5">
          {/* QR Scanner Lookup + Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <QrCode className="h-4 w-4 text-blue-900" />
                <span className="text-xs font-bold text-slate-900">Mobile QR / Barcode Asset Scanner:</span>
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Scan or enter AST-IT-002 / Serial / SKU"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono w-60"
                />
                <button
                  type="button"
                  onClick={() => void handleQrLookup(qrInput)}
                  className="rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1E3B5C]"
                >
                  Scan / Verify
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchQrPrint((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <Printer className="h-3.5 w-3.5" />
                  {showBatchQrPrint ? 'Hide Batch QR Labels' : 'Printable Batch QR Labels'}
                </button>
                {permissions.canManageStock && (
                  <button
                    type="button"
                    onClick={() => setShowNewAsset((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Register Fixed Asset
                  </button>
                )}
              </div>
            </div>

            {qrResult && qrResult.kind === 'fixed_asset' && Boolean(qrResult.asset) && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 flex flex-col sm:flex-row items-start gap-4 text-xs">
                <div
                  className="shrink-0 rounded-lg border border-slate-200 bg-white p-1.5"
                  dangerouslySetInnerHTML={{
                    __html: generateDeterministicQrSvg(
                      (qrResult.asset as FixedAsset).qrPayload,
                      96,
                    ),
                  }}
                />
                <div className="space-y-1 flex-1">
                  <p className="font-bold text-indigo-950 text-sm">
                    {(qrResult.asset as FixedAsset).assetCode} — {(qrResult.asset as FixedAsset).name}
                  </p>
                  <p className="text-slate-700">
                    {(qrResult.asset as FixedAsset).brand} {(qrResult.asset as FixedAsset).model} · SN:{' '}
                    <span className="font-mono">{(qrResult.asset as FixedAsset).serialNumber}</span>
                  </p>
                  <p className="text-slate-600">
                    Location:{' '}
                    <strong>
                      {locNameMap.get((qrResult.asset as FixedAsset).currentLocationId)}
                    </strong>{' '}
                    · Custodian: <strong>{(qrResult.asset as FixedAsset).assignedEmployee}</strong> ·
                    Condition: <strong>{(qrResult.asset as FixedAsset).condition}</strong>
                  </p>
                  <p className="text-slate-600">
                    Invoice: {(qrResult.asset as FixedAsset).invoiceNo} · Warranty until{' '}
                    {(qrResult.asset as FixedAsset).warrantyExpiryDate} · Transfers:{' '}
                    {(qrResult.asset as FixedAsset).transferHistory.length}
                  </p>
                </div>
              </div>
            )}

            {showNewAsset && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void runAction(async () => {
                    await apiRequest(
                      '/api/inventory/assets',
                      {
                        method: 'POST',
                        body: JSON.stringify({
                          name: newAssetName,
                          brand: newAssetBrand,
                          model: newAssetModel,
                          purchaseValueInr: Number(newAssetCost),
                          categoryId: newAssetCat,
                          currentLocationId: newAssetLoc,
                        }),
                      },
                      token,
                    );
                    setNewAssetName('');
                    setShowNewAsset(false);
                  }, `Registered fixed asset "${newAssetName}" with permanent QR identity.`);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 grid grid-cols-1 sm:grid-cols-6 gap-2.5 text-xs"
              >
                <input
                  required
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="Asset Name (e.g. Smart Board)"
                  className="sm:col-span-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                />
                <input
                  value={newAssetBrand}
                  onChange={(e) => setNewAssetBrand(e.target.value)}
                  placeholder="Brand"
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                />
                <input
                  value={newAssetModel}
                  onChange={(e) => setNewAssetModel(e.target.value)}
                  placeholder="Model"
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
                />
                <input
                  type="number"
                  value={newAssetCost}
                  onChange={(e) => setNewAssetCost(Number(e.target.value))}
                  placeholder="Cost (INR)"
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white hover:bg-emerald-800"
                >
                  Save &amp; Mint QR
                </button>
              </form>
            )}
          </div>

          {/* Printable Batch QR Label Sheet */}
          {showBatchQrPrint && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Batch Printable QR Asset Labels ({activeAssets.length})
                </h3>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-bold text-white"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Label Sheet
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeAssets.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-slate-300 p-3 text-center space-y-1 bg-white"
                  >
                    <div
                      className="mx-auto w-fit"
                      dangerouslySetInnerHTML={{
                        __html: generateDeterministicQrSvg(a.qrPayload, 92),
                      }}
                    />
                    <p className="font-mono text-xs font-bold text-slate-900">{a.assetCode}</p>
                    <p className="text-[11px] font-semibold text-slate-700 truncate">{a.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {locNameMap.get(a.currentLocationId)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transfer Asset Inline Modal */}
          {transferAsset && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void runAction(async () => {
                  await apiRequest(
                    `/api/inventory/assets/${transferAsset.id}/transfer`,
                    {
                      method: 'POST',
                      body: JSON.stringify({
                        toLocationId: transferLocId,
                        toCustodian: transferCustodian,
                        reason: transferReason,
                      }),
                    },
                    token,
                  );
                  setTransferAsset(null);
                }, `Transferred ${transferAsset.assetCode} with full audit history preserved.`);
              }}
              className="rounded-xl border border-indigo-300 bg-indigo-50 p-4 flex flex-wrap items-center gap-2.5 text-xs"
            >
              <strong className="text-indigo-950">
                Transfer {transferAsset.assetCode} ({transferAsset.name}):
              </strong>
              <select
                value={transferLocId}
                onChange={(e) => setTransferLocId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
              >
                {state.locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <input
                value={transferCustodian}
                onChange={(e) => setTransferCustodian(e.target.value)}
                placeholder="New Custodian Name"
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-indigo-700 px-3 py-1.5 font-bold text-white"
              >
                Confirm Transfer
              </button>
              <button
                type="button"
                onClick={() => setTransferAsset(null)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Asset Register Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Asset Code &amp; Details</th>
                  <th className="px-3 py-2.5">Location &amp; Custodian</th>
                  <th className="px-3 py-2.5 text-right">Purchase / Book Value</th>
                  <th className="px-3 py-2.5">Warranty &amp; Utilization</th>
                  <th className="px-3 py-2.5">Condition</th>
                  <th className="px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((a) => {
                  const v = assetValuations[a.id];
                  return (
                    <tr key={a.id} className={a.disposalStatus === 'Disposed' ? 'opacity-60 bg-slate-50' : ''}>
                      <td className="px-3 py-2.5">
                        <p className="font-bold text-slate-900">
                          <span className="font-mono text-indigo-800">{a.assetCode}</span> · {a.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {a.brand} {a.model} · SN: {a.serialNumber} · {a.depreciationMethod} {a.depreciationRatePct}%
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-slate-800">{locNameMap.get(a.currentLocationId)}</p>
                        <p className="text-[10px] text-slate-500">
                          {a.assignedEmployee} · {a.transferHistory.length} transfer(s)
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">
                        <p className="font-bold text-slate-900">{fmtInr(v?.currentBookValueInr ?? a.purchaseValueInr)}</p>
                        <p className="text-[10px] text-slate-500">Orig {fmtInr(a.purchaseValueInr)}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-[11px]">Warranty: {a.warrantyExpiryDate}</p>
                        <p className="text-[10px] text-slate-500">
                          {a.utilizationHoursPerWeek} hrs/wk · Repairs: {fmtInr(a.totalRepairCostInr)}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            a.disposalStatus === 'Disposed'
                              ? 'bg-slate-200 text-slate-700'
                              : a.condition === 'Damaged' || a.condition === 'Under Repair'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {a.disposalStatus === 'Disposed' ? 'Disposed (Archived)' : a.condition}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setQrInput(a.assetCode);
                              void handleQrLookup(a.assetCode);
                            }}
                            className="rounded border border-slate-200 px-2 py-0.5 text-[10px] font-semibold hover:bg-slate-100"
                          >
                            QR
                          </button>
                          {a.disposalStatus === 'Active' && permissions.canManageStock && (
                            <button
                              type="button"
                              onClick={() => {
                                setTransferAsset(a);
                                setTransferCustodian(a.assignedEmployee);
                              }}
                              className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-800"
                            >
                              Transfer
                            </button>
                          )}
                          {a.disposalStatus === 'Active' && permissions.canApprove && (
                            <button
                              type="button"
                              onClick={() =>
                                void runAction(async () => {
                                  await apiRequest(
                                    `/api/inventory/assets/${a.id}/dispose`,
                                    {
                                      method: 'POST',
                                      body: JSON.stringify({
                                        method: 'Write-Off',
                                        reason: 'Approved end-of-life disposal from Asset Register',
                                        disposalProceedsInr: 1500,
                                      }),
                                    },
                                    token,
                                  );
                                }, `Disposed ${a.assetCode} — historical audit record permanently retained.`)
                              }
                              className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-800"
                            >
                              <Trash2 className="h-3 w-3 inline" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: PROCUREMENT, QUOTATIONS, POs & GRNs ==================== */}
      {tab === 'procurement' && (
        <div className="space-y-5">
          {/* New Purchase Request Form (Auto-Checks Stock & Internal Transfers First!) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void runAction(async () => {
                await apiRequest(
                  '/api/inventory/procurement/requests',
                  {
                    method: 'POST',
                    body: JSON.stringify({
                      itemName: prItemName,
                      quantity: Number(prQty),
                      unit: prUnit,
                      estimatedUnitCostInr: Number(prCost),
                      department: prDept,
                      purpose: prPurpose,
                    }),
                  },
                  token,
                );
                setPrItemName('');
                setPrPurpose('');
              }, 'Created Purchase Request after automatic stock & internal-transfer pre-check.');
            }}
            className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
          >
            <h3 className="font-display text-sm font-bold text-slate-900">
              New Purchase Requisition (Auto-Checks Existing Stock &amp; Idle Transfers First)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 text-xs">
              <input
                required
                value={prItemName}
                onChange={(e) => setPrItemName(e.target.value)}
                placeholder="Item / Asset Name"
                className="sm:col-span-2 rounded-lg border border-slate-300 px-2.5 py-2"
              />
              <input
                type="number"
                min={1}
                value={prQty}
                onChange={(e) => setPrQty(Number(e.target.value))}
                placeholder="Qty"
                className="rounded-lg border border-slate-300 px-2.5 py-2 font-mono"
              />
              <input
                type="number"
                min={1}
                value={prCost}
                onChange={(e) => setPrCost(Number(e.target.value))}
                placeholder="Est. Unit Cost (INR)"
                className="rounded-lg border border-slate-300 px-2.5 py-2 font-mono"
              />
              <input
                value={prDept}
                onChange={(e) => setPrDept(e.target.value)}
                placeholder="Department"
                className="rounded-lg border border-slate-300 px-2.5 py-2"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-[#142B46] px-3 py-2 font-bold text-white"
              >
                Submit PR
              </button>
            </div>
          </form>

          {/* Purchase Requests + Quotation Comparison + Leadership Approvals */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900">
              Purchase Requests &amp; Vendor Quotation Comparison ({state.purchaseRequests.length})
            </h3>
            <div className="space-y-3">
              {state.purchaseRequests.map((pr) => (
                <div
                  key={pr.id}
                  className="rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-blue-900">{pr.requestNo}</span> ·{' '}
                      <strong className="text-slate-900">{pr.itemName}</strong> ({pr.quantity}{' '}
                      {pr.unit} · Est. {fmtInr(pr.estimatedTotalInr)})
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Dept: {pr.department} · Requested by {pr.requestedBy} · Stock on hand:{' '}
                        <strong>{pr.existingStockAvailable}</strong>
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-800">
                      {pr.status}
                    </span>
                  </div>

                  {pr.internalTransferCandidate && (
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11px] font-semibold text-indigo-950">
                      AI Internal Transfer Alert: {pr.internalTransferCandidate}
                    </div>
                  )}

                  {pr.quotations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {pr.quotations.map((q) => (
                        <div
                          key={q.id}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px]"
                        >
                          <strong>{q.vendorName}</strong>: {fmtInr(q.unitPriceInr)}/{pr.unit} (+
                          {q.gstPct}% GST · {q.deliveryDays}d)
                        </div>
                      ))}
                    </div>
                  )}

                  {pr.status === 'Pending Approval' && permissions.canApprove && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runAction(async () => {
                            await apiRequest(
                              `/api/inventory/procurement/requests/${pr.id}/approve`,
                              { method: 'POST', body: JSON.stringify({ decision: 'approve' }) },
                              token,
                            );
                          }, `Approved ${pr.requestNo} and generated Purchase Order.`)
                        }
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white hover:bg-emerald-800"
                      >
                        Approve &amp; Issue PO
                      </button>
                      {pr.internalTransferCandidate && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void runAction(async () => {
                              await apiRequest(
                                `/api/inventory/procurement/requests/${pr.id}/approve`,
                                {
                                  method: 'POST',
                                  body: JSON.stringify({ decision: 'transfer_instead' }),
                                },
                                token,
                              );
                            }, `Fulfilled ${pr.requestNo} via internal transfer — avoided unnecessary spend!`)
                          }
                          className="rounded-lg bg-indigo-700 px-3 py-1.5 font-bold text-white"
                        >
                          Transfer Idle Resource Instead
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runAction(async () => {
                            await apiRequest(
                              `/api/inventory/procurement/requests/${pr.id}/approve`,
                              { method: 'POST', body: JSON.stringify({ decision: 'reject' }) },
                              token,
                            );
                          }, `Rejected ${pr.requestNo}.`)
                        }
                        className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 font-bold text-rose-800"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Purchase Orders + Partial/Full GRN Posting */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900">
              Purchase Orders &amp; Goods Receipt Notes ({state.purchaseOrders.length})
            </h3>
            {state.purchaseOrders.map((po) => {
              const line = po.lines[0];
              const rem = line ? Math.max(0, line.orderedQty - line.receivedQty - line.damagedQty) : 0;
              return (
                <div key={po.id} className="rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-blue-900">{po.poNo}</span> ·{' '}
                      <strong>{po.vendorName}</strong> · Grand Total:{' '}
                      <strong className="font-mono">{fmtInr(po.grandTotalInr)}</strong> (incl. GST{' '}
                      {fmtInr(po.gstTotalInr)})
                      {line && (
                        <p className="text-[11px] text-slate-600">
                          {line.itemName}: Ordered {line.orderedQty} · Received {line.receivedQty} ·
                          Damaged {line.damagedQty} · Remaining {rem} {line.unit}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                        {po.status}
                      </span>
                      {rem > 0 && permissions.canManageStock && (
                        <button
                          type="button"
                          onClick={() => {
                            setGrnPoId(po.id);
                            setGrnAccepted(rem);
                            setGrnDamaged(0);
                            setGrnInvoice(`INV-${Date.now().toString(36).toUpperCase()}`);
                          }}
                          className="rounded-lg bg-emerald-700 px-3 py-1 font-bold text-white"
                        >
                          Post GRN / Receive Delivery
                        </button>
                      )}
                    </div>
                  </div>

                  {grnPoId === po.id && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void runAction(async () => {
                          await apiRequest(
                            `/api/inventory/procurement/orders/${po.id}/grn`,
                            {
                              method: 'POST',
                              body: JSON.stringify({
                                idempotencyKey: `grn-${po.id}-${grnInvoice}`,
                                invoiceNo: grnInvoice,
                                acceptedQty: Number(grnAccepted),
                                damagedQty: Number(grnDamaged),
                              }),
                            },
                            token,
                          );
                          setGrnPoId(null);
                        }, `Posted GRN on ${po.poNo} and credited accepted units into stock ledger.`);
                      }}
                      className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 flex flex-wrap items-center gap-2"
                    >
                      <input
                        required
                        value={grnInvoice}
                        onChange={(e) => setGrnInvoice(e.target.value)}
                        placeholder="Invoice No."
                        className="rounded border border-slate-300 bg-white px-2.5 py-1 font-mono"
                      />
                      <label className="flex items-center gap-1">
                        Accepted:
                        <input
                          type="number"
                          min={0}
                          max={rem}
                          value={grnAccepted}
                          onChange={(e) => setGrnAccepted(Number(e.target.value))}
                          className="w-20 rounded border border-slate-300 bg-white px-2 py-1 font-mono"
                        />
                      </label>
                      <label className="flex items-center gap-1">
                        Damaged:
                        <input
                          type="number"
                          min={0}
                          max={rem}
                          value={grnDamaged}
                          onChange={(e) => setGrnDamaged(Number(e.target.value))}
                          className="w-16 rounded border border-slate-300 bg-white px-2 py-1 font-mono"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={busy}
                        className="rounded bg-emerald-700 px-3 py-1 font-bold text-white"
                      >
                        Confirm GRN
                      </button>
                      <button
                        type="button"
                        onClick={() => setGrnPoId(null)}
                        className="rounded border border-slate-300 bg-white px-2.5 py-1"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 5: BOOKS DISTRIBUTION & ANNUAL SESSION PLANNER ==================== */}
      {tab === 'books_planner' && (
        <div className="space-y-5">
          {/* Student Book Distribution with Duplicate Protection */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-900" />
              Student Books &amp; Stationery Distribution (Duplicate Prevention Enforced)
            </h3>
            {permissions.canManageStock && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void runAction(async () => {
                    await apiRequest(
                      '/api/inventory/books/distribute',
                      {
                        method: 'POST',
                        body: JSON.stringify({
                          studentId: bookStudentId,
                          itemId: bookItemId,
                          quantity: 1,
                          isReplacement: bookIsReplacement,
                          replacementReason: bookReplaceReason,
                        }),
                      },
                      token,
                    );
                    setBookIsReplacement(false);
                    setBookReplaceReason('');
                  }, 'Distributed book/stationery set and logged ledger issue.');
                }}
                className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs items-center"
              >
                <select
                  value={bookStudentId}
                  onChange={(e) => setBookStudentId(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2.5 py-2"
                >
                  {data.students.slice(0, 60).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Class {s.classSection})
                    </option>
                  ))}
                </select>
                <select
                  value={bookItemId}
                  onChange={(e) => setBookItemId(e.target.value)}
                  className="sm:col-span-2 rounded-lg border border-slate-300 px-2.5 py-2"
                >
                  {state.consumables.slice(0, 5).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.availableStock} left)
                    </option>
                  ))}
                </select>
                <label className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={bookIsReplacement}
                    onChange={(e) => setBookIsReplacement(e.target.checked)}
                  />
                  Authorized Replacement
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-[#142B46] px-3 py-2 font-bold text-white"
                >
                  Issue to Student
                </button>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Class</th>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Fee Linked</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.bookDistributions.slice(0, 10).map((d) => (
                    <tr key={d.id}>
                      <td className="px-3 py-2 font-semibold text-slate-900">{d.studentName}</td>
                      <td className="px-3 py-2">{d.classSection}</td>
                      <td className="px-3 py-2">{d.itemName}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          {d.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">{fmtInr(d.feeLinkedAmountInr)}</td>
                      <td className="px-3 py-2 font-mono text-slate-500">{d.distributedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Intelligent Annual Academic Session Requirement Planner */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-emerald-700" />
                  Annual Academic Session Requirement Planner ({state.annualAssumptions.sessionLabel})
                </h3>
                <p className="text-xs text-slate-600">
                  Live enrolment ({annualPlan.currentStudents}) + expected admissions (
                  +{annualPlan.expectedNewAdmissions}) ={' '}
                  <strong>{annualPlan.projectedStudents} projected students</strong> · Est. Net
                  Procurement Budget: <strong>{fmtInr(annualPlan.totalEstimatedBudgetInr)}</strong>
                </p>
              </div>
              {permissions.canApprove && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <label className="flex items-center gap-1">
                    Admissions %:
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={admPct}
                      onChange={(e) => setAdmPct(Number(e.target.value))}
                      className="w-14 rounded border border-slate-300 px-1.5 py-1 font-mono"
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    Notebooks/Stu:
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={nbPerStu}
                      onChange={(e) => setNbPerStu(Number(e.target.value))}
                      className="w-14 rounded border border-slate-300 px-1.5 py-1 font-mono"
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    Buffer %:
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={bufPct}
                      onChange={(e) => setBufPct(Number(e.target.value))}
                      className="w-14 rounded border border-slate-300 px-1.5 py-1 font-mono"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void runAction(async () => {
                        await apiRequest(
                          '/api/inventory/annual-plan/assumptions',
                          {
                            method: 'PUT',
                            body: JSON.stringify({
                              expectedNewAdmissionsPct: admPct,
                              notebooksPerStudent: nbPerStu,
                              bufferStockPct: bufPct,
                            }),
                          },
                          token,
                        );
                      }, 'Updated Annual Session Planner assumptions and recalculated requirements.')
                    }
                    className="rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white"
                  >
                    Recalculate
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Requirement Line</th>
                    <th className="px-3 py-2 text-right">Normal / Growth / Emerg.</th>
                    <th className="px-3 py-2 text-right">Avail + Pending</th>
                    <th className="px-3 py-2 text-right">Net To Buy</th>
                    <th className="px-3 py-2 text-right">Est. Budget</th>
                    <th className="px-3 py-2">Purchase Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {annualPlan.lines.map((l) => (
                    <tr key={l.itemName}>
                      <td className="px-3 py-2.5">
                        <p className="font-bold text-slate-900">{l.itemName}</p>
                        <p className="text-[10px] text-slate-500">{l.formulaNote}</p>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">
                        {l.normalDemand} / +{l.growthDemand} / +{l.emergencyReserve}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-emerald-700">
                        {l.availableStock} + {l.pendingOrderQty}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-900">
                        {l.netPurchaseQty} {l.unit}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold">
                        {fmtInr(l.estimatedBudgetInr)}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{l.suggestedPurchaseWindow}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 6: CLASSROOM READINESS & MAINTENANCE ==================== */}
      {tab === 'classrooms' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {classroomReadiness.map((room) => (
              <div
                key={room.locationId}
                className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900">
                      {room.roomLabel} · Class {room.classSection}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Working {room.workingTotal}/{room.requiredTotal} · {room.damagedTotal} dmg ·{' '}
                      {room.missingTotal} missing
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                      room.readinessPct >= 95
                        ? 'bg-emerald-100 text-emerald-800'
                        : room.readinessPct >= 85
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {room.readinessPct}% Ready
                  </span>
                </div>
                <div className="divide-y divide-slate-100 text-[11px]">
                  {room.items.map((item) => (
                    <div key={item.id} className="py-1 flex items-center justify-between">
                      <span className="text-slate-700">{item.resourceType}</span>
                      <span
                        className={`font-mono font-semibold ${
                          item.damagedQty > 0 || item.missingQty > 0
                            ? 'text-rose-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {item.workingQty}/{item.requiredQty}
                        {item.damagedQty > 0 ? ` (${item.damagedQty} dmg)` : ''}
                        {item.missingQty > 0 ? ` (${item.missingQty} miss)` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Maintenance & Service Tickets */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-700" />
              Preventive, Corrective &amp; Warranty Maintenance Tickets ({state.maintenanceTickets.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {state.maintenanceTickets.map((t) => (
                <div
                  key={t.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      <span className="font-mono text-indigo-800">{t.assetCode}</span> · {t.assetName}{' '}
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold">
                        {t.type}
                      </span>
                    </p>
                    <p className="text-slate-600 mt-0.5">{t.issueSummary}</p>
                    <p className="text-[10px] text-slate-400">
                      {t.locationName} · Scheduled {t.scheduledDate} · Cost {fmtInr(t.repairCostInr)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                      {t.status}
                    </span>
                    {t.status !== 'Resolved' && permissions.canManageStock && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runAction(async () => {
                            await apiRequest(
                              `/api/inventory/assets/${t.assetId}/maintenance`,
                              {
                                method: 'POST',
                                body: JSON.stringify({
                                  resolveTicketId: t.id,
                                  repairCostInr: t.repairCostInr || 1800,
                                }),
                              },
                              token,
                            );
                          }, `Resolved maintenance ticket for ${t.assetCode} and restored operational status.`)
                        }
                        className="rounded-lg bg-emerald-700 px-3 py-1 font-bold text-white"
                      >
                        Mark Repaired
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 7: PHYSICAL STOCK AUDITS & FINANCIAL REPORTS ==================== */}
      {tab === 'audits_finance' && (
        <div className="space-y-5">
          {/* Mobile-First Physical Stock Verification Submission */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void runAction(async () => {
                await apiRequest(
                  '/api/inventory/audits',
                  {
                    method: 'POST',
                    body: JSON.stringify({
                      auditType: 'Surprise',
                      scopeLabel: 'Spot Physical Verification',
                      lines: [
                        {
                          targetId: auditItemId,
                          physicalQty: Number(auditPhysQty),
                          damagedQty: Number(auditDmgQty),
                          explanation: auditExplain || 'Spot physical shelf count',
                          verifiedByQr: true,
                        },
                      ],
                    }),
                  },
                  token,
                );
                setAuditExplain('');
              }, 'Submitted physical stock count for management discrepancy approval.');
            }}
            className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
          >
            <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-blue-900" />
              Physical Stock Verification (Never Modifies Stock Silently — Requires Approval)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
              <select
                value={auditItemId}
                onChange={(e) => {
                  setAuditItemId(e.target.value);
                  const it = state.consumables.find((c) => c.id === e.target.value);
                  if (it) setAuditPhysQty(it.availableStock);
                }}
                className="sm:col-span-2 rounded-lg border border-slate-300 px-2.5 py-2"
              >
                {state.consumables.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (System: {c.availableStock} {c.unit})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                value={auditPhysQty}
                onChange={(e) => setAuditPhysQty(Number(e.target.value))}
                placeholder="Physical Count"
                className="rounded-lg border border-slate-300 px-2.5 py-2 font-mono"
              />
              <input
                value={auditExplain}
                onChange={(e) => setAuditExplain(e.target.value)}
                placeholder="Variance explanation"
                className="rounded-lg border border-slate-300 px-2.5 py-2"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-[#142B46] px-3 py-2 font-bold text-white"
              >
                Submit Count
              </button>
            </div>
          </form>

          {/* Audit Sessions & Leadership Approval */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900">
              Stock Audit Sessions &amp; Discrepancy Approvals ({state.audits.length})
            </h3>
            {state.audits.map((aud) => (
              <div key={aud.id} className="rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-blue-900">{aud.auditCode}</span> ·{' '}
                    <strong>{aud.scopeLabel}</strong> ({aud.auditType} · {aud.auditDate} by{' '}
                    {aud.auditorName})
                    <p className="text-[11px] text-slate-600">
                      Missing: <strong className="text-rose-700">{aud.totalMissingUnits}</strong> ·
                      Excess: <strong className="text-emerald-700">{aud.totalExcessUnits}</strong> ·
                      Damaged: <strong>{aud.totalDamagedUnits}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-bold">
                      {aud.status}
                    </span>
                    {aud.status === 'Pending Approval' && permissions.canApprove && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runAction(async () => {
                            await apiRequest(
                              `/api/inventory/audits/${aud.id}/approve`,
                              { method: 'POST' },
                              token,
                            );
                          }, `Approved ${aud.auditCode} and posted immutable audit adjustment ledger entries.`)
                        }
                        className="rounded-lg bg-emerald-700 px-3 py-1 font-bold text-white"
                      >
                        Approve &amp; Post Ledger Adjustment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Valuation & Depreciation Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-slate-900">
                Inventory Financial Valuation, Depreciation &amp; Accounting Reconciliation
              </h3>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-bold text-white"
              >
                <Download className="h-3.5 w-3.5" />
                Download Accounting CSV
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-slate-500">Asset Acquisition Cost</p>
                <p className="font-mono text-base font-bold text-slate-900">
                  {fmtInr(financials.assetAcquisitionCostInr)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-slate-500">Accumulated Depreciation</p>
                <p className="font-mono text-base font-bold text-rose-700">
                  −{fmtInr(financials.totalDepreciationInr)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-slate-500">Net Asset Book Value</p>
                <p className="font-mono text-base font-bold text-emerald-700">
                  {fmtInr(financials.assetBookValueInr)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-slate-500">Turnover / Disposal Proceeds</p>
                <p className="font-mono text-base font-bold text-blue-900">
                  {financials.inventoryTurnoverRatio}× · {fmtInr(financials.disposalProceedsInr)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 8: CATEGORIES & STAFF REQUEST PORTAL ==================== */}
      {tab === 'categories_requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Staff Resource Request Portal */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-900" />
              Staff Resource Request &amp; Approval Queue ({state.resourceRequests.length})
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void runAction(async () => {
                  await apiRequest(
                    '/api/inventory/requests',
                    {
                      method: 'POST',
                      body: JSON.stringify({
                        itemId: reqItemId,
                        quantity: Number(reqQty),
                        purpose: reqPurpose,
                      }),
                    },
                    token,
                  );
                  setReqPurpose('');
                }, 'Submitted inventory resource request.');
              }}
              className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs"
            >
              <select
                value={reqItemId}
                onChange={(e) => setReqItemId(e.target.value)}
                className="sm:col-span-2 rounded-lg border border-slate-300 px-2.5 py-1.5"
              >
                {state.consumables.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.availableStock} avail)
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={reqQty}
                onChange={(e) => setReqQty(Number(e.target.value))}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-[#142B46] px-3 py-1.5 font-bold text-white"
              >
                Request
              </button>
            </form>

            <div className="divide-y divide-slate-100 text-xs">
              {state.resourceRequests.map((r) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">
                      {r.requestNo} · {r.itemName} ({r.quantity} {r.unit})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {r.requesterName} ({r.department}) · {r.purpose}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold">
                      {r.status}
                    </span>
                    {r.status === 'Pending' && permissions.canManageStock && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runAction(async () => {
                            await apiRequest(
                              `/api/inventory/requests/${r.id}`,
                              { method: 'PATCH', body: JSON.stringify({ action: 'approve_issue' }) },
                              token,
                            );
                          }, `Approved and issued ${r.requestNo} from stock ledger.`)
                        }
                        className="rounded bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white"
                      >
                        Approve &amp; Issue
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configurable 12+ Hierarchical Categories */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-emerald-700" />
              Hierarchical Inventory Categories ({state.categories.filter((c) => c.active).length} Active)
            </h3>
            {permissions.canApprove && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void runAction(async () => {
                    await apiRequest(
                      '/api/inventory/categories',
                      {
                        method: 'POST',
                        body: JSON.stringify({ name: newCatName, kind: newCatKind }),
                      },
                      token,
                    );
                    setNewCatName('');
                  }, `Added inventory category "${newCatName}".`);
                }}
                className="flex flex-wrap gap-2 text-xs"
              >
                <input
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New Category Name"
                  className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5"
                />
                <select
                  value={newCatKind}
                  onChange={(e) => setNewCatKind(e.target.value as 'consumable' | 'fixed_asset' | 'both')}
                  className="rounded-lg border border-slate-300 px-2 py-1.5"
                >
                  <option value="both">Both</option>
                  <option value="consumable">Consumable</option>
                  <option value="fixed_asset">Fixed Asset</option>
                </select>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white"
                >
                  Add
                </button>
              </form>
            )}
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto text-xs">
              {state.categories.map((c) => (
                <div key={c.id} className="py-2 flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-bold ${c.active ? 'text-slate-900' : 'line-through text-slate-400'}`}>
                      {c.code} · {c.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {c.subcategories.slice(0, 5).join(', ')}
                      {c.subcategories.length > 5 ? ` +${c.subcategories.length - 5} more` : ''}
                    </p>
                  </div>
                  {permissions.canApprove && (
                    <button
                      type="button"
                      onClick={() =>
                        void runAction(async () => {
                          await apiRequest(
                            `/api/inventory/categories/${c.id}`,
                            { method: 'PATCH', body: JSON.stringify({ active: !c.active }) },
                            token,
                          );
                        }, `${c.active ? 'Deactivated' : 'Reactivated'} category ${c.name}.`)
                      }
                      className="rounded border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      {c.active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
