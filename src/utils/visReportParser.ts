import type {
  CognitiveCategory,
  DiscBird,
  DiscTrait,
  VisBrainLobes,
  VisMultipleIntelligences,
  VisParsedReportProfile,
} from '../types';

export const VIS_GOVERNANCE_NOTICE =
  'Advisory DMIT & Learning Style profile — strength-based classroom guidance only. Never auto-penalises OLQ or Learners Score.';

const TRAIT_TO_BIRD: Record<DiscTrait, DiscBird> = {
  CAUTIOUS: 'Owl',
  ADAPTIVE: 'Dove',
  STEADY: 'Dove',
  DECISIVE: 'Eagle',
  DOMINANT: 'Eagle',
  EXPRESSIVE: 'Peacock',
  INFLUENTIAL: 'Peacock',
};

const MI_KEY_ORDER: Array<{
  chartCol: string;
  key: keyof VisMultipleIntelligences;
  label: string;
}> = [
  { chartCol: 'Inter', key: 'interpersonal', label: 'Interpersonal' },
  { chartCol: 'Visual', key: 'visualSpatial', label: 'Visual-Spatial' },
  { chartCol: 'Kinesthetic', key: 'bodilyKinesthetic', label: 'Bodily-Kinesthetic' },
  { chartCol: 'Musical', key: 'musical', label: 'Musical' },
  { chartCol: 'Intra', key: 'intrapersonal', label: 'Intrapersonal' },
  { chartCol: 'Logical', key: 'logicalMathematical', label: 'Logical-Mathematical' },
  { chartCol: 'Language', key: 'verbalLinguistic', label: 'Verbal-Linguistic' },
  { chartCol: 'Naturalist', key: 'naturalist', label: 'Naturalist' },
];

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function parsePctMatch(pattern: RegExp, text: string, group = 1): number | null {
  const m = text.match(pattern);
  if (!m || !m[group]) return null;
  const n = Number.parseFloat(m[group]);
  return Number.isFinite(n) ? roundTwo(n) : null;
}

export function extractSubjectNameFromText(text: string): string {
  const m = text.match(/Dear\s+([A-Z0-9 \[\]\(\)\-\.]{2,60}?)\s*(?:\n|Congratulations|At the outset)/i);
  if (m && m[1]) {
    return m[1].replace(/\s+/g, ' ').trim();
  }
  const p1 = text.match(/([A-Z0-9 \[\]\(\)\-\.]{3,50}?)\s+Page\s+1\b/);
  return p1?.[1]?.replace(/\s+/g, ' ').trim() || 'Student Profile';
}

