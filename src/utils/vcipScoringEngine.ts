import type {
  VcipAttemptRecord,
  VcipBrainGymLog,
  VcipCareerExplorationIndicator,
  VcipDomainId,
  VcipDomainSummary,
  VcipLanguage,
  VcipMode,
} from '../types/vcip';
import { ALL_VCIP_DOMAINS, VCIP_DOMAIN_META } from './vcipQuestionBank.ts';

export const VCIP_SCORING_RULE_VERSION = 'vcip-dev-v1.0';

export const VCIP_DISCLAIMER_TEXT =
  'Rai Plus Cognitive Intelligence Profile is an educational cognitive development and self-discovery tool. It is not a substitute for a professionally administered and validated psychological or clinical assessment. Its results must not be used independently for diagnosis, school admission, exclusion or career restrictions.';

export interface VcipScoreInput {
  domain: VcipDomainId;
  mode: VcipMode;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  totalDurationSec: number;
  avgResponseTimeMs: number;
  difficultyLevel: 1 | 2 | 3;
}

export interface VcipScoreOutput {
  rawScore: number;
  accuracyPct: number;
  developmentalScore: number; // 0-100 internal developmental score (NEVER IQ)
  speedAccuracyLabel: string;
  bandLabel: VcipDomainSummary['bandLabel'];
}

export function classifyDevelopmentalBand(score: number | null): VcipDomainSummary['bandLabel'] {
  if (score === null || Number.isNaN(score)) return 'Not Yet Assessed';
  if (score >= 82) return 'Strong';
  if (score >= 66) return 'Proficient';
  if (score >= 48) return 'Developing';
  return 'Emerging';
}

/**
 * Transparent, reproducible internal developmental scoring engine.
 * Explicitly avoids IQ conversion or norm-referenced bell-curve scaling (mean 100 / SD 15).
 */
export function computeVcipDomainScore(input: VcipScoreInput): VcipScoreOutput {
  const safeTotal = Math.max(1, input.totalQuestions);
  const attempted = Math.max(0, input.correctAnswers + input.incorrectAnswers);
  const accuracyPct =
    attempted > 0 ? Math.round((input.correctAnswers / attempted) * 100) : 0;

  // Raw score = exact correct answers
  const rawScore = Math.max(0, input.correctAnswers);

  let developmentalScore = 0;
  let speedAccuracyLabel = 'Balanced Pace';

  if (input.domain === 'processing_speed') {
    // Speed + Accuracy balanced transparently — speed alone is NEVER treated as intelligence
    const accuracyComponent = accuracyPct * 0.65;
    const throughputRate =
      input.totalDurationSec > 0 ? (input.correctAnswers / input.totalDurationSec) * 45 : 0;
    const normalizedThroughput = Math.min(100, Math.round((throughputRate / 24) * 100));
    const speedComponent = normalizedThroughput * 0.35;
    developmentalScore = Math.min(100, Math.max(0, Math.round(accuracyComponent + speedComponent)));

    if (accuracyPct >= 88 && normalizedThroughput >= 70) {
      speedAccuracyLabel = 'Accurate & Efficient';
    } else if (accuracyPct >= 85 && normalizedThroughput < 70) {
      speedAccuracyLabel = 'High Accuracy · Deliberate Pace';
    } else if (accuracyPct < 75 && normalizedThroughput >= 65) {
      speedAccuracyLabel = 'Fast Pace · Needs Accuracy Check';
    } else {
      speedAccuracyLabel = 'Building Scanning Fluency';
    }
  } else {
    const completionRatio = Math.min(1, input.correctAnswers / safeTotal);
    const difficultyWeight = input.difficultyLevel === 3 ? 4 : input.difficultyLevel === 2 ? 2 : 0;
    developmentalScore = Math.min(
      100,
      Math.max(0, Math.round(completionRatio * 96 + (completionRatio > 0 ? difficultyWeight : 0))),
    );

    if (accuracyPct >= 85 && input.avgResponseTimeMs <= 14000) {
      speedAccuracyLabel = 'Clear & Confident';
    } else if (accuracyPct >= 80) {
      speedAccuracyLabel = 'Accurate & Methodical';
    } else if (input.avgResponseTimeMs < 5000 && accuracyPct < 70) {
      speedAccuracyLabel = 'Quick Responses · Slow Down to Verify';
    } else {
      speedAccuracyLabel = 'Developing Strategy';
    }
  }

  return {
    rawScore,
    accuracyPct,
    developmentalScore,
    speedAccuracyLabel,
    bandLabel: classifyDevelopmentalBand(developmentalScore),
  };
}

