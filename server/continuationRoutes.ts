import crypto from 'node:crypto';
import type { Express, RequestHandler } from 'express';
import type {
  AccountingEntry,
  AccountingEntryCategory,
  AccountingTaskItem,
  AttendanceSupportPatternType,
  AttendanceSupportRecord,
  AttendanceSupportStatus,
  BankReconciliationItem,
  LessonPlan,
  MindMapResourceItem,
  MindMapResourceType,
  MindMapStructure,
  PayrollRegisterEntry,
  StudentRecord,
  UserAccount,
  UserRole,
} from '../src/types';
import type {
  VcipAccessLogEntry,
  VcipProfileReleaseRecord,
  VcipProfileReleaseStatus,
} from '../src/types/vcip';
import { getDb, saveDb } from './store.ts';
import type { IntelligenceAuthedRequest } from './intelligenceRoutes.ts';
import {
  buildAiSuggestedMindMapDraft,
  inferMindMapFileFormat,
} from '../src/utils/mindMapResourceEngine.ts';
import {
  canRoleTransitionVcipStatus,
  canUserViewStudentVcipProfile,
} from '../src/utils/vcipReleaseGovernanceEngine.ts';
import {
  canPerformFinanceAction,
  extractAccountingDraftFromDocument,
  validateAccountingEntryMutation,
  validatePayrollApproval,
} from '../src/utils/accountantRbacEngine.ts';
import type { ExpenseClassification } from '../src/types';
import {
  GeminiApiError,
  categorizeExpensesWithGemini,
} from './gemini.ts';
import {
  buildSalaryModificationAuditRecord,
  hasSalaryValuesChanged,
} from '../src/utils/salaryAuditLog.ts';
import {
  inferBankNameFromIfsc,
  normalizeIfscCode,
  parseVisExpenseSheetCsv,
} from '../src/utils/visSalaryExpenseParser.ts';
import { mapStaffRoleCategoryToPayrollType } from '../src/utils/campusAdminEngine.ts';

export interface ContinuationRouteDeps {
  requireAuth: RequestHandler;
  requireRoles: (roles: UserRole[]) => RequestHandler;
  appendAuditLog: (params: {
    schoolId: string | null;
    actor: NonNullable<IntelligenceAuthedRequest['user']>;
    action: string;
    entityType: string;
    entityId: string;
    detail: string;
  }) => void;
}

// ============================================================================
// SEED HELPERS (Multi-Tenant, Realistic Operational Records)
// ============================================================================

export function createInitialAttendanceSupportRecords(params: {
  schoolIds: string[];
  students: StudentRecord[];
}): AttendanceSupportRecord[] {
  const out: AttendanceSupportRecord[] = [];
  for (const schoolId of params.schoolIds) {
    const scoped = params.students.filter((s) => s.schoolId === schoolId);
    const candidates = scoped
      .filter((s) => s.attendancePct < 88)
      .slice(0, 3);
    const chosen = candidates.length > 0 ? candidates : scoped.slice(0, 2);

    chosen.forEach((stu, idx) => {
      out.push({
        id: `att-sup-${schoolId}-${stu.id}`,
        schoolId,
        studentId: stu.id,
        studentName: stu.name,
        classSection: stu.classSection,
        patternTypes:
          idx === 0
            ? ['consecutive_absences', 'threshold_watch']
            : ['monday_friday_pattern'],
        indicatorSummary:
          idx === 0
            ? 'Observed consecutive absence cluster in November — recommended for supportive class teacher check-in.'
            : 'Observed recurring Monday/Friday absence pattern — suggested for parent schedule check-in.',
        status: idx === 0 ? 'Teacher Observing' : 'Parent Contacted',
        referredToCounsellor: idx === 0,
        parentCommunicationNote:
          idx === 1
            ? 'Spoke with guardian on 18 Nov; transport pickup timing adjusted for winter fog.'
            : undefined,
        followUpAction:
          idx === 0
            ? 'Class teacher 5-minute welcome check-in and remedial chapter recap'
            : 'Monitor next two Mondays and confirm regular bus pickup',
        nextCheckInDate: '2026-11-25',
        createdBy: 'Academic Coordinator',
        createdAt: '2026-11-16T09:00:00.000Z',
        updatedAt: '2026-11-19T11:30:00.000Z',
        history: [
          {
            id: `hist-${schoolId}-${stu.id}-1`,
            timestamp: '2026-11-16T09:00:00.000Z',
            actorName: 'Attendance Indicator Engine',
            actorRole: 'coordinator',
            actionType: 'alert_opened',
            note: 'Objective attendance pattern flagged for human teacher review (non-diagnostic).',
          },
          {
            id: `hist-${schoolId}-${stu.id}-2`,
            timestamp: '2026-11-18T10:15:00.000Z',
            actorName: 'Praveen Kumar Kaushik',
            actorRole: 'teacher',
            actionType: idx === 0 ? 'teacher_observation' : 'parent_communication',
            note:
              idx === 0
                ? 'Student returned calmly; missed 3 days due to seasonal fever. Shared notebook recap sheet.'
                : 'Guardian confirmed family travel over two weekends; committed to full attendance ahead of UT-3.',
          },
        ],
      });
    });
  }
  return out;
}

export function createInitialMindMapResources(
  schoolIds: string[],
): MindMapResourceItem[] {
  const out: MindMapResourceItem[] = [];
  for (const schoolId of schoolIds) {
    out.push(
      {
        id: `mm-${schoolId}-sci-10`,
        schoolId,
        academicSession: '2026-27',
        classSection: '10-A',
        subject: 'Science',
        chapter: 'Chapter 1: Chemical Reactions & Equations',
        topic: 'Reaction Types & Balancing',
        language: 'English',
        teacherId: 'usr-teacher-vis',
        teacherName: 'Praveen Kumar Kaushik',
        resourceType: 'mind_map',
        title: 'Chemical Reactions — Complete Visual Mind Map',
        description:
          'Covers Combination, Decomposition, Displacement, Double Displacement, and Redox reactions with balancing checklist.',
        fileName: 'Class10_Ch1_Chemical_Reactions_MindMap.pdf',
        fileFormat: 'PDF',
        keywords: ['Chemical Reactions', 'Redox', 'Balancing', 'HBSE Class 10'],
        learningObjectives: [
          'Classify any chemical equation into the 5 core reaction types',
          'Balance equations systematically by conserving atom counts',
        ],
        aiAssisted: true,
        aiDraftApprovedByTeacher: true,
        structure: {
          centralConcept: 'Chemical Reactions & Equations',
          branches: [
            {
              id: 'b1',
              title: '1. Core Reaction Types',
              relationLabel: 'classified into',
              subtopics: ['Combination (A + B → AB)', 'Decomposition (Thermal, Electrolytic, Photolytic)', 'Single & Double Displacement'],
            },
            {
              id: 'b2',
              title: '2. Oxidation & Reduction',
              relationLabel: 'transfers',
              subtopics: ['Gain of Oxygen / Loss of Hydrogen', 'Oxidising vs Reducing Agents', 'Corrosion & Rancidity in daily life'],
            },
            {
              id: 'b3',
              title: '3. Balancing Method',
              relationLabel: 'enforces',
              subtopics: ['Law of Conservation of Mass', 'Count atoms on LHS vs RHS', 'Balance metals → non-metals → H & O'],
            },
          ],
          definitions: [
            { term: 'Redox Reaction', meaning: 'Reaction in which oxidation and reduction occur simultaneously.' },
            { term: 'Exothermic Reaction', meaning: 'Reaction that releases heat energy along with product formation.' },
          ],
          flowchartSteps: [
            'Write skeletal equation with correct formulae',
            'List element atom counts on LHS and RHS',
            'Adjust stoichiometric coefficients (never subscripts)',
            'Verify physical state symbols (s), (l), (g), (aq)',
          ],
          revisionSummary: [
            'All precipitation reactions are double displacement reactions.',
            'Antioxidants and nitrogen flushing prevent food rancidity.',
          ],
        },
        status: 'approved',
        approvedBy: 'Dr. Deepak Dhawan',
        approvedAt: '2026-11-10T09:15:00.000Z',
        version: 2,
        versionHistory: [
          {
            version: 1,
            updatedAt: '2026-11-08T11:00:00.000Z',
            updatedBy: 'Praveen Kumar Kaushik',
            status: 'draft',
            changeNote: 'Initial AI-assisted structure drafted from NCERT Chapter 1 notes.',
          },
          {
            version: 2,
            updatedAt: '2026-11-10T09:15:00.000Z',
            updatedBy: 'Dr. Deepak Dhawan',
            status: 'approved',
            changeNote: 'Verified equations and approved for student & parent download.',
          },
        ],
        bookmarkedByUserIds: ['usr-student-vis'],
        createdAt: '2026-11-08T11:00:00.000Z',
        updatedAt: '2026-11-10T09:15:00.000Z',
      },
      {
        id: `mm-${schoolId}-math-6`,
        schoolId,
        academicSession: '2026-27',
        classSection: '6-A',
        subject: 'Mathematics',
        chapter: 'Chapter 7: Fractions',
        topic: 'Equivalent Fractions & Operations',
        language: 'Bilingual',
        teacherId: 'usr-teacher-vis',
        teacherName: 'Praveen Kumar Kaushik',
        resourceType: 'concept_map',
        title: 'Fractions Concept Map (English & हिन्दी)',
        description:
          'Visual hierarchy of Proper, Improper, Mixed Fractions, LCM addition, and daily-life bar models for Class 6.',
        fileName: 'Class6_Fractions_ConceptMap.png',
        fileFormat: 'PNG',
        keywords: ['Fractions', 'LCM', 'Mixed Numbers', 'Class 6 Maths'],
        learningObjectives: [
          'Convert between improper and mixed fractions accurately',
          'Add and subtract unlike fractions using LCM',
        ],
        aiAssisted: false,
        aiDraftApprovedByTeacher: true,
        structure: {
          centralConcept: 'Fractions (भिन्न)',
          branches: [
            {
              id: 'b1',
              title: '1. Types of Fractions',
              relationLabel: 'grouped as',
              subtopics: ['Proper (Numerator < Denominator)', 'Improper (Numerator ≥ Denominator)', 'Mixed (Whole + Proper)'],
            },
            {
              id: 'b2',
              title: '2. Equivalent & Simplest Form',
              relationLabel: 'simplified via',
              subtopics: ['Multiply/Divide top & bottom by same number', 'Divide by HCF for lowest terms'],
            },
            {
              id: 'b3',
              title: '3. Addition & Subtraction',
              relationLabel: 'requires',
              subtopics: ['Like denominators: operate numerators directly', 'Unlike denominators: find LCM first'],
            },
          ],
          definitions: [
            { term: 'Equivalent Fractions', meaning: 'Different fractions representing the exact same part of a whole.' },
          ],
          flowchartSteps: [
            'Check if denominators are equal',
            'If unequal, compute LCM of denominators',
            'Convert to equivalent fractions & add/subtract numerators',
            'Simplify final answer using HCF',
          ],
          revisionSummary: [
            'Always check if the final fraction can be reduced to simplest form.',
          ],
        },
        status: 'approved',
        approvedBy: 'Sunita Devi Ahlawat',
        approvedAt: '2026-11-12T10:00:00.000Z',
        version: 1,
        versionHistory: [
          {
            version: 1,
            updatedAt: '2026-11-12T10:00:00.000Z',
            updatedBy: 'Sunita Devi Ahlawat',
            status: 'approved',
            changeNote: 'Teacher-uploaded visual map approved for Class 6-A.',
          },
        ],
        bookmarkedByUserIds: ['usr-student-vis', 'usr-parent-vis'],
        createdAt: '2026-11-11T14:20:00.000Z',
        updatedAt: '2026-11-12T10:00:00.000Z',
      },
      {
        id: `mm-${schoolId}-sst-9`,
        schoolId,
        academicSession: '2026-27',
        classSection: '9-A',
        subject: 'Social Science',
        chapter: 'Chapter 1: The French Revolution',
        topic: 'Causes, Timeline & Legacy',
        language: 'English',
        teacherId: 'usr-teacher-vis',
        teacherName: 'Praveen Kumar Kaushik',
        resourceType: 'chapter_summary',
        title: 'French Revolution Timeline & Cause-Effect Map (Awaiting Review)',
        description:
          'AI-assisted timeline draft edited by teacher; submitted for Academic Coordinator review before student publication.',
        fileName: 'Class9_French_Revolution_Summary.pptx',
        fileFormat: 'PPTX',
        keywords: ['French Revolution', 'Three Estates', '1789', 'Constitution'],
        learningObjectives: [
          'Trace economic, social, and political causes of 1789',
          'Explain the Declaration of the Rights of Man and Citizen',
        ],
        aiAssisted: true,
        aiDraftApprovedByTeacher: true,
        structure: {
          centralConcept: 'The French Revolution (1789)',
          branches: [
            {
              id: 'b1',
              title: '1. Three Estates & Inequality',
              relationLabel: 'sparked by',
              subtopics: ['1st Estate (Clergy) & 2nd Estate (Nobility) tax-exempt', '3rd Estate paid Taille & Tithe', 'Subsistence crisis & bread prices'],
            },
            {
              id: 'b2',
              title: '2. Key Milestones (1789–1799)',
              relationLabel: 'progressed through',
              subtopics: ['14 July 1789: Storming of the Bastille', '1791 Constitutional Monarchy', '1793–94 Reign of Terror & Directory'],
            },
          ],
          definitions: [
            { term: 'Subsistence Crisis', meaning: 'Extreme situation where basic means of livelihood are endangered.' },
          ],
          flowchartSteps: [
            'Empty Treasury & Tax Burden on 3rd Estate',
            'Estates-General Walkout & Tennis Court Oath',
            'Fall of Bastille & Abolition of Feudal System',
            'Rise of Democratic Rights & Abolition of Slavery',
          ],
          revisionSummary: [
            'Liberty, Equality, and Fraternity shaped modern democratic constitutions worldwide.',
          ],
        },
        status: 'pending_review',
        version: 1,
        versionHistory: [
          {
            version: 1,
            updatedAt: '2026-11-19T12:10:00.000Z',
            updatedBy: 'Praveen Kumar Kaushik',
            status: 'pending_review',
            changeNote: 'Submitted edited AI-assisted summary for Coordinator approval.',
          },
        ],
        bookmarkedByUserIds: [],
        createdAt: '2026-11-19T12:00:00.000Z',
        updatedAt: '2026-11-19T12:10:00.000Z',
      },
    );
  }
  return out;
}

