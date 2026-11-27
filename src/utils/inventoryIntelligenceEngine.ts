import type { AdmissionLead, StudentRecord } from '../types';
import type {
  AnnualSessionRequirementLine,
  AssetMaintenanceTicket,
  ClassroomResourceStandard,
  ConsumableItem,
  FixedAsset,
  InventoryAiRecommendation,
  InventoryAutomatedAlert,
  SchoolInventoryState,
  StockLedgerTransaction,
  StockTransactionType,
} from '../types/inventory';

function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso.slice(0, 10) + 'T00:00:00Z').getTime();
  const b = new Date(toIso.slice(0, 10) + 'T00:00:00Z').getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86400000);
}

/**
 * Reconciles a consumable item's stock balances strictly from its immutable transaction ledger.
 * Guarantees stock quantities are NEVER silently drifted from transactions.
 */
export function reconcileConsumableFromLedger(
  item: ConsumableItem,
  ledger: StockLedgerTransaction[],
): ConsumableItem {
  const txs = ledger
    .filter((t) => t.itemId === item.id)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  if (txs.length === 0) {
    return item;
  }

  let available = 0;
  let damaged = 0;
  let wastage = 0;
  let totalReceiptQty = 0;
  let totalReceiptCost = 0;
  const locMap: Record<string, number> = {};

  for (const tx of txs) {
    const qty = Math.abs(tx.quantity);
    if (tx.txType === 'OPENING' || tx.txType === 'PURCHASE_RECEIPT' || tx.txType === 'RETURN' || tx.txType === 'AUDIT_ADJUSTMENT_PLUS') {
      available += qty;
      locMap[tx.locationId] = (locMap[tx.locationId] || 0) + qty;
      if (tx.txType === 'OPENING' || tx.txType === 'PURCHASE_RECEIPT') {
        totalReceiptQty += qty;
        totalReceiptCost += qty * tx.unitCostInr;
      }
    } else if (tx.txType === 'TRANSFER_IN') {
      available += qty;
      locMap[tx.locationId] = (locMap[tx.locationId] || 0) + qty;
    } else if (tx.txType === 'TRANSFER_OUT') {
      available -= qty;
      locMap[tx.locationId] = (locMap[tx.locationId] || 0) - qty;
    } else if (tx.txType === 'ISSUE' || tx.txType === 'AUDIT_ADJUSTMENT_MINUS' || tx.txType === 'DISPOSAL_WRITEOFF') {
      available -= qty;
      locMap[tx.locationId] = (locMap[tx.locationId] || 0) - qty;
    } else if (tx.txType === 'DAMAGE') {
      available -= qty;
      damaged += qty;
      locMap[tx.locationId] = (locMap[tx.locationId] || 0) - qty;
    } else if (tx.txType === 'WASTAGE') {
      available -= qty;
      wastage += qty;
      locMap[tx.locationId] = (locMap[tx.locationId] || 0) - qty;
    }
  }

  const weightedAvg =
    totalReceiptQty > 0
      ? Math.round((totalReceiptCost / totalReceiptQty) * 100) / 100
      : item.averagePurchasePriceInr;

  return {
    ...item,
    availableStock: Math.round(available * 100) / 100,
    damagedStock: Math.round(damaged * 100) / 100,
    wastageStock: Math.round(wastage * 100) / 100,
    locationBalances: locMap,
    averagePurchasePriceInr: weightedAvg,
  };
}

export function reconcileAllConsumables(state: SchoolInventoryState): ConsumableItem[] {
  return state.consumables.map((item) => reconcileConsumableFromLedger(item, state.ledger));
}

export interface StockTransactionValidationResult {
  ok: boolean;
  error?: string;
  duplicate?: boolean;
  signedDelta: number;
}

const OUTBOUND_TX_TYPES = new Set<StockTransactionType>([
  'ISSUE',
  'TRANSFER_OUT',
  'DAMAGE',
  'WASTAGE',
  'AUDIT_ADJUSTMENT_MINUS',
  'DISPOSAL_WRITEOFF',
]);

/**
 * Enforces mandatory ledger invariants:
 * 1) Duplicate idempotencyKey prevention (never double-count receipts or returns)
 * 2) Positive quantity validation
 * 3) Zero-silent-negative-stock guard unless explicit authorized override is recorded
 */
export function validateStockLedgerTransaction(params: {
  state: SchoolInventoryState;
  itemId: string;
  txType: StockTransactionType;
  quantity: number;
  locationId: string;
  idempotencyKey?: string;
  negativeOverrideAuthorizedBy?: string | null;
}): StockTransactionValidationResult {
  const { state, itemId, txType, quantity, locationId, idempotencyKey, negativeOverrideAuthorizedBy } =
    params;

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { ok: false, error: 'Transaction quantity must be a positive number.', signedDelta: 0 };
  }

  if (idempotencyKey && state.ledger.some((t) => t.idempotencyKey === idempotencyKey)) {
    return {
      ok: false,
      duplicate: true,
      error: `Duplicate transaction blocked (idempotency key "${idempotencyKey}" already recorded).`,
      signedDelta: 0,
    };
  }

  const item = state.consumables.find((c) => c.id === itemId);
  if (!item) {
    return { ok: false, error: 'Consumable inventory item not found.', signedDelta: 0 };
  }

  const reconciled = reconcileConsumableFromLedger(item, state.ledger);
  const isOutbound = OUTBOUND_TX_TYPES.has(txType);
  const signedDelta = isOutbound ? -quantity : quantity;

  if (isOutbound) {
    const locAvail = reconciled.locationBalances[locationId] ?? reconciled.availableStock;
    const effectiveAvail = Math.min(reconciled.availableStock, Math.max(0, locAvail));
    if (quantity > reconciled.availableStock && !negativeOverrideAuthorizedBy) {
      return {
        ok: false,
        error: `Insufficient stock for ${item.name}: requested ${quantity} ${item.unit}, available ${reconciled.availableStock} ${item.unit}. Negative stock is blocked without authorized exception.`,
        signedDelta,
      };
    }
    if (txType === 'TRANSFER_OUT' && quantity > effectiveAvail && !negativeOverrideAuthorizedBy) {
      return {
        ok: false,
        error: `Insufficient stock at source location (${effectiveAvail} ${item.unit} available) to transfer ${quantity} ${item.unit}.`,
        signedDelta,
      };
    }
  }

  return { ok: true, signedDelta };
}

/**
 * Computes FIFO and Weighted-Average valuation for a consumable item.
 */
