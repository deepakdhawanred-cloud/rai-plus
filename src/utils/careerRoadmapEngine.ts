import type {
  CareerProfile,
  ComputerSkillAttempt,
  ExamMark,
  LearnersScoreBreakdown,
  OlqKey,
  StudentRecord,
  ThinkingAssessmentSession,
} from '../types';
import type { VcipAttemptRecord, VcipDomainId } from '../types/vcip';
import { OLQ_DEFINITIONS } from './evidenceEngine.ts';
import { computeStudentThinkingComposite } from './thinkingAssessmentEngine.ts';
import { buildDomainSummaries } from './vcipScoringEngine.ts';

export type AcademicStreamId =
  | 'science_pcm'
  | 'science_pcb'
  | 'commerce'
  | 'humanities'
  | 'vocational_interdisciplinary';

export type SubjectClusterId =
  | 'stem_math_physics'
  | 'bio_chem_health'
  | 'commerce_finance'
  | 'humanities_verbal'
  | 'computer_digital'
  | 'general';

export type RoadmapStageStatus = 'completed' | 'current' | 'upcoming' | 'destination';

export interface SubjectAverage {
  subject: string;
  avgPct: number;
  assessmentsCount: number;
  cluster: SubjectClusterId;
}

export interface AssessmentRadarPoint {
  axis: string;
  shortLabel: string;
  score: number;
  recorded: boolean;
  detail: string;
}

export interface SignalContribution {
  id: 'academic' | 'cognitive' | 'olq' | 'thinking' | 'digital' | 'interest';
  label: string;
  score: number | null;
  weightPct: number;
  detail: string;
}

export interface RoadmapMilestoneItem {
  key: string;
  text: string;
}

export interface InteractiveRoadmapNode {
  id: string;
  order: number;
  stageTitle: string;
  phaseLabel: string;
  timeline: string;
  minClass: number;
  maxClass: number;
  status: RoadmapStageStatus;
  milestones: RoadmapMilestoneItem[];
  examsOrCredentials: string[];
  actionItems: string[];
  recommendedResources: string[];
  costHint?: string;
}

export interface ParallelBackupBranch {
  id: string;
  title: string;
  summary: string;
  entryStage: string;
}

export interface MappedCareerPath {
  career: CareerProfile;
  primaryStreamId: AcademicStreamId;
  primaryStreamLabel: string;
  overallFitScore: number;
  fitBand: 'High Alignment' | 'Strong Exploration' | 'Balanced Fit' | 'Skill-Build Path';
  signals: SignalContribution[];
  matchedEvidence: string[];
  growthFocusAreas: string[];
  roadmapNodes: InteractiveRoadmapNode[];
  backupBranches: ParallelBackupBranch[];
  currentStageIndex: number;
  totalMilestones: number;
}

export interface AcademicStreamRecommendation {
  id: AcademicStreamId;
  label: string;
  shortLabel: string;
  subjectsSummary: string;
  fitScore: number;
  fitBand: 'High Alignment' | 'Strong Exploration' | 'Balanced Fit' | 'Exploratory';
  evidenceDrivers: string[];
  careerIds: string[];
  topCareerTitle: string;
}

export interface StudentAssessmentSnapshot {
  studentClassNumber: number;
  classLabel: string;
  overallExamAvgPct: number | null;
  examCount: number;
  subjectAverages: SubjectAverage[];
  vcipAvgScore: number | null;
  vcipAssessedDomains: number;
  vcipDomainScores: Partial<Record<VcipDomainId, number>>;
  topOlqs: Array<{ key: OlqKey; name: string; score: number }>;
  olqAvgScore: number | null;
  thinkingSessionCount: number;
  thinkingBetterScore: number | null;
  thinkingPositiveScore: number | null;
  computerSkillScore: number | null;
  computerSkillGrade: string | null;
  activeSignalCount: number;
  radarMetrics: AssessmentRadarPoint[];
}

export interface StudentCareerIntelligenceMap {
  studentId: string;
  studentName: string;
  classSection: string;
  snapshot: StudentAssessmentSnapshot;
  streamRecommendations: AcademicStreamRecommendation[];
  careerMatches: MappedCareerPath[];
  totalCareersMapped: number;
}

interface StreamMeta {
  id: AcademicStreamId;
  label: string;
  shortLabel: string;
  subjectsSummary: string;
  clusters: SubjectClusterId[];
  vcipDomains: VcipDomainId[];
}

export const ACADEMIC_STREAM_CATALOG: Record<AcademicStreamId, StreamMeta> = {
  science_pcm: {
    id: 'science_pcm',
    label: 'Science (PCM)',
    shortLabel: 'Science PCM',
    subjectsSummary: 'Physics, Chemistry, Mathematics, Computer Science',
    clusters: ['stem_math_physics', 'computer_digital'],
    vcipDomains: ['quantitative_reasoning', 'fluid_reasoning', 'spatial_reasoning'],
  },
  science_pcb: {
    id: 'science_pcb',
    label: 'Science (PCB)',
    shortLabel: 'Science PCB',
    subjectsSummary: 'Physics, Chemistry, Biology, Biotechnology / Psychology',
    clusters: ['bio_chem_health', 'stem_math_physics'],
    vcipDomains: ['working_memory', 'fluid_reasoning', 'verbal_reasoning'],
  },
  commerce: {
    id: 'commerce',
    label: 'Commerce & Finance',
    shortLabel: 'Commerce',
    subjectsSummary: 'Accountancy, Economics, Business Studies, Applied Maths',
    clusters: ['commerce_finance', 'stem_math_physics'],
    vcipDomains: ['quantitative_reasoning', 'processing_speed', 'working_memory'],
  },
  humanities: {
    id: 'humanities',
    label: 'Humanities & Social Sciences',
    shortLabel: 'Humanities',
    subjectsSummary: 'Political Science, History, Economics, Psychology, English',
    clusters: ['humanities_verbal', 'commerce_finance'],
    vcipDomains: ['verbal_reasoning', 'fluid_reasoning', 'working_memory'],
  },
  vocational_interdisciplinary: {
    id: 'vocational_interdisciplinary',
    label: 'Interdisciplinary & Applied',
    shortLabel: 'Applied & Design',
    subjectsSummary: 'Design, Polytechnic / Automation, Digital Media, Applied STEM',
    clusters: ['computer_digital', 'stem_math_physics', 'humanities_verbal'],
    vcipDomains: ['spatial_reasoning', 'fluid_reasoning', 'processing_speed'],
  },
};

