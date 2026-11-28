import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createInitialDatabase, type DatabaseState } from './seedData.ts';
import { runThinkingAssessmentMigrations } from './thinkingMigrations.ts';
import { reconcileStudentFamilyAccounts } from '../src/utils/familyAccountEngine.ts';
import {
  isSupabaseConfigured,
  loadStateFromSupabase,
  scheduleSupabaseSync,
} from './supabaseStore.ts';
import { VIS_FEE_LEDGER_VERSION } from './visFeeLoader.ts';
import { VIS_SALARY_EXPENSE_VERSION } from './visFinanceSheetLoader.ts';

const PRIMARY_DATA_DIR = path.resolve(process.cwd(), '.data');
const FALLBACK_DATA_DIR = path.join(os.tmpdir(), 'virat-student-360-data');
const DB_FILENAME = 'virat_student_360.json';
let activeDataDir = PRIMARY_DATA_DIR;

function getDbFilePath(dir = activeDataDir): string {
  return path.join(dir, DB_FILENAME);
}

const CURRENT_DB_SCHEMA_VERSION = 20261128;

type PersistedDatabaseState = DatabaseState & {
  _schemaVersion?: number;
  _visFeeLedgerVersion?: string;
  _visSalaryExpenseVersion?: string;
};

let cachedDb: PersistedDatabaseState | null = null;
let dbRevision = 1;
const schoolRevisions = new Map<string, number>();
const MAX_AUDIT_LOGS = 5000;

let pendingDiskWriteTimer: ReturnType<typeof setTimeout> | null = null;
let diskWriteInFlight = false;
let diskWriteQueued = false;

export function getDbRevision(): number {
  return dbRevision;
}

export function getSchoolRevision(schoolId: string | null | undefined): number {
  if (!schoolId) return dbRevision;
  return schoolRevisions.get(schoolId) ?? dbRevision;
}

function bumpRevision(schoolId?: string | null): void {
  dbRevision += 1;
  if (schoolId) {
    schoolRevisions.set(schoolId, dbRevision);
  } else {
    for (const key of schoolRevisions.keys()) {
      schoolRevisions.set(key, dbRevision);
    }
    if (cachedDb?.schools) {
      for (const s of cachedDb.schools) {
        schoolRevisions.set(s.id, dbRevision);
      }
    }
  }
}