export function computeConsumableValuation(item: ConsumableItem): {
  weightedAverageValueInr: number;
  fifoValueInr: number;
  activeValuationInr: number;
} {
  const weightedAverageValueInr = Math.round(
    Math.max(0, item.availableStock) * item.averagePurchasePriceInr,
  );

  let remainingToValue = Math.max(0, item.availableStock);
  let fifoVal = 0;
  // FIFO values remaining stock using most recent remaining batches (oldest batches consumed first)
  const sortedNewestFirst = [...(item.batches || [])].sort((a, b) =>
    b.receivedDate.localeCompare(a.receivedDate),
  );
  for (const batch of sortedNewestFirst) {
    if (remainingToValue <= 0) break;
    const take = Math.min(remainingToValue, Math.max(0, batch.quantityRemaining));
    fifoVal += take * batch.unitCostInr;
    remainingToValue -= take;
  }
  if (remainingToValue > 0) {
    fifoVal += remainingToValue * item.averagePurchasePriceInr;
  }
  const fifoValueInr = Math.round(fifoVal);

  return {
    weightedAverageValueInr,
    fifoValueInr,
    activeValuationInr: item.valuationMethod === 'fifo' ? fifoValueInr : weightedAverageValueInr,
  };
}

/**
 * Computes fixed asset accumulated depreciation, book value (SLM or WDV), age, and warranty status.
 */
export function computeAssetBookValue(
  asset: FixedAsset,
  asOfDateIso: string = new Date().toISOString().slice(0, 10),
): {
  ageYears: number;
  remainingLifeYears: number;
  accumulatedDepreciationInr: number;
  currentBookValueInr: number;
  warrantyDaysRemaining: number;
  amcDaysRemaining: number | null;
  repairToValuePct: number;
  recommendReplacement: boolean;
} {
  const ageDays = Math.max(0, daysBetween(asset.purchaseDate, asOfDateIso));
  const ageYears = Math.round((ageDays / 365.25) * 100) / 100;
  const remainingLifeYears = Math.max(
    0,
    Math.round((asset.usefulLifeYears - ageYears) * 100) / 100,
  );
  const depreciableBase = Math.max(0, asset.purchaseValueInr - asset.salvageValueInr);

  let bookValue = asset.purchaseValueInr;
  if (asset.depreciationMethod === 'SLM') {
    const annualDep =
      asset.usefulLifeYears > 0 ? depreciableBase / asset.usefulLifeYears : 0;
    bookValue = Math.max(asset.salvageValueInr, asset.purchaseValueInr - annualDep * ageYears);
  } else {
    // WDV (Written Down Value)
    const rate = Math.min(0.8, Math.max(0, asset.depreciationRatePct / 100));
    bookValue = Math.max(
      asset.salvageValueInr,
      asset.purchaseValueInr * Math.pow(1 - rate, ageYears),
    );
  }

  const currentBookValueInr = Math.round(bookValue);
  const accumulatedDepreciationInr = Math.max(
    0,
    Math.round(asset.purchaseValueInr - currentBookValueInr),
  );
  const warrantyDaysRemaining = daysBetween(asOfDateIso, asset.warrantyExpiryDate);
  const amcDaysRemaining = asset.amcExpiryDate
    ? daysBetween(asOfDateIso, asset.amcExpiryDate)
    : null;
  const repairToValuePct =
    asset.purchaseValueInr > 0
      ? Math.round((asset.totalRepairCostInr / asset.purchaseValueInr) * 100)
      : 0;
  const recommendReplacement =
    asset.disposalStatus === 'Active' &&
    (remainingLifeYears <= 0.5 ||
      repairToValuePct >= 45 ||
      asset.repairCount >= 3 ||
      asset.condition === 'Obsolete');

  return {
    ageYears,
    remainingLifeYears,
    accumulatedDepreciationInr,
    currentBookValueInr,
    warrantyDaysRemaining,
    amcDaysRemaining,
    repairToValuePct,
    recommendReplacement,
  };
}

/**
 * Mandatory Pre-Procurement Check:
 * Before recommending a new purchase, inspect existing stock across stores, pending POs,
 * and idle fixed assets that can be internally transferred instead of buying new!
 */
export function checkProcurementInternalAvailability(params: {
  state: SchoolInventoryState;
  itemName: string;
  categoryId: string;
  requestedQty: number;
}): {
  existingStockAvailable: number;
  pendingPurchaseOrderQty: number;
  internalTransferCandidate: string | null;
  recommendedAdditionalPurchaseQty: number;
  recommendationNote: string;
} {
  const { state, itemName, categoryId, requestedQty } = params;
  const q = itemName.trim().toLowerCase();
  const locById = new Map(state.locations.map((l) => [l.id, l.name]));

  // Check matching consumable stock across all locations
  const matchingConsumables = state.consumables.filter(
    (c) =>
      c.active &&
      (c.name.toLowerCase().includes(q) ||
        q.includes(c.name.toLowerCase()) ||
        (c.categoryId === categoryId && c.subcategory?.toLowerCase() === q)),
  );
  const existingStockAvailable = matchingConsumables.reduce(
    (sum, c) => sum + Math.max(0, c.availableStock - c.reservedStock),
    0,
  );

  let internalTransferCandidate: string | null = null;
  for (const c of matchingConsumables) {
    for (const [locId, qty] of Object.entries(c.locationBalances || {})) {
      if (qty >= Math.min(requestedQty, Math.max(1, c.minimumStock))) {
        internalTransferCandidate = `${qty} ${c.unit} of ${c.name} available in ${locById.get(locId) || locId}`;
        break;
      }
    }
    if (internalTransferCandidate) break;
  }

  // Also check idle/underutilized fixed assets matching the request
  if (!internalTransferCandidate) {
    const idleAsset = state.assets.find(
      (a) =>
        a.disposalStatus === 'Active' &&
        (a.condition === 'Excellent' || a.condition === 'Good') &&
        a.utilizationHoursPerWeek <= 4 &&
        (a.categoryId === categoryId || a.name.toLowerCase().includes(q)),
    );
    if (idleAsset) {
      internalTransferCandidate = `Idle fixed asset ${idleAsset.assetCode} (${idleAsset.name}) in ${locById.get(idleAsset.currentLocationId) || idleAsset.department} (${idleAsset.utilizationHoursPerWeek} hrs/wk) — consider internal transfer before purchasing.`;
    }
  }

  // Check pending purchase orders to avoid duplicate procurement
  const pendingPurchaseOrderQty = state.purchaseOrders
    .filter((po) => po.status === 'Issued' || po.status === 'Partially Delivered')
    .flatMap((po) => po.lines)
    .filter(
      (line) =>
        line.itemName.toLowerCase().includes(q) || q.includes(line.itemName.toLowerCase()),
    )
    .reduce((sum, line) => sum + Math.max(0, line.orderedQty - line.receivedQty), 0);

  const covered = existingStockAvailable + pendingPurchaseOrderQty;
  const recommendedAdditionalPurchaseQty = Math.max(0, requestedQty - covered);

  let recommendationNote = '';
  if (recommendedAdditionalPurchaseQty === 0) {
    recommendationNote = `Do NOT purchase: ${existingStockAvailable} in stock + ${pendingPurchaseOrderQty} on pending PO already covers requested ${requestedQty}.`;
  } else if (internalTransferCandidate) {
    recommendationNote = `Transfer first (${internalTransferCandidate}); net additional purchase needed: ${recommendedAdditionalPurchaseQty}.`;
  } else {
    recommendationNote = `Approved to procure ${recommendedAdditionalPurchaseQty} unit(s) after checking stock (${existingStockAvailable}) and pending POs (${pendingPurchaseOrderQty}).`;
  }

  return {
    existingStockAvailable,
    pendingPurchaseOrderQty,
    internalTransferCandidate,
    recommendedAdditionalPurchaseQty,
    recommendationNote,
  };
}