interface CareerAffinityConfig {
  primaryStreamId: AcademicStreamId;
  subjectClusters: SubjectClusterId[];
  vcipDomains: VcipDomainId[];
  prefersDigital: boolean;
}

const CAREER_AFFINITY_BY_ID: Record<string, CareerAffinityConfig> = {
  'car-software-ai': {
    primaryStreamId: 'science_pcm',
    subjectClusters: ['stem_math_physics', 'computer_digital'],
    vcipDomains: ['fluid_reasoning', 'quantitative_reasoning', 'working_memory'],
    prefersDigital: true,
  },
  'car-medicine-mbbs': {
    primaryStreamId: 'science_pcb',
    subjectClusters: ['bio_chem_health', 'stem_math_physics'],
    vcipDomains: ['working_memory', 'fluid_reasoning', 'processing_speed'],
    prefersDigital: false,
  },
  'car-chartered-accountancy': {
    primaryStreamId: 'commerce',
    subjectClusters: ['commerce_finance', 'stem_math_physics'],
    vcipDomains: ['quantitative_reasoning', 'processing_speed', 'working_memory'],
    prefersDigital: true,
  },
  'car-defence-nda': {
    primaryStreamId: 'science_pcm',
    subjectClusters: ['stem_math_physics', 'humanities_verbal'],
    vcipDomains: ['spatial_reasoning', 'fluid_reasoning', 'processing_speed'],
    prefersDigital: false,
  },
  'car-law-corporate-litigation': {
    primaryStreamId: 'humanities',
    subjectClusters: ['humanities_verbal', 'commerce_finance'],
    vcipDomains: ['verbal_reasoning', 'fluid_reasoning', 'working_memory'],
    prefersDigital: false,
  },
  'car-upsc-civil-services': {
    primaryStreamId: 'humanities',
    subjectClusters: ['humanities_verbal', 'commerce_finance'],
    vcipDomains: ['verbal_reasoning', 'fluid_reasoning', 'working_memory'],
    prefersDigital: false,
  },
  'car-polytechnic-mechatronics': {
    primaryStreamId: 'vocational_interdisciplinary',
    subjectClusters: ['stem_math_physics', 'computer_digital'],
    vcipDomains: ['spatial_reasoning', 'quantitative_reasoning', 'processing_speed'],
    prefersDigital: true,
  },
  'car-ux-product-design': {
    primaryStreamId: 'vocational_interdisciplinary',
    subjectClusters: ['computer_digital', 'humanities_verbal'],
    vcipDomains: ['spatial_reasoning', 'fluid_reasoning', 'verbal_reasoning'],
    prefersDigital: true,
  },
  'car-economics-policy': {
    primaryStreamId: 'commerce',
    subjectClusters: ['commerce_finance', 'stem_math_physics', 'humanities_verbal'],
    vcipDomains: ['quantitative_reasoning', 'verbal_reasoning', 'fluid_reasoning'],
    prefersDigital: true,
  },
  'car-psychology-counselling': {
    primaryStreamId: 'humanities',
    subjectClusters: ['humanities_verbal', 'bio_chem_health'],
    vcipDomains: ['verbal_reasoning', 'working_memory', 'fluid_reasoning'],
    prefersDigital: false,
  },
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

/**
 * Extracts numeric school class (1–12) from strings like "10-A", "Class 8 B", "XII Science".
 */
export function parseStudentClassNumber(classSection: string): number {
  const cleaned = (classSection || '').trim();
  const digitMatch = cleaned.match(/\b(1[0-2]|[1-9])\b/);
  if (digitMatch) {
    return Number(digitMatch[1]);
  }
  const upper = cleaned.toUpperCase();
  const romanPairs: Array<[RegExp, number]> = [
    [/\bXII\b/, 12],
    [/\bXI\b/, 11],
    [/\bX\b/, 10],
    [/\bIX\b/, 9],
    [/\bVIII\b/, 8],
    [/\bVII\b/, 7],
    [/\bVI\b/, 6],
    [/\bV\b/, 5],
  ];
  for (const [pattern, num] of romanPairs) {
    if (pattern.test(upper)) return num;
  }
  return 9;
}

export function classifySubjectCluster(subject: string): SubjectClusterId {
  const s = subject.trim().toLowerCase();
  if (
    s.includes('computer') ||
    s.includes('coding') ||
    s.includes('informatics') ||
    s.includes('ict') ||
    s.includes('ai') ||
    s.includes('digital')
  ) {
    return 'computer_digital';
  }
  if (s.includes('bio') || s.includes('zoology') || s.includes('botany') || s.includes('biotech')) {
    return 'bio_chem_health';
  }
  if (
    s.includes('account') ||
    s.includes('commerce') ||
    s.includes('business') ||
    s.includes('econom') ||
    s.includes('finance')
  ) {
    return 'commerce_finance';
  }
  if (s.includes('math') || s.includes('physic') || s.includes('chem') || s === 'science' || s.includes('general science')) {
    return 'stem_math_physics';
  }
  if (
    s.includes('english') ||
    s.includes('hindi') ||
    s.includes('history') ||
    s.includes('politic') ||
    s.includes('civics') ||
    s.includes('social') ||
    s.includes('sst') ||
    s.includes('geo') ||
    s.includes('psych') ||
    s.includes('sociolog') ||
    s.includes('sanskrit')
  ) {
    return 'humanities_verbal';
  }
  return 'general';
}

function inferCareerAffinity(career: CareerProfile): CareerAffinityConfig {
  if (CAREER_AFFINITY_BY_ID[career.id]) {
    return CAREER_AFFINITY_BY_ID[career.id];
  }
  const streamText = `${career.entryStage} ${career.streams.join(' ')} ${career.title}`.toLowerCase();
  if (streamText.includes('pcb') || streamText.includes('medical') || streamText.includes('bio')) {
    return {
      primaryStreamId: 'science_pcb',
      subjectClusters: ['bio_chem_health', 'stem_math_physics'],
      vcipDomains: ['working_memory', 'fluid_reasoning'],
      prefersDigital: false,
    };
  }
  if (streamText.includes('pcm') || streamText.includes('engineering') || streamText.includes('science')) {
    return {
      primaryStreamId: 'science_pcm',
      subjectClusters: ['stem_math_physics', 'computer_digital'],
      vcipDomains: ['quantitative_reasoning', 'fluid_reasoning'],
      prefersDigital: true,
    };
  }
  if (streamText.includes('commerce') || streamText.includes('finance') || streamText.includes('account')) {
    return {
      primaryStreamId: 'commerce',
      subjectClusters: ['commerce_finance', 'stem_math_physics'],
      vcipDomains: ['quantitative_reasoning', 'processing_speed'],
      prefersDigital: true,
    };
  }
  if (streamText.includes('humanities') || streamText.includes('law') || streamText.includes('civil') || streamText.includes('psych')) {
    return {
      primaryStreamId: 'humanities',
      subjectClusters: ['humanities_verbal', 'commerce_finance'],
      vcipDomains: ['verbal_reasoning', 'fluid_reasoning'],
      prefersDigital: false,
    };
  }
  return {
    primaryStreamId: 'vocational_interdisciplinary',
    subjectClusters: ['computer_digital', 'stem_math_physics', 'humanities_verbal'],
    vcipDomains: ['spatial_reasoning', 'fluid_reasoning'],
    prefersDigital: true,
  };
}

function slugifyMilestone(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

function buildInteractiveRoadmapNodes(
  career: CareerProfile,
  studentClassNum: number,
  primaryStreamLabel: string,
): InteractiveRoadmapNode[] {
  const eduSteps = career.educationalRoadmap || [];
  const actionStages = career.actionPlan?.stages || [];
  const exams = career.competitionAnalysis?.keyEntranceExams || [];
  const firstBudget = career.financialRoadmap?.tiers?.[0];

  const findActionStage = (keywords: string[]): string[] => {
    const matched = actionStages.find((st) =>
      keywords.some((kw) => st.stage.toLowerCase().includes(kw)),
    );
    return matched ? matched.actions : [];
  };

  const findEduStep = (index: number) => eduSteps[Math.min(index, Math.max(0, eduSteps.length - 1))];

  const stageSpecs: Array<{
    id: string;
    stageTitle: string;
    phaseLabel: string;
    timeline: string;
    minClass: number;
    maxClass: number;
    milestones: string[];
    examsOrCredentials: string[];
    actionItems: string[];
    recommendedResources: string[];
    costHint?: string;
    isDestination?: boolean;
  }> = [
    {
      id: 'foundation',
      stageTitle: 'Foundation & Exploration',
      phaseLabel: 'Classes 6 – 8',
      timeline: 'Middle School',
      minClass: 1,
      maxClass: 8,
      milestones: [
        `Build core fluency in ${primaryStreamLabel} foundational subjects`,
        `Explore curiosity projects linked to ${career.title.split('(')[0].trim()}`,
        'Complete VCIP Cognitive Profile and foundational Thinking Tests',
      ],
      examsOrCredentials: ['School Olympiads & Diagnostic Assessments', 'NCERT Concept Mastery'],
      actionItems:
        findActionStage(['class 9', 'foundation', 'middle']).slice(0, 2).length > 0
          ? findActionStage(['class 9', 'foundation', 'middle']).slice(0, 2)
          : ['Maintain weekly reading & structured problem-solving log'],
      recommendedResources: (career.actionPlan?.recommendedBooks || []).slice(0, 2),
    },
    {
      id: 'class_9_10',
      stageTitle: 'Class 9–10 Board & Stream Choice',
      phaseLabel: 'Classes 9 – 10',
      timeline: 'Secondary Stage',
      minClass: 9,
      maxClass: 10,
      milestones:
        eduSteps[0]?.milestones?.length
          ? eduSteps[0].milestones
          : [
              `Target strong Class 10 board fundamentals for ${primaryStreamLabel}`,
              'Review career backup tracks with parents and school counsellor',
            ],
      examsOrCredentials:
        eduSteps[0]?.keyExamsOrCredentials?.length
          ? eduSteps[0].keyExamsOrCredentials
          : ['Class 10 Board Examination (CBSE / HBSE / ICSE)'],
      actionItems: findActionStage(['class 9', 'class 10', '9–10']),
      recommendedResources: (career.actionPlan?.starterProjects || []).slice(0, 2),
    },
    {
      id: 'class_11_12',
      stageTitle: 'Senior Secondary & Entrance Prep',
      phaseLabel: 'Classes 11 – 12',
      timeline: eduSteps[1]?.timeline || '2 Years (Class 11–12)',
      minClass: 11,
      maxClass: 12,
      milestones:
        eduSteps[1]?.milestones?.length
          ? eduSteps[1].milestones
          : [
              `Enrol in ${career.streams.join(' / ')} subject combination`,
              `Prepare systematically for ${exams.slice(0, 2).join(', ') || 'core entrance tests'}`,
            ],
      examsOrCredentials:
        eduSteps[1]?.keyExamsOrCredentials?.length
          ? eduSteps[1].keyExamsOrCredentials
          : exams.slice(0, 3),
      actionItems: findActionStage(['class 11', 'class 12', '11–12']),
      recommendedResources: (career.actionPlan?.recommendedBooks || []).slice(0, 3),
    },
    {
      id: 'undergrad',
      stageTitle: findEduStep(2)?.stage || 'Undergraduate / Core Qualification',
      phaseLabel: 'Post-School Degree / Diploma',
      timeline: findEduStep(2)?.timeline || '3 – 5 Years',
      minClass: 13,
      maxClass: 16,
      milestones:
        findEduStep(2)?.milestones?.length
          ? findEduStep(2).milestones
          : [
              `Complete ${career.qualifications[0] || 'recognised undergraduate qualification'}`,
              'Build portfolio, lab/case work, and peer collaborations',
            ],
      examsOrCredentials:
        findEduStep(2)?.keyExamsOrCredentials?.length
          ? findEduStep(2).keyExamsOrCredentials
          : career.qualifications.slice(0, 2),
      actionItems: findActionStage(['college', 'undergrad', 'degree', 'year']),
      recommendedResources: (career.actionPlan?.starterProjects || []).slice(0, 3),
      costHint: firstBudget ? `${firstBudget.tierLabel}: ${firstBudget.estimatedTotalInr}` : career.budgetTier,
    },
    {
      id: 'specialisation',
      stageTitle: eduSteps[3]?.stage || 'Specialisation & Practical Exposure',
      phaseLabel: 'Internships / Licensure / PG',
      timeline: eduSteps[3]?.timeline || '1 – 3 Years',
      minClass: 17,
      maxClass: 19,
      milestones:
        eduSteps[3]?.milestones?.length
          ? eduSteps[3].milestones
          : [
              'Complete supervised internships, articleship, or capstone immersion',
              'Validate specialist credentials or optional postgraduate pathway',
            ],
      examsOrCredentials:
        eduSteps[3]?.keyExamsOrCredentials?.length
          ? eduSteps[3].keyExamsOrCredentials
          : ['Supervised Practical Portfolio / Professional Registration'],
      actionItems: findActionStage(['pre-job', 'intern', 'final', 'placement']),
      recommendedResources: (career.actionPlan?.internshipsAndExposure || []).slice(0, 3),
      costHint: career.financialRoadmap?.tiers?.[1]
        ? `${career.financialRoadmap.tiers[1].tierLabel}: ${career.financialRoadmap.tiers[1].estimatedTotalInr}`
        : undefined,
    },
    {
      id: 'destination',
      stageTitle: 'Target Career Roles & Growth',
      phaseLabel: 'Career Launch & Progression',
      timeline: 'Early Career → Leadership',
      minClass: 20,
      maxClass: 25,
      milestones: career.overview.typicalRoles.slice(0, 3).map((role) => `Target Role: ${role}`),
      examsOrCredentials: career.overview.emergingDirections.slice(0, 2),
      actionItems: career.workingLife.dailyResponsibilities.slice(0, 3),
      recommendedResources: career.marketStudy.geographicHubs.slice(0, 4),
      isDestination: true,
    },
  ];

  return stageSpecs.map((spec, order) => {
    let status: RoadmapStageStatus;
    if (spec.isDestination) {
      status = 'destination';
    } else if (studentClassNum > spec.maxClass) {
      status = 'completed';
    } else if (studentClassNum >= spec.minClass && studentClassNum <= spec.maxClass) {
      status = 'current';
    } else {
      status = 'upcoming';
    }

    const milestones: RoadmapMilestoneItem[] = spec.milestones
      .filter((m) => m.trim().length > 0)
      .slice(0, 4)
      .map((text, idx) => ({
        key: `${career.id}::${spec.id}::${idx}_${slugifyMilestone(text)}`,
        text,
      }));

    return {
      id: spec.id,
      order,
      stageTitle: spec.stageTitle,
      phaseLabel: spec.phaseLabel,
      timeline: spec.timeline,
      minClass: spec.minClass,
      maxClass: spec.maxClass,
      status,
      milestones,
      examsOrCredentials: spec.examsOrCredentials.filter(Boolean),
      actionItems: spec.actionItems.filter(Boolean),
      recommendedResources: spec.recommendedResources.filter(Boolean),
      costHint: spec.costHint,
    };
  });
}

function classifyFitBand(score: number): MappedCareerPath['fitBand'] {
  if (score >= 76) return 'High Alignment';
  if (score >= 62) return 'Strong Exploration';
  if (score >= 48) return 'Balanced Fit';
  return 'Skill-Build Path';
}

function classifyStreamBand(score: number): AcademicStreamRecommendation['fitBand'] {
  if (score >= 76) return 'High Alignment';
  if (score >= 62) return 'Strong Exploration';
  if (score >= 48) return 'Balanced Fit';
  return 'Exploratory';
}

/**
 * Deterministically maps a student's real recorded assessments (subject exam marks,
 * 6-domain VCIP cognitive profile, 15-OLQ strengths, Thinking Tests, Computer Skill
 * benchmark, and declared interests) to ranked academic streams and interactive visual
 * career roadmaps. Never fabricates scores when an assessment signal is unrecorded.
 */
export function buildStudentCareerIntelligenceMap(params: {
  student: StudentRecord;
  examMarks: ExamMark[];
  breakdown?: LearnersScoreBreakdown;
  vcipAttempts?: VcipAttemptRecord[];
  thinkingSessions?: ThinkingAssessmentSession[];
  computerSkillAttempts?: ComputerSkillAttempt[];
  profiles: CareerProfile[];
  declaredInterests?: string[];
}): StudentCareerIntelligenceMap {
  const {
    student,
    examMarks,
    breakdown,
    vcipAttempts = [],
    thinkingSessions = [],
    computerSkillAttempts = [],
    profiles,
    declaredInterests = [],
  } = params;

  const studentClassNumber = parseStudentClassNumber(student.classSection);
  const olqNameByKey = new Map<OlqKey, string>(OLQ_DEFINITIONS.map((d) => [d.key, d.name]));

  // 1. Aggregate subject exam marks for this student
  const studentMarks = examMarks.filter((m) => m.studentId === student.id && m.maxMarks > 0);
  const bySubject = new Map<string, number[]>();
  for (const mark of studentMarks) {
    const pct = clampScore((mark.obtainedMarks / mark.maxMarks) * 100);
    const key = mark.subject.trim();
    const list = bySubject.get(key) || [];
    list.push(pct);
    bySubject.set(key, list);
  }

  const subjectAverages: SubjectAverage[] = Array.from(bySubject.entries())
    .map(([subject, pcts]) => ({
      subject,
      avgPct: mean(pcts) ?? 0,
      assessmentsCount: pcts.length,
      cluster: classifySubjectCluster(subject),
    }))
    .sort((a, b) => b.avgPct - a.avgPct || a.subject.localeCompare(b.subject));

  const clusterScores = new Map<SubjectClusterId, number>();
  const clusterBuckets = new Map<SubjectClusterId, number[]>();
  for (const subj of subjectAverages) {
    const arr = clusterBuckets.get(subj.cluster) || [];
    arr.push(subj.avgPct);
    clusterBuckets.set(subj.cluster, arr);
  }
  for (const [clusterId, values] of clusterBuckets.entries()) {
    const avg = mean(values);
    if (avg !== null) clusterScores.set(clusterId, avg);
  }

  const overallExamAvgPct =
    subjectAverages.length > 0
      ? mean(subjectAverages.map((s) => s.avgPct))
      : breakdown?.components.academic.score ?? null;

  // 2. Aggregate Layer 1 VCIP Cognitive Profile
  const studentVcip = vcipAttempts.filter((a) => a.studentId === student.id);
  const vcipSummaries = buildDomainSummaries(studentVcip);
  const vcipDomainScores: Partial<Record<VcipDomainId, number>> = {};
  const recordedVcipValues: number[] = [];
  for (const summary of vcipSummaries) {
    if (summary.latestScore !== null) {
      vcipDomainScores[summary.domain] = summary.latestScore;
      recordedVcipValues.push(summary.latestScore);
    }
  }
  const vcipAvgScore = mean(recordedVcipValues);

  // 3. Extract 15-OLQ strengths
  const olqEntries: Array<{ key: OlqKey; name: string; score: number }> = [];
  if (breakdown) {
    for (const [key, item] of Object.entries(breakdown.olqScores) as Array<
      [OlqKey, { score: number | null; evidenceCount: number }]
    >) {
      if (item.score !== null) {
        olqEntries.push({
          key,
          name: olqNameByKey.get(key) || key,
          score: item.score,
        });
      }
    }
  }
  olqEntries.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const olqScoreByKey = new Map<OlqKey, number>(olqEntries.map((o) => [o.key, o.score]));
  const olqAvgScore = mean(olqEntries.map((o) => o.score));
  const topOlqs = olqEntries.slice(0, 4);

  // 4. Thinking Assessment composite
  const thinkingComposite = computeStudentThinkingComposite(student.id, thinkingSessions);
  const thinkingBetterScore =
    thinkingComposite.sessionCount > 0 ? thinkingComposite.dimensions.betterThinking : null;
  const thinkingPositiveScore =
    thinkingComposite.sessionCount > 0 ? thinkingComposite.dimensions.positiveThinking : null;

  // 5. Computer Skill Test benchmark
  const studentComp = computerSkillAttempts
    .filter((a) => a.studentId === student.id)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const latestComp = studentComp[0] || null;
  const computerSkillScore = latestComp ? latestComp.overallScore : null;
  const computerSkillGrade = latestComp ? latestComp.grade : null;

  const activeSignalCount = [
    overallExamAvgPct !== null,
    vcipAvgScore !== null,
    olqAvgScore !== null,
    thinkingBetterScore !== null,
    computerSkillScore !== null,
  ].filter(Boolean).length;

  // 6. Build 6-axis unified Assessment Fingerprint Radar
  const quantValues = [
    clusterScores.get('stem_math_physics'),
    clusterScores.get('commerce_finance'),
    vcipDomainScores.quantitative_reasoning,
  ].filter((v): v is number => v !== undefined);

  const verbalValues = [
    clusterScores.get('humanities_verbal'),
    vcipDomainScores.verbal_reasoning,
    olqScoreByKey.get('power_of_expression'),
  ].filter((v): v is number => v !== undefined);

  const logicValues = [
    vcipDomainScores.fluid_reasoning,
    olqScoreByKey.get('reasoning_ability'),
    olqScoreByKey.get('effective_intelligence'),
    thinkingBetterScore ?? undefined,
  ].filter((v): v is number => v !== undefined);

  const spatialCreativeValues = [
    vcipDomainScores.spatial_reasoning,
    clusterScores.get('bio_chem_health'),
    olqScoreByKey.get('initiative'),
  ].filter((v): v is number => v !== undefined);

  const leadershipValues = [
    olqScoreByKey.get('organising_ability'),
    olqScoreByKey.get('influence_group'),
    olqScoreByKey.get('self_confidence'),
    olqScoreByKey.get('determination'),
    thinkingPositiveScore ?? undefined,
  ].filter((v): v is number => v !== undefined);

  const executionDigitalValues = [
    computerSkillScore ?? undefined,
    clusterScores.get('computer_digital'),
    vcipDomainScores.processing_speed,
    vcipDomainScores.working_memory,
    olqScoreByKey.get('sense_of_responsibility'),
  ].filter((v): v is number => v !== undefined);

  const makeRadarPoint = (
    axis: string,
    shortLabel: string,
    values: number[],
    fallbackScore: number | null,
    detailWhenRecorded: string,
  ): AssessmentRadarPoint => {
    const avg = mean(values);
    if (avg !== null) {
      return { axis, shortLabel, score: avg, recorded: true, detail: detailWhenRecorded };
    }
    if (fallbackScore !== null) {
      return {
        axis,
        shortLabel,
        score: fallbackScore,
        recorded: false,
        detail: 'Baseline from overall academic average; add targeted assessment to refine',
      };
    }
    return {
      axis,
      shortLabel,
      score: 0,
      recorded: false,
      detail: 'Not yet assessed',
    };
  };

  const radarMetrics: AssessmentRadarPoint[] = [
    makeRadarPoint(
      'Quantitative & STEM',
      'Quant / STEM',
      quantValues,
      overallExamAvgPct,
      'Mathematics, Science, Commerce & Quantitative Reasoning',
    ),
    makeRadarPoint(
      'Verbal & Expression',
      'Verbal',
      verbalValues,
      overallExamAvgPct,
      'Languages, Humanities, Verbal Reasoning & Expression OLQ',
    ),
    makeRadarPoint(
      'Abstract & Logic',
      'Logic',
      logicValues,
      overallExamAvgPct,
      'Fluid Reasoning, Reasoning OLQ & Better Thinking Tests',
    ),
    makeRadarPoint(
      'Spatial & Applied',
      'Spatial',
      spatialCreativeValues,
      overallExamAvgPct,
      'Spatial Visualisation, Lab/Bio Sciences & Initiative',
    ),
    makeRadarPoint(
      'Leadership & Grit',
      'Leadership',
      leadershipValues,
      olqAvgScore,
      'Organising Ability, Influence, Self-Confidence & Determination',
    ),
    makeRadarPoint(
      'Digital & Execution',
      'Digital',
      executionDigitalValues,
      overallExamAvgPct,
      'Computer Skill Benchmark, Processing Speed & Ownership',
    ),
  ];

  // 7. Score every CareerProfile transparently across available assessment signals
  const normalizedInterests = declaredInterests
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const studentStreamHint = (student.stream || '').trim().toLowerCase();

  const careerMatches: MappedCareerPath[] = profiles.map((career) => {
    const affinity = inferCareerAffinity(career);
    const streamMeta = ACADEMIC_STREAM_CATALOG[affinity.primaryStreamId];

    // Signal A: Subject-Cluster Academic Fit (30% nominal weight)
    const relevantSubjectPcts: number[] = [];
    const matchedSubjectNames: string[] = [];
    for (const subj of subjectAverages) {
      if (affinity.subjectClusters.includes(subj.cluster)) {
        relevantSubjectPcts.push(subj.avgPct);
        matchedSubjectNames.push(`${subj.subject} (${subj.avgPct}%)`);
      }
    }
    const academicSignalScore =
      relevantSubjectPcts.length > 0
        ? mean(relevantSubjectPcts)
        : overallExamAvgPct !== null
          ? Math.max(35, overallExamAvgPct - 6)
          : null;

    // Signal B: Cognitive Profile VCIP Fit (24% nominal weight)
    const relevantVcipScores = affinity.vcipDomains
      .map((d) => vcipDomainScores[d])
      .filter((v): v is number => v !== undefined);
    const cognitiveSignalScore =
      relevantVcipScores.length > 0 ? mean(relevantVcipScores) : vcipAvgScore;

    // Signal C: 15-OLQ Alignment Fit (20% nominal weight)
    const alignedOlqScores = career.alignedOlqs
      .map((k) => olqScoreByKey.get(k))
      .filter((v): v is number => v !== undefined);
    const olqSignalScore =
      alignedOlqScores.length > 0 ? mean(alignedOlqScores) : olqAvgScore;

    // Signal D: Thinking Profile Fit (10% nominal weight)
    const thinkingSignalScore =
      thinkingBetterScore !== null && thinkingPositiveScore !== null
        ? Math.round(thinkingBetterScore * 0.65 + thinkingPositiveScore * 0.35)
        : thinkingBetterScore;

    // Signal E: Digital Readiness Fit (6% nominal weight — higher relevance for tech/applied careers)
    const digitalSignalScore = computerSkillScore;

    // Signal F: Declared Interest Match (10% nominal weight when student enters interests)
    const matchedInterests = career.interestTags.filter((tag) =>
      normalizedInterests.some(
        (interest) =>
          tag.toLowerCase().includes(interest) || interest.includes(tag.toLowerCase()),
      ),
    );
    const skillInterestMatches = career.skillTags.filter((tag) =>
      normalizedInterests.some(
        (interest) =>
          tag.toLowerCase().includes(interest) || interest.includes(tag.toLowerCase()),
      ),
    );
    const allInterestMatches = Array.from(new Set([...matchedInterests, ...skillInterestMatches]));
    const interestSignalScore =
      normalizedInterests.length > 0
        ? allInterestMatches.length >= 2
          ? 94
          : allInterestMatches.length === 1
            ? 80
            : 42
        : null;

    const rawSignals: Array<{
      id: SignalContribution['id'];
      label: string;
      score: number | null;
      nominalWeight: number;
      detail: string;
    }> = [
      {
        id: 'academic',
        label: 'Subject Marks',
        score: academicSignalScore,
        nominalWeight: 32,
        detail:
          matchedSubjectNames.length > 0
            ? `Matched subjects: ${matchedSubjectNames.slice(0, 3).join(', ')}`
            : overallExamAvgPct !== null
              ? `Overall exam average ${overallExamAvgPct}% (subject-specific marks pending)`
              : 'No exam marks recorded yet',
      },
      {
        id: 'cognitive',
        label: 'Cognitive Profile (VCIP)',
        score: cognitiveSignalScore,
        nominalWeight: 24,
        detail:
          relevantVcipScores.length > 0
            ? `${relevantVcipScores.length} aligned cognitive domain(s) assessed`
            : vcipAvgScore !== null
              ? `Overall VCIP average ${vcipAvgScore}/100`
              : 'No VCIP assessment attempts yet',
      },
      {
        id: 'olq',
        label: '15-OLQ Alignment',
        score: olqSignalScore,
        nominalWeight: 20,
        detail:
          alignedOlqScores.length > 0
            ? `${alignedOlqScores.length}/${career.alignedOlqs.length} career-aligned OLQs observed`
            : 'OLQ evidence accumulating',
      },
      {
        id: 'thinking',
        label: 'Thinking Tests',
        score: thinkingSignalScore,
        nominalWeight: 10,
        detail:
          thinkingSignalScore !== null
            ? `${thinkingComposite.sessionCount} session(s) · Better Thinking ${thinkingBetterScore}/100`
            : 'No Thinking Test completed yet',
      },
      {
        id: 'digital',
        label: 'Digital Readiness',
        score: digitalSignalScore,
        nominalWeight: affinity.prefersDigital ? 8 : 4,
        detail:
          digitalSignalScore !== null
            ? `Computer Skill Benchmark ${digitalSignalScore}/100 (${computerSkillGrade})`
            : 'Computer Skill Test not yet recorded',
      },
      {
        id: 'interest',
        label: 'Student Interests',
        score: interestSignalScore,
        nominalWeight: normalizedInterests.length > 0 ? 12 : 0,
        detail:
          allInterestMatches.length > 0
            ? `Direct match: ${allInterestMatches.slice(0, 3).join(', ')}`
            : normalizedInterests.length > 0
              ? 'Exploratory match outside listed interests'
              : 'Add student interests to personalize ranking',
      },
    ];

    const availableWeightTotal = rawSignals.reduce(
      (sum, s) => sum + (s.score !== null ? s.nominalWeight : 0),
      0,
    );

    let weightedSum = 0;
    const signals: SignalContribution[] = rawSignals.map((s) => {
      const effectiveWeightPct =
        availableWeightTotal > 0 && s.score !== null
          ? Math.round((s.nominalWeight / availableWeightTotal) * 100)
          : 0;
      if (s.score !== null && availableWeightTotal > 0) {
        weightedSum += (s.score * s.nominalWeight) / availableWeightTotal;
      }
      return {
        id: s.id,
        label: s.label,
        score: s.score,
        weightPct: effectiveWeightPct,
        detail: s.detail,
      };
    });

    // Small stream continuity bonus (+4) if student already chose a compatible Class 11–12 stream
    let streamBonus = 0;
    if (studentStreamHint) {
      const matchesStream = career.streams.some((st) => {
        const sl = st.toLowerCase();
        if (sl.includes('any')) return true;
        if (studentStreamHint.includes('pcm') && sl.includes('pcm')) return true;
        if (studentStreamHint.includes('pcb') && sl.includes('pcb')) return true;
        if (studentStreamHint.includes('science') && sl.includes('science')) return true;
        if (studentStreamHint.includes('commerce') && sl.includes('commerce')) return true;
        if (
          (studentStreamHint.includes('humanities') || studentStreamHint.includes('arts')) &&
          sl.includes('humanities')
        ) {
          return true;
        }
        return false;
      });
      if (matchesStream) streamBonus = 4;
    }

    const overallFitScore =
      availableWeightTotal > 0 ? clampScore(weightedSum + streamBonus) : 50;

    // Build transparent matched evidence and growth focus bullets
    const matchedEvidence: string[] = [];
    if (matchedSubjectNames.length > 0) {
      matchedEvidence.push(`Strong subject signals in ${matchedSubjectNames.slice(0, 3).join(', ')}.`);
    }
    const strongAlignedOlqNames = career.alignedOlqs
      .filter((k) => (olqScoreByKey.get(k) ?? 0) >= 65)
      .map((k) => `${olqNameByKey.get(k) || k} (${olqScoreByKey.get(k)})`);
    if (strongAlignedOlqNames.length > 0) {
      matchedEvidence.push(`Observed OLQ strengths: ${strongAlignedOlqNames.slice(0, 3).join(', ')}.`);
    }
    if (relevantVcipScores.length > 0 && (mean(relevantVcipScores) ?? 0) >= 65) {
      matchedEvidence.push(
        `Cognitive VCIP readiness averaging ${mean(relevantVcipScores)}/100 across key reasoning domains.`,
      );
    }
    if (allInterestMatches.length > 0) {
      matchedEvidence.push(`Matches declared student interests: ${allInterestMatches.slice(0, 3).join(', ')}.`);
    }
    if (matchedEvidence.length === 0) {
      matchedEvidence.push(
        `Open exploratory path compatible with ${career.streams.join(' / ')} — add subject or VCIP records to sharpen fit.`,
      );
    }

    const growthFocusAreas: string[] = [];
    const developingAlignedOlqs = career.alignedOlqs
      .filter((k) => {
        const sc = olqScoreByKey.get(k);
        return sc !== undefined && sc < 65;
      })
      .map((k) => `${olqNameByKey.get(k) || k} (${olqScoreByKey.get(k)}/100)`);
    if (developingAlignedOlqs.length > 0) {
      growthFocusAreas.push(`Strengthen OLQs: ${developingAlignedOlqs.slice(0, 2).join(', ')}.`);
    }
    if (affinity.prefersDigital && (computerSkillScore === null || computerSkillScore < 70)) {
      growthFocusAreas.push(
        computerSkillScore === null
          ? 'Complete the Computer Skill Test to benchmark practical digital fluency.'
          : `Raise practical digital fluency from ${computerSkillScore}/100 via hands-on projects.`,
      );
    }
    if (relevantVcipScores.length === 0) {
      growthFocusAreas.push('Take Layer 1 VCIP reasoning domains to uncover deeper cognitive strengths.');
    }
    if (growthFocusAreas.length === 0) {
      growthFocusAreas.push(
        `Practice ${career.skillsRequired.technicalDomain.slice(0, 2).join(' & ')} through starter projects.`,
      );
    }

    const roadmapNodes = buildInteractiveRoadmapNodes(career, studentClassNumber, streamMeta.label);
    const currentIdx = roadmapNodes.findIndex((n) => n.status === 'current');
    const totalMilestones = roadmapNodes.reduce((sum, n) => sum + n.milestones.length, 0);

    const backupBranches: ParallelBackupBranch[] = (
      career.competitionAnalysis?.parallelBackupTracks || []
    ).map((track, idx) => {
      const parts = track.split(/[:—–-]/);
      const title = parts[0]?.trim() || `Parallel Option ${idx + 1}`;
      const summary = parts.slice(1).join(' — ').trim() || track;
      return {
        id: `${career.id}-backup-${idx}`,
        title,
        summary,
        entryStage: career.streams[0] || streamMeta.label,
      };
    });

    return {
      career,
      primaryStreamId: affinity.primaryStreamId,
      primaryStreamLabel: streamMeta.label,
      overallFitScore,
      fitBand: classifyFitBand(overallFitScore),
      signals,
      matchedEvidence,
      growthFocusAreas,
      roadmapNodes,
      backupBranches,
      currentStageIndex: currentIdx >= 0 ? currentIdx : 1,
      totalMilestones,
    };
  });

  careerMatches.sort(
    (a, b) =>
      b.overallFitScore - a.overallFitScore || a.career.title.localeCompare(b.career.title),
  );

  // 8. Build Academic Stream Recommendations from mapped careers + stream-level signals
  const streamOrder: AcademicStreamId[] = [
    'science_pcm',
    'science_pcb',
    'commerce',
    'humanities',
    'vocational_interdisciplinary',
  ];

  const streamRecommendations: AcademicStreamRecommendation[] = streamOrder.map((streamId) => {
    const meta = ACADEMIC_STREAM_CATALOG[streamId];
    const linkedCareers = careerMatches.filter((m) => m.primaryStreamId === streamId);
    const linkedCareerScores = linkedCareers.map((c) => c.overallFitScore);

    const streamSubjectScores = meta.clusters
      .map((c) => clusterScores.get(c))
      .filter((v): v is number => v !== undefined);
    const streamVcipScores = meta.vcipDomains
      .map((d) => vcipDomainScores[d])
      .filter((v): v is number => v !== undefined);

    const topCareerScore = linkedCareerScores[0] ?? null;
    const avgLinkedScore = mean(linkedCareerScores);
    const avgStreamSubject = mean(streamSubjectScores);
    const avgStreamVcip = mean(streamVcipScores);

    const components = [
      topCareerScore !== null ? { score: topCareerScore, w: 0.45 } : null,
      avgLinkedScore !== null ? { score: avgLinkedScore, w: 0.2 } : null,
      avgStreamSubject !== null ? { score: avgStreamSubject, w: 0.25 } : null,
      avgStreamVcip !== null ? { score: avgStreamVcip, w: 0.1 } : null,
    ].filter((x): x is { score: number; w: number } => x !== null);

    const weightSum = components.reduce((s, c) => s + c.w, 0);
    const fitScore =
      weightSum > 0
        ? clampScore(components.reduce((s, c) => s + (c.score * c.w) / weightSum, 0))
        : 50;

    const evidenceDrivers: string[] = [];
    if (avgStreamSubject !== null) {
      evidenceDrivers.push(`Aligned subject marks avg ${avgStreamSubject}%`);
    }
    if (avgStreamVcip !== null) {
      evidenceDrivers.push(`Cognitive domains avg ${avgStreamVcip}/100`);
    }
    if (linkedCareers[0]) {
      evidenceDrivers.push(
        `Top path: ${linkedCareers[0].career.title.split('(')[0].trim()} (${linkedCareers[0].overallFitScore}%)`,
      );
    }

    return {
      id: streamId,
      label: meta.label,
      shortLabel: meta.shortLabel,
      subjectsSummary: meta.subjectsSummary,
      fitScore,
      fitBand: classifyStreamBand(fitScore),
      evidenceDrivers,
      careerIds: linkedCareers.map((c) => c.career.id),
      topCareerTitle: linkedCareers[0]?.career.title.split('(')[0].trim() || meta.label,
    };
  });

  streamRecommendations.sort(
    (a, b) => b.fitScore - a.fitScore || a.label.localeCompare(b.label),
  );

  return {
    studentId: student.id,
    studentName: student.name,
    classSection: student.classSection,
    snapshot: {
      studentClassNumber,
      classLabel: `Class ${student.classSection}`,
      overallExamAvgPct,
      examCount: studentMarks.length,
      subjectAverages,
      vcipAvgScore,
      vcipAssessedDomains: recordedVcipValues.length,
      vcipDomainScores,
      topOlqs,
      olqAvgScore,
      thinkingSessionCount: thinkingComposite.sessionCount,
      thinkingBetterScore,
      thinkingPositiveScore,
      computerSkillScore,
      computerSkillGrade,
      activeSignalCount,
      radarMetrics,
    },
    streamRecommendations,
    careerMatches,
    totalCareersMapped: careerMatches.length,
  };
}
