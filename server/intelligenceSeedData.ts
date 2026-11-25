import type {
  AcademicResource,
  CapabilityBandConfig,
  PresentationAuditRecord,
  RedesignedPresentationDeck,
  StudentCareerPlan,
  StudentRecord,
  SubstituteRuleConfig,
  SubstitutionAssignmentRecord,
  TeacherCapabilityProfile,
  TeacherLeaveBalance,
  TeacherLeaveRequest,
  TeacherProductivityKpiConfig,
  ThinkingAssessmentSession,
  ThinkingQuestionItem,
  ThinkingScoringConfig,
  TimetableMasterConfig,
  TimetableSlot,
} from '../src/types';
import {
  aggregateThinkingSession,
  createDefaultThinkingScoringConfig,
  evaluateSingleThinkingResponse,
} from '../src/utils/thinkingAssessmentEngine.ts';
import {
  computeCapabilityBands,
  createDefaultSubstituteRuleConfig,
  runAutoSubstituteEngineForDate,
} from '../src/utils/smartTimetableEngine.ts';
import { createDefaultProductivityKpiConfig } from '../src/utils/teacherProductivityEngine.ts';
import {
  auditExistingPresentation,
  buildDefaultRedesignedDeckFromAudit,
} from '../src/utils/presentationStudioEngine.ts';
import { CAREER_PROFILES_CATALOG } from './careerCatalogSeed.ts';

export interface IntelligenceSeedBundle {
  thinkingQuestionBank: ThinkingQuestionItem[];
  thinkingScoringConfigs: Record<string, ThinkingScoringConfig>;
  thinkingAssessments: ThinkingAssessmentSession[];
  timetableMasterConfigs: Record<string, TimetableMasterConfig>;
  substituteRuleConfigs: Record<string, SubstituteRuleConfig>;
  teacherCapabilityProfiles: TeacherCapabilityProfile[];
  capabilityBandConfigs: Record<string, CapabilityBandConfig>;
  substitutionAssignments: SubstitutionAssignmentRecord[];
  teacherLeaveRequests: TeacherLeaveRequest[];
  teacherLeaveBalances: TeacherLeaveBalance[];
  productivityKpiConfigs: Record<string, TeacherProductivityKpiConfig>;
  careerProfiles: typeof CAREER_PROFILES_CATALOG;
  studentCareerPlans: StudentCareerPlan[];
  presentationAudits: PresentationAuditRecord[];
  redesignedDecks: RedesignedPresentationDeck[];
}