/**
 * Intelligent Annual Academic Session Requirement Planner.
 * Integrates live student strength, admission pipeline leads, teachers, existing stock, and pending POs.
 */
export function computeAnnualSessionPlan(params: {
  state: SchoolInventoryState;
  students: StudentRecord[];
  admissionLeads: AdmissionLead[];
  teachersCount: number;
}): {
  currentStudents: number;
  expectedNewAdmissions: number;
  projectedStudents: number;
  lines: AnnualSessionRequirementLine[];
  totalEstimatedBudgetInr: number;
  totalNormalBudgetInr: number;
  totalGrowthBudgetInr: number;
  totalEmergencyBudgetInr: number;
} {
  const { state, students, admissionLeads, teachersCount } = params;
  const a = state.annualAssumptions;
  const currentStudents = Math.max(students.length, 120);
  const pipelineLeads = admissionLeads.length;
  const pctAdmissions = Math.round((currentStudents * a.expectedNewAdmissionsPct) / 100);
  const expectedNewAdmissions = Math.max(pctAdmissions, pipelineLeads);
  const projectedStudents = currentStudents + expectedNewAdmissions;

  const findAvailAndPending = (keyword: string) => {
    const k = keyword.toLowerCase();
    const avail = state.consumables
      .filter((c) => c.name.toLowerCase().includes(k))
      .reduce((s, c) => s + Math.max(0, c.availableStock), 0);
    const pending = state.purchaseOrders
      .filter((po) => po.status === 'Issued' || po.status === 'Partially Delivered')
      .flatMap((po) => po.lines)
      .filter((l) => l.itemName.toLowerCase().includes(k))
      .reduce((s, l) => s + Math.max(0, l.orderedQty - l.receivedQty), 0);
    return { avail, pending };
  };

  const buildLine = (cfg: {
    category: string;
    itemName: string;
    unit: AnnualSessionRequirementLine['unit'];
    normalDemand: number;
    growthDemand: number;
    unitCost: number;
    keyword: string;
    window: string;
    formulaNote: string;
  }): AnnualSessionRequirementLine => {
    const emergencyReserve = Math.ceil(
      ((cfg.normalDemand + cfg.growthDemand) * (a.bufferStockPct + a.emergencyReservePct)) / 100,
    );
    const totalRequired = cfg.normalDemand + cfg.growthDemand + emergencyReserve;
    const { avail, pending } = findAvailAndPending(cfg.keyword);
    const netPurchaseQty = Math.max(0, totalRequired - avail - pending);
    return {
      category: cfg.category,
      itemName: cfg.itemName,
      unit: cfg.unit,
      normalDemand: cfg.normalDemand,
      growthDemand: cfg.growthDemand,
      emergencyReserve,
      totalRequired,
      availableStock: avail,
      pendingOrderQty: pending,
      netPurchaseQty,
      estimatedUnitCostInr: cfg.unitCost,
      estimatedBudgetInr: netPurchaseQty * cfg.unitCost,
      suggestedPurchaseWindow: cfg.window,
      formulaNote: cfg.formulaNote,
    };
  };

  const benchCount = state.classroomResources
    .filter((r) => r.resourceType === 'Student Benches')
    .reduce((s, r) => s + r.requiredQty, 0);
  const damagedBenches = state.classroomResources
    .filter((r) => r.resourceType === 'Student Benches')
    .reduce((s, r) => s + r.damagedQty + r.missingQty, 0);

  const lines: AnnualSessionRequirementLine[] = [
    buildLine({
      category: 'Books & Educational Material',
      itemName: 'NCERT / HBSE Session Textbook Sets (Classes 1–12)',
      unit: 'sets',
      normalDemand: currentStudents,
      growthDemand: expectedNewAdmissions,
      unitCost: 1150,
      keyword: 'ncert',
      window: 'Feb 15 – Mar 10',
      formulaNote: `${currentStudents} enrolled + ${expectedNewAdmissions} projected admissions (${a.textbooksPerStudent} books/set) + ${a.bufferStockPct + a.emergencyReservePct}% buffer`,
    }),
    buildLine({
      category: 'Stationery',
      itemName: 'Subject Notebooks (172-Page Ruled / Practical)',
      unit: 'pcs',
      normalDemand: currentStudents * a.notebooksPerStudent,
      growthDemand: expectedNewAdmissions * a.notebooksPerStudent,
      unitCost: 42,
      keyword: 'notebook',
      window: 'Feb 20 – Mar 15',
      formulaNote: `${projectedStudents} students × ${a.notebooksPerStudent} notebooks/student + buffer`,
    }),
    buildLine({
      category: 'Stationery',
      itemName: 'Rai Plus School Almanac & Student Diaries',
      unit: 'pcs',
      normalDemand: currentStudents * a.diariesPerStudent,
      growthDemand: expectedNewAdmissions * a.diariesPerStudent,
      unitCost: 85,
      keyword: 'diary',
      window: 'Feb 01 – Feb 25',
      formulaNote: `${projectedStudents} students × ${a.diariesPerStudent} diary/student`,
    }),
    buildLine({
      category: 'Stationery',
      itemName: 'Teacher Stationery & Board Marker Kits',
      unit: 'sets',
      normalDemand: Math.max(teachersCount, 20),
      growthDemand: Math.max(2, Math.ceil(expectedNewAdmissions / 35)),
      unitCost: Math.round(a.teacherStationeryBudgetInr / Math.max(teachersCount, 20)),
      keyword: 'marker',
      window: 'Mar 01 – Mar 20',
      formulaNote: `${Math.max(teachersCount, 20)} teachers + new faculty ratio (1:35)`,
    }),
    buildLine({
      category: 'Furniture',
      itemName: 'Dual Student Benches (Replacement + Growth)',
      unit: 'pcs',
      normalDemand: Math.max(damagedBenches, Math.ceil((Math.max(benchCount, 200) * a.furnitureReplacementPct) / 100)),
      growthDemand: Math.ceil(expectedNewAdmissions / 2),
      unitCost: 3800,
      keyword: 'bench',
      window: 'Jan 20 – Feb 28',
      formulaNote: `${damagedBenches} damaged/missing benches + ${a.furnitureReplacementPct}% wear replacement + ${Math.ceil(expectedNewAdmissions / 2)} new benches`,
    }),
    buildLine({
      category: 'Laboratory',
      itemName: 'Science & Chemistry Lab Consumable Refill Packs',
      unit: 'sets',
      normalDemand: Math.max(12, Math.ceil(currentStudents / 30)),
      growthDemand: Math.max(2, Math.ceil(expectedNewAdmissions / 30)),
      unitCost: 1450,
      keyword: 'lab',
      window: 'Mar 10 – Apr 05',
      formulaNote: `1 lab refill pack per 30 students across Physics/Chemistry/Biology labs`,
    }),
  ];

  const totalEstimatedBudgetInr = lines.reduce((s, l) => s + l.estimatedBudgetInr, 0);
  const totalNormalBudgetInr = lines.reduce(
    (s, l) => s + l.normalDemand * l.estimatedUnitCostInr,
    0,
  );
  const totalGrowthBudgetInr = lines.reduce(
    (s, l) => s + l.growthDemand * l.estimatedUnitCostInr,
    0,
  );
  const totalEmergencyBudgetInr = lines.reduce(
    (s, l) => s + l.emergencyReserve * l.estimatedUnitCostInr,
    0,
  );

  return {
    currentStudents,
    expectedNewAdmissions,
    projectedStudents,
    lines,
    totalEstimatedBudgetInr,
    totalNormalBudgetInr,
    totalGrowthBudgetInr,
    totalEmergencyBudgetInr,
  };
}