function applyDatabaseMigrations(parsed: PersistedDatabaseState): boolean {
  if (
    parsed._schemaVersion === CURRENT_DB_SCHEMA_VERSION &&
    parsed._visFeeLedgerVersion === VIS_FEE_LEDGER_VERSION &&
    parsed._visSalaryExpenseVersion === VIS_SALARY_EXPENSE_VERSION &&
    Array.isArray(parsed.schools) &&
    Array.isArray(parsed.users)
  ) {
    return false;
  }

  let migrated = false;
  const fresh = createInitialDatabase();
  const visLedgerNeedsRefresh = parsed._visFeeLedgerVersion !== VIS_FEE_LEDGER_VERSION;
  const visSalaryExpenseNeedsRefresh =
    parsed._visSalaryExpenseVersion !== VIS_SALARY_EXPENSE_VERSION;

  if (visLedgerNeedsRefresh) {
    // 1. Sync school-vis-jjr CSV students (remove departed/shifted stu-vis-csv-* rows, update balances, add new enrollees)
    const freshVisStudents = fresh.students.filter((s) => s.schoolId === 'school-vis-jjr');
    const freshVisStuById = new Map(freshVisStudents.map((s) => [s.id, s]));
    const staleCsvStudentIds = new Set<string>();

    if (Array.isArray(parsed.students)) {
      parsed.students = parsed.students.filter((s) => {
        if (s.schoolId === 'school-vis-jjr' && s.id.startsWith('stu-vis-csv-') && !freshVisStuById.has(s.id)) {
          staleCsvStudentIds.add(s.id);
          return false;
        }
        return true;
      });
      for (const s of parsed.students) {
        if (s.schoolId === 'school-vis-jjr' && s.id.startsWith('stu-vis-csv-')) {
          const freshMatch = freshVisStuById.get(s.id);
          if (freshMatch) {
            s.feeBalanceInr = freshMatch.feeBalanceInr;
            s.totalFeeAnnualInr = freshMatch.totalFeeAnnualInr;
            s.admissionNo = freshMatch.admissionNo;
            s.guardianName = freshMatch.guardianName;
            s.guardianPhone = freshMatch.guardianPhone;
            if (freshMatch.address) s.address = freshMatch.address;
          }
        }
      }
      const existingIdsAfterPrune = new Set(parsed.students.map((s) => s.id));
      for (const fsStu of freshVisStudents) {
        if (!existingIdsAfterPrune.has(fsStu.id)) {
          parsed.students.push(fsStu);
        }
      }
    }

    // Prune orphaned auto-seeded academic/attendance rows belonging to removed stu-vis-csv-* IDs
    if (staleCsvStudentIds.size > 0) {
      if (Array.isArray(parsed.attendance)) {
        parsed.attendance = parsed.attendance.filter((a) => !staleCsvStudentIds.has(a.studentId));
      }
      if (Array.isArray(parsed.monthlyAttendance)) {
        parsed.monthlyAttendance = parsed.monthlyAttendance.filter((m) => !staleCsvStudentIds.has(m.studentId));
      }
      if (Array.isArray(parsed.readingReports)) {
        parsed.readingReports = parsed.readingReports.filter((r) => !staleCsvStudentIds.has(r.studentId));
      }
      if (Array.isArray(parsed.numeracyReports)) {
        parsed.numeracyReports = parsed.numeracyReports.filter((r) => !staleCsvStudentIds.has(r.studentId));
      }
      if (Array.isArray(parsed.examMarks)) {
        parsed.examMarks = parsed.examMarks.filter((m) => !staleCsvStudentIds.has(m.studentId));
      }
    }

    // 2. Replace school-vis-jjr feeAccounts with authoritative updated 2026-27 CSV ledger (preserve all other schools)
    const freshVisAccounts = fresh.feeAccounts.filter((a) => a.schoolId === 'school-vis-jjr');
    const nonVisAccounts = Array.isArray(parsed.feeAccounts)
      ? parsed.feeAccounts.filter((a) => a.schoolId !== 'school-vis-jjr')
      : fresh.feeAccounts.filter((a) => a.schoolId !== 'school-vis-jjr');
    parsed.feeAccounts = [...freshVisAccounts, ...nonVisAccounts];

    // 3. Preserve prior Merged/Dismissed sibling decisions by guardian+phone, then refresh VIS siblingGroups & familyAccounts
    const prevVisGroupDecision = new Map<string, { status: 'Alert' | 'Merged' | 'Dismissed'; updatedBy?: string; updatedAt?: string }>();
    for (const g of parsed.siblingGroups || []) {
      if (g.schoolId === 'school-vis-jjr' && g.status !== 'Alert') {
        const key = `${(g.guardianName || '').trim().toLowerCase()}::${(g.contactNo || '').replace(/\D/g, '').slice(-10)}`;
        prevVisGroupDecision.set(key, { status: g.status, updatedBy: g.updatedBy, updatedAt: g.updatedAt });
      }
    }
    const freshVisGroups = fresh.siblingGroups
      .filter((g) => g.schoolId === 'school-vis-jjr')
      .map((g) => {
        const key = `${(g.guardianName || '').trim().toLowerCase()}::${(g.contactNo || '').replace(/\D/g, '').slice(-10)}`;
        const prev = prevVisGroupDecision.get(key);
        return prev ? { ...g, status: prev.status, updatedBy: prev.updatedBy, updatedAt: prev.updatedAt } : g;
      });
    const nonVisGroups = Array.isArray(parsed.siblingGroups)
      ? parsed.siblingGroups.filter((g) => g.schoolId !== 'school-vis-jjr')
      : fresh.siblingGroups.filter((g) => g.schoolId !== 'school-vis-jjr');
    parsed.siblingGroups = [...freshVisGroups, ...nonVisGroups];

    const freshVisFamilies = fresh.familyAccounts.filter((f) => f.schoolId === 'school-vis-jjr');
    const nonVisFamilies = Array.isArray(parsed.familyAccounts)
      ? parsed.familyAccounts.filter((f) => f.schoolId !== 'school-vis-jjr')
      : fresh.familyAccounts.filter((f) => f.schoolId !== 'school-vis-jjr');
    parsed.familyAccounts = [...freshVisFamilies, ...nonVisFamilies];

    // 4. Sync VIS school studentCount
    if (Array.isArray(parsed.schools)) {
      const freshVisSchool = fresh.schools.find((s) => s.id === 'school-vis-jjr');
      const existingVisSchool = parsed.schools.find((s) => s.id === 'school-vis-jjr');
      if (freshVisSchool && existingVisSchool) {
        existingVisSchool.studentCount = freshVisSchool.studentCount;
      }
    }

    parsed._visFeeLedgerVersion = VIS_FEE_LEDGER_VERSION;
    migrated = true;
  }

  if (visSalaryExpenseNeedsRefresh) {
    // Sync authoritative 2026-27 VIS Staff Salary Sheet & VIS Expense Sheet while preserving all other schools
    const freshVisStaff = (fresh.staffProfiles || []).filter((p) => p.schoolId === 'school-vis-jjr');
    if (freshVisStaff.length > 0) {
      const nonVisStaff = Array.isArray(parsed.staffProfiles)
        ? parsed.staffProfiles.filter((p) => p.schoolId !== 'school-vis-jjr')
        : [];
      parsed.staffProfiles = [...freshVisStaff, ...nonVisStaff];
    }

    const freshVisStaffAtt = (fresh.staffAttendance || []).filter((a) => a.schoolId === 'school-vis-jjr');
    if (freshVisStaffAtt.length > 0) {
      const nonVisStaffAtt = Array.isArray(parsed.staffAttendance)
        ? parsed.staffAttendance.filter((a) => a.schoolId !== 'school-vis-jjr')
        : [];
      parsed.staffAttendance = [...freshVisStaffAtt, ...nonVisStaffAtt];
    }

    const freshVisPayrolls = (fresh.payrollRegisters || []).filter((p) => p.schoolId === 'school-vis-jjr');
    if (freshVisPayrolls.length > 0) {
      const nonVisPayrolls = Array.isArray(parsed.payrollRegisters)
        ? parsed.payrollRegisters.filter((p) => p.schoolId !== 'school-vis-jjr')
        : [];
      parsed.payrollRegisters = [...freshVisPayrolls, ...nonVisPayrolls];
    }

    const freshVisExpenses = (fresh.accountingEntries || []).filter((e) => e.schoolId === 'school-vis-jjr');
    if (freshVisExpenses.length > 0) {
      const nonVisExpenses = Array.isArray(parsed.accountingEntries)
        ? parsed.accountingEntries.filter((e) => e.schoolId !== 'school-vis-jjr')
        : [];
      parsed.accountingEntries = [...freshVisExpenses, ...nonVisExpenses];
    }

    parsed._visSalaryExpenseVersion = VIS_SALARY_EXPENSE_VERSION;
    migrated = true;
  }

  if (!Array.isArray(parsed.cognitiveAttempts)) {
    parsed.cognitiveAttempts = fresh.cognitiveAttempts;
    migrated = true;
  }
  if (!Array.isArray(parsed.cognitiveAssignments)) {
    parsed.cognitiveAssignments = fresh.cognitiveAssignments;
    migrated = true;
  }
      if (Array.isArray(parsed.students)) {
        const existingStudentIds = new Set(parsed.students.map((s) => s.id));
        const missingStudents = fresh.students.filter((s) => !existingStudentIds.has(s.id));
        if (missingStudents.length > 0) {
          parsed.students.push(...missingStudents);
          migrated = true;
        }
      }
      if (Array.isArray(parsed.notebookEntries)) {
        const existingNbIds = new Set(parsed.notebookEntries.map((n) => n.id));
        const missingNbs = fresh.notebookEntries.filter((n) => !existingNbIds.has(n.id));
        if (missingNbs.length > 0) {
          parsed.notebookEntries.push(...missingNbs);
          migrated = true;
        }
      }
      if (Array.isArray(parsed.evidence)) {
        const existingEvKeys = new Set(parsed.evidence.map((e) => e.sourceKey));
        const missingEv = fresh.evidence.filter((e) => !existingEvKeys.has(e.sourceKey));
        if (missingEv.length > 0) {
          parsed.evidence.push(...missingEv);
          migrated = true;
        }
      }
      if (Array.isArray(parsed.schools)) {
        const existingSchoolIds = new Set(parsed.schools.map((s) => s.id));
        const missingSchools = fresh.schools.filter((s) => !existingSchoolIds.has(s.id));
        if (missingSchools.length > 0) {
          parsed.schools.unshift(...missingSchools);
          migrated = true;
        }
        for (const s of parsed.schools) {
          const freshMatch = fresh.schools.find((fsItem) => fsItem.id === s.id);
          if (freshMatch && s.id === 'school-vis-jjr' && s.studentCount < freshMatch.studentCount) {
            s.studentCount = freshMatch.studentCount;
            migrated = true;
          }
        }
      }
      if (Array.isArray(parsed.users)) {
        const freshUserById = new Map(fresh.users.map((u) => [u.id, u]));
        for (const u of parsed.users) {
          const match = freshUserById.get(u.id);
          if (match) {
            if (match.classTeacherOf && u.classTeacherOf !== match.classTeacherOf) {
              u.classTeacherOf = match.classTeacherOf;
              migrated = true;
            }
            if (match.subjectSpecialty && !u.subjectSpecialty) {
              u.subjectSpecialty = match.subjectSpecialty;
              migrated = true;
            }
            if (match.isPlatformCoo && !u.isPlatformCoo) {
              u.isPlatformCoo = true;
              migrated = true;
            }
          }
        }
        const existingUserIds = new Set(parsed.users.map((u) => u.id));
        const missingUsers = fresh.users.filter((u) => !existingUserIds.has(u.id));
        if (missingUsers.length > 0) {
          parsed.users.push(...missingUsers);
          migrated = true;
        }
      }
      if (!parsed.planPricingCatalog || typeof parsed.planPricingCatalog !== 'object') {
        parsed.planPricingCatalog = {};
        migrated = true;
      }
      if (!parsed.schoolWeights) {
        parsed.schoolWeights = fresh.schoolWeights;
        migrated = true;
      } else {
        for (const [k, v] of Object.entries(fresh.schoolWeights)) {
          if (!parsed.schoolWeights[k]) {
            parsed.schoolWeights[k] = v;
            migrated = true;
          }
        }
      }
      if (Array.isArray(parsed.examMarks)) {
        const existingMarkIds = new Set(parsed.examMarks.map((m) => m.id));
        const missingSkillMarks = fresh.examMarks.filter((m) => !existingMarkIds.has(m.id));
        if (missingSkillMarks.length > 0) {
          parsed.examMarks.push(...missingSkillMarks);
          migrated = true;
        }
      }
      if (Array.isArray(parsed.attendance)) {
        const existingAttIds = new Set(parsed.attendance.map((a) => a.id));
        const missingAtt = fresh.attendance.filter((a) => !existingAttIds.has(a.id));
        if (missingAtt.length > 0) {
          parsed.attendance.push(...missingAtt);
          migrated = true;
        }
      }
      if (Array.isArray(parsed.resources)) {
        const existingResIds = new Set(parsed.resources.map((r) => r.id));
        const missingRes = fresh.resources.filter((r) => !existingResIds.has(r.id));
        if (missingRes.length > 0) {
          parsed.resources.push(...missingRes);
          migrated = true;
        }
      }
      if (Array.isArray(parsed.lessonPlans)) {
        const existingLpIds = new Set(parsed.lessonPlans.map((l) => l.id));
        const missingLp = fresh.lessonPlans.filter((l) => !existingLpIds.has(l.id));
        if (missingLp.length > 0) {
          parsed.lessonPlans.push(...missingLp);
          migrated = true;
        }
      }
      if (Array.isArray(parsed.timetable)) {
        const legacyVisSlotIds = new Set(['tt-vis-1', 'tt-vis-2', 'tt-vis-3']);
        const hasLegacyVis = parsed.timetable.some((t) => legacyVisSlotIds.has(t.id));
        if (hasLegacyVis) {
          parsed.timetable = parsed.timetable.filter((t) => !legacyVisSlotIds.has(t.id));
          migrated = true;
        }
        const existingTtIds = new Set(parsed.timetable.map((t) => t.id));
        const missingTt = fresh.timetable.filter((t) => !existingTtIds.has(t.id));
        if (missingTt.length > 0) {
          parsed.timetable.push(...missingTt);
          migrated = true;
        }
      }
      if (Array.isArray(parsed.feeTransactions)) {
        const existingFeeIds = new Set(parsed.feeTransactions.map((f) => f.id));
        const missingFees = fresh.feeTransactions.filter((f) => !existingFeeIds.has(f.id));
        if (missingFees.length > 0) {
          parsed.feeTransactions.push(...missingFees);
          migrated = true;
        }
      }
      if (Array.isArray(parsed.operations)) {
        const existingOpIds = new Set(parsed.operations.map((o) => o.id));
        const missingOps = fresh.operations.filter((o) => !existingOpIds.has(o.id));
        if (missingOps.length > 0) {
          parsed.operations.push(...missingOps);
          migrated = true;
        }
      }
      if (Array.isArray(parsed.students)) {
        const freshStuById = new Map(fresh.students.map((s) => [s.id, s]));
        for (const s of parsed.students) {
          const match = freshStuById.get(s.id);
          if (match?.visReportFileId && !s.visReportFileId) {
            s.visReportFileId = match.visReportFileId;
            migrated = true;
          }
        }
      }
      if (!parsed.registerApprovals) {
        parsed.registerApprovals = fresh.registerApprovals;
        migrated = true;
      }
      if (!parsed.visParsedReports) {
        parsed.visParsedReports = fresh.visParsedReports;
        migrated = true;
      } else {
        for (const [fid, profile] of Object.entries(fresh.visParsedReports)) {
          if (!parsed.visParsedReports[fid]) {
            parsed.visParsedReports[fid] = profile;
            migrated = true;
          }
        }
      }
      if (Array.isArray(parsed.admissionLeads)) {
        const freshLeadById = new Map(fresh.admissionLeads.map((l) => [l.id, l]));
        for (const lead of parsed.admissionLeads) {
          const freshMatch = freshLeadById.get(lead.id);
          if (freshMatch) {
            if (!lead.locality && freshMatch.locality) {
              lead.locality = freshMatch.locality;
              migrated = true;
            }
            if (!lead.address && freshMatch.address) {
              lead.address = freshMatch.address;
              migrated = true;
            }
            if (!lead.previousSchool && freshMatch.previousSchool) {
              lead.previousSchool = freshMatch.previousSchool;
              migrated = true;
            }
          }
        }
        const existingLeadIds = new Set(parsed.admissionLeads.map((l) => l.id));
        const missingLeads = fresh.admissionLeads.filter((l) => !existingLeadIds.has(l.id));
        if (missingLeads.length > 0) {
          parsed.admissionLeads.push(...missingLeads);
          migrated = true;
        }
      }
      if (!Array.isArray(parsed.homeVisitRecords)) {
        parsed.homeVisitRecords = fresh.homeVisitRecords;
        migrated = true;
      } else {
        const existingVisitIds = new Set(parsed.homeVisitRecords.map((v) => v.id));
        const missingVisits = fresh.homeVisitRecords.filter((v) => !existingVisitIds.has(v.id));
        if (missingVisits.length > 0) {
          parsed.homeVisitRecords.push(...missingVisits);
          migrated = true;
        }
      }
      if (!Array.isArray(parsed.developmentReviews)) {
        parsed.developmentReviews = fresh.developmentReviews;
        migrated = true;
      } else {
        const existingRevIds = new Set(parsed.developmentReviews.map((r) => r.id));
        const missingRevs = fresh.developmentReviews.filter((r) => !existingRevIds.has(r.id));
        if (missingRevs.length > 0) {
          parsed.developmentReviews.push(...missingRevs);
          migrated = true;
        }
      }
      if (!Array.isArray(parsed.parentComplaints)) {
        parsed.parentComplaints = fresh.parentComplaints;
        migrated = true;
      } else {
        const existingCmpIds = new Set(parsed.parentComplaints.map((c) => c.id));
        const missingCmps = fresh.parentComplaints.filter((c) => !existingCmpIds.has(c.id));
        if (missingCmps.length > 0) {
          parsed.parentComplaints.push(...missingCmps);
          migrated = true;
        }
      }
      if (!Array.isArray(parsed.homeworkAssignments)) {
        parsed.homeworkAssignments = fresh.homeworkAssignments;
        migrated = true;
      } else {
        const existingHwIds = new Set(parsed.homeworkAssignments.map((h) => h.id));
        const missingHw = fresh.homeworkAssignments.filter((h) => !existingHwIds.has(h.id));
        if (missingHw.length > 0) {
          parsed.homeworkAssignments.push(...missingHw);
          migrated = true;
        }
      }
      if (!Array.isArray(parsed.homeworkSubmissions)) {
        parsed.homeworkSubmissions = fresh.homeworkSubmissions;
        migrated = true;
      } else {
        const existingSubIds = new Set(parsed.homeworkSubmissions.map((s) => s.id));
        const missingSubs = fresh.homeworkSubmissions.filter((s) => !existingSubIds.has(s.id));
        if (missingSubs.length > 0) {
          parsed.homeworkSubmissions.push(...missingSubs);
          migrated = true;
        }
      }
      if (!Array.isArray(parsed.activityRecords)) {
        parsed.activityRecords = fresh.activityRecords;
        migrated = true;
      } else {
        const existingActIds = new Set(parsed.activityRecords.map((a) => a.id));
        const missingActs = fresh.activityRecords.filter((a) => !existingActIds.has(a.id));
        if (missingActs.length > 0) {
          parsed.activityRecords.push(...missingActs);
          migrated = true;
        }
      }
      if (!Array.isArray(parsed.feeAccounts) || parsed.feeAccounts.length === 0) {
        parsed.feeAccounts = fresh.feeAccounts;
        migrated = true;
      } else {
        const existingAccIds = new Set(parsed.feeAccounts.map((a) => a.id));
        const missingAccs = fresh.feeAccounts.filter((a) => !existingAccIds.has(a.id));
        if (missingAccs.length > 0) {
          parsed.feeAccounts.push(...missingAccs);
          migrated = true;
        }
        const freshAccById = new Map(fresh.feeAccounts.map((a) => [a.id, a]));
        for (const acc of parsed.feeAccounts) {
          const freshAcc = freshAccById.get(acc.id);
          if (freshAcc?.studentId && !acc.studentId) {
            acc.studentId = freshAcc.studentId;
            migrated = true;
          }
        }
      }
      if (!Array.isArray(parsed.siblingGroups) || parsed.siblingGroups.length === 0) {
        parsed.siblingGroups = fresh.siblingGroups;
        migrated = true;
      } else {
        const existingGrpIds = new Set(parsed.siblingGroups.map((g) => g.id));
        const missingGrps = fresh.siblingGroups.filter((g) => !existingGrpIds.has(g.id));
        if (missingGrps.length > 0) {
          parsed.siblingGroups.push(...missingGrps);
          migrated = true;
        }
      }
      if (!parsed.financialTargets) {
        parsed.financialTargets = fresh.financialTargets;
        migrated = true;
      } else {
        for (const [k, v] of Object.entries(fresh.financialTargets)) {
          if (!parsed.financialTargets[k]) {
            parsed.financialTargets[k] = v;
            migrated = true;
          }
        }
      }
      if (!Array.isArray(parsed.feeReceipts)) {
        parsed.feeReceipts = fresh.feeReceipts;
        migrated = true;
      }
      if (!Array.isArray(parsed.dismissedPartialMatches)) {
        parsed.dismissedPartialMatches = [];
        migrated = true;
      }
      if (!Array.isArray(parsed.familyAccounts) || parsed.familyAccounts.length === 0 || migrated) {
        if (!Array.isArray(parsed.familyAccounts)) parsed.familyAccounts = [];
        for (const school of parsed.schools || []) {
          const synced = reconcileStudentFamilyAccounts({
            schoolId: school.id,
            students: parsed.students || [],
            feeAccounts: parsed.feeAccounts || [],
            siblingGroups: parsed.siblingGroups || [],
            familyAccounts: parsed.familyAccounts || [],
            feeReceipts: parsed.feeReceipts || [],
            feeTransactions: parsed.feeTransactions || [],
            users: parsed.users || [],
          });
          parsed.feeAccounts = synced.feeAccounts;
          parsed.siblingGroups = synced.siblingGroups;
          parsed.familyAccounts = synced.familyAccounts;
        }
        migrated = true;
      }
      if (!Array.isArray(parsed.readingReports)) {
        parsed.readingReports = fresh.readingReports;
        migrated = true;
      } else {
        const existingReadIds = new Set(parsed.readingReports.map((r) => r.id));
        const missingRead = fresh.readingReports.filter((r) => !existingReadIds.has(r.id));
        if (missingRead.length > 0) {
          parsed.readingReports.push(...missingRead);
          migrated = true;
        }
      }
      if (!Array.isArray(parsed.numeracyReports)) {
        parsed.numeracyReports = fresh.numeracyReports;
        migrated = true;
      } else {
        const existingNumIds = new Set(parsed.numeracyReports.map((r) => r.id));
        const missingNum = fresh.numeracyReports.filter((r) => !existingNumIds.has(r.id));
        if (missingNum.length > 0) {
          parsed.numeracyReports.push(...missingNum);
          migrated = true;
        }
      }
      if (!Array.isArray(parsed.monthlyAttendance)) {
        parsed.monthlyAttendance = fresh.monthlyAttendance;
        migrated = true;
      } else {
        const existingMattIds = new Set(parsed.monthlyAttendance.map((m) => m.id));
        const missingMatt = fresh.monthlyAttendance.filter((m) => !existingMattIds.has(m.id));
        if (missingMatt.length > 0) {
          parsed.monthlyAttendance.push(...missingMatt);
          migrated = true;
        }
      }
      if (!Array.isArray(parsed.readingTestSessions)) {
        parsed.readingTestSessions = fresh.readingTestSessions;
        migrated = true;
      } else {
        const existingSessionIds = new Set(parsed.readingTestSessions.map((s) => s.id));
        const missingSessions = fresh.readingTestSessions.filter(
          (s) => !existingSessionIds.has(s.id),
        );
        if (missingSessions.length > 0) {
          parsed.readingTestSessions.push(...missingSessions);
          migrated = true;
        }
      }
      if (!Array.isArray(parsed.numeracyTestSessions)) {
        parsed.numeracyTestSessions = [];
        migrated = true;
      }
      if (!Array.isArray(parsed.attendanceNotifications)) {
        parsed.attendanceNotifications = fresh.attendanceNotifications;
        migrated = true;
      }
      if (!Array.isArray(parsed.notebookNotifications)) {
        parsed.notebookNotifications = fresh.notebookNotifications;
        migrated = true;
      } else {
        const existingNbAlertIds = new Set(parsed.notebookNotifications.map((n) => n.id));
        const missingNbAlerts = fresh.notebookNotifications.filter(
          (n) => !existingNbAlertIds.has(n.id),
        );
        if (missingNbAlerts.length > 0) {
          parsed.notebookNotifications.push(...missingNbAlerts);
          migrated = true;
        }
      }
      if (!Array.isArray(parsed.remedialAssignments)) {
        parsed.remedialAssignments = fresh.remedialAssignments;
        migrated = true;
      } else {
        const existingRemIds = new Set(parsed.remedialAssignments.map((r) => r.id));
        const missingRem = fresh.remedialAssignments.filter((r) => !existingRemIds.has(r.id));
        if (missingRem.length > 0) {
          parsed.remedialAssignments.push(...missingRem);
          migrated = true;
        }
      }
      if (Array.isArray(parsed.notebookEntries)) {
        const existingNbIds = new Set(parsed.notebookEntries.map((n) => n.id));
        const missingNb = fresh.notebookEntries.filter((n) => !existingNbIds.has(n.id));
        if (missingNb.length > 0) {
          parsed.notebookEntries.push(...missingNb);
          migrated = true;
        }
      }
      // Forward-compatible additive hydration for Virat 360° Intelligence Collections
      const additiveArrayKeys = [
        'thinkingQuestionBank',
        'thinkingAssessments',
        'teacherCapabilityProfiles',
        'substitutionAssignments',
        'teacherLeaveRequests',
        'teacherLeaveBalances',
        'careerProfiles',
        'studentCareerPlans',
        'presentationAudits',
        'redesignedDecks',
        'psychometricRecords',
        'ssbEnrollments',
        'ssbDailyAssignments',
        'computerSkillBenchmarks',
        'computerSkillAttempts',
        'vcipAttempts',
        'vcipBrainGymLogs',
        'vcipAuthoredQuestions',
        'vcipClassAssignments',
      ] as const;
      for (const key of additiveArrayKeys) {
        if (!Array.isArray(parsed[key]) || parsed[key].length === 0) {
          (parsed as unknown as Record<string, unknown>)[key] = fresh[key];
          migrated = true;
        }
      }
      if (Array.isArray(parsed.vcipAttempts) && Array.isArray(fresh.vcipAttempts)) {
        const existingVcipIds = new Set(parsed.vcipAttempts.map((a) => a.id));
        const missingVcip = fresh.vcipAttempts.filter((a) => !existingVcipIds.has(a.id));
        if (missingVcip.length > 0) {
          parsed.vcipAttempts.push(...missingVcip);
          migrated = true;
        }
      }
      if (Array.isArray(parsed.vcipBrainGymLogs) && Array.isArray(fresh.vcipBrainGymLogs)) {
        const existingBgIds = new Set(parsed.vcipBrainGymLogs.map((g) => g.id));
        const missingBg = fresh.vcipBrainGymLogs.filter((g) => !existingBgIds.has(g.id));
        if (missingBg.length > 0) {
          parsed.vcipBrainGymLogs.push(...missingBg);
          migrated = true;
        }
      }
      if (!Array.isArray(parsed.thinkingSetUsages)) {
        parsed.thinkingSetUsages = [];
        migrated = true;
      }
      const continuationArrayKeys = [
        'vcipReleaseRecords',
        'vcipAccessLogs',
        'attendanceSupportRecords',
        'mindMapResources',
        'accountingEntries',
        'payrollRegisters',
        'bankReconciliationItems',
        'accountingTasks',
        'clinicalConsents',
        'developmentalHistories',
        'parentQuestionnaires',
        'teacherObservations',
        'screeningCases',
        'conditionAssessments',
        'speechSoundTargets',
        'speechExercises',
        'fluencyProfiles',
        'therapyPlans',
        'therapySessionLogs',
        'audioPracticeRecords',
        'parentHomePracticeLogs',
        'clinicalReports',
        'clinicalAccessLogs',
      ] as const;
      for (const key of continuationArrayKeys) {
        if (!Array.isArray(parsed[key]) || parsed[key].length === 0) {
          (parsed as unknown as Record<string, unknown>)[key] = fresh[key];
          migrated = true;
        }
      }
      const additiveRecordKeys = [
        'thinkingScoringConfigs',
        'timetableMasterConfigs',
        'substituteRuleConfigs',
        'capabilityBandConfigs',
        'productivityKpiConfigs',
        'vcipGovernanceConfigs',
      ] as const;
      for (const key of additiveRecordKeys) {
        const existingObj = parsed[key] as Record<string, unknown> | undefined;
        const freshObj = fresh[key] as Record<string, unknown>;
        if (!existingObj || typeof existingObj !== 'object') {
          (parsed as unknown as Record<string, unknown>)[key] = freshObj;
          migrated = true;
        } else {
          for (const [k, v] of Object.entries(freshObj)) {
            if (!(k in existingObj)) {
              existingObj[k] = v;
              migrated = true;
            }
          }
        }
      }
      // Migrate VIS Jhajjar leadership (Dr. Deepak Dhawan -> Deputy Director, Ms. Niharika Yadav -> Principal, Ms. Nirmla Yadav -> Vice Principal)
      // and separate Admission CRM vs Enrolled Student 4x/year Quarterly Home Visits
      if (Array.isArray(parsed.users)) {
        const freshVisLeaders = fresh.users.filter((u) =>
          ['usr-deputy-director-vis', 'usr-principal-vis', 'usr-vice-principal-vis'].includes(u.id),
        );
        for (const leader of freshVisLeaders) {
          const existingIdx = parsed.users.findIndex((u) => u.id === leader.id);
          if (existingIdx === -1) {
            parsed.users.unshift(leader);
            migrated = true;
          } else {
            const cur = parsed.users[existingIdx];
            if (
              cur.name !== leader.name ||
              cur.designation !== leader.designation ||
              cur.email !== leader.email ||
              cur.role !== leader.role
            ) {
              parsed.users[existingIdx] = {
                ...cur,
                name: leader.name,
                designation: leader.designation,
                email: leader.email,
                role: leader.role,
                subjectSpecialty: leader.subjectSpecialty,
              };
              migrated = true;
            }
          }
        }
      }
      if (Array.isArray(parsed.homeVisitRecords)) {
        for (const hv of parsed.homeVisitRecords) {
          if (!hv.visitCategory) {
            hv.visitCategory = hv.studentId ? 'enrolled_student' : 'admission_crm';
            migrated = true;
          }
        }
        const existingHvIds = new Set(parsed.homeVisitRecords.map((v) => v.id));
        for (const seedHv of fresh.homeVisitRecords) {
          if (seedHv.visitCategory === 'enrolled_student' && !existingHvIds.has(seedHv.id)) {
            parsed.homeVisitRecords.push(seedHv);
            migrated = true;
          }
        }
      }
      if (parsed.schoolWebsitesBySchool?.['school-vis-jjr']) {
        const visSite = parsed.schoolWebsitesBySchool['school-vis-jjr'];
        if (visSite.principalMessage?.authorName === 'Dr. Deepak Dhawan') {
          delete parsed.schoolWebsitesBySchool['school-vis-jjr'];
          migrated = true;
        }
      }

      const thinkingMigrationReport = runThinkingAssessmentMigrations(parsed);
      if (thinkingMigrationReport.mutated) {
        migrated = true;
      }
      if (parsed._schemaVersion !== CURRENT_DB_SCHEMA_VERSION) {
        parsed._schemaVersion = CURRENT_DB_SCHEMA_VERSION;
        migrated = true;
      }
      return migrated;
}