function buildQuestionBankForSchool(schoolId: string): ThinkingQuestionItem[] {
  return [
    // SRT — Situation Reaction Test
    {
      id: `tq-${schoolId}-srt-1`,
      schoolId,
      testType: 'SRT',
      title: 'Team Member Missing Before Science Exhibition',
      prompt:
        'Half an hour before the inter-school science exhibition begins, your teammate carrying the project charts is stuck in traffic. What do you do?',
      ageBand: '11-15 yrs',
      classRange: 'Classes 6-10',
      difficulty: 'Intermediate',
      defaultTimeLimitSec: 30,
      targetOlqs: ['initiative', 'organising_ability', 'speed_of_decision', 'determination'],
      tags: ['teamwork', 'problem-solving'],
      active: true,
      createdBy: 'Dr. Sunita Gill',
      createdAt: '2026-11-10',
    },
    {
      id: `tq-${schoolId}-srt-2`,
      schoolId,
      testType: 'SRT',
      title: 'Classmate Excluded During Group Activity',
      prompt:
        'During a classroom group project, two classmates refuse to include a quieter student because they feel it will slow them down. How do you respond?',
      ageBand: '10-14 yrs',
      classRange: 'Classes 5-9',
      difficulty: 'Foundation',
      defaultTimeLimitSec: 30,
      targetOlqs: ['cooperation', 'social_adaptability', 'influence_group', 'sense_of_responsibility'],
      tags: ['inclusion', 'leadership'],
      active: true,
      createdBy: 'Dr. Sunita Gill',
      createdAt: '2026-11-10',
    },
    {
      id: `tq-${schoolId}-srt-3`,
      schoolId,
      testType: 'SRT',
      title: 'Exam Paper Difficulty Spike',
      prompt:
        'You open your Mathematics unit test paper and find the first two questions unexpectedly tough while time is ticking. What is your immediate action?',
      ageBand: '12-17 yrs',
      classRange: 'Classes 7-12',
      difficulty: 'Intermediate',
      defaultTimeLimitSec: 30,
      targetOlqs: ['effective_intelligence', 'self_confidence', 'stamina', 'reasoning_ability'],
      tags: ['exam-calm', 'self-awareness'],
      active: true,
      createdBy: 'Dr. Sunita Gill',
      createdAt: '2026-11-10',
    },
    {
      id: `tq-${schoolId}-srt-4`,
      schoolId,
      testType: 'SRT',
      title: 'Water Leakage Near School Computer Lab',
      prompt:
        'While walking to the library during break, you notice water leaking near an electric switchboard outside the computer lab and no staff member is nearby. What do you do?',
      ageBand: '11-17 yrs',
      classRange: 'Classes 6-12',
      difficulty: 'Advanced',
      defaultTimeLimitSec: 25,
      targetOlqs: ['sense_of_responsibility', 'speed_of_decision', 'courage', 'initiative'],
      tags: ['safety', 'civic-duty'],
      active: true,
      createdBy: 'Dr. Sunita Gill',
      createdAt: '2026-11-10',
    },

    // WAT — Word Association Test
    {
      id: `tq-${schoolId}-wat-1`,
      schoolId,
      testType: 'WAT',
      title: 'Cue Word: CHALLENGE',
      prompt: 'CHALLENGE',
      ageBand: '10-17 yrs',
      classRange: 'Classes 5-12',
      difficulty: 'Foundation',
      defaultTimeLimitSec: 15,
      targetOlqs: ['determination', 'courage', 'self_confidence'],
      tags: ['mindset'],
      active: true,
      createdBy: 'Dr. Sunita Gill',
      createdAt: '2026-11-10',
    },
    {
      id: `tq-${schoolId}-wat-2`,
      schoolId,
      testType: 'WAT',
      title: 'Cue Word: TEAMWORK',
      prompt: 'TEAMWORK',
      ageBand: '10-17 yrs',
      classRange: 'Classes 5-12',
      difficulty: 'Foundation',
      defaultTimeLimitSec: 15,
      targetOlqs: ['cooperation', 'social_adaptability', 'influence_group'],
      tags: ['collaboration'],
      active: true,
      createdBy: 'Dr. Sunita Gill',
      createdAt: '2026-11-10',
    },
    {
      id: `tq-${schoolId}-wat-3`,
      schoolId,
      testType: 'WAT',
      title: 'Cue Word: MISTAKE',
      prompt: 'MISTAKE',
      ageBand: '11-17 yrs',
      classRange: 'Classes 6-12',
      difficulty: 'Intermediate',
      defaultTimeLimitSec: 15,
      targetOlqs: ['effective_intelligence', 'reasoning_ability', 'self_confidence'],
      tags: ['growth-mindset'],
      active: true,
      createdBy: 'Dr. Sunita Gill',
      createdAt: '2026-11-10',
    },
    {
      id: `tq-${schoolId}-wat-4`,
      schoolId,
      testType: 'WAT',
      title: 'Cue Word: RESPONSIBILITY',
      prompt: 'RESPONSIBILITY',
      ageBand: '11-17 yrs',
      classRange: 'Classes 6-12',
      difficulty: 'Intermediate',
      defaultTimeLimitSec: 15,
      targetOlqs: ['sense_of_responsibility', 'organising_ability', 'initiative'],
      tags: ['ownership'],
      active: true,
      createdBy: 'Dr. Sunita Gill',
      createdAt: '2026-11-10',
    },
    {
      id: `tq-${schoolId}-wat-5`,
      schoolId,
      testType: 'WAT',
      title: 'Cue Word: DELAY',
      prompt: 'DELAY',
      ageBand: '12-17 yrs',
      classRange: 'Classes 7-12',
      difficulty: 'Advanced',
      defaultTimeLimitSec: 15,
      targetOlqs: ['speed_of_decision', 'stamina', 'liveliness'],
      tags: ['resilience'],
      active: true,
      createdBy: 'Dr. Sunita Gill',
      createdAt: '2026-11-10',
    },

    // TAT — Thematic Apperception Test
    {
      id: `tq-${schoolId}-tat-1`,
      schoolId,
      testType: 'TAT',
      title: 'Evening Study Desk & Rainy Window',
      prompt:
        'Look at the scene of a student seated at a study desk beside a rainy window with an open map, a notebook, and a small wall clock. Write a complete story describing what led up to this moment, what the protagonist is doing, and the outcome.',
      sceneCode: 'tat_study_rain',
      sceneCaption: 'A student at a wooden desk studying by a lamplight beside a rain-streaked window.',
      ageBand: '11-17 yrs',
      classRange: 'Classes 6-12',
      difficulty: 'Intermediate',
      defaultTimeLimitSec: 240,
      targetOlqs: ['organising_ability', 'determination', 'initiative', 'power_of_expression'],
      tags: ['planning', 'focus'],
      active: true,
      createdBy: 'Dr. Sunita Gill',
      createdAt: '2026-11-10',
    },
    {
      id: `tq-${schoolId}-tat-2`,
      schoolId,
      testType: 'TAT',
      title: 'Community Bridge Repair After Storm',
      prompt:
        'Look at the scene showing three young people and an elder standing near a small village footbridge with fallen branches after heavy wind. Write a constructive story covering protagonist, objective, challenges, actions, and outcome.',
      sceneCode: 'tat_bridge_team',
      sceneCaption: 'Youth and a community elder inspecting a rain-affected footbridge with tools.',
      ageBand: '12-17 yrs',
      classRange: 'Classes 7-12',
      difficulty: 'Advanced',
      defaultTimeLimitSec: 240,
      targetOlqs: ['cooperation', 'initiative', 'influence_group', 'sense_of_responsibility'],
      tags: ['community', 'leadership'],
      active: true,
      createdBy: 'Dr. Sunita Gill',
      createdAt: '2026-11-10',
    },

    // PPDT — Picture Perception and Discussion Test
    {
      id: `tq-${schoolId}-ppdt-1`,
      schoolId,
      testType: 'PPDT',
      title: 'Ambiguous School Courtyard Gathering',
      prompt:
        'Observe the hazy picture showing 4 figures gathered near a notice board in a courtyard while one person points toward the playground. Identify characters, approximate ages, mood, and central situation, prepare your story, and participate in group discussion.',
      sceneCode: 'ppdt_courtyard',
      sceneCaption: 'Hazy monochrome sketch of four figures gathered near a courtyard board.',
      ageBand: '12-17 yrs',
      classRange: 'Classes 6-12',
      difficulty: 'Intermediate',
      defaultTimeLimitSec: 240,
      targetOlqs: ['power_of_expression', 'cooperation', 'influence_group', 'social_adaptability', 'initiative'],
      tags: ['group-discussion', 'perception'],
      active: true,
      createdBy: 'Dr. Sunita Gill',
      createdAt: '2026-11-10',
    },
  ];
}