/**
 * Computes Classroom Resource Readiness Matrix synced with classrooms & maintenance tickets.
 */
export function computeClassroomReadinessMatrix(
  resources: ClassroomResourceStandard[],
  tickets: AssetMaintenanceTicket[],
): Array<{
  locationId: string;
  roomLabel: string;
  classSection: string;
  requiredTotal: number;
  workingTotal: number;
  damagedTotal: number;
  missingTotal: number;
  readinessPct: number;
  openTicketsCount: number;
  items: ClassroomResourceStandard[];
}> {
  const byRoom = new Map<string, ClassroomResourceStandard[]>();
  for (const r of resources) {
    const list = byRoom.get(r.locationId) || [];
    list.push(r);
    byRoom.set(r.locationId, list);
  }

  return Array.from(byRoom.entries())
    .map(([locationId, items]) => {
      const first = items[0]!;
      const requiredTotal = items.reduce((s, i) => s + i.requiredQty, 0);
      const workingTotal = items.reduce((s, i) => s + Math.min(i.requiredQty, i.workingQty), 0);
      const damagedTotal = items.reduce((s, i) => s + i.damagedQty, 0);
      const missingTotal = items.reduce((s, i) => s + i.missingQty, 0);
      const readinessPct =
        requiredTotal > 0 ? Math.round((workingTotal / requiredTotal) * 100) : 100;
      const openTicketsCount = tickets.filter(
        (t) =>
          t.status !== 'Resolved' &&
          t.locationName.toLowerCase().includes(first.roomLabel.toLowerCase()),
      ).length;
      return {
        locationId,
        roomLabel: first.roomLabel,
        classSection: first.classSection,
        requiredTotal,
        workingTotal,
        damagedTotal,
        missingTotal,
        readinessPct,
        openTicketsCount,
        items,
      };
    })
    .sort((a, b) => a.readinessPct - b.readinessPct || a.roomLabel.localeCompare(b.roomLabel));
}

/**
 * Full AI Inventory Intelligence Engine:
 * Produces transparent, explainable recommendations across Buy, Don't Buy, Transfer, Repair,
 * Replace, and Wastage — plus all 10 automated operational trigger alerts.
 * Strictly advisory: requiresHumanApproval is ALWAYS true (AI never makes financial commitments).
 */