export function getDb(): DatabaseState {
  if (cachedDb) return cachedDb;

  try {
    const candidateFiles = [getDbFilePath(PRIMARY_DATA_DIR), getDbFilePath(FALLBACK_DATA_DIR)];
    const existingFile = candidateFiles.find((filePath) => fs.existsSync(filePath));
    if (existingFile) {
      activeDataDir = path.dirname(existingFile);
      const raw = fs.readFileSync(existingFile, 'utf-8');
      const parsed = JSON.parse(raw) as PersistedDatabaseState;
      const migrated = applyDatabaseMigrations(parsed);
      cachedDb = parsed;
      if (migrated) saveDb(cachedDb);
      return cachedDb;
    }
  } catch (err) {
    console.warn('Could not read persisted database, initializing fresh seed:', err);
  }

  cachedDb = {
    ...createInitialDatabase(),
    _schemaVersion: CURRENT_DB_SCHEMA_VERSION,
    _visFeeLedgerVersion: VIS_FEE_LEDGER_VERSION,
    _visSalaryExpenseVersion: VIS_SALARY_EXPENSE_VERSION,
  };
  saveDb(cachedDb);
  return cachedDb;
}

async function writeDbAtomicallyAsync(serialized: string, rev: number): Promise<void> {
  for (const dir of [activeDataDir, FALLBACK_DATA_DIR]) {
    const targetPath = getDbFilePath(dir);
    const tmpPath = `${targetPath}.tmp.${process.pid}.${rev}`;
    try {
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(tmpPath, serialized, 'utf-8');
      await fs.promises.rename(tmpPath, targetPath);
      activeDataDir = dir;
      return;
    } catch (err) {
      try {
        await fs.promises.rm(tmpPath, { force: true });
      } catch {
        // ignore temp cleanup failure
      }
      if (dir === FALLBACK_DATA_DIR) {
        console.warn('Could not persist database to disk; keeping in-memory state:', err);
      }
    }
  }
}

