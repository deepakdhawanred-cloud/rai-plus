import type {
  BudgetTier,
  CareerEntryStage,
  CareerProfile,
  LearnersScoreBreakdown,
  OlqKey,
  StudentRecord,
  ThinkingAssessmentSession,
} from '../types';
import { OLQ_DEFINITIONS } from './evidenceEngine.ts';
import { computeStudentThinkingComposite } from './thinkingAssessmentEngine.ts';

export interface CareerLibraryFilters {
  query: string;
  entryStage: CareerEntryStage | 'ALL';
  stream: string;
  budgetTier: BudgetTier | 'ALL';
  locationScope: CareerProfile['locationScope'] | 'ALL';
  interestOrSkill: string;
}

export function filterCareerProfiles(
  profiles: CareerProfile[],
  filters: CareerLibraryFilters,
): CareerProfile[] {
  const q = filters.query.trim().toLowerCase();
  const interestQ = filters.interestOrSkill.trim().toLowerCase();

  return profiles.filter((c) => {
    if (filters.entryStage !== 'ALL' && c.entryStage !== filters.entryStage) return false;
    if (filters.budgetTier !== 'ALL' && c.budgetTier !== filters.budgetTier) return false;
    if (filters.locationScope !== 'ALL' && c.locationScope !== filters.locationScope) return false;
    if (
      filters.stream !== 'ALL' &&
      !c.streams.some((s) => s.toLowerCase().includes(filters.stream.toLowerCase()))
    ) {
      return false;
    }
    if (interestQ) {
      const hay = [...c.interestTags, ...c.skillTags, ...c.qualifications].join(' ').toLowerCase();
      if (!hay.includes(interestQ)) return false;
    }
    if (q) {
      const searchable = [
        c.title,
        c.entryStage,
        ...c.streams,
        ...c.qualifications,
        ...c.interestTags,
        ...c.skillTags,
        c.overview.summary,
        ...c.competitionAnalysis.keyEntranceExams,
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
}

export interface EvidenceLinkedCareerSuggestion {
  career: CareerProfile;
  alignmentIndicator: 'Strong Exploration Fit' | 'Balanced Exploration Fit' | 'Stretch / Skill-Build Option';
  matchedOlqNames: string[];
  academicContext: string;
  thinkingContext: string;
  transparentReasons: string[];
}

/**
 * Generates transparent, non-prescriptive career exploration suggestions linked to real
 * student academics, 15-OLQ strengths, and Thinking Test observations.
 * Explicitly NEVER auto-decides a career for a student.
 */
export function buildEvidenceLinkedCareerSuggestions(params: {
  student: StudentRecord;
  breakdown?: LearnersScoreBreakdown;
  thinkingSessions: ThinkingAssessmentSession[];
  profiles: CareerProfile[];
  declaredInterests?: string[];
}): EvidenceLinkedCareerSuggestion[] {
  const { student, breakdown, thinkingSessions, profiles, declaredInterests = [] } = params;
  const olqNameByKey = new Map<OlqKey, string>(OLQ_DEFINITIONS.map((d) => [d.key, d.name]));

  // Identify student's top observed OLQs (score >= 65)
  const strongOlqs = new Set<OlqKey>();
  if (breakdown) {
    for (const [k, v] of Object.entries(breakdown.olqScores) as Array<
      [OlqKey, { score: number | null; evidenceCount: number }]
    >) {
      if (v.score !== null && v.score >= 65) {
        strongOlqs.add(k);
      }
    }
  }

  const thinkingProfile = computeStudentThinkingComposite(student.id, thinkingSessions);
  const academicScore = breakdown?.components.academic.score ?? null;
  const interestLower = declaredInterests.map((i) => i.toLowerCase().trim()).filter(Boolean);
  const streamHint = (student.stream || student.classSection || '').toLowerCase();

  const scored = profiles.map((career) => {
    const matchedOlqs = career.alignedOlqs.filter((k) => strongOlqs.has(k));
    const matchedOlqNames = matchedOlqs.map((k) => olqNameByKey.get(k) || k);

    const interestMatches = career.interestTags.filter((tag) =>
      interestLower.some((i) => tag.toLowerCase().includes(i) || i.includes(tag.toLowerCase())),
    );

    const streamAligned =
      !streamHint ||
      career.streams.some((s) => {
        const sl = s.toLowerCase();
        if (sl.includes('any')) return true;
        if (streamHint.includes('science') && sl.includes('science')) return true;
        if (streamHint.includes('commerce') && sl.includes('commerce')) return true;
        if ((streamHint.includes('arts') || streamHint.includes('humanities')) && sl.includes('humanities')) {
          return true;
        }
        return false;
      });

    let points = matchedOlqs.length * 18 + interestMatches.length * 22 + (streamAligned ? 14 : 0);
    if (thinkingProfile.sessionCount > 0 && thinkingProfile.dimensions.betterThinking >= 68) {
      points += 10;
    }

    const transparentReasons: string[] = [];
    if (matchedOlqNames.length > 0) {
      transparentReasons.push(
        `Aligned with observed OLQ strengths: ${matchedOlqNames.slice(0, 3).join(', ')}.`,
      );
    } else {
      transparentReasons.push(
        `Opportunity to consciously build key OLQs (${career.alignedOlqs
          .slice(0, 2)
          .map((k) => olqNameByKey.get(k) || k)
          .join(', ')}).`,
      );
    }

    if (interestMatches.length > 0) {
      transparentReasons.push(`Matches student-declared interests: ${interestMatches.join(', ')}.`);
    }

    if (streamAligned) {
      transparentReasons.push(`Compatible with current academic pathway (${career.streams.join(' / ')}).`);
    }

    const academicContext =
      academicScore !== null
        ? `Academic component score ${academicScore}/100 recorded across assessments.`
        : 'Academic evidence still accumulating — explore entry prerequisites early.';

    const thinkingContext =
      thinkingProfile.sessionCount > 0
        ? `Thinking Tests (${thinkingProfile.sessionCount} session${thinkingProfile.sessionCount > 1 ? 's' : ''}): Better Thinking ${thinkingProfile.dimensions.betterThinking}/100, Positive Thinking ${thinkingProfile.dimensions.positiveThinking}/100.`
        : 'No Thinking Tests completed yet — complete SRT/WAT/TAT to enrich career fit context.';

    const alignmentIndicator: EvidenceLinkedCareerSuggestion['alignmentIndicator'] =
      points >= 46
        ? 'Strong Exploration Fit'
        : points >= 24
          ? 'Balanced Exploration Fit'
          : 'Stretch / Skill-Build Option';

    return {
      points,
      suggestion: {
        career,
        alignmentIndicator,
        matchedOlqNames,
        academicContext,
        thinkingContext,
        transparentReasons,
      },
    };
  });

  return scored
    .sort((a, b) => b.points - a.points || a.suggestion.career.title.localeCompare(b.suggestion.career.title))
    .map((s) => s.suggestion);
}
