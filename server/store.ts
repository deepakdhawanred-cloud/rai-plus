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

const PRIMARY_DATA_DIR = path.resolve(process.cwd(), '.data');
const FALLBACK_DATA_DIR = path.join(os.tmpdir(), 'virat-student-360-data');
const DB_FILENAME = 'virat_student_360.json';
let activeDataDir = PRIMARY_DATA_DIR;

function getDbFilePath(dir = activeDataDir): string {
  return path.join(dir, DB_FILENAME);
}

const CURRENT_DB_SCHEMA_VERSION = 20261125;

type PersistedDatabaseState = DatabaseState & {
  _schemaVersion?: number;
};

let cachedDb: PersistedDatabaseState | null = null;
let dbRevision = 1;

export function getDbRevision(): number {
  return dbRevision;
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
      if (parsed._schemaVersion === CURRENT_DB_SCHEMA_VERSION && Array.isArray(parsed.schools) && Array.isArray(parsed.users)) {
        cachedDb = parsed;
        return cachedDb;
      }
      let migrated = false;
      const fresh = createInitialDatabase();
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
      const thinkingMigrationReport = runThinkingAssessmentMigrations(parsed);
      if (thinkingMigrationReport.mutated) {
        migrated = true;
      }
      if (parsed._schemaVersion !== CURRENT_DB_SCHEMA_VERSION) {
        parsed._schemaVersion = CURRENT_DB_SCHEMA_VERSION;
        migrated = true;
      }
      cachedDb = parsed;
      if (migrated) saveDb(cachedDb);
      return cachedDb;
    }
  } catch (err) {
    console.warn('Could not read persisted database, initializing fresh seed:', err);
  }

  cachedDb = { ...createInitialDatabase(), _schemaVersion: CURRENT_DB_SCHEMA_VERSION };
  saveDb(cachedDb);
  return cachedDb;
}

export function saveDb(nextDb?: DatabaseState): void {
  if (nextDb) {
    cachedDb = { ...nextDb, _schemaVersion: CURRENT_DB_SCHEMA_VERSION };
  }
  if (!cachedDb) return;
  dbRevision += 1;
  cachedDb._schemaVersion = CURRENT_DB_SCHEMA_VERSION;
  const serialized = JSON.stringify(cachedDb);
  for (const dir of [activeDataDir, FALLBACK_DATA_DIR]) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(getDbFilePath(dir), serialized, 'utf-8');
      activeDataDir = dir;
      break;
    } catch (err) {
      if (dir === FALLBACK_DATA_DIR) {
        console.warn('Could not persist database to disk; keeping in-memory state:', err);
      }
    }
  }
  // Automatically sync every mutation to Supabase when configured
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
    cachedDb = { ...remoteState, _schemaVersion: CURRENT_DB_SCHEMA_VERSION };
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
    return true;
  }
  // Seed Supabase with the initial/local dataset on first connection
  const current = getDb();
  scheduleSupabaseSync(current, CURRENT_DB_SCHEMA_VERSION, dbRevision);
  return false;
}

export function resetDb(): DatabaseState {
  cachedDb = createInitialDatabase();
  saveDb(cachedDb);
  return cachedDb;
}