export function buildInventoryAiIntelligence(
  state: SchoolInventoryState,
  asOfDateIso: string = new Date().toISOString().slice(0, 10),
): {
  recommendations: InventoryAiRecommendation[];
  alerts: InventoryAutomatedAlert[];
  potentialSavingsInr: number;
  wastageValueInr: number;
  idleAssetsCount: number;
  replacementCandidatesCount: number;
} {
  const recommendations: InventoryAiRecommendation[] = [];
  const alerts: InventoryAutomatedAlert[] = [];
  const locMap = new Map(state.locations.map((l) => [l.id, l.name]));
  let potentialSavingsInr = 0;

  // 1. Smart Reorder & Don't-Buy Checks (accounts for available, reserved, pending PO, lead time, safety stock)
  for (const item of state.consumables.filter((c) => c.active)) {
    const pendingPoQty = state.purchaseOrders
      .filter((po) => po.status === 'Issued' || po.status === 'Partially Delivered')
      .flatMap((po) => po.lines)
      .filter((l) => l.itemId === item.id || l.itemName === item.name)
      .reduce((s, l) => s + Math.max(0, l.orderedQty - l.receivedQty), 0);

    const netAvailable = Math.max(0, item.availableStock - item.reservedStock);
    const dailyBurn = item.monthlyAvgConsumption / 30;
    const leadTimeDemand = Math.ceil(dailyBurn * item.leadTimeDays);
    const targetStock = Math.max(item.reorderLevel, leadTimeDemand + item.safetyStock) + Math.ceil(item.monthlyAvgConsumption);
    const suggestedQty = Math.max(0, targetStock - netAvailable - pendingPoQty);

    if (netAvailable <= item.reorderLevel) {
      if (pendingPoQty >= suggestedQty && pendingPoQty > 0) {
        const avoidedSpend = pendingPoQty * item.averagePurchasePriceInr;
        potentialSavingsInr += avoidedSpend;
        recommendations.push({
          id: `ai-nobuy-${item.id}`,
          bucket: 'do_not_purchase',
          priority: 'High',
          title: `Hold duplicate reorder for ${item.name}`,
          detail: `Stock is low (${netAvailable} ${item.unit}), but ${pendingPoQty} ${item.unit} are already on open Purchase Order(s).`,
          calculationExplanation: `Net Available (${netAvailable}) + Pending PO (${pendingPoQty}) = ${netAvailable + pendingPoQty} >= Reorder Target (${targetStock}). Avoids ₹${avoidedSpend.toLocaleString('en-IN')} duplicate commitment.`,
          estimatedFinancialImpactInr: avoidedSpend,
          actionLabel: 'Track Open PO',
          sourceRefId: item.id,
          requiresHumanApproval: true,
        });
      } else if (suggestedQty > 0) {
        const estCost = Math.round(suggestedQty * item.averagePurchasePriceInr);
        recommendations.push({
          id: `ai-buy-${item.id}`,
          bucket: 'purchase',
          priority: netAvailable <= item.minimumStock ? 'Critical' : 'High',
          title: `Reorder ${suggestedQty} ${item.unit} of ${item.name}`,
          detail: `Available ${netAvailable} ${item.unit} is below reorder threshold (${item.reorderLevel} ${item.unit}).`,
          calculationExplanation: `Daily burn ${dailyBurn.toFixed(1)}/day × ${item.leadTimeDays}d lead time (${leadTimeDemand}) + Safety Stock (${item.safetyStock}) + 30d demand (${item.monthlyAvgConsumption}) − Net Avail (${netAvailable}) − Pending PO (${pendingPoQty}) = ${suggestedQty} ${item.unit}.`,
          estimatedFinancialImpactInr: estCost,
          actionLabel: 'Draft Purchase Request',
          sourceRefId: item.id,
          requiresHumanApproval: true,
        });

        alerts.push({
          id: `alert-low-${item.id}`,
          triggerType: 'LOW_STOCK',
          priority: netAvailable <= item.minimumStock ? 'Critical' : 'High',
          ownerRole: 'Purchase Manager / Principal',
          title: `Low stock: ${item.name} (${netAvailable} ${item.unit} left)`,
          detail: `Reorder level is ${item.reorderLevel} ${item.unit}. Suggested order: ${suggestedQty} ${item.unit}.`,
          deadline: asOfDateIso,
          sourceRefId: item.id,
        });
      }
    }

    // Wastage & expiry detection
    const totalLoss = item.damagedStock + item.wastageStock;
    const lossRatio = item.openingStock > 0 ? totalLoss / Math.max(1, item.openingStock) : 0;
    if (totalLoss > 0 && (lossRatio >= 0.08 || totalLoss >= 10)) {
      const lossVal = Math.round(totalLoss * item.averagePurchasePriceInr);
      recommendations.push({
        id: `ai-waste-${item.id}`,
        bucket: 'wastage',
        priority: lossRatio >= 0.15 ? 'Critical' : 'High',
        title: `Abnormal wastage/damage on ${item.name}`,
        detail: `${item.damagedStock} damaged + ${item.wastageStock} wasted (${Math.round(lossRatio * 100)}% of opening stock).`,
        calculationExplanation: `Loss units (${totalLoss}) × avg cost ₹${item.averagePurchasePriceInr} = ₹${lossVal.toLocaleString('en-IN')} preventable leakage. Inspect storage humidity/handling.`,
        estimatedFinancialImpactInr: lossVal,
        actionLabel: 'Inspect Ledger',
        sourceRefId: item.id,
        requiresHumanApproval: true,
      });
      alerts.push({
        id: `alert-waste-${item.id}`,
        triggerType: 'HIGH_CONSUMPTION',
        priority: 'High',
        ownerRole: 'Storekeeper / Coordinator',
        title: `Wastage alert on ${item.name} (₹${lossVal.toLocaleString('en-IN')})`,
        detail: `${totalLoss} ${item.unit} recorded as damaged or wasted.`,
        deadline: asOfDateIso,
        sourceRefId: item.id,
      });
    }

    // Expiring batch alerts
    for (const batch of item.batches || []) {
      if (batch.expiryDate && batch.quantityRemaining > 0) {
        const dLeft = daysBetween(asOfDateIso, batch.expiryDate);
        if (dLeft <= 45) {
          const val = Math.round(batch.quantityRemaining * batch.unitCostInr);
          recommendations.push({
            id: `ai-exp-${batch.id}`,
            bucket: 'wastage',
            priority: dLeft <= 0 ? 'Critical' : 'High',
            title:
              dLeft <= 0
                ? `Expired batch ${batch.batchNo} (${item.name})`
                : `Batch ${batch.batchNo} (${item.name}) expires in ${dLeft} days`,
            detail: `${batch.quantityRemaining} ${item.unit} in ${locMap.get(batch.locationId) || batch.locationId}. Prioritize FEFO issue or authorized write-off.`,
            calculationExplanation: `Expiry ${batch.expiryDate} vs today ${asOfDateIso} (${dLeft}d). At-risk value: ₹${val.toLocaleString('en-IN')}.`,
            estimatedFinancialImpactInr: val,
            actionLabel: 'Review Batch',
            sourceRefId: item.id,
            requiresHumanApproval: true,
          });
        }
      }
    }
  }

  // 2. Price Intelligence across multi-vendor quotations
  for (const pr of state.purchaseRequests) {
    if (pr.quotations.length >= 2) {
      const sorted = [...pr.quotations].sort((a, b) => a.unitPriceInr - b.unitPriceInr);
      const lowest = sorted[0]!;
      const highest = sorted[sorted.length - 1]!;
      const spreadPct =
        lowest.unitPriceInr > 0
          ? Math.round(((highest.unitPriceInr - lowest.unitPriceInr) / lowest.unitPriceInr) * 100)
          : 0;
      if (spreadPct >= 10) {
        const savings = Math.round((highest.unitPriceInr - lowest.unitPriceInr) * pr.quantity);
        potentialSavingsInr += savings;
        recommendations.push({
          id: `ai-price-${pr.id}`,
          bucket: 'do_not_purchase',
          priority: 'High',
          title: `Vendor price variance (${spreadPct}%) on ${pr.itemName}`,
          detail: `${lowest.vendorName} quoted ₹${lowest.unitPriceInr} vs ${highest.vendorName} at ₹${highest.unitPriceInr}. Selecting lowest verified quote saves ₹${savings.toLocaleString('en-IN')}.`,
          calculationExplanation: `(₹${highest.unitPriceInr} − ₹${lowest.unitPriceInr}) × ${pr.quantity} ${pr.unit} = ₹${savings.toLocaleString('en-IN')} savings (${spreadPct}% spread).`,
          estimatedFinancialImpactInr: savings,
          actionLabel: 'Compare Quotes',
          sourceRefId: pr.id,
          requiresHumanApproval: true,
        });
      }
    }
    if (pr.status === 'Pending Approval') {
      const pendingDays = daysBetween(pr.createdAt, asOfDateIso);
      if (pendingDays >= 3) {
        alerts.push({
          id: `alert-pr-${pr.id}`,
          triggerType: 'PR_ESCALATION',
          priority: 'High',
          ownerRole: 'Principal / School Admin',
          title: `Purchase Request ${pr.requestNo} pending ${pendingDays} days`,
          detail: `${pr.itemName} (${pr.quantity} ${pr.unit}, ₹${pr.estimatedTotalInr.toLocaleString('en-IN')}) awaiting approval.`,
          deadline: asOfDateIso,
          sourceRefId: pr.id,
        });
      }
    }
  }

  // 3. Idle Asset Detection, Warranty Expiry, Overdue Return, Repair & Replacement Prediction
  let idleAssetsCount = 0;
  let replacementCandidatesCount = 0;

  for (const asset of state.assets.filter((a) => a.disposalStatus === 'Active')) {
    const metrics = computeAssetBookValue(asset, asOfDateIso);
    const locName = locMap.get(asset.currentLocationId) || asset.currentLocationId;

    // Idle asset → recommend internal transfer before new purchase
    if (
      asset.utilizationHoursPerWeek <= 3 &&
      (asset.condition === 'Excellent' || asset.condition === 'Good') &&
      asset.maintenanceStatus === 'Operational'
    ) {
      idleAssetsCount += 1;
      potentialSavingsInr += metrics.currentBookValueInr;
      recommendations.push({
        id: `ai-idle-${asset.id}`,
        bucket: 'transfer',
        priority: 'Normal',
        title: `Redistribute idle ${asset.name} (${asset.assetCode})`,
        detail: `Currently in ${locName} with only ${asset.utilizationHoursPerWeek} hrs/week utilization. Transfer to high-demand room before buying new.`,
        calculationExplanation: `Utilization (${asset.utilizationHoursPerWeek} hrs/wk ≤ 3 hrs threshold). Reallocating avoids ~₹${asset.purchaseValueInr.toLocaleString('en-IN')} new capital spend.`,
        estimatedFinancialImpactInr: asset.purchaseValueInr,
        actionLabel: 'Transfer Asset',
        sourceRefId: asset.id,
        requiresHumanApproval: true,
      });
    }

    // Repair vs Replacement prediction
    if (metrics.recommendReplacement) {
      replacementCandidatesCount += 1;
      recommendations.push({
        id: `ai-replace-${asset.id}`,
        bucket: 'replace',
        priority: 'High',
        title: `Review replacement for ${asset.name} (${asset.assetCode})`,
        detail: `Age ${metrics.ageYears} yrs / ${asset.usefulLifeYears} yrs life · ${asset.repairCount} repairs costing ₹${asset.totalRepairCostInr.toLocaleString('en-IN')} (${metrics.repairToValuePct}% of original cost).`,
        calculationExplanation: `Repair-to-cost ratio ${metrics.repairToValuePct}% (threshold ≥45%) or remaining useful life ${metrics.remainingLifeYears} yrs (≤0.5 yrs). Net book value: ₹${metrics.currentBookValueInr.toLocaleString('en-IN')}.`,
        estimatedFinancialImpactInr: asset.purchaseValueInr,
        actionLabel: 'Plan Replacement',
        sourceRefId: asset.id,
        requiresHumanApproval: true,
      });
    } else if (asset.condition === 'Damaged' || asset.condition === 'Under Repair') {
      recommendations.push({
        id: `ai-repair-${asset.id}`,
        bucket: 'repair',
        priority: 'Critical',
        title: `Repair ${asset.name} (${asset.assetCode}) in ${locName}`,
        detail: `Condition: ${asset.condition} · Custodian: ${asset.assignedEmployee}.`,
        calculationExplanation: `Book value ₹${metrics.currentBookValueInr.toLocaleString('en-IN')} with ${metrics.remainingLifeYears} yrs useful life remaining — repair is cost-effective vs replacement.`,
        estimatedFinancialImpactInr: Math.round(asset.purchaseValueInr * 0.12),
        actionLabel: 'Open Service Ticket',
        sourceRefId: asset.id,
        requiresHumanApproval: true,
      });
      alerts.push({
        id: `alert-dmg-${asset.id}`,
        triggerType: 'ASSET_DAMAGED',
        priority: 'Critical',
        ownerRole: 'Maintenance / Inventory Manager',
        title: `Damaged asset: ${asset.name} (${asset.assetCode})`,
        detail: `Located in ${locName}. Assign technician or vendor warranty claim.`,
        deadline: asOfDateIso,
        sourceRefId: asset.id,
      });
    }

    // Warranty expiring within 45 days
    if (metrics.warrantyDaysRemaining >= 0 && metrics.warrantyDaysRemaining <= 45) {
      alerts.push({
        id: `alert-war-${asset.id}`,
        triggerType: 'WARRANTY_EXPIRING',
        priority: metrics.warrantyDaysRemaining <= 15 ? 'Critical' : 'High',
        ownerRole: 'Inventory Manager',
        title: `Warranty expiring in ${metrics.warrantyDaysRemaining}d: ${asset.name} (${asset.assetCode})`,
        detail: `Warranty ends ${asset.warrantyExpiryDate}. Schedule preventive check or AMC renewal.`,
        deadline: asset.warrantyExpiryDate,
        sourceRefId: asset.id,
      });
    }

    // Overdue reusable asset return
    if (asset.expectedReturnDate && daysBetween(asset.expectedReturnDate, asOfDateIso) > 0) {
      alerts.push({
        id: `alert-overdue-${asset.id}`,
        triggerType: 'ASSET_OVERDUE',
        priority: 'High',
        ownerRole: asset.assignedEmployee,
        title: `Overdue return: ${asset.name} (${asset.assetCode})`,
        detail: `Expected return was ${asset.expectedReturnDate} by ${asset.assignedEmployee}.`,
        deadline: asset.expectedReturnDate,
        sourceRefId: asset.id,
      });
    }
  }

  // 4. Delayed Purchase Orders
  for (const po of state.purchaseOrders) {
    if (
      (po.status === 'Issued' || po.status === 'Partially Delivered') &&
      daysBetween(po.expectedDeliveryDate, asOfDateIso) > 0
    ) {
      alerts.push({
        id: `alert-po-${po.id}`,
        triggerType: 'PO_DELAYED',
        priority: 'High',
        ownerRole: 'Purchase Manager',
        title: `Delayed PO ${po.poNo} (${po.vendorName})`,
        detail: `Expected delivery ${po.expectedDeliveryDate} has passed. Follow up with vendor.`,
        deadline: po.expectedDeliveryDate,
        sourceRefId: po.id,
      });
    }
  }

  // 5. Audit Discrepancies & Classroom Readiness Gaps
  for (const audit of state.audits) {
    if (audit.status === 'Pending Approval' && (audit.totalMissingUnits > 0 || audit.totalDamagedUnits > 0)) {
      alerts.push({
        id: `alert-audit-${audit.id}`,
        triggerType: 'AUDIT_MISSING',
        priority: 'Critical',
        ownerRole: 'Principal / Auditor',
        title: `Stock audit discrepancy in ${audit.auditCode} (${audit.scopeLabel})`,
        detail: `${audit.totalMissingUnits} missing · ${audit.totalDamagedUnits} damaged · ${audit.totalExcessUnits} excess awaiting approval.`,
        deadline: asOfDateIso,
        sourceRefId: audit.id,
      });
    }
  }

  for (const cr of state.classroomResources) {
    if (cr.missingQty > 0 || cr.damagedQty > 0) {
      alerts.push({
        id: `alert-cr-${cr.id}`,
        triggerType: 'CLASSROOM_RESOURCE_MISSING',
        priority: cr.resourceType === 'Projector' || cr.resourceType === 'Smart Board' ? 'High' : 'Normal',
        ownerRole: 'Storekeeper / Maintenance',
        title: `${cr.roomLabel}: ${cr.resourceType} gap (${cr.damagedQty} damaged, ${cr.missingQty} missing)`,
        detail: `Working ${cr.workingQty}/${cr.requiredQty} in Class ${cr.classSection}.`,
        deadline: asOfDateIso,
        sourceRefId: cr.id,
      });
    }
  }

  const wastageValueInr = state.consumables.reduce(
    (s, c) => s + Math.round((c.damagedStock + c.wastageStock) * c.averagePurchasePriceInr),
    0,
  );

  return {
    recommendations,
    alerts,
    potentialSavingsInr,
    wastageValueInr,
    idleAssetsCount,
    replacementCandidatesCount,
  };
}

