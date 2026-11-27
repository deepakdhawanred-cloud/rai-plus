import type { Express, NextFunction, Request, Response } from 'express';
import { getDb, saveDb } from './store.ts';
import type { DatabaseState } from './seedData.ts';
import type {
  AttendanceMarkingMode,
  GatePassRecord,
  GatePassStatus,
  GatePassSubjectType,
  PayrollRegisterEntry,
  StaffAttendanceRecord,
  StaffAttendanceStatus,
  StaffProfile,
  StaffRoleCategory,
  UserAccount,
  UserRole,
  VisitorCategory,
  VisitorIdProofType,
  VisitorLogRecord,
} from '../src/types.ts';
import {
  buildRoleScopedCampusAdminPayload,
  canManageCampusGateAndVisitors,
  computeStaffMonthlySalary,
  createInitialCampusAdminSeedForSchool,
  formatMonthLabel,
  getStaffSalaryAccessScope,
  mapStaffRoleCategoryToPayrollType,
  maskVisitorIdNumber,
} from '../src/utils/campusAdminEngine.ts';
import { isAttendanceModeEnabledForSchool } from '../src/utils/subscriptionEntitlements.ts';
import {
  inferBankNameFromIfsc,
  normalizeIfscCode,
  parseVisSalarySheetCsv,
} from '../src/utils/visSalaryExpenseParser.ts';
import {
  buildSalaryModificationAuditRecord,
  createSeedSalaryAuditLogsForSchool,
  hasSalaryValuesChanged,
} from '../src/utils/salaryAuditLog.ts';
import { loadVisSalarySheetProfiles } from './visFinanceSheetLoader.ts';

interface AuthedRequest extends Request {
  user?: UserAccount;
  activeSchoolId?: string | null;
}

interface RouteDeps {
  requireAuth: (req: AuthedRequest, res: Response, next: NextFunction) => void;
  requireRoles: (allowed: UserRole[]) => (req: AuthedRequest, res: Response, next: NextFunction) => void;
  appendAuditLog: (params: {
    schoolId: string | null;
    actor: UserAccount;
    action: string;
    entityType: string;
    entityId: string;
    detail: string;
  }) => void;
}

const VALID_STAFF_STATUSES: StaffAttendanceStatus[] = [
  'Present',
  'Half Day',
  'Absent',
  'Paid Leave',
  'Unpaid Leave',
];

const VALID_GATE_PASS_STATUSES: GatePassStatus[] = [
  'Pending Approval',
  'Approved',
  'Exited Campus',
  'Returned',
  'Rejected',
];

const VALID_VISITOR_CATEGORIES: VisitorCategory[] = [
  'Parent / Guardian',
  'Official / Inspector',
  'Vendor / Delivery',
  'Interview / Guest',
  'Alumni',
  'Maintenance',
];

const VALID_ID_TYPES: VisitorIdProofType[] = [
  'Aadhaar Card',
  'Driving License',
  'PAN Card',
  'Voter ID',
  'Official / Company ID',
];

export function ensureCampusAdminInitialized(db: DatabaseState, schoolId: string): boolean {
  let mutated = false;
  if (!Array.isArray(db.staffProfiles)) {
    db.staffProfiles = [];
    mutated = true;
  }
  if (!Array.isArray(db.staffAttendance)) {
    db.staffAttendance = [];
    mutated = true;
  }
  if (!Array.isArray(db.salaryAuditLogs)) {
    db.salaryAuditLogs = [];
    mutated = true;
  }
  if (!Array.isArray(db.gatePasses)) {
    db.gatePasses = [];
    mutated = true;
  }
  if (!Array.isArray(db.visitorLogs)) {
    db.visitorLogs = [];
    mutated = true;
  }

  const hasSchoolProfiles = db.staffProfiles.some((p) => p.schoolId === schoolId);
  if (!hasSchoolProfiles) {
    const seed = createInitialCampusAdminSeedForSchool({
      schoolId,
      users: db.users || [],
      students: db.students || [],
    });
    if (schoolId === 'school-vis-jjr') {
      const visBundle = loadVisSalarySheetProfiles(db.users || [], schoolId);
      if (visBundle.staffProfiles.length > 0) {
        db.staffProfiles.push(...visBundle.staffProfiles);
        db.staffAttendance.push(...visBundle.staffAttendance);
      } else {
        db.staffProfiles.push(...seed.staffProfiles);
        db.staffAttendance.push(...seed.staffAttendance);
      }
    } else {
      db.staffProfiles.push(...seed.staffProfiles);
      db.staffAttendance.push(...seed.staffAttendance);
    }
    if (!db.gatePasses.some((g) => g.schoolId === schoolId)) {
      db.gatePasses.push(...seed.gatePasses);
    }
    if (!db.visitorLogs.some((v) => v.schoolId === schoolId)) {
      db.visitorLogs.push(...seed.visitorLogs);
    }
    mutated = true;
  }

  if (!db.salaryAuditLogs.some((log) => log.schoolId === schoolId)) {
    const seededLogs = createSeedSalaryAuditLogsForSchool({
      schoolId,
      staffProfiles: db.staffProfiles,
      users: db.users || [],
    });
    if (seededLogs.length > 0) {
      db.salaryAuditLogs.push(...seededLogs);
      mutated = true;
    }
  }

  return mutated;
}

