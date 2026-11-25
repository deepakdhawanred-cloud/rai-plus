import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildClinicalReportPrintHtml,
  detectMedicalRedFlags,
  generateArticulationExerciseDraft,
  getEvidenceInformedFluencyActivities,
  sanitizeClinicalBundleForRole,
  synthesizeScreeningIndicators,
} from './clinicalCareEngine.ts';
import { createInitialClinicalBundle } from '../../server/clinicalSeedData.ts';
import type { StudentRecord } from '../types';

const mockStudents: StudentRecord[] = [
  {
    id: 'stu-vis-601',
    schoolId: 'school-vis-jjr',
    admissionNo: 'VIS-601',
    rollNo: '1',
    name: 'Abhiraj',
    classSection: '6-A',
    house: 'Shakti',
    guardianName: 'Rajesh Kumar',
    guardianPhone: '9876543210',
    udiseStudentId: 'UDISE-601',
    haryanaMisId: 'MIS-601',
    attendancePct: 92,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 42000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1.0',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
  },
  {
    id: 'stu-vis-602',
    schoolId: 'school-vis-jjr',
    admissionNo: 'VIS-602',
    rollNo: '2',
    name: 'Aarav',
    classSection: '6-A',
    house: 'Shakti',
    guardianName: 'Sunita Devi',
    guardianPhone: '9876543211',
    udiseStudentId: 'UDISE-602',
    haryanaMisId: 'MIS-602',
    attendancePct: 91,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 42000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1.0',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
  },
];

