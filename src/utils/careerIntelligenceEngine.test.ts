import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEvidenceLinkedCareerSuggestions,
  filterCareerProfiles,
} from './careerIntelligenceEngine';
import type { CareerProfile, StudentRecord } from '../types';

const SAMPLE_CAREER: CareerProfile = {
  id: 'car-eng',
  title: 'Software & AI Systems Engineering',
  entryStage: 'After Class 12 — Science',
  streams: ['Science (PCM)'],
  qualifications: ['B.Tech / B.E. in Computer Science'],
  interestTags: ['Coding', 'Problem Solving', 'Mathematics'],
  skillTags: ['Algorithms', 'Systems Design'],
  budgetTier: 'Moderate (₹3L – ₹12L)',
  locationScope: 'India & Global',
  alignedOlqs: ['reasoning_ability', 'effective_intelligence', 'organising_ability'],
  overview: {
    summary: 'Design reliable software and AI-assisted systems.',
    corePurpose: 'Solve real-world engineering challenges.',
    typicalRoles: ['Software Engineer'],
    emergingDirections: ['Applied AI Engineering'],
  },
  educationalRoadmap: [{ stage: 'UG', timeline: '4 yrs', milestones: ['B.Tech'], keyExamsOrCredentials: ['JEE Main'] }],
  aptitudeProfile: {
    iqFocus: 'Logical & quantitative reasoning',
    eqFocus: 'Team empathy in product engineering',
    aqFocus: 'Iterative debugging persistence',
    cqFocus: 'Architectural creativity',
    qualitativeNote: 'Qualitative indicators only — no fixed IQ cutoff.',
  },
  workingLife: {
    dailyResponsibilities: ['Build & review code'],
    workEnvironment: 'Hybrid/office engineering teams',
    workHoursAndPace: 'Project-driven sprints',
    challengesAndRewards: 'Continuous learning',
  },
  financialRoadmap: {
    tiers: [
      {
        tierLabel: 'Government / Public',
        estimatedTotalInr: '₹4L – ₹10L (4 yrs)',
        annualFeeRangeInr: '₹1L – ₹2.5L/yr',
        scholarshipNotes: 'NSP & institute fee waivers',
        verificationStatus: 'estimated',
        sourceNote: 'Public NIT/IIT fee bands',
        lastUpdated: '2026-10',
      },
    ],
    additionalCostsNote: 'Laptop & hostel separate',
    disclaimer: 'Estimates only; verify official prospectus.',
  },
  marketStudy: {
    demandOutlook: 'Sustained structural demand for strong fundamentals.',
    industryDrivers: ['Digital public infrastructure'],
    geographicHubs: ['Bengaluru', 'NCR', 'Hyderabad'],
    credibleSources: [{ name: 'NASSCOM Strategic Review', year: '2025', note: 'Industry skill trends' }],
    dataIntegrityNote: 'No fabricated salary or placement guarantees.',
  },
  competitionAnalysis: {
    keyEntranceExams: ['JEE Main', 'BITSAT', 'CUET'],
    competitionDrivers: ['High seat competition in top tier institutes'],
    preparationReality: 'Requires steady conceptual practice.',
    parallelBackupTracks: ['B.Sc. Computer Science', 'BCA + Portfolio'],
  },
  skillsRequired: {
    cognitiveAnalytical: ['Problem decomposition'],
    technicalDomain: ['Data structures'],
    communication: ['Technical writing'],
    leadershipCollaboration: ['Code review teamwork'],
    digitalAiLiteracy: ['Version control'],
    emotionalResilience: ['Debugging patience'],
    executionSelfManagement: ['Sprint planning'],
    ethicsCivicAwareness: ['Data privacy'],
  },
  actionPlan: {
    stages: [{ stage: 'Class 9', actions: ['Strengthen algebra & logic'] }],
    recommendedBooks: ['NCERT Mathematics'],
    starterProjects: ['Build a school timetable helper'],
    internshipsAndExposure: ['Open-source student clubs'],
  },
};

test('Career filter and evidence-linked counselling rationale work transparently', () => {
  const filtered = filterCareerProfiles([SAMPLE_CAREER], {
    query: 'JEE',
    entryStage: 'After Class 12 — Science',
    stream: 'Science',
    budgetTier: 'ALL',
    locationScope: 'ALL',
    interestOrSkill: 'Coding',
  });
  assert.equal(filtered.length, 1);

  const student: StudentRecord = {
    id: 'stu-9',
    schoolId: 'sch-1',
    admissionNo: 'A1',
    rollNo: '1',
    name: 'Diya',
    classSection: '11-Science',
    stream: 'Science',
    house: 'Shakti',
    guardianName: 'Parent',
    guardianPhone: '9999999999',
    udiseStudentId: 'U1',
    haryanaMisId: 'M1',
    attendancePct: 92,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 50000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
  };

  const suggestions = buildEvidenceLinkedCareerSuggestions({
    student,
    thinkingSessions: [],
    profiles: [SAMPLE_CAREER],
    declaredInterests: ['Coding'],
  });
  assert.equal(suggestions.length, 1);
  assert.ok(suggestions[0].transparentReasons.some((r) => r.includes('Coding')));
});