export function buildAdvisorySummary(params: {
  dominantStyle: 'Visual' | 'Auditory' | 'Kinesthetic' | null;
  topIntelligences: Array<{ key: keyof VisMultipleIntelligences; label: string; score: number }>;
  primaryBird: DiscBird | null;
}): VisParsedReportProfile['advisorySummary'] {
  const studyTips: string[] = [];
  const classroomSupport: string[] = [];
  const suggestedSet = new Set<CognitiveCategory>();

  if (params.dominantStyle === 'Visual') {
    studyTips.push('Use colour-coded mind maps, labelled diagrams, and step-by-step worked visuals during revision.');
    classroomSupport.push('Seat where board diagrams are unobstructed; pair verbal instructions with a written anchor.');
    suggestedSet.add('Visual Attention');
    suggestedSet.add('Perception Training');
  } else if (params.dominantStyle === 'Auditory') {
    studyTips.push('Read key definitions aloud, summarise chapters verbally to a peer/parent, and use rhythmic recall.');
    classroomSupport.push('Include structured Q&A, oral recaps, and verbal walkthroughs before independent seatwork.');
    suggestedSet.add('Memory Training');
    suggestedSet.add('Response Control');
  } else if (params.dominantStyle === 'Kinesthetic') {
    studyTips.push('Break study into 20-minute active sprints using flashcards, physical models, and worked examples.');
    classroomSupport.push('Allow short movement transitions and hands-on lab/manipulative tasks to lock in concepts.');
    suggestedSet.add('Response Control');
    suggestedSet.add('Cognitive Flexibility');
  }

  for (const top of params.topIntelligences.slice(0, 2)) {
    if (top.key === 'logicalMathematical') {
      classroomSupport.push('Encourage hypothesis testing, number puzzles, and structured multi-step reasoning.');
      suggestedSet.add('Logical Thinking');
    } else if (top.key === 'verbalLinguistic') {
      classroomSupport.push('Invite structured storytelling, debate summaries, and vocabulary reflection notes.');
      suggestedSet.add('Memory Training');
    } else if (top.key === 'visualSpatial') {
      classroomSupport.push('Use geometry sketching, graphic organisers, and spatial flowcharts across subjects.');
      suggestedSet.add('Perception Training');
    } else if (top.key === 'interpersonal') {
      classroomSupport.push('Leverage peer-tutoring pairs and group project roles to channel social leadership.');
      suggestedSet.add('Cognitive Flexibility');
    } else if (top.key === 'intrapersonal') {
      classroomSupport.push('Provide quiet reflection checklists and self-paced goal trackers.');
      suggestedSet.add('Visual Attention');
    } else if (top.key === 'bodilyKinesthetic') {
      classroomSupport.push('Pair concept revision with practical demonstrations, sports discipline, or board work.');
      suggestedSet.add('Response Control');
    } else if (top.key === 'musical') {
      classroomSupport.push('Use rhythmic mnemonics, pattern chanting, and structured audio focus cues.');
      suggestedSet.add('Memory Training');
    } else if (top.key === 'naturalist') {
      classroomSupport.push('Connect taxonomy, classification tables, and real-world observation tasks to chapters.');
      suggestedSet.add('Perception Training');
    }
  }

  if (params.primaryBird === 'Eagle') {
    classroomSupport.push('Responds best to crisp targets, measurable challenges, and leadership ownership.');
  } else if (params.primaryBird === 'Dove') {
    classroomSupport.push('Thrives in supportive, collaborative classrooms with encouraging step-by-step feedback.');
  } else if (params.primaryBird === 'Owl') {
    classroomSupport.push('Appreciates clear rubrics, logical expectations, and uninterrupted checking time.');
  } else if (params.primaryBird === 'Peacock') {
    classroomSupport.push('Energised by interactive recognition, stage presentation opportunities, and team brainstorming.');
  }

  if (studyTips.length === 0) {
    studyTips.push('Combine short visual summaries with daily spaced recall and active problem solving.');
  }
  if (classroomSupport.length === 0) {
    classroomSupport.push('Match teacher classroom observations with strength-based scaffolding.');
  }
  if (suggestedSet.size === 0) {
    suggestedSet.add('Visual Attention');
    suggestedSet.add('Logical Thinking');
  }

  return {
    studyTips,
    classroomSupport,
    suggestedCognitiveCategories: Array.from(suggestedSet),
    governanceNotice: VIS_GOVERNANCE_NOTICE,
  };
}

