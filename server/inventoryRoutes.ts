import type { Express, NextFunction, Request, Response } from 'express';
import type { UserAccount, UserRole } from '../src/types';
import type {
  AssetDisposalRecord,
  AssetMaintenanceTicket,
  BookDistributionRecord,
  ClassroomResourceStandard,
  ConsumableItem,
  FixedAsset,
  GoodsReceiptNote,
  InventoryCategory,
  InventoryLocation,
  InventoryResourceRequest,
  InventoryVendor,
  PurchaseOrder,
  PurchaseRequest,
  SchoolInventoryState,
  StockAuditSession,
  StockLedgerTransaction,
  StockTransactionType,
} from '../src/types/inventory';
import type { DatabaseState } from './seedData.ts';
import { getDb, saveDb } from './store.ts';
import {
  buildInventoryAiIntelligence,
  checkProcurementInternalAvailability,
  computeAnnualSessionPlan,
  computeAssetBookValue,
  computeClassroomReadinessMatrix,
  computeInventoryFinancialSummary,
  reconcileAllConsumables,
  reconcileConsumableFromLedger,
  validateStockLedgerTransaction,
} from '../src/utils/inventoryIntelligenceEngine.ts';

interface AuthedRequest extends Request {
  user?: UserAccount;
  activeSchoolId?: string | null;
}

interface RouteDeps {
  requireAuth: (req: AuthedRequest, res: Response, next: NextFunction) => void;
  requireRoles: (
    roles: UserRole[],
  ) => (req: AuthedRequest, res: Response, next: NextFunction) => void;
  appendAuditLog: (params: {
    schoolId: string | null;
    actor: UserAccount;
    action: string;
    entityType: string;
    entityId: string;
    detail: string;
  }) => void;
}

const LEADERSHIP_ROLES: UserRole[] = ['super_admin', 'school_admin', 'principal', 'coordinator'];
const INVENTORY_STAFF_ROLES: UserRole[] = [
  ...LEADERSHIP_ROLES,
  'accountant',
  'teacher',
  'transport_incharge',
];

export function canAccessInventory(role: UserRole): boolean {
  return INVENTORY_STAFF_ROLES.includes(role);
}

export function canApproveProcurementOrDisposal(role: UserRole): boolean {
  return LEADERSHIP_ROLES.includes(role);
}