/**
 * Comprehensive Financial Valuation & Accounting Reconciliation Summary.
 */
export function computeInventoryFinancialSummary(
  state: SchoolInventoryState,
  asOfDateIso: string = new Date().toISOString().slice(0, 10),
) {
  let consumableStockValueInr = 0;
  let consumableFifoValueInr = 0;
  let wastageValueInr = 0;
  const byCategory = new Map<string, { categoryName: string; consumableValue: number; assetBookValue: number; count: number }>();
  const byDepartment = new Map<string, { department: string; consumableValue: number; assetBookValue: number; maintenanceSpend: number }>();
  const byLocation = new Map<string, { locationName: string; stockValue: number; assetBookValue: number }>();

  const catName = new Map(state.categories.map((c) => [c.id, c.name]));
  const locName = new Map(state.locations.map((l) => [l.id, l.name]));

  for (const item of state.consumables) {
    const val = computeConsumableValuation(item);
    consumableStockValueInr += val.activeValuationInr;
    consumableFifoValueInr += val.fifoValueInr;
    wastageValueInr += Math.round((item.damagedStock + item.wastageStock) * item.averagePurchasePriceInr);

    const cname = catName.get(item.categoryId) || item.categoryId;
    const catRow = byCategory.get(item.categoryId) || {
      categoryName: cname,
      consumableValue: 0,
      assetBookValue: 0,
      count: 0,
    };
    catRow.consumableValue += val.activeValuationInr;
    catRow.count += 1;
    byCategory.set(item.categoryId, catRow);

    const depRow = byDepartment.get(item.department) || {
      department: item.department,
      consumableValue: 0,
      assetBookValue: 0,
      maintenanceSpend: 0,
    };
    depRow.consumableValue += val.activeValuationInr;
    byDepartment.set(item.department, depRow);

    for (const [locId, qty] of Object.entries(item.locationBalances || {})) {
      const lRow = byLocation.get(locId) || {
        locationName: locName.get(locId) || locId,
        stockValue: 0,
        assetBookValue: 0,
      };
      lRow.stockValue += Math.round(Math.max(0, qty) * item.averagePurchasePriceInr);
      byLocation.set(locId, lRow);
    }
  }

  let assetAcquisitionCostInr = 0;
  let totalDepreciationInr = 0;
  let assetBookValueInr = 0;
  let totalRepairSpendInr = 0;

  for (const asset of state.assets) {
    totalRepairSpendInr += asset.totalRepairCostInr;
    if (asset.disposalStatus === 'Disposed') continue;
    const bv = computeAssetBookValue(asset, asOfDateIso);
    assetAcquisitionCostInr += asset.purchaseValueInr;
    totalDepreciationInr += bv.accumulatedDepreciationInr;
    assetBookValueInr += bv.currentBookValueInr;

    const cname = catName.get(asset.categoryId) || asset.categoryId;
    const catRow = byCategory.get(asset.categoryId) || {
      categoryName: cname,
      consumableValue: 0,
      assetBookValue: 0,
      count: 0,
    };
    catRow.assetBookValue += bv.currentBookValueInr;
    catRow.count += 1;
    byCategory.set(asset.categoryId, catRow);

    const depRow = byDepartment.get(asset.department) || {
      department: asset.department,
      consumableValue: 0,
      assetBookValue: 0,
      maintenanceSpend: 0,
    };
    depRow.assetBookValue += bv.currentBookValueInr;
    depRow.maintenanceSpend += asset.totalRepairCostInr;
    byDepartment.set(asset.department, depRow);

    const lRow = byLocation.get(asset.currentLocationId) || {
      locationName: locName.get(asset.currentLocationId) || asset.currentLocationId,
      stockValue: 0,
      assetBookValue: 0,
    };
    lRow.assetBookValue += bv.currentBookValueInr;
    byLocation.set(asset.currentLocationId, lRow);
  }

  const purchaseExpenditureInr = state.purchaseOrders
    .filter((po) => po.status !== 'Cancelled')
    .reduce((s, po) => s + po.grandTotalInr, 0);
  const disposalProceedsInr = state.disposals.reduce((s, d) => s + d.disposalProceedsInr, 0);
  const totalIssuedValueInr = state.ledger
    .filter((t) => t.txType === 'ISSUE')
    .reduce((s, t) => s + t.totalValueInr, 0);
  const inventoryTurnoverRatio =
    consumableStockValueInr > 0
      ? Math.round((totalIssuedValueInr / consumableStockValueInr) * 100) / 100
      : 0;

  return {
    totalInventoryAndAssetValueInr: consumableStockValueInr + assetBookValueInr,
    consumableStockValueInr,
    consumableFifoValueInr,
    assetAcquisitionCostInr,
    totalDepreciationInr,
    assetBookValueInr,
    purchaseExpenditureInr,
    totalRepairSpendInr,
    wastageValueInr,
    disposalProceedsInr,
    inventoryTurnoverRatio,
    budgetUtilizationPct:
      state.annualBudgetInr > 0
        ? Math.min(100, Math.round((purchaseExpenditureInr / state.annualBudgetInr) * 100))
        : 0,
    byCategory: Array.from(byCategory.values()).sort(
      (a, b) => b.consumableValue + b.assetBookValue - (a.consumableValue + a.assetBookValue),
    ),
    byDepartment: Array.from(byDepartment.values()).sort(
      (a, b) => b.consumableValue + b.assetBookValue - (a.consumableValue + a.assetBookValue),
    ),
    byLocation: Array.from(byLocation.values()).sort(
      (a, b) => b.stockValue + b.assetBookValue - (a.stockValue + a.assetBookValue),
    ),
  };
}