export function createInitialVcipReleaseRecords(params: {
  schoolIds: string[];
  students: StudentRecord[];
}): {
  releaseRecords: VcipProfileReleaseRecord[];
  accessLogs: VcipAccessLogEntry[];
} {
  const releaseRecords: VcipProfileReleaseRecord[] = [];
  const accessLogs: VcipAccessLogEntry[] = [];

  for (const schoolId of params.schoolIds) {
    const scoped = params.students.filter((s) => s.schoolId === schoolId);
    const prioritized = [
      ...scoped.filter((s) => ['stu-vis-601', 'stu-vis-602', 'stu-vis-902'].includes(s.id)),
      ...scoped.slice(0, 6),
    ];
    const unique = Array.from(new Map(prioritized.map((s) => [s.id, s])).values()).slice(0, 8);

    unique.forEach((stu, idx) => {
      // Make Abhiraj (stu-vis-601) and Hardik (stu-vis-602) published so student/parent portals show live approved reports,
      // and leave Jasika (stu-vis-902) & others in pending_approval / under_review so Principal approval workflow can be demonstrated!
      const status: VcipProfileReleaseStatus =
        stu.id === 'stu-vis-601' || stu.id === 'stu-vis-602' || idx === 0
          ? 'published'
          : stu.id === 'stu-vis-902' || idx === 2
            ? 'pending_approval'
            : 'under_review';

      releaseRecords.push({
        id: `vcip-rel-${schoolId}-${stu.id}`,
        schoolId,
        studentId: stu.id,
        studentName: stu.name,
        classSection: stu.classSection,
        status,
        sharedCounsellorObservations:
          status === 'published'
            ? `${stu.name} shows steady longitudinal gains in visual pattern reasoning and structured verbal logic. Continue 5-minute Daily Brain Gym spatial & memory warm-ups.`
            : `Assessment completed across 6 domains; counsellor drafting parent-friendly recommendations.`,
        internalCounsellorNote:
          'INTERNAL ONLY: Monitor timed processing pacing in next 1-on-1 check-in; do not share clinical pacing raw timing until follow-up session.',
        recommendedExercises: [
          'Daily Brain Gym — 5-minute Spatial Rotation & Working Memory warm-up (4 days/week)',
          'Explain 2 solved maths/science steps aloud to strengthen verbal-quantitative bridge',
          'Weekly 10-minute puzzle or chess/pattern reflection exercise at home',
        ],
        parentConsentGranted: true,
        reviewedBy: 'School Counsellor',
        reviewedAt: '2026-11-15T10:00:00.000Z',
        approvedBy: status === 'published' ? 'Dr. Deepak Dhawan' : undefined,
        approvedAt: status === 'published' ? '2026-11-16T14:30:00.000Z' : undefined,
        updatedAt: '2026-11-16T14:30:00.000Z',
      });

      if (status === 'published') {
        accessLogs.push({
          id: `vcip-log-${schoolId}-${stu.id}-pub`,
          schoolId,
          studentId: stu.id,
          accessorUserId: 'usr-principal-vis',
          accessorName: 'Dr. Deepak Dhawan',
          accessorRole: 'principal',
          action: 'published',
          detail: 'Approved & published VCIP developmental report for student and linked parent access.',
          timestamp: '2026-11-16T14:30:00.000Z',
        });
      }
    });
  }

  return { releaseRecords, accessLogs };
}

export function createInitialAccountingBundle(schoolIds: string[]): {
  accountingEntries: AccountingEntry[];
  payrollRegisters: PayrollRegisterEntry[];
  bankReconciliationItems: BankReconciliationItem[];
  accountingTasks: AccountingTaskItem[];
} {
  const accountingEntries: AccountingEntry[] = [];
  const payrollRegisters: PayrollRegisterEntry[] = [];
  const bankReconciliationItems: BankReconciliationItem[] = [];
  const accountingTasks: AccountingTaskItem[] = [];

  for (const schoolId of schoolIds) {
    const e1Id = `acc-${schoolId}-01`;
    const e2Id = `acc-${schoolId}-02`;
    const e3Id = `acc-${schoolId}-03`;
    const e4Id = `acc-${schoolId}-04`;
    const e5Id = `acc-${schoolId}-05`;

    accountingEntries.push(
      {
        id: e1Id,
        schoolId,
        date: '2026-11-21',
        monthKey: '2026-11',
        category: 'Fee Collection',
        direction: 'Income',
        vendorOrParty: 'Daily Counter & UPI Fee Batch (Class 6–10)',
        description: 'Consolidated morning fee receipts reconciled against student ledgers',
        amountInr: 48500,
        paymentMode: 'UPI',
        supportingDocName: 'fee-batch-21nov.xlsx',
        status: 'submitted',
        periodLocked: false,
        createdBy: 'Suresh Kumar',
        createdByRole: 'accountant',
        createdAt: '2026-11-21T09:30:00.000Z',
      },
      {
        id: e2Id,
        schoolId,
        date: '2026-11-20',
        monthKey: '2026-11',
        category: 'Bus Fuel Expense',
        direction: 'Expense',
        vendorOrParty: 'Jhajjar Highway HPCL Station',
        busCode: 'BUS-03',
        description: 'Diesel refill — Route 3 (Jhajjar–Bahadurgarh Road, 72 Litres)',
        amountInr: 6480,
        paymentMode: 'UPI',
        supportingDocName: 'hpcl-bus03-20nov.pdf',
        extractedByAi: true,
        status: 'submitted',
        periodLocked: false,
        createdBy: 'Suresh Kumar',
        createdByRole: 'accountant',
        createdAt: '2026-11-20T15:10:00.000Z',
      },
      {
        id: e3Id,
        schoolId,
        date: '2026-11-19',
        monthKey: '2026-11',
        category: 'Maintenance Expense',
        direction: 'Expense',
        vendorOrParty: 'Shree Balaji Bus Workshop',
        busCode: 'BUS-01',
        description: 'Brake pad replacement & periodic safety inspection for Bus 01',
        amountInr: 4200,
        paymentMode: 'Bank Transfer',
        status: 'draft',
        periodLocked: false,
        createdBy: 'Suresh Kumar',
        createdByRole: 'accountant',
        createdAt: '2026-11-19T14:00:00.000Z',
      },
      {
        id: e4Id,
        schoolId,
        date: '2026-11-18',
        monthKey: '2026-11',
        category: 'Vendor Purchase',
        direction: 'Expense',
        vendorOrParty: 'Haryana Educational Stationers',
        description: 'Exam answer booklets, science lab consumables & chalk cartons',
        amountInr: 12600,
        paymentMode: 'Bank Transfer',
        supportingDocName: 'invoice-hes-884.pdf',
        status: 'approved',
        periodLocked: false,
        createdBy: 'Suresh Kumar',
        createdByRole: 'accountant',
        createdAt: '2026-11-18T11:00:00.000Z',
        approvedBy: 'Dr. Deepak Dhawan',
        approvedAt: '2026-11-18T16:45:00.000Z',
      },
      {
        id: e5Id,
        schoolId,
        date: '2026-10-31',
        monthKey: '2026-10',
        category: 'Teacher Payroll',
        direction: 'Expense',
        vendorOrParty: 'October Faculty Salary Disbursement (Locked Period)',
        description: 'October 2026 closed & locked faculty payroll disbursement',
        amountInr: 486000,
        paymentMode: 'Bank Transfer',
        supportingDocName: 'oct-2026-payroll-signed.pdf',
        status: 'approved',
        periodLocked: true,
        createdBy: 'Suresh Kumar',
        createdByRole: 'accountant',
        createdAt: '2026-10-30T10:00:00.000Z',
        approvedBy: 'Dr. Deepak Dhawan',
        approvedAt: '2026-10-31T13:00:00.000Z',
      },
    );

    payrollRegisters.push(
      {
        id: `pay-${schoolId}-t1`,
        schoolId,
        monthLabel: 'November 2026',
        staffName: 'Praveen Kumar Kaushik',
        staffRoleType: 'Teacher',
        designation: 'Senior Mathematics & Science Teacher',
        daysWorked: 26,
        grossSalaryInr: 36000,
        deductionsInr: 1800,
        netPayableInr: 34200,
        status: 'submitted',
        preparedBy: 'Suresh Kumar',
      },
      {
        id: `pay-${schoolId}-t2`,
        schoolId,
        monthLabel: 'November 2026',
        staffName: 'Pooja Dhillon',
        staffRoleType: 'Teacher',
        designation: 'Science Teacher',
        daysWorked: 25,
        grossSalaryInr: 31000,
        deductionsInr: 1550,
        netPayableInr: 29450,
        status: 'submitted',
        preparedBy: 'Suresh Kumar',
      },
      {
        id: `pay-${schoolId}-d1`,
        schoolId,
        monthLabel: 'November 2026',
        staffName: 'Ramesh Chander',
        staffRoleType: 'Driver',
        designation: 'School Bus Driver (BUS-03)',
        daysWorked: 26,
        grossSalaryInr: 18500,
        deductionsInr: 500,
        netPayableInr: 18000,
        status: 'submitted',
        preparedBy: 'Suresh Kumar',
      },
      {
        id: `pay-${schoolId}-d2`,
        schoolId,
        monthLabel: 'November 2026',
        staffName: 'Sandeep Singh',
        staffRoleType: 'Driver',
        designation: 'School Bus Driver (BUS-01)',
        daysWorked: 26,
        grossSalaryInr: 18500,
        deductionsInr: 500,
        netPayableInr: 18000,
        status: 'draft',
        preparedBy: 'Suresh Kumar',
      },
    );

    bankReconciliationItems.push(
      {
        id: `bank-${schoolId}-01`,
        schoolId,
        txnDate: '2026-11-21',
        bankRef: 'HDFC-UPI-883421',
        narration: 'UPI Settlement Batch — School Fee Collection',
        direction: 'Credit',
        amountInr: 48500,
        matchStatus: 'Unmatched',
      },
      {
        id: `bank-${schoolId}-02`,
        schoolId,
        txnDate: '2026-11-20',
        bankRef: 'HDFC-UPI-882109',
        narration: 'HPCL Highway Fuel Station Jhajjar',
        direction: 'Debit',
        amountInr: 6480,
        matchStatus: 'Unmatched',
      },
      {
        id: `bank-${schoolId}-03`,
        schoolId,
        txnDate: '2026-11-18',
        bankRef: 'NEFT-HES-992104',
        narration: 'Haryana Educational Stationers Invoice 884',
        direction: 'Debit',
        amountInr: 12600,
        matchStatus: 'Matched',
        matchedEntryId: e4Id,
        reconciledBy: 'Suresh Kumar',
        reconciledAt: '2026-11-19T10:00:00.000Z',
      },
    );

    accountingTasks.push(
      {
        id: `task-${schoolId}-01`,
        schoolId,
        title: 'Reconcile November UPI Fee Batch & Bus-03 Fuel Debit',
        category: 'Bank Reconciliation',
        dueDate: '2026-11-23',
        assignedBy: 'Dr. Deepak Dhawan',
        assignedTo: 'Suresh Kumar',
        status: 'In Progress',
        notes: 'Verify HDFC statement references before monthly closing.',
        updatedAt: '2026-11-21T08:00:00.000Z',
      },
      {
        id: `task-${schoolId}-02`,
        schoolId,
        title: 'Attach Missing Invoice for Bus-01 Brake Maintenance (₹4,200)',
        category: 'Supporting Documents',
        dueDate: '2026-11-24',
        assignedBy: 'Rameshwar Dayal Kaushik',
        assignedTo: 'Suresh Kumar',
        status: 'Open',
        notes: 'Upload workshop receipt PDF before submitting for Principal approval.',
        updatedAt: '2026-11-20T16:00:00.000Z',
      },
      {
        id: `task-${schoolId}-03`,
        schoolId,
        title: 'Finalize November Teacher & Driver Payroll Register',
        category: 'Payroll Preparation',
        dueDate: '2026-11-27',
        assignedBy: 'Dr. Deepak Dhawan',
        assignedTo: 'Suresh Kumar',
        status: 'Open',
        notes: 'Submit completed register for Principal approval.',
        updatedAt: '2026-11-20T11:00:00.000Z',
      },
    );
  }

  return {
    accountingEntries,
    payrollRegisters,
    bankReconciliationItems,
    accountingTasks,
  };
}