export function buildDomainSummaries(attempts: VcipAttemptRecord[]): VcipDomainSummary[] {
  // Formal timed/completed attempts prioritized; practice attempts kept separate unless none exist
  const sorted = [...attempts].sort((a, b) => b.assessedAt.localeCompare(a.assessedAt));

  return ALL_VCIP_DOMAINS.map((domain) => {
    const domainAttempts = sorted.filter((a) => a.domain === domain);
    const formal = domainAttempts.filter((a) => a.mode === 'timed');
    const source = formal.length > 0 ? formal : domainAttempts;
    const latest = source[0] ?? null;
    const previous = source[1] ?? null;

    const latestScore = latest ? latest.developmentalScore : null;
    const previousScore = previous ? previous.developmentalScore : null;
    const delta =
      latestScore !== null && previousScore !== null ? latestScore - previousScore : null;

    return {
      domain,
      label: VCIP_DOMAIN_META[domain].label,
      shortLabel: VCIP_DOMAIN_META[domain].shortLabel,
      latestScore,
      previousScore,
      delta,
      accuracyPct: latest ? latest.accuracyPct : null,
      avgResponseTimeMs: latest ? latest.avgResponseTimeMs : null,
      attemptsCount: domainAttempts.length,
      lastAssessedAt: latest ? latest.assessedAt : null,
      bandLabel: classifyDevelopmentalBand(latestScore),
    };
  });
}

export function computeLanguagePerformanceSplit(attempts: VcipAttemptRecord[]): {
  english: { attempts: number; avgScore: number | null; avgAccuracy: number | null };
  hindi: { attempts: number; avgScore: number | null; avgAccuracy: number | null };
} {
  const verbal = attempts.filter((a) => a.domain === 'verbal_reasoning');
  const summarize = (lang: VcipLanguage) => {
    const list = verbal.filter((a) => a.language === lang);
    if (list.length === 0) return { attempts: 0, avgScore: null, avgAccuracy: null };
    return {
      attempts: list.length,
      avgScore: Math.round(list.reduce((s, a) => s + a.developmentalScore, 0) / list.length),
      avgAccuracy: Math.round(list.reduce((s, a) => s + a.accuracyPct, 0) / list.length),
    };
  };
  return {
    english: summarize('en'),
    hindi: summarize('hi'),
  };
}

export function extractStrengthsAndDevelopmentAreas(summaries: VcipDomainSummary[]): {
  strengths: VcipDomainSummary[];
  developmentAreas: VcipDomainSummary[];
} {
  const assessed = summaries.filter((s) => s.latestScore !== null);
  const sortedDesc = [...assessed].sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0));
  const strengths = sortedDesc.filter((s) => (s.latestScore ?? 0) >= 70).slice(0, 3);
  const developmentAreas = [...assessed]
    .sort((a, b) => (a.latestScore ?? 0) - (b.latestScore ?? 0))
    .filter((s) => !strengths.some((st) => st.domain === s.domain))
    .slice(0, 3);
  return { strengths, developmentAreas };
}

/**
 * Non-exclusionary Career Exploration Indicators connecting VCIP domains to broad career fields.
 * NEVER excludes or disqualifies a student from any career path.
 */
