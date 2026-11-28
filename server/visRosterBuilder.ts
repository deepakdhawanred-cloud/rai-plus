import fs from 'node:fs';
import path from 'node:path';
import type {
  AcademicMonthKey,
  AttendanceRecord,
  DevelopmentEvidence,
  ExamMark,
  FeeLedgerAccount,
  MonthlyAttendanceSummary,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  StudentRecord,
  VisParsedReportProfile,
  VisReportCatalogItem,
} from '../src/types';
import { VIS_CLASS_TEACHERS } from '../src/data/visTimetableNov2026.ts';
import visReportsCatalogRaw from '../src/data/visReportsCatalog.json' with { type: 'json' };
import visUpdatedMarksRaw from '../src/data/visUpdatedMarks80AndUt.json' with { type: 'json' };
import { buildBatchAttendanceRecordId } from '../src/utils/academicOperationsEngine.ts';
import { normalizePersonName, parseVisFeeCsv } from '../src/utils/financialDashboardEngine.ts';
import {
  buildAdvisorySummary,
  enrichVisDmitProfileWithFingerprint,
} from '../src/utils/visReportParser.ts';
import {
  ACTIVE_SESSION_MONTHS,
  computeReadingBand,
  MONTH_WORKING_DAYS_2026,
  TODAY_VIS_DATE,
} from '../src/utils/visAcademicProgressEngine.ts';

interface ExcelMarkItem {
  subject: string;
  examName: string;
  maxMarks: number;
  obtainedMarks: number;
}

interface ExcelStudentRow {
  sheet: string;
  studentName: string;
  fatherName?: string;
  admissionNo?: string;
  classLabel?: string;
  transportHint?: string;
  marks?: ExcelMarkItem[];
  dmit?: {
    iq?: number;
    eq?: number;
    aq?: number;
    cq?: number;
    visualPct?: number;
    auditoryPct?: number;
    kinestheticPct?: number;
    fingerprintOrAcquiring?: string;
    strengths?: string;
  } | null;
}

const EXCEL_UPDATED_STUDENTS: ExcelStudentRow[] = Array.isArray(
  (visUpdatedMarksRaw as { students?: ExcelStudentRow[] })?.students,
)
  ? (visUpdatedMarksRaw as { students: ExcelStudentRow[] }).students
  : [];

function normalizeExcelSubject(raw: string): string {
  const s = (raw || '').trim();
  if (/^maths?$/i.test(s)) return 'Mathematics';
  if (/^sst$/i.test(s)) return 'Social Science';
  if (/^comp/i.test(s)) return 'Computer';
  return s;
}

function extractGradeNumFromLabel(label: string | undefined): string {
  const m = String(label || '').match(/(\d{1,2})/);
  return m ? m[1] : '';
}

function buildExcelLookupMaps(): {
  byAdm: Map<string, ExcelStudentRow>;
  byNameGrade: Map<string, ExcelStudentRow>;
} {
  const byAdm = new Map<string, ExcelStudentRow>();
  const byNameGrade = new Map<string, ExcelStudentRow>();
  for (const row of EXCEL_UPDATED_STUDENTS) {
    const adm = String(row.admissionNo || '')
      .trim()
      .toUpperCase()
      .replace(/\.0$/, '');
    if (adm) {
      byAdm.set(adm, row);
      if (/^\d+$/.test(adm)) byAdm.set(`VIS${adm}`, row);
    }
    const clean = cleanNameToken(row.studentName || '');
    const grade = extractGradeNumFromLabel(row.classLabel || row.sheet);
    if (clean && grade) {
      byNameGrade.set(`${clean}::${grade}`, row);
      const first = clean.split(' ')[0];
      if (first && !byNameGrade.has(`${first}::${grade}`)) {
        byNameGrade.set(`${first}::${grade}`, row);
      }
    }
  }
  return { byAdm, byNameGrade };
}

/**
 * Policy guard: ONLY accept subject Theory marks out of 80 (maxMarks === 80)
 * and raw Unit Test (UT) marks. Explicitly exclude /100 theory and scaled formula columns.
 */
export function filterAuthoritativeVis80AndUtMarks(marks: ExcelMarkItem[] | undefined): ExcelMarkItem[] {
  if (!Array.isArray(marks)) return [];
  return marks.filter((m) => {
    if (!Number.isFinite(m.obtainedMarks) || m.obtainedMarks <= 0) return false;
    if (/^Half-Yearly Theory$/i.test(m.examName) || /Theory/i.test(m.examName)) {
      return m.maxMarks === 80 && m.obtainedMarks <= 80;
    }
    if (/^Unit Test\s*[1-4]$/i.test(m.examName)) {
      return m.maxMarks > 0 && m.maxMarks <= 50 && m.obtainedMarks <= m.maxMarks;
    }
    return false;
  });
}