// ============================================================================
// EXPRESS ROUTE REGISTRATION
// ============================================================================

export function registerContinuationRoutes(
  app: Express,
  deps: ContinuationRouteDeps,
): void {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // ---------------- PART 1: ATTENDANCE HEATMAP SUPPORT & FOLLOW-UP ----------------
  app.post(
    '/api/attendance/support',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher', 'counsellor']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const {
        studentId,
        patternTypes,
        indicatorSummary,
        status,
        referredToCounsellor,
        teacherObservation,
        parentCommunicationNote,
        followUpAction,
        nextCheckInDate,
      } = req.body as {
        studentId?: string;
        patternTypes?: AttendanceSupportPatternType[];
        indicatorSummary?: string;
        status?: AttendanceSupportStatus;
        referredToCounsellor?: boolean;
        teacherObservation?: string;
        parentCommunicationNote?: string;
        followUpAction?: string;
        nextCheckInDate?: string;
      };

      const student = db.students.find(
        (s) => s.id === studentId && s.schoolId === schoolId,
      );
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school tenant.' });
        return;
      }

      if (!Array.isArray(db.attendanceSupportRecords)) {
        db.attendanceSupportRecords = [];
      }

      const now = new Date().toISOString();
      let existing = db.attendanceSupportRecords.find(
        (r) => r.schoolId === schoolId && r.studentId === student.id,
      );

      if (!existing) {
        existing = {
          id: `att-sup-${Date.now().toString(36)}`,
          schoolId,
          studentId: student.id,
          studentName: student.name,
          classSection: student.classSection,
          patternTypes: patternTypes?.length ? patternTypes : ['threshold_watch'],
          indicatorSummary:
            indicatorSummary?.trim() ||
            'Objective attendance indicator logged for supportive follow-up.',
          status: status || 'Teacher Observing',
          referredToCounsellor: Boolean(referredToCounsellor),
          parentCommunicationNote: parentCommunicationNote?.trim() || undefined,
          followUpAction: followUpAction?.trim() || undefined,
          nextCheckInDate: nextCheckInDate?.trim() || undefined,
          createdBy: user.name,
          createdAt: now,
          updatedAt: now,
          history: [],
        };
        db.attendanceSupportRecords.unshift(existing);
      } else {
        if (patternTypes?.length) existing.patternTypes = patternTypes;
        if (indicatorSummary?.trim()) existing.indicatorSummary = indicatorSummary.trim();
        if (status) existing.status = status;
        if (typeof referredToCounsellor === 'boolean') {
          existing.referredToCounsellor = referredToCounsellor;
        }
        if (parentCommunicationNote !== undefined) {
          existing.parentCommunicationNote = parentCommunicationNote.trim() || undefined;
        }
        if (followUpAction !== undefined) {
          existing.followUpAction = followUpAction.trim() || undefined;
        }
        if (nextCheckInDate !== undefined) {
          existing.nextCheckInDate = nextCheckInDate.trim() || undefined;
        }
        existing.updatedAt = now;
      }

      const pushHistory = (
        actionType: AttendanceSupportRecord['history'][number]['actionType'],
        note: string,
      ) => {
        existing!.history.unshift({
          id: `hist-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
          timestamp: now,
          actorName: user.name,
          actorRole: user.role,
          actionType,
          note,
        });
      };

      if (teacherObservation?.trim()) {
        pushHistory('teacher_observation', teacherObservation.trim());
      }
      if (referredToCounsellor) {
        pushHistory(
          'counsellor_referral',
          `Referred to School Counsellor for supportive check-in (${existing.status}).`,
        );
      }
      if (parentCommunicationNote?.trim()) {
        pushHistory('parent_communication', parentCommunicationNote.trim());
      }
      if (followUpAction?.trim()) {
        pushHistory('follow_up_action', followUpAction.trim());
      }
      if (existing.history.length === 0) {
        pushHistory('status_updated', `Support record updated to ${existing.status}.`);
      }

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'ATTENDANCE_SUPPORT_UPDATED',
        entityType: 'AttendanceSupportRecord',
        entityId: existing.id,
        detail: `Logged attendance follow-up for ${student.name} (${student.classSection}) — status: ${existing.status}.`,
      });

      saveDb(db);
      res.status(201).json({ record: existing });
    },
  );

  // ---------------- PART 2: MIND MAPS IN ACADEMIC RESOURCES ----------------
  app.post(
    '/api/mindmaps/ai-suggest',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: IntelligenceAuthedRequest, res) => {
      const { subject, classSection, chapter, topic, sourceMaterialText, fileName } =
        req.body as {
          subject?: string;
          classSection?: string;
          chapter?: string;
          topic?: string;
          sourceMaterialText?: string;
          fileName?: string;
        };

      if (!subject?.trim() || !chapter?.trim()) {
        res.status(400).json({ error: 'Subject and Chapter are required to generate an AI draft.' });
        return;
      }

      const draft = buildAiSuggestedMindMapDraft({
        subject: subject.trim(),
        classSection: (classSection || '10-A').trim(),
        chapter: chapter.trim(),
        topic: topic?.trim(),
        sourceMaterialText: (sourceMaterialText || '').slice(0, 12000),
        fileName: fileName?.trim(),
      });

      res.json({
        draft,
        humanApprovalRequired: true,
        notice:
          'AI-assisted suggestion generated as an editable draft. Teacher review and approval are required before students can view it.',
      });
    },
  );

  app.post(
    '/api/mindmaps',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const body = req.body as {
        academicSession?: string;
        classSection?: string;
        subject?: string;
        chapter?: string;
        topic?: string;
        language?: 'English' | 'Hindi' | 'Bilingual';
        resourceType?: MindMapResourceType;
        title?: string;
        description?: string;
        fileName?: string;
        fileDataUrl?: string;
        keywords?: string[];
        learningObjectives?: string[];
        aiAssisted?: boolean;
        aiDraftApprovedByTeacher?: boolean;
        structure?: MindMapStructure;
        submitForReview?: boolean;
      };

      if (!body.title?.trim() || !body.subject?.trim() || !body.chapter?.trim()) {
        res.status(400).json({ error: 'Title, Subject, and Chapter are required.' });
        return;
      }

      // Guard fileDataUrl to safe data: URLs only (block javascript: / html injection)
      let safeFileDataUrl: string | undefined;
      if (typeof body.fileDataUrl === 'string' && body.fileDataUrl.length > 0) {
        if (
          /^data:(application\/pdf|image\/(png|jpeg|jpg|webp)|application\/vnd\.|application\/msword|text\/plain);base64,/i.test(
            body.fileDataUrl,
          ) &&
          body.fileDataUrl.length <= 2_500_000
        ) {
          safeFileDataUrl = body.fileDataUrl;
        } else {
          res.status(400).json({
            error: 'Unsupported file payload or file exceeds 2MB size limit.',
          });
          return;
        }
      }

      const now = new Date().toISOString();
      // NEVER auto-publish AI-assisted resources without teacher review & coordinator/principal approval
      const status = body.submitForReview ? 'pending_review' : 'draft';
      const item: MindMapResourceItem = {
        id: `mm-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
        schoolId,
        academicSession: (body.academicSession || '2026-27').trim(),
        classSection: (body.classSection || '10-A').trim(),
        subject: body.subject.trim(),
        chapter: body.chapter.trim(),
        topic: (body.topic || body.chapter).trim(),
        language: body.language || 'English',
        teacherId: user.id,
        teacherName: user.name,
        resourceType: body.resourceType || 'mind_map',
        title: body.title.trim(),
        description: (body.description || '').trim(),
        fileName: body.fileName?.trim() || undefined,
        fileFormat: inferMindMapFileFormat(body.fileName),
        fileDataUrl: safeFileDataUrl,
        keywords: Array.isArray(body.keywords)
          ? body.keywords.map((k) => k.trim()).filter(Boolean)
          : [],
        learningObjectives: Array.isArray(body.learningObjectives)
          ? body.learningObjectives.map((k) => k.trim()).filter(Boolean)
          : [],
        aiAssisted: Boolean(body.aiAssisted),
        aiDraftApprovedByTeacher: Boolean(body.aiDraftApprovedByTeacher || !body.aiAssisted),
        structure: body.structure,
        status,
        version: 1,
        versionHistory: [
          {
            version: 1,
            updatedAt: now,
            updatedBy: user.name,
            status,
            changeNote: body.submitForReview
              ? 'Submitted for academic review.'
              : 'Saved as teacher draft.',
          },
        ],
        bookmarkedByUserIds: [],
        createdAt: now,
        updatedAt: now,
      };

      if (!Array.isArray(db.mindMapResources)) db.mindMapResources = [];
      db.mindMapResources.unshift(item);

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'MINDMAP_CREATED',
        entityType: 'MindMapResourceItem',
        entityId: item.id,
        detail: `Created ${item.resourceType} "${item.title}" (${item.classSection} ${item.subject}) as ${status}.`,
      });

      saveDb(db);
      res.status(201).json({ resource: item });
    },
  );

  app.patch(
    '/api/mindmaps/:id',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      const item = (db.mindMapResources || []).find(
        (m) => m.id === req.params.id && m.schoolId === schoolId,
      );
      if (!item) {
        res.status(404).json({ error: 'Mind map resource not found.' });
        return;
      }
      if (user.role === 'teacher' && item.teacherId !== user.id) {
        res.status(403).json({ error: 'Teachers can only edit their own mind map submissions.' });
        return;
      }

      const body = req.body as Partial<MindMapResourceItem> & {
        changeNote?: string;
        submitForReview?: boolean;
      };
      const now = new Date().toISOString();
      if (body.title?.trim()) item.title = body.title.trim();
      if (body.description !== undefined) item.description = body.description.trim();
      if (body.topic?.trim()) item.topic = body.topic.trim();
      if (body.structure) item.structure = body.structure;
      if (Array.isArray(body.keywords)) item.keywords = body.keywords;
      if (Array.isArray(body.learningObjectives)) {
        item.learningObjectives = body.learningObjectives;
      }
      item.aiDraftApprovedByTeacher = true;
      if (body.submitForReview) {
        item.status = 'pending_review';
      }
      item.version += 1;
      item.updatedAt = now;
      item.versionHistory.unshift({
        version: item.version,
        updatedAt: now,
        updatedBy: user.name,
        status: item.status,
        changeNote: body.changeNote?.trim() || 'Edited by teacher.',
      });

      saveDb(db);
      res.json({ resource: item });
    },
  );

  app.post(
    '/api/mindmaps/:id/decision',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      const item = (db.mindMapResources || []).find(
        (m) => m.id === req.params.id && m.schoolId === schoolId,
      );
      if (!item) {
        res.status(404).json({ error: 'Mind map resource not found.' });
        return;
      }
      const { decision, reviewNote } = req.body as {
        decision?: 'approved' | 'rejected';
        reviewNote?: string;
      };
      if (decision !== 'approved' && decision !== 'rejected') {
        res.status(400).json({ error: 'Decision must be approved or rejected.' });
        return;
      }

      const now = new Date().toISOString();
      item.status = decision;
      item.reviewNote = reviewNote?.trim() || undefined;
      if (decision === 'approved') {
        item.approvedBy = user.name;
        item.approvedAt = now;
      }
      item.version += 1;
      item.updatedAt = now;
      item.versionHistory.unshift({
        version: item.version,
        updatedAt: now,
        updatedBy: user.name,
        status: decision,
        changeNote:
          reviewNote?.trim() ||
          (decision === 'approved'
            ? 'Approved for student & parent access.'
            : 'Returned to teacher for revision.'),
      });

      appendAuditLog({
        schoolId,
        actor: user,
        action: decision === 'approved' ? 'MINDMAP_APPROVED' : 'MINDMAP_REJECTED',
        entityType: 'MindMapResourceItem',
        entityId: item.id,
        detail: `${decision.toUpperCase()} mind map "${item.title}" (${item.classSection} ${item.subject}).`,
      });

      saveDb(db);
      res.json({ resource: item });
    },
  );

  app.post('/api/mindmaps/:id/bookmark', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const user = req.user!;
    const schoolId = req.activeSchoolId || user.schoolId;
    const item = (db.mindMapResources || []).find(
      (m) => m.id === req.params.id && m.schoolId === schoolId,
    );
    if (!item) {
      res.status(404).json({ error: 'Mind map resource not found.' });
      return;
    }
    if ((user.role === 'student' || user.role === 'parent') && item.status !== 'approved') {
      res.status(403).json({ error: 'Only approved resources can be accessed.' });
      return;
    }
    const idx = item.bookmarkedByUserIds.indexOf(user.id);
    if (idx >= 0) {
      item.bookmarkedByUserIds.splice(idx, 1);
    } else {
      item.bookmarkedByUserIds.push(user.id);
    }
    saveDb(db);
    res.json({ bookmarked: idx < 0, bookmarkedByUserIds: item.bookmarkedByUserIds });
  });

  // ---------------- PART 6: VCIP COGNITIVE PROFILE RELEASE GOVERNANCE & LOGGING ----------------
  app.post(
    '/api/vcip/profiles/:studentId/workflow',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'counsellor']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const student = db.students.find(
        (s) => s.id === req.params.studentId && s.schoolId === schoolId,
      );
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      const {
        status,
        sharedCounsellorObservations,
        internalCounsellorNote,
        recommendedExercises,
        rejectionReason,
      } = req.body as {
        status?: VcipProfileReleaseStatus;
        sharedCounsellorObservations?: string;
        internalCounsellorNote?: string;
        recommendedExercises?: string[];
        rejectionReason?: string;
      };

      const targetStatus: VcipProfileReleaseStatus = status || 'under_review';
      const perm = canRoleTransitionVcipStatus({
        role: user.role,
        targetStatus,
      });
      if (!perm.allowed) {
        res.status(403).json({ error: perm.reason });
        return;
      }

      if (!Array.isArray(db.vcipReleaseRecords)) db.vcipReleaseRecords = [];
      if (!Array.isArray(db.vcipAccessLogs)) db.vcipAccessLogs = [];

      const now = new Date().toISOString();
      let record = db.vcipReleaseRecords.find(
        (r) => r.schoolId === schoolId && r.studentId === student.id,
      );
      if (!record) {
        record = {
          id: `vcip-rel-${Date.now().toString(36)}`,
          schoolId,
          studentId: student.id,
          studentName: student.name,
          classSection: student.classSection,
          status: targetStatus,
          sharedCounsellorObservations: sharedCounsellorObservations?.trim() || '',
          internalCounsellorNote: internalCounsellorNote?.trim() || undefined,
          recommendedExercises: Array.isArray(recommendedExercises)
            ? recommendedExercises.filter(Boolean)
            : [],
          parentConsentGranted: true,
          updatedAt: now,
        };
        db.vcipReleaseRecords.unshift(record);
      } else {
        record.status = targetStatus;
        if (sharedCounsellorObservations !== undefined) {
          record.sharedCounsellorObservations = sharedCounsellorObservations.trim();
        }
        if (internalCounsellorNote !== undefined) {
          record.internalCounsellorNote = internalCounsellorNote.trim() || undefined;
        }
        if (Array.isArray(recommendedExercises)) {
          record.recommendedExercises = recommendedExercises.filter(Boolean);
        }
        record.updatedAt = now;
      }

      if (targetStatus === 'under_review' || targetStatus === 'pending_approval') {
        record.reviewedBy = user.name;
        record.reviewedAt = now;
      }
      if (targetStatus === 'approved' || targetStatus === 'published') {
        record.approvedBy = user.name;
        record.approvedAt = now;
        record.revokedBy = undefined;
        record.revokedAt = undefined;
      }
      if (targetStatus === 'revoked') {
        record.revokedBy = user.name;
        record.revokedAt = now;
      }
      if (targetStatus === 'rejected') {
        record.rejectionReason = rejectionReason?.trim() || 'Returned for counsellor revision.';
      }

      const logAction: VcipAccessLogEntry['action'] =
        targetStatus === 'published'
          ? 'published'
          : targetStatus === 'approved'
            ? 'approved'
            : targetStatus === 'revoked'
              ? 'revoked'
              : targetStatus === 'rejected'
                ? 'rejected'
                : 'submitted_for_approval';

      db.vcipAccessLogs.unshift({
        id: `vcip-log-${Date.now().toString(36)}`,
        schoolId,
        studentId: student.id,
        accessorUserId: user.id,
        accessorName: user.name,
        accessorRole: user.role,
        action: logAction,
        detail: `Set VCIP profile status for ${student.name} to ${targetStatus}.`,
        timestamp: now,
      });

      appendAuditLog({
        schoolId,
        actor: user,
        action: `VCIP_PROFILE_${targetStatus.toUpperCase()}`,
        entityType: 'VcipProfileReleaseRecord',
        entityId: record.id,
        detail: `Updated VCIP release status for ${student.name} (${student.classSection}) to ${targetStatus}.`,
      });

      saveDb(db);
      res.json({ record });
    },
  );

  app.post('/api/vcip/profiles/:studentId/access-log', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const user = req.user!;
    const schoolId = req.activeSchoolId || user.schoolId;
    if (!schoolId) {
      res.status(400).json({ error: 'Active school context required.' });
      return;
    }

    const releaseRecord = (db.vcipReleaseRecords || []).find(
      (r) => r.schoolId === schoolId && r.studentId === req.params.studentId,
    );
    const check = canUserViewStudentVcipProfile({
      user,
      studentId: req.params.studentId,
      releaseRecord,
    });
    if (!check.allowed) {
      res.status(403).json({ error: check.reason });
      return;
    }

    if (!Array.isArray(db.vcipAccessLogs)) db.vcipAccessLogs = [];
    const entry: VcipAccessLogEntry = {
      id: `vcip-log-${Date.now().toString(36)}`,
      schoolId,
      studentId: req.params.studentId,
      accessorUserId: user.id,
      accessorName: user.name,
      accessorRole: user.role,
      action: 'viewed_report',
      detail: `${user.name} (${user.role}) viewed approved VCIP Cognitive Intelligence Profile.`,
      timestamp: new Date().toISOString(),
    };
    db.vcipAccessLogs.unshift(entry);
    saveDb(db);
    res.status(201).json({ entry });
  });

  app.post(
    '/api/vcip/profiles/:studentId/consent',
    requireAuth,
    requireRoles(['parent', 'principal', 'school_admin', 'super_admin']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      if (user.role === 'parent' && !(user.linkedStudentIds || []).includes(req.params.studentId)) {
        res.status(403).json({ error: 'Parents may only update consent for linked children.' });
        return;
      }
      const record = (db.vcipReleaseRecords || []).find(
        (r) => r.schoolId === schoolId && r.studentId === req.params.studentId,
      );
      if (!record) {
        res.status(404).json({ error: 'VCIP release record not found.' });
        return;
      }
      const { parentConsentGranted } = req.body as { parentConsentGranted?: boolean };
      record.parentConsentGranted = Boolean(parentConsentGranted);
      record.updatedAt = new Date().toISOString();
      if (!Array.isArray(db.vcipAccessLogs)) db.vcipAccessLogs = [];
      db.vcipAccessLogs.unshift({
        id: `vcip-log-${Date.now().toString(36)}`,
        schoolId: schoolId || record.schoolId,
        studentId: record.studentId,
        accessorUserId: user.id,
        accessorName: user.name,
        accessorRole: user.role,
        action: 'consent_updated',
        detail: `Parent cognitive report consent set to ${record.parentConsentGranted ? 'Granted' : 'Withheld'}.`,
        timestamp: record.updatedAt,
      });
      saveDb(db);
      res.json({ record });
    },
  );

  // ---------------- PART 7: ACCOUNTANT PROVISIONING & FINANCE 360° APIs ----------------
  app.post(
    '/api/users/provision-accountant',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const actor = req.user!;
      const schoolId = req.activeSchoolId || actor.schoolId;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school tenant required.' });
        return;
      }

      const { name, email, designation } = req.body as {
        name?: string;
        email?: string;
        designation?: string;
      };
      if (!name?.trim() || !email?.trim() || !email.includes('@')) {
        res.status(400).json({ error: 'Valid full name and institutional email are required.' });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        res.status(409).json({ error: 'An account with this email already exists.' });
        return;
      }

      const newUser: UserAccount = {
        id: `usr-acc-${Date.now().toString(36)}`,
        name: name.trim(),
        email: normalizedEmail,
        role: 'accountant',
        schoolId,
        designation: (designation || 'School Accountant (Finance 360°)').trim(),
      };
      db.users.push(newUser);

      appendAuditLog({
        schoolId,
        actor,
        action: 'ACCOUNTANT_PROVISIONED',
        entityType: 'UserAccount',
        entityId: newUser.id,
        detail: `Provisioned Accountant role for ${newUser.name} (${newUser.email}) with Finance 360° operational permissions (segregation of duties enforced).`,
      });

      saveDb(db);
      res.status(201).json({
        user: newUser,
        invitationNotice:
          'Accountant provisioned in school tenant with zero shared credentials; user signs in via institutional auth pathway.',
      });
    },
  );

  app.post(
    '/api/accounting/entries',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    async (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const body = req.body as {
        date?: string;
        category?: AccountingEntryCategory;
        direction?: 'Income' | 'Expense';
        vendorOrParty?: string;
        busCode?: string;
        description?: string;
        amountInr?: number;
        paymentMode?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
        chequeOrRefNo?: string;
        supportingDocName?: string;
        extractedByAi?: boolean;
        expenseClassification?: ExpenseClassification;
        expenseClassificationReason?: string;
        autoCategorizeWithGemini?: boolean;
        submitForApproval?: boolean;
      };

      const amount = Math.round(Number(body.amountInr));
      if (!body.vendorOrParty?.trim() || !Number.isFinite(amount) || amount <= 0) {
        res.status(400).json({ error: 'Vendor/Party and a positive INR amount are required.' });
        return;
      }

      const dateStr = (body.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
      const monthKey = dateStr.slice(0, 7);

      // Block creating entries inside a locked financial period
      const isPeriodLocked = (db.accountingEntries || []).some(
        (e) => e.schoolId === schoolId && e.monthKey === monthKey && e.periodLocked,
      );
      if (isPeriodLocked && user.role !== 'super_admin') {
        res.status(403).json({
          error: `Financial period ${monthKey} is locked. New entries cannot be posted into a closed period.`,
        });
        return;
      }

      const direction = body.direction || 'Expense';
      const entryId = `acc-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;
      const validClassifications: ExpenseClassification[] = [
        'Operational',
        'Administrative',
        'Developmental',
      ];
      let expenseClassification: ExpenseClassification | undefined =
        direction === 'Expense' &&
        body.expenseClassification &&
        validClassifications.includes(body.expenseClassification)
          ? body.expenseClassification
          : undefined;
      let expenseClassificationReason = body.expenseClassificationReason?.trim() || undefined;
      let expenseClassifiedBy: 'gemini' | 'manual' | undefined = expenseClassification
        ? 'manual'
        : undefined;
      let expenseClassifiedAt = expenseClassification ? new Date().toISOString() : undefined;
      let geminiWarning: string | undefined;

      if (direction === 'Expense' && body.autoCategorizeWithGemini && !expenseClassification) {
        try {
          const aiRes = await categorizeExpensesWithGemini([
            {
              id: entryId,
              date: dateStr,
              vendorOrParty: body.vendorOrParty.trim(),
              description: (body.description || '').trim() || body.vendorOrParty.trim(),
              category: body.category || 'Vendor Purchase',
              amountInr: amount,
              paymentMode: body.paymentMode || 'UPI',
            },
          ]);
          const first = aiRes.results[0];
          if (first) {
            expenseClassification = first.classification;
            expenseClassificationReason = first.reason;
            expenseClassifiedBy = 'gemini';
            expenseClassifiedAt = aiRes.categorizedAt;
          }
        } catch (err) {
          geminiWarning =
            err instanceof Error
              ? err.message
              : 'Gemini automated categorization could not run for this entry.';
        }
      }

      const entry: AccountingEntry = {
        id: entryId,
        schoolId,
        date: dateStr,
        monthKey,
        category: body.category || 'Vendor Purchase',
        direction,
        vendorOrParty: body.vendorOrParty.trim(),
        busCode: body.busCode?.trim() || undefined,
        description: (body.description || '').trim() || body.vendorOrParty.trim(),
        amountInr: amount,
        paymentMode: body.paymentMode || 'UPI',
        chequeOrRefNo: body.chequeOrRefNo?.trim() || undefined,
        supportingDocName: body.supportingDocName?.trim() || undefined,
        extractedByAi: Boolean(body.extractedByAi),
        expenseClassification,
        expenseClassificationReason,
        expenseClassifiedBy,
        expenseClassifiedAt,
        sheetSource: 'manual',
        // Segregation of duties: Accountants NEVER auto-approve
        status: body.submitForApproval ? 'submitted' : 'draft',
        periodLocked: false,
        createdBy: user.name,
        createdByRole: user.role,
        createdAt: new Date().toISOString(),
      };

      if (!Array.isArray(db.accountingEntries)) db.accountingEntries = [];
      db.accountingEntries.unshift(entry);

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'ACCOUNTING_ENTRY_CREATED',
        entityType: 'AccountingEntry',
        entityId: entry.id,
        detail: `Recorded ${entry.direction} (${entry.category}${entry.expenseClassification ? ` · ${entry.expenseClassification}` : ''}) ₹${entry.amountInr} — ${entry.vendorOrParty} [${entry.status}].`,
      });

      saveDb(db);
      res.status(201).json({ entry, geminiWarning });
    },
  );

  // Update open accounting entry or manually set/override Operational / Administrative / Developmental label
  app.patch(
    '/api/accounting/entries/:id',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      const entry = (db.accountingEntries || []).find(
        (e) => e.id === req.params.id && e.schoolId === schoolId,
      );
      if (!entry) {
        res.status(404).json({ error: 'Accounting entry not found.' });
        return;
      }
      if (entry.periodLocked && user.role !== 'super_admin') {
        res.status(403).json({ error: 'This financial period is locked and cannot be modified.' });
        return;
      }

      const body = req.body as Partial<AccountingEntry>;
      const validClassifications: ExpenseClassification[] = [
        'Operational',
        'Administrative',
        'Developmental',
      ];
      const isOnlyClassificationChange =
        body.expenseClassification !== undefined &&
        body.amountInr === undefined &&
        body.vendorOrParty === undefined &&
        body.date === undefined;

      // Accountants cannot alter financial amounts of already-approved vouchers, but may label/classify expenses
      if (
        !isOnlyClassificationChange &&
        entry.status === 'approved' &&
        !canPerformFinanceAction(user.role, 'approve_accounting_entry').allowed
      ) {
        res.status(403).json({
          error: 'Only Principal or School Admin may modify financial figures on an approved entry.',
        });
        return;
      }

      if (body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date.trim())) {
        entry.date = body.date.trim();
        entry.monthKey = entry.date.slice(0, 7);
      }
      if (body.category) entry.category = body.category;
      if (body.direction === 'Income' || body.direction === 'Expense') {
        entry.direction = body.direction;
      }
      if (body.vendorOrParty?.trim()) entry.vendorOrParty = body.vendorOrParty.trim();
      if (body.description !== undefined) entry.description = body.description.trim();
      if (body.amountInr !== undefined) {
        const amt = Math.round(Number(body.amountInr));
        if (!Number.isFinite(amt) || amt <= 0) {
          res.status(400).json({ error: 'Amount must be a positive number.' });
          return;
        }
        entry.amountInr = amt;
      }
      if (body.paymentMode) entry.paymentMode = body.paymentMode;
      if (body.chequeOrRefNo !== undefined) {
        entry.chequeOrRefNo = body.chequeOrRefNo.trim() || undefined;
      }
      if (body.busCode !== undefined) {
        entry.busCode = body.busCode.trim() || undefined;
      }
      if (body.expenseClassification !== undefined) {
        if (validClassifications.includes(body.expenseClassification)) {
          entry.expenseClassification = body.expenseClassification;
          entry.expenseClassificationReason =
            body.expenseClassificationReason?.trim() ||
            `Manually labeled as ${body.expenseClassification} by ${user.name}.`;
          entry.expenseClassifiedBy = 'manual';
          entry.expenseClassifiedAt = new Date().toISOString();
        }
      }

      appendAuditLog({
        schoolId: entry.schoolId,
        actor: user,
        action: 'ACCOUNTING_ENTRY_UPDATED',
        entityType: 'AccountingEntry',
        entityId: entry.id,
        detail: `Updated voucher ${entry.vendorOrParty} (₹${entry.amountInr.toLocaleString('en-IN')}${entry.expenseClassification ? ` · ${entry.expenseClassification}` : ''}).`,
      });
      saveDb(db);
      res.json({ entry });
    },
  );

  // Automated Gemini Expense Categorization ('Operational' | 'Administrative' | 'Developmental')
  app.post(
    '/api/accounting/entries/categorize-ai',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    async (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const body = (req.body || {}) as {
        mode?: 'unclassified' | 'all' | 'selected' | 'preview';
        entryIds?: string[];
        monthKey?: string;
        items?: Array<{
          id: string;
          date?: string;
          vendorOrParty: string;
          description: string;
          category?: string;
          amountInr?: number;
          paymentMode?: string;
        }>;
      };

      const mode = body.mode || 'unclassified';

      try {
        if (mode === 'preview') {
          const items = Array.isArray(body.items) ? body.items : [];
          if (items.length === 0) {
            res.status(400).json({ error: 'Provide at least one expense row to categorize.' });
            return;
          }
          const aiRes = await categorizeExpensesWithGemini(items);
          res.json({
            ok: true,
            mode: 'preview',
            model: aiRes.model,
            categorizedAt: aiRes.categorizedAt,
            categorizedCount: aiRes.results.length,
            results: aiRes.results,
          });
          return;
        }

        const schoolExpenses = (db.accountingEntries || []).filter(
          (e) =>
            e.schoolId === schoolId &&
            e.direction === 'Expense' &&
            e.status !== 'rejected' &&
            (!body.monthKey || body.monthKey === 'ALL' || e.monthKey === body.monthKey),
        );

        let targetEntries: AccountingEntry[] = [];
        if (Array.isArray(body.entryIds) && body.entryIds.length > 0) {
          const idSet = new Set(body.entryIds);
          targetEntries = schoolExpenses.filter((e) => idSet.has(e.id));
        } else if (mode === 'all') {
          targetEntries = schoolExpenses;
        } else {
          targetEntries = schoolExpenses.filter((e) => !e.expenseClassification);
        }

        if (targetEntries.length === 0) {
          res.json({
            ok: true,
            model: 'gemini-4-hydrogen',
            categorizedCount: 0,
            message: 'All matching expense rows are already categorized.',
            breakdown: { Operational: 0, Administrative: 0, Developmental: 0 },
            results: [],
          });
          return;
        }

        const aiRes = await categorizeExpensesWithGemini(
          targetEntries.map((e) => ({
            id: e.id,
            date: e.date,
            vendorOrParty: e.vendorOrParty,
            description: e.description,
            category: e.category,
            amountInr: e.amountInr,
            paymentMode: e.paymentMode,
          })),
        );

        const resultById = new Map(aiRes.results.map((r) => [r.id, r]));
        const breakdown = { Operational: 0, Administrative: 0, Developmental: 0 };
        let updatedCount = 0;

        for (const entry of targetEntries) {
          const hit = resultById.get(entry.id);
          if (!hit) continue;
          entry.expenseClassification = hit.classification;
          entry.expenseClassificationReason = hit.reason;
          entry.expenseClassifiedBy = 'gemini';
          entry.expenseClassifiedAt = aiRes.categorizedAt;
          breakdown[hit.classification] += 1;
          updatedCount += 1;
        }

        appendAuditLog({
          schoolId,
          actor: user,
          action: 'GEMINI_EXPENSES_CATEGORIZED',
          entityType: 'AccountingEntry',
          entityId: `gemini-exp-${Date.now().toString(36)}`,
          detail: `Gemini (${aiRes.model}) labeled ${updatedCount} expense rows: ${breakdown.Operational} Operational, ${breakdown.Administrative} Administrative, ${breakdown.Developmental} Developmental.`,
        });
        saveDb(db);

        res.json({
          ok: true,
          model: aiRes.model,
          categorizedAt: aiRes.categorizedAt,
          categorizedCount: updatedCount,
          breakdown,
          results: aiRes.results,
        });
      } catch (err) {
        if (err instanceof GeminiApiError) {
          res.status(err.statusCode).json({ error: err.message });
          return;
        }
        res.status(502).json({
          error:
            err instanceof Error
              ? err.message
              : 'Unable to categorize expenses with Gemini API.',
        });
      }
    },
  );

  // Import updated monthly VIS Expense Sheet CSV (+ optional immediate Gemini categorization)
  app.post(
    '/api/accounting/entries/import-sheet',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    async (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const { csvText, replaceSheetEntries, autoCategorizeWithGemini } = (req.body || {}) as {
        csvText?: string;
        replaceSheetEntries?: boolean;
        autoCategorizeWithGemini?: boolean;
      };

      if (!csvText?.trim()) {
        res.status(400).json({ error: 'CSV content is required to import the expenses sheet.' });
        return;
      }

      const parsed = parseVisExpenseSheetCsv(csvText, schoolId, 'csv_import');
      if (parsed.entries.length === 0) {
        res.status(400).json({
          error:
            'No valid income or expense rows detected. Upload a monthly VIS expense sheet CSV (MONTH, DATE, DESCRIPTION, PIAD BY CHEQUE, DEBIT, CREDIT, BALANCE).',
        });
        return;
      }

      if (!Array.isArray(db.accountingEntries)) db.accountingEntries = [];

      if (replaceSheetEntries) {
        db.accountingEntries = db.accountingEntries.filter(
          (e) => !(e.schoolId === schoolId && (e.sheetSource === 'vis_expense_2026_27' || e.sheetSource === 'csv_import')),
        );
      }

      const existingIds = new Set(db.accountingEntries.map((e) => e.id));
      const inserted: AccountingEntry[] = [];
      for (const item of parsed.entries) {
        const finalId = existingIds.has(item.id)
          ? `${item.id}-${Date.now().toString(36)}`
          : item.id;
        existingIds.add(finalId);
        const entry: AccountingEntry = {
          ...item,
          id: finalId,
          createdBy: user.name,
          createdByRole: user.role,
        };
        db.accountingEntries.unshift(entry);
        inserted.push(entry);
      }

      let categorizedCount = 0;
      let geminiError: string | undefined;
      const breakdown = { Operational: 0, Administrative: 0, Developmental: 0 };

      if (autoCategorizeWithGemini) {
        const importedExpenses = inserted.filter((e) => e.direction === 'Expense');
        if (importedExpenses.length > 0) {
          try {
            const aiRes = await categorizeExpensesWithGemini(
              importedExpenses.map((e) => ({
                id: e.id,
                date: e.date,
                vendorOrParty: e.vendorOrParty,
                description: e.description,
                category: e.category,
                amountInr: e.amountInr,
                paymentMode: e.paymentMode,
              })),
            );
            const byId = new Map(aiRes.results.map((r) => [r.id, r]));
            for (const exp of importedExpenses) {
              const hit = byId.get(exp.id);
              if (!hit) continue;
              exp.expenseClassification = hit.classification;
              exp.expenseClassificationReason = hit.reason;
              exp.expenseClassifiedBy = 'gemini';
              exp.expenseClassifiedAt = aiRes.categorizedAt;
              breakdown[hit.classification] += 1;
              categorizedCount += 1;
            }
          } catch (err) {
            geminiError =
              err instanceof Error
                ? err.message
                : 'Gemini categorization failed for imported rows.';
          }
        }
      }

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'IMPORTED_EXPENSE_SHEET_CSV',
        entityType: 'AccountingEntry',
        entityId: `exp-sheet-${Date.now().toString(36)}`,
        detail: `Imported ${inserted.length} ledger rows (Income ₹${parsed.totalIncomeInr.toLocaleString('en-IN')}, Expense ₹${parsed.totalExpenseInr.toLocaleString('en-IN')})${categorizedCount > 0 ? ` and Gemini-labeled ${categorizedCount} expenses` : ''}.`,
      });
      saveDb(db);

      res.status(201).json({
        ok: true,
        importedCount: inserted.length,
        totalIncomeInr: parsed.totalIncomeInr,
        totalExpenseInr: parsed.totalExpenseInr,
        monthCount: parsed.monthSummaries.length,
        categorizedCount,
        breakdown,
        geminiError,
      });
    },
  );

  app.post(
    '/api/accounting/entries/:id/decision',
    requireAuth,
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      const entry = (db.accountingEntries || []).find(
        (e) => e.id === req.params.id && e.schoolId === schoolId,
      );
      if (!entry) {
        res.status(404).json({ error: 'Accounting entry not found.' });
        return;
      }
      const { decision, rejectionReason } = req.body as {
        decision?: 'approved' | 'rejected';
        rejectionReason?: string;
      };
      if (decision !== 'approved' && decision !== 'rejected') {
        res.status(400).json({ error: 'Decision must be approved or rejected.' });
        return;
      }

      const guard = validateAccountingEntryMutation({
        role: user.role,
        actorName: user.name,
        entry,
        mutation: decision === 'approved' ? 'approve' : 'reject',
      });
      if (!guard.allowed) {
        res.status(403).json({ error: guard.reason });
        return;
      }

      const now = new Date().toISOString();
      entry.status = decision;
      if (decision === 'approved') {
        entry.approvedBy = user.name;
        entry.approvedAt = now;
        entry.rejectionReason = undefined;
      } else {
        entry.rejectionReason = rejectionReason?.trim() || 'Returned by Principal for clarification.';
      }

      appendAuditLog({
        schoolId: entry.schoolId,
        actor: user,
        action: decision === 'approved' ? 'ACCOUNTING_ENTRY_APPROVED' : 'ACCOUNTING_ENTRY_REJECTED',
        entityType: 'AccountingEntry',
        entityId: entry.id,
        detail: `${decision.toUpperCase()} accounting entry ₹${entry.amountInr} (${entry.vendorOrParty}).`,
      });

      saveDb(db);
      res.json({ entry });
    },
  );

  app.delete('/api/accounting/entries/:id', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const user = req.user!;
    const schoolId = req.activeSchoolId || user.schoolId;
    const idx = (db.accountingEntries || []).findIndex(
      (e) => e.id === req.params.id && e.schoolId === schoolId,
    );
    if (idx < 0) {
      res.status(404).json({ error: 'Accounting entry not found.' });
      return;
    }
    const entry = db.accountingEntries[idx];
    const guard = validateAccountingEntryMutation({
      role: user.role,
      actorName: user.name,
      entry,
      mutation: 'delete',
    });
    if (!guard.allowed) {
      res.status(403).json({ error: guard.reason });
      return;
    }
    db.accountingEntries.splice(idx, 1);
    saveDb(db);
    res.json({ deleted: true });
  });

  app.post(
    '/api/accounting/payroll',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const body = req.body as {
        monthLabel?: string;
        staffName?: string;
        staffRoleType?: 'Teacher' | 'Driver' | 'Support Staff';
        designation?: string;
        daysWorked?: number;
        grossSalaryInr?: number;
        deductionsInr?: number;
        submitForApproval?: boolean;
      };
      const gross = Math.round(Number(body.grossSalaryInr));
      const deductions = Math.max(0, Math.round(Number(body.deductionsInr || 0)));
      if (!body.staffName?.trim() || !Number.isFinite(gross) || gross <= 0) {
        res.status(400).json({ error: 'Staff name and valid gross salary are required.' });
        return;
      }

      const row: PayrollRegisterEntry = {
        id: `pay-${Date.now().toString(36)}`,
        schoolId,
        monthLabel: (body.monthLabel || 'November 2026').trim(),
        staffName: body.staffName.trim(),
        staffRoleType: body.staffRoleType || 'Teacher',
        designation: (body.designation || body.staffRoleType || 'Staff').trim(),
        daysWorked: Math.min(31, Math.max(0, Number(body.daysWorked ?? 26))),
        grossSalaryInr: gross,
        deductionsInr: deductions,
        netPayableInr: Math.max(0, gross - deductions),
        status: body.submitForApproval ? 'submitted' : 'draft',
        preparedBy: user.name,
      };
      if (!Array.isArray(db.payrollRegisters)) db.payrollRegisters = [];
      db.payrollRegisters.unshift(row);

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'PAYROLL_PREPARED',
        entityType: 'PayrollRegisterEntry',
        entityId: row.id,
        detail: `Prepared ${row.staffRoleType} payroll for ${row.staffName} (Net ₹${row.netPayableInr}) [${row.status}].`,
      });
      saveDb(db);
      res.status(201).json({ payroll: row });
    },
  );

  app.post(
    '/api/accounting/payroll/:id/approve',
    requireAuth,
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      const row = (db.payrollRegisters || []).find(
        (p) => p.id === req.params.id && p.schoolId === schoolId,
      );
      if (!row) {
        res.status(404).json({ error: 'Payroll entry not found.' });
        return;
      }
      const guard = validatePayrollApproval({ role: user.role, entry: row });
      if (!guard.allowed) {
        res.status(403).json({ error: guard.reason });
        return;
      }
      row.status = 'approved';
      row.approvedBy = user.name;
      row.approvedAt = new Date().toISOString();
      appendAuditLog({
        schoolId,
        actor: user,
        action: 'PAYROLL_APPROVED',
        entityType: 'PayrollRegisterEntry',
        entityId: row.id,
        detail: `Approved payroll for ${row.staffName} (${row.monthLabel}) — Net ₹${row.netPayableInr}.`,
      });
      saveDb(db);
      res.json({ payroll: row });
    },
  );

  // Full school staff roster for 1-click Whole-Staff Bulk Salary Sheet
  app.get(
    '/api/accounting/staff-roster',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const existingPayrolls = (db.payrollRegisters || []).filter((p) => p.schoolId === schoolId);
      const latestByName = new Map<string, PayrollRegisterEntry>();
      for (const p of existingPayrolls) {
        const key = p.staffName.trim().toLowerCase();
        if (!latestByName.has(key)) {
          latestByName.set(key, p);
        }
      }

      const defaultGrossForRole = (role: string): number => {
        switch (role) {
          case 'principal':
          case 'school_admin':
            return 58000;
          case 'coordinator':
            return 42000;
          case 'counsellor':
          case 'clinical_specialist':
            return 38000;
          case 'teacher':
            return 32000;
          case 'accountant':
          case 'transport_incharge':
            return 28000;
          case 'driver':
            return 18500;
          default:
            return 14500;
        }
      };

      const roleToStaffType = (role: string): 'Teacher' | 'Driver' | 'Support Staff' => {
        if (role === 'driver') return 'Driver';
        if (
          role === 'accountant' ||
          role === 'transport_incharge' ||
          role === 'attendant' ||
          role === 'school_admin'
        ) {
          return 'Support Staff';
        }
        return 'Teacher';
      };

      interface RosterCandidate {
        staffName: string;
        staffRoleType: 'Teacher' | 'Driver' | 'Support Staff';
        designation: string;
        bankAccountNumber?: string;
        ifscCode?: string;
        bankName?: string;
        daysWorked: number;
        grossSalaryInr: number;
        deductionsInr: number;
        source: 'staff_sheet' | 'user_account' | 'transport_fleet' | 'payroll_history';
      }

      const rosterMap = new Map<string, RosterCandidate>();

      // 0. Authoritative Staff Profiles (including VIS 2026-27 Salary & Bank Account Sheet)
      const schoolProfiles = (db.staffProfiles || []).filter(
        (p) => p.schoolId === schoolId && p.active,
      );
      for (const p of schoolProfiles) {
        const name = p.name.trim();
        if (!name) continue;
        const key = name.toLowerCase();
        const prev = latestByName.get(key);
        const gross =
          prev?.grossSalaryInr ?? Math.round(p.baseMonthlySalaryInr + p.fixedAllowanceInr);
        const deductions = prev?.deductionsInr ?? Math.round(p.pfOrDeductionInr);
        rosterMap.set(key, {
          staffName: name,
          staffRoleType: prev?.staffRoleType ?? mapStaffRoleCategoryToPayrollType(p.roleType),
          designation: prev?.designation || p.designation,
          bankAccountNumber: p.bankAccountNumber || prev?.bankAccountNumber,
          ifscCode: p.ifscCode || prev?.ifscCode,
          bankName: p.bankName || prev?.bankName,
          daysWorked: prev?.daysWorked ?? p.workingDaysPerMonth ?? 26,
          grossSalaryInr: gross,
          deductionsInr: deductions,
          source: 'staff_sheet',
        });
      }

      // 1. All school staff user accounts (excluding parents & students)
      const staffUsers = (db.users || []).filter(
        (u) => u.schoolId === schoolId && u.role !== 'parent' && u.role !== 'student',
      );
      for (const u of staffUsers) {
        const name = (u.name || '').trim();
        if (!name) continue;
        const key = name.toLowerCase();
        if (rosterMap.has(key)) continue;
        const prev = latestByName.get(key);
        const gross = prev?.grossSalaryInr ?? defaultGrossForRole(u.role);
        const deductions = prev?.deductionsInr ?? (gross >= 30000 ? 1800 : 800);
        rosterMap.set(key, {
          staffName: name,
          staffRoleType: prev?.staffRoleType ?? roleToStaffType(u.role),
          designation:
            prev?.designation ||
            u.designation ||
            (u.subjectSpecialty ? `${u.subjectSpecialty} Teacher` : u.role.replace(/_/g, ' ')),
          bankAccountNumber: prev?.bankAccountNumber,
          ifscCode: prev?.ifscCode,
          bankName: prev?.bankName,
          daysWorked: prev?.daysWorked ?? 26,
          grossSalaryInr: gross,
          deductionsInr: deductions,
          source: 'user_account',
        });
      }

      // 2. Bus drivers & bus attendants from Transport Fleet
      const schoolRoutes = (db.busRoutes || []).filter((r) => r.schoolId === schoolId);
      for (const route of schoolRoutes) {
        if (route.driverName?.trim()) {
          const name = route.driverName.trim();
          const key = name.toLowerCase();
          if (!rosterMap.has(key)) {
            const prev = latestByName.get(key);
            rosterMap.set(key, {
              staffName: name,
              staffRoleType: 'Driver',
              designation: prev?.designation || `Bus Driver (${route.busNumber})`,
              bankAccountNumber: prev?.bankAccountNumber,
              ifscCode: prev?.ifscCode,
              bankName: prev?.bankName,
              daysWorked: prev?.daysWorked ?? 26,
              grossSalaryInr: prev?.grossSalaryInr ?? 18500,
              deductionsInr: prev?.deductionsInr ?? 500,
              source: 'transport_fleet',
            });
          }
        }
        if (route.attendantName?.trim()) {
          const name = route.attendantName.trim();
          const key = name.toLowerCase();
          if (!rosterMap.has(key)) {
            const prev = latestByName.get(key);
            rosterMap.set(key, {
              staffName: name,
              staffRoleType: 'Support Staff',
              designation: prev?.designation || `Bus Attendant (${route.busNumber})`,
              bankAccountNumber: prev?.bankAccountNumber,
              ifscCode: prev?.ifscCode,
              bankName: prev?.bankName,
              daysWorked: prev?.daysWorked ?? 26,
              grossSalaryInr: prev?.grossSalaryInr ?? 14500,
              deductionsInr: prev?.deductionsInr ?? 300,
              source: 'transport_fleet',
            });
          }
        }
      }

      // 3. Any additional staff from prior payroll history
      for (const p of existingPayrolls) {
        const name = p.staffName.trim();
        const key = name.toLowerCase();
        if (!rosterMap.has(key)) {
          rosterMap.set(key, {
            staffName: name,
            staffRoleType: p.staffRoleType,
            designation: p.designation,
            bankAccountNumber: p.bankAccountNumber,
            ifscCode: p.ifscCode,
            bankName: p.bankName,
            daysWorked: p.daysWorked,
            grossSalaryInr: p.grossSalaryInr,
            deductionsInr: p.deductionsInr,
            source: 'payroll_history',
          });
        }
      }

      const roster = Array.from(rosterMap.values()).sort((a, b) => {
        if (a.staffRoleType !== b.staffRoleType) {
          return a.staffRoleType.localeCompare(b.staffRoleType);
        }
        return a.staffName.localeCompare(b.staffName);
      });

      res.json({ roster });
    },
  );

  // Bulk upsert whole-staff payroll sheet in one request (dual-control compliant)
  app.post(
    '/api/accounting/payroll/bulk',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const body = req.body as {
        monthLabel?: string;
        submitForApproval?: boolean;
        autoApprove?: boolean;
        rows?: Array<{
          id?: string;
          staffName?: string;
          staffRoleType?: 'Teacher' | 'Driver' | 'Support Staff';
          designation?: string;
          bankAccountNumber?: string;
          ifscCode?: string;
          bankName?: string;
          daysWorked?: number;
          grossSalaryInr?: number;
          deductionsInr?: number;
        }>;
      };

      const monthLabel = (body.monthLabel || 'November 2026').trim();
      const inputRows = Array.isArray(body.rows) ? body.rows : [];
      if (inputRows.length === 0) {
        res.status(400).json({ error: 'At least one staff salary row is required.' });
        return;
      }

      if (!Array.isArray(db.payrollRegisters)) db.payrollRegisters = [];
      const canApproveNow = canPerformFinanceAction(user.role, 'approve_accounting_entry').allowed;
      const shouldAutoApprove = Boolean(body.autoApprove && canApproveNow);
      const nextStatus: PayrollRegisterEntry['status'] = shouldAutoApprove
        ? 'approved'
        : body.submitForApproval === false
          ? 'draft'
          : 'submitted';

      let createdCount = 0;
      let updatedCount = 0;
      let skippedApprovedCount = 0;
      const touchedIds: string[] = [];

      for (let idx = 0; idx < inputRows.length; idx += 1) {
        const r = inputRows[idx];
        const staffName = (r.staffName || '').trim();
        const gross = Math.round(Number(r.grossSalaryInr));
        const deductions = Math.max(0, Math.round(Number(r.deductionsInr || 0)));
        if (!staffName || !Number.isFinite(gross) || gross <= 0) {
          continue;
        }
        const daysWorked = Math.min(31, Math.max(0, Math.round(Number(r.daysWorked ?? 26))));
        const staffRoleType: 'Teacher' | 'Driver' | 'Support Staff' =
          r.staffRoleType === 'Driver' || r.staffRoleType === 'Support Staff'
            ? r.staffRoleType
            : 'Teacher';
        const designation = (r.designation || staffRoleType).trim();
        const netPayableInr = Math.max(0, gross - deductions);

        const cleanedAcc = r.bankAccountNumber?.trim().replace(/\s+/g, '') || undefined;
        const ifscRes = normalizeIfscCode(r.ifscCode);
        const cleanedIfsc = ifscRes.code || undefined;
        const resolvedBankName =
          r.bankName?.trim() || (cleanedIfsc ? inferBankNameFromIfsc(cleanedIfsc) : undefined);

        // Keep matching StaffProfile salary & bank details in sync
        const matchingProfile = (db.staffProfiles || []).find(
          (p) => p.schoolId === schoolId && p.name.trim().toLowerCase() === staffName.toLowerCase(),
        );
        const existing = db.payrollRegisters.find(
          (p) =>
            p.schoolId === schoolId &&
            ((r.id && p.id === r.id) ||
              (p.monthLabel.trim().toLowerCase() === monthLabel.toLowerCase() &&
                p.staffName.trim().toLowerCase() === staffName.toLowerCase())),
        );

        // Dual-control guard before mutating linked profile or payroll line
        if (existing && existing.status === 'approved' && !canApproveNow) {
          skippedApprovedCount += 1;
          continue;
        }

        const prevBaseForAudit = matchingProfile
          ? matchingProfile.baseMonthlySalaryInr
          : existing
            ? existing.grossSalaryInr
            : null;
        const prevAllowForAudit = matchingProfile ? matchingProfile.fixedAllowanceInr : existing ? 0 : null;
        const prevDedForAudit = matchingProfile
          ? matchingProfile.pfOrDeductionInr
          : existing
            ? existing.deductionsInr
            : null;

        const nextAllowForAudit = matchingProfile ? matchingProfile.fixedAllowanceInr || 0 : 0;
        const nextBaseForAudit = Math.max(0, gross - nextAllowForAudit);

        if (matchingProfile) {
          if (cleanedAcc) matchingProfile.bankAccountNumber = cleanedAcc;
          if (cleanedIfsc) {
            matchingProfile.ifscCode = cleanedIfsc;
            matchingProfile.bankName = resolvedBankName;
            matchingProfile.bankNote = ifscRes.warning;
          }
          matchingProfile.designation = designation;
          matchingProfile.baseMonthlySalaryInr = nextBaseForAudit;
          matchingProfile.pfOrDeductionInr = deductions;
        }

        if (
          prevBaseForAudit !== null &&
          hasSalaryValuesChanged(
            {
              baseMonthlySalaryInr: prevBaseForAudit,
              fixedAllowanceInr: prevAllowForAudit ?? 0,
              pfOrDeductionInr: prevDedForAudit ?? 0,
            },
            {
              baseMonthlySalaryInr: nextBaseForAudit,
              fixedAllowanceInr: nextAllowForAudit,
              pfOrDeductionInr: deductions,
            },
          )
        ) {
          if (!Array.isArray(db.salaryAuditLogs)) db.salaryAuditLogs = [];
          db.salaryAuditLogs.unshift(
            buildSalaryModificationAuditRecord({
              schoolId,
              actor: user,
              staffId: matchingProfile?.id,
              employeeCode: matchingProfile?.employeeCode,
              staffName,
              designation,
              actionType: 'BULK_PAYROLL_UPDATE',
              previousBaseSalaryInr: prevBaseForAudit,
              newBaseSalaryInr: nextBaseForAudit,
              previousAllowanceInr: prevAllowForAudit,
              newAllowanceInr: nextAllowForAudit,
              previousDeductionInr: prevDedForAudit,
              newDeductionInr: deductions,
              sourceLabel: `Bulk Payroll Sheet (${monthLabel})`,
            }),
          );
        }

        if (existing) {
          existing.monthLabel = monthLabel;
          existing.staffName = staffName;
          existing.staffRoleType = staffRoleType;
          existing.designation = designation;
          if (cleanedAcc !== undefined) existing.bankAccountNumber = cleanedAcc;
          if (cleanedIfsc !== undefined) existing.ifscCode = cleanedIfsc;
          if (resolvedBankName !== undefined) existing.bankName = resolvedBankName;
          existing.daysWorked = daysWorked;
          existing.grossSalaryInr = gross;
          existing.deductionsInr = deductions;
          existing.netPayableInr = netPayableInr;
          existing.preparedBy = existing.preparedBy || user.name;
          if (shouldAutoApprove) {
            existing.status = 'approved';
            existing.approvedBy = user.name;
            existing.approvedAt = new Date().toISOString();
          } else if (existing.status !== 'approved') {
            existing.status = nextStatus;
          }
          updatedCount += 1;
          touchedIds.push(existing.id);
        } else {
          const newEntry: PayrollRegisterEntry = {
            id: `pay-${Date.now().toString(36)}-${idx}-${crypto.randomBytes(2).toString('hex')}`,
            schoolId,
            monthLabel,
            staffName,
            staffRoleType,
            designation,
            bankAccountNumber: cleanedAcc || matchingProfile?.bankAccountNumber,
            ifscCode: cleanedIfsc || matchingProfile?.ifscCode,
            bankName: resolvedBankName || matchingProfile?.bankName,
            daysWorked,
            grossSalaryInr: gross,
            deductionsInr: deductions,
            netPayableInr,
            status: nextStatus,
            preparedBy: user.name,
            ...(shouldAutoApprove
              ? { approvedBy: user.name, approvedAt: new Date().toISOString() }
              : {}),
          };
          db.payrollRegisters.unshift(newEntry);
          createdCount += 1;
          touchedIds.push(newEntry.id);
        }
      }

      if (createdCount === 0 && updatedCount === 0 && skippedApprovedCount === 0) {
        res.status(400).json({ error: 'No valid staff salary rows found to save.' });
        return;
      }

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'PAYROLL_BULK_UPDATED',
        entityType: 'PayrollRegisterEntry',
        entityId: touchedIds[0] || `bulk-${monthLabel}`,
        detail: `Bulk payroll saved for ${monthLabel}: ${createdCount} added, ${updatedCount} updated${skippedApprovedCount ? `, ${skippedApprovedCount} approved rows preserved` : ''}.`,
      });
      saveDb(db);

      const schoolPayrolls = db.payrollRegisters.filter((p) => p.schoolId === schoolId);
      res.json({
        monthLabel,
        createdCount,
        updatedCount,
        skippedApprovedCount,
        payrolls: schoolPayrolls,
      });
    },
  );

  // 1-click Approve All Pending Salaries (Principal / School Admin / Super Admin only)
  app.post(
    '/api/accounting/payroll/approve-all',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const { monthLabel, ids } = (req.body || {}) as {
        monthLabel?: string;
        ids?: string[];
      };
      const idSet = Array.isArray(ids) && ids.length > 0 ? new Set(ids) : null;
      const targetMonth = monthLabel?.trim().toLowerCase() || '';

      let approvedCount = 0;
      const nowIso = new Date().toISOString();

      for (const row of db.payrollRegisters || []) {
        if (row.schoolId !== schoolId) continue;
        if (row.status === 'approved') continue;
        if (idSet && !idSet.has(row.id)) continue;
        if (targetMonth && row.monthLabel.trim().toLowerCase() !== targetMonth) continue;
        const guard = validatePayrollApproval({ role: user.role, entry: row });
        if (!guard.allowed) continue;
        row.status = 'approved';
        row.approvedBy = user.name;
        row.approvedAt = nowIso;
        approvedCount += 1;
      }

      if (approvedCount > 0) {
        appendAuditLog({
          schoolId,
          actor: user,
          action: 'PAYROLL_BULK_APPROVED',
          entityType: 'PayrollRegisterEntry',
          entityId: `approve-all-${monthLabel || 'all'}`,
          detail: `Bulk-approved ${approvedCount} staff payroll entries${monthLabel ? ` for ${monthLabel}` : ''}.`,
        });
        saveDb(db);
      }

      res.json({
        approvedCount,
        payrolls: (db.payrollRegisters || []).filter((p) => p.schoolId === schoolId),
      });
    },
  );

  app.post(
    '/api/accounting/bank-reconcile/:id',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      const bankItem = (db.bankReconciliationItems || []).find(
        (b) => b.id === req.params.id && b.schoolId === schoolId,
      );
      if (!bankItem) {
        res.status(404).json({ error: 'Bank statement line not found.' });
        return;
      }
      const { matchedEntryId } = req.body as { matchedEntryId?: string };
      bankItem.matchStatus = 'Matched';
      bankItem.matchedEntryId = matchedEntryId || undefined;
      bankItem.reconciledBy = user.name;
      bankItem.reconciledAt = new Date().toISOString();

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'BANK_TXN_RECONCILED',
        entityType: 'BankReconciliationItem',
        entityId: bankItem.id,
        detail: `Matched bank ref ${bankItem.bankRef} (₹${bankItem.amountInr})${matchedEntryId ? ` to entry ${matchedEntryId}` : ''}.`,
      });
      saveDb(db);
      res.json({ item: bankItem });
    },
  );

  app.post(
    '/api/accounting/extract-document',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: IntelligenceAuthedRequest, res) => {
      const perm = canPerformFinanceAction(req.user!.role, 'upload_financial_document');
      if (!perm.allowed) {
        res.status(403).json({ error: perm.reason });
        return;
      }
      const { fileName, rawText } = req.body as { fileName?: string; rawText?: string };
      const extracted = extractAccountingDraftFromDocument({
        fileName: (fileName || 'uploaded-receipt.pdf').trim(),
        rawText: (rawText || '').slice(0, 8000),
      });
      res.json({ extracted });
    },
  );

  app.post(
    '/api/accounting/tasks',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }
      const { title, category, dueDate, assignedTo, notes } = req.body as {
        title?: string;
        category?: string;
        dueDate?: string;
        assignedTo?: string;
        notes?: string;
      };
      if (!title?.trim()) {
        res.status(400).json({ error: 'Task title is required.' });
        return;
      }
      const task: AccountingTaskItem = {
        id: `task-${Date.now().toString(36)}`,
        schoolId,
        title: title.trim(),
        category: (category || 'Accounting Operations').trim(),
        dueDate: (dueDate || '2026-11-28').slice(0, 10),
        assignedBy: user.name,
        assignedTo: (assignedTo || 'Suresh Kumar').trim(),
        status: 'Open',
        notes: notes?.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };
      if (!Array.isArray(db.accountingTasks)) db.accountingTasks = [];
      db.accountingTasks.unshift(task);
      saveDb(db);
      res.status(201).json({ task });
    },
  );

  app.patch(
    '/api/accounting/tasks/:id',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'accountant']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      const task = (db.accountingTasks || []).find(
        (t) => t.id === req.params.id && t.schoolId === schoolId,
      );
      if (!task) {
        res.status(404).json({ error: 'Accounting task not found.' });
        return;
      }
      const { status, notes } = req.body as {
        status?: AccountingTaskItem['status'];
        notes?: string;
      };
      if (status) task.status = status;
      if (notes !== undefined) task.notes = notes.trim() || undefined;
      task.updatedAt = new Date().toISOString();
      saveDb(db);
      res.json({ task });
    },
  );

  // ---------------- PART 3: TEACHER TODAY WORKSPACE — LESSON PLANS ----------------
  app.post(
    '/api/lesson-plans',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      if (!schoolId) {
        res.status(400).json({ error: 'Active school context required.' });
        return;
      }

      const { level, classSection, subject, topic, learningOutcome, targetDate } = req.body as {
        level?: LessonPlan['level'];
        classSection?: string;
        subject?: string;
        topic?: string;
        learningOutcome?: string;
        targetDate?: string;
      };

      if (!classSection?.trim() || !subject?.trim() || !topic?.trim()) {
        res.status(400).json({ error: 'Class, subject, and chapter/topic are required.' });
        return;
      }

      const validLevels: LessonPlan['level'][] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
      const normalizedLevel: LessonPlan['level'] =
        level && validLevels.includes(level) ? level : 'Daily';

      const plan: LessonPlan = {
        id: `lp-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
        schoolId,
        level: normalizedLevel,
        classSection: classSection.trim(),
        subject: subject.trim(),
        topic: topic.trim(),
        learningOutcome:
          learningOutcome?.trim() ||
          `Students explain and apply key concepts from ${topic.trim()} through guided class practice.`,
        status: 'In Progress',
        teacherName: user.name,
        targetDate: (targetDate || new Date().toISOString().slice(0, 10)).slice(0, 10),
        approvalRequired: false,
      };

      if (!Array.isArray(db.lessonPlans)) db.lessonPlans = [];
      db.lessonPlans.unshift(plan);
      appendAuditLog({
        schoolId,
        actor: user,
        action: 'LESSON_PLAN_CREATED',
        entityType: 'LessonPlan',
        entityId: plan.id,
        detail: `Created ${plan.level} lesson plan for Class ${plan.classSection} (${plan.subject}): ${plan.topic}.`,
      });
      saveDb(db);
      res.status(201).json({ lessonPlan: plan });
    },
  );

  app.patch(
    '/api/lesson-plans/:id',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId || user.schoolId;
      const plan = (db.lessonPlans || []).find(
        (l) => l.id === req.params.id && l.schoolId === schoolId,
      );
      if (!plan) {
        res.status(404).json({ error: 'Lesson plan not found in active school.' });
        return;
      }

      const { status, learningOutcome } = req.body as {
        status?: LessonPlan['status'];
        learningOutcome?: string;
      };
      const validStatuses: LessonPlan['status'][] = [
        'In Progress',
        'Completed',
        'Pending Revision',
        'Calendar Change Requested',
      ];
      if (status && validStatuses.includes(status)) {
        plan.status = status;
      }
      if (learningOutcome !== undefined && learningOutcome.trim()) {
        plan.learningOutcome = learningOutcome.trim();
      }

      appendAuditLog({
        schoolId: schoolId || plan.schoolId,
        actor: user,
        action: 'LESSON_PLAN_UPDATED',
        entityType: 'LessonPlan',
        entityId: plan.id,
        detail: `Updated lesson plan "${plan.topic}" (Class ${plan.classSection}) to ${plan.status}.`,
      });
      saveDb(db);
      res.json({ lessonPlan: plan });
    },
  );
}