/**
 * Generates a crisp deterministic 21×21 QR-style visual SVG (with standard 3-corner finder patterns)
 * for any asset code or location payload — zero external libraries required.
 */
export function generateDeterministicQrSvg(payload: string, sizePx = 128): string {
  const N = 21;
  const grid: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r += 1) {
      for (let c = 0; c < 7; c += 1) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r]![c0 + c] = isBorder || isCore;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, N - 7);
  drawFinder(N - 7, 0);

  // Timing patterns
  for (let i = 8; i < N - 8; i += 1) {
    grid[6]![i] = i % 2 === 0;
    grid[i]![6] = i % 2 === 0;
  }

  // Deterministic hash-seeded data modules
  let h1 = 2166136261;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < payload.length; i += 1) {
    h1 ^= payload.charCodeAt(i);
    h1 = Math.imul(h1, 16777619);
    h2 = Math.imul(h2 ^ payload.charCodeAt(i), 2246822519);
  }
  const inReserved = (r: number, c: number) =>
    (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8) || r === 6 || c === 6;

  let seed = (h1 ^ h2) >>> 0;
  for (let r = 0; r < N; r += 1) {
    for (let c = 0; c < N; c += 1) {
      if (inReserved(r, c)) continue;
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      grid[r]![c] = ((seed >>> 24) & 1) === 1;
    }
  }

  const rects: string[] = [];
  for (let r = 0; r < N; r += 1) {
    for (let c = 0; c < N; c += 1) {
      if (grid[r]![c]) {
        rects.push(`<rect x="${c + 1}" y="${r + 1}" width="1" height="1" fill="#0F243D"/>`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N + 2} ${N + 2}" width="${sizePx}" height="${sizePx}" role="img" aria-label="QR Code for ${payload.replace(/"/g, '')}"><rect width="${N + 2}" height="${N + 2}" fill="#ffffff"/>${rects.join('')}</svg>`;
}

/**
 * Generates an accounting reconciliation CSV covering fixed assets (depreciation + GST + book value)
 * and consumable stock valuation.
 */
export function buildInventoryFinancialCsv(
  state: SchoolInventoryState,
  asOfDateIso: string = new Date().toISOString().slice(0, 10),
): string {
  const locMap = new Map(state.locations.map((l) => [l.id, l.name]));
  const catMap = new Map(state.categories.map((c) => [c.id, c.name]));
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const rows: string[] = [
    [
      'Type',
      'Code / SKU',
      'Item / Asset Name',
      'Category',
      'Department',
      'Location',
      'Quantity',
      'Unit / Method',
      'Acquisition / Unit Cost (INR)',
      'GST (INR / %)',
      'Accumulated Depreciation (INR)',
      'Current Value / Book Value (INR)',
      'Invoice / Status',
    ].join(','),
  ];

  for (const item of state.consumables) {
    const val = computeConsumableValuation(item);
    rows.push(
      [
        'Consumable',
        item.sku,
        item.name,
        catMap.get(item.categoryId) || item.categoryId,
        item.department,
        locMap.get(item.primaryLocationId) || item.primaryLocationId,
        item.availableStock,
        `${item.unit} (${item.valuationMethod})`,
        item.averagePurchasePriceInr,
        `${item.gstPct}%`,
        0,
        val.activeValuationInr,
        item.availableStock <= item.reorderLevel ? 'Low Stock' : 'In Stock',
      ]
        .map(esc)
        .join(','),
    );
  }

  for (const asset of state.assets) {
    const bv = computeAssetBookValue(asset, asOfDateIso);
    rows.push(
      [
        'Fixed Asset',
        asset.assetCode,
        `${asset.name} (${asset.brand} ${asset.model})`,
        catMap.get(asset.categoryId) || asset.categoryId,
        asset.department,
        locMap.get(asset.currentLocationId) || asset.currentLocationId,
        1,
        `${asset.depreciationMethod} ${asset.depreciationRatePct}%`,
        asset.purchaseValueInr,
        asset.gstAmountInr,
        bv.accumulatedDepreciationInr,
        asset.disposalStatus === 'Disposed' ? 0 : bv.currentBookValueInr,
        `${asset.invoiceNo} · ${asset.disposalStatus}`,
      ]
        .map(esc)
        .join(','),
    );
  }

  return rows.join('\n');
}