const VIS_FEE_CSV_PATH = path.resolve(
  process.cwd(),
  'server/private_seeds/vis_fees_2026_27.csv',
);

const VIS_REPORTS_CATALOG = visReportsCatalogRaw as VisReportCatalogItem[];

const HOUSES = ['Arjuna House', 'Vikramaditya House', 'Kalpana House', 'Tagore House'] as const;

/**
 * Exact admissionNo -> curated flagship StudentRecord.id mapping so existing IDs
 * (and parent/student login accounts + existing unit tests) remain 100% preserved.
 */
export const CURATED_ADM_TO_STUDENT_ID: Record<string, string> = {
  VIS7029: 'stu-vis-601', // Abhiraj Giri (6-A)
  VIS7259: 'stu-vis-602', // Hardik Yadav (6-A)
  VIS509: 'stu-vis-901',  // Mohit Prajapati (9-A)
  VIS514: 'stu-vis-902',  // Jasika (9-A)
  VIS461: 'stu-vis-1001', // Ajay (10-A)
  VIS473: 'stu-vis-1002', // Priya Bharti (10-A)
  VIS132: 'stu-vis-1101', // Arushi Rawat (11-Science)
  VIS95: 'stu-vis-1201',  // Chirag Chauhan (12-Commerce)
  VIS7439: 'stu-vis-301', // Kush (3-B)
  VIS7686: 'stu-vis-101', // Aitik (1-A)
};

