import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialDatabase } from '../../server/seedData.ts';
import {
  canAccessInventory,
  canApproveProcurementOrDisposal,
  canManageStockMovements,
  ensureInventoryInitialized,
} from '../../server/inventoryRoutes.ts';
import {
  buildInventoryAiIntelligence,
  buildInventoryFinancialCsv,
  checkProcurementInternalAvailability,
  computeAnnualSessionPlan,
  computeAssetBookValue,
  computeClassroomReadinessMatrix,
  computeConsumableValuation,
  computeInventoryFinancialSummary,
  generateDeterministicQrSvg,
  reconcileConsumableFromLedger,
  validateStockLedgerTransaction,
} from './inventoryIntelligenceEngine.ts';

test('1–3. Multi-tenant isolation, 12 hierarchical categories (A–L), locations, consumables, and fixed assets', () => {
  const db = createInitialDatabase();
  const invA = ensureInventoryInitialized(db, 'school-vis-jjr');
  const invB = ensureInventoryInitialized(db, 'school-svm-kk');

  assert.equal(invA.categories.length, 12, 'Must seed all 12 hierarchical categories A–L');
  assert.ok(invA.locations.length >= 11, 'Must seed multi-location stores + synced classrooms');
  assert.ok(invA.consumables.length >= 12);
  assert.ok(invA.assets.length >= 8);

  // Strict multi-tenant isolation: mutating School A never leaks into School B
  invA.categories[0]!.name = 'Custom Books School A';
  assert.notEqual(invB.categories[0]!.name, 'Custom Books School A');
  assert.equal(invA.assets[0]!.schoolId, 'school-vis-jjr');
  assert.equal(invB.assets[0]!.schoolId, 'school-svm-kk');
});

test('4–9, 22–24. Immutable stock ledger reconciliation, negative stock block, duplicate receipt/return prevention', () => {
  const db = createInitialDatabase();
  const state = ensureInventoryInitialized(db, 'school-vis-jjr');
  const item = state.consumables[0]!;
  const initialAvail = reconcileConsumableFromLedger(item, state.ledger).availableStock;

  // Negative stock strictly blocked without authorized override
  const overIssue = validateStockLedgerTransaction({
    state,
    itemId: item.id,
    txType: 'ISSUE',
    quantity: initialAvail + 50,
    locationId: item.primaryLocationId,
  });
  assert.equal(overIssue.ok, false);
  assert.ok(overIssue.error?.includes('Negative stock is blocked'));

  // Authorized exception allows explicit negative override
  const authorizedOverride = validateStockLedgerTransaction({
    state,
    itemId: item.id,
    txType: 'ISSUE',
    quantity: initialAvail + 5,
    locationId: item.primaryLocationId,
    negativeOverrideAuthorizedBy: 'Dr. Deepak Dhawan',
  });
  assert.equal(authorizedOverride.ok, true);

  // Duplicate transaction prevention via idempotencyKey
  const dupKey = state.ledger[0]!.idempotencyKey!;
  const dupCheck = validateStockLedgerTransaction({
    state,
    itemId: item.id,
    txType: 'PURCHASE_RECEIPT',
    quantity: 10,
    locationId: item.primaryLocationId,
    idempotencyKey: dupKey,
  });
  assert.equal(dupCheck.ok, false);
  assert.equal(dupCheck.duplicate, true);
});