function writeDbAtomicallySync(serialized: string): void {
  for (const dir of [activeDataDir, FALLBACK_DATA_DIR]) {
    const targetPath = getDbFilePath(dir);
    const tmpPath = `${targetPath}.tmp.${process.pid}.${dbRevision}`;
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(tmpPath, serialized, 'utf-8');
      fs.renameSync(tmpPath, targetPath);
      activeDataDir = dir;
      return;
    } catch (err) {
      try {
        if (fs.existsSync(tmpPath)) fs.rmSync(tmpPath, { force: true });
      } catch {
        // ignore temp cleanup failure
      }
      if (dir === FALLBACK_DATA_DIR) {
        console.warn('Could not persist database to disk; keeping in-memory state:', err);
      }
    }
  }
}

async function drainAsyncDiskWrite(): Promise<void> {
  if (diskWriteInFlight || !cachedDb) return;
  diskWriteInFlight = true;
  diskWriteQueued = false;
  try {
    const rev = dbRevision;
    const serialized = JSON.stringify(cachedDb);
    await writeDbAtomicallyAsync(serialized, rev);
  } finally {
    diskWriteInFlight = false;
    if (diskWriteQueued) {
      void drainAsyncDiskWrite();
    }
  }
}

function scheduleAsyncDiskWrite(): void {
  diskWriteQueued = true;
  if (pendingDiskWriteTimer) return;
  pendingDiskWriteTimer = setTimeout(() => {
    pendingDiskWriteTimer = null;
    void drainAsyncDiskWrite();
  }, 250);
  pendingDiskWriteTimer.unref?.();
}