export function buildCareerExplorationIndicators(
  summaries: VcipDomainSummary[],
): VcipCareerExplorationIndicator[] {
  const scoreMap = new Map<VcipDomainId, number | null>(
    summaries.map((s) => [s.domain, s.latestScore]),
  );

  const fields: Array<{
    field: string;
    relevantDomains: VcipDomainId[];
    context: string;
  }> = [
    {
      field: 'Engineering & Technology',
      relevantDomains: ['quantitative_reasoning', 'spatial_reasoning', 'fluid_reasoning'],
      context:
        'Engineers frequently use quantitative modelling, spatial geometry, and abstract pattern diagnosis.',
    },
    {
      field: 'Medicine & Life Sciences',
      relevantDomains: ['verbal_reasoning', 'working_memory', 'processing_speed'],
      context:
        'Clinical reasoning draws on structured comprehension, accurate recall of protocols, and steady scanning.',
    },
    {
      field: 'Architecture & Industrial Design',
      relevantDomains: ['spatial_reasoning', 'fluid_reasoning', 'quantitative_reasoning'],
      context:
        'Designers rely on 3D mental rotation, proportion calculation, and visual pattern synthesis.',
    },
    {
      field: 'Law & Public Policy',
      relevantDomains: ['verbal_reasoning', 'fluid_reasoning', 'working_memory'],
      context:
        'Legal and policy analysis builds on logical deduction, precise language relationships, and argument tracking.',
    },
    {
      field: 'Scientific Research & Data Analytics',
      relevantDomains: ['fluid_reasoning', 'quantitative_reasoning', 'verbal_reasoning'],
      context:
        'Researchers combine hypothesis discovery, numerical verification, and clear analytical writing.',
    },
  ];

  return fields.map((item) => {
    const demonstratedStrengths: string[] = [];
    const skillsToDevelop: string[] = [];
    const recommendedActivities: string[] = [];

    for (const dom of item.relevantDomains) {
      const score = scoreMap.get(dom) ?? null;
      const meta = VCIP_DOMAIN_META[dom];
      if (score !== null && score >= 70) {
        demonstratedStrengths.push(`${meta.shortLabel} (${score}/100 internal score)`);
      } else {
        skillsToDevelop.push(
          score === null
            ? `${meta.shortLabel} (take module to establish baseline)`
            : `${meta.shortLabel} (${score}/100 — growth opportunity)`,
        );
        recommendedActivities.push(meta.trainingActivities[0]);
      }
    }

    if (recommendedActivities.length === 0) {
      recommendedActivities.push(
        VCIP_DOMAIN_META[item.relevantDomains[0]].trainingActivities[1] ||
          'Continue weekly Daily Brain Gym mixed-domain puzzles.',
      );
    }

    return {
      field: item.field,
      relevantDomains: item.relevantDomains,
      demonstratedStrengths,
      skillsToDevelop,
      recommendedActivities: recommendedActivities.slice(0, 2),
      exploratoryNote: `${item.context} Illustrative exploration only — never an eligibility restriction.`,
    };
  });
}

export function buildHistoricalProgressSeries(
  attempts: VcipAttemptRecord[],
): Array<{ dateLabel: string; averageScore: number; accuracyPct: number; sessions: number }> {
  const byDate = new Map<string, VcipAttemptRecord[]>();
  for (const att of attempts) {
    const dayKey = att.assessedAt.slice(0, 10);
    const list = byDate.get(dayKey) || [];
    list.push(att);
    byDate.set(dayKey, list);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, list]) => ({
      dateLabel: day,
      averageScore: Math.round(
        list.reduce((s, item) => s + item.developmentalScore, 0) / list.length,
      ),
      accuracyPct: Math.round(list.reduce((s, item) => s + item.accuracyPct, 0) / list.length),
      sessions: list.length,
    }));
}

export function computeBrainGymStreak(logs: VcipBrainGymLog[]): {
  totalDays: number;
  currentStreak: number;
  totalPuzzlesSolved: number;
  accuracyPct: number;
} {
  const uniqueDates = Array.from(new Set(logs.map((l) => l.dateKey))).sort((a, b) =>
    b.localeCompare(a),
  );
  let streak = 0;
  if (uniqueDates.length > 0) {
    streak = 1;
    for (let i = 1; i < uniqueDates.length; i += 1) {
      const prev = new Date(`${uniqueDates[i - 1]}T00:00:00Z`).getTime();
      const curr = new Date(`${uniqueDates[i]}T00:00:00Z`).getTime();
      const diffDays = Math.round((prev - curr) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        streak += 1;
      } else {
        break;
      }
    }
  }
  const totalSolved = logs.reduce((s, l) => s + l.totalCount, 0);
  const totalCorrect = logs.reduce((s, l) => s + l.correctCount, 0);
  return {
    totalDays: uniqueDates.length,
    currentStreak: streak,
    totalPuzzlesSolved: totalSolved,
    accuracyPct: totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0,
  };
}