function deterministicHash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function toTitleCase(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

function cleanNameToken(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\[.*?\]|\(.*?\)/g, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const CLASS3_B_FIRST_NAMES = new Set(
  VIS_REPORTS_CATALOG.filter((c) => c.normalizedClass === 'Class 3' && c.section === 'B').map(
    (c) => cleanNameToken(c.studentName).split(' ')[0],
  ),
);

function mapCsvClassToClassSection(rawClass: string, studentName: string, index: number): string {
  const upper = rawClass.trim().toUpperCase();
  if (upper.startsWith('NUR')) return 'Nursery';
  if (upper.startsWith('LKG')) return 'LKG';
  if (upper.startsWith('UKG')) return 'UKG';

  const numMatch = upper.match(/^(\d{1,2})/);
  if (!numMatch) return '1-A';
  const grade = Number(numMatch[1]);

  if (grade === 3) {
    const first = cleanNameToken(studentName).split(' ')[0];
    if (CLASS3_B_FIRST_NAMES.has(first)) {
      return '3-B';
    }
    return index % 2 === 1 ? '3-B' : '3-A';
  }
  if (grade === 11) {
    const streams = ['11-Science', '11-Commerce', '11-Arts'] as const;
    return streams[index % streams.length];
  }
  if (grade === 12) {
    const streams = ['12-Commerce', '12-Arts'] as const;
    return streams[index % streams.length];
  }
  return `${grade}-A`;
}

function findMatchingVisReportFileId(name: string, classSection: string): string | undefined {
  const cleanStu = cleanNameToken(name);
  if (!cleanStu) return undefined;
  const firstToken = cleanStu.split(' ')[0];

  const clsUpper = classSection.toUpperCase();
  let targetNormClass = '';
  let targetSec = '';
  if (clsUpper === 'UKG') {
    targetNormClass = 'UKG';
  } else {
    const m = classSection.match(/^(\d{1,2})\s*[-–]?\s*([A-Za-z]*)$/);
    if (m) {
      targetNormClass = `Class ${m[1]}`;
      if (m[2] && (m[2].toUpperCase() === 'A' || m[2].toUpperCase() === 'B')) {
        targetSec = m[2].toUpperCase();
      }
    }
  }
  if (!targetNormClass) return undefined;

  const candidates = VIS_REPORTS_CATALOG.filter(
    (c) =>
      c.normalizedClass === targetNormClass &&
      (!targetSec || c.section === targetSec),
  );

  const exact = candidates.find((c) => cleanNameToken(c.studentName) === cleanStu);
  if (exact) return exact.fileId;

  const firstMatch = candidates.find(
    (c) => cleanNameToken(c.studentName).split(' ')[0] === firstToken,
  );
  return firstMatch?.fileId;
}

function getSubjectsForClassSection(classSection: string): string[] {
  const upper = classSection.toUpperCase();
  if (upper === 'NURSERY' || upper === 'LKG' || upper === 'UKG') {
    return ['English', 'Hindi', 'Mathematics'];
  }
  if (upper.startsWith('11-SCIENCE') || upper.startsWith('12-SCIENCE')) {
    return ['English', 'Physics', 'Chemistry', 'Mathematics'];
  }
  if (upper.startsWith('11-COMMERCE') || upper.startsWith('12-COMMERCE')) {
    return ['English', 'Accountancy', 'Business Studies', 'Economics'];
  }
  if (upper.startsWith('11-ARTS') || upper.startsWith('12-ARTS')) {
    return ['English', 'Hindi', 'Political Science', 'Geography'];
  }
  const num = Number(classSection.match(/^(\d{1,2})/)?.[1] || 0);
  if (num >= 6) {
    return ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'];
  }
  return ['English', 'Hindi', 'Mathematics', 'Science'];
}

function getReadingAssessor(classSection: string): string {
  const num = Number(classSection.match(/^(\d{1,2})/)?.[1] || 0);
  if (num >= 9) return 'Neelam';
  if (num >= 6) return 'Manisha';
  if (num >= 3) return 'Jagriti';
  return VIS_CLASS_TEACHERS[classSection] || 'Monika';
}

function getNumeracyAssessor(classSection: string): string {
  const num = Number(classSection.match(/^(\d{1,2})/)?.[1] || 0);
  if (num >= 7) return 'Yatish';
  if (num >= 3) return 'Rekha';
  return VIS_CLASS_TEACHERS[classSection] || 'Rekha';
}

function baseWpmRange(classSection: string): { min: number; max: number } {
  const upper = classSection.toUpperCase();
  if (upper === 'NURSERY' || upper === 'LKG' || upper === 'UKG') return { min: 18, max: 42 };
  const num = Number(classSection.match(/^(\d{1,2})/)?.[1] || 1);
  if (num <= 2) return { min: 42, max: 78 };
  if (num <= 5) return { min: 68, max: 112 };
  if (num <= 8) return { min: 92, max: 138 };
  return { min: 112, max: 164 };
}

const MONTH_DATES_2026: Record<AcademicMonthKey, string> = {
  April: '2026-04-27',
  May: '2026-05-25',
  June: '2026-06-24',
  July: '2026-07-27',
  August: '2026-08-26',
  September: '2026-09-25',
  October: '2026-10-27',
  November: '2026-11-14',
  December: '2026-12-18',
  January: '2027-01-25',
  February: '2027-02-24',
  March: '2027-03-20',
};

const ABSENT_REASONS = [
  'Guardian informed mild fever',
  'Family outstation travel',
  'Uninformed absence — guardian SMS sent',
  'Medical clinic appointment',
];

const LEAVE_REASONS = [
  'Approved family ceremony leave',
  'Represented school in Jhajjar District Sports Meet',
  'Written parent leave application submitted',
];

export interface VisFullRosterBundle {
  students: StudentRecord[];
  examMarks: ExamMark[];
  readingReports: MonthlyReadingReport[];
  numeracyReports: MonthlyNumeracyReport[];
  monthlyAttendance: MonthlyAttendanceSummary[];
  todayAttendance: AttendanceRecord[];
  additionalExamEvidence: DevelopmentEvidence[];
  csvAdmissionToStudentId: Record<string, string>;
  excelDmitProfiles: Record<string, VisParsedReportProfile>;
}

export function buildVisFullRosterBundle(params: {
  curatedStudents: StudentRecord[];
  curatedMarks: ExamMark[];
}): VisFullRosterBundle {
  const { curatedStudents, curatedMarks } = params;

  let csvAccounts: FeeLedgerAccount[] = [];
  try {
    if (fs.existsSync(VIS_FEE_CSV_PATH)) {
      const csvRaw = fs.readFileSync(VIS_FEE_CSV_PATH, 'utf-8');
      csvAccounts = parseVisFeeCsv(csvRaw, 'school-vis-jjr');
    }
  } catch (err) {
    console.warn('VIS Roster Builder could not read CSV:', err);
  }

  const curatedById = new Map(curatedStudents.map((s) => [s.id, s]));
  const csvAdmissionToStudentId: Record<string, string> = { ...CURATED_ADM_TO_STUDENT_ID };
  const usedCuratedIds = new Set<string>();
  const usedStudentIds = new Set<string>();
  const rollCounters = new Map<string, number>();

  const builtStudents: StudentRecord[] = [];

  for (let idx = 0; idx < csvAccounts.length; idx += 1) {
    const acc = csvAccounts[idx];
    const admKey = acc.admissionNo.trim().toUpperCase();
    const mappedCuratedId = CURATED_ADM_TO_STUDENT_ID[admKey];

    if (mappedCuratedId && curatedById.has(mappedCuratedId) && !usedCuratedIds.has(mappedCuratedId)) {
      const existing = curatedById.get(mappedCuratedId)!;
      usedCuratedIds.add(mappedCuratedId);
      usedStudentIds.add(existing.id);
      csvAdmissionToStudentId[admKey] = existing.id;
      const nextRollNum = (rollCounters.get(existing.classSection) || 0) + 1;
      rollCounters.set(existing.classSection, nextRollNum);
      builtStudents.push({
        ...existing,
        // Preserve curated admissionNo/balances/fields so all existing assertions stay exact
      });
      continue;
    }

    const classSection = mapCsvClassToClassSection(acc.rawClass, acc.studentName, idx);
    const nextRollNum = (rollCounters.get(classSection) || 0) + 1;
    rollCounters.set(classSection, nextRollNum);
    const rollNo = String(nextRollNum).padStart(2, '0');

    const safeAdm = admKey.replace(/[^A-Z0-9]/g, '').toLowerCase() || `row${idx + 1}`;
    let studentId = `stu-vis-csv-${safeAdm}`;
    if (usedStudentIds.has(studentId)) {
      studentId = `stu-vis-csv-${safeAdm}-r${idx + 1}`;
    }
    usedStudentIds.add(studentId);
    if (!csvAdmissionToStudentId[admKey]) {
      csvAdmissionToStudentId[admKey] = studentId;
    }

    const cleanName = toTitleCase(acc.studentName);
    const cleanFather = acc.fatherName ? toTitleCase(acc.fatherName) : `Guardian of ${cleanName}`;
    const reportFileId = findMatchingVisReportFileId(acc.studentName, classSection);
    const h = deterministicHash(`${admKey}:${acc.studentName}`);

    const stream =
      classSection === '11-Science'
        ? h % 3 === 0
          ? 'Medical (PCB)'
          : 'Non-Medical (PCM)'
        : classSection.includes('Commerce')
          ? 'Commerce (Accountancy & Economics)'
          : classSection.includes('Arts')
            ? 'Humanities (Pol. Sci. & Geography)'
            : undefined;

    const student: StudentRecord = {
      id: studentId,
      schoolId: 'school-vis-jjr',
      admissionNo: acc.admissionNo || `VIS-CSV-${idx + 101}`,
      rollNo,
      name: cleanName,
      classSection,
      ...(stream ? { stream } : {}),
      house: HOUSES[h % HOUSES.length],
      guardianName: cleanFather,
      guardianPhone: acc.contactNo ? `+91 ${acc.contactNo}` : '+91 98125 00000',
      ...(acc.address ? { address: toTitleCase(acc.address) } : {}),
      udiseStudentId: `24061501024${String(100000 + idx).slice(-6)}`,
      haryanaMisId: `HMIS-JJR-${admKey}`,
      attendancePct: 92.0, // overwritten below after monthly attendance computation
      feeBalanceInr: Math.max(0, Math.round(acc.balanceFeesInr)),
      totalFeeAnnualInr: Math.max(12000, Math.round(acc.yearlyDemandInr || acc.perMonthInr * 12)),
      reportApprovalStatus: h % 9 === 0 ? 'Pending Approval' : 'Approved',
      formulaVersion: 'v1.2',
      documents: [
        { name: 'Birth Certificate', verified: true, referenceNo: `BC-${admKey}` },
        { name: 'Aadhaar / Parivar Pehchan Patra', verified: h % 11 !== 0, referenceNo: `PPP-${admKey}` },
        { name: 'UDISE+ Enrolment Sync', verified: true, referenceNo: `UD-${admKey}` },
      ],
      responsibilities:
        h % 5 === 0 ? [`Class ${classSection} Notebook & Bench Monitor`] : [],
      achievements: reportFileId ? ['VIS DMIT Learning Profile Mapped'] : [],
      confidentialCounsellorNote: `Enrolled from VIS Active Registry (${acc.admissionNo})${acc.address ? ` · Locality: ${toTitleCase(acc.address)}` : ''}.`,
      ...(reportFileId ? { visReportFileId: reportFileId } : {}),
    };

    builtStudents.push(student);
  }

  // Ensure any curated student not matched via CSV is still included
  for (const cs of curatedStudents) {
    if (!usedCuratedIds.has(cs.id)) {
      builtStudents.push(cs);
    }
  }

  // Generate Monthly Attendance (Apr-Nov), Today's Attendance (2026-11-16), UT Marks, Reading & Numeracy
  const examMarks: ExamMark[] = [...curatedMarks];
  const existingCuratedSet = new Set(curatedStudents.map((s) => s.id));
  const readingReports: MonthlyReadingReport[] = [];
  const numeracyReports: MonthlyNumeracyReport[] = [];
  const monthlyAttendance: MonthlyAttendanceSummary[] = [];
  const todayAttendance: AttendanceRecord[] = [];
  const additionalExamEvidence: DevelopmentEvidence[] = [];
  const excelDmitProfiles: Record<string, VisParsedReportProfile> = {};
  const { byAdm: excelByAdm, byNameGrade: excelByNameGrade } = buildExcelLookupMaps();

  const findExcelRow = (stu: StudentRecord): ExcelStudentRow | undefined => {
    const adm = (stu.admissionNo || '').trim().toUpperCase();
    if (adm && excelByAdm.has(adm)) return excelByAdm.get(adm);
    const digitsOnly = adm.replace(/^VIS[- ]?/, '');
    if (digitsOnly && excelByAdm.has(digitsOnly)) return excelByAdm.get(digitsOnly);
    const clean = cleanNameToken(stu.name);
    const grade = extractGradeNumFromLabel(stu.classSection);
    if (clean && grade) {
      if (excelByNameGrade.has(`${clean}::${grade}`)) return excelByNameGrade.get(`${clean}::${grade}`);
      const first = clean.split(' ')[0];
      if (first && excelByNameGrade.has(`${first}::${grade}`)) {
        return excelByNameGrade.get(`${first}::${grade}`);
      }
    }
    return undefined;
  };

  for (let sIdx = 0; sIdx < builtStudents.length; sIdx += 1) {
    const stu = builtStudents[sIdx];
    const h = deterministicHash(stu.id + ':' + stu.name);
    // Individual aptitude & consistency baseline (56..94)
    const basePerf =
      stu.id === 'stu-vis-601'
        ? 86
        : stu.id === 'stu-vis-602'
          ? 74
          : stu.id === 'stu-vis-301'
            ? 62
            : 58 + (h % 36);

    // 1. Attendance: Monthly summaries Apr-Nov + Today (2026-11-16)
    const todayRoll = h % 100;
    const todayStatus: 'Present' | 'Absent' | 'Leave' =
      todayRoll < 89 ? 'Present' : todayRoll < 97 ? 'Absent' : 'Leave';

    const todayNote =
      todayStatus === 'Absent'
        ? ABSENT_REASONS[h % ABSENT_REASONS.length]
        : todayStatus === 'Leave'
          ? LEAVE_REASONS[h % LEAVE_REASONS.length]
          : undefined;

    todayAttendance.push({
      id: buildBatchAttendanceRecordId('school-vis-jjr', TODAY_VIS_DATE, stu.id),
      schoolId: 'school-vis-jjr',
      studentId: stu.id,
      date: TODAY_VIS_DATE,
      status: todayStatus,
      correctedBy: VIS_CLASS_TEACHERS[stu.classSection] || 'Sunita Devi Ahlawat',
      ...(todayNote ? { contextNote: todayNote } : {}),
    });

    let ytdWorking = 0;
    let ytdPresent = 0;

    for (let mIdx = 0; mIdx < ACTIVE_SESSION_MONTHS.length; mIdx += 1) {
      const month = ACTIVE_SESSION_MONTHS[mIdx];
      const workingDays = MONTH_WORKING_DAYS_2026[month];
      const mh = deterministicHash(`${stu.id}:${month}`);

      let absentDays = mh % 7 === 0 ? 2 : mh % 3 === 0 ? 1 : 0;
      let leaveDays = mh % 9 === 0 ? 1 : 0;

      if (month === 'November') {
        // Guarantee November counts match today's (2026-11-16) status cleanly
        if (todayStatus === 'Absent' && absentDays === 0) absentDays = 1;
        if (todayStatus === 'Leave' && leaveDays === 0) leaveDays = 1;
        if (todayStatus === 'Present' && absentDays + leaveDays >= workingDays) {
          absentDays = 1;
          leaveDays = 0;
        }
      }

      if (absentDays + leaveDays >= workingDays) {
        absentDays = Math.max(0, workingDays - 2);
        leaveDays = 0;
      }
      const presentDays = Math.max(0, workingDays - absentDays - leaveDays);
      const pct = Math.round((presentDays / workingDays) * 1000) / 10;

      ytdWorking += workingDays;
      ytdPresent += presentDays;

      monthlyAttendance.push({
        id: `matt-${stu.id}-${month.toLowerCase()}`,
        schoolId: 'school-vis-jjr',
        studentId: stu.id,
        month,
        year: 2026,
        workingDays,
        presentDays,
        absentDays,
        leaveDays,
        attendancePct: pct,
      });
    }

    if (!existingCuratedSet.has(stu.id) && ytdWorking > 0) {
      stu.attendancePct = Math.round((ytdPresent / ytdWorking) * 1000) / 10;
    }

    // 2. Real Excel /80 Theory + UT Marks (from Virat_School_Complete_Single_Sheet_Sample.xlsx)
    //    strictly filtered to ONLY /80 Theory & UT marks; fallback to baseline UT for classes not yet in sheet.
    const excelMatch = findExcelRow(stu);
    const authoritativeExcelMarks = filterAuthoritativeVis80AndUtMarks(excelMatch?.marks);
    const coveredExamSubjectKeys = new Set<string>();

    if (excelMatch?.transportHint && !stu.address) {
      stu.address = toTitleCase(excelMatch.transportHint);
    }

    if (authoritativeExcelMarks.length > 0) {
      authoritativeExcelMarks.forEach((em, emIdx) => {
        const normSub = normalizeExcelSubject(em.subject);
        const dateStr =
          em.examName === 'Unit Test 1'
            ? '2026-05-22'
            : em.examName === 'Unit Test 2'
              ? '2026-08-21'
              : '2026-09-22';
        const pct = Math.round((em.obtainedMarks / em.maxMarks) * 100);
        coveredExamSubjectKeys.add(`${em.examName.toLowerCase()}::${normSub.toLowerCase()}`);
        examMarks.push({
          id: `mk-vis-xls-${stu.id}-${emIdx}`,
          schoolId: 'school-vis-jjr',
          studentId: stu.id,
          examName: em.examName,
          subject: normSub,
          maxMarks: em.maxMarks,
          obtainedMarks: em.obtainedMarks,
          date: dateStr,
          ...(pct < 55
            ? { conceptualGap: `${normSub} foundational concept reinforcement needed` }
            : {}),
        });
      });
    }

    // Build real Excel DMIT profile if student has DMIT quotients/VAK in sheet and no existing Drive PDF link
    if (excelMatch?.dmit && !stu.visReportFileId) {
      const dm = excelMatch.dmit;
      const hasAnyDmit =
        typeof dm.iq === 'number' ||
        typeof dm.visualPct === 'number' ||
        typeof dm.auditoryPct === 'number' ||
        typeof dm.kinestheticPct === 'number';
      if (hasAnyDmit) {
        const fid = `vis-excel-dmit-${stu.id}`;
        stu.visReportFileId = fid;
        const vPct = typeof dm.visualPct === 'number' ? dm.visualPct : null;
        const aPct = typeof dm.auditoryPct === 'number' ? dm.auditoryPct : null;
        const kPct = typeof dm.kinestheticPct === 'number' ? dm.kinestheticPct : null;
        const vakPairs = [
          { name: 'Visual' as const, val: vPct },
          { name: 'Auditory' as const, val: aPct },
          { name: 'Kinesthetic' as const, val: kPct },
        ].filter((x): x is { name: 'Visual' | 'Auditory' | 'Kinesthetic'; val: number } => x.val !== null);
        vakPairs.sort((a, b) => b.val - a.val);
        const domStyle = vakPairs[0]?.name ?? null;
        const xCodeChoices = [['X1', 'X2.1'], ['X2', 'X2.2'], ['X', 'X1']] as const;
        const isReflectiveX = h % 3 === 0 || (typeof dm.iq === 'number' && dm.iq >= 25 && dm.iq <= 27.5);
        const baseDmitProfile: VisParsedReportProfile = {
          fileId: fid,
          reportSubjectName: `${stu.name} (${stu.classSection})`,
          brainDominance: { leftPct: 51.5, rightPct: 48.5 },
          vak: { visualPct: vPct, auditoryPct: aPct, kinestheticPct: kPct, dominantStyle: domStyle },
          quotients: {
            iq: typeof dm.iq === 'number' ? dm.iq : null,
            eq: typeof dm.eq === 'number' ? dm.eq : null,
            aq: typeof dm.aq === 'number' ? dm.aq : null,
            cq: typeof dm.cq === 'number' ? dm.cq : null,
          },
          multipleIntelligences: {
            interpersonal: null,
            visualSpatial: null,
            bodilyKinesthetic: null,
            musical: null,
            intrapersonal: null,
            logicalMathematical: null,
            verbalLinguistic: null,
            naturalist: null,
          },
          topIntelligences: [],
          brainLobes: { action: null, thinking: null, tactile: null, auditory: null, visual: null },
          personality: {
            primaryTrait: isReflectiveX ? 'CAUTIOUS' : 'ADAPTIVE',
            secondaryTrait: 'STEADY',
            primaryBird: isReflectiveX ? 'Owl' : 'Dove',
            secondaryBird: 'Dove',
          },
          motiveThought: { motivePct: null, thoughtPct: null },
          leadership: { taskOrientedPct: null, relationshipOrientedPct: null },
          advisorySummary: buildAdvisorySummary({
            dominantStyle: domStyle,
            topIntelligences: [],
            primaryBird: isReflectiveX ? 'Owl' : 'Dove',
          }),
          extractedAt: '2026-11-28T13:45:00.000Z',
          extractionSource: 'preparsed_bundle',
        };
        excelDmitProfiles[fid] = enrichVisDmitProfileWithFingerprint(baseDmitProfile, {
          fingerprintCodes: isReflectiveX ? [...xCodeChoices[h % xCodeChoices.length]] : ['W1', 'U2'],
          acquiringStyle: isReflectiveX ? 'Reflective (Arch)' : 'Balanced',
        });
      }
    }

    // Baseline UT Marks (UT-1 May, UT-2 Aug, UT-3 Oct) for subjects not already populated from Excel
    const subjects = getSubjectsForClassSection(stu.classSection);
    const isPrePrimary = ['Nursery', 'LKG', 'UKG'].includes(stu.classSection);
    const utMax = isPrePrimary ? 25 : 40;
    const utCycles = [
      { name: 'Unit Test 1', date: '2026-05-19', delta: -3 },
      { name: 'Unit Test 2', date: '2026-08-18', delta: 0 },
      { name: 'Unit Test 3', date: '2026-11-18', delta: 2 },
    ];

    let ut3SumPct = 0;
    for (let uIdx = 0; uIdx < utCycles.length; uIdx += 1) {
      const cycle = utCycles[uIdx];
      for (let subIdx = 0; subIdx < subjects.length; subIdx += 1) {
        const sub = subjects[subIdx];
        if (coveredExamSubjectKeys.has(`${cycle.name.toLowerCase()}::${sub.toLowerCase()}`)) {
          continue;
        }
        const mh = deterministicHash(`${stu.id}:${cycle.name}:${sub}`);
        const subVariance = (mh % 15) - 7;
        const pct = Math.max(38, Math.min(98, basePerf + cycle.delta + subVariance));
        const obtained = Math.round((pct / 100) * utMax);
        const actualPct = Math.round((obtained / utMax) * 100);

        if (uIdx === 2) ut3SumPct += actualPct;

        examMarks.push({
          id: `mk-ut-${stu.id}-u${uIdx + 1}-${subIdx}`,
          schoolId: 'school-vis-jjr',
          studentId: stu.id,
          examName: cycle.name,
          subject: sub,
          maxMarks: utMax,
          obtainedMarks: obtained,
          date: cycle.date,
          ...(actualPct < 65
            ? { conceptualGap: `${sub} foundational concept reinforcement needed` }
            : {}),
        });
      }
    }

    // Add single validated UT-3 academic evidence entry for newly enrolled students so all classes rank in Learners Score
    if (!existingCuratedSet.has(stu.id) && subjects.length > 0) {
      const avgUt3 = Math.round(ut3SumPct / subjects.length);
      additionalExamEvidence.push({
        id: `ev-ut3-${stu.id}`,
        schoolId: 'school-vis-jjr',
        studentId: stu.id,
        sourceKey: `exam:${stu.id}:ut3:aggregate`,
        sourceType: 'exam',
        subject: subjects[0],
        date: '2026-10-26',
        summary: `Unit Test 3 Aggregate (${subjects.length} subjects): ${avgUt3}%`,
        olqContributions: {
          effective_intelligence: Math.max(52, Math.min(95, avgUt3)),
          reasoning_ability: Math.max(52, Math.min(95, avgUt3 - 1)),
        },
        componentContributions: { academic: avgUt3 },
        learningSignals: {
          independentTaskCompletion: Math.max(52, Math.min(94, avgUt3)),
        },
        enteredBy: VIS_CLASS_TEACHERS[stu.classSection] || 'Academic Cell',
        validated: true,
      });
    }

    // 3. Month-wise Reading Reports (April -> November 2026)
    const { min: minWpm, max: maxWpm } = baseWpmRange(stu.classSection);
    const readingAssessor = getReadingAssessor(stu.classSection);
    for (let mIdx = 0; mIdx < ACTIVE_SESSION_MONTHS.length; mIdx += 1) {
      const month = ACTIVE_SESSION_MONTHS[mIdx];
      const rh = deterministicHash(`${stu.id}:read:${month}`);
      const progressBoost = Math.round((mIdx - 3) * 1.1);
      const readingBase = Math.max(
        42,
        Math.min(98, basePerf + progressBoost + ((rh % 11) - 5)),
      );
      const accuracyPct = Math.max(44, Math.min(99, readingBase + ((rh % 7) - 3)));
      const comprehensionPct = Math.max(40, Math.min(98, readingBase + (((rh >> 3) % 9) - 4)));
      const overallPct = Math.round((accuracyPct * 0.5 + comprehensionPct * 0.5));
      const wpmRatio = Math.max(0.08, Math.min(1, (overallPct - 35) / 62));
      const wpm = Math.round(minWpm + (maxWpm - minWpm) * wpmRatio);
      const readingBand = computeReadingBand(overallPct);

      const remarks =
        overallPct < 65
          ? 'Practice daily read-aloud phonics blends & vocabulary comprehension.'
          : overallPct >= 85
            ? 'Fluent expression, clear punctuation pauses, and accurate comprehension.'
            : 'Steady reading pace; continue guided silent & oral comprehension.';

      readingReports.push({
        id: `read-${stu.id}-${month.toLowerCase()}`,
        schoolId: 'school-vis-jjr',
        studentId: stu.id,
        month,
        year: 2026,
        wpm,
        accuracyPct,
        comprehensionPct,
        overallPct,
        readingBand,
        remarks,
        assessedBy: readingAssessor,
        assessedAt: MONTH_DATES_2026[month],
      });
    }

    // 4. Month-wise Numeracy Reports (April -> November 2026)
    const numeracyAssessor = getNumeracyAssessor(stu.classSection);
    for (let mIdx = 0; mIdx < ACTIVE_SESSION_MONTHS.length; mIdx += 1) {
      const month = ACTIVE_SESSION_MONTHS[mIdx];
      const nh = deterministicHash(`${stu.id}:num:${month}`);
      const progressBoost = Math.round((mIdx - 3) * 1.2);
      const numBase = Math.max(
        40,
        Math.min(98, basePerf + progressBoost + ((nh % 13) - 6)),
      );
      const tablesFluencyPct = Math.max(38, Math.min(99, numBase + ((nh % 9) - 4)));
      const mentalMathPct = Math.max(40, Math.min(98, numBase + (((nh >> 2) % 9) - 4)));
      const problemSolvingPct = Math.max(38, Math.min(98, numBase + (((nh >> 4) % 11) - 5)));
      const overallPct = Math.round(
        tablesFluencyPct * 0.35 + mentalMathPct * 0.35 + problemSolvingPct * 0.3,
      );

      const conceptualGap =
        overallPct < 65
          ? tablesFluencyPct < mentalMathPct
            ? 'Multiplication tables & factor recall fluency'
            : 'Multi-step arithmetic word problem setup'
          : undefined;
      const remarks =
        overallPct < 65
          ? 'Recommended timed multiplication table sprints & step-wise practice.'
          : overallPct >= 85
            ? 'Strong mental calculation speed and accurate multi-step solving.'
            : 'Good arithmetic accuracy; build speed on mixed operation problems.';

      numeracyReports.push({
        id: `num-${stu.id}-${month.toLowerCase()}`,
        schoolId: 'school-vis-jjr',
        studentId: stu.id,
        month,
        year: 2026,
        tablesFluencyPct,
        mentalMathPct,
        problemSolvingPct,
        overallPct,
        ...(conceptualGap ? { conceptualGap } : {}),
        remarks,
        assessedBy: numeracyAssessor,
        assessedAt: MONTH_DATES_2026[month],
      });
    }
  }

  return {
    students: builtStudents,
    examMarks,
    readingReports,
    numeracyReports,
    monthlyAttendance,
    todayAttendance,
    additionalExamEvidence,
    csvAdmissionToStudentId,
    excelDmitProfiles,
  };
}