export function createIntelligenceSeedBundle(params: {
  schoolIds: string[];
  students: StudentRecord[];
  timetable: TimetableSlot[];
  resources: AcademicResource[];
}): IntelligenceSeedBundle {
  const thinkingQuestionBank: ThinkingQuestionItem[] = [];
  const thinkingScoringConfigs: Record<string, ThinkingScoringConfig> = {};
  const thinkingAssessments: ThinkingAssessmentSession[] = [];
  const timetableMasterConfigs: Record<string, TimetableMasterConfig> = {};
  const substituteRuleConfigs: Record<string, SubstituteRuleConfig> = {};
  const teacherCapabilityProfiles: TeacherCapabilityProfile[] = [];
  const capabilityBandConfigs: Record<string, CapabilityBandConfig> = {};
  const substitutionAssignments: SubstitutionAssignmentRecord[] = [];
  const teacherLeaveRequests: TeacherLeaveRequest[] = [];
  const teacherLeaveBalances: TeacherLeaveBalance[] = [];
  const productivityKpiConfigs: Record<string, TeacherProductivityKpiConfig> = {};
  const studentCareerPlans: StudentCareerPlan[] = [];
  const presentationAudits: PresentationAuditRecord[] = [];
  const redesignedDecks: RedesignedPresentationDeck[] = [];

  for (const schoolId of params.schoolIds) {
    const qBank = buildQuestionBankForSchool(schoolId);
    thinkingQuestionBank.push(...qBank);
    const scoreCfg = createDefaultThinkingScoringConfig(schoolId);
    thinkingScoringConfigs[schoolId] = scoreCfg;
    const qMap = new Map(qBank.map((q) => [q.id, q]));

    const schoolStudents = params.students.filter((s) => s.schoolId === schoolId);
    const schoolSlots = params.timetable.filter((t) => t.schoolId === schoolId);

    // Seed sample SRT, WAT & PPDT assessments for primary demo students
    const demoStudent1 = schoolStudents[0];
    const demoStudent2 = schoolStudents[1];
    if (demoStudent1) {
      const srtQs = qBank.filter((q) => q.testType === 'SRT').slice(0, 3);
      const srtResponses = [
        evaluateSingleThinkingResponse({
          question: srtQs[0],
          responseText:
            'Stay calm, inform the teacher coordinator, sketch a clean backup diagram on spare chart paper, and call my teammate to coordinate smoothly.',
          responseTimeMs: 11200,
          config: scoreCfg,
        }),
        evaluateSingleThinkingResponse({
          question: srtQs[1],
          responseText:
            'Speak positively with the group, assign the quieter classmate a clear research role they enjoy, and guide everyone to cooperate together.',
          responseTimeMs: 10500,
          config: scoreCfg,
        }),
        evaluateSingleThinkingResponse({
          question: srtQs[2],
          responseText:
            'Take a deep breath, move to the questions I can solve confidently first, manage my schedule, and return calmly to solve the tough ones step by step.',
          responseTimeMs: 9800,
          config: scoreCfg,
        }),
      ];
      const sess1 = aggregateThinkingSession({
        id: `ts-${schoolId}-srt-1`,
        schoolId,
        studentId: demoStudent1.id,
        studentName: demoStudent1.name,
        classSection: demoStudent1.classSection,
        testType: 'SRT',
        workflowMode: 'Individual',
        timedMode: true,
        timeLimitSec: 90,
        startedAt: '2026-11-12T09:15:00Z',
        submittedAt: '2026-11-12T09:17:00Z',
        responses: srtResponses,
        questionsById: qMap,
      });
      sess1.status = 'counsellor_reviewed';
      sess1.teacherObservation =
        'Shows composed practical judgment and consistent awareness of teammates.';
      sess1.counsellorRecommendation =
        'Encourage leading a peer presentation in next week’s PPDT group session to further sharpen vocal projection.';
      sess1.reviewedBy = 'Dr. Sunita Gill';
      sess1.reviewedAt = '2026-11-13';
      thinkingAssessments.push(sess1);

      const watQs = qBank.filter((q) => q.testType === 'WAT').slice(0, 3);
      const watResponses = [
        evaluateSingleThinkingResponse({
          question: watQs[0],
          responseText: 'Every challenge helps us learn new skills with steady courage.',
          responseTimeMs: 8400,
          config: scoreCfg,
        }),
        evaluateSingleThinkingResponse({
          question: watQs[1],
          responseText: 'Good teamwork solves difficult school projects smoothly together.',
          responseTimeMs: 7900,
          config: scoreCfg,
        }),
        evaluateSingleThinkingResponse({
          question: watQs[2],
          responseText: 'Reviewing a mistake calmly improves future accuracy.',
          responseTimeMs: 9100,
          config: scoreCfg,
        }),
      ];
      const sessWat = aggregateThinkingSession({
        id: `ts-${schoolId}-wat-1`,
        schoolId,
        studentId: demoStudent1.id,
        studentName: demoStudent1.name,
        classSection: demoStudent1.classSection,
        testType: 'WAT',
        workflowMode: 'Individual',
        timedMode: true,
        timeLimitSec: 45,
        startedAt: '2026-11-15T10:00:00Z',
        submittedAt: '2026-11-15T10:02:00Z',
        responses: watResponses,
        questionsById: qMap,
      });
      thinkingAssessments.push(sessWat);

      const tatQ = qBank.find((q) => q.testType === 'TAT');
      if (tatQ) {
        const tatResp = evaluateSingleThinkingResponse({
          question: tatQ,
          responseText:
            'While heavy rain slowed evening traffic, Aarav planned a concise 45-minute revision roadmap at his study desk, checked key geography map points, and prepared a clean summary sheet to share with his study partner before the morning quiz.',
          responseTimeMs: 42000,
          config: scoreCfg,
          tatStructure: {
            protagonist: 'Aarav, disciplined senior-school learner',
            objective: 'Complete focused map revision and help his partner stay exam-ready',
            challenges: 'Power fluctuation during rain and limited evening study time',
            actions: 'Used study lamp, prioritized high-weight map topics, drafted shared revision checklist',
            outcome: 'Completed revision calmly on schedule and both classmates performed confidently next morning',
          },
        });
        const sessTat = aggregateThinkingSession({
          id: `ts-${schoolId}-tat-1`,
          schoolId,
          studentId: demoStudent1.id,
          studentName: demoStudent1.name,
          classSection: demoStudent1.classSection,
          testType: 'TAT',
          workflowMode: 'Individual',
          timedMode: true,
          timeLimitSec: 240,
          startedAt: '2026-11-16T09:10:00Z',
          submittedAt: '2026-11-16T09:14:00Z',
          responses: [tatResp],
          questionsById: qMap,
        });
        sessTat.status = 'counsellor_reviewed';
        sessTat.teacherObservation =
          'Structured protagonist arc with realistic time-boxing and peer empathy.';
        sessTat.counsellorRecommendation =
          'Continue building realistic problem-solving steps in multi-character community stories.';
        sessTat.reviewedBy = 'Dr. Sunita Gill';
        sessTat.reviewedAt = '2026-11-17';
        thinkingAssessments.push(sessTat);
      }
    }

    if (demoStudent2) {
      const ppdtQ = qBank.find((q) => q.testType === 'PPDT')!;
      const ppdtResp = evaluateSingleThinkingResponse({
        question: ppdtQ,
        responseText:
          'Four classmates notice the sports day schedule has shifted due to morning drizzle. Arjun discusses with the sports teacher and organises indoor chess and quiz relays so everyone enjoys the event.',
        responseTimeMs: 18500,
        config: scoreCfg,
        ppdtPerception: {
          charactersCount: 4,
          approximateAges: '13-15 yrs',
          mood: 'Positive',
          centralSituation: 'Re-organising school sports day after light rain',
          narrationSummary: 'Clear 45-second narration proposing indoor backup activities.',
        },
      });
      const sessPpdt = aggregateThinkingSession({
        id: `ts-${schoolId}-ppdt-1`,
        schoolId,
        studentId: demoStudent2.id,
        studentName: demoStudent2.name,
        classSection: demoStudent2.classSection,
        testType: 'PPDT',
        workflowMode: 'Group',
        timedMode: true,
        timeLimitSec: 240,
        startedAt: '2026-11-16T11:00:00Z',
        submittedAt: '2026-11-16T11:18:00Z',
        responses: [ppdtResp],
        questionsById: qMap,
        ppdtGroupEval: {
          groupId: `grp-${schoolId}-1`,
          groupTitle: 'House Leadership PPDT Group A',
          communication: 8,
          cooperation: 8,
          initiative: 7,
          listening: 9,
          leadership: 7,
          evaluatorName: 'Dr. Sunita Gill',
          evaluatorNotes: 'Listened patiently to peers and bridged two differing story ideas calmly.',
          evaluatedAt: '2026-11-16',
        },
      });
      thinkingAssessments.push(sessPpdt);
    }

    // Smart Timetable Master, Substitute Rules, Capability Bands & Teacher Profiles
    const uniqueRooms = Array.from(
      new Set(schoolSlots.map((s) => s.room).filter((r): r is string => Boolean(r))),
    ).sort();
    timetableMasterConfigs[schoolId] = {
      schoolId,
      title: schoolId === 'school-vis-jjr' ? 'November 2026' : 'Session 2026-27 Master',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      schoolStartTime: '09:05',
      schoolEndTime: '14:10',
      periodDurationMins: 35,
      assemblySlot: '08:40 - 09:05',
      breakSlot: '11:25 - 11:40',
      diarySlot: '14:00 - 14:10',
      rooms: uniqueRooms.length > 0 ? uniqueRooms : ['Room 101', 'Room 102', 'Science Lab', 'Computer Lab'],
      fixedSlotIds: schoolSlots.slice(0, 6).map((s) => s.id),
      publishState: 'published',
      publishedAt: '2026-09-25 01:14 PM',
      publishedBy: schoolId === 'school-vis-jjr' ? 'Dr. Deepak Dhawan' : 'Dr. Meenakshi Deswal',
      version: 3,
    };

    const subRuleCfg = createDefaultSubstituteRuleConfig(schoolId);
    substituteRuleConfigs[schoolId] = subRuleCfg;

    const capBands = computeCapabilityBands({
      schoolId,
      timetable: schoolSlots,
      targetLevelCount: 5,
    });
    capabilityBandConfigs[schoolId] = capBands;

    const schoolProfiles: TeacherCapabilityProfile[] =
      schoolId === 'school-vis-jjr'
        ? [
            {
              id: 'tcp-vis-anuja',
              schoolId,
              teacherName: 'anuja',
              teacherCode: 'ANU',
              canSubstitute: false,
              workingHoursLabel: 'Full time',
              availableFromPeriod: 1,
              availableToPeriod: 8,
              maxPeriodsPerDay: 8,
              maxConsecutivePeriods: null,
              maxSubstitutesPerDay: 3,
              maxSubstitutesPerWeek: 10,
              autoAssignAllowed: true,
              crossLevelEligible: false,
              qualifiedSubjects: ['English', 'Hindi'],
            },
            {
              id: 'tcp-vis-dd',
              schoolId,
              teacherName: 'deepak dhawan',
              teacherCode: 'DD',
              canSubstitute: false,
              workingHoursLabel: 'Full time',
              availableFromPeriod: 1,
              availableToPeriod: 8,
              maxPeriodsPerDay: 8,
              maxConsecutivePeriods: null,
              maxSubstitutesPerDay: 3,
              maxSubstitutesPerWeek: 10,
              autoAssignAllowed: true,
              crossLevelEligible: true,
              qualifiedSubjects: ['Physics', 'Mathematics'],
            },
            {
              id: 'tcp-vis-ddc',
              schoolId,
              teacherName: 'Deepak Dhawan -DESI COUNSELLOR',
              teacherCode: 'DD-C',
              canSubstitute: false,
              workingHoursLabel: 'Full time',
              availableFromPeriod: 1,
              availableToPeriod: 8,
              maxPeriodsPerDay: 8,
              maxConsecutivePeriods: null,
              maxSubstitutesPerDay: 3,
              maxSubstitutesPerWeek: 10,
              autoAssignAllowed: true,
              crossLevelEligible: true,
              qualifiedSubjects: ['Counselling'],
            },
            {
              id: 'tcp-vis-ruby',
              schoolId,
              teacherName: 'ruby',
              teacherCode: 'RUB',
              canSubstitute: false,
              workingHoursLabel: 'Full time',
              availableFromPeriod: 1,
              availableToPeriod: 8,
              maxPeriodsPerDay: 8,
              maxConsecutivePeriods: null,
              maxSubstitutesPerDay: 3,
              maxSubstitutesPerWeek: 10,
              autoAssignAllowed: true,
              crossLevelEligible: false,
              qualifiedSubjects: ['Science', 'Mathematics'],
            },
          ]
        : [];
    teacherCapabilityProfiles.push(...schoolProfiles);

    // Seed teacher leave balances & realistic leave requests for VIS & SVM
    const distinctTeachers = Array.from(
      new Set(
        schoolSlots.flatMap((s) =>
          s.teacherName
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean),
        ),
      ),
    ).sort();

    for (const tName of distinctTeachers) {
      teacherLeaveBalances.push({
        schoolId,
        teacherName: tName,
        casualTotal: 12,
        casualUsed: tName.toLowerCase().includes('anand') ? 3 : 1,
        medicalTotal: 10,
        medicalUsed: 0,
        earnedTotal: 8,
        earnedUsed: 0,
      });
    }

    const firstAbsentTeacher =
      schoolId === 'school-vis-jjr'
        ? distinctTeachers.find((t) => t.toLowerCase().includes('anand')) || distinctTeachers[0]
        : distinctTeachers[0];
    const secondPendingTeacher =
      schoolId === 'school-vis-jjr'
        ? distinctTeachers.find((t) => t.toLowerCase().includes('jagriti')) || distinctTeachers[1]
        : distinctTeachers[1];

    if (firstAbsentTeacher) {
      const leaveDate = '2026-11-19';
      const leaveId = `lr-${schoolId}-1`;
      const autoPlan = runAutoSubstituteEngineForDate({
        schoolId,
        date: leaveDate,
        absentTeachers: [firstAbsentTeacher],
        leaveRequestIdByTeacher: new Map([[firstAbsentTeacher.toLowerCase(), leaveId]]),
        timetable: schoolSlots,
        ruleConfig: subRuleCfg,
        capabilityBands: capBands,
        teacherProfiles: schoolProfiles,
        existingCovers: [],
        actorName: schoolId === 'school-vis-jjr' ? 'Dr. Deepak Dhawan' : 'Dr. Meenakshi Deswal',
        actorRole: 'principal',
      });
      substitutionAssignments.push(...autoPlan.generatedCovers);

      teacherLeaveRequests.push({
        id: leaveId,
        schoolId,
        teacherName: firstAbsentTeacher,
        leaveType: 'Medical Leave',
        startDate: leaveDate,
        endDate: leaveDate,
        reason: 'Scheduled dental appointment and recovery rest.',
        supportingDocRef: 'OPD-Slip-19Nov2026.pdf',
        status: 'Approved',
        appliedAt: '2026-11-18T15:10:00Z',
        reviewedBy: schoolId === 'school-vis-jjr' ? 'Dr. Deepak Dhawan' : 'Dr. Meenakshi Deswal',
        reviewedAt: '2026-11-18T16:00:00Z',
        reviewNote: 'Approved — auto-substitute recommendations generated for coordinator review.',
        affectedSlotCount: autoPlan.generatedCovers.length,
        generatedCoverIds: autoPlan.generatedCovers.map((c) => c.id),
        auditTrail: [
          {
            at: '2026-11-18T15:10:00Z',
            actorName: firstAbsentTeacher,
            actorRole: 'teacher',
            action: 'LEAVE_APPLIED',
            detail: 'Applied for 1-day Medical Leave on 2026-11-19.',
          },
          {
            at: '2026-11-18T16:00:00Z',
            actorName: schoolId === 'school-vis-jjr' ? 'Dr. Deepak Dhawan' : 'Dr. Meenakshi Deswal',
            actorRole: 'principal',
            action: 'LEAVE_APPROVED_AUTO_SUB_QUEUED',
            detail: `Approved leave and queued ${autoPlan.generatedCovers.length} vacant period cover recommendation(s) in pending_review.`,
          },
        ],
      });
    }

    if (secondPendingTeacher && secondPendingTeacher !== firstAbsentTeacher) {
      teacherLeaveRequests.push({
        id: `lr-${schoolId}-2`,
        schoolId,
        teacherName: secondPendingTeacher,
        leaveType: 'Casual Leave',
        startDate: '2026-11-20',
        endDate: '2026-11-20',
        reason: 'Family function out of station.',
        status: 'Pending',
        appliedAt: '2026-11-19T08:15:00Z',
        affectedSlotCount: schoolSlots.filter(
          (s) =>
            s.day === 'Fri' &&
            s.teacherName.toLowerCase().includes(secondPendingTeacher.toLowerCase()),
        ).length,
        generatedCoverIds: [],
        auditTrail: [
          {
            at: '2026-11-19T08:15:00Z',
            actorName: secondPendingTeacher,
            actorRole: 'teacher',
            action: 'LEAVE_APPLIED',
            detail: 'Applied for 1-day Casual Leave on 2026-11-20 (awaiting Principal/Coordinator approval).',
          },
        ],
      });
    }

    productivityKpiConfigs[schoolId] = createDefaultProductivityKpiConfig(schoolId);

    // Seed 1 Evidence-Linked Student Career Plan per school
    if (demoStudent1) {
      studentCareerPlans.push({
        id: `scp-${schoolId}-${demoStudent1.id}`,
        schoolId,
        studentId: demoStudent1.id,
        studentName: demoStudent1.name,
        classSection: demoStudent1.classSection,
        shortlistedCareerIds: ['car-software-ai', 'car-defence-nda'],
        customGoalNote: 'Exploring analytical STEM + leadership pathways with steady NCERT foundations.',
        counsellorNotes:
          'Strong practical thinking observed in SRT & WAT; keep both Mathematics and co-curricular leadership active through Classes 9–12.',
        sharedWithParent: true,
        sessionLogs: [
          {
            id: `slog-${schoolId}-1`,
            date: '2026-11-14',
            counsellorName: 'Dr. Sunita Gill',
            summary: 'Initial career exploration walkthrough comparing Software/AI Engineering and NDA Officer pathways.',
            studentReflections: 'Enjoyed learning about the 9-section roadmap and early Class 9–10 starter projects.',
            nextSteps: ['Complete 1 Python mini-project this term', 'Participate in House leadership duty'],
          },
        ],
        updatedBy: 'Dr. Sunita Gill',
        updatedAt: '2026-11-14',
      });
    }

    // Seed Non-Destructive Presentation Audits & Redesigned Decks from existing Presentations
    const schoolPresentations = params.resources.filter(
      (r) => r.schoolId === schoolId && r.category === 'Presentations',
    );
    const seedTargets = schoolPresentations.slice(0, 4);
    seedTargets.forEach((res, idx) => {
      const isMath = /math/i.test(res.subject);
      const audit = auditExistingPresentation({
        resource: res,
        originalSlideCount: 12 + idx * 2,
        avgWordsPerSlide: idx % 2 === 0 ? 78 : 54,
        visualCoveragePct: idx % 2 === 0 ? 25 : 45,
        hasInteractiveChecks: idx > 1,
        hasVisualSummary: false,
        requestedLanguageMode: isMath ? 'english_only_math' : 'bilingual_en_hi',
        learningObjectives: [
          `Explain the core concepts of ${res.chapter} using labelled visual models`,
          `Apply ${res.chapter} principles to solve classroom & everyday problems`,
        ],
        difficulty: idx === 0 ? 'Standard' : idx === 1 ? 'Foundation' : 'Enrichment',
      });
      presentationAudits.push(audit);

      if (idx < 2) {
        const deck = buildDefaultRedesignedDeckFromAudit({
          audit,
          actorName: res.createdBy || 'Faculty Author',
        });
        if (idx === 0) {
          deck.approvalStatus = 'teacher_approved';
          deck.teacherApprovedBy = res.createdBy;
          deck.teacherApprovedAt = '2026-11-17';
        }
        redesignedDecks.push(deck);
      }
    });
  }

  return {
    thinkingQuestionBank,
    thinkingScoringConfigs,
    thinkingAssessments,
    timetableMasterConfigs,
    substituteRuleConfigs,
    teacherCapabilityProfiles,
    capabilityBandConfigs,
    substitutionAssignments,
    teacherLeaveRequests,
    teacherLeaveBalances,
    productivityKpiConfigs,
    careerProfiles: CAREER_PROFILES_CATALOG,
    studentCareerPlans,
    presentationAudits,
    redesignedDecks,
  };
}