export function buildDownloadableCognitiveReportHtml(params: {
  studentName: string;
  classSection: string;
  schoolName: string;
  summaries: VcipDomainSummary[];
  attempts: VcipAttemptRecord[];
  careerIndicators: VcipCareerExplorationIndicator[];
  counsellorObservations: string[];
}): string {
  const assessedDate =
    params.attempts[0]?.assessedAt.slice(0, 10) || new Date().toISOString().slice(0, 10);
  const totalDurationMin = Math.max(
    1,
    Math.round(params.attempts.reduce((s, a) => s + a.totalDurationSec, 0) / 60),
  );
  const rows = params.summaries
    .map(
      (s) => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:600;">${s.label}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${s.latestScore !== null ? `${s.latestScore}/100` : 'Not Yet Assessed'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${s.accuracyPct !== null ? `${s.accuracyPct}%` : '—'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${s.delta !== null ? (s.delta >= 0 ? `+${s.delta}` : `${s.delta}`) : 'Baseline'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${s.bandLabel}</td>
      </tr>`,
    )
    .join('');

  const careerRows = params.careerIndicators
    .map(
      (c) => `
      <li style="margin-bottom:8px;">
        <strong>${c.field}</strong>: ${c.exploratoryNote}
        <br/><span style="color:#334155;">Recommended practice: ${c.recommendedActivities.join(' · ')}</span>
      </li>`,
    )
    .join('');

  const notesHtml =
    params.counsellorObservations.length > 0
      ? params.counsellorObservations.map((n) => `<li style="margin-bottom:6px;">${n}</li>`).join('')
      : '<li>No counsellor observation recorded yet.</li>';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Rai Plus Cognitive Intelligence Profile — ${params.studentName}</title>
</head>
<body style="font-family:system-ui,-apple-system,sans-serif;color:#142B46;max-width:860px;margin:32px auto;padding:0 20px;line-height:1.55;">
  <header style="border-bottom:2px solid #142B46;padding-bottom:14px;margin-bottom:20px;">
    <h1 style="margin:0;font-size:22px;color:#142B46;">Rai Plus Cognitive Intelligence Profile (VCIP)</h1>
    <p style="margin:4px 0 0;color:#4A6078;font-size:13px;">Discover How You Think, Learn, Reason and Solve Problems · ${params.schoolName}</p>
    <p style="margin:8px 0 0;font-size:13px;"><strong>Student:</strong> ${params.studentName} &nbsp;·&nbsp; <strong>Class:</strong> ${params.classSection} &nbsp;·&nbsp; <strong>Latest Assessment:</strong> ${assessedDate} &nbsp;·&nbsp; <strong>Total Logged Time:</strong> ${totalDurationMin} min</p>
  </header>

  <section style="background:#FAF4EC;border:1px solid #E6D8C6;border-radius:8px;padding:12px 14px;font-size:12px;color:#2E4866;margin-bottom:22px;">
    <strong>Important Educational Notice (Internal Developmental Scores):</strong> ${VCIP_DISCLAIMER_TEXT}
  </section>

  <h2 style="font-size:16px;margin-bottom:8px;">Six Cognitive Domain Developmental Summary</h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:22px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:8px 10px;border-bottom:1px solid #cbd5e1;">Domain</th>
        <th style="padding:8px 10px;border-bottom:1px solid #cbd5e1;">Internal Score</th>
        <th style="padding:8px 10px;border-bottom:1px solid #cbd5e1;">Accuracy</th>
        <th style="padding:8px 10px;border-bottom:1px solid #cbd5e1;">Change vs Prior</th>
        <th style="padding:8px 10px;border-bottom:1px solid #cbd5e1;">Developmental Band</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <h2 style="font-size:16px;margin-bottom:8px;">Counsellor Observations</h2>
  <ul style="font-size:13px;margin-bottom:22px;">${notesHtml}</ul>

  <h2 style="font-size:16px;margin-bottom:8px;">Illustrative Career Exploration Relationships (Non-Exclusionary)</h2>
  <ul style="font-size:13px;margin-bottom:22px;">${careerRows}</ul>

  <footer style="border-top:1px solid #D9C9B6;padding-top:12px;font-size:11px;color:#64778C;">
    Generated by Rai Plus · Scoring Rule Version: ${VCIP_SCORING_RULE_VERSION} · Cognitive domain scores remain strictly separate from OLQ, Personality, and SRT/WAT/TAT/PPDT behavioural assessments.
  </footer>
</body>
</html>`;
}
