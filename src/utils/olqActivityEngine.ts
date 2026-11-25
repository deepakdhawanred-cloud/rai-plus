import type {
  ActivityContributionLevel,
  ActivityKind,
  ActivityParticipationEntry,
  ActivityRecord,
  DevelopmentEvidence,
  LearnersComponentKey,
  LearnersScoreBreakdown,
  ObservationContext,
  OlqKey,
  StudentRecord,
} from '../types';
import { COMPONENT_LABELS, OLQ_DEFINITIONS } from './evidenceEngine.ts';

export const OBSERVATION_CONTEXTS: ObservationContext[] = [
  'Classroom',
  'Group Activity',
  'Project',
  'Presentation',
  'Practical / Lab',
  'Sports / Field',
  'House / Assembly Duty',
  'Cultural',
];

export const ACTIVITY_KINDS: Array<{ value: ActivityKind; label: string }> = [
  { value: 'class', label: 'Classroom Discussion' },
  { value: 'group', label: 'Group Work' },
  { value: 'project', label: 'Project' },
  { value: 'presentation', label: 'Presentation / Seminar' },
  { value: 'practical', label: 'Practical / Lab' },
  { value: 'sport', label: 'Sports / Athletics' },
  { value: 'house', label: 'House Event' },
  { value: 'cultural', label: 'Cultural Activity' },
  { value: 'duty', label: 'Monitor / Duty Roster' },
];

const ACTIVITY_KIND_OLQS: Record<ActivityKind, OlqKey[]> = {
  class: ['power_of_expression', 'liveliness'],
  group: ['cooperation', 'social_adaptability', 'influence_group'],
  project: ['organising_ability', 'initiative', 'effective_intelligence'],
  presentation: ['power_of_expression', 'self_confidence'],
  practical: ['effective_intelligence', 'organising_ability', 'determination'],
  sport: ['stamina', 'courage', 'speed_of_decision', 'cooperation'],
  house: ['sense_of_responsibility', 'cooperation', 'influence_group'],
  cultural: ['liveliness', 'self_confidence', 'power_of_expression'],
  duty: ['sense_of_responsibility', 'organising_ability', 'initiative'],
};

const LEVEL_TO_SCORE: Record<ActivityContributionLevel, number> = {
  1: 68,
  2: 78,
  3: 86,
  4: 93,
};

export interface IncidentRatingInput {
  olqKey: OlqKey;
  score: number;
}

export function validateObservationIncidentInput(input: {
  studentId?: string;
  context?: ObservationContext | '';
  summary?: string;
  date?: string;
  ratings?: IncidentRatingInput[];
}): { valid: boolean; error?: string } {
  if (!input.studentId?.trim()) {
    return { valid: false, error: 'Target student is required.' };
  }
  if (!input.context || !OBSERVATION_CONTEXTS.includes(input.context)) {
    return { valid: false, error: 'Observation context is required.' };
  }
  if (!input.summary?.trim()) {
    return { valid: false, error: 'Observed evidence summary is required.' };
  }
  if (!input.date?.trim()) {
    return { valid: false, error: 'Observation date is required.' };
  }
  const ratings = input.ratings || [];
  if (ratings.length < 1 || ratings.length > 3) {
    return { valid: false, error: 'Select 1 to 3 OLQ qualities for an observation incident.' };
  }
  const seen = new Set<OlqKey>();
  for (const r of ratings) {
    if (seen.has(r.olqKey)) {
      return { valid: false, error: 'Each selected OLQ quality in an incident must be distinct.' };
    }
    seen.add(r.olqKey);
    if (!Number.isFinite(r.score) || r.score < 40 || r.score > 100) {
      return { valid: false, error: 'OLQ ratings must be between 40 and 100.' };
    }
  }
  return { valid: true };
}