export function canManageStockMovements(role: UserRole): boolean {
  return [...LEADERSHIP_ROLES, 'accountant', 'transport_incharge'].includes(role);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(baseIso: string, deltaDays: number): string {
  const d = new Date(baseIso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

function createInitialCategories(schoolId: string, nowIso: string): InventoryCategory[] {
  const defs: Array<[string, string, InventoryCategory['kind'], string[]]> = [
    ['CAT-A', 'Books & Educational Material', 'consumable', ['NCERT Books', 'SCERT Books', 'Reference Books', 'Workbooks', 'Activity Books', 'Library Books', 'Teaching Aids', 'Maps & Charts', 'Educational Models']],
    ['CAT-B', 'Stationery', 'consumable', ['Notebooks', 'Diaries', 'Registers', 'Pens & Pencils', 'Paper', 'Printing Materials', 'Files & Folders', 'Art & Craft', 'Examination Stationery']],
    ['CAT-C', 'Gifts & Awards', 'consumable', ['Student Gifts', 'Teacher Gifts', 'Trophies', 'Medals', 'Certificates', 'Event Souvenirs', 'Welcome Kits', 'Appreciation Gifts']],
    ['CAT-D', 'Furniture', 'fixed_asset', ['Student Benches', 'Desks', 'Chairs', 'Tables', 'Cupboards', 'Shelves', 'Office Furniture', 'Library Furniture', 'Laboratory Furniture']],
    ['CAT-E', 'IT Equipment', 'fixed_asset', ['Desktop Computers', 'Laptops', 'Tablets', 'Printers', 'Scanners', 'Projectors', 'Interactive Panels', 'Smart Boards', 'VR Equipment', 'Networking Devices', 'CCTV Cameras', 'UPS & Batteries']],
    ['CAT-F', 'Laboratory', 'both', ['Science Equipment', 'Laboratory Apparatus', 'Models', 'Measuring Instruments', 'Consumable Lab Materials', 'Approved Chemicals']],
    ['CAT-G', 'Sports', 'both', ['Sports Kits', 'Footballs', 'Cricket Equipment', 'Badminton Equipment', 'Athletics Equipment', 'Gym Equipment', 'Sports Uniforms']],
    ['CAT-H', 'Gardening', 'consumable', ['Flower Pots', 'Plants', 'Soil', 'Fertilizers', 'Gardening Tools', 'Watering Equipment']],
    ['CAT-I', 'Housekeeping', 'consumable', ['Cleaning Materials', 'Dustbins', 'Mops', 'Cleaning Machines', 'Hygiene Supplies', 'Washroom Supplies']],
    ['CAT-J', 'Electrical & Infrastructure', 'both', ['Fans', 'Lights', 'Switches', 'Wires', 'Electrical Fittings', 'Plumbing Materials', 'Hardware', 'Fixtures']],
    ['CAT-K', 'Safety', 'both', ['Fire Extinguishers', 'First-Aid Kits', 'Safety Equipment', 'Emergency Signage', 'Protective Equipment']],
    ['CAT-L', 'Transport', 'both', ['Vehicle Accessories', 'Spare Parts', 'Tyres', 'Batteries', 'Vehicle Tools', 'Maintenance Consumables']],
  ];
  return defs.map(([code, name, kind, subcategories]) => ({
    id: `${schoolId}-${code.toLowerCase()}`,
    schoolId,
    code,
    name,
    parentId: null,
    kind,
    subcategories,
    active: true,
    mergedIntoCategoryId: null,
    createdAt: nowIso,
  }));
}

function createInitialLocations(db: DatabaseState, schoolId: string): InventoryLocation[] {
  const core: Array<[string, string, InventoryLocation['type'], string, string, string, string]> = [
    ['LOC-MAIN', 'Main Central Store', 'Main Store', 'Admin Block', 'Ground', 'Operations', 'Ramesh Storekeeper'],
    ['LOC-STAT', 'Stationery & Exam Store', 'Stationery Store', 'Admin Block', 'Ground', 'Administration', 'Ramesh Storekeeper'],
    ['LOC-BOOK', 'Book & Notebook Store', 'Book Store', 'Academic Block', 'Ground', 'Academics', 'Kavita Sharma'],
    ['LOC-LIB', 'Central Library', 'Library', 'Academic Block', '1st Floor', 'Library', 'Sunita Librarian'],
    ['LOC-CLAB', 'Computer Lab 1', 'Computer Lab', 'STEM Wing', '1st Floor', 'IT & Computer Science', 'Anand Verma'],
    ['LOC-SLAB', 'Composite Science Lab', 'Science Lab', 'STEM Wing', '2nd Floor', 'Science', 'Neha Science HOD'],
    ['LOC-SPRT', 'Sports Equipment Room', 'Sports Room', 'Sports Block', 'Ground', 'Physical Education', 'Vikram Sports Coach'],
    ['LOC-PRIN', 'Principal Office', 'Principal Office', 'Admin Block', '1st Floor', 'Leadership', 'Principal Office'],
    ['LOC-ADMN', 'Administration & Accounts', 'Administration Office', 'Admin Block', 'Ground', 'Administration', 'Accounts Desk'],
    ['LOC-TRNS', 'Transport & Fleet Yard', 'Transport Department', 'Gate 2 Yard', 'Ground', 'Transport', 'Transport Incharge'],
    ['LOC-MNT', 'Maintenance & Electrical Room', 'Maintenance Room', 'Service Wing', 'Ground', 'Infrastructure', 'Maintenance Supervisor'],
  ];

  const locs: InventoryLocation[] = core.map(([code, name, type, building, floor, department, inchargeName]) => ({
    id: `${schoolId}-${code.toLowerCase()}`,
    schoolId,
    code,
    name,
    type,
    building,
    floor,
    department,
    inchargeName,
    linkedClassroomId: null,
    active: true,
  }));

  // Sync classrooms directly from Rai Plus schoolClassrooms or timetable classes
  const rooms = (db.schoolClassrooms || []).filter((r) => r.schoolId === schoolId).slice(0, 8);
  if (rooms.length > 0) {
    rooms.forEach((rm, idx) => {
      locs.push({
        id: `${schoolId}-room-${idx + 1}`,
        schoolId,
        code: rm.roomNumber || `RM-${101 + idx}`,
        name: rm.name || `Classroom ${rm.roomNumber}`,
        type: 'Classroom',
        building: rm.building || 'Academic Block',
        floor: rm.floor || '1st Floor',
        roomNo: rm.roomNumber,
        department: 'Academics',
        inchargeName: 'Academic Coordinator',
        linkedClassroomId: rm.id,
        active: true,
      });
    });
  } else {
    ['6-A', '7-A', '8-A', '9-A', '10-A', '12-Sci'].forEach((cls, idx) => {
      locs.push({
        id: `${schoolId}-room-${idx + 1}`,
        schoolId,
        code: `RM-${101 + idx}`,
        name: `Room ${101 + idx} (Class ${cls})`,
        type: 'Classroom',
        building: 'Academic Block',
        floor: idx < 3 ? '1st Floor' : '2nd Floor',
        roomNo: String(101 + idx),
        department: 'Academics',
        inchargeName: `Class Teacher ${cls}`,
        linkedClassroomId: null,
        active: true,
      });
    });
  }

  return locs;
}

export function ensureInventoryInitialized(
  db: DatabaseState,
  schoolId: string,
): SchoolInventoryState {
  if (!db.inventoryBySchool || typeof db.inventoryBySchool !== 'object') {
    db.inventoryBySchool = {};
  }
  if (db.inventoryBySchool[schoolId]) {
    return db.inventoryBySchool[schoolId]!;
  }

  const nowIso = todayIso();
  const categories = createInitialCategories(schoolId, nowIso);
  const locations = createInitialLocations(db, schoolId);
  const catId = (suffix: string) => `${schoolId}-cat-${suffix}`;
  const locId = (suffix: string) => `${schoolId}-loc-${suffix}`;
  const roomLoc = (idx: number) => locations.find((l) => l.type === 'Classroom' && l.id.endsWith(`-room-${idx}`)) || locations[0]!;

  const vendors: InventoryVendor[] = [
    {
      id: `${schoolId}-vnd-1`,
      schoolId,
      name: 'Haryana Academic Books & Printers Pvt Ltd',
      gstin: '06AABCH4412K1Z5',
      contactPerson: 'Suresh Gupta',
      phone: '+91-98120-44510',
      email: 'orders@haryanaacademic.in',
      categoriesSupplied: [catId('a'), catId('b')],
      avgLeadTimeDays: 5,
      onTimeDeliveryPct: 96,
      qualityScorePct: 95,
      rating: 4.8,
      totalOrdersCount: 18,
      active: true,
    },
    {
      id: `${schoolId}-vnd-2`,
      schoolId,
      name: 'Shree Balaji Campus Stationery & Gifts',
      gstin: '06AADCS8891M1Z2',
      contactPerson: 'Manoj Mittal',
      phone: '+91-98131-22019',
      email: 'sales@balajistationery.in',
      categoriesSupplied: [catId('b'), catId('c'), catId('i')],
      avgLeadTimeDays: 4,
      onTimeDeliveryPct: 91,
      qualityScorePct: 92,
      rating: 4.5,
      totalOrdersCount: 24,
      active: true,
    },
    {
      id: `${schoolId}-vnd-3`,
      schoolId,
      name: 'EduTech SmartClass & IT Systems',
      gstin: '06AAECE9012R1Z8',
      contactPerson: 'Pradeep Nair',
      phone: '+91-99104-77821',
      email: 'campus@edutechsystems.in',
      categoriesSupplied: [catId('e'), catId('d'), catId('k')],
      avgLeadTimeDays: 9,
      onTimeDeliveryPct: 88,
      qualityScorePct: 94,
      rating: 4.6,
      totalOrdersCount: 11,
      active: true,
    },
    {
      id: `${schoolId}-vnd-4`,
      schoolId,
      name: 'Precision Lab & Sports India',
      gstin: '06AABCP3319D1Z1',
      contactPerson: 'Ritu Chaudhary',
      phone: '+91-98118-65420',
      email: 'supply@precisionlabsports.in',
      categoriesSupplied: [catId('f'), catId('g'), catId('h'), catId('l')],
      avgLeadTimeDays: 7,
      onTimeDeliveryPct: 93,
      qualityScorePct: 96,
      rating: 4.7,
      totalOrdersCount: 9,
      active: true,
    },
  ];

  // Seed Consumable Items + Immutable Ledger Transactions (source of truth!)
  const seedConsumables: Array<{
    id: string;
    sku: string;
    name: string;
    categoryId: string;
    subcategory: string;
    unit: ConsumableItem['unit'];
    opening: number;
    issued: number;
    damaged: number;
    wastage: number;
    min: number;
    reorder: number;
    safety: number;
    lead: number;
    price: number;
    gst: number;
    loc: string;
    dept: string;
    burn: number;
    perishable?: boolean;
    expiryDays?: number;
    valMethod?: ConsumableItem['valuationMethod'];
  }> = [
    { id: 'c1', sku: 'BK-NCERT-SET', name: 'NCERT / HBSE Class 6–10 Textbook Sets', categoryId: catId('a'), subcategory: 'NCERT Books', unit: 'sets', opening: 140, issued: 95, damaged: 3, wastage: 0, min: 30, reorder: 50, safety: 20, lead: 6, price: 1150, gst: 0, loc: locId('book'), dept: 'Academics', burn: 40, valMethod: 'fifo' },
    { id: 'c2', sku: 'ST-NB-172', name: '172-Page Ruled School Notebooks', categoryId: catId('b'), subcategory: 'Notebooks', unit: 'pcs', opening: 650, issued: 490, damaged: 12, wastage: 8, min: 150, reorder: 220, safety: 100, lead: 4, price: 42, gst: 12, loc: locId('book'), dept: 'Academics', burn: 180 },
    { id: 'c3', sku: 'ST-DIARY-26', name: 'Rai Plus Student Almanac & Diary 2026–27', categoryId: catId('b'), subcategory: 'Diaries', unit: 'pcs', opening: 220, issued: 145, damaged: 2, wastage: 0, min: 40, reorder: 60, safety: 25, lead: 5, price: 85, gst: 12, loc: locId('book'), dept: 'Academics', burn: 35 },
    { id: 'c4', sku: 'ST-A4-PAPER', name: 'A4 Copier Paper (75 GSM, 500 Sheets)', categoryId: catId('b'), subcategory: 'Paper', unit: 'packets', opening: 120, issued: 98, damaged: 4, wastage: 6, min: 25, reorder: 40, safety: 15, lead: 3, price: 245, gst: 12, loc: locId('stat'), dept: 'Administration', burn: 36 },
    { id: 'c5', sku: 'ST-MRK-KIT', name: 'Whiteboard Marker & Duster Teacher Kits', categoryId: catId('b'), subcategory: 'Pens & Pencils', unit: 'boxes', opening: 65, issued: 48, damaged: 2, wastage: 1, min: 15, reorder: 25, safety: 10, lead: 3, price: 320, gst: 18, loc: locId('stat'), dept: 'Academics', burn: 18 },
    { id: 'c6', sku: 'GF-TROPHY-M', name: 'Annual Day Gold Medals & Merit Trophies', categoryId: catId('c'), subcategory: 'Trophies', unit: 'sets', opening: 80, issued: 25, damaged: 0, wastage: 0, min: 15, reorder: 25, safety: 10, lead: 7, price: 450, gst: 18, loc: locId('main'), dept: 'Events', burn: 12 },
    { id: 'c7', sku: 'LB-CHEM-IND', name: 'Science Lab Titration & Indicator Chemicals Pack', categoryId: catId('f'), subcategory: 'Approved Chemicals', unit: 'sets', opening: 32, issued: 18, damaged: 2, wastage: 3, min: 10, reorder: 14, safety: 6, lead: 7, price: 1450, gst: 18, loc: locId('slab'), dept: 'Science', burn: 6, perishable: true, expiryDays: 28, valMethod: 'fifo' },
    { id: 'c8', sku: 'HK-DISINF-5L', name: 'Campus Floor Disinfectant & Hygiene Solution', categoryId: catId('i'), subcategory: 'Cleaning Materials', unit: 'litres', opening: 150, issued: 122, damaged: 0, wastage: 14, min: 30, reorder: 45, safety: 20, lead: 3, price: 135, gst: 18, loc: locId('main'), dept: 'Housekeeping', burn: 45, perishable: true, expiryDays: 120 },
    { id: 'c9', sku: 'GD-FERT-ORG', name: 'Organic Garden Fertilizer & Terracotta Pots', categoryId: catId('h'), subcategory: 'Fertilizers', unit: 'kg', opening: 90, issued: 34, damaged: 2, wastage: 0, min: 20, reorder: 30, safety: 10, lead: 5, price: 110, gst: 5, loc: locId('main'), dept: 'Gardening', burn: 15 },
    { id: 'c10', sku: 'SF-FIRSTAID', name: 'Class & Bus First-Aid Refill Kits', categoryId: catId('k'), subcategory: 'First-Aid Kits', unit: 'sets', opening: 35, issued: 26, damaged: 1, wastage: 0, min: 10, reorder: 14, safety: 6, lead: 4, price: 540, gst: 12, loc: locId('main'), dept: 'Safety', burn: 5, perishable: true, expiryDays: 35 },
    { id: 'c11', sku: 'TR-BUS-OIL', name: 'School Bus Synthetic Engine Oil & Coolant', categoryId: catId('l'), subcategory: 'Maintenance Consumables', unit: 'litres', opening: 60, issued: 46, damaged: 0, wastage: 2, min: 15, reorder: 22, safety: 10, lead: 4, price: 410, gst: 18, loc: locId('trns'), dept: 'Transport', burn: 16 },
    { id: 'c12', sku: 'SP-SHUTTLE', name: 'Badminton Shuttlecocks & Cricket Practice Balls', categoryId: catId('g'), subcategory: 'Badminton Equipment', unit: 'boxes', opening: 45, issued: 28, damaged: 3, wastage: 0, min: 10, reorder: 18, safety: 8, lead: 5, price: 680, gst: 12, loc: locId('sprt'), dept: 'Sports', burn: 10 },
  ];

  const ledger: StockLedgerTransaction[] = [];
  const rawConsumables: ConsumableItem[] = [];

  seedConsumables.forEach((sc, idx) => {
    const itemId = `${schoolId}-${sc.id}`;
    const openDate = addDaysIso(nowIso, -60);
    const batchNo = `BCH-26-${String(idx + 1).padStart(3, '0')}`;
    const expiryDate = sc.perishable && sc.expiryDays != null ? addDaysIso(nowIso, sc.expiryDays) : null;

    ledger.push({
      id: `${schoolId}-tx-open-${sc.id}`,
      schoolId,
      idempotencyKey: `seed-open-${schoolId}-${sc.id}`,
      timestamp: `${openDate}T09:00:00.000Z`,
      itemId,
      itemName: sc.name,
      txType: 'OPENING',
      quantity: sc.opening,
      signedDelta: sc.opening,
      unit: sc.unit,
      unitCostInr: sc.price,
      totalValueInr: sc.opening * sc.price,
      locationId: sc.loc,
      batchNo,
      expiryDate,
      referenceType: 'MANUAL',
      purpose: 'Academic Session 2026–27 Opening Stock',
      actorId: 'system-seed',
      actorName: 'Storekeeper',
      approvedBy: 'Principal',
    });

    if (sc.issued > 0) {
      ledger.push({
        id: `${schoolId}-tx-iss-${sc.id}`,
        schoolId,
        idempotencyKey: `seed-iss-${schoolId}-${sc.id}`,
        timestamp: `${addDaysIso(nowIso, -14)}T11:30:00.000Z`,
        itemId,
        itemName: sc.name,
        txType: 'ISSUE',
        quantity: sc.issued,
        signedDelta: -sc.issued,
        unit: sc.unit,
        unitCostInr: sc.price,
        totalValueInr: sc.issued * sc.price,
        locationId: sc.loc,
        batchNo,
        referenceType: 'REQUEST',
        recipientType: 'Department',
        recipientName: sc.dept,
        purpose: `${sc.dept} operational consumption`,
        actorId: 'system-seed',
        actorName: 'Storekeeper',
        receiverAcknowledged: true,
      });
    }
    if (sc.damaged > 0) {
      ledger.push({
        id: `${schoolId}-tx-dmg-${sc.id}`,
        schoolId,
        idempotencyKey: `seed-dmg-${schoolId}-${sc.id}`,
        timestamp: `${addDaysIso(nowIso, -7)}T14:15:00.000Z`,
        itemId,
        itemName: sc.name,
        txType: 'DAMAGE',
        quantity: sc.damaged,
        signedDelta: -sc.damaged,
        unit: sc.unit,
        unitCostInr: sc.price,
        totalValueInr: sc.damaged * sc.price,
        locationId: sc.loc,
        batchNo,
        referenceType: 'MANUAL',
        purpose: 'Damaged in handling/storage inspection',
        actorId: 'system-seed',
        actorName: 'Storekeeper',
      });
    }
    if (sc.wastage > 0) {
      ledger.push({
        id: `${schoolId}-tx-wst-${sc.id}`,
        schoolId,
        idempotencyKey: `seed-wst-${schoolId}-${sc.id}`,
        timestamp: `${addDaysIso(nowIso, -5)}T15:00:00.000Z`,
        itemId,
        itemName: sc.name,
        txType: 'WASTAGE',
        quantity: sc.wastage,
        signedDelta: -sc.wastage,
        unit: sc.unit,
        unitCostInr: sc.price,
        totalValueInr: sc.wastage * sc.price,
        locationId: sc.loc,
        batchNo,
        referenceType: 'MANUAL',
        purpose: 'Spillage / excess wastage logged during monthly check',
        actorId: 'system-seed',
        actorName: 'Storekeeper',
      });
    }

    const remaining = Math.max(0, sc.opening - sc.issued - sc.damaged - sc.wastage);
    rawConsumables.push({
      id: itemId,
      schoolId,
      sku: sc.sku,
      name: sc.name,
      categoryId: sc.categoryId,
      subcategory: sc.subcategory,
      unit: sc.unit,
      openingStock: sc.opening,
      minimumStock: sc.min,
      reorderLevel: sc.reorder,
      safetyStock: sc.safety,
      leadTimeDays: sc.lead,
      averagePurchasePriceInr: sc.price,
      gstPct: sc.gst,
      primaryLocationId: sc.loc,
      department: sc.dept,
      perishable: Boolean(sc.perishable),
      valuationMethod: sc.valMethod || 'weighted_average',
      availableStock: remaining,
      reservedStock: 0,
      damagedStock: sc.damaged,
      wastageStock: sc.wastage,
      locationBalances: { [sc.loc]: remaining },
      batches: [
        {
          id: `${schoolId}-b-${sc.id}`,
          itemId,
          batchNo,
          locationId: sc.loc,
          receivedDate: openDate,
          expiryDate,
          quantityReceived: sc.opening,
          quantityRemaining: remaining,
          unitCostInr: sc.price,
          gstPct: sc.gst,
          vendorId: vendors[idx % vendors.length]!.id,
          invoiceNo: `INV-26-${1040 + idx}`,
        },
      ],
      monthlyAvgConsumption: sc.burn,
      active: true,
    });
  });

  // Seed Fixed Assets with QR payloads, warranties, AMC, idle asset, damaged projector, aging printer
  const makeAsset = (a: Omit<FixedAsset, 'schoolId' | 'qrPayload'>): FixedAsset => ({
    ...a,
    schoolId,
    qrPayload: `RAIPLUS:ASSET:${schoolId}:${a.assetCode}`,
  });

  const assets: FixedAsset[] = [
    makeAsset({
      id: `${schoolId}-ast-1`,
      assetCode: 'AST-IT-001',
      name: '75" 4K Interactive Smart Panel',
      categoryId: catId('e'),
      subcategory: 'Interactive Panels',
      brand: 'BenQ',
      model: 'RP7503',
      serialNumber: 'BNQ-2025-88412',
      purchaseDate: '2025-04-10',
      purchaseValueInr: 165000,
      gstAmountInr: 29700,
      vendorId: vendors[2]!.id,
      vendorName: vendors[2]!.name,
      invoiceNo: 'INV-IT-2025-112',
      warrantyExpiryDate: '2028-04-10',
      amcExpiryDate: '2027-04-10',
      serviceIntervalMonths: 6,
      lastServiceDate: addDaysIso(nowIso, -155),
      nextServiceDate: addDaysIso(nowIso, 25),
      usefulLifeYears: 7,
      salvageValueInr: 15000,
      depreciationMethod: 'SLM',
      depreciationRatePct: 14,
      currentLocationId: roomLoc(5).id,
      department: 'Academics',
      assignedEmployee: 'Class Teacher 10-A',
      condition: 'Excellent',
      maintenanceStatus: 'Operational',
      disposalStatus: 'Active',
      utilizationHoursPerWeek: 32,
      totalRepairCostInr: 0,
      repairCount: 0,
      transferHistory: [],
    }),
    makeAsset({
      id: `${schoolId}-ast-2`,
      assetCode: 'AST-IT-002',
      name: 'Classroom HD Laser Projector',
      categoryId: catId('e'),
      subcategory: 'Projectors',
      brand: 'Epson',
      model: 'EB-L200F',
      serialNumber: 'EPS-2024-33190',
      purchaseDate: '2024-06-15',
      purchaseValueInr: 78000,
      gstAmountInr: 14040,
      vendorId: vendors[2]!.id,
      vendorName: vendors[2]!.name,
      invoiceNo: 'INV-IT-2024-089',
      warrantyExpiryDate: addDaysIso(nowIso, 22),
      amcExpiryDate: addDaysIso(nowIso, 22),
      serviceIntervalMonths: 6,
      lastServiceDate: addDaysIso(nowIso, -170),
      nextServiceDate: addDaysIso(nowIso, 10),
      usefulLifeYears: 6,
      salvageValueInr: 6000,
      depreciationMethod: 'WDV',
      depreciationRatePct: 20,
      currentLocationId: roomLoc(4).id,
      department: 'Academics',
      assignedEmployee: 'Class Teacher 9-A',
      condition: 'Damaged',
      maintenanceStatus: 'In Repair',
      disposalStatus: 'Active',
      utilizationHoursPerWeek: 24,
      totalRepairCostInr: 6500,
      repairCount: 1,
      transferHistory: [],
    }),
    makeAsset({
      id: `${schoolId}-ast-3`,
      assetCode: 'AST-IT-003',
      name: 'Spare Portable Classroom Projector',
      categoryId: catId('e'),
      subcategory: 'Projectors',
      brand: 'Epson',
      model: 'EB-X49',
      serialNumber: 'EPS-2025-55201',
      purchaseDate: '2025-07-01',
      purchaseValueInr: 48000,
      gstAmountInr: 8640,
      vendorId: vendors[2]!.id,
      vendorName: vendors[2]!.name,
      invoiceNo: 'INV-IT-2025-219',
      warrantyExpiryDate: '2028-07-01',
      serviceIntervalMonths: 6,
      usefulLifeYears: 6,
      salvageValueInr: 4000,
      depreciationMethod: 'SLM',
      depreciationRatePct: 15,
      currentLocationId: locId('main'),
      department: 'Administration',
      assignedEmployee: 'Ramesh Storekeeper',
      condition: 'Excellent',
      maintenanceStatus: 'Operational',
      disposalStatus: 'Active',
      utilizationHoursPerWeek: 1, // Idle asset — AI recommends internal transfer!
      totalRepairCostInr: 0,
      repairCount: 0,
      transferHistory: [],
    }),
    makeAsset({
      id: `${schoolId}-ast-4`,
      assetCode: 'AST-IT-004',
      name: 'Exam Cell Heavy-Duty Laser Printer',
      categoryId: catId('e'),
      subcategory: 'Printers',
      brand: 'HP',
      model: 'LaserJet Pro M404dn',
      serialNumber: 'HP-2021-90121',
      purchaseDate: '2021-05-12',
      purchaseValueInr: 34000,
      gstAmountInr: 6120,
      vendorId: vendors[2]!.id,
      vendorName: vendors[2]!.name,
      invoiceNo: 'INV-IT-2021-014',
      warrantyExpiryDate: '2024-05-12',
      usefulLifeYears: 5,
      salvageValueInr: 2500,
      depreciationMethod: 'WDV',
      depreciationRatePct: 30,
      currentLocationId: locId('admn'),
      department: 'Administration',
      assignedEmployee: 'Examination Cell',
      condition: 'Fair',
      maintenanceStatus: 'Operational',
      disposalStatus: 'Active',
      utilizationHoursPerWeek: 18,
      totalRepairCostInr: 17800, // >50% of original cost + 4 repairs -> AI recommends replacement!
      repairCount: 4,
      transferHistory: [],
    }),
    makeAsset({
      id: `${schoolId}-ast-5`,
      assetCode: 'AST-IT-005',
      name: 'Faculty Loaner Laptop (Dell Latitude)',
      categoryId: catId('e'),
      subcategory: 'Laptops',
      brand: 'Dell',
      model: 'Latitude 5440',
      serialNumber: 'DL-2025-77120',
      purchaseDate: '2025-02-18',
      purchaseValueInr: 68000,
      gstAmountInr: 12240,
      vendorId: vendors[2]!.id,
      vendorName: vendors[2]!.name,
      invoiceNo: 'INV-IT-2025-041',
      warrantyExpiryDate: '2028-02-18',
      usefulLifeYears: 5,
      salvageValueInr: 8000,
      depreciationMethod: 'WDV',
      depreciationRatePct: 25,
      currentLocationId: locId('clab'),
      department: 'IT & Computer Science',
      assignedEmployee: 'Anand Verma',
      condition: 'Good',
      maintenanceStatus: 'Operational',
      disposalStatus: 'Active',
      utilizationHoursPerWeek: 14,
      totalRepairCostInr: 0,
      repairCount: 0,
      expectedReturnDate: addDaysIso(nowIso, -4), // Overdue reusable asset return alert!
      transferHistory: [],
    }),
    makeAsset({
      id: `${schoolId}-ast-6`,
      assetCode: 'AST-LB-001',
      name: 'Binocular Compound Research Microscope Set (10 Units)',
      categoryId: catId('f'),
      subcategory: 'Science Equipment',
      brand: 'Olympus',
      model: 'CX23-EDU',
      serialNumber: 'OLY-2024-4410',
      purchaseDate: '2024-08-20',
      purchaseValueInr: 125000,
      gstAmountInr: 22500,
      vendorId: vendors[3]!.id,
      vendorName: vendors[3]!.name,
      invoiceNo: 'INV-LB-2024-309',
      warrantyExpiryDate: '2027-08-20',
      usefulLifeYears: 10,
      salvageValueInr: 12000,
      depreciationMethod: 'SLM',
      depreciationRatePct: 10,
      currentLocationId: locId('slab'),
      department: 'Science',
      assignedEmployee: 'Neha Science HOD',
      condition: 'Excellent',
      maintenanceStatus: 'Operational',
      disposalStatus: 'Active',
      utilizationHoursPerWeek: 20,
      totalRepairCostInr: 0,
      repairCount: 0,
      transferHistory: [],
    }),
    makeAsset({
      id: `${schoolId}-ast-7`,
      assetCode: 'AST-FN-001',
      name: 'Ergonomic Dual Student Bench Lot (20 Benches)',
      categoryId: catId('d'),
      subcategory: 'Student Benches',
      brand: 'Godrej Interio',
      model: 'Scholar-2S',
      serialNumber: 'GDR-2023-2001',
      purchaseDate: '2023-03-25',
      purchaseValueInr: 82000,
      gstAmountInr: 14760,
      vendorId: vendors[2]!.id,
      vendorName: vendors[2]!.name,
      invoiceNo: 'INV-FN-2023-018',
      warrantyExpiryDate: '2028-03-25',
      usefulLifeYears: 12,
      salvageValueInr: 8000,
      depreciationMethod: 'SLM',
      depreciationRatePct: 8,
      currentLocationId: roomLoc(1).id,
      department: 'Academics',
      assignedEmployee: 'Class Teacher 6-A',
      condition: 'Good',
      maintenanceStatus: 'Operational',
      disposalStatus: 'Active',
      utilizationHoursPerWeek: 35,
      totalRepairCostInr: 1200,
      repairCount: 1,
      transferHistory: [],
    }),
    makeAsset({
      id: `${schoolId}-ast-8`,
      assetCode: 'AST-SF-001',
      name: 'ABC Dry Powder Fire Extinguisher Bank (12 Cylinders)',
      categoryId: catId('k'),
      subcategory: 'Fire Extinguishers',
      brand: 'Ceasefire',
      model: 'CF-ABC-6KG',
      serialNumber: 'CSF-2025-1190',
      purchaseDate: '2025-01-15',
      purchaseValueInr: 36000,
      gstAmountInr: 6480,
      vendorId: vendors[2]!.id,
      vendorName: vendors[2]!.name,
      invoiceNo: 'INV-SF-2025-007',
      warrantyExpiryDate: '2027-01-15',
      amcExpiryDate: addDaysIso(nowIso, 30),
      serviceIntervalMonths: 6,
      lastServiceDate: addDaysIso(nowIso, -160),
      nextServiceDate: addDaysIso(nowIso, 20),
      usefulLifeYears: 8,
      salvageValueInr: 2000,
      depreciationMethod: 'SLM',
      depreciationRatePct: 12,
      currentLocationId: locId('main'),
      department: 'Safety',
      assignedEmployee: 'Campus Safety Officer',
      condition: 'Excellent',
      maintenanceStatus: 'Scheduled',
      disposalStatus: 'Active',
      utilizationHoursPerWeek: 24,
      totalRepairCostInr: 0,
      repairCount: 0,
      transferHistory: [],
    }),
  ];

  // Seed Maintenance Tickets
  const maintenanceTickets: AssetMaintenanceTicket[] = [
    {
      id: `${schoolId}-mnt-1`,
      schoolId,
      assetId: assets[1]!.id,
      assetName: assets[1]!.name,
      assetCode: assets[1]!.assetCode,
      locationName: roomLoc(4).name,
      type: 'Warranty',
      status: 'In Progress',
      priority: 'Critical',
      issueSummary: 'HDMI input port intermittent flicker during Class 9-A Science projection.',
      reportedBy: 'Class Teacher 9-A',
      reportedAt: addDaysIso(nowIso, -2),
      scheduledDate: addDaysIso(nowIso, 1),
      vendorName: vendors[2]!.name,
      repairCostInr: 0,
      downtimeHours: 14,
      autoGenerated: false,
    },
    {
      id: `${schoolId}-mnt-2`,
      schoolId,
      assetId: assets[7]!.id,
      assetName: assets[7]!.name,
      assetCode: assets[7]!.assetCode,
      locationName: 'Main Central Store',
      type: 'Preventive',
      status: 'Open',
      priority: 'High',
      issueSummary: 'Scheduled 6-month pressure gauge & fire-safety inspection before AMC renewal.',
      reportedBy: 'Rai Plus Auto-Trigger',
      reportedAt: nowIso,
      scheduledDate: addDaysIso(nowIso, 20),
      vendorName: vendors[2]!.name,
      repairCostInr: 2400,
      downtimeHours: 0,
      autoGenerated: true,
    },
  ];

  // Seed Purchase Requests (with multi-vendor quotes for AI Price Intelligence!)
  const purchaseRequests: PurchaseRequest[] = [
    {
      id: `${schoolId}-pr-1`,
      schoolId,
      requestNo: 'PR-2026-014',
      department: 'Administration',
      requestedBy: 'Ramesh Storekeeper',
      requestedByRole: 'coordinator',
      createdAt: addDaysIso(nowIso, -4),
      itemType: 'consumable',
      itemId: `${schoolId}-c4`,
      itemName: 'A4 Copier Paper (75 GSM, 500 Sheets)',
      categoryId: catId('b'),
      quantity: 80,
      unit: 'packets',
      estimatedUnitCostInr: 235,
      estimatedTotalInr: 18800,
      urgency: 'High',
      purpose: 'UT-4 & Pre-Board examination paper printing stock',
      budgetCode: 'BUD-ACAD-STAT-26',
      budgetVerified: true,
      existingStockAvailable: 12,
      internalTransferCandidate: null,
      quotations: [
        {
          id: 'q1',
          vendorId: vendors[0]!.id,
          vendorName: vendors[0]!.name,
          unitPriceInr: 232,
          gstPct: 12,
          deliveryDays: 4,
          validUntil: addDaysIso(nowIso, 15),
          selected: true,
          notes: 'Bulk school rate',
        },
        {
          id: 'q2',
          vendorId: vendors[1]!.id,
          vendorName: vendors[1]!.name,
          unitPriceInr: 268,
          gstPct: 12,
          deliveryDays: 3,
          validUntil: addDaysIso(nowIso, 10),
          notes: 'Express delivery surcharge included',
        },
      ],
      status: 'Pending Approval',
    },
    {
      id: `${schoolId}-pr-2`,
      schoolId,
      requestNo: 'PR-2026-015',
      department: 'Academics',
      requestedBy: 'Class Teacher 9-A',
      requestedByRole: 'teacher',
      createdAt: addDaysIso(nowIso, -1),
      itemType: 'fixed_asset',
      itemId: null,
      itemName: 'Classroom HD Projector',
      categoryId: catId('e'),
      quantity: 1,
      unit: 'pcs',
      estimatedUnitCostInr: 52000,
      estimatedTotalInr: 52000,
      urgency: 'High',
      purpose: 'Replacement projector while Room 104 unit is under repair',
      budgetCode: 'BUD-IT-CAPEX-26',
      budgetVerified: true,
      existingStockAvailable: 0,
      internalTransferCandidate: 'Idle fixed asset AST-IT-003 (Spare Portable Classroom Projector) in Main Central Store (1 hr/wk) — transfer before purchasing!',
      quotations: [
        {
          id: 'q3',
          vendorId: vendors[2]!.id,
          vendorName: vendors[2]!.name,
          unitPriceInr: 52000,
          gstPct: 18,
          deliveryDays: 8,
          validUntil: addDaysIso(nowIso, 20),
        },
      ],
      status: 'Pending Approval',
    },
  ];

  // Seed Active & Partially Delivered Purchase Orders (prevents duplicate reorder on Notebooks!)
  const purchaseOrders: PurchaseOrder[] = [
    {
      id: `${schoolId}-po-1`,
      schoolId,
      poNo: 'PO-2026-088',
      purchaseRequestId: null,
      vendorId: vendors[0]!.id,
      vendorName: vendors[0]!.name,
      department: 'Academics',
      createdAt: addDaysIso(nowIso, -10),
      expectedDeliveryDate: addDaysIso(nowIso, 3),
      approvedBy: 'Principal',
      status: 'Partially Delivered',
      lines: [
        {
          itemId: `${schoolId}-c2`,
          itemName: '172-Page Ruled School Notebooks',
          categoryId: catId('b'),
          unit: 'pcs',
          orderedQty: 500,
          receivedQty: 200,
          damagedQty: 0,
          unitPriceInr: 41,
          gstPct: 12,
          lineTotalInr: 20500,
        },
      ],
      subtotalInr: 20500,
      gstTotalInr: 2460,
      grandTotalInr: 22960,
      paymentStatus: 'Partially Paid',
      grns: [
        {
          id: `${schoolId}-grn-1`,
          grnNo: 'GRN-2026-101',
          idempotencyKey: `seed-grn-${schoolId}-1`,
          receivedDate: addDaysIso(nowIso, -5),
          receivedBy: 'Ramesh Storekeeper',
          invoiceNo: 'HAP-26-991',
          invoiceVerified: true,
          qualityStatus: 'Passed',
          locationId: locId('book'),
          lines: [
            {
              itemId: `${schoolId}-c2`,
              itemName: '172-Page Ruled School Notebooks',
              acceptedQty: 200,
              damagedQty: 0,
              batchNo: 'BCH-26-NB2',
            },
          ],
          notes: 'First partial lot received in good condition',
        },
      ],
    },
  ];

  // Seed Resource Requests from teachers
  const resourceRequests: InventoryResourceRequest[] = [
    {
      id: `${schoolId}-req-1`,
      schoolId,
      requestNo: 'REQ-2026-201',
      requesterId: 'usr-teacher',
      requesterName: 'Neha Science HOD',
      requesterRole: 'teacher',
      department: 'Science',
      locationId: locId('slab'),
      itemId: `${schoolId}-c5`,
      itemName: 'Whiteboard Marker & Duster Teacher Kits',
      quantity: 4,
      unit: 'boxes',
      purpose: 'Science practical board demonstrations',
      urgency: 'Normal',
      createdAt: nowIso,
      availableAtRequest: 14,
      status: 'Pending',
    },
  ];

  // Seed Book Distributions linked to actual enrolled students
  const schoolStudents = db.students.filter((s) => s.schoolId === schoolId).slice(0, 6);
  const bookDistributions: BookDistributionRecord[] = schoolStudents.slice(0, 3).map((stu, i) => ({
    id: `${schoolId}-bd-${i + 1}`,
    schoolId,
    session: '2026-27',
    studentId: stu.id,
    studentName: stu.name,
    classSection: stu.classSection,
    itemId: `${schoolId}-c1`,
    itemName: 'NCERT / HBSE Class 6–10 Textbook Sets',
    quantityIssued: 1,
    quantityRequired: 1,
    status: 'Distributed',
    isReplacement: false,
    distributedDate: addDaysIso(nowIso, -20 + i),
    distributedBy: 'Kavita Sharma',
    feeLinkedAmountInr: 1150,
  }));

  // Seed Classroom Resource Registers synced with classrooms
  const classroomLocs = locations.filter((l) => l.type === 'Classroom').slice(0, 6);
  const classroomResources: ClassroomResourceStandard[] = [];
  classroomLocs.forEach((loc, idx) => {
    const clsMatch = loc.name.match(/\((?:Class\s+)?([^)]+)\)/);
    const clsLabel = clsMatch?.[1] || `Class ${6 + idx}-A`;
    const baseEntries: Array<[ClassroomResourceStandard['resourceType'], number, number, number, number]> = [
      ['Student Benches', 20, 20, idx === 2 ? 18 : 20, idx === 2 ? 2 : 0],
      ['Teacher Desk', 1, 1, 1, 0],
      ['Projector', 1, 1, idx === 3 ? 0 : 1, idx === 3 ? 1 : 0],
      ['Ceiling Fans', 4, 4, idx === 1 ? 3 : 4, idx === 1 ? 1 : 0],
      ['LED Lights', 6, 6, 6, 0],
      ['Whiteboard', 1, 1, 1, 0],
      ['Dustbin', 1, idx === 4 ? 0 : 1, idx === 4 ? 0 : 1, 0],
    ];
    baseEntries.forEach(([type, reqQty, instQty, workQty, dmgQty], j) => {
      classroomResources.push({
        id: `${schoolId}-cr-${idx + 1}-${j + 1}`,
        schoolId,
        locationId: loc.id,
        roomLabel: loc.code,
        classSection: clsLabel,
        resourceType: type,
        requiredQty: reqQty,
        installedQty: instQty,
        workingQty: workQty,
        damagedQty: dmgQty,
        missingQty: Math.max(0, reqQty - instQty),
        lastCheckedDate: addDaysIso(nowIso, -3),
      });
    });
  });

  // Seed a Pending Physical Stock Audit with 1 discrepancy awaiting approval
  const audits: StockAuditSession[] = [
    {
      id: `${schoolId}-aud-1`,
      schoolId,
      auditCode: 'AUD-2026-Q3',
      auditType: 'Quarterly',
      scopeLabel: 'Stationery & Book Store',
      auditorName: 'Internal Audit Officer',
      auditDate: addDaysIso(nowIso, -1),
      status: 'Pending Approval',
      lines: [
        {
          id: 'al-1',
          targetType: 'consumable',
          targetId: `${schoolId}-c4`,
          targetName: 'A4 Copier Paper (75 GSM, 500 Sheets)',
          locationId: locId('stat'),
          systemQty: 12,
          physicalQty: 10,
          damagedQty: 1,
          variance: -2,
          explanation: '2 packets issued urgently for exam slips without voucher entry.',
          correctiveAction: 'Post approved audit adjustment and enforce issue slip mandate.',
          verifiedByQr: true,
        },
        {
          id: 'al-2',
          targetType: 'consumable',
          targetId: `${schoolId}-c3`,
          targetName: 'Rai Plus Student Almanac & Diary 2026–27',
          locationId: locId('book'),
          systemQty: 73,
          physicalQty: 73,
          damagedQty: 0,
          variance: 0,
          verifiedByQr: true,
        },
      ],
      totalMissingUnits: 2,
      totalExcessUnits: 0,
      totalDamagedUnits: 1,
    },
  ];

  const state: SchoolInventoryState = {
    schoolId,
    annualBudgetInr: 1850000,
    categories,
    locations,
    consumables: rawConsumables,
    ledger,
    assets,
    vendors,
    purchaseRequests,
    purchaseOrders,
    resourceRequests,
    bookDistributions,
    classroomResources,
    maintenanceTickets,
    audits,
    disposals: [],
    annualAssumptions: {
      sessionLabel: '2027–28',
      expectedNewAdmissionsPct: 12,
      notebooksPerStudent: 10,
      textbooksPerStudent: 7,
      diariesPerStudent: 1,
      teacherStationeryBudgetInr: 45000,
      furnitureReplacementPct: 6,
      bufferStockPct: 8,
      emergencyReservePct: 4,
    },
    updatedAt: new Date().toISOString(),
  };

  state.consumables = reconcileAllConsumables(state);
  db.inventoryBySchool[schoolId] = state;
  return state;
}

export function registerInventoryRoutes(app: Express, deps: RouteDeps): void {
  const { requireAuth, appendAuditLog } = deps;

  const requireInventoryAccess = (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !canAccessInventory(req.user.role)) {
      res.status(403).json({ error: 'Inventory & Asset Management is restricted to authorized school staff.' });
      return;
    }
    next();
  };

  const requireLeadershipApproval = (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !canApproveProcurementOrDisposal(req.user.role)) {
      res.status(403).json({ error: 'Only Principal, School Admin, Coordinator, or Super Admin can approve this inventory action.' });
      return;
    }
    next();
  };

  const requireStockManager = (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !canManageStockMovements(req.user.role)) {
      res.status(403).json({ error: 'Only storekeepers, leadership, accountants, or transport incharge can execute stock movements.' });
      return;
    }
    next();
  };

  function getActiveState(req: AuthedRequest) {
    const db = getDb();
    const schoolId = req.activeSchoolId || req.user!.schoolId || db.schools[0]?.id || 'school-vis-jjr';
    const state = ensureInventoryInitialized(db, schoolId);
    state.consumables = reconcileAllConsumables(state);
    return { db, schoolId, state };
  }

  // 1. Unified Inventory Workspace Snapshot (State + AI Intelligence + Financial Summary + Classroom Readiness + Annual Plan)
  app.get('/api/inventory/workspace', requireAuth, requireInventoryAccess, (req: AuthedRequest, res: Response) => {
    const { db, schoolId, state } = getActiveState(req);
    const asOf = todayIso();
    const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);
    const schoolLeads = db.admissionLeads.filter((l) => l.schoolId === schoolId);
    const teachersCount = db.users.filter((u) => u.schoolId === schoolId && u.role === 'teacher').length;

    const ai = buildInventoryAiIntelligence(state, asOf);
    const financials = computeInventoryFinancialSummary(state, asOf);
    const classroomReadiness = computeClassroomReadinessMatrix(
      state.classroomResources,
      state.maintenanceTickets,
    );
    const annualPlan = computeAnnualSessionPlan({
      state,
      students: schoolStudents,
      admissionLeads: schoolLeads,
      teachersCount,
    });
    const assetValuations = Object.fromEntries(
      state.assets.map((a) => [a.id, computeAssetBookValue(a, asOf)]),
    );

    res.json({
      state,
      ai,
      financials,
      classroomReadiness,
      annualPlan,
      assetValuations,
      permissions: {
        canApprove: canApproveProcurementOrDisposal(req.user!.role),
        canManageStock: canManageStockMovements(req.user!.role),
        role: req.user!.role,
      },
    });
  });

  // 2. Category Management (Add, Edit, Merge, Deactivate)
  app.post('/api/inventory/categories', requireAuth, requireLeadershipApproval, (req: AuthedRequest, res: Response) => {
    const { name, code, kind = 'both', subcategories = [] } = (req.body || {}) as {
      name?: string;
      code?: string;
      kind?: InventoryCategory['kind'];
      subcategories?: string[];
    };
    if (!name?.trim()) {
      res.status(400).json({ error: 'Category name is required.' });
      return;
    }
    const { schoolId, state } = getActiveState(req);
    const cat: InventoryCategory = {
      id: `${schoolId}-cat-${Date.now().toString(36)}`,
      schoolId,
      code: (code?.trim() || `CAT-${state.categories.length + 1}`).toUpperCase(),
      name: name.trim(),
      parentId: null,
      kind,
      subcategories: Array.isArray(subcategories)
        ? subcategories.map((s) => String(s).trim()).filter(Boolean)
        : [],
      active: true,
      mergedIntoCategoryId: null,
      createdAt: todayIso(),
    };
    state.categories.push(cat);
    state.updatedAt = new Date().toISOString();
    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: 'INVENTORY_CATEGORY_CREATED',
      entityType: 'InventoryCategory',
      entityId: cat.id,
      detail: `Created inventory category ${cat.code}: ${cat.name}`,
    });
    saveDb(undefined, { schoolId });
    res.status(201).json({ category: cat });
  });

  app.patch('/api/inventory/categories/:id', requireAuth, requireLeadershipApproval, (req: AuthedRequest, res: Response) => {
    const { schoolId, state } = getActiveState(req);
    const cat = state.categories.find((c) => c.id === req.params.id);
    if (!cat) {
      res.status(404).json({ error: 'Category not found in this school.' });
      return;
    }
    const { name, active, mergeIntoCategoryId, subcategories } = (req.body || {}) as {
      name?: string;
      active?: boolean;
      mergeIntoCategoryId?: string;
      subcategories?: string[];
    };
    if (name?.trim()) cat.name = name.trim();
    if (typeof active === 'boolean') cat.active = active;
    if (Array.isArray(subcategories)) {
      cat.subcategories = subcategories.map((s) => String(s).trim()).filter(Boolean);
    }
    if (mergeIntoCategoryId && mergeIntoCategoryId !== cat.id) {
      const target = state.categories.find((c) => c.id === mergeIntoCategoryId && c.active);
      if (!target) {
        res.status(400).json({ error: 'Target merge category not found or inactive.' });
        return;
      }
      state.consumables.forEach((c) => {
        if (c.categoryId === cat.id) c.categoryId = target.id;
      });
      state.assets.forEach((a) => {
        if (a.categoryId === cat.id) a.categoryId = target.id;
      });
      cat.active = false;
      cat.mergedIntoCategoryId = target.id;
    }
    state.updatedAt = new Date().toISOString();
    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: 'INVENTORY_CATEGORY_UPDATED',
      entityType: 'InventoryCategory',
      entityId: cat.id,
      detail: `Updated category ${cat.name} (active=${cat.active}${cat.mergedIntoCategoryId ? `, mergedInto=${cat.mergedIntoCategoryId}` : ''})`,
    });
    saveDb(undefined, { schoolId });
    res.json({ category: cat });
  });

  // 3. Multi-Location Store Management
  app.post('/api/inventory/locations', requireAuth, requireLeadershipApproval, (req: AuthedRequest, res: Response) => {
    const { name, code, type = 'Custom', building = 'Main Block', floor = 'Ground', department = 'Operations', inchargeName = 'Storekeeper' } = (req.body || {}) as Partial<InventoryLocation>;
    if (!name?.trim()) {
      res.status(400).json({ error: 'Location name is required.' });
      return;
    }
    const { schoolId, state } = getActiveState(req);
    const loc: InventoryLocation = {
      id: `${schoolId}-loc-${Date.now().toString(36)}`,
      schoolId,
      code: (code?.trim() || `LOC-${state.locations.length + 1}`).toUpperCase(),
      name: name.trim(),
      type,
      building,
      floor,
      department,
      inchargeName,
      active: true,
    };
    state.locations.push(loc);
    state.updatedAt = new Date().toISOString();
    saveDb(undefined, { schoolId });
    res.status(201).json({ location: loc });
  });

  // 4. Register Consumable Item (with initial OPENING ledger transaction)
  app.post('/api/inventory/consumables', requireAuth, requireStockManager, (req: AuthedRequest, res: Response) => {
    const body = (req.body || {}) as Partial<ConsumableItem> & { openingStock?: number; batchNo?: string; expiryDate?: string };
    if (!body.name?.trim() || !body.categoryId) {
      res.status(400).json({ error: 'Item name and category are required.' });
      return;
    }
    const { schoolId, state } = getActiveState(req);
    const opening = Math.max(0, Number(body.openingStock) || 0);
    const price = Math.max(0, Number(body.averagePurchasePriceInr) || 0);
    const locId = body.primaryLocationId || state.locations[0]!.id;
    const itemId = `${schoolId}-cons-${Date.now().toString(36)}`;
    const unit = body.unit || 'pcs';
    const batchNo = body.batchNo?.trim() || `BCH-${Date.now().toString(36).toUpperCase()}`;

    const item: ConsumableItem = {
      id: itemId,
      schoolId,
      sku: (body.sku?.trim() || `SKU-${state.consumables.length + 101}`).toUpperCase(),
      name: body.name.trim(),
      categoryId: body.categoryId,
      subcategory: body.subcategory?.trim() || '',
      unit,
      openingStock: opening,
      minimumStock: Math.max(1, Number(body.minimumStock) || 10),
      reorderLevel: Math.max(2, Number(body.reorderLevel) || 20),
      safetyStock: Math.max(1, Number(body.safetyStock) || 10),
      leadTimeDays: Math.max(1, Number(body.leadTimeDays) || 5),
      averagePurchasePriceInr: price,
      gstPct: Math.max(0, Number(body.gstPct) || 0),
      primaryLocationId: locId,
      department: body.department?.trim() || 'Academics',
      perishable: Boolean(body.perishable || body.expiryDate),
      valuationMethod: body.valuationMethod || 'weighted_average',
      availableStock: opening,
      reservedStock: 0,
      damagedStock: 0,
      wastageStock: 0,
      locationBalances: { [locId]: opening },
      batches:
        opening > 0
          ? [
              {
                id: `${schoolId}-b-${Date.now().toString(36)}`,
                itemId,
                batchNo,
                locationId: locId,
                receivedDate: todayIso(),
                expiryDate: body.expiryDate || null,
                quantityReceived: opening,
                quantityRemaining: opening,
                unitCostInr: price,
                gstPct: Number(body.gstPct) || 0,
              },
            ]
          : [],
      monthlyAvgConsumption: Math.max(1, Number(body.monthlyAvgConsumption) || 10),
      active: true,
    };

    state.consumables.push(item);
    if (opening > 0) {
      state.ledger.unshift({
        id: `${schoolId}-tx-${Date.now().toString(36)}`,
        schoolId,
        idempotencyKey: `create-item-${itemId}`,
        timestamp: new Date().toISOString(),
        itemId,
        itemName: item.name,
        txType: 'OPENING',
        quantity: opening,
        signedDelta: opening,
        unit,
        unitCostInr: price,
        totalValueInr: opening * price,
        locationId: locId,
        batchNo,
        expiryDate: body.expiryDate || null,
        referenceType: 'MANUAL',
        purpose: 'New consumable SKU opening balance',
        actorId: req.user!.id,
        actorName: req.user!.name,
      });
    }
    state.consumables = reconcileAllConsumables(state);
    state.updatedAt = new Date().toISOString();
    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: 'INVENTORY_ITEM_CREATED',
      entityType: 'ConsumableItem',
      entityId: itemId,
      detail: `Created consumable ${item.sku} (${item.name}) with opening stock ${opening} ${unit}`,
    });
    saveDb(undefined, { schoolId });
    res.status(201).json({ item: state.consumables.find((c) => c.id === itemId) });
  });

  // 5. Immutable Stock Ledger Transaction (Receive / Issue / Return / Damage / Wastage / Atomic Transfer)
  app.post('/api/inventory/ledger', requireAuth, requireStockManager, (req: AuthedRequest, res: Response) => {
    const body = (req.body || {}) as {
      itemId?: string;
      txType?: StockTransactionType | 'TRANSFER';
      quantity?: number;
      unitCostInr?: number;
      locationId?: string;
      destinationLocationId?: string;
      batchNo?: string;
      expiryDate?: string | null;
      recipientType?: StockLedgerTransaction['recipientType'];
      recipientName?: string;
      purpose?: string;
      idempotencyKey?: string;
      allowNegativeOverride?: boolean;
    };

    if (!body.itemId || !body.txType || typeof body.quantity !== 'number') {
      res.status(400).json({ error: 'itemId, txType, and numeric quantity are required.' });
      return;
    }

    const { schoolId, state } = getActiveState(req);
    const item = state.consumables.find((c) => c.id === body.itemId);
    if (!item) {
      res.status(404).json({ error: 'Consumable item not found.' });
      return;
    }

    const locId = body.locationId || item.primaryLocationId;
    const isTransfer = body.txType === 'TRANSFER';
    const checkType: StockTransactionType =
      body.txType === 'TRANSFER' ? 'TRANSFER_OUT' : body.txType;

    // Negative override requires explicit leadership authorization
    const negativeOverrideBy =
      body.allowNegativeOverride && canApproveProcurementOrDisposal(req.user!.role)
        ? req.user!.name
        : null;

    const validation = validateStockLedgerTransaction({
      state,
      itemId: item.id,
      txType: checkType,
      quantity: body.quantity,
      locationId: locId,
      idempotencyKey: body.idempotencyKey,
      negativeOverrideAuthorizedBy: negativeOverrideBy,
    });

    if (!validation.ok) {
      res.status(validation.duplicate ? 409 : 400).json({ error: validation.error });
      return;
    }

    const unitCost = typeof body.unitCostInr === 'number' && body.unitCostInr >= 0
      ? body.unitCostInr
      : item.averagePurchasePriceInr;
    const nowTs = new Date().toISOString();

    if (isTransfer) {
      if (!body.destinationLocationId || body.destinationLocationId === locId) {
        res.status(400).json({ error: 'Distinct destination location is required for transfer.' });
        return;
      }
      const refId = `TRF-${Date.now().toString(36).toUpperCase()}`;
      const txOut: StockLedgerTransaction = {
        id: `${schoolId}-tx-out-${Date.now().toString(36)}`,
        schoolId,
        idempotencyKey: body.idempotencyKey,
        timestamp: nowTs,
        itemId: item.id,
        itemName: item.name,
        txType: 'TRANSFER_OUT',
        quantity: body.quantity,
        signedDelta: -body.quantity,
        unit: item.unit,
        unitCostInr: unitCost,
        totalValueInr: Math.round(body.quantity * unitCost),
        locationId: locId,
        destinationLocationId: body.destinationLocationId,
        referenceType: 'TRANSFER',
        referenceId: refId,
        purpose: body.purpose?.trim() || 'Internal inter-store stock transfer',
        actorId: req.user!.id,
        actorName: req.user!.name,
        approvedBy: req.user!.name,
      };
      const txIn: StockLedgerTransaction = {
        ...txOut,
        id: `${schoolId}-tx-in-${Date.now().toString(36)}`,
        idempotencyKey: body.idempotencyKey ? `${body.idempotencyKey}:in` : undefined,
        txType: 'TRANSFER_IN',
        signedDelta: body.quantity,
        locationId: body.destinationLocationId,
        destinationLocationId: locId,
      };
      state.ledger.unshift(txIn, txOut);
      state.consumables = reconcileAllConsumables(state);
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'INVENTORY_TRANSFER',
        entityType: 'ConsumableItem',
        entityId: item.id,
        detail: `Transferred ${body.quantity} ${item.unit} of ${item.name} (${refId})`,
      });
      saveDb(undefined, { schoolId });
      res.status(201).json({ transactions: [txOut, txIn], item: state.consumables.find((c) => c.id === item.id) });
      return;
    }

    const tx: StockLedgerTransaction = {
      id: `${schoolId}-tx-${Date.now().toString(36)}`,
      schoolId,
      idempotencyKey: body.idempotencyKey,
      timestamp: nowTs,
      itemId: item.id,
      itemName: item.name,
      txType: checkType,
      quantity: body.quantity,
      signedDelta: validation.signedDelta,
      unit: item.unit,
      unitCostInr: unitCost,
      totalValueInr: Math.round(body.quantity * unitCost),
      locationId: locId,
      batchNo: body.batchNo?.trim() || null,
      expiryDate: body.expiryDate || null,
      referenceType: 'MANUAL',
      recipientType: body.recipientType,
      recipientName: body.recipientName?.trim(),
      purpose: body.purpose?.trim() || `${checkType} recorded`,
      actorId: req.user!.id,
      actorName: req.user!.name,
      receiverAcknowledged: checkType === 'ISSUE' ? true : undefined,
      negativeOverrideAuthorizedBy: negativeOverrideBy,
    };

    state.ledger.unshift(tx);

    // Update batches (add on receipt, consume FIFO on outbound)
    if (checkType === 'PURCHASE_RECEIPT' || checkType === 'RETURN') {
      item.batches.push({
        id: `${schoolId}-b-${Date.now().toString(36)}`,
        itemId: item.id,
        batchNo: body.batchNo?.trim() || `BCH-${Date.now().toString(36).toUpperCase()}`,
        locationId: locId,
        receivedDate: todayIso(),
        expiryDate: body.expiryDate || null,
        quantityReceived: body.quantity,
        quantityRemaining: body.quantity,
        unitCostInr: unitCost,
        gstPct: item.gstPct,
      });
    } else if (validation.signedDelta < 0) {
      let toDeduct = body.quantity;
      const fifoBatches = [...item.batches].sort((a, b) => a.receivedDate.localeCompare(b.receivedDate));
      for (const b of fifoBatches) {
        if (toDeduct <= 0) break;
        const take = Math.min(toDeduct, b.quantityRemaining);
        b.quantityRemaining -= take;
        toDeduct -= take;
      }
    }

    state.consumables = reconcileAllConsumables(state);
    state.updatedAt = nowTs;
    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: `INVENTORY_${checkType}`,
      entityType: 'ConsumableItem',
      entityId: item.id,
      detail: `${checkType} ${body.quantity} ${item.unit} of ${item.name} (${tx.purpose})`,
    });
    saveDb(undefined, { schoolId });
    res.status(201).json({ transaction: tx, item: state.consumables.find((c) => c.id === item.id) });
  });

  // 6. Fixed Asset Register, Transfer, Maintenance, Disposal & QR Scan
  app.post('/api/inventory/assets', requireAuth, requireStockManager, (req: AuthedRequest, res: Response) => {
    const b = (req.body || {}) as Partial<FixedAsset>;
    if (!b.name?.trim() || !b.categoryId) {
      res.status(400).json({ error: 'Asset name and category are required.' });
      return;
    }
    const { schoolId, state } = getActiveState(req);
    const assetCode = (b.assetCode?.trim() || `AST-${String(state.assets.length + 101).padStart(3, '0')}`).toUpperCase();
    const asset: FixedAsset = {
      id: `${schoolId}-ast-${Date.now().toString(36)}`,
      schoolId,
      assetCode,
      qrPayload: `RAIPLUS:ASSET:${schoolId}:${assetCode}`,
      name: b.name.trim(),
      categoryId: b.categoryId,
      subcategory: b.subcategory?.trim() || '',
      brand: b.brand?.trim() || 'Standard',
      model: b.model?.trim() || 'GEN-1',
      serialNumber: b.serialNumber?.trim() || `SN-${Date.now().toString(36).toUpperCase()}`,
      purchaseDate: b.purchaseDate || todayIso(),
      purchaseValueInr: Math.max(0, Number(b.purchaseValueInr) || 0),
      gstAmountInr: Math.max(0, Number(b.gstAmountInr) || 0),
      vendorId: b.vendorId || state.vendors[0]?.id || '',
      vendorName: b.vendorName?.trim() || state.vendors[0]?.name || 'Registered Vendor',
      invoiceNo: b.invoiceNo?.trim() || `INV-${Date.now().toString(36).toUpperCase()}`,
      warrantyExpiryDate: b.warrantyExpiryDate || addDaysIso(todayIso(), 365),
      amcExpiryDate: b.amcExpiryDate || null,
      serviceIntervalMonths: Number(b.serviceIntervalMonths) || 6,
      usefulLifeYears: Math.max(1, Number(b.usefulLifeYears) || 5),
      salvageValueInr: Math.max(0, Number(b.salvageValueInr) || 0),
      depreciationMethod: b.depreciationMethod || 'SLM',
      depreciationRatePct: Math.max(1, Number(b.depreciationRatePct) || 15),
      currentLocationId: b.currentLocationId || state.locations[0]!.id,
      department: b.department?.trim() || 'Academics',
      assignedEmployee: b.assignedEmployee?.trim() || req.user!.name,
      condition: b.condition || 'Excellent',
      maintenanceStatus: 'Operational',
      disposalStatus: 'Active',
      utilizationHoursPerWeek: Number(b.utilizationHoursPerWeek) || 15,
      totalRepairCostInr: 0,
      repairCount: 0,
      expectedReturnDate: b.expectedReturnDate || null,
      transferHistory: [],
    };
    state.assets.unshift(asset);
    state.updatedAt = new Date().toISOString();
    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: 'FIXED_ASSET_REGISTERED',
      entityType: 'FixedAsset',
      entityId: asset.id,
      detail: `Registered fixed asset ${asset.assetCode} (${asset.name}) value ₹${asset.purchaseValueInr}`,
    });
    saveDb(undefined, { schoolId });
    res.status(201).json({ asset });
  });

  app.post('/api/inventory/assets/:id/transfer', requireAuth, requireStockManager, (req: AuthedRequest, res: Response) => {
    const { toLocationId, toCustodian, reason, expectedReturnDate } = (req.body || {}) as {
      toLocationId?: string;
      toCustodian?: string;
      reason?: string;
      expectedReturnDate?: string | null;
    };
    const { schoolId, state } = getActiveState(req);
    const asset = state.assets.find((a) => a.id === req.params.id);
    if (!asset) {
      res.status(404).json({ error: 'Fixed asset not found.' });
      return;
    }
    if (asset.disposalStatus === 'Disposed') {
      res.status(400).json({ error: 'Disposed assets cannot be transferred.' });
      return;
    }
    const targetLoc = state.locations.find((l) => l.id === toLocationId);
    if (!targetLoc) {
      res.status(400).json({ error: 'Valid destination location is required.' });
      return;
    }
    const fromLoc = state.locations.find((l) => l.id === asset.currentLocationId);
    const record = {
      id: `atrf-${Date.now().toString(36)}`,
      date: todayIso(),
      fromLocationId: asset.currentLocationId,
      fromLocationName: fromLoc?.name || asset.currentLocationId,
      toLocationId: targetLoc.id,
      toLocationName: targetLoc.name,
      fromCustodian: asset.assignedEmployee,
      toCustodian: toCustodian?.trim() || targetLoc.inchargeName,
      reason: reason?.trim() || 'Resource optimization / redistribution',
      approvedBy: req.user!.name,
    };
    asset.transferHistory.unshift(record);
    asset.currentLocationId = targetLoc.id;
    asset.department = targetLoc.department;
    asset.assignedEmployee = record.toCustodian;
    asset.expectedReturnDate = expectedReturnDate ?? null;
    asset.utilizationHoursPerWeek = Math.max(asset.utilizationHoursPerWeek, 18);
    state.updatedAt = new Date().toISOString();

    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: 'FIXED_ASSET_TRANSFERRED',
      entityType: 'FixedAsset',
      entityId: asset.id,
      detail: `Transferred ${asset.assetCode} from ${record.fromLocationName} to ${record.toLocationName} (custodian: ${record.toCustodian})`,
    });
    saveDb(undefined, { schoolId });
    res.json({ asset, transfer: record });
  });

  app.post('/api/inventory/assets/:id/maintenance', requireAuth, requireInventoryAccess, (req: AuthedRequest, res: Response) => {
    const { type = 'Corrective', priority = 'High', issueSummary, repairCostInr = 0, resolveTicketId } = (req.body || {}) as {
      type?: AssetMaintenanceTicket['type'];
      priority?: AssetMaintenanceTicket['priority'];
      issueSummary?: string;
      repairCostInr?: number;
      resolveTicketId?: string;
    };
    const { schoolId, state } = getActiveState(req);
    const asset = state.assets.find((a) => a.id === req.params.id);
    if (!asset) {
      res.status(404).json({ error: 'Fixed asset not found.' });
      return;
    }

    if (resolveTicketId) {
      const ticket = state.maintenanceTickets.find((t) => t.id === resolveTicketId && t.assetId === asset.id);
      if (!ticket) {
        res.status(404).json({ error: 'Maintenance ticket not found.' });
        return;
      }
      const cost = Math.max(0, Number(repairCostInr) || ticket.repairCostInr);
      ticket.status = 'Resolved';
      ticket.resolvedAt = todayIso();
      ticket.repairCostInr = cost;
      asset.totalRepairCostInr += cost;
      asset.repairCount += 1;
      asset.condition = 'Good';
      asset.maintenanceStatus = 'Operational';
      asset.lastServiceDate = todayIso();
      if (asset.serviceIntervalMonths) {
        asset.nextServiceDate = addDaysIso(todayIso(), asset.serviceIntervalMonths * 30);
      }
      saveDb(undefined, { schoolId });
      res.json({ asset, ticket });
      return;
    }

    if (!issueSummary?.trim()) {
      res.status(400).json({ error: 'Maintenance issue description is required.' });
      return;
    }
    const loc = state.locations.find((l) => l.id === asset.currentLocationId);
    const ticket: AssetMaintenanceTicket = {
      id: `${schoolId}-mnt-${Date.now().toString(36)}`,
      schoolId,
      assetId: asset.id,
      assetName: asset.name,
      assetCode: asset.assetCode,
      locationName: loc?.name || asset.currentLocationId,
      type,
      status: 'Open',
      priority,
      issueSummary: issueSummary.trim(),
      reportedBy: req.user!.name,
      reportedAt: todayIso(),
      scheduledDate: addDaysIso(todayIso(), 2),
      vendorName: asset.vendorName,
      repairCostInr: Math.max(0, Number(repairCostInr) || 0),
      downtimeHours: 0,
    };
    state.maintenanceTickets.unshift(ticket);
    if (type === 'Corrective' || type === 'Warranty') {
      asset.condition = 'Under Repair';
      asset.maintenanceStatus = type === 'Warranty' ? 'Warranty Claim' : 'In Repair';
    } else {
      asset.maintenanceStatus = 'Scheduled';
    }
    state.updatedAt = new Date().toISOString();
    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: 'ASSET_MAINTENANCE_LOGGED',
      entityType: 'FixedAsset',
      entityId: asset.id,
      detail: `Logged ${type} maintenance ticket for ${asset.assetCode}: ${ticket.issueSummary}`,
    });
    saveDb(undefined, { schoolId });
    res.status(201).json({ asset, ticket });
  });

  app.post('/api/inventory/assets/:id/dispose', requireAuth, requireLeadershipApproval, (req: AuthedRequest, res: Response) => {
    const { method = 'Write-Off', reason, disposalProceedsInr = 0, notes } = (req.body || {}) as {
      method?: AssetDisposalRecord['method'];
      reason?: string;
      disposalProceedsInr?: number;
      notes?: string;
    };
    if (!reason?.trim()) {
      res.status(400).json({ error: 'Documented disposal reason is required.' });
      return;
    }
    const { schoolId, state } = getActiveState(req);
    const asset = state.assets.find((a) => a.id === req.params.id);
    if (!asset) {
      res.status(404).json({ error: 'Fixed asset not found.' });
      return;
    }
    const bv = computeAssetBookValue(asset, todayIso());
    const disposal: AssetDisposalRecord = {
      id: `${schoolId}-dsp-${Date.now().toString(36)}`,
      schoolId,
      targetType: 'fixed_asset',
      targetId: asset.id,
      targetName: `${asset.assetCode} · ${asset.name}`,
      method,
      reason: reason.trim(),
      condition: asset.condition,
      bookValueAtDisposalInr: bv.currentBookValueInr,
      disposalProceedsInr: Math.max(0, Number(disposalProceedsInr) || 0),
      disposalDate: todayIso(),
      approvedBy: req.user!.name,
      notes: notes?.trim(),
    };
    // Retain full historical asset record (NEVER permanently delete!)
    asset.disposalStatus = 'Disposed';
    asset.maintenanceStatus = 'Decommissioned';
    asset.condition = 'Obsolete';
    asset.disposalRecord = disposal;
    state.disposals.unshift(disposal);
    state.updatedAt = new Date().toISOString();

    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: 'FIXED_ASSET_DISPOSED',
      entityType: 'FixedAsset',
      entityId: asset.id,
      detail: `Approved ${method} disposal of ${asset.assetCode} (Book value ₹${bv.currentBookValueInr}, Proceeds ₹${disposal.disposalProceedsInr})`,
    });
    saveDb(undefined, { schoolId });
    res.json({ asset, disposal });
  });

  app.get('/api/inventory/qr/:code', requireAuth, requireInventoryAccess, (req: AuthedRequest, res: Response) => {
    const raw = decodeURIComponent(req.params.code || '').trim().toLowerCase();
    const { state } = getActiveState(req);
    const asset = state.assets.find(
      (a) =>
        a.assetCode.toLowerCase() === raw ||
        a.qrPayload.toLowerCase() === raw ||
        a.serialNumber.toLowerCase() === raw ||
        a.id.toLowerCase() === raw,
    );
    if (asset) {
      const loc = state.locations.find((l) => l.id === asset.currentLocationId);
      const tickets = state.maintenanceTickets.filter((t) => t.assetId === asset.id);
      const valuation = computeAssetBookValue(asset, todayIso());
      res.json({ found: true, kind: 'fixed_asset', asset, location: loc, tickets, valuation });
      return;
    }
    const item = state.consumables.find(
      (c) => c.sku.toLowerCase() === raw || c.id.toLowerCase() === raw,
    );
    if (item) {
      const loc = state.locations.find((l) => l.id === item.primaryLocationId);
      res.json({ found: true, kind: 'consumable', item, location: loc });
      return;
    }
    res.status(404).json({ found: false, error: `No asset or SKU matched QR code "${req.params.code}".` });
  });

  // 7. Student Books & Stationery Distribution (with strict duplicate distribution prevention!)
  app.post('/api/inventory/books/distribute', requireAuth, requireStockManager, (req: AuthedRequest, res: Response) => {
    const {
      studentId,
      itemId,
      quantity = 1,
      session = '2026-27',
      isReplacement = false,
      replacementReason,
      feeLinkedAmountInr = 0,
    } = (req.body || {}) as {
      studentId?: string;
      itemId?: string;
      quantity?: number;
      session?: string;
      isReplacement?: boolean;
      replacementReason?: string;
      feeLinkedAmountInr?: number;
    };
    const { db, schoolId, state } = getActiveState(req);
    const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
    const item = state.consumables.find((c) => c.id === itemId);
    if (!student || !item) {
      res.status(404).json({ error: 'Student or book/stationery item not found in active school.' });
      return;
    }

    // Prevent duplicate distribution to same student in same session unless authorized replacement!
    const existing = state.bookDistributions.find(
      (d) =>
        d.studentId === student.id &&
        d.itemId === item.id &&
        d.session === session &&
        d.status !== 'Returned',
    );
    if (existing && !isReplacement) {
      res.status(409).json({
        error: `Duplicate distribution blocked: ${student.name} already received ${item.name} for session ${session}. Record an authorized replacement if lost/damaged.`,
      });
      return;
    }
    if (isReplacement && !canApproveProcurementOrDisposal(req.user!.role)) {
      res.status(403).json({ error: 'Replacement book distribution requires leadership authorization.' });
      return;
    }

    const validation = validateStockLedgerTransaction({
      state,
      itemId: item.id,
      txType: 'ISSUE',
      quantity,
      locationId: item.primaryLocationId,
    });
    if (!validation.ok) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const dist: BookDistributionRecord = {
      id: `${schoolId}-bd-${Date.now().toString(36)}`,
      schoolId,
      session,
      studentId: student.id,
      studentName: student.name,
      classSection: student.classSection,
      itemId: item.id,
      itemName: item.name,
      quantityIssued: quantity,
      quantityRequired: quantity,
      status: isReplacement ? 'Replacement Issued' : 'Distributed',
      isReplacement,
      replacementAuthorizedBy: isReplacement ? req.user!.name : null,
      replacementReason: isReplacement ? replacementReason?.trim() || 'Authorized replacement' : null,
      distributedDate: todayIso(),
      distributedBy: req.user!.name,
      feeLinkedAmountInr: Math.max(0, Number(feeLinkedAmountInr) || quantity * item.averagePurchasePriceInr),
    };
    state.bookDistributions.unshift(dist);

    state.ledger.unshift({
      id: `${schoolId}-tx-bd-${Date.now().toString(36)}`,
      schoolId,
      timestamp: new Date().toISOString(),
      itemId: item.id,
      itemName: item.name,
      txType: 'ISSUE',
      quantity,
      signedDelta: -quantity,
      unit: item.unit,
      unitCostInr: item.averagePurchasePriceInr,
      totalValueInr: quantity * item.averagePurchasePriceInr,
      locationId: item.primaryLocationId,
      referenceType: 'BOOK_DIST',
      referenceId: dist.id,
      recipientType: 'Student',
      recipientName: `${student.name} (Class ${student.classSection})`,
      purpose: isReplacement
        ? `Authorized book replacement: ${dist.replacementReason}`
        : `Academic session ${session} student distribution`,
      actorId: req.user!.id,
      actorName: req.user!.name,
      approvedBy: isReplacement ? req.user!.name : null,
      receiverAcknowledged: true,
    });

    state.consumables = reconcileAllConsumables(state);
    state.updatedAt = new Date().toISOString();
    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: isReplacement ? 'BOOK_REPLACEMENT_ISSUED' : 'BOOK_DISTRIBUTED',
      entityType: 'BookDistribution',
      entityId: dist.id,
      detail: `Issued ${quantity} ${item.unit} of ${item.name} to ${student.name} (${student.classSection})`,
    });
    saveDb(undefined, { schoolId });
    res.status(201).json({ distribution: dist });
  });

  // 8. Staff Resource Request & Approval Portal
  app.post('/api/inventory/requests', requireAuth, requireInventoryAccess, (req: AuthedRequest, res: Response) => {
    const { itemId, quantity, locationId, purpose, urgency = 'Normal', department } = (req.body || {}) as {
      itemId?: string;
      quantity?: number;
      locationId?: string;
      purpose?: string;
      urgency?: InventoryResourceRequest['urgency'];
      department?: string;
    };
    const { schoolId, state } = getActiveState(req);
    const item = state.consumables.find((c) => c.id === itemId);
    if (!item || !quantity || quantity <= 0) {
      res.status(400).json({ error: 'Valid item and positive quantity are required.' });
      return;
    }
    const reqRec: InventoryResourceRequest = {
      id: `${schoolId}-req-${Date.now().toString(36)}`,
      schoolId,
      requestNo: `REQ-${new Date().getFullYear()}-${String(state.resourceRequests.length + 201)}`,
      requesterId: req.user!.id,
      requesterName: req.user!.name,
      requesterRole: req.user!.role,
      department: department?.trim() || item.department,
      locationId: locationId || item.primaryLocationId,
      itemId: item.id,
      itemName: item.name,
      quantity,
      unit: item.unit,
      purpose: purpose?.trim() || 'Classroom / department operational requirement',
      urgency,
      createdAt: todayIso(),
      availableAtRequest: item.availableStock,
      status: 'Pending',
    };
    state.resourceRequests.unshift(reqRec);
    state.updatedAt = new Date().toISOString();
    saveDb(undefined, { schoolId });
    res.status(201).json({ request: reqRec });
  });

  app.patch('/api/inventory/requests/:id', requireAuth, requireStockManager, (req: AuthedRequest, res: Response) => {
    const { action } = (req.body || {}) as { action?: 'approve_issue' | 'reject' };
    const { schoolId, state } = getActiveState(req);
    const reqRec = state.resourceRequests.find((r) => r.id === req.params.id);
    if (!reqRec) {
      res.status(404).json({ error: 'Resource request not found.' });
      return;
    }
    if (action === 'reject') {
      reqRec.status = 'Rejected';
      reqRec.approvedBy = req.user!.name;
      saveDb(undefined, { schoolId });
      res.json({ request: reqRec });
      return;
    }
    const item = state.consumables.find((c) => c.id === reqRec.itemId);
    if (!item) {
      res.status(404).json({ error: 'Requested item no longer exists.' });
      return;
    }
    const check = validateStockLedgerTransaction({
      state,
      itemId: item.id,
      txType: 'ISSUE',
      quantity: reqRec.quantity,
      locationId: item.primaryLocationId,
      idempotencyKey: `req-issue-${reqRec.id}`,
    });
    if (!check.ok) {
      reqRec.status = 'Procurement Triggered';
      saveDb(undefined, { schoolId });
      res.status(409).json({
        error: `${check.error} Marked request as "Procurement Triggered".`,
        request: reqRec,
      });
      return;
    }
    state.ledger.unshift({
      id: `${schoolId}-tx-req-${Date.now().toString(36)}`,
      schoolId,
      idempotencyKey: `req-issue-${reqRec.id}`,
      timestamp: new Date().toISOString(),
      itemId: item.id,
      itemName: item.name,
      txType: 'ISSUE',
      quantity: reqRec.quantity,
      signedDelta: -reqRec.quantity,
      unit: item.unit,
      unitCostInr: item.averagePurchasePriceInr,
      totalValueInr: reqRec.quantity * item.averagePurchasePriceInr,
      locationId: item.primaryLocationId,
      referenceType: 'REQUEST',
      referenceId: reqRec.id,
      recipientType: 'Department',
      recipientName: reqRec.requesterName,
      purpose: reqRec.purpose,
      actorId: req.user!.id,
      actorName: req.user!.name,
      approvedBy: req.user!.name,
      receiverAcknowledged: true,
    });
    reqRec.status = 'Issued';
    reqRec.approvedBy = req.user!.name;
    reqRec.receiverConfirmedAt = new Date().toISOString();
    state.consumables = reconcileAllConsumables(state);
    saveDb(undefined, { schoolId });
    res.json({ request: reqRec });
  });

  // 9. Procurement: Purchase Requests (with Mandatory Internal Stock & Transfer Check) + Approval -> PO + Idempotent Partial/Full GRN
  app.post('/api/inventory/procurement/requests', requireAuth, requireInventoryAccess, (req: AuthedRequest, res: Response) => {
    const body = (req.body || {}) as {
      itemName?: string;
      itemId?: string | null;
      itemType?: 'consumable' | 'fixed_asset';
      categoryId?: string;
      department?: string;
      quantity?: number;
      unit?: PurchaseRequest['unit'];
      estimatedUnitCostInr?: number;
      urgency?: PurchaseRequest['urgency'];
      purpose?: string;
      vendorId?: string;
    };
    if (!body.itemName?.trim() || !body.quantity || body.quantity <= 0) {
      res.status(400).json({ error: 'Item name and positive quantity are required.' });
      return;
    }
    const { schoolId, state } = getActiveState(req);
    const catId = body.categoryId || state.categories[0]!.id;
    const precheck = checkProcurementInternalAvailability({
      state,
      itemName: body.itemName.trim(),
      categoryId: catId,
      requestedQty: body.quantity,
    });

    const unitCost = Math.max(1, Number(body.estimatedUnitCostInr) || 100);
    const vendor = state.vendors.find((v) => v.id === body.vendorId) || state.vendors[0];

    const pr: PurchaseRequest = {
      id: `${schoolId}-pr-${Date.now().toString(36)}`,
      schoolId,
      requestNo: `PR-${new Date().getFullYear()}-${String(state.purchaseRequests.length + 16).padStart(3, '0')}`,
      department: body.department?.trim() || 'Administration',
      requestedBy: req.user!.name,
      requestedByRole: req.user!.role,
      createdAt: todayIso(),
      itemType: body.itemType || 'consumable',
      itemId: body.itemId || null,
      itemName: body.itemName.trim(),
      categoryId: catId,
      quantity: body.quantity,
      unit: body.unit || 'pcs',
      estimatedUnitCostInr: unitCost,
      estimatedTotalInr: Math.round(body.quantity * unitCost),
      urgency: body.urgency || 'Normal',
      purpose: body.purpose?.trim() || precheck.recommendationNote,
      budgetCode: 'BUD-SCHOOL-2026',
      budgetVerified: true,
      existingStockAvailable: precheck.existingStockAvailable,
      internalTransferCandidate: precheck.internalTransferCandidate,
      quotations: vendor
        ? [
            {
              id: `q-${Date.now().toString(36)}`,
              vendorId: vendor.id,
              vendorName: vendor.name,
              unitPriceInr: unitCost,
              gstPct: 12,
              deliveryDays: vendor.avgLeadTimeDays,
              validUntil: addDaysIso(todayIso(), 15),
              selected: true,
            },
          ]
        : [],
      status: 'Pending Approval',
    };
    state.purchaseRequests.unshift(pr);
    state.updatedAt = new Date().toISOString();
    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: 'PURCHASE_REQUEST_CREATED',
      entityType: 'PurchaseRequest',
      entityId: pr.id,
      detail: `Created ${pr.requestNo} for ${pr.quantity} ${pr.unit} of ${pr.itemName} (₹${pr.estimatedTotalInr})`,
    });
    saveDb(undefined, { schoolId });
    res.status(201).json({ purchaseRequest: pr, precheck });
  });

  app.post('/api/inventory/procurement/requests/:id/approve', requireAuth, requireLeadershipApproval, (req: AuthedRequest, res: Response) => {
    const { decision = 'approve', vendorId, approvalNote } = (req.body || {}) as {
      decision?: 'approve' | 'reject' | 'transfer_instead';
      vendorId?: string;
      approvalNote?: string;
    };
    const { schoolId, state } = getActiveState(req);
    const pr = state.purchaseRequests.find((p) => p.id === req.params.id);
    if (!pr) {
      res.status(404).json({ error: 'Purchase request not found.' });
      return;
    }
    if (decision === 'reject') {
      pr.status = 'Rejected';
      pr.approvedBy = req.user!.name;
      pr.approvedAt = todayIso();
      pr.approvalNote = approvalNote?.trim() || 'Rejected by management';
      saveDb(undefined, { schoolId });
      res.json({ purchaseRequest: pr });
      return;
    }
    if (decision === 'transfer_instead') {
      pr.status = 'Fulfilled via Transfer';
      pr.approvedBy = req.user!.name;
      pr.approvedAt = todayIso();
      pr.approvalNote = approvalNote?.trim() || 'Fulfilled via internal stock/asset transfer instead of purchase';
      saveDb(undefined, { schoolId });
      res.json({ purchaseRequest: pr });
      return;
    }

    const chosenQuote =
      pr.quotations.find((q) => q.vendorId === vendorId) ||
      pr.quotations.find((q) => q.selected) ||
      pr.quotations[0];
    const vendor =
      state.vendors.find((v) => v.id === (chosenQuote?.vendorId || vendorId)) || state.vendors[0]!;
    const unitPrice = chosenQuote?.unitPriceInr || pr.estimatedUnitCostInr;
    const gstPct = chosenQuote?.gstPct ?? 12;
    const subtotal = Math.round(pr.quantity * unitPrice);
    const gstTotal = Math.round((subtotal * gstPct) / 100);

    const po: PurchaseOrder = {
      id: `${schoolId}-po-${Date.now().toString(36)}`,
      schoolId,
      poNo: `PO-${new Date().getFullYear()}-${String(state.purchaseOrders.length + 89).padStart(3, '0')}`,
      purchaseRequestId: pr.id,
      vendorId: vendor.id,
      vendorName: vendor.name,
      department: pr.department,
      createdAt: todayIso(),
      expectedDeliveryDate: addDaysIso(todayIso(), chosenQuote?.deliveryDays || vendor.avgLeadTimeDays || 7),
      approvedBy: req.user!.name,
      status: 'Issued',
      lines: [
        {
          itemId: pr.itemId,
          itemName: pr.itemName,
          categoryId: pr.categoryId,
          unit: pr.unit,
          orderedQty: pr.quantity,
          receivedQty: 0,
          damagedQty: 0,
          unitPriceInr: unitPrice,
          gstPct,
          lineTotalInr: subtotal,
        },
      ],
      subtotalInr: subtotal,
      gstTotalInr: gstTotal,
      grandTotalInr: subtotal + gstTotal,
      paymentStatus: 'Unpaid',
      grns: [],
    };

    pr.status = 'Converted to PO';
    pr.approvedBy = req.user!.name;
    pr.approvedAt = todayIso();
    pr.approvalNote = approvalNote?.trim() || `Approved and converted to ${po.poNo}`;
    pr.linkedPoId = po.id;
    state.purchaseOrders.unshift(po);
    state.updatedAt = new Date().toISOString();

    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: 'PURCHASE_ORDER_APPROVED',
      entityType: 'PurchaseOrder',
      entityId: po.id,
      detail: `Approved ${pr.requestNo} → issued ${po.poNo} to ${po.vendorName} (₹${po.grandTotalInr})`,
    });
    saveDb(undefined, { schoolId });
    res.json({ purchaseRequest: pr, purchaseOrder: po });
  });

  app.post('/api/inventory/procurement/orders/:id/grn', requireAuth, requireStockManager, (req: AuthedRequest, res: Response) => {
    const {
      idempotencyKey,
      invoiceNo,
      acceptedQty,
      damagedQty = 0,
      locationId,
      batchNo,
      expiryDate,
      notes,
    } = (req.body || {}) as {
      idempotencyKey?: string;
      invoiceNo?: string;
      acceptedQty?: number;
      damagedQty?: number;
      locationId?: string;
      batchNo?: string;
      expiryDate?: string | null;
      notes?: string;
    };

    const { schoolId, state } = getActiveState(req);
    const po = state.purchaseOrders.find((p) => p.id === req.params.id);
    if (!po) {
      res.status(404).json({ error: 'Purchase Order not found.' });
      return;
    }

    const cleanKey = idempotencyKey?.trim() || `grn-${po.id}-${invoiceNo?.trim() || Date.now()}`;
    if (po.grns.some((g) => g.idempotencyKey === cleanKey)) {
      res.status(409).json({ error: `Duplicate Goods Receipt blocked (key "${cleanKey}" already recorded).` });
      return;
    }

    const line = po.lines[0];
    if (!line) {
      res.status(400).json({ error: 'Purchase Order has no line items.' });
      return;
    }
    const remainingToReceive = Math.max(0, line.orderedQty - line.receivedQty);
    const acc = Math.max(0, Number(acceptedQty) || 0);
    const dmg = Math.max(0, Number(damagedQty) || 0);
    if (acc + dmg <= 0) {
      res.status(400).json({ error: 'Accepted or damaged quantity must be greater than 0.' });
      return;
    }
    if (acc + dmg > remainingToReceive) {
      res.status(400).json({
        error: `Cannot receive ${acc + dmg} units; only ${remainingToReceive} remaining on ${po.poNo}.`,
      });
      return;
    }

    const targetLocId = locationId || state.locations[0]!.id;
    const grn: GoodsReceiptNote = {
      id: `${schoolId}-grn-${Date.now().toString(36)}`,
      grnNo: `GRN-${new Date().getFullYear()}-${String(po.grns.length + 102)}`,
      idempotencyKey: cleanKey,
      receivedDate: todayIso(),
      receivedBy: req.user!.name,
      invoiceNo: invoiceNo?.trim() || `INV-${Date.now().toString(36).toUpperCase()}`,
      invoiceVerified: true,
      qualityStatus: dmg > 0 ? 'Partial Damage' : 'Passed',
      locationId: targetLocId,
      lines: [
        {
          itemId: line.itemId,
          itemName: line.itemName,
          acceptedQty: acc,
          damagedQty: dmg,
          batchNo: batchNo?.trim() || `BCH-${po.poNo}`,
          expiryDate: expiryDate || null,
        },
      ],
      notes: notes?.trim(),
    };

    line.receivedQty += acc;
    line.damagedQty += dmg;
    po.grns.unshift(grn);
    po.status = line.receivedQty + line.damagedQty >= line.orderedQty ? 'Delivered' : 'Partially Delivered';

    // Post verified accepted units straight into the immutable stock ledger!
    if (acc > 0 && line.itemId) {
      const item = state.consumables.find((c) => c.id === line.itemId);
      if (item) {
        state.ledger.unshift({
          id: `${schoolId}-tx-grn-${Date.now().toString(36)}`,
          schoolId,
          idempotencyKey: `ledger-${cleanKey}`,
          timestamp: new Date().toISOString(),
          itemId: item.id,
          itemName: item.name,
          txType: 'PURCHASE_RECEIPT',
          quantity: acc,
          signedDelta: acc,
          unit: item.unit,
          unitCostInr: line.unitPriceInr,
          totalValueInr: Math.round(acc * line.unitPriceInr),
          locationId: targetLocId,
          batchNo: grn.lines[0]!.batchNo,
          expiryDate: expiryDate || null,
          referenceType: 'GRN',
          referenceId: grn.grnNo,
          purpose: `GRN ${grn.grnNo} against ${po.poNo} (Invoice ${grn.invoiceNo})`,
          actorId: req.user!.id,
          actorName: req.user!.name,
          approvedBy: po.approvedBy,
        });
        item.batches.push({
          id: `${schoolId}-b-${Date.now().toString(36)}`,
          itemId: item.id,
          batchNo: grn.lines[0]!.batchNo || `BCH-${po.poNo}`,
          locationId: targetLocId,
          receivedDate: todayIso(),
          expiryDate: expiryDate || null,
          quantityReceived: acc,
          quantityRemaining: acc,
          unitCostInr: line.unitPriceInr,
          gstPct: line.gstPct,
          vendorId: po.vendorId,
          invoiceNo: grn.invoiceNo,
        });
        state.consumables = reconcileAllConsumables(state);
      }
    }

    state.updatedAt = new Date().toISOString();
    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: 'GOODS_RECEIPT_POSTED',
      entityType: 'PurchaseOrder',
      entityId: po.id,
      detail: `Posted ${grn.grnNo} on ${po.poNo}: accepted ${acc}, damaged ${dmg} (${po.status})`,
    });
    saveDb(undefined, { schoolId });
    res.status(201).json({ purchaseOrder: po, grn });
  });

  // 10. Physical Stock Audit & Management-Approved Immutable Reconciliation
  app.post('/api/inventory/audits', requireAuth, requireInventoryAccess, (req: AuthedRequest, res: Response) => {
    const { auditType = 'Monthly', scopeLabel = 'School Store', lines = [] } = (req.body || {}) as {
      auditType?: StockAuditSession['auditType'];
      scopeLabel?: string;
      lines?: Array<{
        targetId: string;
        physicalQty: number;
        damagedQty?: number;
        explanation?: string;
        verifiedByQr?: boolean;
      }>;
    };
    const { schoolId, state } = getActiveState(req);
    if (!Array.isArray(lines) || lines.length === 0) {
      res.status(400).json({ error: 'At least one counted stock item line is required.' });
      return;
    }

    const builtLines = lines
      .map((l, idx) => {
        const item = state.consumables.find((c) => c.id === l.targetId);
        if (!item) return null;
        const sysQty = reconcileConsumableFromLedger(item, state.ledger).availableStock;
        const physQty = Math.max(0, Number(l.physicalQty) || 0);
        const dmgQty = Math.max(0, Number(l.damagedQty) || 0);
        return {
          id: `al-${Date.now().toString(36)}-${idx}`,
          targetType: 'consumable' as const,
          targetId: item.id,
          targetName: item.name,
          locationId: item.primaryLocationId,
          systemQty: sysQty,
          physicalQty: physQty,
          damagedQty: dmgQty,
          variance: physQty - sysQty,
          explanation: l.explanation?.trim() || '',
          verifiedByQr: Boolean(l.verifiedByQr),
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    const totalMissingUnits = builtLines
      .filter((l) => l.variance < 0)
      .reduce((s, l) => s + Math.abs(l.variance), 0);
    const totalExcessUnits = builtLines
      .filter((l) => l.variance > 0)
      .reduce((s, l) => s + l.variance, 0);
    const totalDamagedUnits = builtLines.reduce((s, l) => s + l.damagedQty, 0);

    const audit: StockAuditSession = {
      id: `${schoolId}-aud-${Date.now().toString(36)}`,
      schoolId,
      auditCode: `AUD-${new Date().getFullYear()}-${String(state.audits.length + 10)}`,
      auditType,
      scopeLabel: scopeLabel.trim(),
      auditorName: req.user!.name,
      auditDate: todayIso(),
      status: 'Pending Approval',
      lines: builtLines,
      totalMissingUnits,
      totalExcessUnits,
      totalDamagedUnits,
    };

    state.audits.unshift(audit);
    state.updatedAt = new Date().toISOString();
    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: 'STOCK_AUDIT_SUBMITTED',
      entityType: 'StockAuditSession',
      entityId: audit.id,
      detail: `Submitted ${audit.auditCode} (${scopeLabel}): missing ${totalMissingUnits}, excess ${totalExcessUnits}, damaged ${totalDamagedUnits}`,
    });
    saveDb(undefined, { schoolId });
    res.status(201).json({ audit });
  });

  app.post('/api/inventory/audits/:id/approve', requireAuth, requireLeadershipApproval, (req: AuthedRequest, res: Response) => {
    const { schoolId, state } = getActiveState(req);
    const audit = state.audits.find((a) => a.id === req.params.id);
    if (!audit) {
      res.status(404).json({ error: 'Audit session not found.' });
      return;
    }
    if (audit.status === 'Approved & Reconciled') {
      res.status(409).json({ error: 'Audit session is already approved and reconciled.' });
      return;
    }

    // Never silently edit stock: post immutable AUDIT_ADJUSTMENT ledger entries for every variance!
    for (const line of audit.lines) {
      if (line.variance === 0) continue;
      const item = state.consumables.find((c) => c.id === line.targetId);
      if (!item) continue;
      const txType: StockTransactionType =
        line.variance > 0 ? 'AUDIT_ADJUSTMENT_PLUS' : 'AUDIT_ADJUSTMENT_MINUS';
      const qty = Math.abs(line.variance);
      state.ledger.unshift({
        id: `${schoolId}-tx-aud-${Date.now().toString(36)}-${line.id}`,
        schoolId,
        idempotencyKey: `audit-adj-${audit.id}-${line.id}`,
        timestamp: new Date().toISOString(),
        itemId: item.id,
        itemName: item.name,
        txType,
        quantity: qty,
        signedDelta: line.variance,
        unit: item.unit,
        unitCostInr: item.averagePurchasePriceInr,
        totalValueInr: Math.round(qty * item.averagePurchasePriceInr),
        locationId: line.locationId,
        referenceType: 'AUDIT',
        referenceId: audit.auditCode,
        purpose: `Approved physical audit reconciliation (${audit.auditCode}): ${line.explanation || 'Variance verified'}`,
        actorId: req.user!.id,
        actorName: req.user!.name,
        approvedBy: req.user!.name,
      });
    }

    audit.status = 'Approved & Reconciled';
    audit.approvedBy = req.user!.name;
    audit.approvedAt = todayIso();
    state.consumables = reconcileAllConsumables(state);
    state.updatedAt = new Date().toISOString();

    appendAuditLog({
      schoolId,
      actor: req.user!,
      action: 'STOCK_AUDIT_APPROVED',
      entityType: 'StockAuditSession',
      entityId: audit.id,
      detail: `Approved and reconciled ${audit.auditCode} into immutable stock ledger`,
    });
    saveDb(undefined, { schoolId });
    res.json({ audit });
  });

  // 11. Annual Academic Session Planner Assumptions Update
  app.put('/api/inventory/annual-plan/assumptions', requireAuth, requireLeadershipApproval, (req: AuthedRequest, res: Response) => {
    const { schoolId, state } = getActiveState(req);
    const patch = (req.body || {}) as Partial<SchoolInventoryState['annualAssumptions']>;
    state.annualAssumptions = {
      ...state.annualAssumptions,
      ...patch,
    };
    state.updatedAt = new Date().toISOString();
    saveDb(undefined, { schoolId });
    res.json({ annualAssumptions: state.annualAssumptions });
  });
}