export function flushDbSync(): void {
  if (pendingDiskWriteTimer) {
    clearTimeout(pendingDiskWriteTimer);
    pendingDiskWriteTimer = null;
  }
  if (!cachedDb) return;
  writeDbAtomicallySync(JSON.stringify(cachedDb));
}

export function saveDb(
  nextDb?: DatabaseState,
  options?: { schoolId?: string | null; immediate?: boolean },
): void {
  if (nextDb) {
    cachedDb = {
      ...nextDb,
      _schemaVersion: CURRENT_DB_SCHEMA_VERSION,
      _visFeeLedgerVersion: VIS_FEE_LEDGER_VERSION,
      _visSalaryExpenseVersion: VIS_SALARY_EXPENSE_VERSION,
    };
  }
  if (!cachedDb) return;
  if (Array.isArray(cachedDb.auditLogs) && cachedDb.auditLogs.length > MAX_AUDIT_LOGS) {
    cachedDb.auditLogs.length = MAX_AUDIT_LOGS;
  }
  bumpRevision(options?.schoolId ?? null);
  cachedDb._schemaVersion = CURRENT_DB_SCHEMA_VERSION;
  cachedDb._visFeeLedgerVersion = VIS_FEE_LEDGER_VERSION;
  cachedDb._visSalaryExpenseVersion = VIS_SALARY_EXPENSE_VERSION;

  const dbExistsOnDisk = fs.existsSync(getDbFilePath(activeDataDir));
  if (options?.immediate || !dbExistsOnDisk) {
    flushDbSync();
  } else {
    scheduleAsyncDiskWrite();
  }
  // Automatically sync every mutation to Supabase when configured (coalesced)
  scheduleSupabaseSync(cachedDb, CURRENT_DB_SCHEMA_VERSION, dbRevision);
}