export function parseVisReportText(
  rawText: string,
  meta: {
    fileId: string;
    extractedAt?: string;
    extractionSource?: 'preparsed_bundle' | 'live_drive_pdf';
    fallbackName?: string;
  },
): VisParsedReportProfile {
  const normalized = rawText.replace(/\r\n/g, '\n');

  const extractedName = extractSubjectNameFromText(normalized);
  const reportSubjectName =
    extractedName !== 'Student Profile' ? extractedName : meta.fallbackName || 'Student Profile';

  // 1. Left vs Right Brain Dominance
  const brainMatch = normalized.match(/(\d+\.\d+)%\s+(\d+\.\d+)%\s+Left Brain Dominance/);
  const leftPct = brainMatch ? roundTwo(Number.parseFloat(brainMatch[1])) : null;
  const rightPct = brainMatch ? roundTwo(Number.parseFloat(brainMatch[2])) : null;

  // 2. VAK Learning Styles
  const iv = normalized.indexOf('Visual Learners learn best');
  const ia = normalized.indexOf('Auditory learners learn best');
  const ik = normalized.indexOf('Kinesthetic learners learn best');

  let visualPct: number | null = null;
  let auditoryPct: number | null = null;
  let kinestheticPct: number | null = null;

  if (iv !== -1 && ia !== -1 && ia > iv) {
    visualPct = parsePctMatch(/(\d+\.\d+)%/, normalized.slice(iv, ia));
  }
  if (ia !== -1 && ik !== -1 && ik > ia) {
    const matches = Array.from(normalized.slice(ia, ik).matchAll(/(\d+\.\d+)%/g));
    if (matches.length > 0) {
      auditoryPct = roundTwo(Number.parseFloat(matches[matches.length - 1][1]));
    }
  }
  if (ik !== -1) {
    const endK = normalized.indexOf('Page 20', ik);
    const sliceK = normalized.slice(ik, endK !== -1 ? endK : ik + 1800);
    kinestheticPct = parsePctMatch(/(\d+\.\d+)%/, sliceK);
  }

  let dominantStyle: 'Visual' | 'Auditory' | 'Kinesthetic' | null = null;
  const vakEntries = [
    { name: 'Visual' as const, val: visualPct },
    { name: 'Auditory' as const, val: auditoryPct },
    { name: 'Kinesthetic' as const, val: kinestheticPct },
  ].filter((x): x is { name: 'Visual' | 'Auditory' | 'Kinesthetic'; val: number } => x.val !== null);
  if (vakEntries.length > 0) {
    vakEntries.sort((a, b) => b.val - a.val);
    dominantStyle = vakEntries[0].name;
  }

  // 3. Multiple Quotients (nullable — NEVER default missing to 0)
  const iq = parsePctMatch(/(\d+\.\d+)%\s+Intelligence Quotient/, normalized);
  const eq = parsePctMatch(/(\d+\.\d+)%\s+Emotional Quotient/, normalized);
  const aq = parsePctMatch(/(\d+\.\d+)%\s+Adversity Quotient/, normalized);
  let cq = parsePctMatch(/(\d+\.\d+)%\s+Creativity Quotient/, normalized);
  if (cq === null && iq !== null && eq !== null && aq !== null) {
    const residual = roundTwo(100 - iq - eq - aq);
    if (residual > 0 && residual < 60) {
      cq = residual;
    }
  }

  // 4. Multiple Intelligences (column-aware horizontal X extraction on the Page 21 bar chart)
  const multipleIntelligences: VisMultipleIntelligences = {
    interpersonal: null,
    visualSpatial: null,
    bodilyKinesthetic: null,
    musical: null,
    intrapersonal: null,
    logicalMathematical: null,
    verbalLinguistic: null,
    naturalist: null,
  };

  const lblMatch = normalized.match(
    /([ \t]*Inter\s+Visual\s+Kinesthetic\s+Musical\s+Intra\s+Logical\s+Language\s+Naturalist)/,
  );
  if (lblMatch && lblMatch.index !== undefined) {
    const lblLine = lblMatch[1];
    const interStart = lblLine.indexOf('Inter');
    const cols = MI_KEY_ORDER.map((item) => {
      const pos = lblLine.indexOf(item.chartCol);
      return {
        ...item,
        center: pos + item.chartCol.length / 2,
      };
    });
    const chartBlockStart = Math.max(0, lblMatch.index - 1400);
    const lines = normalized.slice(chartBlockStart, lblMatch.index).split('\n').slice(-15);
    for (const line of lines) {
      for (const nm of line.matchAll(/(\d+\.\d+)%/g)) {
        const idx = nm.index ?? 0;
        if (idx < Math.max(0, interStart - 6)) continue; // Ignore left Y-axis ticks
        const val = roundTwo(Number.parseFloat(nm[1]));
        const center = idx + nm[0].length / 2;
        let best = cols[0];
        let bestDist = Math.abs(cols[0].center - center);
        for (const col of cols.slice(1)) {
          const dist = Math.abs(col.center - center);
          if (dist < bestDist) {
            best = col;
            bestDist = dist;
          }
        }
        multipleIntelligences[best.key] = val;
      }
    }
  }

  const topIntelligences = MI_KEY_ORDER.map((item) => ({
    key: item.key,
    label: item.label,
    score: multipleIntelligences[item.key],
  }))
    .filter(
      (item): item is { key: keyof VisMultipleIntelligences; label: string; score: number } =>
        item.score !== null,
    )
    .sort((a, b) => b.score - a.score);

  // 5. 5 Brain Lobes (Action, Thinking, Tactile, Auditory, Visual)
  const p46 = normalized.indexOf('Action :');
  const p47 = p46 !== -1 ? normalized.indexOf('Leadership is both', p46) : -1;
  const lobeChunk =
    p46 !== -1 ? normalized.slice(p46, p47 !== -1 ? p47 : p46 + 1500) : '';

  const brainLobes: VisBrainLobes = {
    action: lobeChunk ? parsePctMatch(/Action\s*:[\s\S]{0,280}?(\d+(?:\.\d+)?)%/, lobeChunk) : null,
    thinking: lobeChunk ? parsePctMatch(/Thinking\s*:[\s\S]{0,280}?(\d+(?:\.\d+)?)%/, lobeChunk) : null,
    tactile: lobeChunk ? parsePctMatch(/Tactile\s*:[\s\S]{0,280}?(\d+(?:\.\d+)?)%/, lobeChunk) : null,
    auditory: lobeChunk ? parsePctMatch(/Auditory\s*:[\s\S]{0,280}?(\d+(?:\.\d+)?)%/, lobeChunk) : null,
    visual: lobeChunk ? parsePctMatch(/Vish?ual\s*:[\s\S]{0,280}?(\d+(?:\.\d+)?)%/, lobeChunk) : null,
  };

  // 6. DISC Personality (Primary & Secondary traits mapped to Bird typology)
  const discMatch = normalized.match(
    /Primary\s+[\s\S]{0,200}?Secondary[\s\S]{0,120}?\b(CAUTIOUS|ADAPTIVE|DECISIVE|EXPRESSIVE|DOMINANT|INFLUENTIAL|STEADY)\b[\s\S]{0,120}?\b(CAUTIOUS|ADAPTIVE|DECISIVE|EXPRESSIVE|DOMINANT|INFLUENTIAL|STEADY)\b/,
  );
  const primaryTrait = (discMatch?.[1] as DiscTrait | undefined) ?? null;
  const secondaryTrait = (discMatch?.[2] as DiscTrait | undefined) ?? null;

  // 7. Motive vs Thought Leading
  const motiveMatch = normalized.match(
    /MOTIVE LEADING\s+THOUGHT LEADING[\s\S]{0,120}?(\d+\.\d+)%\s+(\d+\.\d+)%/,
  );
  const motivePct = motiveMatch ? roundTwo(Number.parseFloat(motiveMatch[1])) : null;
  const thoughtPct = motiveMatch ? roundTwo(Number.parseFloat(motiveMatch[2])) : null;

  // 8. Task vs Relationship Leadership
  let leadMatch = normalized.match(
    /Task Oriented Leadership[\s\S]{0,260}?(\d+(?:\.\d+)?)%\s*(?:#\s*)?(\d+(?:\.\d+)?)%/,
  );
  if (!leadMatch) {
    leadMatch = normalized.match(
      /TASK ORIENTED LEADERS\s+RELATIONSHIP ORIENTED LEADERS[\s\S]{0,260}?(\d+(?:\.\d+)?)%\s*(\d+(?:\.\d+)?)%/,
    );
  }
  const taskOrientedPct = leadMatch ? roundTwo(Number.parseFloat(leadMatch[1])) : null;
  const relationshipOrientedPct = leadMatch ? roundTwo(Number.parseFloat(leadMatch[2])) : null;

  const primaryBird = primaryTrait ? TRAIT_TO_BIRD[primaryTrait] : null;
  const secondaryBird = secondaryTrait ? TRAIT_TO_BIRD[secondaryTrait] : null;

  return {
    fileId: meta.fileId,
    reportSubjectName,
    brainDominance: { leftPct, rightPct },
    vak: { visualPct, auditoryPct, kinestheticPct, dominantStyle },
    quotients: { iq, eq, aq, cq },
    multipleIntelligences,
    topIntelligences,
    brainLobes,
    personality: {
      primaryTrait,
      secondaryTrait,
      primaryBird,
      secondaryBird,
    },
    motiveThought: { motivePct, thoughtPct },
    leadership: { taskOrientedPct, relationshipOrientedPct },
    advisorySummary: buildAdvisorySummary({
      dominantStyle,
      topIntelligences,
      primaryBird,
    }),
    extractedAt: meta.extractedAt || new Date().toISOString(),
    extractionSource: meta.extractionSource || 'preparsed_bundle',
  };
}