describe('Virat Clinical & Developmental Care 360° Engine', () => {
  it('flags timely medical assessment automatically when skill regression or seizures are reported', () => {
    const flagged = detectMedicalRedFlags({
      regressionOrSkillLoss: true,
      regressionDetails: 'Stopped using previously spoken two-word phrases last month.',
      seizuresOrMedicalRedFlags: false,
    });
    assert.equal(flagged.urgentMedicalFlag, true);
    assert.ok(flagged.reasons[0].includes('Stopped using previously spoken two-word phrases'));

    const synth = synthesizeScreeningIndicators({
      domains: ['speech_language_delays'],
      history: {
        id: 'dh-1',
        schoolId: 'school-vis-jjr',
        studentId: 'stu-vis-601',
        submittedByName: 'Parent',
        submittedByRole: 'parent',
        submittedAt: '2026-11-21',
        pregnancyAndBirthHistory: 'Normal',
        birthComplications: 'None',
        milestones: [],
        hearingHistory: 'Normal',
        medicalHistory: 'Normal',
        familyDevelopmentalHistory: 'None',
        previousAssessments: 'None',
        previousTherapies: 'None',
        regressionOrSkillLoss: true,
        regressionDetails: 'Loss of acquired words',
        seizuresOrMedicalRedFlags: false,
        homeLanguage: 'Hindi',
        languagesSpokenByChild: ['Hindi'],
        socialInteractionSummary: '',
        playBehaviourSummary: '',
        dailyLivingSkillsSummary: '',
      },
    });
    assert.equal(synth.urgentMedicalFlag, true);
    assert.equal(synth.suggestedWorkflowStatus, 'Urgent clinical referral recommended');
  });

  it('generates separate language-specific English /r/ and Hindi र drafts requiring SLP review before assignment', () => {
    const enDraft = generateArticulationExerciseDraft({
      schoolId: 'school-vis-jjr',
      stage: 4,
      target: {
        id: 't-en',
        schoolId: 'school-vis-jjr',
        studentId: 'stu-vis-601',
        studentName: 'Abhiraj',
        targetSound: '/r/',
        soundGroup: '/r/ (English)',
        language: 'English',
        errorType: 'Substitution',
        affectedPositions: ['initial', 'medial'],
        positionAccuracy: {},
        accuracyWordLevelPct: 60,
        accuracyConversationPct: 35,
        stimulability: 'Stimulable with cue',
        functionalImpact: 'Read aloud clarity',
        treatmentPriority: 'High',
        currentStage: 4,
        slpApproved: true,
        slpName: 'Ritu Sharma, MASLP',
        accentDifferenceRuledOut: true,
        updatedAt: '2026-11-21',
      },
    });
    assert.equal(enDraft.reviewStatus, 'Pending SLP Review');
    assert.equal(enDraft.assignedToHomePractice, false);
    assert.ok(enDraft.practiceItems.some((i) => i.includes('rabbit')));

    const hiDraft = generateArticulationExerciseDraft({
      schoolId: 'school-vis-jjr',
      stage: 4,
      target: {
        id: 't-hi',
        schoolId: 'school-vis-jjr',
        studentId: 'stu-vis-601',
        studentName: 'Abhiraj',
        targetSound: 'र',
        soundGroup: 'र (Hindi Tap/Trill)',
        language: 'Hindi',
        errorType: 'Substitution',
        affectedPositions: ['initial'],
        positionAccuracy: {},
        accuracyWordLevelPct: 50,
        accuracyConversationPct: 30,
        stimulability: 'Stimulable with cue',
        functionalImpact: 'Hindi reading',
        treatmentPriority: 'High',
        currentStage: 4,
        slpApproved: true,
        slpName: 'Ritu Sharma, MASLP',
        accentDifferenceRuledOut: true,
        updatedAt: '2026-11-21',
      },
    });
    assert.ok(hiDraft.practiceItems.some((i) => i.includes('रथ') || i.includes('रोटी')));
  });

  it('provides evidence-informed fluency activities without generic speak-slowly pressure directives', () => {
    const acts = getEvidenceInformedFluencyActivities([
      'Parent-Child Interaction Approach',
      'Communication Participation & Confidence',
    ]);
    assert.ok(acts.length >= 2);
    for (const act of acts) {
      assert.ok(!act.description.toLowerCase().includes('speak slowly'));
      assert.ok(!act.description.toLowerCase().includes('deep breath'));
    }
  });

  it('enforces strict role-based clinical confidentiality across teacher, parent, student, and accountant roles', () => {
    const seed = createInitialClinicalBundle({
      schoolIds: ['school-vis-jjr'],
      students: mockStudents,
    });
    const fullBundle = {
      consents: seed.clinicalConsents,
      developmentalHistories: seed.developmentalHistories,
      parentQuestionnaires: seed.parentQuestionnaires,
      teacherObservations: seed.teacherObservations,
      screeningCases: seed.screeningCases,
      conditionAssessments: seed.conditionAssessments,
      speechSoundTargets: seed.speechSoundTargets,
      speechExercises: seed.speechExercises,
      fluencyProfiles: seed.fluencyProfiles,
      therapyPlans: seed.therapyPlans,
      therapySessionLogs: seed.therapySessionLogs,
      audioPracticeRecords: seed.audioPracticeRecords,
      parentHomePracticeLogs: seed.parentHomePracticeLogs,
      clinicalReports: seed.clinicalReports,
      clinicalAccessLogs: seed.clinicalAccessLogs,
      specialists: [],
    };

    const teacherView = sanitizeClinicalBundleForRole({
      bundle: fullBundle,
      role: 'teacher',
      visibleStudentIds: new Set(['stu-vis-601']),
      userId: 'usr-teacher-vis',
    });
    assert.equal(teacherView.developmentalHistories.length, 0);
    assert.equal(teacherView.conditionAssessments.length, 0);
    assert.equal(teacherView.therapySessionLogs.length, 0);
    assert.ok(teacherView.screeningCases.every((c) => c.confidentialNotes === undefined));
    assert.ok(teacherView.therapyPlans.every((p) => p.confirmedClinicalDiagnosis === undefined));
    assert.ok(Boolean(teacherView.therapyPlans[0]?.teacherClassroomGuidance));

    const accountantView = sanitizeClinicalBundleForRole({
      bundle: fullBundle,
      role: 'accountant',
      visibleStudentIds: new Set(['stu-vis-601']),
      userId: 'usr-accountant-vis',
    });
    assert.equal(accountantView.screeningCases.length, 0);
    assert.equal(accountantView.clinicalReports.length, 0);

    const parentView = sanitizeClinicalBundleForRole({
      bundle: fullBundle,
      role: 'parent',
      visibleStudentIds: new Set(['stu-vis-601']),
      userId: 'usr-parent-vis',
    });
    assert.equal(parentView.teacherObservations.length, 0);
    assert.equal(parentView.conditionAssessments.length, 0);
    assert.ok(parentView.clinicalReports.every((r) => r.sharedWithParent && r.studentId === 'stu-vis-601'));
  });

  it('safely escapes untrusted characters when generating printable clinical HTML reports', () => {
    const html = buildClinicalReportPrintHtml(
      {
        id: 'rep-test',
        schoolId: 'school-vis-jjr',
        studentId: 'stu-vis-601',
        studentName: 'Abhiraj <script>alert(1)</script>',
        classSection: '6-A',
        reportType: 'therapy_progress',
        title: 'Progress Report',
        reportDate: '2026-11-21',
        authorName: 'Ritu Sharma, MASLP',
        authorRole: 'slp',
        authorCredentials: 'MASLP',
        recommendations: ['Continue joyful reading <img src=x onerror=alert(1)>'],
        parentFriendlySummary: 'Great steady progress.',
        status: 'Signed & Approved',
        sharedWithParent: true,
        sharedWithManagement: false,
        sharedClassroomSummaryWithTeacher: true,
      },
      'VIS Jhajjar',
    );
    assert.ok(!html.includes('<script>'));
    assert.ok(!html.includes('<img src=x'));
    assert.ok(html.includes('&lt;script&gt;'));
  });
});