/**
 * Hydrates in-memory database from Supabase on server startup if configured.
 * If Supabase is configured and empty on first boot, seeds Supabase from current state.
 */
export async function hydrateDbFromSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const remoteState = await loadStateFromSupabase();
  if (remoteState) {
    const candidate = { ...(remoteState as PersistedDatabaseState) };
    const migrated = applyDatabaseMigrations(candidate);
    candidate._schemaVersion = CURRENT_DB_SCHEMA_VERSION;
    candidate._visFeeLedgerVersion = VIS_FEE_LEDGER_VERSION;
    candidate._visSalaryExpenseVersion = VIS_SALARY_EXPENSE_VERSION;
    cachedDb = candidate;
    dbRevision += 1;
    try {
      const serialized = JSON.stringify(cachedDb);
      if (!fs.existsSync(activeDataDir)) {
        fs.mkdirSync(activeDataDir, { recursive: true });
      }
      fs.writeFileSync(getDbFilePath(activeDataDir), serialized, 'utf-8');
    } catch {
      // Keep Supabase-hydrated state in memory even if local FS is read-only
    }
    if (migrated) {
      scheduleSupabaseSync(cachedDb, CURRENT_DB_SCHEMA_VERSION, dbRevision);
    }
    return true;
  }
  // Seed Supabase with the initial/local dataset on first connection
  const current = getDb();
  scheduleSupabaseSync(current, CURRENT_DB_SCHEMA_VERSION, dbRevision);
  return false;
}

export function resetDb(): DatabaseState {
  cachedDb = {
    ...createInitialDatabase(),
    _schemaVersion: CURRENT_DB_SCHEMA_VERSION,
    _visFeeLedgerVersion: VIS_FEE_LEDGER_VERSION,
    _visSalaryExpenseVersion: VIS_SALARY_EXPENSE_VERSION,
  };
  saveDb(cachedDb);
  return cachedDb;
}