export function registerCampusAdminRoutes(app: Express, deps: RouteDeps) {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // ---------------- 1. STAFF ATTENDANCE & AUTOMATED SALARY ----------------
  app.get('/api/staff-attendance/salary-preview', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const user = req.user!;
    const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
    if (!schoolId) {
      res.status(400).json({ error: 'Active school context required.' });
      return;
    }

    const scope = getStaffSalaryAccessScope(user.role);
    if (scope === 'none') {
      res.status(403).json({
        error: 'Access denied: Staff attendance and salary records are restricted to authorized personnel.',
      });
      return;
    }

    if (ensureCampusAdminInitialized(db, schoolId)) {
      saveDb();
    }

    const rawMonth = typeof req.query.month === 'string' ? req.query.month.trim() : '';
    const monthKey = /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : '2026-11';

    const scoped = buildRoleScopedCampusAdminPayload({
      user,
      schoolId,
      visibleStudentIds: new Set<string>(),
      staffProfiles: db.staffProfiles || [],
      staffAttendance: db.staffAttendance || [],
      gatePasses: [],
      visitorLogs: [],
      payrollRegisters: db.payrollRegisters || [],
      salaryAuditLogs: db.salaryAuditLogs || [],
      monthKey,
    });

    res.json({
      monthKey,
      monthLabel: formatMonthLabel(monthKey),
      accessScope: scoped.staffSalaryAccessScope,
      staffProfiles: scoped.staffProfiles,
      staffAttendance: scoped.staffAttendance,
      salarySummaries: scoped.staffSalarySummaries,
      salaryAuditLogs: scoped.salaryAuditLogs,
    });
  });

  app.get(
    '/api/staff-salary/audit-logs',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }
      if (ensureCampusAdminInitialized(db, schoolId)) {
        saveDb();
      }
      const logs = (db.salaryAuditLogs || [])
        .filter((entry) => entry.schoolId === schoolId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      res.json({ auditLogs: logs });
    },
  );

  app.post(
    '/api/staff-attendance/batch',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const activeSchool = db.schools.find((s) => s.id === schoolId);
      const { date, markingMode, entries } = req.body as {
        date?: string;
        markingMode?: AttendanceMarkingMode;
        entries?: Array<{
          staffId: string;
          status: StaffAttendanceStatus;
          checkInTime?: string;
          checkOutTime?: string;
          remarks?: string;
        }>;
      };

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
        res.status(400).json({ error: 'A valid attendance date (YYYY-MM-DD) is required.' });
        return;
      }
      if (!Array.isArray(entries) || entries.length === 0) {
        res.status(400).json({ error: 'At least one staff attendance entry is required.' });
        return;
      }

      const resolvedMode: AttendanceMarkingMode =
        markingMode === 'rfid' || markingMode === 'biometric' ? markingMode : 'manual';

      if (!isAttendanceModeEnabledForSchool(activeSchool, resolvedMode)) {
        res.status(403).json({
          error: `${resolvedMode.toUpperCase()} attendance is not enabled on ${activeSchool?.name || 'this school'}'s current plan.`,
        });
        return;
      }

      ensureCampusAdminInitialized(db, schoolId);

      const schoolStaffIds = new Set(
        (db.staffProfiles || []).filter((p) => p.schoolId === schoolId).map((p) => p.id),
      );
      const nowIso = new Date().toISOString();
      let updatedCount = 0;

      for (const item of entries) {
        if (!item.staffId || !schoolStaffIds.has(item.staffId)) continue;
        if (!VALID_STAFF_STATUSES.includes(item.status)) continue;

        const recordId = `satt-${item.staffId}-${date.trim()}`;
        const existingIdx = (db.staffAttendance || []).findIndex((r) => r.id === recordId);
        const nextRec: StaffAttendanceRecord = {
          id: recordId,
          schoolId,
          staffId: item.staffId,
          date: date.trim(),
          status: item.status,
          checkInTime: item.checkInTime?.trim() || undefined,
          checkOutTime: item.checkOutTime?.trim() || undefined,
          markingMode: resolvedMode,
          markedBy: user.name,
          remarks: item.remarks?.trim() || undefined,
          updatedAt: nowIso,
        };

        if (existingIdx >= 0) {
          db.staffAttendance![existingIdx] = nextRec;
        } else {
          db.staffAttendance!.unshift(nextRec);
        }
        updatedCount += 1;
      }

      if (updatedCount === 0) {
        res.status(400).json({ error: 'No valid staff members found for this school.' });
        return;
      }

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'MARKED_STAFF_ATTENDANCE',
        entityType: 'StaffAttendance',
        entityId: `${schoolId}-${date.trim()}`,
        detail: `Marked ${updatedCount} staff attendance entries for ${date.trim()} (${resolvedMode} mode).`,
      });
      saveDb();

      const monthKey = date.trim().slice(0, 7);
      const schoolProfiles = (db.staffProfiles || []).filter((p) => p.schoolId === schoolId);
      const schoolAtt = (db.staffAttendance || []).filter((a) => a.schoolId === schoolId);
      const salarySummaries = schoolProfiles.map((profile) =>
        computeStaffMonthlySalary({
          profile,
          attendanceRecords: schoolAtt,
          monthKey,
          payrollRegisters: db.payrollRegisters || [],
        }),
      );

      res.json({ ok: true, updatedCount, monthKey, salarySummaries });
    },
  );

  app.post(
    '/api/staff-profiles',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const body = req.body as Partial<StaffProfile>;
      if (!body.name?.trim() || !body.designation?.trim()) {
        res.status(400).json({ error: 'Staff name and designation are required.' });
        return;
      }

      const baseSalary = Number(body.baseMonthlySalaryInr);
      const fixedAllowance = Number(body.fixedAllowanceInr ?? 0);
      const pfDeduction = Number(body.pfOrDeductionInr ?? 0);
      const workingDays = Number(body.workingDaysPerMonth ?? 26);
      const paidLeaves = Number(body.paidLeaveAllowance ?? 2);

      if (
        !Number.isFinite(baseSalary) ||
        baseSalary < 0 ||
        !Number.isFinite(fixedAllowance) ||
        fixedAllowance < 0 ||
        !Number.isFinite(pfDeduction) ||
        pfDeduction < 0 ||
        !Number.isFinite(workingDays) ||
        workingDays < 1 ||
        workingDays > 31
      ) {
        res.status(400).json({ error: 'Please provide valid non-negative salary and working day values.' });
        return;
      }

      ensureCampusAdminInitialized(db, schoolId);

      const validRoleTypes: StaffRoleCategory[] = [
        'Teacher',
        'Admin & Coordinator',
        'Driver',
        'Support Staff',
        'Specialist',
      ];
      const roleType: StaffRoleCategory = validRoleTypes.includes(body.roleType as StaffRoleCategory)
        ? (body.roleType as StaffRoleCategory)
        : 'Teacher';

      const existingIdx = body.id
        ? (db.staffProfiles || []).findIndex((p) => p.id === body.id && p.schoolId === schoolId)
        : -1;

      const normalizedBankAcc = body.bankAccountNumber?.trim().replace(/\s+/g, '') || undefined;
      const ifscInfo = normalizeIfscCode(body.ifscCode);
      const resolvedIfsc = ifscInfo.code || undefined;
      const resolvedBankName =
        body.bankName?.trim() || (resolvedIfsc ? inferBankNameFromIfsc(resolvedIfsc) : undefined);
      const resolvedBankNote =
        !normalizedBankAcc || !resolvedIfsc
          ? 'Bank account / IFSC pending'
          : ifscInfo.warning || undefined;

      let savedProfile: StaffProfile;
      let previousSnapshot: {
        baseMonthlySalaryInr: number;
        fixedAllowanceInr: number;
        pfOrDeductionInr: number;
      } | null = null;

      if (existingIdx >= 0) {
        const existing = db.staffProfiles![existingIdx];
        previousSnapshot = {
          baseMonthlySalaryInr: existing.baseMonthlySalaryInr,
          fixedAllowanceInr: existing.fixedAllowanceInr,
          pfOrDeductionInr: existing.pfOrDeductionInr,
        };
        savedProfile = {
          ...existing,
          name: body.name.trim(),
          designation: body.designation.trim(),
          department: body.department?.trim() || existing.department,
          roleType,
          phone: body.phone?.trim() || existing.phone,
          bankAccountNumber:
            body.bankAccountNumber !== undefined ? normalizedBankAcc : existing.bankAccountNumber,
          ifscCode: body.ifscCode !== undefined ? resolvedIfsc : existing.ifscCode,
          bankName:
            body.bankName !== undefined || body.ifscCode !== undefined
              ? resolvedBankName
              : existing.bankName,
          bankNote:
            body.bankAccountNumber !== undefined || body.ifscCode !== undefined
              ? resolvedBankNote
              : existing.bankNote,
          baseMonthlySalaryInr: Math.round(baseSalary),
          fixedAllowanceInr: Math.round(fixedAllowance),
          pfOrDeductionInr: Math.round(pfDeduction),
          workingDaysPerMonth: Math.round(workingDays),
          paidLeaveAllowance: Math.max(0, Math.round(paidLeaves)),
        };
        db.staffProfiles![existingIdx] = savedProfile;
      } else {
        const schoolCount = (db.staffProfiles || []).filter((p) => p.schoolId === schoolId).length;
        const prefix = schoolId.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase();
        savedProfile = {
          id: `stf-${schoolId}-${Date.now()}`,
          schoolId,
          srNo: schoolCount + 1,
          employeeCode: body.employeeCode?.trim() || `EMP-${prefix}-${300 + schoolCount}`,
          name: body.name.trim(),
          roleType,
          designation: body.designation.trim(),
          department: body.department?.trim() || 'General Staff',
          phone: body.phone?.trim() || undefined,
          bankAccountNumber: normalizedBankAcc,
          ifscCode: resolvedIfsc,
          bankName: resolvedBankName,
          bankNote: resolvedBankNote,
          sheetSource: 'manual',
          baseMonthlySalaryInr: Math.round(baseSalary),
          fixedAllowanceInr: Math.round(fixedAllowance),
          pfOrDeductionInr: Math.round(pfDeduction),
          workingDaysPerMonth: Math.round(workingDays),
          paidLeaveAllowance: Math.max(0, Math.round(paidLeaves)),
          active: true,
        };
        db.staffProfiles!.push(savedProfile);
      }

      if (
        !previousSnapshot ||
        hasSalaryValuesChanged(previousSnapshot, {
          baseMonthlySalaryInr: savedProfile.baseMonthlySalaryInr,
          fixedAllowanceInr: savedProfile.fixedAllowanceInr,
          pfOrDeductionInr: savedProfile.pfOrDeductionInr,
        })
      ) {
        if (!Array.isArray(db.salaryAuditLogs)) db.salaryAuditLogs = [];
        db.salaryAuditLogs.unshift(
          buildSalaryModificationAuditRecord({
            schoolId,
            actor: user,
            staffId: savedProfile.id,
            employeeCode: savedProfile.employeeCode,
            staffName: savedProfile.name,
            designation: savedProfile.designation,
            actionType: previousSnapshot ? 'SALARY_UPDATED' : 'PROFILE_CREATED',
            previousBaseSalaryInr: previousSnapshot ? previousSnapshot.baseMonthlySalaryInr : null,
            newBaseSalaryInr: savedProfile.baseMonthlySalaryInr,
            previousAllowanceInr: previousSnapshot ? previousSnapshot.fixedAllowanceInr : null,
            newAllowanceInr: savedProfile.fixedAllowanceInr,
            previousDeductionInr: previousSnapshot ? previousSnapshot.pfOrDeductionInr : null,
            newDeductionInr: savedProfile.pfOrDeductionInr,
            sourceLabel: 'Salary Structure Editor',
            note: (body as { revisionNote?: string }).revisionNote?.trim() || undefined,
          }),
        );
      }

      appendAuditLog({
        schoolId,
        actor: user,
        action: existingIdx >= 0 ? 'UPDATED_STAFF_SALARY_PROFILE' : 'ADDED_STAFF_SALARY_PROFILE',
        entityType: 'StaffProfile',
        entityId: savedProfile.id,
        detail: `Configured salary profile for ${savedProfile.name} (${savedProfile.designation}) — Base ₹${savedProfile.baseMonthlySalaryInr.toLocaleString('en-IN')}${savedProfile.bankAccountNumber ? ` · A/C ${savedProfile.bankAccountNumber}` : ''}.`,
      });
      saveDb();

      res.status(existingIdx >= 0 ? 200 : 201).json({ ok: true, profile: savedProfile });
    },
  );

  app.post(
    '/api/staff-profiles/import-sheet',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const { csvText } = (req.body || {}) as { csvText?: string };
      if (!csvText?.trim()) {
        res.status(400).json({ error: 'CSV content is required to import staff salary sheet.' });
        return;
      }

      ensureCampusAdminInitialized(db, schoolId);
      const parsed = parseVisSalarySheetCsv(csvText);
      if (parsed.staffRows.length === 0) {
        res.status(400).json({
          error: 'No staff rows found. Expected columns like Sr.No., NAME, ACCOUNT NO., IFSC CODE (and optional Salary columns).',
        });
        return;
      }

      const hasSalaryCol = /basic|salary|gross/i.test(csvText.split(/\r?\n/).slice(0, 12).join(' '));
      let createdCount = 0;
      let updatedCount = 0;

      for (const row of parsed.staffRows) {
        const existingIdx = (db.staffProfiles || []).findIndex(
          (p) =>
            p.schoolId === schoolId &&
            (p.name.trim().toLowerCase() === row.normalizedKey ||
              (row.bankAccountNumber && p.bankAccountNumber === row.bankAccountNumber)),
        );

        if (existingIdx >= 0) {
          const existing = db.staffProfiles![existingIdx];
          const updatedProfile: StaffProfile = {
            ...existing,
            srNo: row.srNo || existing.srNo,
            name: row.name,
            bankAccountNumber: row.bankAccountNumber || existing.bankAccountNumber,
            ifscCode: row.ifscCode || existing.ifscCode,
            bankName: row.ifscCode ? row.bankName : existing.bankName,
            bankNote: row.bankNote,
            sheetSource: 'csv_import',
            ...(hasSalaryCol
              ? {
                  baseMonthlySalaryInr: row.baseMonthlySalaryInr,
                  fixedAllowanceInr: row.fixedAllowanceInr,
                  pfOrDeductionInr: row.pfOrDeductionInr,
                }
              : {}),
          };
          db.staffProfiles![existingIdx] = updatedProfile;
          if (
            hasSalaryCol &&
            hasSalaryValuesChanged(
              {
                baseMonthlySalaryInr: existing.baseMonthlySalaryInr,
                fixedAllowanceInr: existing.fixedAllowanceInr,
                pfOrDeductionInr: existing.pfOrDeductionInr,
              },
              {
                baseMonthlySalaryInr: updatedProfile.baseMonthlySalaryInr,
                fixedAllowanceInr: updatedProfile.fixedAllowanceInr,
                pfOrDeductionInr: updatedProfile.pfOrDeductionInr,
              },
            )
          ) {
            if (!Array.isArray(db.salaryAuditLogs)) db.salaryAuditLogs = [];
            db.salaryAuditLogs.unshift(
              buildSalaryModificationAuditRecord({
                schoolId,
                actor: user,
                staffId: updatedProfile.id,
                employeeCode: updatedProfile.employeeCode,
                staffName: updatedProfile.name,
                designation: updatedProfile.designation,
                actionType: 'CSV_SHEET_IMPORT',
                previousBaseSalaryInr: existing.baseMonthlySalaryInr,
                newBaseSalaryInr: updatedProfile.baseMonthlySalaryInr,
                previousAllowanceInr: existing.fixedAllowanceInr,
                newAllowanceInr: updatedProfile.fixedAllowanceInr,
                previousDeductionInr: existing.pfOrDeductionInr,
                newDeductionInr: updatedProfile.pfOrDeductionInr,
                sourceLabel: 'Salary Sheet CSV Import',
              }),
            );
          }
          updatedCount += 1;
        } else {
          const countNow = (db.staffProfiles || []).filter((p) => p.schoolId === schoolId).length;
          const createdProfile: StaffProfile = {
            id: `stf-${schoolId}-imp-${Date.now().toString(36)}-${countNow + 1}`,
            schoolId,
            srNo: row.srNo,
            employeeCode: `VIS-STF-${String(countNow + 1).padStart(3, '0')}`,
            name: row.name,
            roleType: row.roleType,
            designation: row.designation,
            department: row.department,
            bankAccountNumber: row.bankAccountNumber || undefined,
            ifscCode: row.ifscCode || undefined,
            bankName: row.bankName,
            bankNote: row.bankNote,
            sheetSource: 'csv_import',
            baseMonthlySalaryInr: row.baseMonthlySalaryInr,
            fixedAllowanceInr: row.fixedAllowanceInr,
            pfOrDeductionInr: row.pfOrDeductionInr,
            workingDaysPerMonth: 26,
            paidLeaveAllowance: 2,
            active: true,
          };
          db.staffProfiles!.push(createdProfile);
          if (!Array.isArray(db.salaryAuditLogs)) db.salaryAuditLogs = [];
          db.salaryAuditLogs.unshift(
            buildSalaryModificationAuditRecord({
              schoolId,
              actor: user,
              staffId: createdProfile.id,
              employeeCode: createdProfile.employeeCode,
              staffName: createdProfile.name,
              designation: createdProfile.designation,
              actionType: 'CSV_SHEET_IMPORT',
              previousBaseSalaryInr: null,
              newBaseSalaryInr: createdProfile.baseMonthlySalaryInr,
              previousAllowanceInr: null,
              newAllowanceInr: createdProfile.fixedAllowanceInr,
              previousDeductionInr: null,
              newDeductionInr: createdProfile.pfOrDeductionInr,
              sourceLabel: 'Salary Sheet CSV Import',
            }),
          );
          createdCount += 1;
        }
      }

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'IMPORTED_STAFF_SALARY_SHEET',
        entityType: 'StaffProfile',
        entityId: `sheet-${schoolId}`,
        detail: `Imported staff salary & bank sheet: ${createdCount} added, ${updatedCount} updated (${parsed.duplicatesRemoved.length} duplicate row skipped).`,
      });
      saveDb();

      res.json({
        ok: true,
        createdCount,
        updatedCount,
        totalImported: parsed.staffRows.length,
        duplicatesRemoved: parsed.duplicatesRemoved,
        missingBankNames: parsed.missingBankNames,
        ifscWarnings: parsed.ifscWarnings,
      });
    },
  );

  app.post(
    '/api/staff-attendance/sync-payroll',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const rawMonth = (req.body as { monthKey?: string })?.monthKey?.trim() || '2026-11';
      if (!/^\d{4}-\d{2}$/.test(rawMonth)) {
        res.status(400).json({ error: 'Valid monthKey (YYYY-MM) is required.' });
        return;
      }

      ensureCampusAdminInitialized(db, schoolId);
      if (!Array.isArray(db.payrollRegisters)) db.payrollRegisters = [];

      const schoolProfiles = (db.staffProfiles || []).filter(
        (p) => p.schoolId === schoolId && p.active,
      );
      const schoolAtt = (db.staffAttendance || []).filter((a) => a.schoolId === schoolId);
      const monthLabel = formatMonthLabel(rawMonth);
      const nowIso = new Date().toISOString();
      const isApprover = ['super_admin', 'school_admin', 'principal'].includes(user.role);

      let syncedCount = 0;
      let totalNetPayableInr = 0;

      for (const profile of schoolProfiles) {
        const calc = computeStaffMonthlySalary({
          profile,
          attendanceRecords: schoolAtt,
          monthKey: rawMonth,
          payrollRegisters: db.payrollRegisters,
        });

        const existingIdx = db.payrollRegisters.findIndex(
          (p) =>
            p.schoolId === schoolId &&
            p.monthLabel.toLowerCase() === monthLabel.toLowerCase() &&
            p.staffName.toLowerCase() === profile.name.toLowerCase(),
        );

        const nextEntry: PayrollRegisterEntry = {
          id: existingIdx >= 0 ? db.payrollRegisters[existingIdx].id : `pay-auto-${profile.id}-${rawMonth}`,
          schoolId,
          monthLabel,
          staffName: profile.name,
          staffRoleType: mapStaffRoleCategoryToPayrollType(profile.roleType),
          designation: profile.designation,
          bankAccountNumber: profile.bankAccountNumber,
          ifscCode: profile.ifscCode,
          bankName: profile.bankName,
          daysWorked: calc.effectivePaidDays,
          grossSalaryInr: calc.grossSalaryInr,
          deductionsInr: calc.totalDeductionsInr,
          netPayableInr: calc.netPayableInr,
          status: isApprover ? 'approved' : 'submitted',
          preparedBy: user.name,
          ...(isApprover ? { approvedBy: user.name, approvedAt: nowIso } : {}),
        };

        if (existingIdx >= 0) {
          db.payrollRegisters[existingIdx] = nextEntry;
        } else {
          db.payrollRegisters.unshift(nextEntry);
        }

        syncedCount += 1;
        totalNetPayableInr += calc.netPayableInr;
      }

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'AUTO_SYNCED_ATTENDANCE_TO_PAYROLL',
        entityType: 'PayrollRegister',
        entityId: `${schoolId}-${rawMonth}`,
        detail: `Automated salary sync for ${monthLabel}: ${syncedCount} staff payroll entries updated (Net Payable ₹${totalNetPayableInr.toLocaleString('en-IN')}).`,
      });
      saveDb();

      res.json({
        ok: true,
        monthKey: rawMonth,
        monthLabel,
        syncedCount,
        totalNetPayableInr,
      });
    },
  );

  // ---------------- 2. DIGITAL GATE PASS ----------------
  app.post('/api/gate-passes', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const user = req.user!;
    const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
    if (!schoolId) {
      res.status(400).json({ error: 'Active school context required.' });
      return;
    }

    if (user.role === 'student') {
      res.status(403).json({
        error: 'Students cannot self-issue gate passes. Please ask a parent or school office.',
      });
      return;
    }

    ensureCampusAdminInitialized(db, schoolId);

    const {
      subjectType,
      studentId,
      staffId,
      reason,
      authorizedPickupName,
      pickupRelation,
      pickupPhone,
      pickupIdNumber,
      expectedExitTime,
      expectedReturnTime,
      autoApprove,
    } = req.body as {
      subjectType?: GatePassSubjectType;
      studentId?: string;
      staffId?: string;
      reason?: string;
      authorizedPickupName?: string;
      pickupRelation?: string;
      pickupPhone?: string;
      pickupIdNumber?: string;
      expectedExitTime?: string;
      expectedReturnTime?: string;
      autoApprove?: boolean;
    };

    if (!reason?.trim() || !expectedExitTime?.trim()) {
      res.status(400).json({ error: 'Reason and expected exit time are required.' });
      return;
    }

    const isGateManager = canManageCampusGateAndVisitors(user.role);
    const resolvedType: GatePassSubjectType =
      user.role === 'parent'
        ? 'Student Early Exit'
        : subjectType === 'Staff Out-Pass'
          ? 'Staff Out-Pass'
          : 'Student Early Exit';

    const nowIso = new Date().toISOString();
    const passCode = `GP-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    let record: GatePassRecord;

    if (resolvedType === 'Student Early Exit') {
      if (!studentId?.trim()) {
        res.status(400).json({ error: 'Please select a student for Student Early Exit pass.' });
        return;
      }
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }
      if (user.role === 'parent') {
        const linked = new Set(user.linkedStudentIds || []);
        if (!linked.has(student.id)) {
          res.status(403).json({
            error: 'Parents may only request digital gate passes for their own linked child.',
          });
          return;
        }
      }
      if (!authorizedPickupName?.trim() || !pickupPhone?.trim()) {
        res.status(400).json({
          error: 'Authorized pickup person name and mobile number are required for student exit.',
        });
        return;
      }

      const approvedNow = Boolean(autoApprove && isGateManager);
      record = {
        id: `gp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        schoolId,
        passCode,
        subjectType: 'Student Early Exit',
        studentId: student.id,
        studentName: student.name,
        classSection: student.classSection,
        requestedByUserId: user.id,
        requestedByName: user.name,
        requestedByRole: user.role,
        reason: reason.trim(),
        authorizedPickupName: authorizedPickupName.trim(),
        pickupRelation: pickupRelation?.trim() || 'Parent / Guardian',
        pickupPhone: pickupPhone.trim(),
        pickupIdMasked: maskVisitorIdNumber(pickupIdNumber || ''),
        expectedExitTime: expectedExitTime.trim(),
        expectedReturnTime: expectedReturnTime?.trim() || undefined,
        status: approvedNow ? 'Approved' : 'Pending Approval',
        ...(approvedNow ? { approvedByName: user.name, approvedAt: nowIso } : {}),
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    } else {
      // Staff Out-Pass
      let targetStaff = (db.staffProfiles || []).find(
        (p) => p.schoolId === schoolId && (staffId ? p.id === staffId : p.userId === user.id),
      );
      if (!isGateManager && targetStaff && targetStaff.userId && targetStaff.userId !== user.id) {
        res.status(403).json({ error: 'Staff members may only submit out-passes for themselves.' });
        return;
      }
      const staffName = targetStaff?.name || user.name;
      const staffDesignation = targetStaff?.designation || user.designation;
      const approvedNow = Boolean(autoApprove && isGateManager);

      record = {
        id: `gp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        schoolId,
        passCode,
        subjectType: 'Staff Out-Pass',
        staffId: targetStaff?.id,
        staffUserId: targetStaff?.userId || user.id,
        staffName,
        staffDesignation,
        requestedByUserId: user.id,
        requestedByName: user.name,
        requestedByRole: user.role,
        reason: reason.trim(),
        expectedExitTime: expectedExitTime.trim(),
        expectedReturnTime: expectedReturnTime?.trim() || undefined,
        status: approvedNow ? 'Approved' : 'Pending Approval',
        ...(approvedNow ? { approvedByName: user.name, approvedAt: nowIso } : {}),
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    }

    db.gatePasses!.unshift(record);
    appendAuditLog({
      schoolId,
      actor: user,
      action: 'ISSUED_DIGITAL_GATE_PASS',
      entityType: 'GatePass',
      entityId: record.id,
      detail: `${record.passCode} (${record.subjectType}) for ${record.studentName || record.staffName} — Status: ${record.status}.`,
    });
    saveDb();

    res.status(201).json({ ok: true, gatePass: record });
  });

  app.patch(
    '/api/gate-passes/:id/status',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'transport_incharge']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
      const passId = req.params.id;
      const { status, gateOfficerNote } = req.body as {
        status?: GatePassStatus;
        gateOfficerNote?: string;
      };

      if (!status || !VALID_GATE_PASS_STATUSES.includes(status)) {
        res.status(400).json({ error: 'Invalid gate pass status transition.' });
        return;
      }

      const pass = (db.gatePasses || []).find((g) => g.id === passId && g.schoolId === schoolId);
      if (!pass) {
        res.status(404).json({ error: 'Gate pass not found in active school.' });
        return;
      }

      const nowIso = new Date().toISOString();
      pass.status = status;
      pass.updatedAt = nowIso;
      if (gateOfficerNote !== undefined) {
        pass.gateOfficerNote = gateOfficerNote.trim() || undefined;
      }
      if (status === 'Approved') {
        pass.approvedByName = user.name;
        pass.approvedAt = nowIso;
      } else if (status === 'Exited Campus') {
        if (!pass.approvedByName) {
          pass.approvedByName = user.name;
          pass.approvedAt = nowIso;
        }
        pass.actualExitAt = nowIso;
      } else if (status === 'Returned') {
        pass.actualReturnAt = nowIso;
      }

      appendAuditLog({
        schoolId: schoolId ?? null,
        actor: user,
        action: 'UPDATED_GATE_PASS_STATUS',
        entityType: 'GatePass',
        entityId: pass.id,
        detail: `${pass.passCode} updated to ${status} by ${user.name}.`,
      });
      saveDb();

      res.json({ ok: true, gatePass: pass });
    },
  );

  // ---------------- 3. DIGITAL VISITORS REGISTER ----------------
  app.post(
    '/api/visitors/check-in',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'transport_incharge']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      ensureCampusAdminInitialized(db, schoolId);

      const {
        visitorName,
        phone,
        category,
        purpose,
        personToMeet,
        department,
        idProofType,
        idProofNumber,
        vehicleNumber,
        belongingsNote,
      } = req.body as {
        visitorName?: string;
        phone?: string;
        category?: VisitorCategory;
        purpose?: string;
        personToMeet?: string;
        department?: string;
        idProofType?: VisitorIdProofType;
        idProofNumber?: string;
        vehicleNumber?: string;
        belongingsNote?: string;
      };

      if (!visitorName?.trim() || !phone?.trim() || !purpose?.trim() || !personToMeet?.trim()) {
        res.status(400).json({
          error: 'Visitor name, phone number, purpose of visit, and host/person to meet are required.',
        });
        return;
      }

      const resolvedCategory: VisitorCategory = VALID_VISITOR_CATEGORIES.includes(
        category as VisitorCategory,
      )
        ? (category as VisitorCategory)
        : 'Parent / Guardian';
      const resolvedIdType: VisitorIdProofType = VALID_ID_TYPES.includes(
        idProofType as VisitorIdProofType,
      )
        ? (idProofType as VisitorIdProofType)
        : 'Aadhaar Card';

      const nowIso = new Date().toISOString();
      const badgeCode = `VIS-${String(Math.floor(1000 + Math.random() * 9000))}`;

      const visitor: VisitorLogRecord = {
        id: `vis-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        schoolId,
        badgeCode,
        visitorName: visitorName.trim(),
        phone: phone.trim(),
        category: resolvedCategory,
        purpose: purpose.trim(),
        personToMeet: personToMeet.trim(),
        department: department?.trim() || undefined,
        idProofType: resolvedIdType,
        idProofMasked: maskVisitorIdNumber(idProofNumber || ''),
        vehicleNumber: vehicleNumber?.trim().toUpperCase() || undefined,
        belongingsNote: belongingsNote?.trim() || undefined,
        checkInAt: nowIso,
        status: 'On Campus',
        loggedByName: user.name,
      };

      db.visitorLogs!.unshift(visitor);
      appendAuditLog({
        schoolId,
        actor: user,
        action: 'VISITOR_CHECKED_IN',
        entityType: 'VisitorLog',
        entityId: visitor.id,
        detail: `${visitor.badgeCode} — ${visitor.visitorName} (${visitor.category}) checked in to meet ${visitor.personToMeet}.`,
      });
      saveDb();

      res.status(201).json({ ok: true, visitor });
    },
  );

  app.patch(
    '/api/visitors/:id/check-out',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'transport_incharge']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
      const visitorId = req.params.id;

      const visitor = (db.visitorLogs || []).find(
        (v) => v.id === visitorId && v.schoolId === schoolId,
      );
      if (!visitor) {
        res.status(404).json({ error: 'Visitor entry not found in active school.' });
        return;
      }
      if (visitor.status === 'Checked Out') {
        res.json({ ok: true, visitor });
        return;
      }

      const nowIso = new Date().toISOString();
      const elapsedMs = Math.max(0, new Date(nowIso).getTime() - new Date(visitor.checkInAt).getTime());
      visitor.status = 'Checked Out';
      visitor.checkOutAt = nowIso;
      visitor.durationMinutes = Math.max(1, Math.round(elapsedMs / 60000));
      visitor.checkedOutByName = user.name;

      appendAuditLog({
        schoolId: schoolId ?? null,
        actor: user,
        action: 'VISITOR_CHECKED_OUT',
        entityType: 'VisitorLog',
        entityId: visitor.id,
        detail: `${visitor.badgeCode} — ${visitor.visitorName} checked out after ${visitor.durationMinutes} min.`,
      });
      saveDb();

      res.json({ ok: true, visitor });
    },
  );
}