export function buildIncidentEvidence(params: {
  schoolId: string;
  studentId: string;
  context: ObservationContext;
  summary: string;
  date: string;
  ratings: IncidentRatingInput[];
  enteredBy: string;
  incidentId?: string;
}): DevelopmentEvidence {
  const incidentId =
    params.incidentId || `inc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const olqContributions: Partial<Record<OlqKey, number>> = {};
  let sum = 0;
  for (const r of params.ratings) {
    const clamped = Math.round(Math.max(40, Math.min(100, r.score)));
    olqContributions[r.olqKey] = clamped;
    sum += clamped;
  }
  const avg = Math.round(sum / params.ratings.length);

  return {
    id: `ev-${incidentId}`,
    schoolId: params.schoolId,
    studentId: params.studentId,
    sourceKey: `obs:${params.studentId}:${incidentId}`,
    sourceType: 'teacher_observation',
    date: params.date,
    observationContext: params.context,
    incidentId,
    summary: `[${params.context}] ${params.summary.trim()}`,
    olqContributions,
    componentContributions: {
      participation: avg,
      personalGrowth: avg,
    },
    learningSignals: {
      classroomParticipation: avg,
      groupContributions: avg,
    },
    enteredBy: params.enteredBy,
    validated: true,
  };
}

/**
 * P4-2 Whole-Class Activity & Duty Participation Register:
 * Returns null if `tookPart` is false (never fabricates 0 or penalises missing opportunities).
 */
export function mapActivityParticipationToEvidence(
  activity: Pick<ActivityRecord, 'id' | 'schoolId' | 'kind' | 'title' | 'date' | 'recordedBy'>,
  entry: ActivityParticipationEntry,
): DevelopmentEvidence | null {
  if (!entry.tookPart) return null;

  const level: ActivityContributionLevel =
    entry.contributionLevel === 1 ||
    entry.contributionLevel === 2 ||
    entry.contributionLevel === 3 ||
    entry.contributionLevel === 4
      ? entry.contributionLevel
      : 3;

  const baseScore = LEVEL_TO_SCORE[level];
  const olqKeys = ACTIVITY_KIND_OLQS[activity.kind] || ['cooperation'];
  const olqContributions: Partial<Record<OlqKey, number>> = {};
  for (const key of olqKeys) {
    olqContributions[key] = baseScore;
  }

  const kindMeta = ACTIVITY_KINDS.find((k) => k.value === activity.kind)?.label ?? activity.kind;
  const sourceKey = `act:${activity.id}:${entry.studentId}`;

  return {
    id: `ev-${sourceKey}`,
    schoolId: activity.schoolId,
    studentId: entry.studentId,
    sourceKey,
    sourceType:
      activity.kind === 'sport'
        ? 'sports_activity'
        : activity.kind === 'duty' || activity.kind === 'house'
          ? 'responsibility'
          : 'participation',
    date: activity.date,
    summary: `${kindMeta} — ${activity.title} (Contribution Level ${level}/4)${
      entry.note?.trim() ? `: ${entry.note.trim()}` : ''
    }`,
    olqContributions,
    componentContributions: {
      participation: baseScore,
      personalGrowth: Math.max(60, baseScore - 2),
    },
    learningSignals: {
      classroomParticipation: baseScore,
      groupContributions: baseScore,
    },
    enteredBy: activity.recordedBy,
    validated: true,
  };
}

export interface SectionCoverageRow {
  classSection: string;
  studentCount: number;
  componentCoveredCounts: Record<LearnersComponentKey, number>;
  olqCoveredCounts: Record<OlqKey, number>;
  avgCoveragePct: number;
  thinEvidenceStudents: Array<{ id: string; name: string; coveragePct: number }>;
}

/**
 * P6-3 Section Evidence Coverage Matrix:
 * Shows per class section how many students have evidence for each Learners component
 * and each of the 15 OLQs. Thin-evidence students are listed alphabetically (never ranked by score).
 */
export function computeSectionCoverageMatrix(
  students: StudentRecord[],
  breakdowns: Record<string, LearnersScoreBreakdown>,
): SectionCoverageRow[] {
  const bySection = new Map<string, StudentRecord[]>();
  for (const st of students) {
    const list = bySection.get(st.classSection) || [];
    list.push(st);
    bySection.set(st.classSection, list);
  }

  const componentKeys = Object.keys(COMPONENT_LABELS) as LearnersComponentKey[];
  const rows: SectionCoverageRow[] = [];

  for (const [classSection, secStudents] of bySection.entries()) {
    const componentCoveredCounts = {} as Record<LearnersComponentKey, number>;
    for (const ck of componentKeys) componentCoveredCounts[ck] = 0;

    const olqCoveredCounts = {} as Record<OlqKey, number>;
    for (const def of OLQ_DEFINITIONS) olqCoveredCounts[def.key] = 0;

    let coverageSum = 0;
    const thinEvidenceStudents: Array<{ id: string; name: string; coveragePct: number }> = [];

    for (const st of secStudents) {
      const bd = breakdowns[st.id];
      if (!bd) {
        thinEvidenceStudents.push({ id: st.id, name: st.name, coveragePct: 0 });
        continue;
      }

      coverageSum += bd.evidenceCoveragePct;
      if (bd.evidenceCoveragePct < 55) {
        thinEvidenceStudents.push({
          id: st.id,
          name: st.name,
          coveragePct: bd.evidenceCoveragePct,
        });
      }

      for (const ck of componentKeys) {
        if (bd.components[ck]?.score !== null && bd.components[ck]?.evidenceCount > 0) {
          componentCoveredCounts[ck] += 1;
        }
      }

      for (const def of OLQ_DEFINITIONS) {
        if (bd.olqScores[def.key]?.score !== null && bd.olqScores[def.key]?.evidenceCount > 0) {
          olqCoveredCounts[def.key] += 1;
        }
      }
    }

    thinEvidenceStudents.sort((a, b) => a.name.localeCompare(b.name));

    rows.push({
      classSection,
      studentCount: secStudents.length,
      componentCoveredCounts,
      olqCoveredCounts,
      avgCoveragePct:
        secStudents.length > 0 ? Math.round(coverageSum / secStudents.length) : 0,
      thinEvidenceStudents,
    });
  }

  return rows.sort((a, b) => a.classSection.localeCompare(b.classSection));
}