test('10–13, 17–18. QR generation, SLM/WDV depreciation, FIFO/Weighted-Avg valuation & accounting CSV export', () => {
  const db = createInitialDatabase();
  const state = ensureInventoryInitialized(db, 'school-vis-jjr');

  // Deterministic scannable QR SVG
  const asset = state.assets[0]!;
  const svgA = generateDeterministicQrSvg(asset.qrPayload, 128);
  const svgB = generateDeterministicQrSvg(asset.qrPayload, 128);
  assert.equal(svgA, svgB);
  assert.ok(svgA.startsWith('<svg') && svgA.includes(asset.assetCode));

  // SLM & WDV depreciation + replacement trigger on high-repair aging printer (ast-4)
  const slmVal = computeAssetBookValue(state.assets[0]!, '2026-11-28');
  assert.ok(slmVal.currentBookValueInr < state.assets[0]!.purchaseValueInr);
  assert.equal(
    slmVal.currentBookValueInr + slmVal.accumulatedDepreciationInr,
    state.assets[0]!.purchaseValueInr,
  );

  const agingPrinter = state.assets.find((a) => a.assetCode === 'AST-IT-004')!;
  const wdvVal = computeAssetBookValue(agingPrinter, '2026-11-28');
  assert.equal(wdvVal.recommendReplacement, true, 'Aging printer with >45% repair cost must trigger replacement review');

  // Consumable FIFO & Weighted Avg + Financial Summary + CSV export
  const val = computeConsumableValuation(state.consumables[0]!);
  assert.ok(val.weightedAverageValueInr > 0 && val.fifoValueInr > 0);

  const fin = computeInventoryFinancialSummary(state, '2026-11-28');
  assert.ok(fin.totalInventoryAndAssetValueInr > 0);
  assert.ok(fin.byCategory.length >= 6);
  assert.ok(fin.byDepartment.length >= 4);

  const csv = buildInventoryFinancialCsv(state, '2026-11-28');
  assert.ok(csv.includes('AST-IT-001') && csv.includes('Accumulated Depreciation'));
});

test('16, 19–21. Pre-procurement internal transfer check, AI recommendations (human approval mandatory), Annual Session Planner, Classroom Readiness & RBAC', () => {
  const db = createInitialDatabase();
  const state = ensureInventoryInitialized(db, 'school-vis-jjr');

  // Mandatory pre-procurement check suggests transferring idle projector AST-IT-003 before buying new!
  const precheck = checkProcurementInternalAvailability({
    state,
    itemName: 'Projector',
    categoryId: `${state.schoolId}-cat-e`,
    requestedQty: 1,
  });
  assert.ok(
    precheck.internalTransferCandidate?.includes('AST-IT-003'),
    'Must recommend idle projector AST-IT-003 transfer before new procurement',
  );

  // AI Intelligence Engine generates recommendations across buckets & NEVER auto-approves
  const ai = buildInventoryAiIntelligence(state, '2026-11-28');
  assert.ok(ai.recommendations.length >= 5);
  assert.ok(ai.recommendations.every((r) => r.requiresHumanApproval === true));
  assert.ok(ai.recommendations.every((r) => r.calculationExplanation.length > 10));
  assert.ok(ai.alerts.some((a) => a.triggerType === 'LOW_STOCK'));
  assert.ok(ai.alerts.some((a) => a.triggerType === 'WARRANTY_EXPIRING'));
  assert.ok(ai.alerts.some((a) => a.triggerType === 'ASSET_OVERDUE'));
  assert.ok(ai.alerts.some((a) => a.triggerType === 'AUDIT_MISSING'));

  // Annual Academic Session Requirement Planner integrates enrolled students + admission leads
  const plan = computeAnnualSessionPlan({
    state,
    students: db.students.filter((s) => s.schoolId === state.schoolId),
    admissionLeads: db.admissionLeads.filter((l) => l.schoolId === state.schoolId),
    teachersCount: 35,
  });
  assert.ok(plan.projectedStudents > plan.currentStudents);
  assert.equal(plan.lines.length, 6);
  assert.ok(plan.totalEstimatedBudgetInr > 0);

  // Classroom Readiness Matrix detects damaged projector & benches
  const readiness = computeClassroomReadinessMatrix(
    state.classroomResources,
    state.maintenanceTickets,
  );
  assert.ok(readiness.length >= 6);
  assert.ok(readiness.some((r) => r.damagedTotal > 0 || r.missingTotal > 0));

  // Strict RBAC boundaries
  assert.equal(canAccessInventory('principal'), true);
  assert.equal(canAccessInventory('teacher'), true);
  assert.equal(canAccessInventory('accountant'), true);
  assert.equal(canAccessInventory('student'), false, 'Students must be blocked from Inventory');
  assert.equal(canAccessInventory('parent'), false, 'Parents must be blocked from Inventory');
  assert.equal(canApproveProcurementOrDisposal('principal'), true);
  assert.equal(canApproveProcurementOrDisposal('teacher'), false, 'Teachers must never approve purchases/disposals');
  assert.equal(canManageStockMovements('teacher'), false, 'Teachers submit requests, not direct ledger mutations');
});
